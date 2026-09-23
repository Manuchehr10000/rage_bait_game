/**
 * Chapter 1 vignette: Gargas, the "main dans la niche".
 *
 * Asset map-monument-ch01-palaeolithic, 92 x 70 world px, painted 368 x 280.
 * The research is tools/monument-painters/specs/hand-stencil.json. The view is
 * the visitor's on the fitted path: straight on, at arm's length, into the
 * small rock alcove that holds the one black negative hand the site calls its
 * star. The opening of the niche fills most of the plate.
 *
 * How it is built, the pilot's way (abu-simbel.js):
 *   1. the cave wall: one warm lamp from the upper right, falling off to the
 *      cave dark at the lower left; a few large calm planes of limestone;
 *   2. the niche: its outer lip, lit at the upper right and half-shaded on the
 *      left and at the bottom, then the recess;
 *   3. the stencil: a blown black halo, densest at the hand's edge, thinning to
 *      a speckle, open at the bottom where the arm stood off the wall; the hand
 *      is simply where no pigment fell, so it is the rock itself;
 *   4. the light in the recess over rock and paint alike: a concave hollow, so
 *      the shade lies just under the upper-right rim and the lower-left inner
 *      wall faces the lamp;
 *   5. ink round the niche. None round the hand or the halo: blown pigment has
 *      no outline (spec, pitfalls).
 *
 * The hand: a left hand laid palm to the wall (thumb on the viewer's right),
 * upright, the thumb whole and angled out and up from the lower side of the
 * palm, the four fingers short stubs of about one segment, rounded at the end,
 * the middle a touch the longest. Deliberately wrong: the lamp, the upright
 * setting, the size, the simplified rounded recess (see the spec).
 */
