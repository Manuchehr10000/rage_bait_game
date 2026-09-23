/**
 * Chapter 3 vignette: Mycenae, the Lion Gate, from the approach ramp.
 *
 * Asset map-monument-ch03-aegean, 92 x 70 world px, painted 368 x 280. The view
 * is specs/lion-gate.json's: square-on from the ramp in the outer court, on the
 * gate's own axis, a few metres below the threshold. The doorway under its
 * single lintel sits in the middle of the frame, the grey relief triangle over
 * it; coursed conglomerate walls either side; the bastion's inner face, in
 * cool shade, on the right; a strip of the lit east flank on the left; the
 * ramp rising to the threshold below; a band of the set's sky above.
 *
 * Built like the pilot (abu-simbel.js): sky and setting, then the monument
 * back to front, then the ground, then ink. The lion is painted once and
 * stamped twice, the second copy mirrored, and both are lit by one light laid
 * over them afterwards, so they stay the same animal (pillar 4).
 *
 * Scale: about 26 px a metre on the facade plane. The doorway is 80 px at the
 * threshold narrowing to 73 px under the lintel (3.1 m to 2.8 m) and 78 px
 * high: square. The lintel is 116 px (4.5 m, 1.45 x the opening). The relief
 * is 92 px wide at its base (3.55 m, 1.15 x the opening) and 79 px high
 * (3.05 m): as tall as the doorway, near-equilateral. Nine courses a side,
 * the fifth level with the lintel, the ninth ending about at the apex.
 */
