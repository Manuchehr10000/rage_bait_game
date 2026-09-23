/**
 * Chapter 4 vignette: Persepolis, the Apadana, from the court east of it.
 *
 * Asset map-monument-ch04-persia, 92 x 70 world px, painted 368 x 280.
 * The view is the one tools/monument-painters/specs/apadana.json asks for:
 * eye height in the open court, looking at the eastern stairway, its relief
 * facade across the lower third, the southern wing (three registers of
 * tribute-bearers) nearest on the left, the northern wing running out past the
 * right edge. Above and behind it, on the platform, the surviving columns stand
 * free against a clean sky, broken off below where the capitals were.
 *
 * Built the way the pilot (abu-simbel.js) is built:
 *   1. the shared sky, cloudless: nothing else behind the columns;
 *   2. the columns, back to front, each painted into its own layer and inked;
 *   3. the stair facade: the wall, the parapet with its stepped merlons, the
 *      carved fields, then the reliefs' thin shadows, then the reliefs;
 *   4. ink round the facade;
 *   5. the court in front, carrying the stair's shadow down and to the left.
 *
 * The columns stand on the platform, above eye height, so their feet and the
 * shadows they throw on the platform are out of sight behind the stair.
 *
 * Repeated elements (the tribute-bearer, the cypress, the guard, the merlon,
 * the sphinx) are painted once into their own layer and stamped at whole-pixel
 * offsets, so every copy is the same pixels (pillar 4). Where the design turns
 * a figure to face the centre from the other side, the figure is painted a
 * second time facing that way, with the same light from the upper right, and
 * that second stamp is used for every copy on that side.
 */
