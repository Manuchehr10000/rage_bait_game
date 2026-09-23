/**
 * Chapter 7 vignette: Sigiriya, the Lion Gate.
 *
 * Asset map-monument-ch07-monsoon, 92 x 70 world px, painted 368 x 280. The
 * view is the research's (specs/lion-paws.json): standing on the lion terrace
 * near its northern edge, on the line of the stair, looking south up the stair
 * and tilting up. The two brick-and-plaster forepaws sit left and right of the
 * steps, the fronts of a broken brick mass: each a crouched forepaw with three
 * domed toes, each toe with one thick plastered claw that hooks forward at us
 * and down onto the terrace. The stair climbs between them to the foot of the
 * sheer north cliff, which fills the width of the view and towers to a flat,
 * bare summit, leaving a wedge of brochure sky in each upper corner. Treetops
 * fringe the lower corners where the terrace drops away.
 *
 * Values: the rock is weathered reddish tan in a few tall planes, rockBody
 * turned cool on the left stepping to sunny rockLit on the right, with a few
 * pale spalls and dark run-off streaks; its foot, behind the paws, is in cool
 * shade. The paws are a different material: red brick (#b0603f) with pale lime
 * plaster patches, a step lighter than that shade and redder than the rock.
 *
 * Light: the set's upper right. Facing south that is the afternoon sun behind
 * the viewer's right shoulder, so the north fronts of the paws are lit and
 * their shadows fall to the left and a little toward us on the terrace.
 */
