/**
 * Chapter 6 vignette: Tikal, Temple I (the Temple of the Great Jaguar), west face.
 *
 * Asset map-monument-ch06-americas, 92 x 70 world px, painted 368 x 280. The
 * view is from the Great Plaza lawn, a little west of its centre, looking due
 * east at the stair: the brochure's face-on elevation, the front lit by the
 * afternoon sun, the right-hand (south) ends of the terraces and every terrace
 * top brighter still, the left-hand (north) ends in cool shade. Temple II is
 * behind the viewer and so is not in frame; the North and Central Acropolis
 * are cropped and the canopy runs in where they stand.
 *
 * Built the way the pilot (abu-simbel.js) is built:
 *   1. the shared sky in flat steps, and one long flat fair-weather cloud, low
 *      on the left, well clear of the comb;
 *   2. the setting: the rainforest as a few large masses, low (its top at
 *      about two thirds of the plate's height, well below the shrine), each a
 *      flat body with a lit rim to the upper right and a shaded rim to the
 *      lower left; the forest is darker than the sunlit stone, so the pyramid
 *      stands light in front of it; a dark understorey band along its foot;
 *   3. the monument on its own layer, bottom up: nine battered terraces (one
 *      terrace drawn by one function and stamped nine times), each a sunlit
 *      limestone face under a bright lit top, the ledge's shadow on the face
 *      below it, a warm lit return at the right end and a cool one at the left;
 *      a few broad streaks of dark crust running down from the ledges; the
 *      stair as its own pale, rough projecting band; the summit shrine standing
 *      straight on the ninth terrace with its one door, its medial moulding and
 *      its upper facade; the comb set back on the roof as a closed slab in two
 *      square stages, its broken stubs standing out of its outline; the shrine
 *      and comb in the same limestone, the crust streaking them heaviest; a
 *      1 px ink line round the whole;
 *   4. the plaza lawn in calm bands, darker toward the viewer, the pyramid's
 *      shadow thrown down and to the left across it and the shade of trees
 *      behind the viewer across the rest of the near lawn;
 *   5. the monument laid over them.
 *
 * Deliberately wrong, at this size: the terraces are plain battered setbacks
 * (their mouldings and inset corners are left off), and their ends are shown
 * as returns a face-on view would barely show, so the light can model them;
 * the stair is a rough band with a few broken light strokes and three crisp
 * treads at its reconstructed foot, not a countable flight; the weathering is
 * a few broad streaks, not the real crust; the shrine's upper facade is a
 * plain battered band, and the comb-to-shrine ratio (comb somewhat taller) is
 * not measured; the canopy is simplified to a few masses kept low to frame the
 * pyramid; the sky and lawn are the set's brochure versions. The cast shadow
 * on the lawn follows the set's down-left convention (and the research's
 * lighting paragraph); the true afternoon shadow of a west-facing pyramid falls
 * east, behind it, away from the viewer. The shade across the near lawn is
 * from trees behind the viewer, which the plate does not claim.
 */
