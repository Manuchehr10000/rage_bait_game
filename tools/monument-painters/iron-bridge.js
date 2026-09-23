/**
 * Chapter 11 vignette: the Iron Bridge over the Severn, Coalbrookdale.
 *
 * Asset map-monument-ch11-industrial, 92 x 70 world px, painted 368 x 280. The
 * view is the downstream (east) face from the riverside, squared up almost to
 * an elevation, looking upstream (west): south bank on the left, the town
 * bank on the right. Research: tools/monument-painters/specs/iron-bridge.json.
 *
 * Built the way the Abu Simbel pilot is built, every shape opaque and flat:
 *   1. the shared sky, cloudless as the pilot's, about a fifth of the plate;
 *   2. the gorge as three big canopy masses, pushed back toward the sky so
 *      the iron is the darkest, warmest thing in front of them: the far ridge
 *      palest and coolest, its skyline well above the deck; the south spur on
 *      the left, turned; the sunlit town spur on the right with two brick
 *      cottages; through the arch, the far reach, lighter still, and the
 *      river going on under it;
 *   3. behind the deck at the south end, the tollhouse: its tile roof, a
 *      chimney on the gable, a strip of upper wall and the lit gable end;
 *   4. the stone: the further south pier at the edge, the south pier, the
 *      plinth under the land arch, the north corner pier and abutment, and the
 *      footings under the arch feet, so every rib stands on masonry;
 *   5. the ironwork, back to front: inside the arch mouth the four rear ribs
 *      receding; the face frame (three concentric arcs, a few radial links,
 *      end uprights, the ogee loop between them, one ring each end); the south
 *      land arch on its plinth; the railing as one band (rails, a few posts,
 *      a soft comb of close-set bars over a see-through screen); the deck.
 *      Then the light across it, cool on the left, warm on the right, and the
 *      deck's shadow on the spandrels;
 *   6. the south bank and its riverside tree;
 *   7. the river: the Severn's olive taking the sky, deepening toward the
 *      viewer; the bridge and its stone turned over as a few flat tones,
 *      broken by bands of open water, closing the arch into a ring; two long
 *      ripples; the bridge's and the piers' shadows on the water, down and to
 *      the left.
 *
 * Light from the upper right. The iron takes three values: its sunlit local
 * colour, a warm lit edge on the upward and right-facing surfaces, and a cool
 * turned edge on the soffits and left-facing faces; a wash across the whole
 * frame then cools the left end and warms the right.
 *
 * The two ends of the face frame are one half drawn and mirrored (pillar 4);
 * the ring is painted once and stamped at both ends; the railing bars, the
 * posts and the cottage are stamped.
 */