PAINTERS['hand-stencil'] = function (ctx, W, H, B) {
  // The research palette, a little warmer than life.
  const S = {
    rock: '#bfb197', // limestone, lit: the wall and the hand
    half: '#8b7f6b', // limestone turned from the lamp; the niche's outer lip, left and bottom
    niche: '#4d453b', // rock in the shadow under the upper-right rim
    black: '#241d16', // manganese black, dense, against the hand's edge
    spray: '#5e554a', // the thinning outer spray
    lamp: '#f3cf8a', // warm lamp on the upper-right lip and the brightest rock
    dark: '#2a231c', // beyond the lamp's reach
  };
  const INK = B.C.ink;
  const SHADOW = B.C.shadow;
  const SUN = B.C.sun;

  // ---------------------------------------------------------------------------
  // Helpers, as in the pilot.

  const mixh = function (a, b, t) {
    const x = B.hex(a);
    const y = B.hex(b);
    let s = '#';
    for (let i = 0; i < 3; i++) s += Math.round(x[i] + (y[i] - x[i]) * t).toString(16).padStart(2, '0');
    return s;
  };
  const lit = (h, t) => mixh(h, SUN, t);
  const shd = (h, t) => mixh(h, SHADOW, t);
  const wash = function (c, pts, color, a) {
    B.fill(c, pts, B.alpha(color, a));
  };
  const silhouette = function (layer, color) {
    const m = B.layer(layer.width, layer.height);
    const mc = m.getContext('2d');
    mc.drawImage(layer, 0, 0);
    mc.globalCompositeOperation = 'source-in';
    mc.fillStyle = color;
    mc.fillRect(0, 0, m.width, m.height);
    return m;
  };
  /** A smooth closed path through the points (midpoint quadratics). */
  const smooth = function (c, pts) {
    const n = pts.length;
    c.beginPath();
    const m0 = [(pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2];
    c.moveTo(m0[0], m0[1]);
    for (let i = 0; i < n; i++) {
      const p = pts[i];
      const q = pts[(i + 1) % n];
      c.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
    }
    c.closePath();
  };
  const fillSmooth = function (c, pts, style) {
    smooth(c, pts);
    c.fillStyle = style;
    c.fill();
  };
  const clipSmooth = function (c, pts, fn) {
    c.save();
    smooth(c, pts);
    c.clip();
    fn();
    c.restore();
  };

  // ---------------------------------------------------------------------------
  // Layout.

  // The recess: a rounded alcove, a little arched at the top and flatter at
  // the sill. Its real outline is undocumented; this is the simplification.
  const NX = 184;
  const NY = 140;
  /**
   * A rock outline round the niche's centre: an arched alcove, flatter at the
   * sill, its edge irregular in a few large swings, not a frame. `grow(a)`
   * pushes it out by that many px at angle a.
   */
  const shape = function (rx, ry, seed, grow) {
    const r = B.rng(seed);
    const ph = [r() * 6.28, r() * 6.28, r() * 6.28, r() * 6.28];
    const pts = [];
    const N = 44;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const e = sa > 0 ? 3 : 2.1; // flatter sill (below), rounder arch (above)
      const k = 1 + 0.06 * Math.sin(2 * a + ph[0]) + 0.045 * Math.sin(3 * a + ph[1]) + 0.028 * Math.sin(5 * a + ph[2]) + 0.014 * Math.sin(7 * a + ph[3]);
      const x = Math.sign(ca) * Math.pow(Math.abs(ca), 2 / e) * rx * k;
      const y = Math.sign(sa) * Math.pow(Math.abs(sa), 2 / e) * ry * k;
      const d = Math.hypot(x, y) || 1;
      const g = grow ? grow(a) : 0;
      pts.push([NX + x + (x / d) * g, NY + y + (y / d) * g]);
    }
    return pts;
  };
  const RECESS = shape(142, 112, 301);
  // The rim: thick and turned from the lamp at the lower left, thin where it
  // catches the lamp at the upper right.
  const LIP = shape(142, 112, 301, (a) => 17 - 9 * Math.cos(a + Math.PI / 4) + 3 * Math.sin(3 * a + 1));

  // ---------------------------------------------------------------------------
  // 1. The cave wall, lit by one lamp off the upper right.

  {
    const g = ctx.createRadialGradient(W + 10, -30, 20, W + 10, -30, 520);
    g.addColorStop(0, mixh(S.rock, S.lamp, 0.42));
    g.addColorStop(0.28, mixh(S.rock, S.lamp, 0.12));
    g.addColorStop(0.52, S.rock);
    g.addColorStop(0.75, S.half);
    g.addColorStop(0.9, mixh(S.half, S.dark, 0.62));
    g.addColorStop(1, S.dark);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  // A few large planes of limestone, so the wall is rock and not a gradient.
  // Their faces turned toward the lamp (up and right) are warm, those turned
  // away are cool. Kept to half a dozen calm shapes.
  wash(ctx, [[0, 0], [70, 0], [52, 34], [18, 58], [0, 64]], SHADOW, 0.22); // upper left, a bulge turned away
  wash(ctx, [[0, 64], [18, 58], [34, 86], [22, 150], [0, 176]], SHADOW, 0.14);
  wash(ctx, [[0, 176], [22, 150], [30, 214], [60, 262], [96, H], [0, H]], SHADOW, 0.3); // the lower left, beyond the lamp
  wash(ctx, [[W, 0], [W, 70], [352, 58], [334, 22], [300, 0]], SUN, 0.26); // upper right, facing the lamp
  wash(ctx, [[W, 160], [W, H], [276, H], [322, 262], [350, 214]], SHADOW, 0.16); // lower right, a ledge turned down
  wash(ctx, [[100, 0], [236, 0], [214, 10], [128, 12]], SHADOW, 0.1); // the roof's edge over the niche

  // ---------------------------------------------------------------------------
  // 2. The niche. Its outer lip: half-shade on the left and at the bottom, the
  // upper-right crest catching the lamp.

  {
    const b = B.bounds(LIP);
    const g = ctx.createLinearGradient(b.x0 + 20, b.y1, b.x1 - 30, b.y0);
    g.addColorStop(0, shd(S.half, 0.18));
    g.addColorStop(0.35, S.half);
    g.addColorStop(0.62, mixh(S.half, S.rock, 0.7));
    g.addColorStop(0.85, mixh(S.rock, S.lamp, 0.35));
    g.addColorStop(1, mixh(S.rock, S.lamp, 0.6));
    ctx.save();
    ctx.filter = 'blur(2px)';
    fillSmooth(ctx, LIP, g);
    ctx.restore();
    fillSmooth(ctx, shape(142, 112, 301, (a) => 13 - 7 * Math.cos(a + Math.PI / 4) + 2.5 * Math.sin(3 * a + 1)), g);
  }

  // The recess back wall: lit limestone, the lamp warmer toward the upper right.
  const back = function (c) {
    const b = B.bounds(RECESS);
    const g = c.createLinearGradient(b.x0, b.y1, b.x1, b.y0);
    g.addColorStop(0, mixh(S.rock, S.lamp, 0.12));
    g.addColorStop(0.5, S.rock);
    g.addColorStop(1, mixh(S.rock, S.lamp, 0.2));
    fillSmooth(c, RECESS, g);
    // The rock's mottle, simplified to a few large soft patches. They run
    // under the hand too: the hand is this rock.
    clipSmooth(c, RECESS, function () {
      c.save();
      c.filter = 'blur(6px)';
      const r = B.rng(77);
      for (let i = 0; i < 7; i++) {
        const x = NX - 120 + r() * 240;
        const y = NY - 90 + r() * 180;
        c.beginPath();
        c.ellipse(x, y, 22 + r() * 26, 12 + r() * 14, (r() - 0.5) * 0.8, 0, Math.PI * 2);
        c.fillStyle = B.alpha(i % 3 === 0 ? S.lamp : S.half, i % 3 === 0 ? 0.14 : 0.16);
        c.fill();
      }
      c.restore();
    });
  };
  back(ctx);

  // ---------------------------------------------------------------------------
  // 3. The stencil. The hand's outline, on its own mask.

  const HAND = B.layer();
  {
    const c = HAND.getContext('2d');
    c.fillStyle = '#fff';
    const S1 = 1.1; // the hand, enlarged to fill the niche (deliberately wrong)
    c.translate(NX - 6, 120);
    c.scale(S1, S1);
    // Local frame: palm centre at the origin, fingers up (-y).
    /** A finger or thumb: a capsule from base to tip, rounded at the tip. */
    const digit = function (x0, y0, x1, y1, w0, w1) {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const len = Math.hypot(dx, dy);
      const nx = -dy / len;
      const ny = dx / len;
      c.beginPath();
      c.moveTo(x0 + (nx * w0) / 2, y0 + (ny * w0) / 2);
      c.lineTo(x1 + (nx * w1) / 2, y1 + (ny * w1) / 2);
      const a = Math.atan2(ny, nx);
      c.arc(x1, y1, w1 / 2, a, a + Math.PI, true);
      c.lineTo(x0 - (nx * w0) / 2, y0 - (ny * w0) / 2);
      c.closePath();
      c.fill();
    };
    // The palm: broad, rounded at the knuckles, the heel full, running down
    // into the wrist, which leaves the stencil at the bottom.
    B.path(c, [
      [-37, -28], [-30, -34], [-12, -37], [8, -37], [26, -34], [34, -28],
      [37, -8], [38, 14], [34, 30], [26, 40], [22, 60], [24, 160], [-26, 160], [-24, 60], [-30, 42], [-37, 26], [-40, 0],
    ]);
    c.fill();
    // Four stubs, little to index from the viewer's left. Each is about one
    // segment above the webs; the middle a touch the longest; no finger
    // stands proud (a gesture is not a stencil).
    digit(-30, -24, -32, -44, 14.5, 13.5); // little
    digit(-12.5, -30, -14, -54, 16, 15.5); // ring
    digit(5, -30, 5, -57, 16.5, 16); // middle
    digit(22.5, -28, 24, -52, 16, 15.5); // index
    // The thumb, whole: out and up from the lower side of the palm, clearly
    // longer than any stub, never pointing up or back at the wrist.
    digit(30, 18, 70, -26, 21, 17);
    B.path(c, [[30, -6], [34, 29], [44, 18], [50, 8]]); // the web of the thumb
    c.fill();
  }

  // The halo, blown round the hand: densest at its edge, thinning into the
  // rock, with no outer line.
  const HALO = B.layer();
  {
    const c = HALO.getContext('2d');
    const blurred = function (px, color, alpha, times) {
      c.save();
      c.filter = 'blur(' + px + 'px)';
      c.globalAlpha = alpha;
      const m = silhouette(HAND, color);
      for (let i = 0; i < times; i++) c.drawImage(m, 0, 0);
      c.restore();
    };
    // The outer cloud: an uneven blown oval behind the hand.
    c.save();
    c.filter = 'blur(18px)';
    c.fillStyle = B.alpha(S.spray, 0.7);
    c.beginPath();
    c.ellipse(NX + 4, 128, 138, 104, -0.1, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = B.alpha(S.black, 0.95);
    c.beginPath();
    c.ellipse(NX + 6, 124, 110, 84, -0.16, 0, Math.PI * 2);
    c.fill();
    c.restore();
    blurred(24, S.black, 1, 3);
    blurred(10, S.black, 1, 4);
    blurred(4, S.black, 1, 3);
    // Open at the bottom: the arm stood off the wall, so the spray thins out
    // below the heel of the hand.
    c.save();
    c.globalCompositeOperation = 'destination-in';
    const g = c.createLinearGradient(0, 168, 0, 246);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.55, 'rgba(0,0,0,0.5)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    c.restore();
    // The speckle at the thin edge of the spray: a few dozen soft dots, not grain.
    const d = c.getImageData(0, 0, W, H).data;
    const r = B.rng(4242);
    let n = 0;
    for (let i = 0; i < 4000 && n < 40; i++) {
      const x = 40 + r() * 300;
      const y = 10 + r() * 240;
      const rad = 1.3 + r() * 1.3;
      const al = d[(Math.floor(y) * W + Math.floor(x)) * 4 + 3] / 255;
      if (al < 0.22 || al > 0.6) continue;
      c.beginPath();
      c.arc(x, y, rad, 0, Math.PI * 2);
      c.fillStyle = B.alpha(S.black, 0.45);
      c.fill();
      n++;
    }
    // The hand is where no pigment fell: cut it out, soft-edged.
    c.save();
    c.globalCompositeOperation = 'destination-out';
    c.filter = 'blur(0.8px)';
    c.drawImage(HAND, 0, 0);
    c.restore();
  }
  clipSmooth(ctx, RECESS, function () {
    ctx.drawImage(HALO, 0, 0);
  });

  // ---------------------------------------------------------------------------
  // 4. The light in the hollow, over rock and paint alike (the stencil is flat
  // paint: it takes the rock's light and throws no shadow of its own).

  clipSmooth(ctx, RECESS, function () {
    // The shade under the upper-right rim: the recess less itself moved down
    // and to the left, the way the lamp's light travels.
    const sh = B.layer();
    const sc = sh.getContext('2d');
    fillSmooth(sc, RECESS, '#000');
    sc.globalCompositeOperation = 'destination-out';
    sc.save();
    sc.translate(-13, 11);
    fillSmooth(sc, RECESS, '#000');
    sc.restore();
    ctx.save();
    ctx.globalAlpha = 0.62;
    ctx.filter = 'blur(2px)';
    ctx.drawImage(silhouette(sh, S.niche), 0, 0);
    ctx.restore();
    // A softer penumbra beyond it.
    const pn = B.layer();
    const pc = pn.getContext('2d');
    fillSmooth(pc, RECESS, '#000');
    pc.globalCompositeOperation = 'destination-out';
    pc.save();
    pc.translate(-22, 18);
    fillSmooth(pc, RECESS, '#000');
    pc.restore();
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.filter = 'blur(5px)';
    ctx.drawImage(silhouette(pn, S.niche), 0, 0);
    ctx.restore();
    // The lower-left inner wall faces the lamp: a warm band along it.
    const lt = B.layer();
    const lc = lt.getContext('2d');
    fillSmooth(lc, RECESS, '#000');
    lc.globalCompositeOperation = 'destination-out';
    lc.save();
    lc.translate(24, -20);
    fillSmooth(lc, RECESS, '#000');
    lc.restore();
    ctx.save();
    ctx.globalAlpha = 0.26;
    ctx.filter = 'blur(4px)';
    ctx.drawImage(silhouette(lt, S.lamp), 0, 0);
    ctx.restore();
  });

  // The crest of the upper-right lip, in the lamp.
  {
    const hi = B.layer();
    const hc = hi.getContext('2d');
    fillSmooth(hc, RECESS, '#000');
    hc.globalCompositeOperation = 'source-out';
    hc.save();
    hc.translate(6, -6);
    fillSmooth(hc, RECESS, '#000');
    hc.restore();
    // keep only the part up and to the right of the opening
    hc.globalCompositeOperation = 'destination-in';
    const g = hc.createLinearGradient(NX - 40, NY + 40, NX + 110, NY - 90);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.5, 'rgba(0,0,0,0.4)');
    g.addColorStop(1, 'rgba(0,0,0,1)');
    hc.fillStyle = g;
    hc.fillRect(0, 0, W, H);
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.drawImage(silhouette(hi, lit(S.lamp, 0.4)), 0, 0);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 5. Ink round the niche's opening, its silhouette. None on the hand.

  smooth(ctx, RECESS);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = B.alpha(INK, 0.55);
  ctx.stroke();
};
