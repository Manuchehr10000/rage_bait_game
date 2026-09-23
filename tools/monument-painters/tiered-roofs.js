/**
 * Chapter 8 vignette: Himeji Castle, the keep complex from the Sannomaru.
 *
 * Asset map-monument-ch08-himeji, 92 x 70 world px, painted 368 x 280. The view
 * is the postcard's: from the south end of the Sannomaru lawn, looking north up
 * at the hilltop, turned a few degrees so the west faces show as narrow cool
 * returns. The main keep stands right of centre, highest and largest; the West
 * small keep stands to its left and much lower, joined to it by a low
 * two-storey corridor-turret; the Inui small keep, the largest of the three
 * small keeps, rises further left and behind the West keep, cooler because it
 * is further back. As the note says, the walled terraces between the lawn and
 * the keeps are compressed into ONE tall stone wall with a concave face (the
 * fan slope, drawn stronger than life), topped by a white plastered wall under
 * the small keeps. At the foot, a sliver of gravel and lawn and three masses
 * of dark black pine.
 *
 * The south face, tier by tier, as the research gives it: tier 1 a plain
 * skirt roof (tier 1 of the south face is unverified in the research, and no
 * photograph could be reached, so it is drawn plain rather than guessed);
 * tier 2 the great hip-and-gable roof of the lower block, its gable ends to
 * east and west rising in profile at each end, with the curved kara-hafu at
 * the centre over a big lattice window; tier 3 the paired gables; tier 4 one
 * triangular chidori-hafu; the top tier a kara-hafu under the top roof, whose
 * ridge carries a grey fish at each end.
 *
 * Built the way the pilot (abu-simbel.js) is built:
 *   1. the shared sky, one calm cloud;
 *   2. the setting: Himeyama's wooded slopes, low behind the wall's ends; the
 *      gravel and lawn in front;
 *   3. the buildings, back to front, each on its own layer: every storey a
 *      flat box (one warm lit face, a narrow cool west return), the cool
 *      soffit and the eave's cast shadow band on top of every storey, roofs
 *      top down, gables, ridge and fish; then the cast shadows of the nearer
 *      building onto the farther; then the stamped windows;
 *   4. the stone wall: small irregular fitted stones in wandering, broken
 *      courses, low in contrast, under a few big washes that draw the curve
 *      (steep top in shade, flared foot lit); long-and-short corner stones up
 *      each curved edge; the cool west return;
 *   5. the plastered wall on the stone wall's top, under the small keeps,
 *      with the main keep's shadow across its right end;
 *   6. the cast shadow of the wall on the ground, and three pine masses that
 *      carry it;
 *   7. ink round each layer.
 * Repeated elements (windows, the fish, the eave's corner profile, the pine
 * pad, the corner stones, the loopholes) are painted once and stamped
 * (pillar 4).
 */