PAINTERS['roof-comb'] = function (ctx, W, H, B) {
  // The research palette: grey limestone, pushed a little sunnier.
  const S = {
    lit: '#c4bcab', // limestoneLit: right returns and terrace tops in sun
    stone: '#a39d8f', // limestone: the front face
    pale: '#d3cbb9', // limestonePale: consolidated stone, the stair band
    weather: '#55544c', // weatherDark: biological crust
    black: '#3b3d37', // weatherBlack: darkest streaks, the comb's stubs in shadow
    door: '#2e2a26', // doorway
    moss: '#6d7b45', // mossLedge
    lawn: '#7b9e45', // plazaLawn
    canopy: B.C.foliage,
    canopyDark: B.C.foliageDark,
    canopyLit: '#86a452',
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
  const cool = (h, t) => mixh(h, SHADOW, t);
  const wash = function (c, pts, color, a) {
    B.fill(c, pts, B.alpha(color, a));
  };
  const ellipse = function (c, x, y, rx, ry, style) {
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    c.fillStyle = style;
    c.fill();
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
  /** A 1 px ink line round everything painted on a layer, as in the pilot. */
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

  // ---------------------------------------------------------------------------
  // Layout. Temple I is 47 m (44 m in some texts): nine steep terraces, the
  // shrine on the ninth, the comb on the shrine. Drawn steep: the whole
  // monument about one and a half times as tall as its base is wide, the
  // terrace flanks near 70 degrees (the true ratio is unmeasured; see the
  // research's contested list). The shrine is narrower than the top terrace,
  // the comb narrower than the shrine.

  const CX = 184; // the stair's axis
  const GY = 246; // the pyramid's foot on the lawn
  const HORIZON = 226; // the far edge of the plaza, where the forest stands
  const BASE_HW = 74; // half the base width
  const BATTER = 2.1; // each terrace face leans in this much over its height
  const SET = 3.0; // and the next terrace starts this much further in
  const T = []; // terraces: bottom y, top y, half-width at foot, at top
  {
    let y = GY;
    let a = BASE_HW;
    for (let i = 0; i < 9; i++) {
      const h = 15.4 - i * 0.3;
      T.push({ y0: y, y1: y - h, a0: a, a1: a - BATTER, h: h });
      y -= h;
      a -= BATTER + SET;
    }
  }
  const TOP = Math.round(T[8].y1); // the ninth terrace's top, where the shrine stands
  // The shrine stands straight on the ninth terrace (half-width 31 there):
  // the door wall, a projecting medial moulding, the battered upper facade
  // about as tall as the wall below it, and a thin capping moulding.
  const SH = { hw: 25, wall: TOP - 17, molding: TOP - 21, mhw: 27, frieze0: 26, frieze1: 23.5, cap: TOP - 37, roof: TOP - 40 };
  const DOOR = { hw: 6, y0: TOP, y1: TOP - 13 };
  // The comb: set back on the roof, a closed slab in two square stages, the
  // upper one stepped clearly in; somewhat taller than the shrine.
  const COMB = { y0: SH.roof, hw0: 19, hw1: 18.5, mid: SH.roof - 27, hw2: 13, hw3: 12.5, top: 26 };
  // The stair: its own mass up the middle, from the plaza to the door.
  const ST = { hw0: 15, hw1: 12 };
  const stairHW = (y) => ST.hw1 + ((ST.hw0 - ST.hw1) * (y - TOP)) / (GY - TOP);

  // The stone's tones. Every face of the building is lit by the same sun, so
  // shrine and comb share the pyramid's tones; the crust is what darkens them.
  const FACE = S.lit; // the sunlit front, in full afternoon sun
  const TOPS = lit(S.pale, 0.4); // terrace tops, lips, the flat roofs
  const RIGHT = lit(S.pale, 0.32); // the right-hand returns, turned to the sun
  const LEFT = cool(S.stone, 0.4); // the left-hand returns, in cool shade
  const LEDGE = mixh(cool(FACE, 0.26), S.weather, 0.14); // the shadow a ledge throws on the face below
  const CRUST = S.weather;

  // ---------------------------------------------------------------------------
  // 1. Sky: the shared colours in flat steps (a canvas gradient is dithered,
  // and the dither turns to speckled rows in the indexed file).

  for (let k = 0; k < 38; k++) {
    B.fill(ctx, rect(0, k * 6, W, k === 37 ? HORIZON + 1 : (k + 1) * 6), mixh(B.C.skyTop, B.C.skyLow, (0.24 * k) / 37));
  }
  // One long flat fair-weather cloud, low on the left, well clear of the comb:
  // a few flat lobes on a flat base, a cooler underside.
  {
    const CL = B.layer(W, H);
    const k = CL.getContext('2d');
    const white = '#f3f7f8';
    for (const [x, y, rx, ry] of [[34, 94, 22, 6], [58, 89, 22, 9], [84, 92, 20, 7], [106, 95, 13, 4]]) ellipse(k, x, y, rx, ry, white);
    B.fill(k, rect(18, 94, 118, 98), white);
    k.save();
    k.globalCompositeOperation = 'source-atop';
    B.fill(k, rect(0, 95, W, 99), mixh(white, B.C.skyTop, 0.22));
    k.restore();
    k.globalCompositeOperation = 'destination-out';
    B.fill(k, rect(0, 98, W, 110), '#000');
    ctx.drawImage(CL, 0, 0);
  }

  // ---------------------------------------------------------------------------
  // 2. The canopy: a few large masses. One mass is drawn by one function: its
  // lobes merged into one flat body, a lit rim where the body is not covered
  // by itself moved down-left (the upper right), a shaded rim where it is not
  // covered by itself moved up-right (the lower left).

  const CAN = B.layer(W, H);
  const cc = CAN.getContext('2d');
  const mass = function (lobes, base, litc, dark, rim) {
    const shape = function (dx, dy, color) {
      const L = B.layer(W, H);
      const c = L.getContext('2d');
      for (const [x, y, rx, ry] of lobes) ellipse(c, x + dx, y + dy, rx, ry, color);
      return L;
    };
    const M = shape(0, 0, base);
    const mc = M.getContext('2d');
    const rimOf = function (color, dx, dy) {
      const R = shape(0, 0, color);
      const rc = R.getContext('2d');
      rc.globalCompositeOperation = 'destination-out';
      rc.drawImage(shape(dx, dy, '#000'), 0, 0);
      return R;
    };
    mc.drawImage(rimOf(dark, rim * 0.9, -rim * 0.7), 0, 0);
    mc.drawImage(rimOf(litc, -rim * 0.9, rim * 0.8), 0, 0);
    cc.drawImage(M, 0, 0);
  };
  {
    // The far band behind the pyramid, a little hazed: its top at about 70%
    // of the plate's height.
    const haze = (h) => mixh(h, B.C.skyLow, 0.16);
    mass(
      [[20, 214, 60, 18], [110, 208, 50, 14], [184, 206, 60, 12], [262, 208, 50, 14], [350, 212, 60, 18]],
      haze(S.canopy), haze(S.canopyLit), haze(mixh(S.canopy, S.canopyDark, 0.5)), 6,
    );
    // The near masses at the sides, rounder and a little higher, their tops
    // near two thirds of the height, framing the pyramid's foot.
    mass(
      [[-6, 208, 50, 26], [46, 214, 34, 16], [88, 221, 26, 9]],
      S.canopy, S.canopyLit, mixh(S.canopy, S.canopyDark, 0.6), 8,
    );
    mass(
      [[374, 208, 48, 28], [320, 214, 34, 16], [282, 221, 26, 9]],
      S.canopy, S.canopyLit, mixh(S.canopy, S.canopyDark, 0.6), 8,
    );
    // The understorey: one dark band along the forest's foot, its edge on the
    // lawn a few soft low mounds, not a ruled line.
    const under = mixh(S.canopy, S.canopyDark, 0.72);
    B.fill(cc, rect(0, 219, W, HORIZON), under);
    for (const [x, y, rx, ry] of [[10, 223, 30, 6], [62, 225, 34, 5], [118, 222, 30, 6], [176, 224, 40, 5], [236, 222, 32, 6], [292, 225, 36, 5], [350, 222, 34, 7]]) {
      ellipse(cc, x, y, rx, ry, under);
    }
  }

  // ---------------------------------------------------------------------------
  // 3. The monument, on its own layer.

  const MON = B.layer(W, H);
  const m = MON.getContext('2d');

  // The pyramid's outline, for clipping.
  const PYR = [];
  for (let i = 0; i < 9; i++) PYR.push([CX - T[i].a0, T[i].y0], [CX - T[i].a1, T[i].y1]);
  for (let i = 8; i >= 0; i--) PYR.push([CX + T[i].a1, T[i].y1], [CX + T[i].a0, T[i].y0]);

  const FR = 8; // the warm south return at the right end, turned to the sun
  const FL = 7; // the cool north return at the left end

  // One terrace: its battered face, the lit top along it and the ledge's
  // shadow on the face below it, the two end returns.
  const terrace = function (t) {
    const face = [[CX - t.a0, t.y0], [CX - t.a1, t.y1], [CX + t.a1, t.y1], [CX + t.a0, t.y0]];
    B.fill(m, face, FACE);
    const right = [[CX + t.a0 - FR, t.y0], [CX + t.a1 - FR, t.y1], [CX + t.a1, t.y1], [CX + t.a0, t.y0]];
    const left = [[CX - t.a0, t.y0], [CX - t.a1, t.y1], [CX - t.a1 + FL, t.y1], [CX - t.a0 + FL, t.y0]];
    B.fill(m, right, RIGHT);
    B.fill(m, left, LEFT);
    B.clip(m, face, function () {
      B.fill(m, rect(0, t.y1, W, t.y1 + 3), TOPS);
      B.fill(m, rect(0, t.y1 + 3, W, t.y1 + 6.5), LEDGE);
      B.fill(m, rect(CX + t.a1 - FR - 1, t.y1 + 3, W, t.y1 + 6.5), cool(RIGHT, 0.2));
      B.fill(m, rect(0, t.y1 + 3, CX - t.a1 + FL, t.y1 + 6.5), cool(LEFT, 0.22));
    });
  };
  for (let i = 0; i < 9; i++) terrace(T[i]);

  // Weathering: a few broad streaks of dark crust running down from the
  // ledges, one streak drawn once and stamped, laid as a translucent wash so
  // the lits and ledges keep their step across them.
  const streak = function (clipTo, x, w, y0, y1, a) {
    B.clip(m, clipTo, function () {
      wash(m, [[x, y0], [x + w, y0], [x + w * 0.8, y1], [x + w * 0.4, y1 + 4], [x + w * 0.1, y1]], CRUST, a);
    });
  };
  streak(PYR, CX - 56, 9, T[5].y1 + 3, T[1].y1, 0.32);
  streak(PYR, CX - 37, 7, T[8].y1 + 3, T[5].y1, 0.32);
  streak(PYR, CX + 30, 7, T[8].y1 + 3, T[4].y1, 0.28);
  streak(PYR, CX + 46, 9, T[4].y1 + 3, T[0].y1 + 4, 0.28);
  // A few dabs of moss and grass on the ledges, one drawn and stamped.
  for (const [i, x] of [[1, -40], [3, 34], [6, -24], [2, 52], [7, 20]]) {
    const y = T[i].y1;
    B.fill(m, [[CX + x - 4, y + 3], [CX + x - 3, y + 0.5], [CX + x + 3, y], [CX + x + 5, y + 3]], S.moss);
  }

  // The stair: its own mass, standing proud of the terraces from the plaza to
  // the door, paler than the faces. It throws a shadow down and to the left
  // across the terrace faces all the way up; its right cheek takes the sun.
  // Its surface is the rough unrestored band: ragged edges, a few broken light
  // strokes at irregular heights, two darker patches of loose rubble, and
  // three crisp treads at its reconstructed foot.
  {
    const r = B.rng(6);
    const L = [];
    const R = [];
    for (let y = GY; y > TOP; y -= 12) {
      const j = y === GY || y - 12 <= TOP ? 0 : (r() - 0.5) * 2.4;
      L.push([CX - stairHW(y) + j, y]);
      R.push([CX + stairHW(y) - (r() - 0.5) * 2.4 * (y === GY ? 0 : 1), y]);
    }
    L.push([CX - ST.hw1, TOP]);
    R.push([CX + ST.hw1, TOP]);
    const band = L.concat(R.reverse());
    B.clip(m, PYR, function () {
      wash(m, [[CX - ST.hw0 - 8, GY], [CX - ST.hw1 - 8, TOP + 3], [CX - ST.hw1, TOP], [CX - ST.hw0, GY]], SHADOW, 0.34);
    });
    const STAIR = lit(S.pale, 0.08);
    B.fill(m, band, STAIR);
    B.clip(m, band, function () {
      const rubble = function (y) {
        B.fill(m, [[CX - 20, y + 1], [CX - 8, y - 1], [CX + 2, y + 1], [CX + 9, y - 2], [CX + 20, y], [CX + 20, y + 7], [CX + 6, y + 9], [CX - 4, y + 7], [CX - 20, y + 8]], mixh(S.stone, S.pale, 0.25));
      };
      rubble(TOP + 44);
      rubble(TOP + 80);
      for (const [y, a, b] of [[TOP + 9, -10, 6], [TOP + 29, -4, 12], [TOP + 63, -12, 2], [TOP + 98, -6, 13]]) {
        B.fill(m, [[CX + a, y], [CX + b, y - 0.5], [CX + b - 1, y + 2], [CX + a + 1, y + 2]], lit(S.pale, 0.3));
      }
      for (let k = 0; k < 3; k++) {
        const y = GY - 5 - k * 5;
        B.fill(m, rect(CX - ST.hw0, y, CX + ST.hw0, y + 3), lit(S.pale, 0.35));
        B.fill(m, rect(CX - ST.hw0, y + 3, CX + ST.hw0, y + 5), cool(S.stone, 0.2));
      }
    });
    // Cheeks: the left in shade, the right a quiet lit edge.
    B.fill(m, [[CX - ST.hw0, GY], [CX - ST.hw1, TOP], [CX - ST.hw1 + 2.5, TOP], [CX - ST.hw0 + 2.5, GY]], LEFT);
    B.fill(m, [[CX + ST.hw0 - 3, GY], [CX + ST.hw1 - 3, TOP], [CX + ST.hw1, TOP], [CX + ST.hw0, GY]], lit(S.pale, 0.3));
  }

  // The shrine: one building standing straight on the ninth terrace. The door
  // wall with its one doorway; the medial moulding, projecting; the upper
  // facade above it, battered in, about as tall as the wall; a thin cap.
  // The same sunlit limestone as the terraces, streaked with crust.
  const SHRINE = FACE;
  const SHB = []; // the shrine's outline, for the streaks
  {
    const hw = SH.hw;
    const f0 = SH.frieze0;
    const f1 = SH.frieze1;
    SHB.push([CX - hw, TOP], [CX - hw, SH.wall], [CX - f0, SH.molding], [CX - f1, SH.cap], [CX - 24.5, SH.cap], [CX - 24.5, SH.roof]);
    SHB.push([CX + 24.5, SH.roof], [CX + 24.5, SH.cap], [CX + f1, SH.cap], [CX + f0, SH.molding], [CX + hw, SH.wall], [CX + hw, TOP]);
    // The door wall.
    B.fill(m, rect(CX - hw, SH.wall, CX + hw, TOP), SHRINE);
    B.fill(m, rect(CX + hw - 5, SH.wall, CX + hw, TOP), RIGHT);
    B.fill(m, rect(CX - hw, SH.wall, CX - hw + 4, TOP), LEFT);
    B.fill(m, rect(CX - hw, SH.wall, CX + hw, SH.wall + 3), cool(SHRINE, 0.3)); // the moulding's shadow
    // The medial moulding: one strong band, lit on its top, right end in sun.
    const mw = SH.mhw;
    B.fill(m, rect(CX - mw, SH.molding, CX + mw, SH.wall), SHRINE);
    B.fill(m, rect(CX - mw, SH.molding, CX + mw, SH.molding + 1.5), TOPS);
    B.fill(m, rect(CX + mw - 5, SH.molding, CX + mw, SH.wall), RIGHT);
    B.fill(m, rect(CX - mw, SH.molding, CX - mw + 4, SH.wall), LEFT);
    // The upper facade, battered in.
    const fr = [[CX - f0, SH.molding], [CX - f1, SH.cap], [CX + f1, SH.cap], [CX + f0, SH.molding]];
    B.fill(m, fr, mixh(SHRINE, S.weather, 0.06));
    B.clip(m, fr, function () {
      B.fill(m, [[CX + f0 - 5, SH.molding], [CX + f1 - 5, SH.cap], [CX + 40, SH.cap], [CX + 40, SH.molding]], RIGHT);
      B.fill(m, [[CX - 40, SH.molding], [CX - 40, SH.cap], [CX - f1 + 4, SH.cap], [CX - f0 + 4, SH.molding]], LEFT);
      B.fill(m, rect(CX - 40, SH.cap, CX + 40, SH.cap + 2.5), cool(SHRINE, 0.3));
    });
    // The cap: a thin band under the roof, its top lit.
    B.fill(m, rect(CX - 24.5, SH.roof, CX + 24.5, SH.cap), SHRINE);
    B.fill(m, rect(CX - 24.5, SH.roof, CX + 24.5, SH.roof + 1.5), TOPS);
    B.fill(m, rect(CX + 20, SH.roof, CX + 24.5, SH.cap), RIGHT);
    B.fill(m, rect(CX - 24.5, SH.roof + 1.5, CX - 21, SH.cap), LEFT);
    // Crust down the shrine, heavier than on the terraces.
    streak(SHB, CX - 21, 8, SH.roof + 2, TOP - 3, 0.42);
    streak(SHB, CX + 9, 6, SH.roof + 2, SH.wall - 1, 0.36);
    // The doorway: dark, centred over the stair, under a plain lintel.
    B.fill(m, rect(CX - DOOR.hw, DOOR.y1, CX + DOOR.hw, DOOR.y0), S.door);
  }

  // The roof comb: a closed masonry slab set back on the roof, narrower than
  // the shrine and taller than it, in two square stages with a flat top, in
  // the same limestone, its crust the heaviest on the building: broad dark
  // streaks down its face. The seated king once modelled on its front is gone;
  // what is left of his armature are a few rough stubs standing out of the
  // slab's outline, dark crust with their tops catching the sun. No marks on
  // the face that could be read as a figure.
  {
    const CB = FACE;
    const lower = [[CX - COMB.hw0, COMB.y0], [CX - COMB.hw1, COMB.mid], [CX + COMB.hw1, COMB.mid], [CX + COMB.hw0, COMB.y0]];
    const upper = [[CX - COMB.hw2, COMB.mid], [CX - COMB.hw3, COMB.top], [CX + COMB.hw3, COMB.top], [CX + COMB.hw2, COMB.mid]];
    const whole = lower.concat(upper);
    // The stubs, one drawn once and stamped: a rough block out of the slab,
    // its top and right side lit.
    const stub = function (x, y, w, h) {
      B.fill(m, [[x, y + h], [x, y + 1], [x + 1, y], [x + w, y], [x + w, y + h]], S.black);
      B.fill(m, rect(x + 1, y, x + w, y + 1.5), RIGHT);
    };
    stub(CX - 9, COMB.top - 5, 5, 6); // on the crest, left of the axis
    stub(CX + 4, COMB.top - 3, 4, 4); // on the crest, lower, right
    stub(CX - COMB.hw1 + 1, COMB.mid - 4, 4, 5); // on the left step
    stub(CX + COMB.hw2 - 1, COMB.mid - 17, 3, 3); // out of the upper stage's right side
    for (const p of [lower, upper]) B.fill(m, p, CB);
    // The lit right return and the cool left return of each stage.
    B.fill(m, [[CX + COMB.hw0 - 5, COMB.y0], [CX + COMB.hw1 - 5, COMB.mid], [CX + COMB.hw1, COMB.mid], [CX + COMB.hw0, COMB.y0]], RIGHT);
    B.fill(m, [[CX + COMB.hw2 - 4, COMB.mid], [CX + COMB.hw3 - 4, COMB.top], [CX + COMB.hw3, COMB.top], [CX + COMB.hw2, COMB.mid]], RIGHT);
    B.fill(m, [[CX - COMB.hw0, COMB.y0], [CX - COMB.hw1, COMB.mid], [CX - COMB.hw1 + 4, COMB.mid], [CX - COMB.hw0 + 4, COMB.y0]], LEFT);
    B.fill(m, [[CX - COMB.hw2, COMB.mid], [CX - COMB.hw3, COMB.top], [CX - COMB.hw3 + 3, COMB.top], [CX - COMB.hw2 + 3, COMB.mid]], LEFT);
    // The step between the stages, lit on top, the upper stage's shadow down
    // and to the left on the lower one; the flat top, lit.
    B.fill(m, rect(CX - COMB.hw1, COMB.mid, CX + COMB.hw1, COMB.mid + 2), TOPS);
    B.fill(m, rect(CX - COMB.hw1, COMB.mid + 2, CX + COMB.hw2 - 4, COMB.mid + 5), cool(CB, 0.3));
    B.fill(m, rect(CX - COMB.hw3, COMB.top, CX + COMB.hw3, COMB.top + 2), TOPS);
    // The crust: broad streaks down both stages.
    streak(whole, CX - 14, 7, COMB.mid + 5, COMB.y0, 0.42);
    streak(whole, CX + 3, 5, COMB.mid + 5, COMB.y0 - 4, 0.36);
    streak(whole, CX - 7, 5, COMB.top + 2, COMB.mid - 1, 0.4);
    // The comb's shadow on the roof, down and to the left of its foot.
    B.fill(m, rect(CX - 24.5, SH.roof, CX - COMB.hw0, SH.roof + 2), cool(SHRINE, 0.3));
  }

  inkRound(MON, 0.9);

  // ---------------------------------------------------------------------------
  // 4. The plaza lawn: calm bands, the far one in the forest's shade, the near
  // one darker toward the viewer; the shadows thrown down and to the left
  // across it.

  const lawnFar = mixh(S.lawn, S.canopy, 0.4);
  const lawnMid = lit(S.lawn, 0.06);
  const lawnNear = mixh(S.lawn, S.canopy, 0.3);
  B.fill(ctx, rect(0, HORIZON - 4, W, 238), lawnFar);
  B.fill(ctx, rect(0, 238, W, 256), lawnMid);
  B.fill(ctx, rect(0, 256, W, H), lawnNear);
  ctx.drawImage(CAN, 0, 0);
  {
    // Every shadow on the lawn goes on one layer at full strength and is
    // tinted once, so where two overlap they stay one flat tone.
    const flat = B.layer(W, H);
    const fc = flat.getContext('2d');
    // The shade of trees behind the viewer, off the frame at the lower right
    // and left: broad flat shapes across the near lawn.
    B.fill(fc, [[W, 252], [W, H], [214, H], [236, 270], [290, 262], [330, 254]], '#000');
    B.fill(fc, [[0, 266], [50, 262], [100, 266], [120, H], [0, H]], '#000');
    // The pyramid's shadow: its silhouette laid down on the lawn, sheared
    // down and to the left from the foot.
    const kx = 1.2;
    const ky = 0.34;
    fc.setTransform(1, 0, kx, -ky, -kx * GY, GY * (1 + ky));
    fc.drawImage(silhouette(MON, '#000000'), 0, 0);
    fc.setTransform(1, 0, 0, 1, 0, 0);
    fc.fillRect(CX - BASE_HW - 1, GY - 2, 2 * BASE_HW + 2, 3);
    fc.globalCompositeOperation = 'source-in';
    fc.fillStyle = B.alpha(mixh(SHADOW, S.canopyDark, 0.45), 0.42);
    fc.fillRect(0, 0, W, H);
    ctx.drawImage(flat, 0, 0);
  }

  // 5. The monument.
  ctx.drawImage(MON, 0, 0);
};
