/**
 * Chapter 10 vignette: Registan, the Ulugh Beg Madrasa (1417-1420), east front.
 *
 * Asset map-monument-ch10-islamic, 92 x 70 world px, painted 368 x 280. The
 * view is the spec's (tools/monument-painters/specs/iwan.json): a straight
 * elevation of the east facade from the middle of the square, on the portal's
 * axis, Sher-Dor behind the viewer. The frame stops just outside the two front
 * minarets, so Tilya-Kori's corner tower (north, right) stays out.
 *
 * Built the way the Abu Simbel pilot is built:
 *   1. the shared sky, cloudless, graded from skyTop in flat steps, none of
 *      them on the roofline;
 *   2. the paving of the square in the sun, warm pinkish buff, darker at the
 *      near edge of the plate; the facade's shadow along its whole foot
 *      (deeper under the portal, broken at the open arch) and the two
 *      minarets' long shadows, all down and to the left;
 *   3. the building on its own layer, back to front: the flat wings with
 *      quiet banna'i panels over the marble dado, the portal (a solid glazed
 *      frame band, two tall girih panels on each pier, the tessellated star
 *      field of the spandrels, the faceted iwan, the rope moulding, the dado),
 *      the shadows it throws on the wings, then the two minarets stamped from
 *      one painting: a bold two-glaze lattice under a cylinder wash, and a
 *      two-tier stalactite crown. The iwan is lit deep inside, as the spec's
 *      low morning sun lights it: a shaded vault in four facets over a lit
 *      back wall with one dark pointed door, the arch rim's shadow crossing
 *      the wall's upper right;
 *   4. ink round the whole silhouette.
 *
 * Proportions, at about 6.1 px a metre: the facade 56 m between the minarets'
 * outer faces; the portal 37 m wide (two-thirds) and 34.7 m high, flat-topped;
 * the arch about 18 m (half the portal), its apex at four-fifths of the
 * portal's height; the wings half the portal's height; the minaret crowns level
 * with the portal's top edge. Light: a June morning sun from the east-north-
 * east, behind the viewer's right shoulder, so the front is lit almost square
 * with a rake from the right.
 *
 * Shadows follow the spec's lighting section and its mustBeRight ("shadows
 * falling down and to the left"): each minaret throws its shadow down and to
 * the left, the north-east one across the north wing, the south-east one onto
 * the ground outside the building. The spec asks for this, as the set's
 * convention, although a sun behind the viewer would really throw the ground
 * shadows into the picture. The minaret's shadow on the north wing is kept
 * narrow (about 5 px), true to a sun only some 10 degrees off the facade.
 *
 * Repeated things (the minarets, the pier panels, the wing panels, the star
 * tile of the spandrels) are painted once and stamped at whole pixels,
 * so the copies are the same pixels (pillar 4).
 */