PAINTERS['lion-gate'] = function (ctx, W, H, B) {
  // The research palette, pushed a little sunnier.
  const S = {
    cong: '#b39c7c', // conglomerate ashlar in sun
    congDark: '#7d6a55', // pebbles, pits and dry joints
    congWarm: '#a3714b', // sparse warm flecks (unsourced; used sparingly)
    rel: '#b8b3a8', // the grey limestone relief
    relDark: '#6e6a60', // weathering in the relief's recesses
    passage: '#43372f', // the passage under the lintel
    earth: '#c4a77c', // the ramp and the court floor
    grass: '#c9b56f', // summer grass
    scrub: '#6b7547', // grey-green scrub
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
  const line = function (c, x0, y0, x1, y1, w, style) {
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x1, y1);
    c.lineWidth = w;
    c.lineCap = 'round';
    c.strokeStyle = style;
    c.stroke();
  };
  const poly = function (c, pts, w, style) {
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    for (const p of pts.slice(1)) c.lineTo(p[0], p[1]);
    c.lineWidth = w;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.strokeStyle = style;
    c.stroke();
  };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const silhouette = function (layer, color) {
    const m = B.layer(layer.width, layer.height);
    const mc = m.getContext('2d');
    mc.drawImage(layer, 0, 0);
    mc.globalCompositeOperation = 'source-in';
    mc.fillStyle = color;
    mc.fillRect(0, 0, m.width, m.height);
    return m;
  };
  /** A line one pixel round everything on a layer, behind it. */
  const inkRound = function (layer, color, alpha) {
    const m = silhouette(layer, color);
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
  /** A vertical gradient fill. */
  const vfill = function (c, pts, top, bottom) {
    const b = B.bounds(pts);
    const g = c.createLinearGradient(0, b.y0, 0, b.y1);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    B.fill(c, pts, g);
  };
  /** A diagonal gradient fill, cooler at the lower left, warmer at the upper right. */
  const dfill = function (c, pts, base, cool, warm) {
    const b = B.bounds(pts);
    const g = c.createLinearGradient(b.x0, b.y1, b.x1, b.y0);
    g.addColorStop(0, shd(base, cool));
    g.addColorStop(0.5, base);
    g.addColorStop(1, lit(base, warm));
    B.fill(c, pts, g);
  };

  // ---------------------------------------------------------------------------
  // Layout.

  const M = 28; // px a metre on the facade plane
  const CX = 184; // the gate's axis
  const GY = 237; // the threshold's top: the floor of the doorway
  const DB = 1.55 * M; // half the doorway at the threshold (3.1 m)
  const DT = 1.39 * M; // half the doorway under the lintel (2.78 m)
  const LB = GY - 3 * M; // underside of the lintel: the opening is 3 m high
  const LT = LB - 0.8 * M; // top of the lintel (0.8 m) = foot of the relief
  const LH = 2.25 * M; // half the lintel (4.5 m)
  const JW = 0.55 * M; // a jamb's face
  const RH = 1.775 * M; // half the relief's base (3.55 m)
  const APEX = LT - 3.05 * M; // the relief's apex (3.05 m above the lintel)
  const TOP = Math.round(APEX - 3); // the facade's preserved top: about the apex
  const FOOT = GY + 10; // where the walls meet the ramp at the facade
  const XL = 26; // where the facade meets the east flank
  const XR = 298; // where the facade meets the bastion's inner face
  const VP = [CX, 220]; // eye level, on the axis: the side walls run to it
  // Bed joints, bottom up: nine courses a side, the fifth the lintel's.
  const COURSE = [FOOT];
  for (let i = 1; i < 4; i++) COURSE.push(FOOT - ((FOOT - LB) * i) / 4);
  COURSE.push(LB, LT);
  for (let i = 1; i <= 4; i++) COURSE.push(LT - ((LT - TOP) * i) / 4);

  const DOOR = [[CX - DB, GY], [CX - DT, LB], [CX + DT, LB], [CX + DB, GY]];
  const JAMB_L = [[CX - DB - JW, GY], [CX - DT - JW, LB], [CX - DT, LB], [CX - DB, GY]];
  const JAMB_R = JAMB_L.map((p) => [2 * CX - p[0], p[1]]).reverse();
  const LINTEL = rect(CX - LH, LT, CX + LH, LB);
  const TRI = [[CX - RH, LT], [CX, APEX], [CX + RH, LT]];
  const triHalf = (y) => (RH * (y - APEX)) / (LT - APEX);

  // Where the ray from the vanishing point through a facade point reaches x.
  const toward = (p, x) => [x, VP[1] + ((p[1] - VP[1]) * (x - VP[0])) / (p[0] - VP[0])];

  // ---------------------------------------------------------------------------
  // 1. Sky, the mountains flattened to one pale band, the citadel's slope.

  B.sky(ctx, W, 60);
  B.cloud(ctx, 92, 12, 18, 31);
  B.cloud(ctx, 236, 9, 12, 57);
  {
    // Profitis Ilias and Zara, flattened: one long low band, no peaks.
    B.fill(ctx, [[0, 60], [0, 31], [70, 28], [150, 29.5], [240, 27.5], [310, 29], [W, 27.5], [W, 60]], mixh(B.C.skyLow, '#8d9ea6', 0.3));
    // The citadel's own slope behind the walls: dry grass, calm.
    vfill(ctx, [[0, 60], [0, 36], [60, 34.5], [130, 35.5], [210, 34], [280, 35], [W, 34], [W, 60]], lit(S.grass, 0.15), mixh(S.grass, S.scrub, 0.25));
    for (const [x, y, rx, ry] of [[70, 37, 14, 3], [128, 37.5, 8, 2.4], [236, 36, 10, 2.8]]) {
      const pts = [[x - rx, y + ry], [x - rx * 0.7, y - ry * 0.4], [x - rx * 0.1, y - ry], [x + rx * 0.6, y - ry * 0.6], [x + rx, y + ry]];
      B.fill(ctx, pts, mixh(S.scrub, B.C.foliage, 0.25));
      wash(ctx, [[x - rx, y + ry], [x - rx * 0.7, y - ry * 0.4], [x - rx * 0.2, y + ry]], B.C.foliageDark, 0.35);
    }
  }

  // The ramp's ground under everything below the walls, so no seam can open.
  {
    const g = ctx.createLinearGradient(0, GY, 0, H);
    g.addColorStop(0, mixh(S.earth, S.cong, 0.45));
    g.addColorStop(1, shd(S.earth, 0.3));
    ctx.fillStyle = g;
    ctx.fillRect(0, 200, W, H - 200);
  }

  // ---------------------------------------------------------------------------
  // 2. The side walls, from the viewer back to the facade.

  // East flank, left: the old circuit wall refaced in conglomerate. It faces
  // south-west, into the afternoon sun: lit.
  const FL_TOP = toward([XL, TOP + 3], 0);
  const FL_BOT = toward([XL, FOOT], 0);
  const FLANK = [[0, FL_TOP[1]], [XL, TOP + 3], [XL, FOOT], [0, FL_BOT[1]]];
  // Bastion, right: its inner face looks north-east into the court, away
  // from the sun: cool shade. Its top runs out of the frame's top.
  const BA_T = [XR, TOP - 4];
  const baTopX = toward(BA_T, W)[1] < 0 ? VP[0] + ((0 - VP[1]) * (XR - VP[0])) / (BA_T[1] - VP[1]) : W;
  const BA_BOT = toward([XR, FOOT], W);
  const BASTION = [BA_T, [baTopX, 0], [W, 0], [W, BA_BOT[1]], [XR, FOOT]];

  const WALL = mixh(mixh(S.cong, S.congDark, 0.38), S.congWarm, 0.08); // the facade courses: a clear step below the monoliths
  const FLANK_C = lit(mixh(S.cong, S.congDark, 0.32), 0.06);
  const BAST = shd(mixh(S.cong, S.congDark, 0.2), 0.36);

  /** Courses on a receding wall: every bed joint runs to the vanishing point. */
  const recede = function (pts, xf, xn, base, joint, seed, blockLen) {
    B.fill(ctx, pts, base);
    const r = B.rng(seed);
    B.clip(ctx, pts, function () {
      const g = ctx.createLinearGradient(xf, 0, xn, 0);
      g.addColorStop(0, B.alpha(SHADOW, 0.1));
      g.addColorStop(1, B.alpha(SUN, 0.08));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      const dist = Math.abs(xn - xf);
      const dir = Math.sign(xn - xf);
      const ys = COURSE.concat([TOP - 26, TOP - 52, TOP - 78]);
      for (let i = 0; i < ys.length - 1; i++) {
        const a = [xf, ys[i]];
        const b = [xf, ys[i + 1]];
        // Vertical joints, staggered, further apart toward the viewer.
        const cuts = [];
        let t = (i % 2) * 0.5 * blockLen;
        while (true) {
          t += blockLen * (0.85 + r() * 0.4) * (1 + (t / dist) * 1.3);
          if (t >= dist) break;
          cuts.push(t);
        }
        let prev = 0;
        for (const tt of cuts.concat([dist])) {
          const x0 = xf + dir * prev;
          const x1 = xf + dir * tt;
          const q = [toward(a, x0), toward(a, x1), toward(b, x1), toward(b, x0)];
          const k = r();
          if (k < 0.33) wash(ctx, q, SHADOW, 0.07);
          else if (k > 0.72) wash(ctx, q, SUN, 0.07);
          if (tt < dist) line(ctx, x1, toward(a, x1)[1], x1, toward(b, x1)[1], 1.2, B.alpha(joint, 0.5));
          prev = tt;
        }
        const an = toward(a, xn);
        line(ctx, xf, a[1], an[0], an[1], 1.3, B.alpha(joint, 0.55));
      }
    });
  };
  recede(FLANK, XL, 0, FLANK_C, S.congDark, 911, 18);
  recede(BASTION, XR, W, BAST, shd(S.congDark, 0.45), 913, 30);
  // Grass along the bastion's broken top.
  {
    const e = [BA_T];
    for (const [x, d] of [[296, -1], [304, -4], [312, -2], [318, -5]]) e.push([x, toward(BA_T, x)[1] + d]);
    e.push([baTopX + 3, 0], [baTopX - 1, 0], [XR - 1, TOP - 6]);
    B.fill(ctx, e, mixh(S.grass, S.scrub, 0.3));
  }
  // Grass along the flank's top.
  B.fill(ctx, [[0, FL_TOP[1] - 4], [10, toward([XL, TOP + 3], 10)[1] - 5], [XL, TOP], [XL, TOP + 3], [0, FL_TOP[1]]], mixh(S.grass, S.scrub, 0.2));

  // ---------------------------------------------------------------------------
  // 3. The facade: coursed conglomerate, darker and warmer than the four
  // monoliths and the grey relief, so the gate stands a clear step forward of
  // its wall at 92 x 70.

  const WTOP = [[XL, TOP + 3], [62, TOP + 3], [62, TOP], [104, TOP], [104, TOP + 4], [120, TOP + 4], [120, TOP], [252, TOP], [252, TOP + 3], [XR, TOP + 3]];
  const FACADE = WTOP.concat([[XR, FOOT], [XL, FOOT]]);
  dfill(ctx, FACADE, WALL, 0.08, 0.22);
  // Dry grass in the gaps along the top.
  for (const [x0, x1] of [[XL, 62], [104, 120], [252, XR]]) {
    B.fill(ctx, [[x0, TOP + 4], [x0 + 3, TOP], [x1 - 4, TOP + 0.5], [x1, TOP + 4]], mixh(S.grass, S.scrub, 0.25));
  }

  // Blocks: long and low, dressed ashlar, not polygonal. The gate and the
  // relief are cut out of the pattern: beside the relief the courses end on
  // its sloping sides, as the corbelling does.
  B.clip(ctx, FACADE, function () {
    const r = B.rng(4242);
    for (let i = 0; i < COURSE.length - 1; i++) {
      for (const side of [-1, 1]) {
        // The right-hand courses do not line up exactly with the left.
        const off = side > 0 && i !== 4 ? 1.5 : 0;
        const yb = COURSE[i] + off;
        const ya = COURSE[i + 1] + off;
        const inner = (y) => {
          if (y > LB + 0.5) return CX + side * (DB + JW);
          if (y > LT + 0.5) return CX + side * LH;
          return CX + side * triHalf(y);
        };
        const outer = side < 0 ? XL : XR;
        const dir = -side;
        let x = outer + dir * (i % 2 ? 14 : 0);
        const endA = inner(ya);
        const endB = inner(yb);
        let first = true;
        let x0 = outer;
        while (true) {
          const nx = first ? x + dir * (18 + r() * 14) : x + dir * (32 + r() * 22);
          first = false;
          const stop = dir > 0 ? nx >= Math.min(endA, endB) - 6 : nx <= Math.max(endA, endB) + 6;
          const x1 = stop ? null : nx;
          const q = x1 === null ? [[x0, ya], [endA, ya], [endB, yb], [x0, yb]] : [[x0, ya], [x1, ya], [x1, yb], [x0, yb]];
          const k = r();
          if (k < 0.3) wash(ctx, q, SHADOW, 0.08);
          else if (k > 0.7) wash(ctx, q, SUN, 0.1);
          // The top arris of each block catches the light.
          line(ctx, x0, ya + 1.3, x1 === null ? endA : x1, ya + 1.3, 1, B.alpha(SUN, 0.3));
          if (x1 === null) break;
          line(ctx, x1, ya, x1, yb, 1.3, B.alpha(S.congDark, 0.65));
          x0 = x1;
          x = x1;
        }
        line(ctx, outer, yb, endB, yb, 1.4, B.alpha(S.congDark, 0.7));
      }
    }
  });

  /** Pebbles in the conglomerate: a sparse scatter of visible marks, no grain. */
  const pebbles = function (pts, seed, count, dark) {
    B.hatch(ctx, pts, { seed: seed, count: count, colors: [B.alpha(dark, 0.32), B.alpha(S.congWarm, 0.28), B.alpha(SUN, 0.22), B.alpha(dark, 0.24)], len: 3.4, width: 2, angle: 0, spread: 1.4, bow: 0.5 });
  };
  pebbles(FACADE, 71, 120, S.congDark);
  pebbles(FLANK, 73, 24, S.congDark);
  pebbles(BASTION, 75, 36, shd(S.congDark, 0.3));

  // Inner corners: the facade meets the shaded bastion, and the lit flank.
  wash(ctx, [[XR - 3, TOP + 3], [XR, TOP - 4], [XR, FOOT], [XR - 3, FOOT]], SHADOW, 0.3);
  line(ctx, XL, TOP + 3, XL, FOOT, 1.2, B.alpha(INK, 0.3));

  // ---------------------------------------------------------------------------
  // 4. The gate: four conglomerate monoliths, a clear step lighter than the
  // coursed wall.

  const MONO = lit(S.cong, 0.4);
  for (const j of [JAMB_L, JAMB_R]) {
    const b = B.bounds(j);
    const g = ctx.createLinearGradient(b.x0, 0, b.x1, 0);
    g.addColorStop(0, shd(MONO, 0.1));
    g.addColorStop(0.5, MONO);
    g.addColorStop(1, lit(MONO, 0.18));
    B.fill(ctx, j, g);
  }
  pebbles(JAMB_L, 81, 9, S.congDark);
  pebbles(JAMB_R, 83, 9, S.congDark);
  {
    const g = ctx.createLinearGradient(0, LT, 0, LB);
    g.addColorStop(0, lit(MONO, 0.3));
    g.addColorStop(0.3, MONO);
    g.addColorStop(1, shd(MONO, 0.1));
    B.fill(ctx, LINTEL, g);
    pebbles(LINTEL, 85, 16, S.congDark);
    line(ctx, CX - LH + 1, LT + 1, CX + LH - 1, LT + 1, 1.3, B.alpha(SUN, 0.65));
  }
  // The lintel throws a short shadow down and to the left over the wall and
  // the left jamb's head.
  wash(ctx, [[CX - LH, LB], [CX - LH - 4, LB], [CX - LH - 4, LT + 3], [CX - LH, LT]], SHADOW, 0.3);
  B.clip(ctx, JAMB_L, function () {
    wash(ctx, rect(CX - LH - 4, LB, CX + LH, LB + 3), SHADOW, 0.3);
  });
  B.clip(ctx, JAMB_R, function () {
    wash(ctx, rect(CX - LH - 4, LB, CX + LH, LB + 3), SHADOW, 0.3);
  });

  // The threshold: one block at the head of the ramp, its top in the sun.
  const THR_B = GY + 9;
  const TH = 2.28 * M; // half the threshold block (4.56 m)
  const THRESH = [[CX - TH, THR_B], [CX - TH + 1, GY], [CX + TH - 1, GY], [CX + TH, THR_B]];
  B.fill(ctx, THRESH, shd(MONO, 0.14));
  B.fill(ctx, rect(CX - TH + 1, GY, CX + TH - 1, GY + 3), lit(MONO, 0.3));
  pebbles(THRESH, 87, 8, S.congDark);

  // ---------------------------------------------------------------------------
  // 5. The opening: no doors; a passage 2 m deep onto the small inner court.
  // Its far end is the near end shrunk toward the vanishing point. The soffit
  // and the right reveal are dark; the sun, low from the right, comes in past
  // the right jamb, so the shadow of the lintel and that jamb is cast down and
  // to the left across the left reveal and the floor, leaving a lit wedge.

  {
    const F = 0.84;
    const far = DOOR.map((p) => [VP[0] + (p[0] - VP[0]) * F, VP[1] + (p[1] - VP[1]) * F]);
    const [nb0, nt0, nt1, nb1] = DOOR;
    const [fb0, ft0, ft1, fb1] = far;
    B.fill(ctx, DOOR, S.passage);
    // Through the far end: the court's far wall in shade, its floor in sun.
    B.fill(ctx, far, mixh(S.passage, WALL, 0.34));
    B.fill(ctx, [fb0, [fb0[0], fb0[1] - 11], [fb1[0], fb1[1] - 13], fb1], mixh(S.earth, S.passage, 0.12));
    // Reveals and floor.
    B.fill(ctx, [nb0, nt0, ft0, fb0], mixh(S.passage, MONO, 0.55));
    B.fill(ctx, [nb1, nt1, ft1, fb1], mixh(S.passage, INK, 0.25));
    B.fill(ctx, [nb0, fb0, fb1, nb1], mixh(S.earth, S.passage, 0.2));
    B.fill(ctx, [nt0, nt1, ft1, ft0], mixh(S.passage, INK, 0.5));
    // The cast shadow: all but the lower-left wedge.
    B.clip(ctx, [nb0, nt0, nt1, nb1], function () {
      B.fill(ctx, [[nt0[0] - 2, LB - 1], [nt1[0] + 2, LB - 1], [nb1[0] + 2, GY + 1], [CX + 6, GY + 1], [nt0[0] - 2, LB + 30]], B.alpha(mixh(S.passage, INK, 0.4), 0.72));
    });
    B.path(ctx, DOOR);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = B.alpha(INK, 0.8);
    ctx.stroke();
  }

  // ---------------------------------------------------------------------------
  // 6. The relief: one slab of grey limestone filling the triangle, lighter
  // and cooler than every conglomerate block round it.

  // Relief units: x across from the axis, h up from the lintel; the base is
  // 84 units wide and the height 72, scaled to the painted triangle.
  const KX = RH / 42;
  const KY = (LT - APEX) / 72;
  const P = (pts) => pts.map((p) => [CX + p[0] * KX, LT - p[1] * KY]);

  // The lion, left one, facing the column: rearing on its hind legs, its back
  // along the slope of the slab, forefeet on the altar, the body ending at the
  // neck. The heads were separate pieces and are lost; nothing is restored.
  const LION = [
    [-23.6, 0], [-31.6, 0], [-31.4, 3], [-33.4, 7.6], [-34, 11.6], [-31.8, 16], // hind paw, hock, the round of the haunch
    [-28.8, 21], [-25.6, 26.4], [-22.4, 31.8], [-19.6, 36.6], [-17.4, 39.8], // the back along the slope to the shoulder
    [-15, 41.4], [-13.4, 46.4], [-8.8, 44.8], // the neck, broken off square: no head
    [-9.4, 40.6], [-7.8, 36.6], [-8.2, 31.4], // throat and chest, clear of the column
    [-7.8, 27], [-7.4, 22], [-12.8, 22], [-12.4, 25.2], [-12.8, 28.6], [-14, 30.8], // the forelegs down to the altar top
    [-16.2, 28.8], [-18.6, 25.6], [-20.6, 21.6], // belly and waist
    [-21.2, 16.6], [-24.4, 11], [-26.6, 5], [-25.6, 2], [-23.6, 1.4], // the hind leg: knee forward, shin back to the paw
  ];
  const LION_MARKS = [
    [[-28.6, 0.6], [-29, 5.4], [-27.4, 10]], // near hind leg over the far one
    [[-33, 14.6], [-28, 17], [-22.6, 15.4]], // the haunch
    [[-10.2, 22.4], [-10.3, 29]], // the two forelegs
    [[-18.6, 36], [-15, 32.4], [-14.2, 30.2]], // the shoulder
  ];
  const NECK = [[-13.4, 46.4], [-8.8, 44.8]]; // the flat top of the broken neck
  const ALTAR_TOP = 22;
  const ALTAR = [[-11, 0], [11, 0], [11, 2.6], [7.8, 6.6], [7.2, 11], [7.8, 15.4], [12, 19.6], [12, 22], [-12, 22], [-12, 19.6], [-7.8, 15.4], [-7.2, 11], [-7.8, 6.6], [-11, 2.6]];
  const COLUMN = [[-3, 22], [3, 22], [4.6, 44], [-4.6, 44]]; // wider at the top: Minoan
  const CAPITAL = [[-5.8, 44], [5.8, 44], [6.8, 45.8], [6.2, 47.6], [-6.2, 47.6], [-6.8, 45.8]];
  const ABACUS = rect(-7, 47.6, 7, 50.4);
  const DISCS = [-5.2, -1.75, 1.75, 5.2];
  const DISC_H = 52.3;
  const DISC_R = 1.6;
  const BEAM = [[-6, 54.2], [6, 54.2], [5, 57], [-5, 57]];

  const REL_BG = mixh(S.rel, S.relDark, 0.62); // the slab's ground, a step behind the carving
  const REL_HI = lit(S.rel, 0.42); // the carving, in raking sun

  // The carving, flat, on its own layer: one lion painted once, stamped
  // mirrored for the other.
  const lion = B.layer(W, H);
  {
    const c = lion.getContext('2d');
    B.fill(c, P(LION), REL_HI);
  }
  const carve = B.layer(W, H);
  const cc = carve.getContext('2d');
  cc.drawImage(lion, 0, 0);
  cc.save();
  cc.setTransform(-1, 0, 0, 1, 2 * CX, 0);
  cc.drawImage(lion, 0, 0);
  cc.restore();
  for (const p of [ALTAR, COLUMN, CAPITAL, ABACUS, BEAM]) B.fill(cc, P(p), REL_HI);
  for (const x of DISCS) {
    const [px, py] = P([[x, DISC_H]])[0];
    cc.beginPath();
    cc.arc(px, py, DISC_R * KX, 0, Math.PI * 2);
    cc.fillStyle = REL_HI;
    cc.fill();
  }
  // One light over all of it: every form cool on its left, warm on its right.
  cc.save();
  cc.globalCompositeOperation = 'source-atop';
  for (const [x0, x1] of [[-34, -7], [7, 34], [-13, 13]]) {
    const [a] = P([[x0, 0]]);
    const [b] = P([[x1, 0]]);
    const g = cc.createLinearGradient(a[0], 0, b[0], 0);
    g.addColorStop(0, B.alpha(SHADOW, 0.2));
    g.addColorStop(0.5, B.alpha(SHADOW, 0));
    g.addColorStop(1, B.alpha(SUN, 0.28));
    cc.fillStyle = g;
    if (x0 === -13) {
      // The column, altar and discs only, between the two lions.
      B.clip(cc, P(rect(-7.2, ALTAR_TOP, 7.2, 60)), function () {
        cc.fillRect(0, 0, W, H);
      });
      B.clip(cc, P(rect(-12.2, 0, 12.2, ALTAR_TOP + 0.2)), function () {
        cc.fillRect(0, 0, W, H);
      });
    } else {
      cc.fillRect(a[0], APEX, b[0] - a[0], LT - APEX + 1);
    }
  }
  // The altar: its incurved sides and lips.
  wash(cc, P([[-12, 19.6], [12, 19.6], [12, 18.6], [-12, 18.6]]), SHADOW, 0.25);
  wash(cc, P([[-11, 2.6], [11, 2.6], [11, 1.6], [-11, 1.6]]), SHADOW, 0.2);
  wash(cc, P([[-12, 22], [12, 22], [12, 21.2], [-12, 21.2]]), SUN, 0.5);
  wash(cc, P([[-7, 50.4], [7, 50.4], [7, 49.6], [-7, 49.6]]), SUN, 0.45);
  cc.restore();
  // Inner marks, the same on both lions.
  for (const flip of [1, -1]) {
    const f = (pts) => P(pts.map((p) => [p[0] * flip, p[1]]));
    for (const m of LION_MARKS) poly(cc, f(m), 1, B.alpha(S.relDark, 0.6));
    // The broken neck's flat top faces up into the sun.
    poly(cc, f(NECK.map((p) => [p[0], p[1] - 0.8])), 1.6, B.alpha(SUN, 0.8));
  }
  inkRound(carve, S.relDark, 0.8);

  {
    // The slab ground, lit from the upper right.
    const b = B.bounds(TRI);
    const g = ctx.createLinearGradient(b.x0, b.y1, b.x1, b.y0);
    g.addColorStop(0, shd(REL_BG, 0.08));
    g.addColorStop(1, lit(REL_BG, 0.1));
    B.fill(ctx, TRI, g);
    // The carving throws a short shadow down and to the left on it, then sits on it.
    B.clip(ctx, TRI, function () {
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.drawImage(silhouette(carve, mixh(S.relDark, SHADOW, 0.3)), -2.5, 1.5);
      ctx.restore();
      ctx.drawImage(carve, 0, 0);
    });
  }
  // The slab sits in the corbelling: a dark joint all round.
  B.path(ctx, TRI);
  ctx.lineJoin = 'miter';
  ctx.lineWidth = 1.7;
  ctx.strokeStyle = B.alpha(INK, 0.75);
  ctx.stroke();
  for (const p of [LINTEL, JAMB_L, JAMB_R, THRESH]) {
    B.path(ctx, p);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = B.alpha(INK, 0.6);
    ctx.stroke();
  }

  // ---------------------------------------------------------------------------
  // 7. The ramp, rising to the threshold: earth and flat rock, a step below
  // the monoliths and darkening toward the viewer, with the bastion's shadow
  // falling across it down and to the left.

  {
    const RAMP = [[0, FL_BOT[1]], [XL, FOOT], [CX - TH, THR_B], [CX + TH, THR_B], [XR, FOOT], [W, BA_BOT[1]], [W, H], [0, H]];
    B.clip(ctx, RAMP, function () {
      const rock = function (pts, tone) {
        B.fill(ctx, pts.map((p) => [p[0] - 4, p[1] + 2]), B.alpha(SHADOW, 0.2));
        vfill(ctx, pts, lit(tone, 0.16), mixh(tone, S.congDark, 0.3));
        line(ctx, pts[1][0], pts[1][1] + 0.8, pts[2][0], pts[2][1] + 0.8, 1, B.alpha(SUN, 0.4));
      };
      rock([[34, 266], [54, 257], [92, 256], [110, 263], [82, 270], [48, 271]], S.cong);
      rock([[216, 272], [238, 263], [272, 264], [288, 271], [252, 276]], S.cong);
      rock([[120, 250], [140, 246], [166, 247], [160, 253], [128, 254]], mixh(S.cong, S.earth, 0.5));
      // The worn way up the middle.
      B.fill(ctx, [[CX - 44, THR_B], [CX + 44, THR_B], [CX + 62, H], [CX - 72, H]], B.alpha(lit(S.earth, 0.2), 0.3));
      // The threshold's own shadow on the ramp.
      wash(ctx, [[CX - TH, THR_B], [CX + TH, THR_B], [CX + TH - 4, THR_B + 3], [CX - TH - 4, THR_B + 3]], SHADOW, 0.32);
      // The bastion's shadow, across the court from the right.
      wash(ctx, [[W, BA_BOT[1] - 2], [XR, FOOT - 1], [250, 250], [160, H], [W, H]], SHADOW, 0.3);
      // Dry grass at the wall feet.
      for (const [x, y, s] of [[14, 250, 11], [312, 254, 9], [350, 262, 12]]) {
        B.dab(ctx, x, y, s, s * 0.32, mixh(S.grass, S.scrub, 0.3));
        B.dab(ctx, x + s * 0.2, y - s * 0.1, s * 0.6, s * 0.18, B.alpha(lit(S.grass, 0.2), 0.8));
      }
    });
    // Where the walls meet the ramp.
    line(ctx, 0, FL_BOT[1], XL, FOOT, 1.2, B.alpha(SHADOW, 0.35));
    line(ctx, XR, FOOT, W, BA_BOT[1], 1.2, B.alpha(SHADOW, 0.35));
    wash(ctx, [[XL, FOOT], [CX - TH, FOOT], [CX - TH, FOOT + 2], [XL, FOOT + 2]], SHADOW, 0.25);
    wash(ctx, [[CX + TH, FOOT], [XR, FOOT], [XR, FOOT + 2], [CX + TH, FOOT + 2]], SHADOW, 0.25);
  }
};