PAINTERS['tiered-roofs'] = function (ctx, W, H, B) {
  // The research palette, a little sunnier than life.
  const S = {
    plaster: '#f4f1e7', // white lime plaster in full sun
    tile: '#7c878d', // smoked grey tile, sunlit slope (a touch blue-green)
    tileBody: '#566067', // the same tile turned from the sun: eave edges and ridges
    joint: '#e6e4dc', // the plaster sealing tile joints and ridges
    shachi: '#5a5f66', // fired-tile fish on the top ridge
    window: '#3a3631', // dark interior through the lattice
    stoneLit: '#b8ae98',
    stoneMid: '#8c8475',
    stoneJoint: '#5a534b',
    gravel: '#dccfb0',
    pine: '#36503c',
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
  /** Another layer's silhouette, shifted, laid over this one as cast shadow. */
  const throwShadow = function (onto, from, dx, dy, a, clipPts) {
    const c = onto.getContext('2d');
    c.save();
    if (clipPts) {
      B.path(c, clipPts);
      c.clip();
    }
    c.globalCompositeOperation = 'source-atop';
    c.globalAlpha = a;
    c.drawImage(silhouette(from, SHADOW), dx, dy);
    c.restore();
  };
  /** A wash laid only over what is already on the layer. */
  const washAtop = function (c, fn) {
    c.save();
    c.globalCompositeOperation = 'source-atop';
    fn();
    c.restore();
  };
  const sstep = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

  // ---------------------------------------------------------------------------
  // Layout.

  const TOP = 200; // the stone wall's top, where the keeps stand
  const FOOT = 244; // the wall's foot on the gravel
  const HORIZON = 236; // behind the wall's ends, where the hills fall away

  // The fan slope, drawn stronger than life (the note allows it): nearly
  // upright at the top, bending steadily all the way down, flared at the
  // foot. One quadratic, so the bend is spread evenly through the height.
  const tw = (y) => Math.max(0, Math.min(1, (y - TOP) / (FOOT - TOP)));
  const bat = (y) => 3 * tw(y) + 19 * tw(y) * tw(y);
  const FXL = 54; // the front face's left arris at the top
  const FXR = 318; // its right-hand (east) edge at the top
  const RET = 10; // the west return's width at the top
  const FL = (y) => FXL - bat(y); // the left arris
  const FR = (y) => FXR + bat(y); // the east end, lit, in profile
  const OL = (y) => FXL - RET - bat(y) * 1.4; // the far edge of the west return
  const curvePts = function (f, y0, y1) {
    const pts = [];
    for (let y = y0; y <= y1 + 0.01; y += 1) pts.push([f(y), y]);
    return pts;
  };
  const FACE = curvePts(FL, TOP, FOOT + 1).reverse().concat(curvePts(FR, TOP, FOOT + 1));
  const RETURN = curvePts(OL, TOP, FOOT + 1).reverse().concat(curvePts(FL, TOP, FOOT + 1));
  const WALL = curvePts(OL, TOP, FOOT + 1).reverse().concat(curvePts(FR, TOP, FOOT + 1));

  const MX = 236; // the main keep's axis
  const WX = 104; // the West small keep
  const IX = 74; // the Inui small keep, further back
  const CX = 153; // the corridor-turret

  // ---------------------------------------------------------------------------
  // 1. The shared sky, with one calm cloud off centre, high over the small
  // keeps.

  B.sky(ctx, W, HORIZON + 4);
  {
    const cl = B.layer();
    const c = cl.getContext('2d');
    const blobs = [[58, 50, 20, 9], [80, 44, 22, 12], [104, 49, 18, 8], [70, 53, 26, 6], [96, 54, 24, 5]];
    c.fillStyle = B.alpha('#ffffff', 1);
    for (const [x, y, rx, ry] of blobs) {
      c.beginPath();
      c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      c.fill();
    }
    washAtop(c, function () {
      c.fillStyle = B.alpha(mixh(B.C.skyLow, SHADOW, 0.15), 0.8);
      c.fillRect(0, 53, W, 10);
      c.fillStyle = B.alpha(B.C.skyLow, 0.7);
      c.fillRect(0, 50, W, 3);
    });
    c.clearRect(0, 58, W, 20);
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.drawImage(cl, 0, 0);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 2. Himeyama: the wooded slopes falling away behind the wall's ends, below
  // its top, so the castle plainly crowns the hill. Two calm shapes, lit
  // along their upper right edges.

  {
    const far = mixh(S.pine, B.C.skyLow, 0.28);
    const hills = [
      [[0, 222], [30, 214], [60, 209], [90, 207], [90, FOOT + 4], [0, FOOT + 4]],
      [[W, 224], [350, 218], [326, 212], [300, 210], [300, FOOT + 4], [W, FOOT + 4]],
    ];
    for (const h of hills) {
      B.fill(ctx, h, far);
      B.clip(ctx, h, function () {
        const g = ctx.createLinearGradient(0, 206, 0, FOOT);
        g.addColorStop(0, B.alpha(SUN, 0.22));
        g.addColorStop(0.4, B.alpha(SUN, 0));
        g.addColorStop(1, B.alpha(SHADOW, 0.18));
        ctx.fillStyle = g;
        ctx.fillRect(0, 200, W, 60);
      });
    }
  }

  // The ground in front of the wall: a sliver of pale gravel at its foot,
  // then the Sannomaru lawn darkening toward the viewer.
  {
    const lg = ctx.createLinearGradient(0, FOOT, 0, H);
    lg.addColorStop(0, lit(B.C.foliage, 0.05));
    lg.addColorStop(1, shd(B.C.foliage, 0.3));
    ctx.fillStyle = lg;
    ctx.fillRect(0, FOOT - 2, W, H - FOOT + 2);
    B.fill(ctx, rect(0, FOOT - 1, W, FOOT + 7), mixh(S.gravel, S.stoneMid, 0.2));
    B.fill(ctx, rect(0, FOOT + 6, W, FOOT + 8), mixh(S.gravel, B.C.foliage, 0.45));
  }

  // ---------------------------------------------------------------------------
  // 3. The buildings.

  /** One window: a wide dark barred slit, painted once and stamped. */
  const WIN_W = 9;
  const WIN_H = 5;
  const win = B.layer(WIN_W, WIN_H);
  {
    const c = win.getContext('2d');
    B.fill(c, rect(0, 0, WIN_W, WIN_H), S.window);
    B.fill(c, rect(0, 0, WIN_W, 1.5), mixh(S.window, SHADOW, 0.3));
    for (const x of [3, 6]) B.fill(c, rect(x, 1.5, x + 1, WIN_H), B.alpha(S.plaster, 0.4));
  }

  /**
   * One shachihoko, painted once, for the right-hand end of a ridge: the head
   * down on the ridge with its snout toward the ridge's middle, the body
   * rising, and the forked tail curling up and back inward over the head. The
   * left-hand fish is the same drawing mirrored.
   */
  const FISH_W = 12;
  const FISH_H = 14;
  const FISH_U = 7; // where the fish's base centre sits in its layer
  const fish = B.layer(FISH_W, FISH_H);
  {
    const c = fish.getContext('2d');
    const P = [[2.2, 0], [3, 2], [2.8, 4.4], [2, 6.6], [1.4, 8.4], [2.6, 10.6], [3.6, 12.6], [1.2, 11.6], [-0.6, 10.4], [-2.6, 11.4], [-4.8, 11.6], [-2.8, 9.6], [-1.4, 7.8], [-1.2, 5.8], [-2.4, 4.4], [-4.6, 3.2], [-5.2, 1.4], [-3.8, 0]];
    const pts = P.map((p) => [FISH_U + p[0], 13.8 - p[1]]);
    const g = c.createLinearGradient(FISH_W, 0, 0, FISH_H);
    g.addColorStop(0, mixh(S.shachi, S.joint, 0.25));
    g.addColorStop(1, shd(S.shachi, 0.15));
    B.fill(c, pts, g);
  }
  /** Stamp the fish at both ends of a ridge, at scale k. */
  const stampFish = function (c, xl, xr, y, k) {
    const w = Math.round(FISH_W * k);
    const h = Math.round(FISH_H * k);
    const u = Math.round(FISH_U * k);
    c.save();
    c.imageSmoothingEnabled = true;
    c.drawImage(fish, Math.round(xr) - u, Math.round(y - h + 1), w, h);
    c.translate(Math.round(xl) + u, 0);
    c.scale(-1, 1);
    c.drawImage(fish, 0, Math.round(y - h + 1), w, h);
    c.restore();
  };

  /**
   * The eave's corner, drawn once as a profile: how far the eave line has
   * lifted at a distance d from its tip, for an eave of half width e. Flat
   * across the middle, rising gently through the outer half: the same curve,
   * scaled, on every tier of every building. A gentle lift, not a sweep.
   */
  const EAVE_RUN = 0.5;
  const EAVE_RISE = 0.08;
  const eaveLift = function (e, d) {
    const run = e * EAVE_RUN;
    if (d >= run) return 0;
    const t = 1 - d / run;
    return e * EAVE_RISE * (0.75 * t * t + 0.25 * Math.pow(t, 6));
  };

  /**
   * A tiered building. K.tiers bottom up: hw (half width of the wall), h (the
   * wall's visible height), sof (the soffit under the eave), eave (the eave's
   * half width), rh (the roof slope's height), top (half width where the roof
   * meets the storey above, or the ridge for the top tier), win (window
   * offsets from the axis, and the drop from the wall top), kara (a curved
   * gable on this eave: half width and lift), bay (the lattice window under
   * it), tri (triangular gables on this roof: [dx, half width, height]), ends
   * (the roof's gable ends in profile: [half width, rise]).
   * Returns a function that stamps the windows, called after cast shadows.
   */
  function paintBuilding(layer, K) {
    const c = layer.getContext('2d');
    const walls = B.layer();
    const wc = walls.getContext('2d');
    const roofs = B.layer();
    const rc = roofs.getContext('2d');
    const cx = K.cx;
    const PL = K.plaster;
    const TL = K.tile;
    const RT = K.ret; // the west return, cool
    const FACE_C = lit(PL, 0.2); // every lit face one warm value
    const RET_C = shd(PL, 0.3);
    const T = [];
    let y = K.base;
    for (const t of K.tiers) {
      const o = Object.assign({}, t);
      o.bot = y;
      o.wallTop = y - t.h;
      o.eaveY = o.wallTop - t.sof;
      o.roofTop = o.eaveY - t.rh;
      T.push(o);
      y = o.roofTop + 2;
    }
    const karaLift = (o, x) => (o.kara ? o.kara[1] * sstep(1 - Math.abs(x - cx) / o.kara[0]) : 0);
    const lift = (o, x) => eaveLift(o.eave, o.eave - Math.abs(x - cx)) + karaLift(o, x);
    const lipAt = (o, x) => o.eaveY - lift(o, x);
    const eaveCurve = function (o, x0, x1, dy) {
      const pts = [];
      for (let x = x0; x <= x1 + 0.01; x += 1) pts.push([x, lipAt(o, x) + (dy || 0)]);
      return pts;
    };

    // Walls: flat boxes. One lit warm face, one narrow cool west return.
    for (const o of T) {
      const kh = o.kara ? o.kara[1] : 0;
      B.fill(wc, rect(cx - o.hw, o.eaveY - 1, cx + o.hw, o.bot + 3), FACE_C);
      B.fill(wc, rect(cx - o.hw, o.eaveY - 1, cx - o.hw + RT, o.bot + 3), RET_C);
      if (kh) B.fill(wc, rect(cx - o.kara[0], o.eaveY - kh - 1, cx + o.kara[0], o.eaveY), FACE_C);
    }
    // Under the curved gables, a bay with a big lattice window.
    for (const o of T) {
      if (!o.kara || !o.bay) continue;
      const [bw, bh] = o.bay;
      const y0 = Math.round(o.wallTop - o.kara[1] + 6);
      const x0 = Math.round(cx - bw / 2);
      B.fill(wc, rect(x0, y0, x0 + bw, y0 + bh), S.window);
      for (let x = x0 + 3; x < x0 + bw - 1; x += 3) B.fill(wc, rect(x, y0 + 1.5, x + 1, y0 + bh), B.alpha(PL, 0.4));
      B.fill(wc, rect(x0 - 1.5, y0 + bh, x0 + bw + 1.5, y0 + bh + 2), lit(PL, 0.35));
    }
    // The cool soffit under every eave, and below it the eave's own shadow
    // cast down and to the left along the top of the wall: deeper at the
    // left. This rhythm of white storey and shadow band makes the tiers.
    for (const o of T) {
      const top = eaveCurve(o, cx - o.eave, cx + o.eave, 0);
      const bot = [];
      for (let x = cx + o.hw; x >= cx - o.hw - 0.01; x -= 1) bot.push([x, o.wallTop - karaLift(o, x)]);
      const pts = top.concat([[cx + o.eave - 2, lipAt(o, cx + o.eave) + 1.5]], bot, [[cx - o.eave + 2, lipAt(o, cx - o.eave) + 1.5]]);
      B.fill(wc, pts, shd(PL, 0.5));
      const band = [];
      for (let x = cx - o.hw; x <= cx + o.hw + 0.01; x += 1) band.push([x, o.wallTop - karaLift(o, x) - 0.5]);
      for (let x = cx + o.hw; x >= cx - o.hw - 0.01; x -= 1) {
        const f = (cx + o.hw - x) / (2 * o.hw);
        band.push([x, o.wallTop - karaLift(o, x) + 3 + 3 * f]);
      }
      B.fill(wc, band, B.alpha(SHADOW, 0.3));
    }
    // Roofs, top down, so each lower roof sits in front of the storey above it.
    for (let i = T.length - 1; i >= 0; i--) {
      const o = T[i];
      const topY = o.roofTop;
      const e = o.eave;
      const lip = eaveCurve(o, cx - e, cx + e, 0);
      // The gable ends of a hip-and-gable roof, in profile at each end: the
      // steep verge rising from the hip to the ridge behind the storey above.
      if (o.ends) {
        const [ew, er] = o.ends;
        for (const s of [-1, 1]) {
          const x0 = cx + s * (ew + 5);
          const pts = [[x0, topY + 5], [cx + s * (ew + 0.5), topY - er], [cx + s * (ew - 3), topY - er], [cx + s * (ew - 9), topY + 2]];
          B.fill(rc, pts, s < 0 ? shd(TL, 0.3) : lit(TL, 0.18));
          line(rc, cx + s * (ew + 0.5), topY - er, x0 + s * 0.5, topY + 4, 1.1, s < 0 ? shd(K.tileBody, 0.2) : B.alpha(S.joint, 0.6));
        }
      }
      // the south slope: one lit tile value, a little brighter where it
      // catches the sky near its top
      const roof = lip.concat([[cx + o.top, topY], [cx - o.top, topY]]);
      B.fill(rc, roof, TL);
      B.clip(rc, roof, function () {
        const v = rc.createLinearGradient(0, topY, 0, o.eaveY);
        v.addColorStop(0, B.alpha(SUN, 0.2));
        v.addColorStop(1, B.alpha(SUN, 0));
        rc.fillStyle = v;
        rc.fillRect(cx - e - 2, topY - 14, e * 2 + 4, o.eaveY - topY + 16);
        // the west end slope, turned from the sun: a narrow cool facet
        B.fill(rc, [[cx - e - 2, lipAt(o, cx - e) + 2], [cx - o.top - 1, topY - 1], [cx - o.top + 5, topY - 1], [cx - e + 12, lipAt(o, cx - e + 12) + 2]], shd(TL, 0.32));
      });
      // the right hip sealed white in the sun
      line(rc, cx + e - 1.5, lipAt(o, cx + e) - 2, cx + o.top, topY + 0.5, 1.2, B.alpha(S.joint, 0.55));
      // The kara-hafu's hump rises above the slope: its own little roof.
      if (o.kara) {
        const [kw] = o.kara;
        const hump = eaveCurve(o, cx - kw, cx + kw, -2);
        const up = hump.map((p) => [p[0], p[1] - 4 - 2.5 * sstep(1 - Math.abs(p[0] - cx) / kw)]).reverse();
        const hg = rc.createLinearGradient(cx - kw, 0, cx + kw, 0);
        hg.addColorStop(0, shd(TL, 0.2));
        hg.addColorStop(1, lit(TL, 0.3));
        B.fill(rc, hump.concat(up), hg);
        rc.beginPath();
        up.forEach((p, k) => (k ? rc.lineTo(p[0], p[1] + 0.7) : rc.moveTo(p[0], p[1] + 0.7)));
        rc.lineWidth = 1.2;
        rc.strokeStyle = B.alpha(S.joint, 0.65);
        rc.stroke();
      }
      // The eave's edge: a dark band of tile ends that thins to a point at
      // each upturned tip, with one fine muted plaster line along its top.
      const thick = (x) => 1.4 + 2 * sstep((e - Math.abs(x - cx)) / 8);
      const band = lip.concat(lip.slice().reverse().map((p) => [p[0], p[1] - thick(p[0])]));
      const eg = rc.createLinearGradient(cx - e, 0, cx + e, 0);
      eg.addColorStop(0, shd(K.tileBody, 0.24));
      eg.addColorStop(1, lit(K.tileBody, 0.12));
      B.fill(rc, band, eg);
      for (const s of [-1, 1]) {
        const tx = cx + s * e;
        const ty = lipAt(o, tx);
        B.fill(rc, [[tx - s * 3, ty + 0.2], [tx + s * 1.6, ty - 2.4], [tx - s * 3, ty - 1.6]], s < 0 ? shd(K.tileBody, 0.24) : lit(K.tileBody, 0.12));
      }
      rc.beginPath();
      lip.slice(3, -3).forEach((p, k) => (k ? rc.lineTo(p[0], p[1] - thick(p[0]) + 0.4) : rc.moveTo(p[0], p[1] - thick(p[0]) + 0.4)));
      rc.lineWidth = 0.9;
      rc.strokeStyle = B.alpha(S.joint, 0.42);
      rc.stroke();
      // Triangular gables on the slope: white plaster faces, lit on the right.
      for (const [dx, gw, gh] of o.tri || []) {
        const gx = cx + dx;
        const by = lipAt(o, gx) - 2.5;
        const ay = by - gh;
        B.fill(rc, [[gx - gw + 2, by], [gx, ay + 2], [gx + gw - 2, by]], FACE_C);
        B.fill(rc, [[gx - gw + 2, by], [gx, ay + 2], [gx, by]], shd(PL, 0.12));
        // the shadow of the verges on the face
        wash(rc, [[gx - gw + 2, by], [gx, ay + 2], [gx + gw - 2, by], [gx + gw - 5, by], [gx, ay + 7], [gx - gw + 6, by]], SHADOW, 0.3);
        B.fill(rc, [[gx - gw - 2, by + 1.5], [gx, ay - 1.5], [gx, ay + 2.5], [gx - gw + 2, by + 1.5]], shd(TL, 0.28));
        B.fill(rc, [[gx + gw + 2, by + 1.5], [gx, ay - 1.5], [gx, ay + 2.5], [gx + gw - 2, by + 1.5]], lit(TL, 0.22));
        line(rc, gx, ay - 1, gx + gw + 1.5, by + 0.5, 0.9, B.alpha(S.joint, 0.6));
      }
    }
    // The top ridge, sealed in plaster, and its two fish.
    const tt = T[T.length - 1];
    const ry = tt.roofTop;
    B.fill(rc, rect(cx - tt.top - 1, ry - 3, cx + tt.top + 1, ry + 1), K.tileBody);
    line(rc, cx - tt.top, ry - 2.4, cx + tt.top, ry - 2.4, 0.9, B.alpha(S.joint, 0.6));
    if (K.shachi) stampFish(rc, cx - tt.top, cx + tt.top, ry - 2.5, K.shachi);

    c.drawImage(walls, 0, 0);
    c.drawImage(roofs, 0, 0);

    const stamp = function () {
      for (const o of T) {
        if (!o.win) continue;
        const [xs, dy] = o.win;
        for (const dx of xs) c.drawImage(win, Math.round(cx + dx - WIN_W / 2), Math.round(o.wallTop + dy));
      }
    };
    return stamp;
  }

  // The tile a clear step darker than the sky and the plaster: the research
  // tile grey leaned toward its turned body and the set's shadow.
  const common = { plaster: S.plaster, tile: shd(mixh(S.tile, S.tileBody, 0.35), 0.06), tileBody: shd(S.tileBody, 0.1), ret: 4 };

  // The Inui small keep: the largest of the three small keeps (four floors
  // inside, three roofs), behind and to the left of the West keep, so its
  // upper storeys rise above the West keep's roofs.
  const inui = B.layer();
  const stampInui = paintBuilding(inui, Object.assign({}, common, {
    cx: IX,
    base: TOP - 6,
    shachi: 0.62,
    tiers: [
      { hw: 29, h: 20, sof: 3, eave: 36, rh: 9, top: 23 },
      { hw: 24, h: 17, sof: 3, eave: 31, rh: 9, top: 18, win: [[-9, 9], 5] },
      { hw: 19, h: 16, sof: 3, eave: 25, rh: 13, top: 12, win: [[0], 5] },
    ],
  }));

  // The West small keep: three roof tiers, well below the main keep.
  const west = B.layer();
  const stampWest = paintBuilding(west, Object.assign({}, common, {
    cx: WX,
    base: TOP - 2,
    shachi: 0.6,
    tiers: [
      { hw: 29, h: 15, sof: 3, eave: 36, rh: 9, top: 22, win: [[-14, 14], 4] },
      { hw: 23, h: 13, sof: 3, eave: 30, rh: 9, top: 17, win: [[-9, 9], 4] },
      { hw: 18, h: 13, sof: 3, eave: 24, rh: 12, top: 11, win: [[0], 4] },
    ],
  }));

  // The corridor-turret: two storeys, low, between the West keep and the main keep.
  const corridor = B.layer();
  const stampCorridor = paintBuilding(corridor, Object.assign({}, common, {
    cx: CX,
    base: TOP - 2,
    tiers: [
      { hw: 24, h: 12, sof: 3, eave: 28, rh: 6, top: 24 },
      { hw: 21, h: 11, sof: 3, eave: 25, rh: 9, top: 16, win: [[-8, 8], 3] },
    ],
  }));

  // The main keep: five roof tiers, the two of the broad lower block heavy,
  // the three above set back on it.
  const main = B.layer();
  const stampMain = paintBuilding(main, Object.assign({}, common, {
    cx: MX,
    base: TOP + 1,
    shachi: 0.85,
    ret: 5,
    tiers: [
      { hw: 60, h: 22, sof: 4, eave: 71, rh: 10, top: 54, win: [[-36, -14, 14, 36], 8] },
      { hw: 55, h: 21, sof: 4, eave: 66, rh: 14, top: 38, win: [[-36, 36], 7], kara: [18, 10], bay: [15, 8], ends: [44, 6] },
      { hw: 40, h: 16, sof: 4, eave: 51, rh: 10, top: 30, win: [[-26, 26], 5], tri: [[-15, 15, 17], [15, 15, 17]] },
      { hw: 32, h: 14, sof: 3, eave: 42, rh: 10, top: 24, win: [[-20, 20], 4], tri: [[0, 16, 17]] },
      { hw: 26, h: 16, sof: 3, eave: 35, rh: 16, top: 20, win: [[-17, 17], 5], kara: [12, 7], bay: [9, 5] },
    ],
  }));

  // Cast shadows of the nearer onto the farther, down and to the left: the
  // main keep's stepped silhouette across the corridor-turret, the West keep
  // across the Inui keep. Then the windows, stamped last so every window is
  // the same pixels.
  stampMain();
  throwShadow(corridor, main, -18, 10, 0.4);
  throwShadow(inui, west, -10, 7, 0.3);
  stampCorridor();
  stampWest();
  stampInui();
  // The Inui keep, further back: a cool veil of distance over it.
  {
    const c = inui.getContext('2d');
    washAtop(c, function () {
      c.fillStyle = B.alpha(mixh(B.C.skyLow, SHADOW, 0.35), 0.28);
      c.fillRect(0, 0, W, H);
    });
  }

  inkRound(inui, 0.6);
  inkRound(corridor, 0.75);
  inkRound(west, 0.85);
  inkRound(main, 0.9);
  for (const l of [inui, west, corridor, main]) ctx.drawImage(l, 0, 0);

  // ---------------------------------------------------------------------------
  // 4. The stone wall. Small, irregular, roughly dressed stones fitted in
  // courses that wander, step and break (uchikomi-hagi), wedge stones in the
  // joints, all low in contrast so it reads as one plane at 92 x 70; a few
  // big washes draw the curve; long-and-short corner stones up each edge.

  const wall = B.layer();
  {
    const c = wall.getContext('2d');
    const r = B.rng(808);
    const JOINT = mixh(S.stoneMid, S.stoneJoint, 0.18);
    const tones = [S.stoneLit, mixh(S.stoneLit, S.stoneMid, 0.16), mixh(S.stoneLit, '#c2ae8c', 0.35), mixh(S.stoneLit, '#a5a49f', 0.35), lit(S.stoneLit, 0.08), mixh(S.stoneLit, S.stoneMid, 0.08)];
    B.fill(c, WALL, JOINT);
    const G = 0.55; // half a joint
    // the course lines: each wanders a little along its length
    const lines = [];
    for (let y = TOP + 2; y < FOOT + 6;) {
      const a = 0.5 + r() * 1.1;
      const f = 0.05 + r() * 0.07;
      const p = r() * 6.3;
      const y0 = y;
      lines.push((x) => y0 + a * Math.sin(x * f + p));
      y += 4 + Math.floor(r() * 4);
    }
    const x0 = FL(FOOT) - 4;
    const x1 = FR(FOOT) + 4;
    const stone = function (xa, xb, la, lb, lean) {
      const q = [[xa + lean + G, la(xa + lean) + G], [xb + lean - G, la(xb + lean) + G], [xb - lean - G, lb(xb - lean) - G], [xa - lean + G, lb(xa - lean) - G]];
      B.fill(c, q, tones[Math.floor(r() * tones.length)]);
      // now and then a small wedge stone packed into the joint below
      if (r() < 0.3) {
        const wx = xb - 1;
        const wy = lb(wx);
        B.fill(c, [[wx - 2.2, wy - 0.2], [wx + 1.8, wy - 0.6], [wx - 0.2, wy - 3]], mixh(S.stoneMid, S.stoneJoint, 0.12));
      }
    };
    B.clip(c, FACE, function () {
      // the rows go in pairs; a tall stone may span a pair and break the
      // course line between, so no line runs the whole width
      for (let k = 0; k + 1 < lines.length; k += 2) {
        const la = lines[k];
        const lm = lines[k + 1];
        const lb = lines[k + 2] || ((x) => lm(x) + 6);
        let xa = x0 - r() * 6;
        let xb = x0 - r() * 6;
        let lastA = 0;
        let lastB = 0;
        while (Math.min(xa, xb) < x1) {
          if (Math.abs(xa - xb) < 3 && r() < 0.3) {
            const xs = Math.max(xa, xb);
            const w = 7 + r() * 6;
            stone(xs, xs + w, la, lb, (r() - 0.5) * 1.6);
            xa = xb = xs + w;
          } else if (xa <= xb) {
            const w = 6 + r() * 7;
            const ln = (r() - 0.5) * 2;
            stone(xa, xa + w, la, lm, ln - lastA * 0.3);
            lastA = ln;
            xa += w;
          } else {
            const w = 6 + r() * 7;
            const ln = (r() - 0.5) * 2;
            stone(xb, xb + w, lm, lb, ln - lastB * 0.3);
            lastB = ln;
            xb += w;
          }
        }
      }
    });
    // The west return: turned from the sun, a few long courses only.
    B.fill(c, RETURN, shd(mixh(S.stoneLit, S.stoneMid, 0.3), 0.3));
    B.clip(c, RETURN, function () {
      for (let k = 0; k < lines.length; k += 2) {
        const yy = lines[k](20);
        line(c, OL(yy) - 2, yy + 1, FL(yy) + 1, yy, 0.8, B.alpha(S.stoneJoint, 0.5));
      }
    });

    // The corner stones, long and short in turn, following each curved edge:
    // painted once as a pair of lengths and laid up both corners, the two out
    // of step. On the lit east end they are the brightest stone; on the left
    // arris they turn the corner, long on one face where short on the other.
    const CORNER = lit(S.stoneLit, 0.28);
    const quoins = [];
    B.clip(c, WALL, function () {
      let k = 0;
      for (let y = TOP + 1; y < FOOT + 1; k++) {
        const hq = 6;
        const ya = y;
        const yb = Math.min(FOOT + 2, y + hq);
        const longR = k % 2 === 0;
        const lr = longR ? 18 : 9;
        const ll = longR ? 9 : 18;
        const qr = [[FR(ya) + 3, ya + G], [FR(ya) - lr, ya + G], [FR(yb) - lr, yb - G], [FR(yb) + 3, yb - G]];
        const ql = [[FL(ya), ya + G], [FL(ya) + ll, ya + G], [FL(yb) + ll, yb - G], [FL(yb), yb - G]];
        const rl = longR ? 0.75 : 0.35; // how far across the return the stone runs
        const qrl = [[FL(ya), ya + G], [FL(ya) + (OL(ya) - FL(ya)) * rl, ya + G], [FL(yb) + (OL(yb) - FL(yb)) * rl, yb - G], [FL(yb), yb - G]];
        B.fill(c, qr, CORNER);
        B.fill(c, ql, lit(S.stoneLit, 0.1));
        B.fill(c, qrl, shd(S.stoneLit, 0.22));
        quoins.push(qr, ql, qrl);
        y = yb;
      }
    });

    // The curve drawn with light. The steep upper face stands in shade; the
    // flared foot faces more of the sky and is lit: one big wash, with a
    // second, firmer step where the face bends, so the concavity reads as
    // value, not only as outline.
    washAtop(c, function () {
      const g = c.createLinearGradient(0, TOP, 0, FOOT);
      g.addColorStop(0, B.alpha(SHADOW, 0.36));
      g.addColorStop(0.3, B.alpha(SHADOW, 0.16));
      g.addColorStop(0.55, B.alpha(SHADOW, 0.02));
      g.addColorStop(1, B.alpha(SUN, 0.34));
      c.fillStyle = g;
      c.fillRect(0, TOP, W, FOOT - TOP + 4);
      const band = curvePts((y) => OL(y) - 2, TOP + 22, FOOT + 2).reverse().concat(curvePts((y) => FR(y) + 2, TOP + 22, FOOT + 2));
      B.fill(c, band, B.alpha(SUN, 0.12));
      // cool across the left, warm toward the lit east end
      const h = c.createLinearGradient(FL(FOOT), 0, FR(FOOT), 0);
      h.addColorStop(0, B.alpha(SHADOW, 0.18));
      h.addColorStop(0.4, B.alpha(SHADOW, 0));
      h.addColorStop(0.75, B.alpha(SUN, 0));
      h.addColorStop(1, B.alpha(SUN, 0.2));
      c.fillStyle = h;
      c.fillRect(0, TOP, W, FOOT - TOP + 4);
    });
    // The corner stones' joints, drawn firm, so the long-and-short interlock
    // reads up each curved edge through the washes.
    B.clip(c, WALL, function () {
      for (const q of quoins) {
        line(c, q[0][0], q[0][1] - 0.3, q[1][0], q[1][1] - 0.3, 1.1, B.alpha(S.stoneJoint, 0.7));
        line(c, q[1][0], q[1][1] - 0.3, q[2][0], q[2][1] + 0.3, 1.1, B.alpha(S.stoneJoint, 0.7));
      }
      // the lit top ledge along the wall's top
      B.fill(c, rect(0, TOP, W, TOP + 2), B.alpha(lit(S.stoneLit, 0.4), 0.9));
    });
  }
  inkRound(wall, 0.8);
  ctx.drawImage(wall, 0, 0);

  // ---------------------------------------------------------------------------
  // 5. The plastered wall along the stone wall's top, under the small keeps,
  // running into the foot of the main keep: plaster with a grey tile coping,
  // loopholes stamped at a fixed interval, and the main keep's shadow across
  // its right end.

  const dobei = B.layer();
  {
    const c = dobei.getContext('2d');
    const xa = OL(TOP) + 1;
    const xb = MX - 58;
    B.fill(c, rect(xa, TOP - 7, xb, TOP + 0.5), lit(S.plaster, 0.2));
    B.fill(c, rect(xa, TOP - 7, xa + 8, TOP + 0.5), shd(S.plaster, 0.3));
    B.fill(c, rect(xa - 2, TOP - 10, xb, TOP - 6.5), common.tileBody);
    line(c, xa - 1, TOP - 9.4, xb - 1, TOP - 9.4, 0.9, B.alpha(S.joint, 0.5));
    wash(c, rect(xa, TOP - 6.5, xb, TOP - 4.5), SHADOW, 0.3);
    for (let x = Math.round(xa + 14); x < xb - 6; x += 14) B.fill(c, rect(x, TOP - 3.5, x + 2, TOP - 1.5), mixh(INK, S.plaster, 0.4));
  }
  throwShadow(dobei, main, -18, 10, 0.34);
  inkRound(dobei, 0.75);
  ctx.drawImage(dobei, 0, 0);

  // ---------------------------------------------------------------------------
  // 6. The wall's shadow on the ground, down and to the left: a band along
  // its foot and a wedge out from its west end across the gravel, the lawn
  // and the pines in front.

  const groundShadow = [[FR(FOOT) - 10, FOOT], [FR(FOOT) - 34, FOOT + 9], [OL(FOOT) - 40, FOOT + 30], [OL(FOOT) - 60, H + 2], [-10, H + 2], [-10, FOOT - 1], [OL(FOOT) + 2, FOOT - 1]];
  wash(ctx, groundShadow, SHADOW, 0.3);

  // The black pines: three big calm masses, each two tiers of flat pads. Each
  // tier is one shape: a flat lit top catching the sun along its upper right
  // edge, the pine's dark body, and a darker base.
  {
    const trees = B.layer();
    const c = trees.getContext('2d');
    const LIT = lit(mixh(S.pine, B.C.foliage, 0.5), 0.14);
    const BODY = S.pine;
    const DARK = shd(mixh(S.pine, B.C.foliageDark, 0.5), 0.1);
    const BARK = '#3a3129';
    const tier = function (blobs) {
      const t = B.layer();
      const tc = t.getContext('2d');
      const shape = function (dx, dy, color) {
        tc.fillStyle = color;
        let xa = Infinity;
        let xb = -Infinity;
        let ya = Infinity;
        for (const [x, y, rx, ry] of blobs) {
          tc.beginPath();
          tc.ellipse(x + dx, y + dy, rx, ry, 0, 0, Math.PI * 2);
          tc.fill();
          xa = Math.min(xa, x - rx * 0.8);
          xb = Math.max(xb, x + rx * 0.8);
          ya = Math.min(ya, y);
        }
        tc.fillRect(xa + dx, ya + dy, xb - xa, H - ya + 4);
      };
      shape(0, 0, LIT);
      washAtop(tc, function () {
        shape(-3, 3, BODY);
        const yb = Math.max(...blobs.map((p) => p[1]));
        const g = tc.createLinearGradient(0, yb, 0, yb + 14);
        g.addColorStop(0, B.alpha(DARK, 0));
        g.addColorStop(1, B.alpha(DARK, 1));
        tc.fillStyle = g;
        tc.fillRect(0, yb, W, H);
      });
      c.drawImage(t, 0, 0);
    };
    const mass = function (upper, lower, trunk) {
      tier(upper);
      B.fill(c, [[trunk[0] - 2, H], [trunk[0] - 1, trunk[1]], [trunk[0] + 1.5, trunk[1]], [trunk[0] + 3, H]], BARK);
      tier(lower);
    };
    // left, clear of the wall's curved west corner; centre; right, clear of
    // the lit east end
    mass([[30, 257, 30, 8], [62, 261, 20, 6]], [[16, 270, 36, 9], [70, 273, 28, 7]], [44, 262]);
    mass([[162, 255, 32, 8], [197, 260, 20, 6]], [[138, 270, 32, 9], [194, 271, 36, 9]], [168, 262]);
    mass([[326, 257, 30, 8], [359, 261, 20, 6]], [[302, 271, 32, 9], [356, 269, 32, 9]], [332, 264]);
    // the bases of the masses in their own shade
    washAtop(c, function () {
      const g = c.createLinearGradient(0, 250, 0, H);
      g.addColorStop(0, B.alpha(SHADOW, 0));
      g.addColorStop(1, B.alpha(SHADOW, 0.2));
      c.fillStyle = g;
      c.fillRect(0, 240, W, H - 240);
      // the wall's shadow crossing the left mass
      B.fill(c, groundShadow, B.alpha(SHADOW, 0.3));
    });
    inkRound(trees, 0.55);
    // their own shadow on the lawn, down and to the left
    const sc = silhouette(trees, SHADOW);
    ctx.save();
    ctx.globalAlpha = 0.26;
    ctx.drawImage(sc, -8, 4);
    ctx.restore();
    ctx.drawImage(trees, 0, 0);
  }
};
