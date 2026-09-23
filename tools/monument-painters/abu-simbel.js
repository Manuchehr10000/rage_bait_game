/**
 * Chapter 2 vignette: the Great Temple of Abu Simbel, front elevation.
 *
 * Asset map-monument-ch02-egypt, 92 x 70 world px, painted 368 x 280. The view
 * is David Roberts's and the postcard's: the facade seen square from the
 * forecourt, on the temple's own axis, the lake behind the viewer.
 *
 * How it is built, so the other eleven plates can be built the same way:
 *   1. the shared sky;
 *   2. the setting (here the rock-fill hill): big planes first, lit or turned
 *      away as masses, then a few large blocks on them, thinning to the frame;
 *   3. the monument, back to front: wall, registers, the carved surrounds, then
 *      every cast shadow on the wall, then the openings, then the repeated
 *      elements;
 *   4. the ground it stands on, and what lies on it;
 *   5. ink last.
 * Each form is painted the way gouache is: one flat shape in the local colour,
 * one light across it from the upper right, then a few shadows where forms
 * turn away or overlap, then a few lights where they face the sun.
 *
 * Repeated elements (the colossi, the family figures, the baboons) are painted
 * once into their own layer and stamped at whole-pixel offsets, so the copies
 * are the same pixels (pillar 4). Nothing is painted over a copy afterwards:
 * the shadows they throw land on the wall, which is painted before them.
 */