PAINTERS['apadana'] = function (ctx, W, H, B) {
  // The research palette: one grey limestone, pushed a little sunnier.
  const S = {
    sun: '#D4C8B0', // limestone in full sun
    body: '#B2A895', // side-on to the sun: the base colour of shafts and stair
    deep: '#7F7A73', // flute hollows, register backgrounds
    relief: '#8E8B85', // the smoother, cooler carved surfaces
    stain: '#A67A52', // iron and lichen streaks on the shafts, sparingly
    fresh: '#E2D9C6', // the paler broken tops of the shafts
    court: '#D6C39C', // the dusty court
  };
  const INK = B.C.ink;
  const SHADOW = B.C.shadow;
  const SUN = B.C.sun;

  // ---------------------------------------------------------------------------
  // Helpers, as in the pilot. B.mix returns rgba(); these return hex.

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
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
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
    c.lineCap = 'butt';
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
  /** An ink line round everything painted on a layer, one pixel outside it. */
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
  /** Light across everything on a layer: cool at the left edge, warm at the right. */
  const lightAcross = function (c, x0, x1, cool, warm) {
    c.save();
    c.globalCompositeOperation = 'source-atop';
    const g = c.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, B.alpha(SHADOW, cool));
    g.addColorStop(0.45, B.alpha(SHADOW, 0));
    g.addColorStop(0.6, B.alpha(SUN, 0));
    g.addColorStop(1, B.alpha(SUN, warm));
    c.fillStyle = g;
    c.fillRect(0, 0, c.canvas.width, c.canvas.height);
    c.restore();
  };
  /** Stamp a layer with the thin shadow the raking light throws down and to the left. */
  const stamp = function (img, x, y, a) {
    ctx.save();
    ctx.globalAlpha = a === undefined ? 0.45 : a;
    ctx.drawImage(silhouette(img, shd(S.deep, 0.35)), Math.round(x) - 1, Math.round(y) + 1);
    ctx.restore();
    ctx.drawImage(img, Math.round(x), Math.round(y));
  };


  // ---------------------------------------------------------------------------
  // Layout. The wall of the wings is about 3 m and the columns close to 20 m,
  // so each column stands at least four times the height of the stair in
  // front of it, the raised centre included. The facade is symmetrical about
  // its central projection at CX. On each side of the centre a flight climbs
  // toward it; the carved field under each flight's incline runs down to the
  // court. The southern wing runs out to its end panel on the left, the
  // northern wing past the right edge.

  const GY = 255; // the court meets the facade
  const TOP = 220; // top of the wings' wall
  const CT = 201; // top of the central projection
  const CX = 196; // the axis of the stair
  const CW = 34; // half-width of the central projection
  const RUN = 56; // how far each flight runs out from the centre
  const XL = 12; // the stair's southern end
  const C0 = CX - CW;
  const C1 = CX + CW;
  const IL = C0 - RUN; // the foot of the left flight's incline
  const IR = C1 + RUN;
  const slopeL = (x) => TOP - ((TOP - CT) * (x - IL)) / RUN;
  const slopeR = (x) => slopeL(2 * CX - x);
  const FACADE = [[XL, GY], [XL, TOP], [IL, TOP], [C0, CT], [C1, CT], [IR, TOP], [W + 2, TOP], [W + 2, GY]];
  const COPE = 3;
  // The wings' three registers, and the plain bands between them.
  const REG = [[TOP + COPE, 233], [235, 245], [247, GY]];
  const BANDS = [233, 245];

  // ---------------------------------------------------------------------------
  // 1. The shared sky, and nothing in it. The gradient is stretched past the
  // plate's foot so the sky low behind the columns stays a clear step darker
  // than their lit flanks.

  B.sky(ctx, W, 360);

  // ---------------------------------------------------------------------------
  // 2. The columns. Survivors from a grid of 72, so irregularly spaced; the
  // nearer (east portico) ones taller and thicker, the farther (hall) ones
  // shorter and thinner. Every shaft is broken off: no capital, no bull.
  // [axis x, width, top y, seed]

  const COLS = [
    [118, 10, 31, 11], // far
    [302, 10, 27, 12], // far
    [148, 12, 20, 13], // middle
    [58, 14, 13, 14], // near
    [262, 14, 12, 15], // near
  ];
  const SHAFT = mixh(S.body, S.sun, 0.35);
  const paintColumn = function (x, w, top, seed) {
    const layer = B.layer(W, H);
    const c = layer.getContext('2d');
    const r = B.rng(seed);
    const foot = TOP + 4; // hidden behind the stair
    const hw = w / 2;
    const tw = hw * 0.93; // the slightest taper
    // The break: an old ragged top, a few big facets, never level.
    // One side stands higher; a chunk has gone from the other, leaving a
    // step. Which side is left standing changes from shaft to shaft.
    const brk = [];
    const n = 6;
    const drop = 2 + Math.floor(r() * 3); // where the step falls
    const highLeft = r() < 0.5;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const high = highLeft ? i < drop : i >= drop;
      brk.push([x - tw + 2 * tw * t, top + (high ? r() * 2.2 : 5 + r() * 3.5)]);
    }
    const shaft = [[x - hw, foot]].concat(brk, [[x + hw, foot]]);
    // The round of the shaft: cool on the left flank, warm on the right.
    const g = c.createLinearGradient(x - hw, 0, x + hw, 0);
    g.addColorStop(0, shd(SHAFT, 0.46));
    g.addColorStop(0.3, shd(SHAFT, 0.2));
    g.addColorStop(0.62, lit(SHAFT, 0.25));
    g.addColorStop(0.85, lit(SHAFT, 0.45));
    g.addColorStop(1, lit(SHAFT, 0.2));
    B.fill(c, shaft, g);
    B.clip(c, shaft, function () {
      // Flutes: vertical grooves, a dark hollow and a lit ridge beside it.
      // Soft in the shade, crisp on the lit side.
      const step = w >= 13 ? 2.5 : 2.2;
      for (let fx = x - hw + step * 0.7; fx < x + hw - 0.5; fx += step) {
        const u = (fx - (x - hw)) / w; // 0 at the left flank, 1 at the right
        const xx = Math.round(fx) + 0.5;
        if (u < 0.45) {
          line(c, xx, top, xx, foot, 1, B.alpha(shd(S.deep, 0.3), 0.22));
        } else {
          line(c, xx, top, xx, foot, 1, B.alpha(shd(S.deep, 0.2), 0.34));
          line(c, xx + 1, top, xx + 1, foot, 1, B.alpha(SUN, 0.32));
        }
      }
      // The drums, their joints barely showing.
      for (let y = top + 22 + Math.floor(r() * 8); y < foot; y += 26 + Math.floor(r() * 6)) {
        line(c, x - hw, y + 0.5, x + hw, y + 0.5, 1, B.alpha(S.deep, 0.22));
        line(c, x - hw, y + 1.5, x + hw, y + 1.5, 1, B.alpha(SUN, 0.18));
      }
      // One or two long weather streaks from the break down.
      const k = 1 + Math.floor(r() * 2);
      for (let i = 0; i < k; i++) {
        const sx = x - hw * 0.4 + r() * hw * 1.1;
        const y0 = top + 4 + r() * 8;
        B.stroke(c, sx, y0, sx + (r() - 0.5), y0 + 34 + r() * 30, 2.2, B.alpha(S.stain, 0.34));
      }
      // The broken top: the pale fresh stone of the break, a shaded lip on
      // the left, and a little shade under the fracture's edge.
      const face = brk.concat(brk.map((p) => [p[0], p[1] + 3.5]).reverse());
      B.fill(c, face, lit(S.fresh, 0.25));
      wash(c, [[x - hw, top - 2], [x - hw * 0.25, top - 2], [x - hw * 0.25, top + 12], [x - hw, top + 12]], SHADOW, 0.18);
      wash(c, brk.map((p) => [p[0], p[1] + 3.5]).concat(brk.map((p) => [p[0], p[1] + 5]).reverse()), SHADOW, 0.16);
    });
    inkRound(layer, 0.8);
    ctx.drawImage(layer, 0, 0);
  };
  for (const [x, w, top, seed] of COLS) paintColumn(x, w, top, seed);

  // ---------------------------------------------------------------------------
  // 3. The stair facade.

  // The merlon, painted once: the stepped crenellation of the parapet, three
  // steps each side. Lit on its right, the treads of its steps in the sun.
  const MW = 7;
  const MH = 8;
  const merlon = B.layer(MW, MH);
  {
    const c = merlon.getContext('2d');
    const base = mixh(S.body, S.sun, 0.2);
    B.fill(c, [[0, 8], [0, 6], [1, 6], [1, 4], [2, 4], [2, 1], [5, 1], [5, 4], [6, 4], [6, 6], [7, 6], [7, 8]], base);
    wash(c, [[0, 8], [0, 6], [1, 6], [1, 4], [2, 4], [2, 1], [3, 1], [3, 8]], SHADOW, 0.22);
    wash(c, [[4, 1], [5, 1], [5, 4], [6, 4], [6, 6], [7, 6], [7, 8], [4, 8]], SUN, 0.3);
    for (const [a, b, y] of [[2, 5, 1], [5, 6, 4], [6, 7, 6], [1, 2, 4], [0, 1, 6]]) B.fill(c, rect(a, y, b, y + 1), lit(base, 0.5));
    inkRound(merlon, 0.4);
  }

  // Merlons first, so the coping covers their feet.
  {
    const along = function (x0, x1, yAt) {
      for (let x = x0; x + MW <= x1; x += 9) {
        const y = Math.round(yAt(x + MW / 2)) - MH + 2;
        ctx.drawImage(merlon, Math.round(x), y);
      }
    };
    along(XL + 1, IL + 3, () => TOP);
    along(IL + 3, C0 + 1, slopeL);
    along(C0 + 2, C1, () => CT);
    along(C1 + 1, IR - 1, slopeR);
    along(IR - 1, W + MW, () => TOP);
  }

  // The wall itself: one limestone, a clear mid-value step below the sky and
  // the columns' lit flanks. Raked from the right, so warmer toward the north.
  const WALL = mixh(S.body, S.relief, 0.3);
  {
    const g = ctx.createLinearGradient(XL, 0, W, 0);
    g.addColorStop(0, shd(WALL, 0.08));
    g.addColorStop(0.55, WALL);
    g.addColorStop(1, lit(WALL, 0.12));
    B.fill(ctx, FACADE, g);
  }

  // The coping along the top, following the flights' inclines.
  const TOPLINE = FACADE.slice(1, FACADE.length - 1);
  {
    const low = TOPLINE.map((p) => [p[0], p[1] + COPE]).reverse();
    B.fill(ctx, TOPLINE.concat(low), lit(S.body, 0.3));
    // Its top edge in the sun, its underside throwing a short sharp shadow
    // down onto the carved face (the platform edge's shadow).
    B.fill(ctx, TOPLINE.concat(TOPLINE.map((p) => [p[0], p[1] + 1]).reverse()), lit(S.sun, 0.5));
    const lowF = TOPLINE.map((p) => [p[0], p[1] + COPE]);
    wash(ctx, lowF.concat(lowF.map((p) => [p[0], p[1] + 2.5]).reverse()), SHADOW, 0.34);
  }

  // The recessed grounds of the carving, a half-tone below the wall.
  const REG_BG = shd(mixh(S.relief, S.deep, 0.15), 0.06);
  const ground = function (pts) {
    const b = B.bounds(pts);
    const g = ctx.createLinearGradient(b.x0, 0, b.x1, 0);
    g.addColorStop(0, shd(REG_BG, 0.05));
    g.addColorStop(1, lit(REG_BG, 0.06));
    B.fill(ctx, pts, g);
  };
  const shadeTop = function (pts) {
    // The frame above a recessed field throws a thin shade into it.
    wash(ctx, pts.map((p) => [p[0], p[1]]).slice(0, 2).concat([[pts[1][0], pts[1][1] + 1.5], [pts[0][0], pts[0][1] + 1.5]]), SHADOW, 0.28);
  };

  // The wings: three registers.
  const WINGS = [[XL + 15, IL - 2], [IR + 2, W + 2]];
  for (const [x0, x1] of WINGS) {
    for (const [y0, y1] of REG) {
      const p = rect(x0, y0 + (y0 === TOP + COPE ? 2 : 0), x1, y1);
      ground(p);
      shadeTop(p);
    }
    for (const y of BANDS) {
      B.fill(ctx, rect(x0, y, x1, y + 2), lit(S.body, 0.22));
      B.fill(ctx, rect(x0, y, x1, y + 1), lit(S.sun, 0.34));
    }
  }

  // The inscription panel at the southern end: a plain framed field with a
  // level texture of dashes. Nothing legible; there is no text in the game.
  {
    const x0 = XL + 2;
    const x1 = XL + 12;
    const y0 = TOP + COPE + 3;
    B.fill(ctx, rect(x0, y0, x1, GY - 2), lit(S.relief, 0.16));
    wash(ctx, rect(x0, y0, x0 + 1.5, GY - 2), SHADOW, 0.28);
    wash(ctx, rect(x0, y0, x1, y0 + 1.5), SHADOW, 0.24);
    wash(ctx, rect(x1 - 1.5, y0, x1, GY - 2), SUN, 0.3);
    for (let y = y0 + 4; y < GY - 4; y += 3) line(ctx, x0 + 2.5, y + 0.5, x1 - 2.5, y + 0.5, 1, B.alpha(S.deep, 0.24));
  }

  // The fields under the flights: from the incline down to the court.
  const FIELD_L = [[IL + 1, slopeL(IL + 1) + COPE + 2], [C0 - 2, slopeL(C0 - 2) + COPE + 2], [C0 - 2, GY], [IL + 1, GY]];
  const FIELD_R = FIELD_L.map((p) => [2 * CX - p[0], p[1]]);
  for (const f of [FIELD_L, FIELD_R]) {
    ground(f);
    shadeTop(f);
    // The flight's end frame stands forward: lit at the right, shaded at the left.
    const b = B.bounds(f);
    wash(ctx, rect(b.x0, b.y0, b.x0 + 1.2, GY), SHADOW, 0.22);
  }

  // The central projection: it stands a little forward of the flights, so a
  // shaded side on its left and a lit one on its right. Inside, the lunette
  // with the winged disc and the sphinxes, a plain band, then the guards'
  // field with the blank rectangle between them.
  const LUN = [CT + COPE + 2, 221]; // the lunette's top and foot
  {
    wash(ctx, rect(C0, CT + COPE, C0 + 2, GY), SHADOW, 0.34);
    wash(ctx, rect(C1 - 2, CT + COPE, C1, GY), SUN, 0.34);
    const lu = rect(C0 + 3, LUN[0], C1 - 3, LUN[1]);
    ground(lu);
    shadeTop(lu);
    B.fill(ctx, rect(C0 + 2, LUN[1], C1 - 2, LUN[1] + 3), lit(S.body, 0.22));
    B.fill(ctx, rect(C0 + 2, LUN[1], C1 - 2, LUN[1] + 1), lit(S.sun, 0.34));
    const gf = rect(C0 + 3, LUN[1] + 3, C1 - 3, GY);
    ground(gf);
    shadeTop(gf);
  }

  // ---------------------------------------------------------------------------
  // The reliefs. All the same stone as the wall, uncoloured, raised from the
  // recessed ground and raked by the light from the right, each throwing a
  // thin shadow down and to the left.

  const FIG = lit(S.sun, 0.1);

  // The cypress, painted once: a tall flame on a short trunk.
  const CYW = 4;
  const CYH = 8;
  const cypress = B.layer(CYW, CYH);
  {
    const c = cypress.getContext('2d');
    B.fill(c, [[2, 0], [3, 2], [3.6, 4.4], [3.3, 6.4], [0.7, 6.4], [0.4, 4.4], [1, 2]], FIG);
    B.fill(c, rect(1.5, 6.4, 2.5, 8), FIG);
    lightAcross(c, 0.2, 3.8, 0.42, 0.3);
  }

  // The date palm, painted once: a bare trunk and a crown of drooping fronds.
  const palm = B.layer(9, 11);
  {
    const c = palm.getContext('2d');
    B.fill(c, [[4, 3], [5, 3], [5.2, 11], [3.8, 11]], FIG);
    for (const [dx, dy] of [[-4.2, 2.4], [-3.8, -1.2], [-1, -2.8], [1.8, -2.6], [4, -1], [4.2, 2.6]]) B.stroke(c, 4.5, 3, 4.5 + dx, 3 + dy, 1.5, FIG, dx < 0 ? -0.6 : 0.6);
    lightAcross(c, 0, 9, 0.4, 0.32);
  }

  /**
   * A tribute-bearer, painted once for each direction: a small upright
   * figure in a long robe, head clear of the shoulders, the gift held to the
   * chest making a rounded bump in front. No straight strokes sticking out:
   * at this size a stick reads as a letter. dir = 1 walks right, -1 left.
   * The light is always from the right.
   */
  const BW = 5;
  const BH = 8;
  const bearer = function (dir) {
    const L = B.layer(BW, BH);
    const c = L.getContext('2d');
    const P = (pts) => pts.map((p) => [dir > 0 ? p[0] : BW - p[0], p[1]]);
    ellipse(c, dir > 0 ? 2.5 : BW - 2.5, 1.25, 1.15, 1.25, FIG); // head
    B.fill(c, P([[1.2, 2.9], [3.5, 2.9], [4.4, 3.8], [4.8, 5.2], [3.9, 5.9], [4.2, 7.6], [3.4, 8], [2.5, 7.3], [1.7, 8], [0.3, 8], [0.7, 5.2]]), FIG); // robe, gift, stride
    lightAcross(c, 0, BW, 0.42, 0.34);
    return L;
  };
  const BEAR_R = bearer(1);
  const BEAR_L = bearer(-1);

  // The registers: delegations of bearers walking toward the centre, each
  // led off by a cypress. The registers are offset so the trees do not line
  // up into columns.
  {
    const pattern = [3, 4, 3, 5, 4, 3, 4];
    const run = function (x0, x1, yFoot, dir, offset) {
      let k = offset;
      let x = x0;
      const img = dir > 0 ? BEAR_R : BEAR_L;
      while (x < x1) {
        if (x + CYW <= x1) stamp(cypress, x, yFoot - CYH);
        x += 6;
        const n = pattern[k % pattern.length];
        for (let i = 0; i < n && x + BW <= x1; i++) {
          stamp(img, x, yFoot - BH);
          x += 6;
        }
        x += 1;
        k++;
      }
    };
    REG.forEach(([y0, y1], i) => {
      const foot = y1 === GY ? GY - 1 : y1;
      run(WINGS[0][0] + 2, WINGS[0][1] - 1, foot, 1, i * 2); // southern wing, walking right
      run(WINGS[1][0] + 2, W + 8, foot, -1, i * 2 + 1); // northern wing, walking left
    });
  }

  /**
   * The lion and the bull, painted once for each direction. The bull rears
   * up toward the tall end of the field, its head turned back over its
   * shoulder; the lion leaps on it from behind, jaws in its haunch. dir = 1:
   * the bull rears to the right (the field left of the centre).
   */
  const LBW = 36;
  const LBH = 30;
  const lionBull = function (dir) {
    const P = (pts) => pts.map((p) => [dir > 0 ? p[0] : LBW - p[0], p[1]]);
    // The bull, on its own layer: heavy, hind legs planted, the body rising
    // steeply to a humped shoulder, forelegs lifted, the head thrown back
    // over the shoulder with its horns up.
    const bull = B.layer(LBW, LBH);
    {
      const c = bull.getContext('2d');
      B.fill(c, P([
        [13, 17], [14.2, 13.4], [18, 11.2], [22.6, 8.2], [26, 5.4], [29.6, 4.2], [32.4, 5.6], [33.6, 8.4],
        [33, 11.6], [30.6, 13.8], [27, 16.6], [23.4, 19.6], [21.8, 21.4], [22.2, 24], [23, 30], [21, 30],
        [19.8, 25], [18.4, 23.4], [17.2, 26], [16.8, 30], [14.8, 30], [14.8, 25], [13.2, 21.4],
      ]), FIG);
      B.fill(c, P([[31, 12.4], [34.4, 13.8], [35.6, 17.8], [34.2, 18.2], [33.2, 15.4], [30, 15]]), FIG); // near foreleg, folded
      B.fill(c, P([[28.4, 14.4], [30.8, 17.4], [30.8, 21.4], [29.4, 21.4], [29.2, 18.2], [27, 16.6]]), FIG); // far foreleg
      B.fill(c, P([[29.4, 6.4], [27.8, 3], [24.8, 1.8], [21.8, 2.4], [19.8, 4], [20.2, 5.8], [22.6, 6.2], [25.6, 7]]), FIG); // head turned back
      B.fill(c, P([[25.8, 2.6], [26.4, 0.2], [27.8, 0], [27.4, 1.2], [26.8, 3]]), FIG); // horn
      B.fill(c, P([[23.4, 2.2], [23.2, 0.2], [24.4, 0], [24.6, 2]]), FIG); // far horn
      B.fill(c, P([[13.4, 15.2], [11.6, 20.6], [11.4, 25], [13, 25.4], [12.8, 21], [14.4, 16.6]]), FIG); // tail
      lightAcross(c, 0, LBW, 0.3, 0.32);
      c.save();
      c.globalCompositeOperation = 'source-atop';
      wash(c, P([[27, 16.6], [30.6, 13.8], [31.4, 15], [28.4, 18]]), S.deep, 0.4); // under the chest
      wash(c, P([[20.2, 5.8], [22.6, 6.2], [25.6, 7], [26.4, 8.6], [22.4, 8.2]]), S.deep, 0.34); // under the jaw
      ellipse(c, dir > 0 ? 22.2 : LBW - 22.2, 3.4, 0.6, 0.6, B.alpha(S.deep, 0.8)); // the eye
      c.restore();
    }
    // The lion, on its own layer: hind legs on the ground behind the bull,
    // body springing diagonally up its flank, forepaws on its back, the big
    // round maned head biting into its haunch, the tail curled up behind.
    const lion = B.layer(LBW, LBH);
    {
      const c = lion.getContext('2d');
      B.fill(c, P([
        [2, 30], [4.2, 30], [5, 26], [6.8, 26.6], [6.6, 30], [8.8, 30], [9.6, 24.6], [11.6, 21.2], [14.2, 18.8],
        [16.8, 16.4], [19.6, 13.6], [22.6, 11.8], [23, 10.4], [20.4, 10.6], [18.2, 11.4], [16.2, 9.2], [13.6, 9.6],
        [12, 11.6], [11.4, 14.2], [9, 17.4], [6.2, 20.6], [4.2, 23.8], [3, 26.6],
      ]), FIG);
      ellipse(c, dir > 0 ? 15 : LBW - 15, 11.6, 4, 3.8, FIG); // the mane
      B.fill(c, P([[4, 23.4], [1.6, 20.4], [0.6, 16.8], [0.6, 14.6], [1.8, 14.2], [1.8, 16.6], [2.8, 19.6], [5, 21.8]]), FIG); // tail
      lightAcross(c, 0, LBW, 0.3, 0.34);
      c.save();
      c.globalCompositeOperation = 'source-atop';
      // The mane a darker ruff round the lit face and muzzle.
      ellipse(c, dir > 0 ? 15 : LBW - 15, 11.6, 4, 3.8, B.alpha(S.deep, 0.42));
      B.fill(c, P([[15.6, 10], [18.8, 10.6], [19.4, 12.6], [17.4, 13.8], [15.4, 12.8]]), lit(FIG, 0.2)); // face and muzzle
      c.restore();
    }
    // Put together: the lion's shadow falls on the bull, then the lion.
    const L = B.layer(LBW, LBH);
    const c = L.getContext('2d');
    c.drawImage(bull, 0, 0);
    c.save();
    c.globalCompositeOperation = 'source-atop';
    c.globalAlpha = 0.55;
    c.drawImage(silhouette(lion, shd(S.deep, 0.3)), -1, 1);
    c.restore();
    c.drawImage(lion, 0, 0);
    return L;
  };
  for (const side of [-1, 1]) {
    // The cypresses: the same tree, each standing a step higher up the
    // incline, under the coping.
    for (let d = RUN - 4; d >= 4; d -= 6) {
      const x = side < 0 ? C0 - d : C1 + d - CYW;
      const s = side < 0 ? slopeL(x + CYW) : slopeR(x);
      stamp(cypress, x, Math.round(s + COPE + 3.5));
    }
    // Two date palms at the low end of the field.
    for (const d of [RUN - 6, RUN - 15]) {
      const x = side < 0 ? C0 - d : C1 + d - 9;
      stamp(palm, x, GY - 12);
    }
  }
  stamp(lionBull(1), C0 - LBW - 3, GY - LBH - 1);
  stamp(lionBull(-1), C1 + 3, GY - LBH - 1);

  // The guard, painted once for each direction: tall, in a long robe, a
  // spear held upright before him, a tall headdress.
  const GW = 6;
  const GH = 30;
  const guard = function (dir) {
    const L = B.layer(GW, GH);
    const c = L.getContext('2d');
    const P = (pts) => pts.map((p) => [dir > 0 ? p[0] : GW - p[0], p[1]]);
    B.fill(c, P([[1.3, 6.2], [3.8, 6.2], [3.9, 3.6], [3.4, 1.4], [1.8, 1.4], [1.2, 3.6]]), FIG); // head and headdress
    B.fill(c, P([[0.8, 7], [4.2, 7], [4.5, 18], [4.4, 29], [3.2, 29.2], [2.9, 26], [2.3, 29.2], [0.4, 29], [0.6, 18]]), FIG); // robe
    B.fill(c, P([[4.9, 0], [5.8, 0], [5.8, 30], [4.9, 30]]), FIG); // spear
    B.fill(c, P([[4.2, 12.6], [6, 11.8], [6, 14], [4.2, 14.8]]), FIG); // hands on the spear
    lightAcross(c, 0, GW, 0.4, 0.34);
    return L;
  };
  {
    const gR = guard(1);
    const gL = guard(-1);
    for (let i = 0; i < 4; i++) stamp(gR, C0 + 4 + i * 5, GY - GH - 1);
    for (let i = 0; i < 4; i++) stamp(gL, C1 - 4 - GW - i * 5, GY - GH - 1);
  }

  // The blank rectangle between the guards: plain, smooth, uncarved.
  {
    const x0 = CX - 8;
    const x1 = CX + 8;
    const y0 = LUN[1] + 6;
    const y1 = GY - 2;
    B.fill(ctx, rect(x0 - 1.5, y0 - 1.5, x1 + 1.5, y1 + 1), lit(S.body, 0.2));
    const g = ctx.createLinearGradient(x0, y1, x1, y0);
    g.addColorStop(0, mixh(S.relief, S.body, 0.6));
    g.addColorStop(1, lit(mixh(S.relief, S.body, 0.6), 0.22));
    B.fill(ctx, rect(x0, y0, x1, y1), g);
    wash(ctx, rect(x0, y0, x1, y0 + 1.5), SHADOW, 0.3);
    wash(ctx, rect(x0, y0, x0 + 1.2, y1), SHADOW, 0.2);
  }

  // The lunette: a small winged disc between two seated sphinxes that face
  // it, each with a forepaw raised toward it. Small and plain, as carved.
  const SPW = 18;
  const SPH = 14;
  const sphinx = function (dir) {
    const L = B.layer(SPW, SPH);
    const c = L.getContext('2d');
    const P = (pts) => pts.map((p) => [dir > 0 ? p[0] : SPW - p[0], p[1]]);
    // A wing rising from the back, broad at the root, its tip curving
    // forward over the head.
    B.fill(c, P([[4.2, 8.4], [3, 5.8], [3.4, 3.2], [5.4, 1.4], [8.4, 0.4], [11.4, 0.6], [9.6, 1.8], [8.4, 3.4], [10.2, 7.8]]), FIG);
    // The seated lion's body: haunch low at the back, chest up, forelegs.
    B.fill(c, P([
      [1, 14], [0.8, 10.8], [2.2, 8.6], [5.4, 7.8], [10, 8], [12.2, 7], [13, 5.2], [14.8, 5.2], [15.2, 7],
      [14.6, 9], [14.8, 14], [13, 14], [12.6, 11.2], [7, 11.4], [5.8, 14],
    ]), FIG);
    // The human head, bearded, in a tall crown.
    ellipse(c, dir > 0 ? 14 : SPW - 14, 3.8, 1.7, 1.8, FIG);
    B.fill(c, P([[12.6, 2.6], [15.4, 2.6], [15.2, 0], [12.8, 0]]), FIG);
    B.fill(c, P([[14.4, 4.6], [16, 4.6], [15.8, 7], [14.6, 6.8]]), FIG);
    // The raised forepaw.
    B.fill(c, P([[14.6, 8.4], [17.4, 7], [18, 8], [15, 10.2]]), FIG);
    lightAcross(c, 0, SPW, 0.36, 0.3);
    c.save();
    c.globalCompositeOperation = 'source-atop';
    for (const y of [3.6, 5.8]) {
      const a = P([[4.4, y], [8.4, y + 2]]);
      line(c, a[0][0], a[0][1], a[1][0], a[1][1], 0.8, B.alpha(S.deep, 0.35)); // the wing's feathers
    }
    wash(c, P([[1, 14], [0.8, 10.8], [2.2, 9.4], [5, 11.4], [5.8, 14]]), SHADOW, 0.14); // the haunch
    c.restore();
    return L;
  };
  {
    stamp(sphinx(1), C0 + 4, LUN[1] - SPH);
    stamp(sphinx(-1), C1 - 4 - SPW, LUN[1] - SPH);
    // The winged disc: a ringed disc, straight wings of feathers, a short
    // spread tail below.
    const DW = 20;
    const disc = B.layer(DW, 9);
    const c = disc.getContext('2d');
    const m = DW / 2;
    for (const s of [-1, 1]) {
      B.fill(c, [[m + s * 2, 2], [m + s * 9.8, 1.2], [m + s * 9.8, 2.8], [m + s * 8.6, 4.2], [m + s * 6.6, 5], [m + s * 2, 5]], FIG);
      line(c, m + s * 3, 3.6, m + s * 8.6, 3, 0.7, B.alpha(S.deep, 0.35));
    }
    B.fill(c, [[m - 2, 5], [m + 2, 5], [m + 3.2, 8.6], [m - 3.2, 8.6]], FIG);
    ellipse(c, m, 3.4, 2.4, 2.4, lit(FIG, 0.2));
    ellipse(c, m, 3.4, 1.2, 1.2, B.alpha(S.deep, 0.4));
    lightAcross(c, 0, DW, 0.3, 0.3);
    stamp(disc, CX - DW / 2, LUN[0] + 2);
  }

  // Ink round the facade.
  B.path(ctx, FACADE);
  ctx.lineJoin = 'round';
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = B.alpha(INK, 0.62);
  ctx.stroke();

  // ---------------------------------------------------------------------------
  // 4. The court: dusty, sunlit, a clear half-step below the facade's lit
  // reliefs, darkening toward the viewer, and carrying the stair's shadow
  // down and to the left.

  {
    const base = mixh(S.court, S.body, 0.45);
    const g = ctx.createLinearGradient(0, GY, 0, H);
    g.addColorStop(0, lit(base, 0.08));
    g.addColorStop(1, shd(base, 0.34));
    ctx.fillStyle = g;
    ctx.fillRect(0, GY, W, H - GY);
    // Each top corner of the stair falls down and to the left in proportion
    // to its height: the raised centre throws the longest shadow.
    const proj = (p) => [p[0] - 0.36 * (GY - p[1]), GY + 0.3 * (GY - p[1])];
    const sh = [[XL, GY]].concat(TOPLINE.map(proj), [[W + 2, GY]]);
    B.fill(ctx, sh, B.alpha(SHADOW, 0.3));
    wash(ctx, rect(0, GY, W, GY + 1.5), SHADOW, 0.3);
    // A few long, level scuffs of dust: texture, not noise.
    const r = B.rng(404);
    for (let i = 0; i < 9; i++) {
      const y = GY + 9 + r() * 13;
      const x = r() * W;
      B.stroke(ctx, x, y, x + 30 + r() * 50, y + (r() - 0.5), 1.6, B.alpha(i % 2 ? SHADOW : SUN, 0.12));
    }
  }
};