PAINTERS['iron-bridge'] = function (ctx, W, H, B) {
  // The research palette, a little sunnier than life.
  const S = {
    ironSun: '#8c4e36', // the 2018 paint in full sun
    iron: '#6e3829', // its local colour
    ironShade: '#4d2419', // under the arch, the receding ribs
    stone: '#b0a488', // buff-grey ashlar in sun
    stoneShade: '#6f695c', // turned away, and the joints
    brick: '#8b5a45', // tollhouse and town brick
    roof: '#57565b', // tile roofs
    river: '#4e5c43', // the Severn, olive
    ripple: '#7d938a', // the river where it takes the sky
    bank: '#6d5b45', // mud and towpath
  };
  const INK = B.C.ink;
  const SHADOW = B.C.shadow;
  const SUN = B.C.sun;

  // ---------------------------------------------------------------------------
  // Helpers (from the pilot).

  const mixh = function (a, b, t) {
    const x = B.hex(a);
    const y = B.hex(b);
    let s = '#';
    for (let i = 0; i < 3; i++) s += Math.round(x[i] + (y[i] - x[i]) * t).toString(16).padStart(2, '0');
    return s;
  };
  const lit = (h, t) => mixh(h, SUN, t);
  const shd = (h, t) => mixh(h, SHADOW, t);
  const line = function (c, x0, y0, x1, y1, w, style, cap) {
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x1, y1);
    c.lineWidth = w;
    c.lineCap = cap || 'round';
    c.strokeStyle = style;
    c.stroke();
  };
  const circle = function (c, x, y, r, style) {
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fillStyle = style;
    c.fill();
  };
  const rect = function (c, x0, y0, x1, y1, style) {
    c.fillStyle = style;
    c.fillRect(x0, y0, x1 - x0, y1 - y0);
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
  /** Over a layer's own pixels only. */
  const atop = function (c, fn) {
    c.save();
    c.globalCompositeOperation = 'source-atop';
    fn();
    c.restore();
  };
  /** Sample a function of x into a polyline. */
  const curve = function (f, x0, x1, step) {
    const pts = [];
    for (let x = x0; x < x1; x += step) pts.push([x, f(x)]);
    pts.push([x1, f(x1)]);
    return pts;
  };
  const annulus = function (c, x, y, r0, r1, a0, a1) {
    const s = a0 === undefined ? Math.PI : a0;
    const e = a1 === undefined ? Math.PI * 2 : a1;
    c.beginPath();
    c.arc(x, y, r1, s, e);
    c.arc(x, y, r0, e, s, true);
    c.closePath();
  };
  const arcStroke = function (c, x, y, r, a0, a1, w, style) {
    c.beginPath();
    c.arc(x, y, r, a0, a1);
    c.lineWidth = w;
    c.lineCap = 'butt';
    c.strokeStyle = style;
    c.stroke();
  };
  /** A vertical gradient between two heights through the given stops. */
  const vgrad = function (c, y0, y1, stops) {
    const g = c.createLinearGradient(0, y0, 0, y1);
    for (const [t, col] of stops) g.addColorStop(t, col);
    return g;
  };
  /** A cast shadow: the set's translucent cool wash, as B.castShadow lays it. */
  const shadowOn = function (c, pts, a) {
    B.fill(c, pts, B.alpha(SHADOW, a === undefined ? 0.28 : a));
  };

  // ---------------------------------------------------------------------------
  // Layout. The span is 100 ft 6 in; the face rib's outer arc spans about 60%
  // of the plate. Semicircular arcs share one centre on the springing line.
  // The water is close under the springing, low in the plate, and the
  // reflection a little shallower than the thing, so the arch and its image
  // close into a ring inside the frame.

  const CX = 204; // the crown, a touch right: the south end carries more
  const SP = 190; // the springing line
  const WL = 195; // the water
  const SQ = 0.82; // the reflection's depth against the thing's
  // Three concentric arcs: [inner radius, outer radius].
  const ARCS = [[80, 86], [93, 98], [105, 110]];
  const HALF = 128; // half the ironwork's length, to the outer uprights
  const UPR = [[HALF, HALF - 5], [116, 112]]; // the two uprights each end, dx from the crown
  const SAG = 7; // how much lower the deck is at the ends than at the crown
  const DECK = 7; // the fascia's depth
  const RAIL = 18; // the railing's height: two and a half fasciae
  /** The deck's underside: over the crown of the inner arc, falling gently. */
  const deckBot = (x) => {
    const u = (x - CX) / HALF;
    return SP - ARCS[0][1] + SAG * Math.min(u * u, 2.2);
  };
  const deckTop = (x) => deckBot(x) - DECK;
  const railTop = (x) => deckTop(x) - RAIL;
  const PIER_L = [CX - HALF - 16, CX - HALF]; // the south pier
  const CP = [CX + HALF, CX + HALF + 14]; // the north corner pier
  // The four rear ribs, scaled toward a vanishing point just right of the
  // crown and just under the water: the eye is low and a little downstream.
  const VP = [CX + 12, SP + 4];
  const sc = (k) => Math.pow(0.94, k);
  const toVP = (x, y, k) => [VP[0] + (x - VP[0]) * sc(k), VP[1] + (y - VP[1]) * sc(k)];
  // The ring in each end spandrel: as large as fits between the deck and the
  // outer arc, beside the inner upright.
  const RING_R = 12.5; // to the outside of the ring
  let RING_DX = 80;
  while (RING_DX < 120) {
    const cy = deckBot(CX + RING_DX) + 0.5 + RING_R;
    if (Math.hypot(RING_DX, SP - cy) >= ARCS[2][1] + RING_R) break;
    RING_DX += 0.25;
  }
  const RING_Y = deckBot(CX + RING_DX) + 0.5 + RING_R;

  // The iron's three values: the paint in the morning sun, its lit edges
  // warmer still, its turned edges cool.
  const IRON = S.ironSun;
  const IRON_LIT = lit(S.ironSun, 0.24);
  const IRON_COOL = mixh(S.ironShade, SHADOW, 0.3);

  // The set's foliage, pushed back toward the sky so the gorge sits a clear
  // value step behind the iron: the far ridge palest and coolest, the two
  // spurs a little nearer and greener, the sunlit town spur warmest.
  const WOOD_LOW = mixh(B.C.foliage, B.C.foliageDark, 0.5);
  const FAR_RIDGE = mixh(lit(B.C.foliage, 0.1), B.C.skyLow, 0.5);
  const SPUR_S = mixh(shd(B.C.foliage, 0.1), B.C.skyLow, 0.24);
  const SPUR_N = mixh(lit(B.C.foliage, 0.2), B.C.skyLow, 0.22);

  // ---------------------------------------------------------------------------
  // 1. The shared sky, cloudless as the pilot's, down behind the ridge.

  B.sky(ctx, W, 130);

  // ---------------------------------------------------------------------------
  // 2. The gorge: a few big canopy masses, not a row of crowns.

  /**
   * A canopy mass: a flat shape whose top is a few broad domes through the
   * crest points, reaching down to `bottom`. Its upper right is rimmed with
   * light, its foot washed a little darker toward the river.
   */
  const canopyPath = function (c, crest, bottom, dx, dy) {
    c.beginPath();
    c.moveTo(crest[0][0] + dx, bottom);
    c.lineTo(crest[0][0] + dx, crest[0][1] + dy);
    for (let i = 1; i < crest.length; i++) {
      const [x0, y0] = crest[i - 1];
      const [x1, y1] = crest[i];
      const bulge = (x1 - x0) * 0.28;
      c.quadraticCurveTo((x0 + x1) / 2 + dx, Math.min(y0, y1) - bulge + dy, x1 + dx, y1 + dy);
    }
    c.lineTo(crest[crest.length - 1][0] + dx, bottom);
    c.closePath();
  };
  const canopy = function (crest, base, bottom, rimT, footT) {
    canopyPath(ctx, crest, bottom, 2, -2);
    ctx.fillStyle = lit(base, rimT === undefined ? 0.2 : rimT);
    ctx.fill();
    canopyPath(ctx, crest, bottom, 0, 0);
    const top = Math.min.apply(null, crest.map((q) => q[1]));
    ctx.fillStyle = vgrad(ctx, top, bottom, [[0, base], [0.5, base], [1, shd(base, footT === undefined ? 0.18 : footT)]]);
    ctx.fill();
  };

  // The far ridge: both gorge sides merging behind the bridge, its skyline
  // well above the deck, lowest over the river.
  canopy([[-6, 66], [70, 60], [150, 72], [236, 76], [300, 64], [374, 58]], FAR_RIDGE, WL + 1, 0.22, 0.1);

  // Through the arch: the far reach, lighter and cooler still, one spur from
  // the south bank in its shade, and the river going on under them.
  const FAR = mixh(FAR_RIDGE, B.C.skyLow, 0.2);
  const FAR_SHADE = mixh(SPUR_S, B.C.skyLow, 0.34);
  B.fill(ctx, [[120, 132], [300, 132], [300, WL], [120, WL]], FAR);
  B.fill(ctx, [[120, 132], [150, 138], [184, 154], [214, 174], [236, 186], [120, 186]], FAR_SHADE);
  rect(ctx, 120, 187, 300, WL + 1, mixh(S.river, B.C.skyLow, 0.5));
  rect(ctx, 120, 186, 300, 187.5, mixh(S.bank, FAR_SHADE, 0.4));

  // The south spur on the left, turned from the sun: two big masses.
  canopy([[-6, 64], [60, 60], [118, 96], [148, 150]], SPUR_S, WL + 1, 0.18);

  // The town spur on the right, in the sun, the town up its side: one plain
  // brick cottage, gable to the viewer, stamped twice, the spur's trees in
  // front of their feet.
  const cottage = B.layer(26, 28);
  {
    const c = cottage.getContext('2d');
    const wallLit = lit(S.brick, 0.26);
    const wallCool = shd(S.brick, 0.26);
    B.fill(c, [[1, 28], [1, 13], [5, 9], [5, 28]], wallCool); // left flank, turned
    B.fill(c, [[5, 28], [5, 12], [14, 3], [23, 12], [23, 28]], wallLit); // the gable front
    B.fill(c, [[0, 13.5], [5, 8.5], [14, 1], [25, 12], [23, 13.5], [14, 4], [5, 11], [1, 15]], mixh(S.roof, INK, 0.1)); // verges
    B.fill(c, [[12.5, 16], [15.5, 16], [15.5, 20], [12.5, 20]], shd(S.brick, 0.5)); // one dark window
  }
  for (const [x, y] of [[286, 64], [318, 58]]) ctx.drawImage(cottage, x, y);
  canopy([[262, 128], [300, 86], [374, 76]], SPUR_N, WL + 1, 0.22);

  // ---------------------------------------------------------------------------
  // 3. The tollhouse, behind the deck at the south end: the tile roof, the
  // chimney on the gable, a strip of shaded upper wall under the eaves and
  // the gable end lit on the right. The railing and deck hide the rest.

  {
    const EAVE = 84;
    const RIDGE = 70;
    const X0 = 20;
    const X1 = 50; // the gable corner
    const ROOF = lit(mixh(S.roof, SHADOW, 0.12), 0.14);
    B.fill(ctx, [[X0 + 2, 118], [X0 + 2, EAVE], [X1, EAVE], [X1, 118]], shd(S.brick, 0.3)); // near wall, shaded
    rect(ctx, X0 + 2, EAVE, X1, EAVE + 2.5, shd(S.brick, 0.5)); // under the eaves
    B.fill(ctx, [[X1, 118], [X1, EAVE], [X1 + 9, EAVE], [X1 + 9, 118]], lit(S.brick, 0.22)); // gable end wall, lit
    B.fill(ctx, [[X1, EAVE + 0.5], [X1, RIDGE], [X1 + 9, EAVE + 0.5]], lit(S.brick, 0.22)); // gable
    B.fill(ctx, [[X0 - 2, EAVE + 1], [X0 + 6, RIDGE], [X1, RIDGE], [X1, EAVE + 1]], ROOF); // roof plane
    line(ctx, X0 + 6, RIDGE + 0.6, X1, RIDGE + 0.6, 1.4, lit(ROOF, 0.3), 'butt');
    B.fill(ctx, [[X1 - 6, RIDGE + 1], [X1 - 6, 60], [X1 + 1, 60], [X1 + 1, RIDGE + 1]], lit(S.brick, 0.16)); // chimney
    rect(ctx, X1 - 6, 60, X1 - 3.5, RIDGE + 1, shd(S.brick, 0.25));
    rect(ctx, X1 - 7, 58, X1 + 2, 61, ROOF); // its cap
    // The ink round the roofline and gable, left open below the eaves.
    ctx.beginPath();
    const ol = [[X0 - 2, EAVE + 1], [X0 + 6, RIDGE], [X1 - 6, RIDGE], [X1 - 6, 58], [X1 + 1, 58], [X1 + 1, RIDGE + 1], [X1 + 9, EAVE + 0.5], [X1 + 9, 118]];
    ol.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
    ctx.lineJoin = 'round';
    ctx.lineWidth = 1;
    ctx.strokeStyle = B.alpha(INK, 0.85);
    ctx.stroke();
  }

  // ---------------------------------------------------------------------------
  // 4. Stone: lit buff ashlar, its front faces pushed toward the sun, its left
  // flanks turned. Painted on its own layer.

  const STONE = lit(S.stone, 0.16);
  const STONE_COOL = shd(S.stone, 0.32);
  const JOINT = mixh(S.stone, S.stoneShade, 0.5);
  const stoneL = B.layer();
  const sc0 = stoneL.getContext('2d');
  /**
   * Ashlar: a flat lit face with long course lines. Walls wide enough get
   * perpends, two or more per course and offset course to course; narrow
   * piers get none, so no joint ever stands alone like a letter.
   */
  const ashlar = function (c, pts, seed) {
    const b = B.bounds(pts);
    B.fill(c, pts, STONE);
    const r = B.rng(seed);
    B.clip(c, pts, function () {
      let row = 0;
      for (let y = b.y1 - 9; y > b.y0 + 4; y -= 11) {
        rect(c, b.x0, y, b.x1, y + 1, JOINT);
        if (b.w > 24) {
          for (let x = b.x0 + (row % 2 ? 6 : 17) + r() * 3; x < b.x1 - 4; x += 22) rect(c, x, y + 1, x + 1, y + 11, JOINT);
        }
        row++;
      }
    });
  };
  /** A pier: ashlar, its left flank turned, a lit capstone. */
  const pier = function (c, x0, x1, top, seed) {
    const pts = [[x0, WL + 2], [x0, top], [x1, top], [x1, WL + 2]];
    ashlar(c, pts, seed);
    rect(c, x0, top, x0 + 4, WL + 2, STONE_COOL);
    rect(c, x0 - 1.5, top - 3, x1 + 1.5, top, lit(STONE, 0.3));
    rect(c, x0 - 1.5, top - 3, x0 + 2, top, STONE_COOL);
    rect(c, x0, top, x1, top + 1.5, mixh(STONE, STONE_COOL, 0.6)); // under the cap
    return pts;
  };

  // The land arch's span, and the plinth it stands on at the towpath.
  const LX = PIER_L[0] - 19; // its centre: legs from the far pier to the south pier
  const LARCS = [[11.5, 14.5], [16.5, 19]];
  const LSP = deckBot(LX) + 0.5 + LARCS[1][1]; // its springing
  const LFOOT = 176; // the top of the plinth
  const TOW = 184; // the towpath

  // Seen through the land arch: the lit bank beyond, and the south woods
  // above it in the sun on the upstream side.
  B.fill(ctx, [[LX - 19, TOW], [LX - 19, deckBot(LX - 19)], [LX + 19, deckBot(LX + 19)], [LX + 19, TOW]], shd(SPUR_S, 0.14));
  B.fill(ctx, [[LX - 19, TOW], [LX - 19, 160], [LX - 6, 152], [LX + 10, 158], [LX + 19, 166], [LX + 19, TOW]], SPUR_N);
  B.fill(ctx, [[LX - 19, TOW], [LX - 19, 170], [LX + 19, 174], [LX + 19, TOW]], lit(S.bank, 0.36));

  // The further south pier at the frame edge, beyond the land arch; the
  // riverside tree covers its top.
  const pierF = pier(sc0, -4, LX - 19, railTop(LX - 19) + 1, 3);
  // The plinth under the land arch's legs.
  const plinth = [[LX - 19, WL + 2], [LX - 19, LFOOT], [LX + 19, LFOOT], [LX + 19, WL + 2]];
  ashlar(sc0, plinth, 4);
  rect(sc0, LX - 20, LFOOT - 1, LX + 20, LFOOT + 1.5, lit(STONE, 0.3));
  // The towpath passes through at plinth height: its bank, darker under the
  // arch, shows where the stone steps back.
  rect(sc0, LX - 13, LFOOT, LX + 13, TOW, mixh(lit(S.bank, 0.2), STONE_COOL, 0.3));

  // The north abutment runs into the bank, its top at the roadway; its river
  // face in the sun.
  const abutTop = deckTop(CP[1]) + 2;
  const abut = [[CP[1], WL + 2], [CP[1], abutTop], [W + 2, abutTop + 3], [W + 2, WL + 2]];
  ashlar(sc0, abut, 6);
  B.fill(sc0, [[CP[1], abutTop], [W + 2, abutTop + 3], [W + 2, abutTop + 6], [CP[1], abutTop + 3]], lit(STONE, 0.3)); // coping
  const pierL = pier(sc0, PIER_L[0], PIER_L[1], railTop(PIER_L[1]) + 1, 5);
  const cpier = pier(sc0, CP[0], CP[1], railTop(CP[0]) - 2, 7);

  // The footings: the abutments run in under the ironwork as low plinths and
  // recede under the arch with the ribs.
  const footTop = SP;
  const footBot = WL + 2;
  const innerL = CX - ARCS[0][0];
  const innerR = CX + ARCS[0][0];
  const rearL = toVP(innerL - 2, footTop, 4)[0];
  const rearR = toVP(innerR + 2, footTop, 4)[0];
  const rTop = toVP(0, footTop, 4)[1];
  const rBot = toVP(0, footBot, 4)[1];
  B.fill(sc0, [[innerL, footTop], [rearL, rTop], [rearL, rBot], [innerL, footBot]], STONE_COOL);
  B.fill(sc0, [[innerR, footTop], [rearR, rTop], [rearR, rBot], [innerR, footBot]], shd(S.stone, 0.45));
  for (const [x0, x1] of [[PIER_L[1], innerL + 3], [innerR - 3, CP[0]]]) {
    rect(sc0, x0, footTop, x1, footBot, STONE);
    rect(sc0, x0, footTop, x1, footTop + 1.5, lit(STONE, 0.3));
  }
  // The light across the stone: the south end cool, the north end warm.
  atop(sc0, function () {
    // Flat washes, one per end, so the palette stays a handful of inks.
    rect(sc0, 0, 0, CX, H, B.alpha(SHADOW, 0.2));
    rect(sc0, CX, 0, W, H, B.alpha(SUN, 0.2));
    // The ironwork's shadow on the south pier and on the plinth, down and
    // left of the uprights and the land arch.
    shadowOn(sc0, [[PIER_L[1], railTop(PIER_L[1]) + 12], [PIER_L[1], SP], [PIER_L[1] - 8, SP + 4], [PIER_L[1] - 8, railTop(PIER_L[1]) + 18]], 0.34);
    shadowOn(sc0, [[LX - 19, LFOOT], [LX + 19, LFOOT], [LX + 12, LFOOT + 6], [LX - 26, LFOOT + 6]], 0.3);
  });
  for (const p of [pierF, plinth, pierL, cpier, abut]) B.outline(sc0, p, 1.1);
  B.outline(sc0, [[PIER_L[1], footTop], [rearL, rTop], [rearL, footBot]], 1);
  B.outline(sc0, [[CP[0], footTop], [rearR, rTop], [rearR, footBot]], 1);
  ctx.drawImage(stoneL, 0, 0);

  // ---------------------------------------------------------------------------
  // 5. The ironwork.

  // 5a. The arch mouth: the underside of the five ribs and the deck, seen
  // through the face intrados. The four rear ribs recede as arcs, each with
  // its inner edge lit off the river.
  const mouth = B.layer();
  {
    const c = mouth.getContext('2d');
    c.save();
    c.beginPath();
    c.arc(CX, SP, ARCS[0][0] + 1, Math.PI, Math.PI * 2);
    c.closePath();
    c.clip();
    c.fillStyle = mixh(mixh(S.ironShade, S.iron, 0.3), SHADOW, 0.3);
    c.fillRect(0, 0, W, SP + 1);
    // See through, inside the last rib.
    const [x4, y4] = toVP(CX, SP, 4);
    c.globalCompositeOperation = 'destination-out';
    c.beginPath();
    c.arc(x4, y4, ARCS[0][0] * sc(4), Math.PI, Math.PI * 2);
    c.lineTo(x4 + ARCS[0][0] * sc(4), SP + 4);
    c.lineTo(x4 - ARCS[0][0] * sc(4), SP + 4);
    c.closePath();
    c.fill();
    c.globalCompositeOperation = 'source-over';
    for (let k = 4; k >= 1; k--) {
      const [x, y] = toVP(CX, SP, k);
      const s = sc(k);
      annulus(c, x, y, ARCS[0][0] * s, ARCS[0][1] * s);
      c.fillStyle = mixh(S.ironShade, S.iron, 0.45);
      c.fill();
      arcStroke(c, x, y, ARCS[0][0] * s + 0.8, Math.PI * 1.02, Math.PI * 1.98, 1.6, mixh(S.ironShade, S.ironSun, 0.75));
    }
    c.restore();
  }
  ctx.drawImage(mouth, 0, 0);

  // 5b. The face frame. Everything below the deck is clipped to the deck's
  // underside, so the two outer arcs die into it short of the crown, each at
  // its own point, and only the inner one reaches mid-span.
  const below = [[-10, H]].concat(curve(deckBot, -10, W + 10, 4)).concat([[W + 10, H]]);
  const span = B.layer();
  {
    const c = span.getContext('2d');
    B.clip(c, below, function () {
      for (const [r0, r1] of ARCS) {
        annulus(c, CX, SP, r0, r1);
        c.fillStyle = IRON;
        c.fill();
      }
      // A few radial links between the arcs, like the joints of a stone arch.
      for (let k = 0; k < 2; k++) {
        const r0 = ARCS[k][1] - 0.5;
        const r1 = ARCS[k + 1][0] + 0.5;
        for (const a of [12, 32, 52, 72]) {
          for (const s of [-1, 1]) {
            const t = (a * Math.PI) / 180;
            line(c, CX + s * Math.cos(t) * r0, SP - Math.sin(t) * r0, CX + s * Math.cos(t) * r1, SP - Math.sin(t) * r1, 2.4, IRON, 'butt');
          }
        }
      }
    });
    // One end drawn in dx from the crown, mirrored for the other.
    const endPart = function (s) {
      const X = (dx) => CX + s * dx;
      // The pair of uprights, foot to deck, with horizontal braces.
      for (const [a, b] of UPR) {
        B.fill(c, [[X(a), SP], [X(a), deckBot(X(a))], [X(b), deckBot(X(b))], [X(b), SP]], IRON);
      }
      for (const h of [4, 70]) B.fill(c, [[X(UPR[0][0]), SP - h], [X(UPR[1][1]), SP - h], [X(UPR[1][1]), SP - h - 2.6], [X(UPR[0][0]), SP - h - 2.6]], IRON);
      // Between the uprights, an ogee loop: reverse curves swelling out to
      // the posts and drawn in to a point at top and bottom.
      const xm = X((UPR[0][1] + UPR[1][0]) / 2);
      const w = 2.4;
      c.beginPath();
      for (const d of [-1, 1]) {
        c.moveTo(xm, SP - 7);
        c.bezierCurveTo(xm, SP - 16, xm + d * w, SP - 18, xm + d * w, SP - 35);
        c.bezierCurveTo(xm + d * w, SP - 52, xm, SP - 55, xm, SP - 67);
      }
      c.lineWidth = 2.2;
      c.strokeStyle = IRON;
      c.stroke();
      // An ogee from the inner upright down to the outer arc, under the ring.
      c.beginPath();
      c.moveTo(X(UPR[1][1]), SP - 40);
      c.bezierCurveTo(X(UPR[1][1] - 5), SP - 40, X(RING_DX + 4), SP - 38, X(RING_DX + 2), SP - 30);
      c.lineWidth = 2.2;
      c.stroke();
    };
    endPart(-1);
    endPart(1);
    // Light: each arc's back lit from its right haunch over the crown (the
    // outer one widest), each arc's soffit turned on the left, each upright
    // lit on its right flank and turned on its left.
    atop(c, function () {
      for (const [r0, r1] of ARCS) {
        arcStroke(c, CX, SP, r1 - 1, Math.PI * 1.3, Math.PI * 2, 2.2, IRON_LIT);
        arcStroke(c, CX, SP, r0 + 1, Math.PI, Math.PI * 1.6, 2.2, IRON_COOL);
      }
      for (const s of [-1, 1]) {
        for (const [a, b] of UPR) {
          const x0 = Math.min(CX + s * a, CX + s * b);
          const x1 = Math.max(CX + s * a, CX + s * b);
          rect(c, x0, 60, x0 + 1.6, SP, IRON_COOL);
          rect(c, x1 - 1.6, 60, x1, SP, IRON_LIT);
        }
        for (const h of [4, 70]) {
          const x0 = Math.min(CX + s * UPR[0][0], CX + s * UPR[1][1]);
          rect(c, x0, SP - h - 2.6, x0 + (UPR[0][0] - UPR[1][1]), SP - h - 1.4, IRON_LIT);
        }
      }
    });
  }
  // The ring, painted once, lit on its upper right, turned on its lower left,
  // stamped at both ends in clear space.
  {
    const R = RING_R - 1.6;
    const ring = B.layer(34, 34);
    const c = ring.getContext('2d');
    c.beginPath();
    c.arc(17, 17, R, 0, Math.PI * 2);
    c.lineWidth = 3.2;
    c.strokeStyle = IRON;
    c.stroke();
    atop(c, function () {
      arcStroke(c, 17, 17, R + 0.9, Math.PI * 1.25, Math.PI * 2.1, 1.6, IRON_LIT);
      arcStroke(c, 17, 17, R - 0.9, Math.PI * 0.25, Math.PI * 1.1, 1.4, IRON_COOL);
    });
    const sc2 = span.getContext('2d');
    for (const s of [-1, 1]) sc2.drawImage(ring, Math.round(CX + s * RING_DX) - 17, Math.round(RING_Y) - 17);
  }

  // The south land arch between the two piers: an iron arch over the towpath,
  // round-headed, its legs standing on the stone plinth, its crown under the
  // deck.
  const land = B.layer();
  {
    const c = land.getContext('2d');
    for (const [r0, r1] of LARCS) {
      annulus(c, LX, LSP, r0, r1);
      c.fillStyle = IRON;
      c.fill();
      for (const s of [-1, 1]) {
        const x0 = LX + s * r0;
        const x1 = LX + s * r1;
        rect(c, Math.min(x0, x1), LSP - 0.5, Math.max(x0, x1), LFOOT, IRON);
      }
    }
    for (const a of [30, 90, 150]) {
      const t = (a * Math.PI) / 180;
      line(c, LX + Math.cos(t) * 14, LSP - Math.sin(t) * 14, LX + Math.cos(t) * 17, LSP - Math.sin(t) * 17, 2, IRON, 'butt');
    }
    // A cross-tie between the legs.
    rect(c, LX - 19, LSP + 18, LX - 11.5, LSP + 20.4, IRON);
    rect(c, LX + 11.5, LSP + 18, LX + 19, LSP + 20.4, IRON);
    atop(c, function () {
      arcStroke(c, LX, LSP, 18.2, Math.PI * 1.4, Math.PI * 2, 1.6, IRON_LIT);
      arcStroke(c, LX, LSP, 12.3, Math.PI, Math.PI * 1.5, 1.6, IRON_COOL);
      for (const s of [-1, 1]) {
        rect(c, LX + s * 19 - (s > 0 ? 1.5 : 0), LSP, LX + s * 19 + (s > 0 ? 0 : 1.5), LFOOT, s > 0 ? IRON_LIT : IRON_COOL);
        rect(c, LX + s * 14.5 - (s > 0 ? 1.4 : 0), LSP, LX + s * 14.5 + (s > 0 ? 0 : 1.4), LFOOT, s > 0 ? IRON_LIT : IRON_COOL);
      }
    });
  }

  // The railing, read as one band: a top rail and a bottom rail, a few
  // widely spaced posts (one drawn, stamped), and between them a see-through
  // screen: the woods seen through the close-set bars, knocked back by a
  // flat iron wash. The bars themselves go on after the ink, soft, so the
  // comb is there at panel size without turning to noise at 92 x 70.
  const RAIL_X1 = CP[0];
  const railBand = curve((x) => railTop(x) + 1, -4, RAIL_X1, 4).concat(curve((x) => deckTop(x) - 1, -4, RAIL_X1, 4).reverse());
  const rail = B.layer();
  const POSTS = [];
  for (let x = CX - 2 - 48 * 5; x < RAIL_X1 - 6; x += 48) if (x > -3) POSTS.push(x);
  {
    const c = rail.getContext('2d');
    const post = B.layer(6, 40);
    {
      const pc = post.getContext('2d');
      rect(pc, 0, 0, 5, 40, IRON);
      rect(pc, 3.2, 0, 5, 40, IRON_LIT);
      rect(pc, 0, 0, 1.2, 40, IRON_COOL);
    }
    for (const x of POSTS) {
      const y0 = Math.round(railTop(x + 2) - 2);
      const y1 = Math.round(deckTop(x + 2) + 1);
      c.drawImage(post, 0, 0, 6, y1 - y0, Math.round(x), y0, 6, y1 - y0);
    }
    // Top rail and a bottom rail.
    B.fill(c, curve((x) => railTop(x) - 0.5, -4, RAIL_X1, 4).concat(curve((x) => railTop(x) + 3, -4, RAIL_X1, 4).reverse()), IRON);
    B.fill(c, curve((x) => deckTop(x) - 2.6, -4, RAIL_X1, 4).concat(curve((x) => deckTop(x) + 0.5, -4, RAIL_X1, 4).reverse()), IRON);
    atop(c, function () {
      B.fill(c, curve((x) => railTop(x) - 1.5, -4, RAIL_X1, 4).concat(curve((x) => railTop(x) + 1.2, -4, RAIL_X1, 4).reverse()), IRON_LIT);
    });
  }
  // The comb of bars, one drawn and stamped at a close pitch.
  const bars = B.layer();
  {
    const c = bars.getContext('2d');
    const bar = B.layer(2, 40);
    rect(bar.getContext('2d'), 0, 0, 2, 40, IRON);
    for (let x = CX - 1 - 5 * 44; x < RAIL_X1 - 1; x += 5) {
      if (x < -3) continue;
      const xi = Math.round(x);
      const y0 = Math.round(railTop(xi + 1) + 2);
      const y1 = Math.round(deckTop(xi + 1) - 2);
      c.drawImage(bar, 0, 0, 2, y1 - y0, xi, y0, 2, y1 - y0);
    }
  }

  // The deck fascia over the whole length: its top edge in the sun, its
  // soffit turned under.
  const deck = B.layer();
  {
    const c = deck.getContext('2d');
    B.fill(c, curve(deckTop, -4, CP[0], 4).concat(curve(deckBot, -4, CP[0], 4).reverse()), IRON);
    atop(c, function () {
      B.fill(c, curve((x) => deckTop(x) - 0.2, -4, CP[0], 4).concat(curve((x) => deckTop(x) + 2.2, -4, CP[0], 4).reverse()), IRON_LIT);
      B.fill(c, curve((x) => deckBot(x) - 2, -4, CP[0], 4).concat(curve((x) => deckBot(x) + 0.5, -4, CP[0], 4).reverse()), IRON_COOL);
    });
  }

  // All the ironwork on one layer.
  const iron = B.layer();
  {
    const c = iron.getContext('2d');
    c.drawImage(span, 0, 0);
    c.drawImage(land, 0, 0);
    // The light across the frame: the south half of each rib (the ribs were
    // cast in two halves, bolted at the crown) turned cool, the north half
    // warm in the sun. One flat wash each, so the halves stay two inks.
    atop(c, function () {
      rect(c, 0, 0, CX, H, B.alpha(SHADOW, 0.24));
      rect(c, CX, 0, W, H, B.alpha(SUN, 0.14));
    });
    // The deck's shadow across the top of the spandrels, thrown down and a
    // little left onto the ribs, rings and uprights under it.
    atop(c, function () {
      shadowOn(c, curve((x) => deckBot(x) - 0.5, -4, CP[0], 4).concat(curve((x) => deckBot(x) + 8, -10, CP[0] - 6, 4).reverse()), 0.34);
    });
    c.drawImage(rail, 0, 0);
    c.drawImage(deck, 0, 0);
  }
  inkRound(iron, 0.7);
  // The screen behind the bars: the woods through the railing, darkened.
  B.fill(ctx, railBand, B.alpha(mixh(S.iron, SHADOW, 0.2), 0.32));
  ctx.drawImage(iron, 0, 0);
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.drawImage(bars, 0, 0);
  ctx.restore();

  // ---------------------------------------------------------------------------
  // 6. The south bank at the water's edge, and the riverside growth. A
  // riverside tree at the left edge hides the deck's far end and the top of
  // the further pier.

  const TREE = mixh(SPUR_S, WOOD_LOW, 0.3);
  /** A riverside bush or tree: a few crowns, lit on the upper right. */
  const bush = function (crowns, base) {
    const rim = lit(base, 0.3);
    const dark = shd(base, 0.22);
    for (const [x, y, rr] of crowns) circle(ctx, x - 2, y + 2, rr, dark);
    for (const [x, y, rr] of crowns) circle(ctx, x + 2, y - 2, rr * 0.94, rim);
    for (const [x, y, rr] of crowns) circle(ctx, x, y, rr * 0.92, base);
  };
  bush([[2, 86, 13], [-4, 106, 15], [8, 122, 10]], TREE);
  bush([[362, 190, 10], [350, 194, 6]], SPUR_N);

  // ---------------------------------------------------------------------------
  // 7. The river.

  {
    // The Severn's olive, taking the sky: pale and cool at the far water,
    // deepening toward the viewer, so the foot of the plate is neither empty
    // nor as heavy as the bridge.
    const RIVER = mixh(S.river, B.C.skyLow, 0.46);
    ctx.fillStyle = vgrad(ctx, WL, H, [[0, mixh(RIVER, B.C.skyLow, 0.2)], [0.4, RIVER], [1, shd(RIVER, 0.18)]]);
    ctx.fillRect(0, WL, W, H - WL);

    // The reflection: only the bridge and its stone, turned over and a touch
    // shallower, simplified to a few flat tones sunk into the water: the
    // stone pale, the spandrels a mid tone, the inner arc and the deck the
    // darkest, so the arch and its image close into a ring. Broken by a few
    // bands of open water, wider toward the viewer.
    const refl = B.layer();
    const rc = refl.getContext('2d');
    const RMID = mixh(RIVER, S.iron, 0.24);
    const RDARK = mixh(shd(RIVER, 0.16), S.iron, 0.46);
    rc.save();
    rc.translate(0, WL);
    rc.scale(1, -SQ);
    rc.translate(0, -WL);
    rc.drawImage(silhouette(stoneL, mixh(RIVER, S.stone, 0.28)), 0, 0);
    rc.drawImage(silhouette(land, RMID), 0, 0);
    // The face frame between the arch mouth and the deck, one flat tone.
    const frame = [[CX - HALF, SP]].concat(curve(deckBot, CX - HALF, CX + HALF, 4)).concat([[CX + HALF, SP]]);
    B.fill(rc, frame, RMID);
    rc.save();
    rc.globalCompositeOperation = 'destination-out';
    rc.beginPath();
    rc.arc(CX, SP, ARCS[0][0], Math.PI, Math.PI * 2);
    rc.closePath();
    rc.fill();
    rc.restore();
    annulus(rc, CX, SP, ARCS[0][0], ARCS[0][1] + 1);
    rc.fillStyle = RDARK;
    rc.fill();
    B.fill(rc, curve((x) => railTop(x) + 3, -4, CP[0], 4).concat(curve(deckBot, -4, CP[0], 4).reverse()), RDARK);
    rc.restore();
    rc.save();
    rc.globalCompositeOperation = 'destination-out';
    const rr = B.rng(11);
    for (const [dy, h] of [[14, 2], [30, 3], [46, 4], [61, 4]]) {
      let x = -10 + rr() * 30;
      while (x < W) {
        const len = 60 + rr() * 90;
        rc.fillRect(x, WL + dy, len, h);
        x += len + 14 + rr() * 30;
      }
    }
    rc.restore();
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.drawImage(refl, 0, 0);
    ctx.restore();

    // Two long ripples where the river takes the sky.
    const RIP = mixh(S.ripple, B.C.skyLow, 0.35);
    for (const [x0, x1, yy, w] of [[96, 300, 226, 5], [30, 190, 252, 6], [230, 360, 262, 5]]) {
      B.stroke(ctx, x0, yy, x1, yy, w, RIP, 0);
    }

    // The bridge's shadow on the water, down and to the left: under the arch
    // foot, and each pier's and the abutment's shadow reaching out to its
    // left.
    shadowOn(ctx, [[innerL, WL], [innerL + 34, WL], [innerL - 6, WL + 26], [innerL - 44, WL + 26]], 0.36);
    shadowOn(ctx, [[PIER_L[0], WL], [PIER_L[1], WL], [PIER_L[0] - 12, WL + 20], [PIER_L[0] - 36, WL + 20]], 0.32);
    shadowOn(ctx, [[-2, WL], [LX + 19, WL], [LX + 4, WL + 14], [-2, WL + 14]], 0.28);
    shadowOn(ctx, [[CP[0], WL], [W + 2, WL], [W + 2, WL + 8], [CP[0] - 20, WL + 18], [CP[0] - 34, WL + 18]], 0.32);

    // A crisp waterline.
    rect(ctx, 0, WL, W, WL + 1.2, shd(S.river, 0.2));
  }
};
