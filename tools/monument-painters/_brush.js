/**
 * Brushes for the monument vignettes on the tour map.
 *
 * Loaded into the page before any painter. Every painter receives this object
 * as `B`. Plain browser JavaScript, no modules, no imports: the harness in
 * tools/paint-monuments.mjs injects the files as script tags.
 *
 * The point of sharing brushes is that twelve paintings made one at a time
 * still read as one set: the same sky, the same sun, the same shadow colour,
 * the same ink. The monument is the only thing that changes from chapter to
 * chapter. content/map/README.md is the style brief; this file is how it is
 * kept.
 *
 * Determinism: nothing here, and nothing in a painter, may call Math.random.
 * Use B.rng(seed). The same painter must always make the same file.
 */
(function () {
  const B = {};

  /** The painted size: 92 x 70 world px at ART_SCALE 4. */
  B.W = 368;
  B.H = 280;

  /**
   * The set's shared colours. Every vignette uses these for the things that are
   * not the monument, so the set hangs together. Materials of the monument
   * itself come from the research for that site, never from here.
   */
  B.C = {
    /** The UI's ink. Outlines and the very darkest darks. */
    ink: '#2b2116',
    /** The card the plate is mounted on. For the painter's reference; a plate covers it. */
    paper: '#e6d8b4',
    /** A brochure sky: cleaner and bluer than any real one. */
    skyTop: '#5f9fd2',
    skyLow: '#cfe4ef',
    /** Cool shadow. Mixed into a lit colour, never used neat. */
    shadow: '#4b4270',
    /** Warm highlight. Mixed into a lit colour, never used neat. */
    sun: '#fff0c2',
    foliage: '#5d7f3b',
    foliageDark: '#2f4a28',
    water: '#4f8fb9',
  };

  /** Toward the sun: up and to the right, as content/README.md fixes it for every asset. */
  B.LIGHT = { x: 0.6, y: -0.8 };

  // -------------------------------------------------------------------------
  // Randomness that is not random.

  /** A seeded generator in [0, 1). mulberry32. */
  B.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // -------------------------------------------------------------------------
  // Colour.

  B.hex = function (h) {
    return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  };

  B.rgba = function (r, g, b, a) {
    return 'rgba(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ',' + (a === undefined ? 1 : a) + ')';
  };

  /** Mix two hex colours, t = 0 is a, t = 1 is b. Optional alpha. */
  B.mix = function (a, b, t, alpha) {
    const x = B.hex(a);
    const y = B.hex(b);
    return B.rgba(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t, alpha);
  };

  /** A colour in full sun. */
  B.lit = function (h, t) {
    return B.mix(h, B.C.sun, t === undefined ? 0.3 : t);
  };

  /** A colour turned away from the sun. */
  B.shade = function (h, t) {
    return B.mix(h, B.C.shadow, t === undefined ? 0.42 : t);
  };

  /** A hex colour at an alpha. */
  B.alpha = function (h, a) {
    const x = B.hex(h);
    return B.rgba(x[0], x[1], x[2], a);
  };

  // -------------------------------------------------------------------------
  // Shapes.

  /** Start a closed path through the points. */
  B.path = function (ctx, pts) {
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      if (i === 0) ctx.moveTo(pts[i][0], pts[i][1]);
      else ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.closePath();
  };

  B.fill = function (ctx, pts, style) {
    B.path(ctx, pts);
    ctx.fillStyle = style;
    ctx.fill();
  };

  /** Run fn with drawing clipped to the polygon. */
  B.clip = function (ctx, pts, fn) {
    ctx.save();
    B.path(ctx, pts);
    ctx.clip();
    fn();
    ctx.restore();
  };

  B.bounds = function (pts) {
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const [x, y] of pts) {
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
    return { x0: x0, y0: y0, x1: x1, y1: y1, w: x1 - x0, h: y1 - y0 };
  };

  /**
   * A surface in the sun: the polygon filled with its base colour, lit toward
   * the upper right and shaded toward the lower left. `turn` says how the face
   * sits to the sun: 1 faces it, 0 is side-on, -1 faces away. This is the one
   * brush that does most of the modelling in every painting.
   */
  B.face = function (ctx, pts, base, turn) {
    const t = turn === undefined ? 0 : turn;
    const b = B.bounds(pts);
    const g = ctx.createLinearGradient(b.x0, b.y1, b.x1, b.y0);
    const mid = t >= 0 ? B.lit(base, 0.12 + 0.28 * t) : B.shade(base, 0.2 - 0.3 * t);
    g.addColorStop(0, t >= 0 ? B.shade(base, 0.12) : B.shade(base, 0.35 - 0.25 * t));
    g.addColorStop(0.55, mid);
    g.addColorStop(1, t >= 0 ? B.lit(base, 0.25 + 0.3 * t) : B.shade(base, 0.12 - 0.2 * t));
    B.fill(ctx, pts, g);
  };

  /**
   * One tapered brush stroke from (x0, y0) to (x1, y1), fat in the middle and
   * pointed at both ends, bowed slightly by `bow`.
   */
  B.stroke = function (ctx, x0, y0, x1, y1, width, color, bow) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const k = bow === undefined ? 0 : bow;
    const mx = (x0 + x1) / 2 + nx * k;
    const my = (y0 + y1) / 2 + ny * k;
    const hw = width / 2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(mx + nx * hw, my + ny * hw, x1, y1);
    ctx.quadraticCurveTo(mx - nx * hw, my - ny * hw, x0, y0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };

  /**
   * Strokes scattered inside a polygon: the texture of stone, render, foliage.
   * A few dozen visible marks, never per-pixel grain: grain is not painting,
   * and it does not compress.
   *
   * opts: seed, count, color (or colors), len, width, angle (radians), spread
   * (radians of jitter on the angle), bow.
   */
  B.hatch = function (ctx, pts, opts) {
    const r = B.rng(opts.seed || 1);
    const b = B.bounds(pts);
    const colors = opts.colors || [opts.color];
    const count = opts.count || 40;
    const len = opts.len || 10;
    const width = opts.width || 2;
    const angle = opts.angle || 0;
    const spread = opts.spread === undefined ? 0.25 : opts.spread;
    B.clip(ctx, pts, function () {
      for (let i = 0; i < count; i++) {
        const cx = b.x0 + r() * b.w;
        const cy = b.y0 + r() * b.h;
        const a = angle + (r() - 0.5) * 2 * spread;
        const l = len * (0.6 + r() * 0.8);
        const hx = (Math.cos(a) * l) / 2;
        const hy = (Math.sin(a) * l) / 2;
        B.stroke(ctx, cx - hx, cy - hy, cx + hx, cy + hy, width * (0.7 + r() * 0.6), colors[i % colors.length], (r() - 0.5) * (opts.bow || 1.5));
      }
    });
  };

  /** A dab of soft paint: a blurred ellipse, for foliage, clouds, glow. */
  B.dab = function (ctx, x, y, rx, ry, color, blur) {
    ctx.save();
    if (blur) ctx.filter = 'blur(' + blur + 'px)';
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };

  // -------------------------------------------------------------------------
  // The plate.
  //
  // A vignette is a picture plate: it fills its frame edge to edge, sky and
  // ground included, the way a tourist map prints its framed views. The map
  // draws a keyline round it. The rule in content/README.md that backgrounds
  // are transparent is for sprites laid over level tiles; this is not one, and
  // a painting that faded out into the paper left a muddy ring inside a hard
  // frame. The harness checks that every pixel is covered.

  B.layer = function (w, h) {
    const c = document.createElement('canvas');
    c.width = w || B.W;
    c.height = h || B.H;
    return c;
  };

  /** A brochure sky from the top of the plate down to the horizon. */
  B.sky = function (ctx, w, horizon) {
    const g = ctx.createLinearGradient(0, 0, 0, horizon);
    g.addColorStop(0, B.C.skyTop);
    g.addColorStop(1, B.C.skyLow);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, horizon + 1);
  };

  /**
   * Ground from the horizon to the bottom of the plate, darkening toward the
   * viewer: the nearer ground is in the monument's shadow side of the light.
   */
  B.ground = function (ctx, w, h, horizon, color) {
    const g = ctx.createLinearGradient(0, horizon, 0, h);
    g.addColorStop(0, B.lit(color, 0.18));
    g.addColorStop(1, B.shade(color, 0.22));
    ctx.fillStyle = g;
    ctx.fillRect(0, horizon, w, h - horizon);
  };

  /** A fair-weather cloud, soft, made of a few dabs. */
  B.cloud = function (ctx, x, y, size, seed) {
    const r = B.rng(seed || 7);
    for (let i = 0; i < 6; i++) {
      const dx = (r() - 0.5) * size * 1.6;
      const dy = (r() - 0.5) * size * 0.35;
      B.dab(ctx, x + dx, y + dy, size * (0.35 + r() * 0.3), size * (0.22 + r() * 0.12), 'rgba(255,255,255,0.8)', 2);
    }
  };

  /**
   * The shadow a lit form throws onto its own ground, down and to the left,
   * away from the sun. A translucent cool wash; paint it before the form. (The
   * rule against shadows on the ground is for sprites standing on tiles; a
   * plate has its own ground.)
   */
  B.castShadow = function (ctx, pts, dx, dy) {
    ctx.save();
    ctx.translate(dx === undefined ? -10 : dx, dy === undefined ? 4 : dy);
    B.fill(ctx, pts, B.alpha(B.C.shadow, 0.28));
    ctx.restore();
  };

  /**
   * An ink line around a shape: holds the silhouette together at 92 x 70, where
   * soft interiors alone would dissolve into the page.
   */
  B.outline = function (ctx, pts, width) {
    B.path(ctx, pts);
    ctx.lineJoin = 'round';
    ctx.lineWidth = width || 1.6;
    ctx.strokeStyle = B.alpha(B.C.ink, 0.85);
    ctx.stroke();
  };

  window.BRUSH = B;
  window.PAINTERS = window.PAINTERS || {};
})();
