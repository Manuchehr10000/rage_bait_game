/**
 * Chapter 5 vignette: the Doric temple at Segesta, from the south-east.
 *
 * Asset map-monument-ch05-classical, 92 x 70 world px, painted 368 x 280. The
 * view is the one in specs/doric-temple.json: from a rise to the south-east,
 * the eye a little below the top of the steps, looking west-north-west. The
 * east front is on the right in full sun with its pediment the highest point;
 * the south flank runs away to the left in half-shade with its fourteen
 * columns; the west gable stands on its own at the far left end with sky
 * between the two gables, because there is no roof. There is no cella, so the
 * far colonnades and the hills show through every gap.
 *
 * The building is set out in metres and put through one perspective camera,
 * so the counts and the spacings are the building's, not guesses: 6 by 14
 * columns, 11 triglyphs on the front, 27 on each flank.
 *
 * Built the way the pilot (abu-simbel.js) is built:
 *   1. the shared sky and clouds;
 *   2. the setting: far ridge, the valley slope, the hilltop, big shapes;
 *   3. the temple on its own layer, back to front: far colonnades, the inside
 *      faces of the far entablature and the back of the west gable, the near
 *      colonnades, the near entablature and the east pediment, the steps with
 *      their lifting bosses, the column shadows on the steps;
 *   4. the temple's shadow on the ground, then the temple, inked round;
 *   5. scrub in the foreground.
 * Every column, near or far, is drawn by the one column brush below: the same
 * shape and the same light at every size the perspective asks for.
 */