PAINTERS['iwan'] = function (ctx, W, H, B) {
  // The research palette, a little sunnier than life.
  const P = {
    buff: '#cdb088', // fired brick, the ground of every wall
    turq: '#38a3ab', // light-blue glaze
    cobalt: '#213f8a', // dark-blue glaze
    white: '#eef0e8', // white glaze
    green: '#3b8a5c', // green glaze, portal accents only
    yellow: '#d4a23c', // yellow glaze, portal accents only
    black: '#29232e', // black glaze
    marble: '#dcd9d0', // the dado and the minaret plinths
    pave: '#c9a08e', // the square's brick paving
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
  const line = function (c, x0, y0, x1, y1, w, style) {
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x1, y1);
    c.lineWidth = w;
    c.lineCap = 'butt';
    c.strokeStyle = style;
    c.stroke();
  };
  const polyline = function (c, pts, w, style, dash) {
    c.beginPath();
    for (let i = 0; i < pts.length; i++) {
      if (i === 0) c.moveTo(pts[i][0], pts[i][1]);
      else c.lineTo(pts[i][0], pts[i][1]);
    }
    c.lineWidth = w;
    c.lineJoin = 'round';
    c.lineCap = 'butt';
    c.strokeStyle = style;
    c.setLineDash(dash || []);
    c.stroke();
    c.setLineDash([]);
  };
  /** A horizontal form (a cap, a ledge): lit on top. */
  const roll = function (c, pts, base) {
    const b = B.bounds(pts);
    const g = c.createLinearGradient(0, b.y0, 0, b.y1);
    g.addColorStop(0, lit(base, 0.4));
    g.addColorStop(0.5, base);
    g.addColorStop(1, shd(base, 0.28));
    B.fill(c, pts, g);
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
  /**
   * A two-centred pointed arch from x a to x b, springing at y s, apex at y t.
   * With `bottom` it is closed down both jambs to that y; with null it is the
   * open curve from (a, s) to (b, s). The rise is more than the half-span, so
   * the two arcs meet in a point: the Timurid pointed arch, not a round one.
   */
  const archPts = function (a, b, s, t, bottom, n) {
    const k = n || 20;
    const m = (a + b) / 2;
    const hs = (b - a) / 2;
    const h = s - t;
    const R = (hs * hs + h * h) / (2 * hs);
    const pts = bottom === null ? [] : [[a, bottom]];
    pts.push([a, s]);
    const cl = a + R;
    const pa = Math.atan2(t - s, m - cl) + Math.PI * 2;
    for (let i = 1; i < k; i++) {
      const f = Math.PI + ((pa - Math.PI) * i) / k;
      pts.push([cl + R * Math.cos(f), s + R * Math.sin(f)]);
    }
    pts.push([m, t]);
    const cr = b - R;
    const pb = Math.atan2(t - s, m - cr);
    for (let i = 1; i < k; i++) {
      const f = pb + ((0 - pb) * i) / k;
      pts.push([cr + R * Math.cos(f), s + R * Math.sin(f)]);
    }
    pts.push([b, s]);
    if (bottom !== null) pts.push([b, bottom]);
    return pts;
  };

  /** A star of n points, as a polygon. */
  const starPts = function (x, y, ro, ri, n, rot) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const a = (rot || -Math.PI / 2) + (i * Math.PI) / n;
      const r = i % 2 === 0 ? ro : ri;
      pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
    }
    return pts;
  };

  // ---------------------------------------------------------------------------
  // Layout.

  const GY = 246; // the facade meets the paving
  const PLINTH = 242; // top of the low plinth the facade stands on
  const DADO = 228; // top of the marble dado at the portal's foot
  const TOP = 33; // the portal's flat top edge
  const PL = 71; // the portal, two-thirds of the facade
  const PR = 297;
  const CX = 184; // the axis
  const WTOP = 139; // the wings, half the portal's height
  const MX = [31, 337]; // the two front minarets, crowns 12 px clear of the frame
  const AL = 128; // the arch: about half the portal's width
  const AR = 240;
  const SPRING = 148;
  const APEX = 76; // four-fifths of the portal's height
  const SL = 115; // the rectangular frame round the arch and its spandrels
  const SR = 253;
  const ST = 55;
  // The back of the iwan, seen through the arch.
  const BL = 150;
  const BR = 218;
  const BS = 174;
  const BA = 126;
  const BF = GY - 4;

  const BRICK = lit(P.buff, 0.1);
  // The marble in the sun, a step under neat marble so the white stays on the
  // glaze; and the marble turned from it.
  const MARBLE = shd(mixh(P.marble, P.buff, 0.15), 0.08);
  const MARBLE_SH = shd(MARBLE, 0.28);

  // ---------------------------------------------------------------------------
  // 1. The shared sky.

  // The shared sky, graded from skyTop in flat steps, as the pilot's is: flat
  // tones survive the indexed palette where a smooth ramp is quantised into
  // arbitrary bands. The grade is carried past the horizon so the slivers
  // beside the minarets stay blue down to the paving and never read as a
  // pale wall. No step lies on the roofline (the portal top and the crowns at
  // y 33-34): the nearest are at 26 and 42.
  {
    const SKY_H = Math.round(GY * 3);
    B.sky(ctx, W, SKY_H);
    const breaks = [0, 8, 17, 26, 42, 60, 80, 104, 132, 170, 210, GY + 1];
    for (let i = 0; i + 1 < breaks.length; i++) {
      const y0 = breaks[i];
      const y1 = breaks[i + 1];
      B.fill(ctx, rect(0, y0, W, y1), mixh(B.C.skyTop, B.C.skyLow, (y0 + y1) / 2 / SKY_H));
    }
  }

  // ---------------------------------------------------------------------------
  // 2. The square: fired-brick paving in the morning sun, pinkish buff.

  // Lit paving, a warm step under the facade's brick and the marble, so it is
  // never the brightest band; darker again at the plate's near edge to hold
  // its foot, as the pilot's ledge does. The building's shadows lie on it as
  // clear cool shapes.
  {
    const PAVE = lit(P.pave, 0.1);
    B.fill(ctx, rect(0, GY, W, H), PAVE);
    B.fill(ctx, rect(0, 262, W, H), shd(PAVE, 0.07));
    B.fill(ctx, rect(0, 271, W, H), shd(PAVE, 0.2));
    // Two calm courses.
    for (const y of [253, 262]) B.fill(ctx, rect(0, y, W, y + 1.5), B.alpha(shd(P.pave, 0.35), 0.35));
    // The shadows, painted solid on their own layer and laid down at one
    // alpha, so where they overlap they stay one tone.
    const sh = B.layer(W, H);
    const sc = sh.getContext('2d');
    // Along the whole foot, down and to the left; broken at the open arch,
    // where the square runs on into the iwan.
    B.fill(sc, [[MX[0], GY], [AL, GY], [AL - 8, GY + 7], [MX[0] - 8, GY + 7]], SHADOW);
    B.fill(sc, [[AR, GY], [MX[1], GY], [MX[1] - 8, GY + 7], [AR - 8, GY + 7]], SHADOW);
    // The two minarets: round, so their shadows are long bars.
    for (const x of MX) B.fill(sc, [[x - 14, GY], [x + 14, GY], [x - 8, H], [x - 36, H]], SHADOW);
    ctx.save();
    ctx.globalAlpha = 0.42;
    ctx.drawImage(sh, 0, 0);
    ctx.restore();
    // The portal stands proud of the wings: its foot throws a deeper band.
    const sp = B.layer(W, H);
    const pc = sp.getContext('2d');
    B.fill(pc, [[PL, GY], [AL, GY], [AL - 12, GY + 11], [PL - 12, GY + 11]], SHADOW);
    B.fill(pc, [[AR, GY], [PR, GY], [PR - 12, GY + 11], [AR - 12, GY + 11]], SHADOW);
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.drawImage(sp, 0, 0);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 3. The building, on its own layer so the ink can go round it.

  const bld = B.layer(W, H);
  const bc = bld.getContext('2d');

  /** A flat wall square to the sun: one clean tone; the modelling is in its shadows. */
  const wall = function (pts) {
    B.fill(bc, pts, BRICK);
  };

  /**
   * A shallow blind panel with a pointed head, painted once: a buff field in
   * a thin glazed outline, with at most one large simple motif. Flat, like the
   * wall it is set in: no shaded head, so it never reads as a window or a
   * niche. `frame` is the outline colour; `motif(c, inner)` paints the fill.
   */
  const panel = function (w, h, head, frame, motif) {
    const L = B.layer(w, h);
    const c = L.getContext('2d');
    const outer = archPts(0, w, head, 0, h, 12);
    const inner = archPts(3, w - 3, head + 1.5, 4.2, h - 3, 12);
    B.fill(c, outer, frame);
    B.fill(c, inner, BRICK);
    B.clip(c, inner, function () {
      motif(c, inner);
    });
    return L;
  };

  // --- The wings: narrow flat walls, two tiers of shallow panels, no arcades.
  const WING_L = rect(MX[0], WTOP, PL, GY);
  const WING_R = rect(PR, WTOP, MX[1], GY);
  for (const wpts of [WING_L, WING_R]) {
    wall(wpts);
    // The parapet, its top edge catching the sun.
    roll(bc, rect(wpts[0][0], WTOP, wpts[1][0], WTOP + 5), lit(BRICK, 0.1));
    B.fill(bc, rect(wpts[0][0], WTOP, wpts[1][0], WTOP + 1.5), lit(BRICK, 0.55));
    wash(bc, rect(wpts[0][0], WTOP + 5, wpts[1][0], WTOP + 6), SHADOW, 0.16);
  }
  // One panel, stamped four times: a cobalt outline and a single turquoise
  // lozenge, both full glaze. The wing is quieter than the portal by carrying
  // less ornament, not by fading its colour.
  {
    const WP = panel(18, 38, 13, mixh(P.cobalt, P.turq, 0.2), function (c) {
      B.fill(c, [[9, 14], [14, 25], [9, 36], [4, 25]], P.turq);
      B.fill(c, [[9, 19], [11.5, 25], [9, 31], [6.5, 25]], mixh(P.cobalt, P.turq, 0.2));
    });
    for (const x of [PL - 24, PR + 6]) {
      for (const y of [152, 188]) bc.drawImage(WP, x, y);
    }
  }
  // The portal stands proud of the wings: a thin shadow on the south wing
  // along its edge.
  wash(bc, [[PL, WTOP], [PL - 6, WTOP + 5], [PL - 6, GY], [PL, GY]], SHADOW, 0.36);
  // The north-east minaret throws its shadow across the north wing: narrow,
  // since the sun is only some 10 degrees off the facade's normal.
  wash(bc, [[MX[1] - 12, WTOP], [MX[1] - 18, WTOP + 6], [MX[1] - 18, GY], [MX[1] - 12, GY]], SHADOW, 0.36);

  // --- The portal: a flat-topped rectangle, nothing on top of it.
  const PORTAL = rect(PL, TOP, PR, GY);
  wall(PORTAL);
  roll(bc, rect(PL, TOP, PR, TOP + 5), lit(BRICK, 0.1));
  wash(bc, rect(PL, TOP + 5, PR, TOP + 7), SHADOW, 0.2);

  // The frame band round the portal, the inscription band: here a rhythmic
  // band of glaze, never letters. One module, stamped along it.
  {
    const FB = 9; // band width
    const top = rect(PL + 5, TOP + 9, PR - 5, TOP + 9 + FB);
    const left = rect(PL + 5, TOP + 9, PL + 5 + FB, DADO);
    const right = rect(PR - 5 - FB, TOP + 9, PR - 5, DADO);
    // A solid turquoise band with a darker core: the inscription band as
    // one calm stroke of glaze, never letters.
    for (const p of [top, left, right]) B.fill(bc, p, lit(P.turq, 0.08));
    const core = [
      rect(PL + 5 + 2.5, TOP + 9 + 2.5, PR - 5 - 2.5, TOP + 9 + FB - 2.5),
      rect(PL + 5 + 2.5, TOP + 9 + 2.5, PL + 5 + FB - 2.5, DADO),
      rect(PR - 5 - FB + 2.5, TOP + 9 + 2.5, PR - 5 - 2.5, DADO),
    ];
    for (const p of core) B.fill(bc, p, mixh(P.cobalt, P.turq, 0.3));
  }

  // Pier panels: two tall pointed-head panels on each pier (the spec's
  // "stacked shallow panels with pointed heads"), one painting, stamped four
  // times. Richer than the wings' (the pylons carry cut-tile mosaic, the wings
  // banna'i): a bold cobalt frame, a cobalt lozenge under the head and one
  // turquoise eight-point girih star, at a lower contrast than the spandrel's
  // white star field, which stays the loudest thing on the front.
  {
    const PC = mixh(P.cobalt, P.turq, 0.15);
    const PP = panel(22, 80, 16, PC, function (c) {
      const x = 11;
      B.fill(c, [[x, 18], [x + 5, 30], [x, 42], [x - 5, 30]], PC);
      B.fill(c, starPts(x, 60, 10, 5.6, 8, -Math.PI / 2), P.turq);
      B.fill(c, starPts(x, 60, 4.2, 2.6, 8, -Math.PI / 2 + Math.PI / 8), PC);
    });
    for (const x of [88, 258]) {
      for (const y of [56, 144]) bc.drawImage(PP, x, y);
    }
  }

  // The frame round the arch and its spandrels, and the spandrel field:
  // dark cobalt with large light stars.
  const ARCH = archPts(AL, AR, SPRING, APEX, GY, 24);
  const ARCH_LINE = archPts(AL, AR, SPRING, APEX, null, 24);
  {
    B.fill(bc, rect(SL - 3, ST - 3, SR + 3, DADO), lit(P.turq, 0.05));
    B.fill(bc, rect(SL, ST, SR, DADO), BRICK);
    // The jamb faces below the springing: buff brick with an upright band.
    wall(rect(SL, SPRING, AL, DADO));
    wall(rect(AR, SPRING, SR, DADO));
    for (const x of [(SL + AL) / 2, (AR + SR) / 2]) B.fill(bc, rect(x - 2, SPRING + 6, x + 2, DADO - 4), mixh(P.cobalt, P.turq, 0.3));
    B.fill(bc, rect(SL, ST, SR, SPRING + 2), P.cobalt);
    // The star field: one tile, stamped on a staggered grid over the whole
    // cobalt field, joined by turquoise strapwork, the arch and the frame
    // cropping it, so it reads as one tessellated mosaic panel. The tile: a
    // white eight-point star on a turquoise ring, on the cobalt.
    const R = 14;
    const TS = 2 * R + 4;
    const tile = B.layer(TS, TS);
    {
      const c = tile.getContext('2d');
      const o = TS / 2;
      c.beginPath();
      c.arc(o, o, R * 0.78, 0, Math.PI * 2);
      c.fillStyle = lit(P.turq, 0.05);
      c.fill();
      B.fill(c, starPts(o, o, R, R * 0.5, 8, -Math.PI / 2), P.white);
    }
    const DX = 34;
    const DY = 30;
    const cells = [];
    for (let r = -1; r <= 4; r++) {
      const y = 70 + r * DY;
      const off = r % 2 === 0 ? DX / 2 : 0;
      for (let x = CX - 4 * DX + off; x <= CX + 4 * DX; x += DX) cells.push([x, y]);
    }
    B.clip(bc, rect(SL, ST, SR, SPRING + 2), function () {
      // The strapwork: straight turquoise bands from star to star along the
      // two diagonals of the grid.
      for (const [x, y] of cells) {
        for (const d of [-1, 1]) line(bc, x, y, x + (d * DX) / 2, y + DY, 3.5, shd(P.turq, 0.12));
      }
      for (const [x, y] of cells) bc.drawImage(tile, x - TS / 2, y - TS / 2);
      wash(bc, rect(SL, ST, SR, ST + 2), P.turq, 0.5);
    });
  }

  // --- The iwan: a deep vaulted recess with a back wall, not a hole.
  // The sun is low behind the viewer's right shoulder, so light goes deep
  // into it (the spec's lighting): the left inner face and most of the back
  // wall are lit; the right inner face and the vault soffit, which faces
  // down, are in shade, darkest up under the crown. The arch's rim throws its
  // shadow onto the back wall: the opening's own outline shifted down and to
  // the left, so its edge is a clean curve crossing the wall's upper right.
  // The dark pointed door on the lit back wall is what makes it read as a
  // recess. Shade inside is brick and tile in shadow: buff darkened and
  // cooled toward the cobalt glaze, not toward violet.
  {
    const COOL = mixh(P.cobalt, INK, 0.35); // a deep blue-black, for the shade mixes
    const UMBER = '#6b4a2e'; // the brick's own dark, so the shade stays brick
    const brickShade = (t) => mixh(mixh(BRICK, UMBER, t * 0.7), COOL, t * 0.5);
    const LIT_L = lit(BRICK, 0.22); // the left inner face, turned toward the sun
    const LIT_B = shd(BRICK, 0.05); // the back wall, a step below it
    const SH_B = brickShade(0.32); // the back wall in the arch's shadow
    const SH_R = brickShade(0.4); // the right inner face
    B.clip(bc, ARCH, function () {
      // The vault soffit, which faces down: in shade, glazed and cool (brick
      // toward the set's shadow with a hint of turquoise), in four large
      // facets, darkest at the upper right, lightest at the lower left where
      // the sun reaches in: flat tones, which the indexed palette keeps clean. A turquoise rib
      // runs along the crown.
      const FRONT = archPts(AL, AR, SPRING, APEX, null, 24);
      const BACKL = archPts(BL, BR, BS, BA, null, 24);
      const VAULT = mixh(mixh(BRICK, SHADOW, 0.42), P.turq, 0.16);
      const facets = [[0, 12, mixh(VAULT, LIT_L, 0.3)], [12, 24, VAULT], [24, 36, shd(VAULT, 0.22)], [36, 48, shd(VAULT, 0.1)]];
      for (const [i0, i1, tone] of facets) {
        const pts = FRONT.slice(i0, i1 + 1).concat(BACKL.slice(i0, i1 + 1).reverse());
        B.fill(bc, pts, tone);
      }
      line(bc, CX, APEX, CX, BA, 3, mixh(P.turq, VAULT, 0.25));
      // The left inner face, lit.
      B.fill(bc, [[AL, SPRING], [BL, BS], [BL, BF], [AL, GY]], LIT_L);
      // The right inner face, in shade.
      B.fill(bc, [[AR, SPRING], [BR, BS], [BR, BF], [AR, GY]], SH_R);
      // The back wall, lit, under its own pointed head.
      const BACK = archPts(BL, BR, BS, BA, BF, 16);
      B.fill(bc, BACK, LIT_B);
      B.clip(bc, BACK, function () {
        // The arch rim's shadow on it.
        const dx = -18;
        const dy = 52;
        const lit_ = archPts(AL + dx, AR + dx, SPRING + dy, APEX + dy, H + 40, 24);
        bc.save();
        bc.beginPath();
        bc.rect(0, 0, W, H);
        for (let i = 0; i < lit_.length; i++) {
          if (i === 0) bc.moveTo(lit_[i][0], lit_[i][1]);
          else bc.lineTo(lit_[i][0], lit_[i][1]);
        }
        bc.closePath();
        bc.fillStyle = SH_B;
        bc.fill('evenodd');
        bc.restore();
      });
      // The floor of the iwan, in the building's shade.
      B.fill(bc, [[AL, GY], [BL, BF], [BR, BF], [AR, GY]], shd(P.pave, 0.3));
      // The marble dado inside, lit on the left face.
      B.fill(bc, [[AL, DADO], [BL, DADO + 5], [BL, BF], [AL, GY]], MARBLE);
      B.fill(bc, [[AR, DADO], [BR, DADO + 5], [BR, BF], [AR, GY]], mixh(MARBLE, COOL, 0.32));
      // The central door, pointed, in a thin tile frame: the one dark in the recess.
      B.fill(bc, archPts(CX - 15, CX + 15, 206, 186, BF, 12), mixh(P.turq, BRICK, 0.3));
      B.fill(bc, archPts(CX - 12, CX + 12, 207, 190, BF, 12), mixh(INK, P.black, 0.3));
    });
  }

  // The rope moulding: a light-blue torus round the arch and down the jambs,
  // lit on its upper right, the twist in long calm steps.
  {
    const path = [[AL, DADO]].concat(ARCH_LINE, [[AR, DADO]]);
    polyline(bc, path, 6.5, shd(P.turq, 0.25));
    polyline(bc, path, 4.5, lit(P.turq, 0.12));
    polyline(bc, path, 4.5, B.alpha(shd(P.turq, 0.3), 0.45), [4, 4]);
    // Where it turns to the sun, at the upper right, the glaze catches a warm light.
    polyline(bc, ARCH_LINE.slice(Math.floor(ARCH_LINE.length / 2), ARCH_LINE.length - 4).map((p) => [p[0] + 1, p[1] - 1]), 1.4, B.alpha(SUN, 0.8));
    polyline(bc, [[AR + 1, SPRING], [AR + 1, DADO]], 1.4, B.alpha(SUN, 0.6));
  }

  // The marble dado along the foot of the whole front ("the base of the main
  // facade", Soviet album): the portal's and the wings', in a few broad
  // panels, and the low plinth under it.
  {
    for (const [x0, x1] of [[MX[0], AL - 3], [AR + 3, MX[1]]]) {
      B.fill(bc, rect(x0, DADO, x1, PLINTH), MARBLE);
      B.fill(bc, rect(x0, DADO, x1, DADO + 2), lit(MARBLE, 0.3));
      wash(bc, rect(x0, DADO + 2, x1, DADO + 4), SHADOW, 0.18);
    }
    // The wings' dado sits back from the portal's, in its shadow.
    wash(bc, [[PL, DADO], [PL - 6, DADO + 5], [PL - 6, PLINTH], [PL, PLINTH]], SHADOW, 0.3);
    for (const x of [PL + 24, PR - 24]) B.fill(bc, rect(x - 1, DADO + 5, x + 1, PLINTH - 1), B.alpha(shd(P.marble, 0.4), 0.5));
    const PLN = shd(mixh(P.marble, P.buff, 0.5), 0.2);
    B.fill(bc, rect(MX[0], PLINTH, AL, GY), PLN);
    B.fill(bc, rect(AR, PLINTH, MX[1], GY), PLN);
    B.fill(bc, rect(MX[0], PLINTH, AL, PLINTH + 1.5), lit(PLN, 0.3));
    B.fill(bc, rect(AR, PLINTH, MX[1], PLINTH + 1.5), lit(PLN, 0.3));
  }

  // The portal's side edges against the wings.
  line(bc, PL + 0.5, WTOP, PL + 0.5, GY, 1.2, B.alpha(INK, 0.55));
  line(bc, PR - 0.5, WTOP, PR - 0.5, GY, 1.2, B.alpha(INK, 0.55));

  // --- The minaret, painted once and stamped at both ends.
  const MW = 44;
  const ML = B.layer(MW, 250);
  {
    const c = ML.getContext('2d');
    const o = MW / 2;
    const ST0 = 60; // top of the shaft, under the crown
    const R0 = 14; // half-width at the foot
    const R1 = 11.5; // at the top of the shaft
    const hw = (y) => R1 + ((R0 - R1) * (y - ST0)) / (GY - ST0);
    /**
     * A cylinder's light, in flat vertical steps that follow the taper: the
     * left third toward the shadow, the right third toward the sun, and a
     * clear light edge at the right. Laid over whatever is painted there.
     */
    const cyl = function (y0, y1, h0, h1, k) {
      const steps = [
        [-1.01, -0.62, SHADOW, 0.34],
        [-0.62, -0.3, SHADOW, 0.14],
        [0.3, 0.66, SUN, 0.16],
        [0.66, 0.84, SUN, 0.3],
        [0.84, 1.01, SUN, 0.55],
      ];
      c.save();
      c.globalCompositeOperation = 'source-atop';
      for (const [f0, f1, col, a] of steps) {
        B.fill(c, [[o + h0 * f0, y0], [o + h0 * f1, y0], [o + h1 * f1, y1], [o + h1 * f0, y1]], B.alpha(col, a * k));
      }
      c.restore();
    };
    const shaft = [[o - R1, ST0], [o + R1, ST0], [o + R0, GY], [o - R0, GY]];
    B.fill(c, shaft, BRICK);
    // The diamond lattice, wound round the cylinder: two families of helices,
    // one in cobalt glaze and one in turquoise, bold strokes about 1.4 world
    // px, about two and a half lozenges across the face. The spiral tightens
    // toward the top, as the ornament does.
    const A = 24; // px of height per radian of turn
    const LS = 30; // the lattice's vertical period at the foot
    const LB0 = 72;
    const LB1 = 212;
    const D = LB1 - LB0;
    const shrink = 0.1; // the period at the top is (1 - 2 * shrink) of the foot's
    const warp = (u) => {
      const d = LB1 - u;
      return LB1 - (d * (1 - (shrink * d) / D)) / (1 - shrink);
    };
    B.clip(c, [[o - hw(LB0), LB0], [o + hw(LB0), LB0], [o + hw(LB1), LB1], [o - hw(LB1), LB1]], function () {
      // Turquoise strands first, cobalt over them; in each family the two
      // glazes alternate, so every lozenge is edged in both and neither
      // family reads as a stripe on its own.
      for (const pass of [1, 0]) {
        for (const s of [1, -1]) {
          for (let j = -6; j <= 12; j++) {
            if (((j % 2) + 2) % 2 !== pass) continue;
            const pts = [];
            for (let th = -Math.PI / 2; th <= Math.PI / 2 + 1e-6; th += Math.PI / 24) {
              const y = warp(LB1 - j * LS + s * A * th);
              pts.push([o + hw(y) * Math.sin(th), y]);
            }
            polyline(c, pts, 5.5, pass ? P.turq : P.cobalt);
          }
        }
      }
    });
    // The bands under the crown and near the foot: a cobalt band with a solid
    // turquoise core, the inscription as rhythm, no letters.
    const band = function (y0, y1) {
      B.fill(c, [[o - hw(y0), y0], [o + hw(y0), y0], [o + hw(y1), y1], [o - hw(y1), y1]], P.cobalt);
      const m = (y0 + y1) / 2;
      B.fill(c, [[o - hw(m - 2), m - 2], [o + hw(m - 2), m - 2], [o + hw(m + 2), m + 2], [o - hw(m + 2), m + 2]], lit(P.turq, 0.15));
    };
    band(ST0, LB0);
    band(LB1, 222);
    // The pale stone plinth.
    B.fill(c, [[o - hw(222), 222], [o + hw(222), 222], [o + R0, GY], [o - R0, GY]], MARBLE);
    B.fill(c, rect(o - R0, 222, o + R0, 224.5), lit(MARBLE, 0.3));
    // Under the crown's overhang, shade on the shaft.
    wash(c, [[o - R1, ST0], [o + R1, ST0], [o + R1, ST0 + 4], [o - R1, ST0 + 4]], SHADOW, 0.4);
    cyl(ST0, GY, R1, R0, 1);

    // The crown: a flared stalactite ring in two tiers, each with a dark
    // hollow underside hung with pointed cells, and a solid turquoise band
    // on top. No lantern, no cupola, no balcony, no spire.
    const CT = 34;
    const T1 = 15.5; // the first tier's half-width
    const T2 = 19; // the top tier's
    const UNDER = mixh(P.cobalt, INK, 0.5);
    const cells = function (y, r, n, h) {
      for (let i = 0; i < n; i++) {
        const th = -Math.PI / 2 + ((i + 0.5) * Math.PI) / n;
        const x = o + r * Math.sin(th);
        const w = ((r * Math.PI) / n / 2) * Math.cos(th) * 0.85;
        B.fill(c, [[x - w, y], [x + w, y], [x, y + h * Math.cos(th) * 0.5 + h * 0.5]], P.turq);
      }
    };
    // Tier one.
    B.fill(c, [[o - R1, ST0], [o - T1, 53], [o + T1, 53], [o + R1, ST0]], UNDER);
    cells(53, T1 - 1, 4, 3.5);
    B.fill(c, rect(o - T1, 47, o + T1, 53), lit(BRICK, 0.2));
    B.fill(c, rect(o - T1, 47, o + T1, 48.5), lit(BRICK, 0.5));
    cyl(47, 53, T1, T1, 0.8);
    // Tier two.
    B.fill(c, [[o - T1, 47], [o - T2, 42], [o + T2, 42], [o + T1, 47]], UNDER);
    cells(42, T2 - 1, 5, 3);
    B.fill(c, rect(o - T2, CT, o + T2, 42), shd(P.turq, 0.08));
    B.fill(c, rect(o - T2, CT, o + T2, CT + 2), lit(BRICK, 0.4));
    cyl(CT, 42, T2, T2, 0.8);
    inkRound(ML, 0.75);
  }
  for (const x of MX) bc.drawImage(ML, x - MW / 2, 0);

  inkRound(bld, 0.85);
  ctx.drawImage(bld, 0, 0);
};