PAINTERS['lion-paws'] = function (ctx, W, H, B) {
  // The research palette, pushed a little sunnier.
  const S = {
    rockLit: '#b07e5c',
    rockBody: '#8e6a55',
    rockStreak: '#3d3531',
    rockSpall: '#cdb399',
    brick: '#b0603f',
    plaster: '#ddd3c0',
    step: '#9d9186',
    ground: '#a57a58',
  };
  const INK = B.C.ink;
  const SHADOW = B.C.shadow;
  const SUN = B.C.sun;

  // ---------------------------------------------------------------------------
  // Helpers (after the pilot).

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
  const inkRound = function (layer, alpha) {
    const m = silhouette(layer, INK);
    const d = B.layer(layer.width, layer.height);
    const dc = d.getContext('2d');
    for (const o of [[-1, 0], [1, 0], [0, -1], [0, 1]]) dc.drawImage(m, o[0], o[1]);
    const c = layer.getContext('2d');
    c.save();
    c.globalCompositeOperation = 'destination-over';
    c.globalAlpha = alpha;
    c.drawImage(d, 0, 0);
    c.restore();
  };
  const mirrorX = (pts) => pts.map((p) => [W - p[0], p[1]]).reverse();
  const flipX = (pts) => pts.map((p) => [-p[0], p[1]]).reverse();
  /** Paint the part of a shape that its own copy, moved by (dx, dy), leaves
   * bare: a crisp rim of light or shade along one side of a form. */
  const rim = function (c, pts, dx, dy, color) {
    const w = c.canvas.width;
    const h = c.canvas.height;
    c.save();
    B.path(c, pts);
    c.clip();
    c.beginPath();
    c.rect(-4, -4, w + 8, h + 8);
    pts.forEach((p, i) => (i ? c.lineTo(p[0] + dx, p[1] + dy) : c.moveTo(p[0] + dx, p[1] + dy)));
    c.closePath();
    c.clip('evenodd');
    c.fillStyle = color;
    c.fillRect(-4, -4, w + 8, h + 8);
    c.restore();
  };

  /** A rounded blob as a polygon: treetops. */
  const blob = function (x, y, rx, ry, rng, n) {
    const pts = [];
    const k = n || 20;
    for (let i = 0; i < k; i++) {
      const a = (i / k) * Math.PI * 2;
      const rr = 1 + (rng() - 0.5) * 0.1;
      pts.push([x + Math.cos(a) * rx * rr, y + Math.sin(a) * ry * rr]);
    }
    return pts;
  };

  // ---------------------------------------------------------------------------
  // Layout. The paws are about 3 m high and 3 m wide; at about 31 px a metre
  // that is some 100 px. The stair between them is about 2.2 m wide and climbs
  // on, narrowing into the distance, to the foot of the cliff.

  const TOPY = 12; // the summit line, with some 10 px of sky above it
  const BASE = 250; // where the outer toes and the first step meet the terrace
  const PX1 = 150; // the left paw's inner side, along the stair; the right paw mirrors it
  const STAIR_TOP = 132; // the last step visible, in the shade at the cliff's foot
  const xl = (y) => PX1 + (BASE - y) * 0.16;
  const xr = (y) => W - xl(y);

  // ---------------------------------------------------------------------------
  // 1. The shared sky, cloudless over the summit. Only the upper corners show.

  B.sky(ctx, W, 140);

  // ---------------------------------------------------------------------------
  // 2. The north cliff: a sheer bare face with a flat, cut-off top. Close under
  // it, it fills the width of the view; tilting up, it narrows toward the top,
  // so sky shows only as a wedge in each upper corner. On the right its sunlit
  // shoulder leans out a little over an undercut.

  const EDGE_L = [
    [0, 132], [8, 110], [16, 88], [25, 66], [34, 48], [43, 33], [51, 22], [57, 15.6], [63, TOPY + 0.6],
  ];
  const EDGE_R = [
    [304, TOPY + 0.6], [313, 14.4], [321, 20], [326, 30], [327, 40], [323, 50], [320, 60], [325, 74], [334, 88],
    [345, 104], [356, 118], [368, 130],
  ];
  const SUMMIT = [];
  {
    const r = B.rng(707);
    for (let x = 70; x < 304; x += 20 + r() * 16) SUMMIT.push([x, TOPY - 0.4 + r() * 1.0]);
  }
  const CLIFF_FACE = EDGE_L.concat(SUMMIT, EDGE_R);
  const CLIFF = CLIFF_FACE.concat([[368, 280], [0, 280]]);

  // Weathered warm reddish grey: the research's rockLit and rockBody. The face
  // is lit obliquely from the upper right, so it runs from rockLit, a touch
  // sunnier, on the right to rockBody turned cool on the left: one calm wash.
  const BODY = mixh(S.rockLit, S.rockBody, 0.4);
  const COOL = shd(lit(S.rockBody, 0.12), 0.14);
  const WARM = lit(S.rockLit, 0.24);
  const FOOT_SHADE = shd(S.rockBody, 0.28);
  // The face in a few tall planes, each a step warmer toward the sun: crisp
  // flat shapes rather than a smooth ramp, so they stay calm when indexed.
  const PLANE = [COOL, mixh(S.rockBody, S.rockLit, 0.45), S.rockLit, lit(S.rockLit, 0.12), WARM];
  const EDGES = [
    [[74, 0], [78, 60], [72, 130], [76, 200]],
    [[150, 0], [146, 70], [152, 130], [148, 200]],
    [[232, 0], [236, 60], [230, 130], [234, 200]],
    [[290, 0], [286, 40], [282, 80], [286, 124], [282, 200]],
  ];
  B.fill(ctx, CLIFF, PLANE[0]);
  const planeAt = function (x) {
    let k = 0;
    for (const e of EDGES) if (x > e[0][0]) k++;
    return PLANE[k];
  };
  B.clip(ctx, CLIFF, function () {
    EDGES.forEach((e, i) => B.fill(ctx, e.concat([[W + 4, 200], [W + 4, 0]]), PLANE[i + 1]));
    // The shade under the west shoulder's overhang: one crisp wedge.
    B.fill(ctx, [[327, 40], [323, 50], [320, 60], [321, 68], [314, 62], [310, 52], [314, 44]], mixh(WARM, SHADOW, 0.32));

    // A few pale spalls, where the weathered skin has flaked off in sheets:
    // tall angular patches a step paler than the face round them, with the
    // broken skin's edge casting a thin shade line across their upper left.
    const spall = function (pts) {
      const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
      const base = planeAt(cx);
      B.fill(ctx, pts, mixh(base, S.rockSpall, 0.6));
      rim(ctx, pts, 1.6, 2, B.alpha(S.rockStreak, 0.4));
    };
    spall([[262, 54], [276, 50], [282, 62], [280, 84], [268, 90], [260, 76]]);
    spall([[180, 90], [192, 88], [197, 102], [189, 114], [178, 107]]);
    spall([[86, 50], [96, 48], [101, 64], [95, 78], [86, 71]]);
    // The capstone's lip, lit, and the shade band under it: one crisp shape
    // with a ragged lower edge.
    B.fill(ctx, [[44, TOPY - 3]].concat(SUMMIT, [[330, TOPY - 3], [334, TOPY + 3.4], [44, TOPY + 3.4]]), lit(BODY, 0.4));
    {
      const r = B.rng(88);
      const band = [[40, TOPY + 3.4], [336, TOPY + 3.4]];
      for (let x = 330; x > 42; x -= 14 + r() * 16) band.push([x, TOPY + 6.5 + r() * 4]);
      B.fill(ctx, band, B.alpha(shd(BODY, 0.36), 0.75));
    }

    // Black run-off streaks: a few long, ragged bands of stain hanging from
    // the lip, darkest at the top and a step lighter as they run down, with
    // blunt, torn ends.
    const streak = function (x, y0, len, w, a, seed) {
      const r = B.rng(seed);
      const L = [];
      const R = [];
      const n = 7;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const half = (w / 2) * (1 - t * 0.3) * (0.82 + r() * 0.36);
        const y = y0 + len * t;
        L.push([x - half + (r() - 0.5) * 2.4, y + (i === n ? -len * (0.06 + r() * 0.08) : 0)]);
        R.push([x + half + (r() - 0.5) * 2.4, y + (i === n ? -len * r() * 0.05 : 0)]);
      }
      const tail = [[x + w * 0.12, y0 + len * 0.97]];
      const pts = L.concat(tail, R.reverse());
      B.fill(ctx, pts, B.alpha(S.rockStreak, a * 0.6));
      B.clip(ctx, pts, function () {
        B.fill(ctx, [[x - w, y0 - 4], [x + w, y0 - 4], [x + w, y0 + len * 0.46], [x - w, y0 + len * 0.54]], B.alpha(S.rockStreak, a * 0.35));
      });
    };
    for (const [x, y, l, w, a, s] of [
      [74, 16, 100, 12, 0.6, 1], [122, 17, 88, 11, 0.58, 2], [232, 16, 118, 14, 0.62, 6], [306, 20, 92, 11, 0.56, 8],
    ]) streak(x, y, l, w, a, s);

    // The cliff's foot, undercut and in deep cool shade behind the paws: a
    // lit lip, then one calm dark band, so the paws' lit tops stand out.
    const r = B.rng(512);
    const foot = [];
    for (let x = 0; x <= W; x += 22 + r() * 18) foot.push([x, 136 + Math.sin(x * 0.03) * 4 + r() * 3]);
    foot.push([W, 138]);
    B.fill(ctx, foot.map((p) => [p[0], p[1] - 2.6]).concat([[W, 240], [0, 240]]), lit(BODY, 0.3));
    B.fill(ctx, foot.concat([[W, 240], [0, 240]]), FOOT_SHADE);
  });
  // Ink along the cliff's skyline.
  ctx.beginPath();
  CLIFF_FACE.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.lineWidth = 1.4;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = B.alpha(INK, 0.6);
  ctx.stroke();

  // ---------------------------------------------------------------------------
  // 3. Treetops of the dry-zone forest at the lower corners, beyond and below
  // the terrace edge, against the shaded foot of the rock: a few large calm
  // masses, shade on the left, one lit crown on the right of each.

  const treetop = function (x, y, rx, ry, seed) {
    const r = B.rng(seed);
    B.fill(ctx, blob(x, y, rx, ry, r), B.C.foliageDark);
    B.fill(ctx, blob(x + rx * 0.16, y - ry * 0.1, rx * 0.82, ry * 0.8, r), B.C.foliage);
    B.fill(ctx, blob(x + rx * 0.36, y - ry * 0.34, rx * 0.44, ry * 0.38, r), lit(B.C.foliage, 0.3));
  };
  for (const [x, y, rx, ry, s] of [[8, 186, 20, 20, 1], [40, 212, 18, 14, 2], [14, 236, 30, 22, 3]]) treetop(x, y, rx, ry, s);
  for (const [x, y, rx, ry, s] of [[360, 192, 22, 17, 6], [330, 214, 18, 13, 7], [356, 238, 30, 22, 8]]) treetop(x, y, rx, ry, s);

  // ---------------------------------------------------------------------------
  // 4. The terrace: reddish dry-zone earth, edged with brick, running into the
  // picture, darker toward us, crossed at our feet by a band of brick paving.

  const FLOOR = [[0, 262], [48, 204], [320, 204], [368, 262], [368, 280], [0, 280]];
  {
    const g = ctx.createLinearGradient(0, 204, 0, H);
    g.addColorStop(0, S.ground);
    g.addColorStop(1, shd(S.ground, 0.16));
    B.fill(ctx, FLOOR, g);
    for (const side of [-1, 1]) {
      const E = [[20, 238], [48, 204], [49.4, 206], [22, 239]];
      B.fill(ctx, side < 0 ? E : mirrorX(E), mixh(S.ground, S.brick, 0.45));
    }
    // A paved strip runs from the stair's foot toward us.
    B.fill(ctx, [[xl(BASE) - 2, BASE], [xr(BASE) + 2, BASE], [xr(BASE) + 14, 280], [xl(BASE) - 14, 280]], B.alpha(mixh(S.ground, S.brick, 0.3), 0.4));
    // The brick band across the foreground, in the paws' side of the light.
    B.fill(ctx, [[0, 268], [W, 268], [W, 280], [0, 280]], shd(S.brick, 0.28));
    B.fill(ctx, [[0, 268], [W, 268], [W, 269.8], [0, 269.8]], mixh(shd(S.brick, 0.28), SUN, 0.14));
  }
  for (const [x, y, rx, ry, s] of [[14, 236, 30, 22, 3]]) treetop(x, y, rx, ry, s);
  for (const [x, y, rx, ry, s] of [[356, 238, 30, 22, 8]]) treetop(x, y, rx, ry, s);

  // ---------------------------------------------------------------------------
  // 5. The surviving brick mass behind the paws, round the upper steps: low,
  // broken, rising a little behind the paw tops.

  const MASS = [
    [70, 214], [70, 168], [80, 162], [88, 158], [100, 158], [108, 153], [120, 154], [128, 149], [140, 150],
    [148, 145], [156, 140], [162, 136], [xl(137), 137], [xl(214), 214],
  ];
  const MASS_BRICK = shd(S.brick, 0.26);
  for (const side of [-1, 1]) {
    const P = side < 0 ? (pts) => pts : mirrorX;
    const pts = P(MASS);
    B.fill(ctx, pts, MASS_BRICK);
    B.clip(ctx, pts, function () {
      for (const y of [152, 162, 172]) wash(ctx, P([[40, y], [200, y], [200, y + 1.4], [40, y + 1.4]]), SHADOW, 0.18);
      const top = MASS.slice(1, MASS.length - 1);
      const lip = top.concat(top.map((p) => [p[0] + 0.6, p[1] + 3.6]).reverse());
      B.fill(ctx, P(lip), lit(S.brick, 0.34));
      const inner = [[xl(137) - 7, 142], [xl(137), 137], [xl(214), 214], [xl(214) - 7, 214]];
      B.fill(ctx, P(inner), side < 0 ? lit(S.brick, 0.26) : shd(S.brick, 0.42));
    });
    B.outline(ctx, pts, 1.2);
  }

  // ---------------------------------------------------------------------------
  // 6. The stair between the paws, climbing away to the cliff's foot: warm
  // stone, the treads lit toward the sun, the risers a step darker, ending
  // against a dark line at the shaded foot of the rock.

  const STAIR = [[xl(BASE), BASE], [xl(STAIR_TOP), STAIR_TOP], [xr(STAIR_TOP), STAIR_TOP], [xr(BASE), BASE]];
  const STEP = lit(mixh(S.step, S.brick, 0.28), 0.12);
  {
    const n = 10;
    const q = 0.92;
    let h = ((BASE - STAIR_TOP) * (1 - q)) / (1 - Math.pow(q, n));
    let y = BASE;
    for (let i = 0; i < n; i++) {
      const y1 = y - h;
      const k = Math.max(0, Math.min(1, (200 - y1) / (200 - STAIR_TOP)));
      const riser = [[xl(y), y], [xl(y1), y1], [xr(y1), y1], [xr(y), y]];
      B.fill(ctx, riser, mixh(mixh(STEP, S.brick, 0.22), FOOT_SHADE, 0.12 + 0.3 * k));
      const t = Math.max(1.8, h * 0.36);
      B.fill(ctx, [[xl(y1), y1], [xr(y1), y1], [xr(y1 + t), y1 + t], [xl(y1 + t), y1 + t]], mixh(lit(STEP, 0.46), FOOT_SHADE, 0.2 * k));
      const s = Math.max(1, h * 0.12);
      B.fill(ctx, [[xl(y1 + t), y1 + t], [xr(y1 + t), y1 + t], [xr(y1 + t + s), y1 + t + s], [xl(y1 + t + s), y1 + t + s]], mixh(shd(STEP, 0.34), FOOT_SHADE, 0.3 * k));
      y = y1;
      h *= q;
    }
    B.clip(ctx, STAIR, function () {
      // The right paw's inner face throws its shadow across the right of the
      // flight, to the left.
      B.fill(ctx, [[xr(BASE) + 1, BASE], [xr(BASE) - 14, BASE], [xr(206) - 10, 206], [xr(206) + 1, 206]], B.alpha(SHADOW, 0.32));
    });
    B.fill(ctx, [[xl(STAIR_TOP) - 2, STAIR_TOP - 1], [xr(STAIR_TOP) + 2, STAIR_TOP - 1], [xr(STAIR_TOP) + 2, STAIR_TOP + 1.6], [xl(STAIR_TOP) - 2, STAIR_TOP + 1.6]], B.alpha(INK, 0.7));
  }

  // ---------------------------------------------------------------------------
  // 7. The toe, drawn once per side and stamped three times on it (the claw
  // is mirrored between the paws, the light is not): a domed brick digit whose
  // upper surface takes the sun, and one thick plastered claw that leaves its
  // lower front, hooks forward at us and down, and rests its tip on the
  // terrace in front of the toe. The claw leans outward from the stair on
  // each side, as we see it a little from the stair's line.

  const TW = 54;
  const TH = 70;
  const OX = 27; // the toe's centre in the stamp
  const OY = 50; // the toe's floor line in the stamp
  const LOBE = [
    [-18.6, 1], [-19.6, -14], [-19, -24], [-16.4, -31], [-12, -36.4], [-6, -39.4], [0, -40.4], [6, -39.4], [12, -36.4],
    [16.4, -31], [19, -24], [19.6, -14], [18.6, 1],
  ];
  // The claw for the right-hand (mirrored: left-hand) paw: broad at the root,
  // its back arching forward and down, its tip on the floor.
  const CLAW_R = [
    [-9.6, -14], [-7.6, -19.4], [-3, -22.4], [2.4, -22.2], [7, -19.6], [10.6, -14.6], [13, -8.6], [14, -2.4],
    [13.4, 3], [11.6, 7.4], [9, 10.4], [7.6, 9], [7, 5], [5.4, 0.4], [2.6, -3.8], [-1.6, -7.6], [-6, -10.6],
  ];
  // Its foreshortened back, seen from above: the lit top.
  const BACK_R = [[-7.6, -19.4], [-3, -22.4], [2.4, -22.2], [7, -19.6], [10.6, -14.6], [12, -11], [5, -12.6], [-1, -13.4], [-6, -14.6]];
  const TIP_R = [9, 10.4];
  const makeToe = function (side) {
    // side 1: the claw hooks to the right (the right paw); -1: to the left.
    const F = side > 0 ? (pts) => pts : flipX;
    const at = (pts) => pts.map((p) => [p[0] + OX, p[1] + OY]);
    const t = B.layer(TW, TH);
    const c = t.getContext('2d');
    const lobe = at(LOBE);
    // The digit: fired brick, its domed top catching the sun, its right
    // side turned into the light, its left side away into the cool.
    B.fill(c, lobe, S.brick);
    B.clip(c, lobe, function () {
      B.fill(c, at([[-22, -44], [22, -44], [22, -25], [12, -27.6], [0, -28.6], [-12, -27.6], [-22, -25]]), lit(S.brick, 0.2));
      // The right rim in the sun, the left rim in the cool.
      rim(c, lobe, -4, 1, B.alpha(SUN, 0.34));
      rim(c, lobe, 6, 0, B.alpha(SHADOW, 0.4));
      // The dome's highlight, upper right, where it faces the sun squarely.
      B.fill(c, at([[1, -37.6], [7, -39.4], [12.6, -36.6], [16.4, -31], [17, -27.6], [11, -29.4], [5, -32.4]]), lit(S.brick, 0.5));
      // The front rolls under into shade at the floor.
      B.fill(c, at([[-22, -6], [22, -6], [22, 4], [-22, 4]]), B.alpha(SHADOW, 0.26));
      // The claw stands out from the toe, so it throws its shadow onto the
      // toe's front, to the left and a little down.
      B.fill(c, at(F(CLAW_R)).map((p) => [p[0] - 4.2, p[1] + 1.8]), B.alpha(SHADOW, 0.5));
    });
    // The claw: lime plaster over brick, worn back to brick at the tip. Lit
    // from the upper right whichever way it hooks: its right edge warm, its
    // left edge cool.
    const claw = at(F(CLAW_R));
    B.fill(c, claw, S.plaster);
    B.clip(c, claw, function () {
      // Worn to brick at the tip.
      B.fill(c, at(F([[5, 3], [16, -1], [16, 14], [5, 14]])), S.brick);
      rim(c, claw, -3, 0.6, B.alpha(SUN, 0.62));
      rim(c, claw, 4, 0, mixh(mixh(S.plaster, SHADOW, 0.3), S.brick, 0.12));
    });
    // Its back, foreshortened toward us, faces up and takes the sun.
    B.fill(c, at(F(BACK_R)), lit(S.plaster, 0.55));
    B.clip(c, at(F(BACK_R)), function () {
      rim(c, at(F(BACK_R)), 3, 0, B.alpha(SHADOW, 0.18));
    });
    inkRound(t, 0.95);
    return t;
  };
  const TOE = { '-1': makeToe(-1), '1': makeToe(1) };

  // ---------------------------------------------------------------------------
  // 8. The paws: crouched forepaws, the brick mass of each broken off above
  // the wrist. The wrist rises behind, next to the stair, in courses of
  // brick; in front of it the top of the foot slopes down and out to the
  // toes, catching the light.

  const TOP_EDGE = [
    [46, 236], [46.6, 214], [49, 205], [54, 197], [61, 191], [70, 187], [76, 184], [80, 180], [86, 176.4], [94, 172],
    [102, 171.4], [108, 173], [114, 168.4], [121, 167.6], [122.6, 161], [126, 156], [131, 152], [138, 150],
    [144, 149.4], [PX1, 150],
  ];
  const PAW = TOP_EDGE.concat([[PX1, 236]]);
  const WRIST_TOP = TOP_EDGE.slice(6);
  // The front of the wrist: the broken brick stump, down to where the foot
  // begins.
  const WRIST = WRIST_TOP.concat([[PX1, 197], [110, 195.4], [86, 193], [78, 189], [75, 185]]);
  const STUMP_SIDE = [[121, 167.6], [122.6, 161], [126, 156], [131, 152], [133, 157], [129, 163], [127.6, 170]];
  const FLANK = [[PX1, 150], [PX1 + 6, 147], [PX1 + 6, 236], [PX1, 236]];
  // The toes: the middle one stands a little forward (lower on the terrace),
  // drawn last. The same stamp each time.
  const TOES = [[66, 0], [132, 0], [99, 4]]; // x, drop; drawn back to front
  const clawTip = (side, tx, drop) => {
    const x = side < 0 ? tx : W - tx;
    return [x + side * TIP_R[0], BASE + drop + TIP_R[1]];
  };

  const paint = function (side) {
    const layer = B.layer(W, H);
    const c = layer.getContext('2d');
    const P = side < 0 ? (pts) => pts : mirrorX;
    const face = P(PAW);
    // Behind the toes, the deep clefts between them.
    B.fill(c, P([[48, BASE + 2], [48, 214], [PX1 + 2, 214], [PX1 + 2, BASE + 2]]), mixh(shd(S.brick, 0.6), INK, 0.3));
    // The top of the foot, sloping down to the toes: it faces up, so it is
    // the warm lit plane of the paw.
    B.fill(c, face, lit(S.brick, 0.1));
    B.clip(c, face, function () {
      // The outer flank of the foot: on the left paw it turns from the sun,
      // on the right paw into it.
      if (side < 0) {
        B.fill(c, [[40, 200], [52, 194], [58, 192], [58, 204], [57, 240], [40, 240]], shd(S.brick, 0.34));
      } else {
        B.fill(c, mirrorX([[40, 200], [52, 194], [58, 192], [58, 204], [57, 240], [40, 240]]), lit(S.brick, 0.26));
      }
      // Surviving lime plaster over the top of the foot: a few crisp, pale
      // patches, the brick showing red between them.
      const PL = lit(S.plaster, 0.12);
      B.fill(c, P([[62, 198], [68, 192.6], [76, 190], [86, 194.6], [100, 196.4], [110, 199.4], [104, 203.4], [90, 204], [78, 200.6], [68, 203]]), PL);
      // A shallow cool dip down the middle of the foot where the toes part.
      wash(c, P([[74, 214], [84, 199], [90, 199], [86, 214]]), SHADOW, 0.16);
      wash(c, P([[108, 214], [114, 200], [120, 200], [118, 214]]), SHADOW, 0.16);
      // The wrist: the broken stump of the leg, its front facing us in a
      // softer light than the upward-facing foot, in courses of brick.
      const wrist = P(WRIST);
      B.fill(c, wrist, mixh(S.brick, SHADOW, 0.1));
      B.clip(c, wrist, function () {
        for (const y of [180, 187]) wash(c, P([[40, y], [PX1 + 2, y], [PX1 + 2, y + 1.4], [40, y + 1.4]]), SHADOW, 0.2);
        // The broken top: a lit plane all along the ragged edge, with a
        // shade line under it.
        B.fill(c, P(WRIST_TOP.concat(WRIST_TOP.map((p) => [p[0] + 0.6, p[1] + 7]).reverse())), B.alpha(SHADOW, 0.22));
        B.fill(c, P(WRIST_TOP.concat(WRIST_TOP.map((p) => [p[0] + 0.4, p[1] + 5]).reverse())), lit(S.brick, 0.3));
        // A plaster patch left on the stump's face.
        B.fill(c, P([[90, 181], [100, 179.6], [106, 183], [102, 188], [92, 187.6]]), mixh(S.plaster, SHADOW, 0.08));
        wash(c, P(STUMP_SIDE), SHADOW, side < 0 ? 0.3 : 0.14);
      });
      // The wrist's foot, where the leg meets the top of the foot: a thin
      // shade line.
      wash(c, P([[76, 186], [86, 193], [110, 195.4], [PX1, 197], [PX1, 199.4], [110, 197.8], [85, 195.4], [74, 188.6]]), SHADOW, 0.3);
    });
    // The inner face along the stair: the left paw's turns to the sun, the
    // right paw's away from it.
    B.fill(c, P(FLANK), side < 0 ? lit(S.brick, 0.22) : shd(S.brick, 0.42));
    // The clefts between the toes, deep and cool, opening a little way up
    // into the top of the foot.
    for (const cx of [82.5, 115.5]) {
      B.fill(c, P([[cx - 5, 205], [cx - 1.6, 202.4], [cx + 1.6, 202.4], [cx + 5, 205], [cx + 2, BASE], [cx - 2, BASE]]), mixh(shd(S.brick, 0.56), INK, 0.26));
    }
    // The toes.
    for (const [tx, drop] of TOES) {
      const x = side < 0 ? tx : W - tx;
      c.drawImage(TOE[side], Math.round(x - OX), Math.round(BASE + drop - OY));
    }
    return layer;
  };
  const pawL = paint(-1);
  const pawR = paint(1);
  inkRound(pawL, 1);
  inkRound(pawR, 1);

  // Their shadows on the terrace, falling to the left and a little toward
  // us: a cool band spilling out from each paw's foot.
  ctx.save();
  B.path(ctx, FLOOR);
  ctx.clip();
  for (const side of [-1, 1]) {
    const Q = side < 0 ? [[48, 244], [PX1, 244], [PX1 - 10, 257], [60, 262], [26, 263], [30, 252]] :
      [[W - PX1, 244], [W - 48, 244], [W - 60, 262], [W - PX1 - 20, 263], [W - PX1 - 20, 252]];
    B.fill(ctx, Q, B.alpha(SHADOW, 0.34));
  }
  // Each claw's shadow joins its tip to the floor and runs off down-left.
  for (const side of [-1, 1]) {
    for (const [tx, drop] of TOES) {
      const [x, y] = clawTip(side, tx, drop);
      const s = side > 0 ? 0 : 1; // how far the claw's body reaches right of the tip
      B.fill(ctx, [[x + 1 + s * 2, y - 4], [x + 1, y + 0.6], [x - 6, y + 3.4], [x - 17, y + 3.6], [x - 16, y + 0.4], [x - 6 - s * 6, y - 3.4]], B.alpha(SHADOW, 0.46));
    }
  }
  ctx.restore();

  ctx.drawImage(pawL, 0, 0);
  ctx.drawImage(pawR, 0, 0);
};