PAINTERS['doric-temple'] = function (ctx, W, H, B) {
  // The research palette, a little sunnier than life.
  const S = {
    sun: '#dcb679', // limestone on a face turned to the sun
    body: '#c29a5f', // general mid-tone of shafts and steps
    patina: '#a39883', // grey-buff weathering
    streak: '#6f5a41', // joints, the line under the cornice, under each boss
    grass: '#a3a45a', // hill grass, late spring
    dry: '#cdb36e', // dried grass and stubble
    earth: '#9c7550', // bare ground at the foot of the steps
    far: '#8e9f8a', // the hills beyond the valley
  };
  const INK = B.C.ink;
  const SHADOW = B.C.shadow;
  const SUN = B.C.sun;

  // ---------------------------------------------------------------------------
  // Helpers (as in the pilot). mixh returns hex so it can be chained.

  const mixh = function (a, b, t) {
    const x = B.hex(a);
    const y = B.hex(b);
    let s = '#';
    for (let i = 0; i < 3; i++) s += Math.round(x[i] + (y[i] - x[i]) * t).toString(16).padStart(2, '0');
    return s;
  };
  const lit = (h, t) => mixh(h, SUN, t);
  const shd = (h, t) => mixh(h, SHADOW, t);

  const silhouette = function (layer, color) {
    const m = B.layer(layer.width, layer.height);
    const mc = m.getContext('2d');
    mc.drawImage(layer, 0, 0);
    mc.globalCompositeOperation = 'source-in';
    mc.fillStyle = color;
    mc.fillRect(0, 0, m.width, m.height);
    return m;
  };

  /** An ink line round everything on a layer, one pixel outside it. */
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

  const line = function (c, x0, y0, x1, y1, w, style) {
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x1, y1);
    c.lineWidth = w;
    c.lineCap = 'butt';
    c.strokeStyle = style;
    c.stroke();
  };

  /** A closed shape through points with smooth (quadratic) joins. */
  const smooth = function (c, pts, style) {
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2;
      const my = (pts[i][1] + pts[i + 1][1]) / 2;
      c.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    const l = pts[pts.length - 1];
    c.lineTo(l[0], l[1]);
    c.closePath();
    c.fillStyle = style;
    c.fill();
  };

  // ---------------------------------------------------------------------------
  // The building, in metres. X runs east, Y north, Z up. The stylobate is
  // X -58..0 by Y 0..23; the east front is the X = 0 face, the south flank the
  // Y = 0 face.

  const LEN = 58;
  const WID = 23;
  const NSTEP = 4; // unverified in the research: see the asset note
  const RISE = 0.55; // step risers, a little generous so the bosses fit
  const TREAD = 0.55;
  const K = NSTEP * RISE; // top of the stylobate
  const INSET = 1.3; // column axis in from the stylobate edge
  const COLH = 9.4; // column, capital included
  const CAPH = 0.95; // echinus and abacus
  const DLO = 1.95; // lower diameter
  const DUP = 1.5; // upper diameter
  const ABA = 2.25; // side of the square abacus
  const ARCH = 1.6; // architrave
  const FRZ = 1.5; // frieze
  const CORN = 0.6; // cornice
  const PED = 2.9; // pediment rise above the cornice, to the apex
  const FACE = INSET - 1.1; // architrave and frieze face, in from the edge
  const PROJ = 0.35; // cornice projects beyond the edge
  const ZA = K + COLH; // architrave soffit
  const ZF = ZA + ARCH; // frieze bottom
  const ZC = ZF + FRZ; // cornice bottom
  const ZT = ZC + CORN; // top of the entablature

  // The camera: from the south-east, 35 degrees off the east front's axis.
  const ANG = (35 * Math.PI) / 180;
  const dir = [-Math.cos(ANG), Math.sin(ANG)]; // looking WNW
  const right = [Math.sin(ANG), Math.cos(ANG)];
  const DIST = 260;
  const CAM = [-LEN / 2 - dir[0] * DIST, WID / 2 - dir[1] * DIST];
  const EYE = K - 0.45; // a little below the top of the steps

  const raw = function (X, Y, Z) {
    const px = X - CAM[0];
    const py = Y - CAM[1];
    const dep = px * dir[0] + py * dir[1];
    return [(px * right[0] + py * right[1]) / dep, -(Z - EYE) / dep, dep];
  };
  // Fit: the temple across ~76% of the plate, eye level low.
  const HZ = 194; // the horizon (eye level) on the plate
  const xl = raw(-LEN - NSTEP * TREAD, -NSTEP * TREAD, 0)[0];
  const xr = raw(NSTEP * TREAD, WID + NSTEP * TREAD, 0)[0];
  const F = 312 / (xr - xl);
  const OX = 184 - ((xl + xr) / 2) * F;
  const P = function (X, Y, Z) {
    const r = raw(X, Y, Z);
    return [OX + r[0] * F, HZ + r[1] * F];
  };
  const scaleAt = (X, Y) => F / raw(X, Y, 0)[2];

  // Column axes, all 36, each tagged with the row it stands in.
  const cols = [];
  const fx = [];
  for (let i = 0; i < 14; i++) fx.push(-INSET - (i * (LEN - 2 * INSET)) / 13);
  const fy = [];
  for (let i = 0; i < 6; i++) fy.push(INSET + (i * (WID - 2 * INSET)) / 5);
  for (let i = 0; i < 14; i++) {
    cols.push({ X: fx[i], Y: fy[0], near: true });
    cols.push({ X: fx[i], Y: fy[5], near: i === 0 }); // the NE corner is on the lit front
  }
  for (let j = 1; j < 5; j++) {
    cols.push({ X: fx[0], Y: fy[j], near: true });
    cols.push({ X: fx[13], Y: fy[j], near: false });
  }

  // ---------------------------------------------------------------------------
  // 1. The shared sky. Its gradient is run down past the horizon so the sky
  // behind the entablature and the gables stays a clear blue, a value step
  // away from the sunlit stone.

  B.sky(ctx, W, 250);
  ctx.fillStyle = shd(S.grass, 0.2); // under everything low, so no edge is left bare
  ctx.fillRect(0, 230, W, H - 230);
  B.cloud(ctx, 62, 44, 30, 11);
  B.cloud(ctx, 300, 30, 24, 23);

  // ---------------------------------------------------------------------------
  // 2. The setting. A pale far ridge on the horizon, the valley slope on the
  // left where the hill falls away, then the temple's own rounded hilltop.

  const FAR = mixh(S.far, B.C.skyLow, 0.42);
  const h = (dy) => HZ + dy; // setting heights are given from the horizon
  smooth(ctx, [[0, h(8)], [0, h(-30)], [40, h(-39)], [96, h(-33)], [150, h(-42)], [214, h(-36)], [262, h(-46)], [318, h(-40)], [368, h(-48)], [368, h(8)]], FAR);
  // One nearer fold of the far hills, a little stronger.
  smooth(ctx, [[0, h(8)], [0, h(-18)], [60, h(-26)], [120, h(-20)], [190, h(-24)], [250, h(-19)], [300, h(-28)], [368, h(-23)], [368, h(8)]], mixh(S.far, B.C.skyLow, 0.18));
  // The valley side, falling away to the left beyond the hill's shoulder.
  smooth(ctx, [[0, h(50)], [0, h(-8)], [26, h(-11)], [60, h(-7)], [96, h(-2)], [120, h(4)], [120, h(50)]], mixh(B.C.foliage, S.far, 0.5));

  // The hilltop: its brow runs level behind the temple and rolls down to the
  // frame on the left, into the valley.
  const hillTop = [[0, H], [0, h(30)], [14, h(24)], [34, h(15)], [56, h(7)], [84, h(2.5)], [130, h(0.5)], [220, h(0)], [300, h(0.5)], [340, h(1)], [368, h(2)], [368, H]];
  // Flat, not a gradient: a few inks, as a brochure was printed.
  smooth(ctx, hillTop, lit(S.grass, 0.04));
  // Large calm patches: straw in the sun on the right, and the near slope
  // turning away from the light along the bottom of the plate.
  ctx.save();
  B.path(ctx, hillTop);
  ctx.clip();
  smooth(ctx, [[196, h(24)], [240, h(18)], [300, h(17)], [352, h(21)], [368, h(26)], [344, h(33)], [276, h(34)], [220, h(31)]], B.alpha(S.dry, 0.6));
  // The near slope, rolling down toward the viewer and to the left.
  smooth(ctx, [[0, h(34)], [40, h(38)], [110, h(50)], [190, h(56)], [270, h(54)], [330, h(46)], [368, h(40)], [368, H], [0, H]], shd(S.grass, 0.22));
  smooth(ctx, [[0, h(48)], [60, h(54)], [140, h(66)], [230, h(74)], [368, h(70)], [368, H], [0, H]], shd(S.grass, 0.34));
  ctx.restore();

  // ---------------------------------------------------------------------------
  // 3. The temple, on its own layer so it can be inked round as one.

  // The far colonnades have a layer of their own, inked lightly, so the near
  // columns' ink separates them from what shows through their gaps.
  const T = B.layer(W, H);
  const TF = B.layer(W, H);
  let t = TF.getContext('2d');

  const STONE_SUN = lit(S.sun, 0.18); // the east faces
  const STONE_HALF = shd(mixh(S.body, S.patina, 0.25), 0.3); // the south faces
  const quad = (a, b, c, d) => [a, b, c, d];

  /**
   * The one column: an unfluted shaft with no base, a flared echinus and a
   * square abacus, lit from the right. (x, yb) is the foot of the axis, s is
   * pixels per metre there, `far` pales it a little with distance.
   */
  const column = function (c, x, yb, s, base) {
    const hs = (COLH - CAPH) * s;
    const yTop = yb - hs;
    const lo = (DLO * s) / 2;
    const up = (DUP * s) / 2;
    // Shaft: smooth, tapering, round, no grooves and no base. Modelled in four
    // flat bands, shadow side on the left, sun on the right.
    const bands = [
      [0, 0.2, shd(base, 0.42)],
      [0.2, 0.46, shd(base, 0.16)],
      [0.46, 0.84, lit(base, 0.36)],
      [0.84, 1, lit(base, 0.18)],
    ];
    for (const [u0, u1, tone] of bands) {
      B.fill(c, [
        [x - lo + 2 * lo * u0, yb + 0.5], [x - up + 2 * up * u0, yTop],
        [x - up + 2 * up * u1, yTop], [x - lo + 2 * lo * u1, yb + 0.5],
      ], tone);
    }
    // Echinus: a cushion flaring from the shaft top to the abacus, two tones.
    const eh = 0.5 * s;
    const ew = ((ABA * 0.92) / 2) * s;
    const cushion = function (from, to, tone) {
      c.save();
      c.beginPath();
      c.rect(x - ew - 1 + (2 * ew + 2) * from, yTop - eh - 1, (2 * ew + 2) * (to - from), eh + 3);
      c.clip();
      c.beginPath();
      c.moveTo(x - up, yTop + 0.3);
      c.quadraticCurveTo(x - up - 0.1 * s, yTop - eh * 0.55, x - ew, yTop - eh);
      c.lineTo(x + ew, yTop - eh);
      c.quadraticCurveTo(x + up + 0.1 * s, yTop - eh * 0.55, x + up, yTop + 0.3);
      c.closePath();
      c.fillStyle = tone;
      c.fill();
      c.restore();
    };
    cushion(0, 0.4, shd(base, 0.34));
    cushion(0.4, 1, lit(base, 0.3));
    // The neck: a shadow ring under the cushion.
    B.fill(c, [[x - up, yTop], [x - up, yTop + 1], [x + up, yTop + 1], [x + up, yTop]], shd(base, 0.5));
    // Abacus: a square slab seen corner-on, its south face in half-shade on
    // the left, its east face in sun on the right.
    const ah = 0.45 * s;
    const ya = yTop - eh;
    const wl = ABA * Math.sin(ANG) * s;
    const wr = ABA * Math.cos(ANG) * s;
    const ax = x - (wl + wr) / 2 + wl * 0.02;
    B.fill(c, [[ax, ya], [ax, ya - ah], [ax + wl, ya - ah], [ax + wl, ya]], shd(base, 0.3));
    B.fill(c, [[ax + wl, ya], [ax + wl, ya - ah], [ax + wl + wr, ya - ah], [ax + wl + wr, ya]], lit(base, 0.4));
  };

  // Three lights, one column: the east front in full sun, the south flank in
  // half-shade, the far colonnades a touch paler with distance.
  const COL_SUN = lit(S.body, 0.08);
  const COL_HALF = shd(mixh(S.body, S.patina, 0.15), 0.16);
  const COL_FAR = mixh(lit(S.body, 0.2), B.C.skyLow, 0.4);
  const drawColumn = function (col, base) {
    const foot = P(col.X, col.Y, K);
    column(t, foot[0], foot[1], scaleAt(col.X, col.Y), base);
  };

  // 3a. The far colonnades: the north flank and the west front, back to front.
  const depth = (col) => raw(col.X, col.Y, 0)[2];
  const far = cols.filter((c) => !c.near).sort((a, b) => depth(b) - depth(a));
  const near = cols.filter((c) => c.near).sort((a, b) => depth(b) - depth(a));
  for (const c of far) drawColumn(c, COL_FAR);

  // 3b. The inside faces of the far entablature, seen through the colonnade:
  // the north side in half-shade, the west side lit, and on the west side the
  // back of the west gable standing up into the sky.
  const IN = INSET + 1.1; // inner face of the entablature ring
  const INNER_N = shd(mixh(S.body, S.patina, 0.3), 0.36);
  const INNER_W = mixh(lit(S.sun, 0.06), B.C.skyLow, 0.12);
  B.fill(t, quad(P(-LEN + IN, WID - IN, ZA), P(-LEN + IN, WID - IN, ZT - 0.2), P(-IN, WID - IN, ZT - 0.2), P(-IN, WID - IN, ZA)), INNER_N);
  // The west gable, seen from behind: the tympanum wall and its raking
  // cornice, on a layer of its own so its edges can be inked crisp against
  // the sky. It is lit (it faces east), a little paler and cooler with distance.
  const G = B.layer(W, H);
  {
    const g = G.getContext('2d');
    const x = -LEN + IN - 0.2;
    const top = ZT + PED + 0.2;
    const th = 0.55;
    const a = P(x, -PROJ, ZT - 0.5);
    const b = P(x, WID / 2, top);
    const cc = P(x, WID + PROJ, ZT - 0.5);
    B.fill(g, [a, b, cc], mixh(lit(S.sun, 0.12), B.C.skyLow, 0.12));
    const a2 = P(x, -PROJ + 2.2 * th, ZT - 0.5);
    const b2 = P(x, WID / 2, top - th);
    const c2 = P(x, WID + PROJ - 2.2 * th, ZT - 0.5);
    B.fill(g, [a2, b2, c2], mixh(S.sun, B.C.skyLow, 0.16));
    line(g, a2[0], a2[1], b2[0], b2[1], 1, B.alpha(S.streak, 0.45));
    line(g, b2[0], b2[1], c2[0], c2[1], 1, B.alpha(S.streak, 0.35));
    inkRound(G, 0.7);
  }
  B.fill(t, quad(P(-LEN + IN, IN, ZA), P(-LEN + IN, IN, ZT), P(-LEN + IN, WID - IN, ZT), P(-LEN + IN, WID - IN, ZA)), INNER_W);
  // A dark soffit line under the far architrave, so the band sits on its capitals.
  {
    const a = P(-LEN + IN, WID - IN, ZA);
    const b = P(-IN, WID - IN, ZA);
    line(t, a[0], a[1] - 0.5, b[0], b[1] - 0.5, 1, B.alpha(S.streak, 0.45));
  }

  // 3c. The near colonnades: the south flank and the east front.
  t = T.getContext('2d');
  for (const c of near) drawColumn(c, c.X === fx[0] ? COL_SUN : COL_HALF);

  // 3d. The near entablature: architrave, frieze with triglyphs, cornice.
  // South face (half-shade) and east face (full sun), each a flat plane.
  const southFace = (z0, z1, off) => quad(P(-LEN - off, -off, z0), P(-LEN - off, -off, z1), P(off, -off, z1), P(off, -off, z0));
  const eastFace = (z0, z1, off) => quad(P(off, -off, z0), P(off, -off, z1), P(off, WID + off, z1), P(off, WID + off, z0));
  const faceOff = -FACE; // architrave/frieze plane sits FACE in from the stylobate edge

  // Architrave.
  B.fill(t, southFace(ZA, ZF, faceOff), STONE_HALF);
  B.fill(t, eastFace(ZA, ZF, faceOff), STONE_SUN);
  // Frieze: metopes a touch lighter, triglyphs darker.
  const FRZ_S = shd(mixh(S.body, S.patina, 0.2), 0.24);
  const FRZ_E = lit(S.sun, 0.26);
  B.fill(t, southFace(ZF, ZC, faceOff), FRZ_S);
  B.fill(t, eastFace(ZF, ZC, faceOff), FRZ_E);
  // The taenia: a fine ledge between architrave and frieze.
  {
    const a = P(-LEN - faceOff, -faceOff, ZF);
    const b = P(faceOff, -faceOff, ZF);
    const c = P(faceOff, WID + faceOff, ZF);
    line(t, a[0], a[1], b[0], b[1], 1, B.alpha(S.streak, 0.35));
    line(t, b[0], b[1], c[0], c[1], 1, B.alpha(S.streak, 0.3));
  }
  // Triglyphs. Front: 11 (2 corners, 4 over the inner columns, 5 over the
  // gaps). Flank: 27 by the same rule; where they fall below a pixel they merge.
  const TG = 0.85; // triglyph width
  const trig = function (n, axes, span) {
    const at = [];
    // Corner triglyphs sit at the very corners of the frieze.
    at.push([-FACE + 0, -FACE + TG]);
    for (let i = 1; i < axes.length - 1; i++) at.push([axes[i] - TG / 2, axes[i] + TG / 2]);
    for (let i = 0; i < axes.length - 1; i++) {
      const m = (axes[i] + axes[i + 1]) / 2;
      at.push([m - TG / 2, m + TG / 2]);
    }
    at.push([span + FACE - TG, span + FACE]);
    if (at.length !== n) throw new Error('triglyph count ' + at.length + ' != ' + n);
    return at;
  };
  const TRI_E = shd(S.body, 0.22);
  const TRI_S = shd(S.body, 0.48);
  for (const [y0, y1] of trig(11, fy, WID)) {
    B.fill(t, quad(P(faceOff, y0, ZF + 0.1), P(faceOff, y0, ZC), P(faceOff, y1, ZC), P(faceOff, y1, ZF + 0.1)), TRI_E);
  }
  {
    // Along the flank the axes run from the east end westward: distance from
    // the east front.
    const ax = fx.map((x) => -x);
    for (const [u0, u1] of trig(27, ax, LEN)) {
      B.fill(t, quad(P(-u1, -faceOff, ZF + 0.1), P(-u1, -faceOff, ZC), P(-u0, -faceOff, ZC), P(-u0, -faceOff, ZF + 0.1)), TRI_S);
    }
  }
  // The shadow under the cornice, across the top of the frieze.
  B.fill(t, southFace(ZC - 0.35, ZC, faceOff), B.alpha(S.streak, 0.5));
  B.fill(t, eastFace(ZC - 0.3, ZC, faceOff), B.alpha(S.streak, 0.42));
  // Cornice: projecting, its face lit on the east and half-lit on the south.
  B.fill(t, southFace(ZC, ZT, PROJ), shd(mixh(S.body, S.patina, 0.2), 0.14));
  B.fill(t, eastFace(ZC, ZT, PROJ), lit(S.sun, 0.34));
  // The cornice soffit: a thin dark band under its lip.
  B.fill(t, southFace(ZC - 0.12, ZC + 0.05, PROJ), B.alpha(INK, 0.4));
  B.fill(t, eastFace(ZC - 0.12, ZC + 0.05, PROJ), B.alpha(S.streak, 0.55));

  // 3e. The east pediment: an empty tympanum under a raking cornice.
  {
    const x = PROJ;
    const L = P(x, -PROJ, ZT);
    const A = P(x, WID / 2, ZT + PED);
    const R = P(x, WID + PROJ, ZT);
    const RK = 0.6; // raking cornice depth
    const L2 = P(x, -PROJ + RK * 2.2, ZT);
    const A2 = P(x, WID / 2, ZT + PED - RK);
    const R2 = P(x, WID + PROJ - RK * 2.2, ZT);
    B.fill(t, [L, A, R], lit(S.sun, 0.42)); // raking cornice, full sun
    B.fill(t, [L2, A2, R2], lit(S.sun, 0.1)); // the tympanum, set back
    // The raking cornice's shadow across the top of the tympanum.
    const sh = 0.35;
    const L3 = P(x, -PROJ + (RK + sh) * 2.2, ZT);
    const A3 = P(x, WID / 2, ZT + PED - RK - sh);
    const R3 = P(x, WID + PROJ - (RK + sh) * 2.2, ZT);
    B.fill(t, [L2, A2, R2, R3, A3, L3], B.alpha(S.streak, 0.42));
    B.fill(t, [L3, A3, R3], lit(S.sun, 0.1));
    // The south end of the pediment, turned away: a sliver of shade.
    const Lb = P(x - 1.6, -PROJ, ZT);
    const Ab = P(x - 1.6, 0.8, ZT + PED * (0.8 + PROJ) / (WID / 2 + PROJ));
    B.fill(t, [Lb, L, P(x, 0.8, ZT + PED * (0.8 + PROJ) / (WID / 2 + PROJ)), Ab], shd(S.body, 0.2));
  }

  // 3f. The krepis: the stepped platform, south risers in half-shade, east
  // risers in the sun, each with a lit arris along its top. The blocks were
  // never dressed: the lifting bosses still stand out from their faces.
  const RISER_S = shd(mixh(S.body, S.patina, 0.2), 0.26);
  const RISER_E = lit(S.body, 0.34);
  for (let j = 0; j < NSTEP; j++) {
    const off = j * TREAD;
    const z1 = K - j * RISE;
    const z0 = z1 - RISE;
    B.fill(t, southFace(z0, z1, off), j % 2 ? shd(RISER_S, 0.05) : RISER_S);
    B.fill(t, eastFace(z0, z1, off), j % 2 ? shd(RISER_E, 0.05) : RISER_E);
    // The lit arris.
    const a = P(-LEN - off, -off, z1);
    const b = P(off, -off, z1);
    const c = P(off, WID + off, z1);
    line(t, a[0], a[1] + 0.5, b[0], b[1] + 0.5, 1, lit(RISER_S, 0.35));
    line(t, b[0], b[1] + 0.5, c[0], c[1] + 0.5, 1, lit(RISER_E, 0.5));
  }

  // 3g. The shadows the colonnade throws down and to the left, onto the steps:
  // each column's shadow runs down the risers below and left of its foot.
  for (const c of near) {
    const foot = P(c.X, c.Y, K);
    const s = scaleAt(c.X, c.Y);
    const w = DLO * s * 0.7;
    const h = K * s + 2;
    const onEast = c.X === fx[0] && c.Y > fy[0];
    const tone = B.alpha(SHADOW, onEast ? 0.34 : 0.22);
    B.fill(t, [[foot[0] - w * 0.3, foot[1]], [foot[0] + w * 0.7, foot[1]], [foot[0] + w * 0.7 - h * 0.9, foot[1] + h], [foot[0] - w * 0.3 - h * 0.9, foot[1] + h]], tone);
  }

  // The lifting bosses: small knobs on every step block, deliberately 2-3 px,
  // each with a lit top and its own little shadow below. One knob, stamped.
  const KN = B.layer(4, 4);
  {
    const k = KN.getContext('2d');
    k.fillStyle = shd(S.streak, 0.1);
    k.fillRect(0, 2, 3, 1); // its shadow on the riser
    k.fillStyle = lit(S.body, 0.45);
    k.fillRect(0, 0, 3, 2); // the knob, lit
    k.fillStyle = lit(S.sun, 0.55);
    k.fillRect(1, 0, 2, 1);
  }
  const KNS = B.layer(4, 4);
  {
    const k = KNS.getContext('2d');
    k.fillStyle = shd(S.streak, 0.3);
    k.fillRect(0, 2, 3, 1);
    k.fillStyle = mixh(S.body, S.patina, 0.2);
    k.fillRect(0, 0, 3, 2);
    k.fillStyle = lit(mixh(S.body, S.patina, 0.2), 0.3);
    k.fillRect(1, 0, 2, 1);
  }
  const BLOCK = 3.6; // metres of step block per boss: calm, not a brick bond
  for (let j = 0; j < NSTEP; j++) {
    const off = j * TREAD;
    const zm = K - j * RISE - RISE * 0.55;
    const stagger = (j % 2) * BLOCK * 0.5;
    for (let u = BLOCK * 0.5 + stagger; u < WID + 2 * off - 0.8; u += BLOCK) {
      const p = P(off, -off + u, zm);
      t.drawImage(KN, Math.round(p[0] - 1.5), Math.round(p[1] - 1.5));
    }
    for (let u = BLOCK * 0.5 + stagger + 0.6; u < LEN + 2 * off - 0.8; u += BLOCK * 1.6) {
      const p = P(off - u, -off, zm);
      t.drawImage(KNS, Math.round(p[0] - 1.5), Math.round(p[1] - 1.5));
    }
  }

  // ---------------------------------------------------------------------------
  // 4. The temple's shadow on its hilltop, down and to the left of the base,
  // then the temple itself, inked round.

  {
    const NT = NSTEP * TREAD;
    const a = P(-LEN - NT, -NT, 0);
    const b = P(NT, -NT, 0);
    const c = P(NT, WID + NT, 0);
    ctx.save();
    B.path(ctx, hillTop);
    ctx.clip();
    // Bare trodden earth in a strip along the foot of the steps.
    B.fill(ctx, [[a[0] - 4, a[1] - 1], [b[0] + 2, b[1] - 1], [c[0] + 6, c[1] - 1], [c[0] + 4, c[1] + 2.5], [b[0] + 2, b[1] + 4], [a[0] - 6, a[1] + 3]], B.alpha(S.earth, 0.75));
    // The shadow, painted solid on its own layer and laid on once, so where
    // its parts overlap it does not darken: the steps' band at the foot, the
    // columns' stripes beyond it, and the entablature's band at the far end.
    const SL = B.layer(W, H);
    const sc = SL.getContext('2d');
    const DX = -26;
    const DY = 13;
    const band = (k0, k1) => [
      [a[0] + DX * k0, a[1] + DY * k0], [b[0] + DX * k0, b[1] + DY * k0], [c[0] + DX * k0, c[1] + DY * k0],
      [c[0] + DX * k1, c[1] + DY * k1], [b[0] + DX * k1, b[1] + DY * k1], [a[0] + DX * k1, a[1] + DY * k1],
    ];
    B.fill(sc, band(-0.05, 0.28), SHADOW);
    B.fill(sc, band(0.95, 1.3), SHADOW);
    for (const col of near) {
      const onEast = col.X === fx[0] && col.Y > fy[0];
      const f = onEast ? P(NT, col.Y, 0) : P(col.X, -NT, 0);
      const w = (DLO * scaleAt(col.X, col.Y)) / 2;
      B.fill(sc, [[f[0] - w, f[1]], [f[0] + w, f[1]], [f[0] + w + DX, f[1] + DY], [f[0] - w + DX, f[1] + DY]], SHADOW);
    }
    ctx.globalAlpha = 0.36;
    ctx.drawImage(SL, 0, 0);
    ctx.restore();
  }

  ctx.drawImage(G, 0, 0);
  inkRound(TF, 0.3);
  ctx.drawImage(TF, 0, 0);
  inkRound(T, 0.8);
  ctx.drawImage(T, 0, 0);

  // ---------------------------------------------------------------------------
  // 5. Low scrub on the hill: a few large clumps, lit on the upper right,
  // each with its shadow to the lower left. One clump, stamped.

  const bush = function (x, y, s, seed) {
    const r = B.rng(seed);
    const lobes = [];
    for (let i = 0; i < 3; i++) lobes.push([x + (i - 1) * s * 0.9 + (r() - 0.5) * s * 0.3, y - s * (0.35 + r() * 0.3) - (i === 1 ? s * 0.25 : 0), s * (0.7 + r() * 0.2)]);
    const blob = function (dx, dy, color) {
      ctx.beginPath();
      for (const [lx, ly, lr] of lobes) {
        ctx.moveTo(lx + dx + lr, ly + dy);
        ctx.ellipse(lx + dx, ly + dy, lr, lr * 0.8, 0, 0, Math.PI * 2);
      }
      ctx.rect(x - s * 1.6 + dx, y - s * 0.4 + dy, s * 3.2, s * 0.4);
      ctx.fillStyle = color;
      ctx.fill();
    };
    blob(-s * 0.8, s * 0.3, B.alpha(SHADOW, 0.3)); // its shadow, down and left
    blob(0, 0, B.C.foliageDark);
    ctx.save();
    ctx.beginPath();
    for (const [lx, ly, lr] of lobes) {
      ctx.moveTo(lx + lr, ly);
      ctx.ellipse(lx, ly, lr, lr * 0.8, 0, 0, Math.PI * 2);
    }
    ctx.clip();
    for (const [lx, ly, lr] of lobes) {
      ctx.beginPath();
      ctx.ellipse(lx + lr * 0.3, ly - lr * 0.3, lr * 0.75, lr * 0.55, 0, 0, Math.PI * 2);
      ctx.fillStyle = B.C.foliage;
      ctx.fill();
    }
    ctx.restore();
  };
  bush(26, 258, 15, 5);
  bush(62, 270, 10, 6);
  bush(8, 238, 8, 9);
  bush(344, 262, 16, 7);
  bush(306, 276, 9, 8);
  bush(210, 278, 7, 10);
};