PAINTERS['abu-simbel'] = function (ctx, W, H, B) {
  // The research palette: one Nubian sandstone, pushed a little sunnier.
  const S = {
    sun: '#E4B67E', // sandstone in direct morning sun
    body: '#C99462', // the rock's local colour
    rose: '#C8876A', // iron-oxide bedding bands
    recess: '#8C5B3C', // rock in recesses
    patina: '#A6754B', // weathering streaks
    dark: '#2A1D15', // the door and the back of the niche
    rubble: '#B3804F', // the 1960s rock-fill hill
    rubbleDark: '#6E4A31', // its shaded faces and gaps
    sand: '#E9D3A4', // forecourt and terrace top
  };
  const INK = B.C.ink;
  const SHADOW = B.C.shadow;
  const SUN = B.C.sun;

  // ---------------------------------------------------------------------------
  // Helpers. B.mix returns rgba(); these return hex so they can be chained.

  const mixh = function (a, b, t) {
    const x = B.hex(a);
    const y = B.hex(b);
    let s = '#';
    for (let i = 0; i < 3; i++) s += Math.round(x[i] + (y[i] - x[i]) * t).toString(16).padStart(2, '0');
    return s;
  };
  const lit = (h, t) => mixh(h, SUN, t);
  const shd = (h, t) => mixh(h, SHADOW, t);

  /** A translucent wash of shadow or light over what is already there. */
  const wash = function (c, pts, color, a) {
    B.fill(c, pts, B.alpha(color, a));
  };

  /** A horizontal form (a roll, a ledge): lit on top where the high sun hits it. */
  const roll = function (c, pts, base) {
    const b = B.bounds(pts);
    const g = c.createLinearGradient(0, b.y0, 0, b.y1);
    g.addColorStop(0, lit(base, 0.35));
    g.addColorStop(0.5, base);
    g.addColorStop(1, shd(base, 0.3));
    B.fill(c, pts, g);
  };

  /** A vertical rounded form (a moulding): cool on its left flank, warm on its right. */
  const round = function (c, pts, base, k) {
    const s = k === undefined ? 1 : k;
    const b = B.bounds(pts);
    const g = c.createLinearGradient(b.x0, 0, b.x1, 0);
    g.addColorStop(0, shd(base, 0.36 * s));
    g.addColorStop(0.32, shd(base, 0.06 * s));
    g.addColorStop(0.68, lit(base, 0.3 * s));
    g.addColorStop(1, lit(base, 0.16 * s));
    B.fill(c, pts, g);
  };

  const ellipse = function (c, x, y, rx, ry, style) {
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    c.fillStyle = style;
    c.fill();
  };

  const line = function (c, x0, y0, x1, y1, w, style) {
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x1, y1);
    c.lineWidth = w;
    c.lineCap = 'round';
    c.strokeStyle = style;
    c.stroke();
  };

  /** The silhouette of a layer in one flat colour. */
  const silhouette = function (layer, color) {
    const m = B.layer(layer.width, layer.height);
    const mc = m.getContext('2d');
    mc.drawImage(layer, 0, 0);
    mc.globalCompositeOperation = 'source-in';
    mc.fillStyle = color;
    mc.fillRect(0, 0, m.width, m.height);
    return m;
  };

  /**
   * An ink line round everything painted on a layer, one pixel outside it.
   * `soften`, if given, is a polygon (layer coordinates) where the ink is
   * thinned to a third: a weathered edge wants less line than a carved one.
   */
  const inkRound = function (layer, alpha, soften) {
    const m = silhouette(layer, INK);
    const d = B.layer(layer.width, layer.height);
    const dc = d.getContext('2d');
    for (const o of [[-1, 0], [1, 0], [0, -1], [0, 1]]) dc.drawImage(m, o[0], o[1]);
    if (soften) {
      dc.save();
      dc.globalCompositeOperation = 'destination-out';
      B.fill(dc, soften, 'rgba(0,0,0,0.7)');
      dc.restore();
    }
    const c = layer.getContext('2d');
    c.save();
    c.globalCompositeOperation = 'destination-over';
    c.globalAlpha = alpha;
    c.drawImage(d, 0, 0);
    c.restore();
  };

  /** Light across everything on a layer: cool at the left edge, warm at the right. */
  const lightAcross = function (c, x0, x1, h, cool, warm) {
    c.save();
    c.globalCompositeOperation = 'source-atop';
    const g = c.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, B.alpha(SHADOW, cool));
    g.addColorStop(0.42, B.alpha(SHADOW, 0));
    g.addColorStop(0.62, B.alpha(SUN, 0));
    g.addColorStop(1, B.alpha(SUN, warm));
    c.fillStyle = g;
    c.fillRect(0, 0, c.canvas.width, h);
    c.restore();
  };

  // ---------------------------------------------------------------------------
  // Layout. The facade is about 35-38 m wide and 30-33 m high; the colossi are
  // 20-22 m. At about 6.8 px a metre the colossi are 136 px from plinth to
  // crown, which puts the crowns at 0.73 of the facade's height, inside the
  // sources' range. The facade's sides lean in 12 px over its height: a pylon.

  const GY = 232; // the terrace floor meets the facade and the colossi here
  const TOP = 46; // the ledge along the top of the facade the baboons stand on
  const LEAN = 12;
  const FL = 46; // the facade's foot, left and right
  const FR = 322;
  const edgeL = (y) => FL + (LEAN * (GY - y)) / (GY - TOP);
  const edgeR = (y) => FR - (LEAN * (GY - y)) / (GY - TOP);
  const FACADE = [[FL, GY], [FL + LEAN, TOP], [FR - LEAN, TOP], [FR, GY]];
  const DOOR = 184; // the temple's axis
  const CX = [89, 144, 224, 279]; // colossi, south to north; the door between 2 and 3
  const FLOOR = 250; // front edge of the terrace
  const LEDGE = 258; // foot of the terrace ledge; the forecourt below
  const BANDS = [[80, 7], [118, 9], [161, 8], [203, 10]]; // rose bedding: y, thickness

  // ---------------------------------------------------------------------------
  // 1. The shared sky, cloudless.

  B.sky(ctx, W, 200);

  // ---------------------------------------------------------------------------
  // 2. The artificial hill: rock fill over a concrete dome since 1968, made to
  // look like the old cliff. Broken rock, browner and more varied than the
  // carved face; not a sheer cliff, not a dune. It falls away from the
  // facade's edges and shows as a thin ragged rim above the frieze.

  // The skyline: a low dome's shoulder, not a pyramid's straight side. It
  // runs out almost level from the facade's top corners, then rolls over and
  // falls to the frame, broken by block-sized bumps and a couple of steps.
  const edge = [
    [0, 112], [4, 103], [9, 100.5], [12, 91], [17, 80], [22, 77.5], [26, 68], [31, 59], [37, 52],
    [42, 50], [47, 44], [54, 39], [61, 35.5], [68, 32.5], [76, 30.5],
  ];
  {
    const r = B.rng(4101);
    for (let x = 84; x < 290; x += 9 + r() * 8) edge.push([x, 27.5 + r() * 3.2]);
  }
  edge.push(
    [296, 30], [304, 31.5], [311, 33.8], [318, 37.5], [324, 42], [330, 44], [335, 50.5], [341, 58.5],
    [346, 66], [350, 68], [354, 77], [358, 86], [362, 95], [365, 98], [368, 105],
  );
  const edgeY = function (x) {
    for (let i = 0; i < edge.length - 1; i++) {
      if (x >= edge[i][0] && x <= edge[i + 1][0]) {
        const t = (x - edge[i][0]) / (edge[i + 1][0] - edge[i][0]);
        return edge[i][1] + (edge[i + 1][1] - edge[i][1]) * t;
      }
    }
    return edge[edge.length - 1][1];
  };
  const hill = edge.concat([[368, GY + 2], [0, GY + 2]]);

  // The masses first. The south flank turns away from the sun and is cool;
  // the north flank turns into it and is warm. Each has an upper plane on the
  // dome's shoulder, facing up into the high sun, and a steeper lower one.
  const flankL = edge.filter((p) => p[0] <= FL + LEAN).concat([[FL + LEAN, TOP], [FL, GY + 2], [0, GY + 2]]);
  const flankR = [[FR - LEAN, TOP]].concat(edge.filter((p) => p[0] >= FR - LEAN), [[368, GY + 2], [FR, GY + 2]]);
  const RIM = mixh(S.rubble, S.rubbleDark, 0.28);
  const TONE_L = shd(mixh(S.rubble, S.rubbleDark, 0.18), 0.3);
  const TONE_R = lit(S.rubble, 0.12);
  B.fill(ctx, hill, RIM);
  B.fill(ctx, flankL, TONE_L);
  B.fill(ctx, flankR, TONE_R);
  {
    B.clip(ctx, flankL, function () {
      B.fill(ctx, [[0, 100], [8, 88], [20, 70], [34, 52], [52, 38], [FL + LEAN, 34], [FL + LEAN - 2, 62], [44, 70], [30, 86], [12, 112], [0, 128]], shd(S.rubble, 0.16));
      B.fill(ctx, [[0, 168], [14, 176], [30, 196], [FL - 2, 214], [FL, GY + 2], [0, GY + 2]], shd(mixh(S.rubble, S.rubbleDark, 0.35), 0.34));
    });
    B.clip(ctx, flankR, function () {
      B.fill(ctx, [[W, 92], [360, 80], [348, 62], [334, 46], [318, 36], [FR - LEAN, 32], [FR - LEAN + 2, 60], [324, 68], [338, 84], [356, 108], [W, 124]], lit(S.rubble, 0.3));
      B.fill(ctx, [[W, 172], [354, 180], [338, 198], [FR + 2, 214], [FR, GY + 2], [W, GY + 2]], S.rubble);
    });
  }

  /**
   * One broken block of fill: an angular lump or a slab, turned at random,
   * its body in the flank's shade, its top face (up and to the right, toward
   * the sun) flat in the light. Crisp edges, no gradient.
   */
  const block = function (x, y, w, h, ang, tone, warm, rng) {
    const n = 5 + Math.floor(rng() * 2);
    const rot = rng() * Math.PI * 2;
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = rot + (i / n) * Math.PI * 2 + (rng() - 0.5) * 0.7;
      const rr = 0.8 + rng() * 0.28;
      const u = Math.cos(a) * rr * w;
      const v = Math.sin(a) * rr * h;
      pts.push([x + u * ca - v * sa, y + u * sa + v * ca]);
    }
    const kk = 0.7 + rng() * 0.12;
    const top = pts.map((p) => [x + (p[0] - x) * kk + w * 0.22, y + (p[1] - y) * kk - h * 0.34]);
    B.clip(ctx, hill, function () {
      B.fill(ctx, pts.map((p) => [p[0] - 2.5, p[1] + 2]), B.alpha(SHADOW, warm ? 0.2 : 0.28));
    });
    B.fill(ctx, pts, warm ? shd(tone, 0.16) : shd(tone, 0.34));
    B.clip(ctx, pts, function () {
      B.fill(ctx, top, warm ? lit(tone, 0.26) : shd(tone, 0.14));
    });
  };
  {
    const r = B.rng(2604);
    const rocks = [];
    // A jittered grid: even cover without rows.
    for (let gy = 28; gy < GY + 6; gy += 10) {
      const big = Math.max(0, (gy - 50) / (GY - 50));
      const step = 16 + big * 6;
      for (let gx = -6 + (Math.floor(gy / 10) % 2) * step * 0.5; gx < W + 8; gx += step) {
        const x = gx + (r() - 0.5) * step * 0.9;
        const yy = gy + (r() - 0.5) * 10;
        const slab = r() < 0.4;
        const w = 7 + r() * 4 + big * 4 + (r() < 0.15 ? 4 : 0) + (slab ? 2 : 0);
        const h = w * (slab ? 0.42 + r() * 0.12 : 0.66 + r() * 0.26);
        const ang = (r() - 0.5) * (slab ? 0.7 : 0.3);
        const seed = Math.floor(r() * 1e6);
        // Some sit on the skyline and break it; none floats above it.
        if (yy < edgeY(x) + h * 0.15) continue;
        // A calm band of the flank's own tone along the facade edges.
        if (x + w * 0.9 + 3 > edgeL(yy) && x - w * 0.9 - 3 < edgeR(yy)) continue;
        // Thinning toward the frame: texture, not pattern.
        const d = Math.min(x, W - x);
        if (r() > 0.35 + d / 45) continue;
        rocks.push([x, yy, w, h, ang, seed]);
      }
    }
    // A few boulders break the skyline of the rim above the frieze.
    for (const x of [96, 139, 181, 226, 268]) rocks.push([x + r() * 10, 30 + r() * 2, 7 + r() * 3, 4 + r() * 2, (r() - 0.5) * 0.4, Math.floor(r() * 1e6)]);
    // Patches of finer fill and wind-blown sand between the blocks, under them.
    const rs = B.rng(99);
    for (let i = 0; i < 12; i++) {
      const left = i % 2 === 0;
      const y = 70 + rs() * 150;
      const x = left ? 4 + rs() * Math.max(0, edgeL(y) - 26) : edgeR(y) + 10 + rs() * Math.max(0, W - edgeR(y) - 26);
      if (y < edgeY(x) + 6) continue;
      const tone = left ? shd(mixh(S.rubble, S.sand, 0.5), 0.2) : lit(mixh(S.rubble, S.sand, 0.5), 0.2);
      B.fill(ctx, [[x - 11, y + 2], [x - 5, y - 3], [x + 8, y - 2.5], [x + 12, y + 2.5], [x + 1, y + 4.5]], B.alpha(tone, 0.6));
    }
    rocks.sort((p, q) => p[1] - q[1]);
    const tones = [S.rubble, S.rubble, mixh(S.rubble, S.rose, 0.45), mixh(S.rubble, S.rubbleDark, 0.3), mixh(S.rubble, S.sand, 0.25)];
    for (const [x, y, w, h, ang, seed] of rocks) {
      const rng = B.rng(seed);
      block(x, y, w, h, ang, tones[Math.floor(rng() * tones.length)], x > DOOR, rng);
    }
  }
  // Directly behind the frieze the rim is one shaded tone, so the twenty-two
  // baboons stand against the same colour and stay the same pixels.
  {
    const r = B.rng(331);
    const rim = [[FL + LEAN + 2, TOP], [FL + LEAN + 2, 33]];
    for (let x = FL + LEAN + 6; x <= FR - LEAN - 6; x += 6) rim.push([x, 31.2 + r() * 1.6]);
    rim.push([FR - LEAN - 2, 33], [FR - LEAN - 2, TOP]);
    B.fill(ctx, rim, mixh(S.rubbleDark, S.rubble, 0.45));
  }

  // ---------------------------------------------------------------------------
  // 3. The facade: cut from the hill in the shape of a pylon, one piece of
  // sandstone with its statues. It rises well above the crowns. In the morning
  // sun it glows: half a step below the colossi, not a muddy ground.

  const WALL = mixh(mixh(S.sun, S.body, 0.5), S.rose, 0.1);
  {
    const g = ctx.createLinearGradient(FL, GY, FR, TOP);
    g.addColorStop(0, shd(WALL, 0.1));
    g.addColorStop(0.5, WALL);
    g.addColorStop(1, lit(WALL, 0.14));
    B.fill(ctx, FACADE, g);
  }
  B.clip(ctx, FACADE, function () {
    // Rose bedding runs straight through the face, and through the colossi.
    for (const [y, t] of BANDS) {
      const g = ctx.createLinearGradient(0, y - t / 2, 0, y + t / 2);
      g.addColorStop(0, B.alpha(S.rose, 0));
      g.addColorStop(0.5, B.alpha(S.rose, 0.62));
      g.addColorStop(1, B.alpha(S.rose, 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, y - t / 2, W, t);
    }
    // Weathering streaks, soft at both ends.
    const r = B.rng(77);
    for (let i = 0; i < 6; i++) {
      const x = 80 + r() * 208;
      const w = 5 + r() * 5;
      const y0 = TOP + 30 + r() * 10;
      const y1 = y0 + 34 + r() * 44;
      const s = B.layer(Math.ceil(w) + 2, Math.ceil(y1 - y0) + 2);
      const sc = s.getContext('2d');
      const g = sc.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, B.alpha(S.patina, 0));
      g.addColorStop(0.5, B.alpha(S.patina, 0.26));
      g.addColorStop(1, B.alpha(S.patina, 0));
      sc.fillStyle = g;
      sc.fillRect(0, 0, w, y1 - y0);
      sc.globalCompositeOperation = 'destination-in';
      const v = sc.createLinearGradient(0, 0, 0, y1 - y0);
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(0.25, 'rgba(0,0,0,1)');
      v.addColorStop(1, 'rgba(0,0,0,0)');
      sc.fillStyle = v;
      sc.fillRect(0, 0, w, y1 - y0);
      ctx.drawImage(s, Math.round(x), Math.round(y0));
    }
  });

  // The torus moulding up both leaning edges.
  round(ctx, [[FL, GY], [FL + LEAN, TOP], [FL + LEAN + 5, TOP], [FL + 5, GY]], S.sun, 0.8);
  round(ctx, [[FR - 5, GY], [FR - LEAN - 5, TOP], [FR - LEAN, TOP], [FR, GY]], S.sun, 0.8);

  // Upper registers, top down: the cornice the baboons stand on, carrying the
  // band of cartouches between cobras; a torus roll; the band of the king's
  // names and titles. Horizontal texture only: nothing legible.
  {
    const x0 = FL + LEAN + 4;
    const x1 = FR - LEAN - 4;
    roll(ctx, [[x0, TOP], [x1, TOP], [x1, TOP + 11], [x0, TOP + 11]], S.sun);
    // Cartouche panels and cobras as a soft relief rhythm, no outlines.
    for (let x = 79; x <= 290; x += 12) {
      wash(ctx, [[x - 2, TOP + 2.5], [x, TOP + 2.5], [x, TOP + 9], [x - 2, TOP + 9]], SHADOW, 0.13);
      wash(ctx, [[x, TOP + 2.5], [x + 2, TOP + 2.5], [x + 2, TOP + 9], [x, TOP + 9]], SUN, 0.25);
      ellipse(ctx, x + 6, TOP + 5, 1, 1.4, B.alpha(SHADOW, 0.12));
    }
    wash(ctx, [[x0, TOP + 11], [x1, TOP + 11], [x1, TOP + 13], [x0, TOP + 13]], SHADOW, 0.4);
    roll(ctx, [[x0 + 1, TOP + 12], [x1 - 1, TOP + 12], [x1 - 1, TOP + 16], [x0 + 1, TOP + 16]], S.sun);
    wash(ctx, [[x0 + 1, TOP + 16], [x1 - 1, TOP + 16], [x1 - 1, TOP + 17.5], [x0 + 1, TOP + 17.5]], SHADOW, 0.25);
    // The band of names and titles: a recessed strip.
    wash(ctx, [[x0 + 6, TOP + 20], [x1 - 6, TOP + 20], [x1 - 6, TOP + 29], [x0 + 6, TOP + 29]], SHADOW, 0.07);
    // Two register lines and, between them, soft level dashes: every mark is
    // horizontal, so nothing reads as a sign.
    line(ctx, x0 + 7, TOP + 20.5, x1 - 7, TOP + 20.5, 0.8, B.alpha(S.recess, 0.16));
    line(ctx, x0 + 7, TOP + 28.5, x1 - 7, TOP + 28.5, 0.8, B.alpha(S.recess, 0.16));
    const r = B.rng(311);
    for (let row = 0; row < 2; row++) {
      const y = TOP + 23 + row * 3.2;
      for (let x = x0 + 9 + row * 3; x < x1 - 12; ) {
        const w = 3 + r() * 6;
        line(ctx, x, y, Math.min(x + w, x1 - 10), y, 1.4, B.alpha(S.recess, 0.1));
        x += w + 2.5 + r() * 3;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // The carved surrounds of the door and the niche, and the king's reliefs
  // beside the niche. They are part of the wall, so they go down before the
  // colossi's shadows, which run across them unbroken.

  const NICHE = { x0: DOOR - 7, x1: DOOR + 7, y0: 134, y1: 166 };
  const DOORWAY = { x0: DOOR - 7, x1: DOOR + 7, y0: 181 };
  {
    const d = DOORWAY;
    B.fill(ctx, [[d.x0 - 4, GY], [d.x0 - 4, d.y0 - 5], [d.x1 + 4, d.y0 - 5], [d.x1 + 4, GY]], lit(WALL, 0.08));
    wash(ctx, [[d.x0 - 4, GY], [d.x0 - 4, d.y0 - 5], [d.x0 - 2.5, d.y0 - 5], [d.x0 - 2.5, GY]], SHADOW, 0.2);
    wash(ctx, [[d.x1 + 2.5, GY], [d.x1 + 2.5, d.y0 - 5], [d.x1 + 4, d.y0 - 5], [d.x1 + 4, GY]], SUN, 0.3);
    roll(ctx, [[d.x0 - 6, d.y0 - 5], [d.x1 + 6, d.y0 - 5], [d.x1 + 6, d.y0 - 9], [d.x0 - 6, d.y0 - 9]], S.sun);
    const n = NICHE;
    B.fill(ctx, [[n.x0 - 3, n.y1 + 2], [n.x0 - 3, n.y0 - 3], [n.x1 + 3, n.y0 - 3], [n.x1 + 3, n.y1 + 2]], lit(WALL, 0.08));
    wash(ctx, [[n.x0 - 3, n.y1 + 2], [n.x0 - 3, n.y0 - 3], [n.x0 - 1.5, n.y0 - 3], [n.x0 - 1.5, n.y1 + 2]], SHADOW, 0.18);
    wash(ctx, [[n.x1 + 1.5, n.y1 + 2], [n.x1 + 1.5, n.y0 - 3], [n.x1 + 3, n.y0 - 3], [n.x1 + 3, n.y1 + 2]], SUN, 0.3);
    // The king in sunk relief on each side, standing, facing in to the god,
    // arms held forward. Faint: a recess tone with a lit far edge.
    for (const s of [-1, 1]) {
      const x = DOOR + s * 13.5;
      const f = s < 0 ? 1 : -1; // which way he faces: toward the niche
      const k = B.alpha(S.recess, 0.42);
      const P = (pts) => pts.map((p) => [x + f * p[0], p[1]]);
      B.fill(ctx, P([[-1.6, 145], [1.3, 145], [1.1, 139], [1.6, 136.5], [1.2, 134.4], [-1.3, 134.4], [-1.6, 137]]), k); // body and kilt
      ellipse(ctx, x + f * 0.1, 132.8, 1.25, 1.45, k); // head
      B.fill(ctx, P([[-1, 131.8], [1, 131.8], [0.7, 128.6], [-0.4, 128.2]]), k); // crown
      line(ctx, x + f * 0.8, 135.6, x + f * 4, 134.2, 0.95, k); // arms held forward
      line(ctx, x + f * 0.8, 136.8, x + f * 4, 136.2, 0.95, k);
      line(ctx, x + f * 1.9, 145, x + f * 1.9, 134.6, 0.6, B.alpha(SUN, 0.3));
    }
  }

  // ---------------------------------------------------------------------------
  // The colossus, painted once. Local frame: x across from the statue's axis,
  // h up from the foot of its plinth. The seated canon: knees a little above a
  // third, square shoulders at two thirds, a big calm head in the nemes, and
  // the double crown on top of it.

  const LW = 60;
  const LH = 150;
  const LOX = 30;
  const LOY = 144;
  const mirror = (pts) => pts.map((p) => [-p[0], p[1]]).reverse();
  const both = (pts) => [pts, mirror(pts)];
  /** Draw in the statue's own frame: x across, h up. */
  const upright = (c) => c.setTransform(1, 0, 0, -1, LOX, LOY);

  const STONE = lit(S.sun, 0.08);
  const HI = lit(S.sun, 0.45);

  // Shapes of the head, shared by the colossi and the fallen head.
  const NEMES = [[-10.6, 108.5], [10.6, 108.5], [12.6, 104], [16.1, 96.5], [16.4, 86.6], [12.8, 86.2], [-12.8, 86.2], [-16.4, 86.6], [-16.1, 96.5], [-12.6, 104]];
  const LAPPET = [[-12.9, 95], [-8.3, 94], [-8.1, 76.2], [-10.5, 74.8], [-12.9, 76]];
  const FACE = [[-7.8, 104.4], [7.8, 104.4], [8.1, 97.5], [7.1, 93.2], [4, 90.3], [0, 89.6], [-4, 90.3], [-7.1, 93.2], [-8.1, 97.5]];
  const BROW = [[-8.8, 107.4], [8.8, 107.4], [8.6, 104], [-8.6, 104]];
  const BEARD = [[-2.3, 90.6], [2.3, 90.6], [2.6, 80.8], [-2.6, 80.8]];
  const RED = [[-9.8, 106.8], [9.8, 106.8], [11, 118.2], [-11, 118.2]];
  const RED_BACK = [[-9.2, 117], [9.2, 117], [9.2, 122.8], [8.2, 124], [-8.2, 124], [-9.2, 122.8]];
  const WHITE = [[-6.8, 116], [-6.5, 121], [-5.9, 126], [-5.2, 129.6], [-4.9, 131.4], [-4.3, 133.4], [-3.1, 135.3], [-1.6, 136.1], [0, 136.3]];
  const WHITE_FULL = WHITE.concat(mirror(WHITE).slice(1));

  /**
   * The head: nemes, face, false beard, uraeus and the double crown, the tall
   * white crown rising out of the red. Drawn in the statue's frame; the caller
   * sets the transform. opts.lappets: the nemes lappets on the chest;
   * opts.neck: the shadow under the chin; opts.stump: the white crown broken;
   * opts.bold: a headcloth a full tone below the face and firmer features,
   * for the fallen head, which has to read as a face lying on its side.
   */
  function paintHead(c, opts) {
    const k = opts.bold ? 1.7 : 1;
    const stump = [[-12, 100], [12, 100], [12, 125.2], [4.6, 126.8], [1.2, 125], [-2.6, 126.4], [-12, 124.6]];
    // Flat shapes first, in the stone's colour, so they read as one carving.
    for (const p of [NEMES, ...(opts.lappets ? both(LAPPET) : [])]) B.fill(c, p, STONE);
    // The headcloth sits a half-tone below the face and turns away on the left.
    wash(c, NEMES, S.body, Math.min(0.28 * k, 0.9));
    if (opts.lappets) for (const p of both(LAPPET)) wash(c, p, S.body, 0.2);
    wash(c, [[-10.6, 108.5], [-4, 108.5], [-7.4, 104], [-12.9, 95], [-12.9, 86.4], [-16.4, 86.6], [-16.1, 96.5], [-12.6, 104]], SHADOW, 0.24);
    wash(c, [[10.6, 108.5], [12.6, 104], [16.1, 96.5], [16.4, 87], [13.4, 87], [13.2, 95.5], [9, 104]], SUN, 0.32);
    // Stripes of the nemes, on the wings and the lappets.
    for (let h = 88.4; h <= 102; h += 2.7) {
      const w = h > 96.5 ? 12.6 + ((104 - h) / 7.5) * 3.5 : 16.1;
      line(c, -w + 0.7, h, -8.4, h, 0.8, B.alpha(S.recess, 0.34 * k));
      line(c, 8.4, h, w - 0.7, h, 0.8, B.alpha(S.recess, 0.26 * k));
    }
    if (opts.lappets) {
      for (let h = 78.4; h <= 93; h += 2.7) {
        line(c, -12.4, h, -8.6, h, 0.8, B.alpha(S.recess, 0.34));
        line(c, 8.6, h, 12.4, h, 0.8, B.alpha(S.recess, 0.26));
      }
      wash(c, [[-12.9, 95], [-11.2, 94.8], [-11, 75.4], [-12.9, 76]], SHADOW, 0.3); // lappet, left, turned away
      wash(c, [[11, 94.6], [12.9, 95], [12.9, 76], [11, 75.4]], SUN, 0.3);
    }
    // Under the chin, the neck in deep cool shade, falling onto the collar.
    if (opts.neck) {
      B.fill(c, [[-7.4, 91], [7.4, 91], [7.4, 87.2], [4.6, 84.6], [-4.6, 84], [-7.4, 86.4]], B.alpha(SHADOW, 0.42));
      wash(c, [[-7.4, 91], [7.4, 91], [7.4, 89], [-7.4, 89]], SHADOW, 0.2);
    }
    // The face: big, calm, turned full to the light.
    B.fill(c, FACE, STONE);
    wash(c, FACE, SUN, 0.2 * k);
    wash(c, [[-7.8, 104.4], [-5.2, 104.4], [-5.8, 97], [-5, 92.6], [-7.1, 93.2], [-8.1, 97.5]], SHADOW, 0.3); // left cheek under the nemes
    wash(c, [[2.8, 104], [7.8, 104], [8.1, 97.5], [7.1, 93.2], [4, 90.6], [4.4, 97]], SUN, 0.26); // right cheek
    // The plain brow band.
    B.fill(c, BROW, lit(STONE, 0.1));
    wash(c, [[-8.8, 107.4], [-4.4, 107.4], [-4.4, 104], [-8.6, 104]], SHADOW, 0.2);
    wash(c, [[-8.4, 104], [8.4, 104], [8.2, 103], [-8.2, 103]], SHADOW, 0.34); // its shadow on the forehead
    // Brows, eyes, nose, mouth: a few marks. A calm face.
    line(c, -5.6, 101.4, -1.8, 101.2, 0.8, B.alpha(S.recess, 0.4));
    line(c, 1.8, 101.2, 5.6, 101.4, 0.8, B.alpha(S.recess, 0.32));
    line(c, -5.2, 99.2, -2, 99, 1.35 * (opts.bold ? 1.3 : 1), B.alpha(S.recess, 0.92));
    line(c, 2, 99, 5.2, 99.2, 1.35 * (opts.bold ? 1.3 : 1), B.alpha(S.recess, 0.85));
    B.fill(c, [[-0.2, 99], [-1.9, 94.4], [-0.4, 94], [0.3, 98.4]], B.alpha(SHADOW, 0.36)); // the nose's shaded side
    line(c, 0.3, 98.6, 1.1, 94.6, 0.8, B.alpha(HI, 0.6)); // its lit ridge
    line(c, -2.4, 92.4, 2.4, 92.4, 1.1, B.alpha(S.recess, Math.min(1, 0.62 * k)));
    // The straight false beard, with its shadow side.
    B.fill(c, BEARD, STONE);
    wash(c, [[-2.3, 90.6], [-0.4, 90.6], [-0.6, 80.8], [-2.6, 80.8]], SHADOW, 0.3);
    for (let h = 83; h <= 89; h += 2) line(c, -2.2, h, 2.2, h, 0.6, B.alpha(S.recess, 0.25));
    // The double crown: the red crown, its tall rear plate a step back, and the
    // white crown rising out of it.
    B.fill(c, RED_BACK, STONE);
    wash(c, RED_BACK, SHADOW, 0.16);
    wash(c, [[-9.2, 117], [-6.6, 117], [-6.6, 124], [-8.2, 124], [-9.2, 122.8]], SHADOW, 0.16);
    const white = function () {
      B.fill(c, WHITE_FULL, STONE);
      wash(c, [[-6.8, 116], [-4.6, 116], [-3.2, 128], [-2.4, 134.6], [-3.1, 135.3], [-4.3, 133.4], [-4.9, 131.4], [-5.2, 129.6], [-5.9, 126], [-6.5, 121]], SHADOW, 0.24);
      wash(c, [[1.4, 134.6], [3.1, 135.3], [4.3, 133.4], [4.9, 131.4], [5.2, 129.6], [5.9, 126], [6.5, 121], [6.8, 116], [4, 116], [3.4, 126]], SUN, 0.42);
    };
    if (opts.stump) {
      c.save();
      B.path(c, stump);
      c.clip();
      white();
      c.restore();
      // The old break across the white crown, its upward facets in the sun.
      B.fill(c, [[-5.9, 124.8], [-2.6, 126.2], [1.2, 124.8], [4.6, 126.4], [5.8, 125.4], [5.8, 124], [-5.8, 123.6]], B.alpha(HI, 0.4));
    } else {
      white();
    }
    B.fill(c, RED, STONE);
    wash(c, [[-11, 118.2], [-8.2, 118.2], [-7.6, 107], [-9.8, 106.8]], SHADOW, 0.24); // left flank
    wash(c, [[6, 107], [9.8, 106.8], [11, 118.2], [7, 118.2]], SUN, 0.36);
    line(c, -10.8, 117.8, 10.8, 117.8, 1, B.alpha(HI, 0.9)); // the red crown's rim in sun
    wash(c, [[-9.8, 107], [9.8, 107], [9.6, 106], [-9.6, 106]], SHADOW, 0.3); // under the crown's rim
    // Uraeus on the brow: a rearing cobra, hood spread.
    B.fill(c, [[-1.3, 104.6], [1.3, 104.6], [1.6, 108.4], [0, 110.4], [-1.6, 108.4]], lit(STONE, 0.25));
    wash(c, [[-1.3, 104.6], [0, 104.6], [0, 110.4], [-1.6, 108.4]], SHADOW, 0.3);
  }

  /**
   * A family figure, standing, no higher than the king's knee. Unnamed at this
   * size: a woman in a long sheath dress and a wig, with a neck, shoulders, and
   * arms hanging at her sides.
   */
  const FIG = B.layer(12, 44);
  const FIG_SMALL = B.layer(12, 44);
  const paintFigure = function (layer, top, w) {
    const c = layer.getContext('2d');
    const x = 6;
    const y = (h) => 42 - h; // feet at h 4.6, on the plinth
    const hw = w / 2;
    const P = (pts) => pts.map((p) => [x + p[0], y(p[1])]);
    const arm = top - 14.5; // where the hands hang, at mid-thigh
    const body = P([
      [-1.05, top - 4.4], [-hw * 0.78, top - 5.6], [-hw, top - 6.8], [-hw * 0.98, arm + 1], [-hw * 0.86, arm],
      [-hw * 0.6, arm - 0.4], [-hw * 0.6, top - 19], [-hw * 0.7, 6.4], [-hw * 0.76, 4.6],
      [hw * 0.76, 4.6], [hw * 0.7, 6.4], [hw * 0.6, top - 19], [hw * 0.6, arm - 0.4],
      [hw * 0.86, arm], [hw * 0.98, arm + 1], [hw, top - 6.8], [hw * 0.78, top - 5.6], [1.05, top - 4.4],
    ]);
    B.fill(c, body, STONE);
    ellipse(c, x, y(top - 2.3), 2.1, 2.35, STONE); // head in a wig
    B.fill(c, P([[-2.1, top - 2.4], [2.1, top - 2.4], [2.2, top - 5.2], [1.3, top - 5.6], [-1.3, top - 5.6], [-2.2, top - 5.2]]), STONE); // the wig to the shoulders
    lightAcross(c, x - hw - 1, x + hw + 1, 44, 0.34, 0.26);
    c.save();
    c.globalCompositeOperation = 'source-atop';
    // The arms, parted from the body by a line of shade; the waist narrows between them.
    for (const s of [-1, 1]) line(c, x + s * (hw * 0.62), y(top - 8), x + s * (hw * 0.6), y(arm + 0.6), 0.7, B.alpha(S.recess, s < 0 ? 0.55 : 0.4));
    line(c, x - hw * 0.5, y(top - 6.2), x + hw * 0.5, y(top - 6.2), 0.6, B.alpha(S.recess, 0.25)); // shoulder line
    wash(c, P([[-1.05, top - 4.4], [1.05, top - 4.4], [1.05, top - 5.8], [-1.05, top - 5.8]]), SHADOW, 0.3); // the neck under the chin
    wash(c, P([[-hw, 6.4], [hw, 6.4], [hw, 4.6], [-hw, 4.6]]), SHADOW, 0.18); // the hem
    c.restore();
    inkRound(layer, 0.2);
  };
  paintFigure(FIG, 37, 6.6);
  paintFigure(FIG_SMALL, 31, 5.6);

  function paintColossus(c) {
    c.save();
    upright(c);
    // Plinth and throne. The throne's front stands out to either side of the
    // legs, and its seat shows as a step, lit on top, below the elbows.
    B.fill(c, [[-24.5, 0], [24.5, 0], [24.5, 4.6], [-24.5, 4.6]], STONE);
    wash(c, [[-24.5, 0], [24.5, 0], [24.5, 1.4], [-24.5, 1.4]], SHADOW, 0.2);
    B.fill(c, [[-23.5, 4.6], [23.5, 4.6], [23.5, 53.4], [-23.5, 53.4]], mixh(STONE, S.body, 0.45));
    wash(c, [[-23.5, 4.6], [-15.5, 4.6], [-15.5, 53.4], [-23.5, 53.4]], SHADOW, 0.2); // the body's shade on its left
    wash(c, [[-23.5, 46], [23.5, 46], [23.5, 51.6], [-23.5, 51.6]], SHADOW, 0.16); // under the seat's edge
    B.fill(c, [[-23.5, 51.6], [23.5, 51.6], [23.5, 53.6], [-23.5, 53.6]], lit(STONE, 0.3)); // the seat's lit edge
    // The gap between the legs, deep in the throne.
    B.fill(c, [[-3.6, 31], [3.6, 31], [3.8, 4.6], [-3.8, 4.6]], shd(S.recess, 0.25));

    // The body, one flat shape at a time.
    const torso = [[-12.2, 57.5], [12.2, 57.5], [13, 63], [15.6, 72], [17.6, 80], [17.4, 87], [-17.4, 87], [-17.6, 80], [-15.6, 72], [-13, 63]];
    const arm = [[16.8, 87.2], [21.6, 87.2], [24.2, 85.8], [25.2, 82], [24.4, 72], [23, 61.5], [21.8, 57.4], [18.6, 57.2], [17.8, 62], [17.4, 74]];
    const fore = [[13.4, 51.6], [21.6, 52.4], [23.4, 55.6], [22.6, 59.6], [17.4, 59.8], [13.2, 55]];
    const lap = [[-15, 51], [15, 51], [15.2, 55.6], [12.4, 58.6], [-12.4, 58.6], [-15.2, 55.6]];
    const knee = [[-14.8, 52], [-2.2, 52], [-1.6, 49], [-1.8, 41], [-14.2, 41], [-14.8, 49]];
    const shin = [[-13.6, 42], [-2.4, 42], [-2.8, 30], [-3.8, 10], [-12.2, 10], [-13, 30]];
    const foot = [[-13.2, 4.6], [-2.4, 4.6], [-2.6, 8], [-3.8, 10.5], [-12.2, 10.5], [-13, 8]];
    const hand = [[-14.2, 53.2], [-3.8, 53.2], [-3.4, 50.6], [-4.2, 44.8], [-13.6, 44.8], [-14.4, 50.6]];
    const apron = [[-4.4, 52], [4.4, 52], [5.2, 30], [-5.2, 30]];
    for (const p of [torso, ...both(arm), lap, ...both(fore), ...both(knee), ...both(shin), ...both(foot), apron, ...both(hand)]) B.fill(c, p, STONE);

    // Shadows where forms turn away or overlap.
    // The upper arms stand free of the torso: a deep recess between them.
    for (const s of [-1, 1]) {
      const k = s < 0 ? 0.5 : 0.36;
      B.fill(c, [[s * 17.2, 85.6], [s * 18.6, 85.4], [s * 19, 60], [s * 17.8, 59.4], [s * 17.4, 74]], B.alpha(shd(S.recess, 0.3), k));
    }
    // The left upper arm turns away; the right one faces the sun.
    wash(c, [[-25.2, 82], [-24.2, 85.8], [-21.6, 87.2], [-20.2, 87.2], [-21, 60], [-23, 61.5], [-24.4, 72]], SHADOW, 0.3);
    wash(c, [[20.8, 87.2], [21.6, 87.2], [24.2, 85.8], [25.2, 82], [24.4, 72], [23, 61.5], [21.6, 60], [22, 80]], SUN, 0.36);
    // Shoulders: square, their tops catching the high sun.
    for (const s of [-1, 1]) wash(c, [[s * 16.6, 87.2], [s * 21.6, 87.2], [s * 24.2, 85.8], [s * 21, 85.4], [s * 16.6, 85.6]], SUN, s < 0 ? 0.2 : 0.42);
    // The chest: its left half turned away, a soft light on the right.
    wash(c, [[-17.4, 87], [-6, 87], [-5, 64], [-13, 63], [-15.6, 72], [-17.6, 80]], SHADOW, 0.18);
    wash(c, [[6, 86], [15, 86], [16, 74], [13, 64], [8, 64]], SUN, 0.16);
    // Broad collar across the chest, below the chin.
    const collar = [];
    for (let i = 0; i <= 10; i++) {
      const t = -1 + i / 5;
      collar.push([t * 13, 86.6 - (1 - t * t) * 5]);
    }
    for (let i = 10; i >= 0; i--) {
      const t = -1 + i / 5;
      collar.push([t * 13, 81.6 - (1 - t * t) * 5.6]);
    }
    wash(c, collar, SUN, 0.18);
    for (const d of [0, 2.4]) {
      c.beginPath();
      c.moveTo(-13, 84.2 - d);
      c.quadraticCurveTo(0, 74 - d * 2, 13, 84.2 - d);
      c.lineWidth = 0.8;
      c.strokeStyle = B.alpha(S.recess, 0.42);
      c.stroke();
    }
    // Belt, and the kilt's pleated front panel between the knees.
    B.fill(c, [[-12.6, 58.2], [12.6, 58.2], [12.8, 61.2], [-12.8, 61.2]], lit(STONE, 0.12));
    wash(c, [[-12.6, 58.2], [12.6, 58.2], [12.6, 59.2], [-12.6, 59.2]], SHADOW, 0.3);
    // The lap: the kilt over the thighs, lit on top where the forearms lie.
    wash(c, [[-15, 51], [15, 51], [15.2, 55.6], [-15.2, 55.6]], SUN, 0.24);
    wash(c, [[-15, 51], [-6, 51], [-6, 58.4], [-12.4, 58.6], [-15.2, 55.6]], SHADOW, 0.14);
    // Forearms lie along the thighs to the hands; the elbows stand out.
    for (const s of [-1, 1]) {
      wash(c, [[s * 13.4, 51.6], [s * 21.6, 52.4], [s * 20, 54.4], [s * 13.3, 53.6]], SHADOW, s < 0 ? 0.34 : 0.24); // under the forearm
      wash(c, [[s * 15, 58.6], [s * 22.6, 59.6], [s * 23.4, 55.6], [s * 16, 56.4]], SUN, s < 0 ? 0.12 : 0.34); // its upper face
    }
    wash(c, [[-4.4, 52], [-1.8, 52], [-2.4, 30], [-5.2, 30]], SHADOW, 0.18);
    for (const x of [-2.2, 0, 2.2]) line(c, x, 50.5, x * 1.2, 31.5, 0.6, B.alpha(S.recess, 0.3));
    for (const s of [-1, 1]) {
      // Under the hand, on the knee; under the knee, on the shin: deep.
      wash(c, [[s * 13.6, 44.8], [s * 4.2, 44.8], [s * 4.4, 42.8], [s * 13.4, 42.8]], SHADOW, 0.36);
      wash(c, [[s * 14.2, 41.4], [s * 2.2, 41.4], [s * 2.4, 37.4], [s * 13.4, 38]], SHADOW, 0.3);
      // Each shin's left flank in shade, its right in the sun.
      wash(c, [[s * 8 - 5.6, 41], [s * 8 - 2.6, 41], [s * 8 - 2.2, 10], [s * 8 - 4.4, 10]], SHADOW, 0.24);
      wash(c, [[s * 8 + 1.2, 41], [s * 8 + 4.4, 41], [s * 8 + 3.8, 10], [s * 8 + 1, 10]], SUN, 0.3);
      // The hand: flat on the knee, its back lit, the fingers over the edge.
      wash(c, [[s * 14.2, 53.2], [s * 3.8, 53.2], [s * 3.6, 51], [s * 14.4, 51]], SUN, 0.4);
      for (const f of [11.4, 9.2, 7]) line(c, s * f, 45.2, s * f, 49.4, 0.7, B.alpha(S.recess, 0.5));
    }
    // The head on its shoulders.
    paintHead(c, { lappets: true, neck: true });
    // The beard and lappets throw shade on the chest and collar.
    wash(c, [[-2.6, 80.8], [0.2, 80.8], [-0.6, 78.6], [-3.4, 78.8]], SHADOW, 0.34);
    wash(c, [[-12.9, 76], [-10.5, 74.8], [-8.1, 76.2], [-9.4, 73.8], [-12.6, 74.2]], SHADOW, 0.3);
    wash(c, [[8.1, 76.2], [10.5, 74.8], [12.9, 76], [11.8, 74.2], [8.8, 74.2]], SHADOW, 0.2);
    c.restore();

    // The family at the legs: one beside each leg, one in front between them.
    for (const [img, x] of [[FIG, -19], [FIG, 19], [FIG_SMALL, 0]]) {
      c.save();
      c.globalAlpha = 0.34;
      c.drawImage(silhouette(img, SHADOW), LOX + x - 6 - 2, LOY - 42 + 1);
      c.restore();
      c.drawImage(img, LOX + x - 6, LOY - 42);
    }
  }

  /** Bedding and light over the whole statue, clipped to it. */
  function finishColossus(c, layerY) {
    c.save();
    c.globalCompositeOperation = 'source-atop';
    for (const [y, t] of BANDS) {
      const ly = y - layerY;
      const g = c.createLinearGradient(0, ly - t / 2, 0, ly + t / 2);
      g.addColorStop(0, B.alpha(S.rose, 0));
      g.addColorStop(0.5, B.alpha(S.rose, 0.42));
      g.addColorStop(1, B.alpha(S.rose, 0));
      c.fillStyle = g;
      c.fillRect(0, ly - t / 2, LW, t);
    }
    c.restore();
    lightAcross(c, LOX - 26, LOX + 26, LH, 0.2, 0.14);
  }

  const layerY = GY - LOY; // whole pixels: the stamps must not resample

  const whole = B.layer(LW, LH);
  paintColossus(whole.getContext('2d'));
  finishColossus(whole.getContext('2d'), layerY);

  // The broken colossus: the same statue, shattered at the waist in antiquity.
  // Throne, legs, lap and hands remain; no chest, shoulders or head. The
  // break is old and irregular: a few large facets, lower on the south side,
  // their upper faces catching the sun, the lip soft.
  // High on the south side over the stump of the left arm, falling in a few
  // big steps to the right: its broken top turns up toward the sun.
  const BREAK = [[-27, 66.6], [-22.5, 65.4], [-16, 66.2], [-9.5, 62.4], [-3, 63], [3.5, 59.8], [11, 60.4], [16.5, 57], [22, 57.6], [27, 56.2]];
  const broken = B.layer(LW, LH);
  const toLayer = (pts) => pts.map((p) => [LOX + p[0], LOY - p[1]]);
  {
    const c = broken.getContext('2d');
    B.clip(c, toLayer(BREAK.concat([[27, -2], [-27, -2]])), function () {
      c.drawImage(whole, 0, 0);
    });
    c.save();
    c.globalCompositeOperation = 'source-atop';
    upright(c);
    // The facets of the old fracture, a few px deep below its edge: those that
    // fall to the right face up into the sun, those that rise face away. Soft,
    // weathered, the same stone.
    for (let i = 0; i < BREAK.length - 1; i++) {
      const a = BREAK[i];
      const b = BREAK[i + 1];
      const up = b[1] < a[1] + 0.3; // falls to the right: faces up and right
      const da = 2.6 + (i % 3) * 0.7;
      const db = 2.6 + ((i + 1) % 3) * 0.7;
      B.fill(c, [a, b, [b[0], b[1] - db], [a[0], a[1] - da]], up ? B.alpha(HI, 0.3) : B.alpha(SHADOW, 0.16));
    }
    wash(c, BREAK.map((p) => [p[0], p[1] - 3.2]).concat(BREAK.map((p) => [p[0], p[1] - 5.2]).reverse()), SHADOW, 0.1);
    c.restore();
  }

  inkRound(whole, 1);
  // Only the fracture's own edge gets the thinner ink; the carved sides keep theirs.
  inkRound(broken, 1, toLayer(BREAK.map((p) => [Math.max(-25.6, Math.min(25.6, p[0])), p[1] - 1]).concat([[25.6, 80], [-25.6, 80]])));

  // The baboon, painted once: squatting upright, facing out to the sunrise,
  // both forepaws raised beside the face. A hamadryas: a heavy cape of mane
  // over the shoulders, a long muzzle. No ink: it stands light against the
  // shaded rim behind it, and a clear gap of that rim shows between each paw
  // and the head.
  const BW = 10;
  const BH = 14;
  const baboon = B.layer(BW, BH);
  {
    const c = baboon.getContext('2d');
    const base = lit(S.sun, 0.15);
    // The squat body in its cape of mane, wider than the head.
    B.fill(c, [[1.6, 14], [1.3, 11.8], [0.8, 10], [1.6, 8.4], [3.2, 7.5], [6.8, 7.5], [8.4, 8.4], [9.2, 10], [8.7, 11.8], [8.4, 14]], base);
    // Forearms raised straight up beside the head, palms out: a clear gap of
    // shaded rim between each paw and the head.
    const paw = [[0.8, 9.2], [2.4, 8.4], [2.3, 3.2], [1.8, 2.3], [1.2, 2.3], [0.8, 3.2]];
    B.fill(c, paw, base);
    B.fill(c, paw.map((p) => [BW - p[0], p[1]]).reverse(), base);
    // The head in its ruff, the long muzzle forward and down.
    B.fill(c, [[3.8, 7.6], [3.7, 4.3], [4.2, 3], [5, 2.6], [5.8, 3], [6.3, 4.3], [6.2, 7.6]], base);
    lightAcross(c, 0.5, 9.5, BH, 0.55, 0.35);
    c.save();
    c.globalCompositeOperation = 'source-atop';
    B.fill(c, [[4.3, 7.4], [4.2, 5.7], [4.6, 5], [5.6, 5], [5.9, 5.7], [5.8, 7.4]], B.alpha(lit(base, 0.5), 0.85)); // the muzzle, lit
    wash(c, [[3.7, 4.6], [6.3, 4.6], [6.3, 5.2], [3.7, 5.2]], S.recess, 0.18); // the brow's soft shade
    line(c, 2.4, 11.2, 7.6, 11.2, 0.7, B.alpha(S.recess, 0.3)); // the cape's edge over the haunches
    wash(c, [[0, 12.6], [BW, 12.6], [BW, 14], [0, 14]], SHADOW, 0.25); // where it sits
    c.restore();
  }

  // ---------------------------------------------------------------------------
  // Shadows on the wall, down and to the left, over the surrounds and reliefs
  // alike. Painted before the statues, on the wall only, so no statue carries
  // a neighbour's shadow and the three intact ones stay the same pixels.

  B.clip(ctx, FACADE, function () {
    ctx.save();
    ctx.globalAlpha = 0.46;
    for (let i = 0; i < 4; i++) ctx.drawImage(silhouette(i === 1 ? broken : whole, SHADOW), CX[i] - LOX - 8, layerY + 6);
    ctx.restore();
    // The hill stands proud of the recessed face on the north side.
    wash(ctx, [[FR - LEAN, TOP], [FR - LEAN - 6, TOP + 8], [FR - 5, GY], [FR, GY]], SHADOW, 0.28);
    // The baboons' shadows on the cornice top.
    ctx.save();
    ctx.globalAlpha = 0.2;
    const sb = silhouette(baboon, SHADOW);
    for (let i = 0; i < 22; i++) ctx.drawImage(sb, DOOR - 110 + i * 10 - 1, TOP - BH + 2);
    ctx.restore();
  });

  // ---------------------------------------------------------------------------
  // The door: the only entrance, on the axis, a plain tall rectangle, near-black.

  {
    const d = DOORWAY;
    B.fill(ctx, [[d.x0, GY], [d.x0, d.y0], [d.x1, d.y0], [d.x1, GY]], S.dark);
    wash(ctx, [[d.x0, d.y0 + 6], [d.x0, d.y0], [d.x1, d.y0], [d.x1, d.y0 + 6]], INK, 0.6);
  }

  // The niche over the door: Ra-Horakhty, falcon-headed with the sun disc; his
  // right hand (our left) on the user staff, his left (our right) on a small
  // Maat. With the sun, User-Maat-Ra: the king's throne name. The niche is
  // shallow and carved: its back is a warm shade, not a hole.
  {
    const { x0, x1, y0, y1 } = NICHE;
    // A warm shade, a step darker under the lintel: a shallow carved niche.
    const back = mixh(S.recess, SHADOW, 0.1);
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, mixh(S.recess, S.dark, 0.35));
    g.addColorStop(0.3, back);
    g.addColorStop(1, mixh(back, S.body, 0.3));
    B.fill(ctx, [[x0, y1], [x0, y0], [x1, y0], [x1, y1]], g);
    const god = STONE;
    const X = DOOR;
    // The body: a short kilt, the legs, a broad chest.
    B.fill(ctx, [[X - 2.9, 149.2], [X + 2.9, 149.2], [X + 2.3, 155.5], [X + 2.7, 159], [X + 1.6, 159.4], [X + 1.4, 166], [X - 1.4, 166], [X - 1.6, 159.4], [X - 2.7, 159], [X - 2.3, 155.5]], god);
    line(ctx, X, 160, X, 166, 0.7, B.alpha(S.recess, 0.6)); // between the legs
    // The tripartite wig, falling to the chest, a tone down.
    B.fill(ctx, [[X - 2.6, 142.4], [X + 2.6, 142.4], [X + 3.3, 151], [X + 1.7, 151], [X, 149.8], [X - 1.7, 151], [X - 3.3, 151]], mixh(god, S.recess, 0.4));
    // The falcon's head: a wedge narrowing to the hooked beak.
    B.fill(ctx, [[X - 2.2, 142.4], [X + 2.2, 142.4], [X + 2.3, 144.6], [X + 1.2, 147.2], [X, 149.2], [X - 1.2, 147.2], [X - 2.3, 144.6]], lit(god, 0.14));
    wash(ctx, [[X - 2.2, 142.4], [X - 0.6, 142.4], [X - 0.4, 148.4], [X - 1.2, 147.2], [X - 2.3, 144.6]], SHADOW, 0.2);
    B.fill(ctx, [[X - 0.7, 146.6], [X + 0.7, 146.6], [X, 149.2]], mixh(god, S.recess, 0.62)); // the beak
    // The sun disc on the head, wider than it and apart from it: a shaded rim,
    // a warmer stone, the uraeus rearing at its foot.
    ellipse(ctx, X, 137, 4.2, 4, mixh(S.recess, S.dark, 0.45));
    ellipse(ctx, X + 0.2, 136.7, 3.6, 3.4, lit(mixh(STONE, S.rose, 0.55), 0.1));
    wash(ctx, [[X - 3.5, 137.6], [X - 1.2, 133.4], [X - 2.7, 134.2], [X - 3.6, 136]], SHADOW, 0.24);
    B.fill(ctx, [[X - 0.7, 142.4], [X + 0.7, 142.4], [X + 0.6, 140.6], [X, 139.8], [X - 0.6, 140.6]], lit(god, 0.2)); // the uraeus
    // His right hand, our left, on the user staff with its animal head.
    line(ctx, X - 4.4, 166, X - 4.4, 149.6, 1.1, god);
    line(ctx, X - 4.4, 149.6, X - 3.1, 148.7, 1.1, god);
    line(ctx, X - 2.6, 150.6, X - 4.2, 153.4, 1, god);
    // His left hand, our right, on a small Maat, her feather on her head.
    B.fill(ctx, [[X + 3.9, 160.8], [X + 6.1, 160.8], [X + 6, 166], [X + 4, 166]], god);
    ellipse(ctx, X + 5, 159.6, 1.05, 1.1, god);
    line(ctx, X + 5.3, 158.4, X + 5.6, 155.8, 0.9, god);
    line(ctx, X + 2.6, 150.6, X + 4.6, 158.2, 1, god);
    // Light across the group, and the lintel's shadow over its upper part.
    ctx.save();
    B.path(ctx, [[x0, y1], [x0, y0], [x1, y0], [x1, y1]]);
    ctx.clip();
    const lg = ctx.createLinearGradient(x0, 0, x1, 0);
    lg.addColorStop(0, B.alpha(SHADOW, 0.38));
    lg.addColorStop(0.55, B.alpha(SHADOW, 0.06));
    lg.addColorStop(1, B.alpha(SUN, 0.12));
    ctx.fillStyle = lg;
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    const tg = ctx.createLinearGradient(0, y0, 0, y0 + 9);
    tg.addColorStop(0, B.alpha(SHADOW, 0.34));
    tg.addColorStop(1, B.alpha(SHADOW, 0));
    ctx.fillStyle = tg;
    ctx.fillRect(x0, y0, x1 - x0, 9);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // The colossi, two each side of the door. The second from the left (south,
  // immediately left of the door) is the broken one.

  for (let i = 0; i < 4; i++) ctx.drawImage(i === 1 ? broken : whole, CX[i] - LOX, layerY);

  // The twenty-two baboons along the top, identical.
  for (let i = 0; i < 22; i++) ctx.drawImage(baboon, DOOR - 110 + i * 10, TOP - BH);

  // ---------------------------------------------------------------------------
  // 4. The terrace: a plain low ledge (its balustrade of falcons and kings and
  // its stair are left off at this size), the pale forecourt in front.

  {
    const g = ctx.createLinearGradient(0, GY, 0, FLOOR);
    g.addColorStop(0, mixh(S.sand, S.body, 0.3));
    g.addColorStop(1, lit(S.sand, 0.25));
    ctx.fillStyle = g;
    ctx.fillRect(0, GY, W, FLOOR - GY);
    // A line of shadow where the facade meets the floor.
    wash(ctx, [[0, GY], [W, GY], [W, GY + 2], [0, GY + 2]], SHADOW, 0.25);
    roll(ctx, [[0, FLOOR], [W, FLOOR], [W, LEDGE], [0, LEDGE]], mixh(S.sand, S.body, 0.3));
    line(ctx, 0, FLOOR + 0.5, W, FLOOR + 0.5, 1, B.alpha(HI, 0.8));
    B.ground(ctx, W, H, LEDGE, S.sand);
    wash(ctx, [[0, LEDGE], [W, LEDGE], [W, LEDGE + 3], [0, LEDGE + 3]], SHADOW, 0.22);
    // Paving, barely.
    const r = B.rng(58);
    for (let i = 0; i < 7; i++) {
      const y = LEDGE + 7 + i * 3 + r() * 2;
      const x = r() * W;
      line(ctx, x, y, x + 40 + r() * 60, y, 0.8, B.alpha(S.body, 0.18));
    }
  }

  // The fallen head and torso, lying on the terrace at the broken statue's
  // feet, where the engineers set them again in 1968 as they had been found.
  // How they lie is not recorded. The head is the statue's own head, the same
  // size: it lies on its side, crown to the south, tipped back so its face
  // looks out and up; the white crown is broken off above the red.
  {
    const K = 0.8; // how far it is tipped: the width of the head foreshortened
    const head = B.layer(56, 34);
    {
      const c = head.getContext('2d');
      c.save();
      // Upright (x, h) to the picture: h runs to the left, x runs up.
      c.setTransform(0, -K, -1, 0, 26 + 104, 17);
      paintHead(c, { stump: true, bold: true });
      // The old break at the neck, weathered: the end of the beard and the
      // nemes, a little shade, no fresh edge.
      wash(c, [[-16.4, 86.6], [16.4, 86.6], [16.4, 88.6], [-16.4, 88.6]], SHADOW, 0.16);
      c.restore();
      // Light in the picture: its top toward the sun, its underside on the ground.
      c.save();
      c.globalCompositeOperation = 'source-atop';
      const g = c.createLinearGradient(0, 2, 0, 32);
      g.addColorStop(0, B.alpha(SUN, 0.14));
      g.addColorStop(0.45, B.alpha(SUN, 0));
      g.addColorStop(0.75, B.alpha(SHADOW, 0));
      g.addColorStop(1, B.alpha(SHADOW, 0.3));
      c.fillStyle = g;
      c.fillRect(0, 0, 56, 34);
      c.restore();
      inkRound(head, 0.8);
    }
    // The torso: a chunk of the right shoulder and chest, the end of a nemes
    // lappet on it and the rows of the broad collar. Flat on the terrace.
    const torso = B.layer(30, 20);
    {
      const c = torso.getContext('2d');
      // Broken flat on the left, the shoulder's round on the right.
      const body = [[2, 17.6], [2.6, 11.6], [5.8, 9.2], [4.8, 6.6], [9.6, 4.4], [17.4, 3.6], [22.6, 4.4], [26, 7], [27.4, 11.2], [26.8, 17.6]];
      B.fill(c, body, STONE);
      wash(c, [[4.8, 6.6], [9.6, 4.4], [17.4, 3.6], [22.6, 4.4], [26, 7], [21, 8.4], [8.6, 8.8]], SUN, 0.44); // the upper face in the sun
      wash(c, [[2, 17.6], [2.6, 11.6], [5.8, 9.2], [8.2, 12], [7.6, 17.6]], SHADOW, 0.34); // the broken end, turned away
      wash(c, [[4.8, 6.6], [5.8, 9.2], [8.6, 8.8], [9.6, 4.4]], SHADOW, 0.16);
      wash(c, [[2, 17.6], [26.8, 17.6], [27, 15.6], [2.2, 15.6]], SHADOW, 0.22); // where it meets the ground
      c.save();
      B.path(c, body);
      c.clip();
      // The rows of the broad collar, round the neck that broke away at the left.
      for (const rad of [6.5, 9, 11.5]) {
        c.beginPath();
        c.arc(4, 3, rad, 0.2, 1.45);
        c.lineWidth = 0.9;
        c.strokeStyle = B.alpha(S.recess, 0.45);
        c.stroke();
      }
      // The lappet's striped end, lying on the shoulder.
      B.fill(c, [[19.6, 6.2], [23.6, 6.8], [24, 13.4], [21.8, 14.4], [19.4, 13.2]], lit(STONE, 0.1));
      for (let y = 8.2; y < 14; y += 2.1) line(c, 19.8, y, 23.8, y + 0.2, 0.7, B.alpha(S.recess, 0.4));
      wash(c, [[19.6, 6.2], [20.8, 6.4], [20.6, 13.8], [19.4, 13.2]], SHADOW, 0.22);
      c.restore();
      inkRound(torso, 0.7);
    }
    for (const [img, x, y] of [[torso, 92, 232], [head, 118, 219]]) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.drawImage(silhouette(img, SHADOW), x - 4, y + 2);
      ctx.restore();
      ctx.drawImage(img, x, y);
    }
  }

  // ---------------------------------------------------------------------------
  // 5. Ink round the facade.

  B.path(ctx, FACADE);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = B.alpha(INK, 0.5);
  ctx.stroke();
};
