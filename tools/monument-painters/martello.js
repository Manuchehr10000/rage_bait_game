/**
 * Chapter 12 vignette: Martello Towers on the Kent and Sussex shingle.
 *
 * Asset map-monument-ch12-*, 92 x 70 world px, painted 368 x 280. The view is
 * Turner's (Liber Studiorum pl. 34, 1811) and a railway poster's: a squat
 * rendered drum on the shingle seen from the landward side, its one
 * first-floor door and ladder toward us, the Channel low behind it, and the
 * next tower of the chain down the beach to the right.
 *
 * Built the pilot's way:
 *   1. the shared brochure sky (B.sky) and one cloud, on the right;
 *   2. the Channel, and the shingle in a few broad bands;
 *   3. the towers back to front. One function paints a tower at any scale,
 *      so the far tower is the near one stamped a sixth the size (pillar 4),
 *      gun and door included; only its ladder drops out, under a pixel wide.
 *      Each throws one clean shadow down and to the left;
 *   4. a small cluster of flints in the foreground.
 * The drum is modelled as a cylinder: a smooth ramp across it from cool shade
 * on the left to full sun on the right, with one crisp core shadow.
 * The eye is a standing man's (1.7 m): the horizon crosses the near tower at
 * that height, 40-60 m off, so the crest is seen from about 9 degrees below
 * and its near rim bows up and hides the gun's breech and carriage.
 */
PAINTERS['martello'] = function (ctx, W, H, B) {
  // The research palette, a little sunnier than life.
  const R = {
    render: '#d6ccb2', // render in sun (#d3cab4, pushed toward the sun)
    weathered: '#a9a18f', // salt-stained render
    shade: '#8a8474', // render turned away
    dress: '#e2dccb', // door dressings, the parapet's coping
    iron: '#2e2f31', // the 24-pounder
    door: '#4a3b2c', // the doorway
    ladder: '#8b7457', // timber ladder
    ladderShade: '#6b5a44', // its shaded side
    shingle: '#b3a58b',
    shingleShade: '#7f7464',
    shingleLight: '#d8cdb5',
    channel: '#5b8f98',
  };
  const INK = B.C.ink;
  const SHADOW = B.C.shadow;
  const SUN = B.C.sun;

  // ---------------------------------------------------------------------------
  // Helpers (as the pilot's). Everything returns hex so it can be chained.

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
    c.lineCap = 'butt';
    c.strokeStyle = style;
    c.stroke();
  };
  const ellipse = function (c, x, y, rx, ry, style) {
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    c.fillStyle = style;
    c.fill();
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
  /** A strip between two polylines y = a(x) and y = b(x), sampled across the plate. */
  const strip = function (c, a, b, color) {
    const pts = [];
    for (let x = 0; x <= W; x += 8) pts.push([x, a(x)]);
    for (let x = W; x >= 0; x -= 8) pts.push([x, b(x)]);
    B.fill(c, pts, color);
  };

  // ---------------------------------------------------------------------------
  // Layout. The tower in its own units, origin at the foot's centre: 140
  // units is the c.10 m to the crest, so 14 units a metre. Foot 190 wide
  // (13.5 m), wall top 157 (0.82 of the foot, 'slightly tapering'); the walls
  // batter in straight lines to a coping 7 units deep that stands 2.4 units
  // proud of the wall.

  const NEAR = { x: 168, y: 237, s: 1.17 }; // foot 222 px wide: 0.6 of the plate
  // A standing eye: the horizon crosses the near tower 1.7 m (24 units) up.
  const HZ = Math.round(NEAR.y - 24 * NEAR.s); // 209
  // The shore curves away to the right, so the water's edge climbs toward
  // the horizon there; the far tower stands on the shingle just above it.
  const shore = (x) => 226 - (13 * x) / W;
  const FAR = { x: 318, y: shore(318) + 1.8, s: NEAR.s / 6 }; // the next tower: a sixth of the near one

  const HF = 95; // half the foot
  const HT = 78; // half the wall at the crest line
  const HGT = 140; // foot to crest at the sides
  const COP = 7; // the coping's depth
  const LIP = 2.4; // how far it stands proud of the wall
  const SAGT = 9; // the crest's bow: seen from 9 degrees below, the near rim rides high
  const SAGF = 3; // the foot's bow: the eye is only a little above the foot
  const hw = (y) => HT + ((HF - HT) * (y + HGT)) / HGT; // half-width of the wall at local y
  const YC = -HGT + COP; // the coping's underside, at the sides
  const CW = hw(YC) + LIP; // the coping's half-width
  const bow = (x, half, sag) => sag * Math.max(0, 1 - (x / half) * (x / half));
  const crestY = (x) => -HGT - bow(x, CW, SAGT);
  const copeUnder = (x) => YC - bow(x, CW, SAGT);

  const N = 24;
  const WALL = [];
  for (let i = 0; i <= N; i++) {
    const u = -1 + (2 * i) / N;
    WALL.push([HF * u, bow(HF * u, HF, SAGF)]);
  }
  for (let i = 0; i <= N; i++) {
    const u = 1 - (2 * i) / N;
    const x = hw(YC) * u;
    WALL.push([x, copeUnder(x) - 2]); // runs up under the coping, so no seam opens
  }
  const COPING = [];
  for (let i = 0; i <= N; i++) {
    const x = CW * (-1 + (2 * i) / N);
    COPING.push([x, copeUnder(x)]);
  }
  for (let i = 0; i <= N; i++) {
    const x = CW * (1 - (2 * i) / N);
    COPING.push([x, crestY(x)]);
  }
  // The whole silhouette, for the ink line.
  const OUTLINE = [];
  for (let i = 0; i <= N; i++) {
    const u = -1 + (2 * i) / N;
    OUTLINE.push([HF * u, bow(HF * u, HF, SAGF)]);
  }
  OUTLINE.push([hw(YC), YC], [CW, YC]);
  for (let i = 0; i <= N; i++) {
    const x = CW * (1 - (2 * i) / N);
    OUTLINE.push([x, crestY(x)]);
  }
  OUTLINE.push([-CW, YC], [-hw(YC), YC]);

  // The drum turned into light: a smooth ramp across the cylinder, keyed to
  // the fraction t of the way across (0 the left rim, 1 the right). The sun is
  // to the right and a little beyond the tower: the right flank takes the full
  // sun, the landward face toward us is in half-light, and the left flank
  // turns away into cool shade, with one crisp core shadow at the terminator
  // and a little light bounced back into the left rim from the shingle.
  const RAMP = (m) => [
    [0, shd(m.shade, 0.2)],
    [0.2, shd(m.shade, 0.36)],
    [0.39, shd(m.shade, 0.3)],
    [0.405, mixh(m.shade, m.lit, 0.58)],
    [0.6, mixh(m.shade, m.lit, 0.84)],
    [0.8, lit(m.lit, 0.3)],
    [0.93, lit(m.lit, 0.56)],
    [1, lit(m.lit, 0.42)],
  ];
  /**
   * Paint the ramp between local y0 and y1, one device-pixel row at a time
   * (rows on whole pixels, so no seam or overlap ever shows), each row's ramp
   * as wide as half(y) at that height.
   */
  const paintRamp = function (c, mat, y0, y1, half) {
    const stops = RAMP(mat);
    const m = c.getTransform();
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    const p0 = Math.floor(m.f + y0 * m.d);
    const p1 = Math.ceil(m.f + y1 * m.d);
    for (let py = p0; py < p1; py++) {
      const h = half((py + 0.5 - m.f) / m.d) * m.a;
      const g = c.createLinearGradient(m.e - h, 0, m.e + h, 0);
      for (const [t, col] of stops) g.addColorStop(t, col);
      c.fillStyle = g;
      c.fillRect(Math.floor(m.e - h * 1.1), py, Math.ceil(h * 2.2) + 1, 1);
    }
    c.restore();
  };
  const RENDER = { shade: R.shade, lit: R.render };
  const DRESS = { shade: mixh(R.shade, R.dress, 0.5), lit: R.dress };

  // The gun: a Blomefield 24-pounder, 9 1/2 ft (42 units) against a crest
  // 162 across, laid level along the beach to the left, broadside to us, on
  // its traversing carriage on the roof. Its axis sits a little over the
  // crest, so it fires over the parapet; the high middle of the near rim hides
  // the carriage and the lower half of the breech, and only the chase and the
  // muzzle, run out past the left rim, show whole against the sky.
  const GUN = { breech: -46, muzzle: -88, rb: 5.3, rm: 3.1, axis: -145.5 };

  // The one door, on the first floor, a little right of the axis because we
  // stand a little left of it. Sill about 3 m up (43 units), well over a
  // man's head (1.8 m is 25 units), blank wall beneath. Segmental head, a
  // proud stone architrave.
  const DOOR = { x: 12, sill: -43, w: 15, h: 28, frame: 3.6, rise: 2.4 };

  /** The drum's shadow on the shingle, thrown down and to the left: one clean shape. */
  const SHADOW_PTS = [
    [34, SAGF * 0.9], [14, 8], [-20, 15], [-60, 20], [-96, 22], [-120, 20], [-133, 13], [-136, 5],
    [-128, 0], [-110, -2.5], [-90, -2], [-60, 0],
  ];

  /**
   * The gun, painted before the drum so the crest hides what lies behind it.
   * On the far tower the same drawing is thickened to at least 3.5 px and run
   * further out past the rim, so it reads as a gun and not a notch.
   */
  const paintGun = function (c, s, near) {
    const G = GUN;
    const k = near ? 1 : Math.max(1, 1.75 / (G.rb * s));
    const rb = G.rb * k;
    const rm = G.rm * k;
    const muzzle = near ? G.muzzle : G.muzzle - 14;
    const cy = near ? G.axis : crestY(G.breech) - rb * 0.5;
    const L = G.breech - muzzle;
    // The barrel's profile: cascabel, base ring, reinforce, chase, muzzle swell.
    const prof = [
      [-0.16, 0.3], [-0.15, 0.5], [-0.09, 0.5], [-0.07, 0.3], [-0.02, 0.3], [0, 0.9], [0.02, 1.04], [0.06, 1.04], [0.08, 0.97],
      [0.36, 0.93], [0.38, 0.84], [0.53, 0.8], [0.55, 0.72], [0.88, rm / rb], [0.9, rm / rb + 0.14], [1, rm / rb + 0.2],
    ];
    const upper = prof.map((p) => [G.breech - p[0] * L, cy - p[1] * rb]);
    const lower = prof.map((p) => [G.breech - p[0] * L, cy + p[1] * rb]).reverse();
    B.fill(c, upper.concat(lower), mixh(R.iron, INK, 0.25));
    // Its upper side in the sun: one warm flat band along the top.
    // Kept thin: the crest hides the lower half, and what shows must stay iron.
    const hi = upper.concat(prof.map((p) => [G.breech - p[0] * L, cy - p[1] * rb * 0.62]).reverse());
    B.fill(c, hi, lit(R.iron, near ? 0.22 : 0.12));
    if (near) {
      const a = prof.slice(6, 13);
      B.fill(c, a.map((p) => [G.breech - p[0] * L, cy - p[1] * rb * 0.96]).concat(a.map((p) => [G.breech - p[0] * L, cy - p[1] * rb * 0.8]).reverse()), lit(R.iron, 0.55));
    }
  };

  /** The drum, the coping, and the door. Local units. */
  const paintTower = function (c, s, near) {
    // The ink line first, a stroke round the whole silhouette: its outer half
    // is left standing when the drum is filled over it.
    c.save();
    B.path(c, OUTLINE);
    c.lineJoin = 'round';
    c.lineWidth = (near ? 2.4 : 1.8) / s;
    c.strokeStyle = B.alpha(INK, near ? 0.92 : 0.62);
    c.stroke();
    c.restore();

    B.clip(c, WALL, function () {
      paintRamp(c, RENDER, -HGT - SAGT - 2, SAGF + 2, hw);
      c.globalCompositeOperation = 'multiply';
      // The coping's shadow on the wall under it, following the bow.
      const under = [];
      for (let i = 0; i <= N; i++) {
        const x = CW * (-1 + (2 * i) / N);
        under.push([x, copeUnder(x) - 1]);
      }
      for (let i = 0; i <= N; i++) {
        const x = CW * (1 - (2 * i) / N);
        under.push([x, copeUnder(x) + 3.4]);
      }
      B.fill(c, under, B.alpha(SHADOW, 0.3));
      if (near) {
        // Salt weathering: a few long faint runs from the coping, and one
        // soft stain toward the foot. Multiplied, so they darken every tone alike.
        const stain = B.alpha(R.weathered, 0.14);
        for (const [x, len, w] of [[38, 30, 5], [60, 18, 4]]) {
          const y0 = copeUnder(x) + 2;
          B.fill(c, [[x - w / 2, y0], [x + w / 2, y0], [x + w * 0.2, y0 + len], [x - w * 0.2, y0 + len]], stain);
        }
      }
      // One clean contact band where the drum meets the shingle.
      const foot = [];
      for (let i = 0; i <= N; i++) {
        const x = HF * (-1 + (2 * i) / N);
        foot.push([x, bow(x, HF, SAGF) - 7]);
      }
      foot.push([HF, 6], [-HF, 6]);
      B.fill(c, foot, B.alpha(R.weathered, 0.3));
      c.globalCompositeOperation = 'source-over';
    });

    // The coping: pale dressing in the same light, a lit line along its top.
    B.clip(c, COPING, function () {
      paintRamp(c, DRESS, -HGT - SAGT - 2, YC + 1, () => CW);
      const top = [];
      for (let i = 0; i <= N; i++) {
        const x = CW * (-1 + (2 * i) / N);
        top.push([x, crestY(x)]);
      }
      for (let i = 0; i <= N; i++) {
        const x = CW * (1 - (2 * i) / N);
        top.push([x, crestY(x) + 1.6]);
      }
      c.globalCompositeOperation = 'screen';
      B.fill(c, top, B.alpha(SUN, 0.35));
      c.globalCompositeOperation = 'source-over';
    });

    // The door: the proud architrave, its shadow on the wall, the opening.
    {
      const d = DOOR;
      const x0 = d.x - d.w / 2;
      const x1 = d.x + d.w / 2;
      const spring = d.sill - d.h + d.rise;
      const f = d.frame;
      const head = function (xa, xb, ys, rise) {
        const pts = [];
        for (let i = 0; i <= 10; i++) {
          const t = i / 10;
          const u = 2 * t - 1;
          pts.push([xa + (xb - xa) * t, ys - rise * (1 - u * u)]);
        }
        return pts;
      };
      const surround = [[x0 - f, d.sill + 1.4]].concat(head(x0 - f, x1 + f, spring - f, d.rise + 0.6), [[x1 + f, d.sill + 1.4]]);
      B.fill(c, surround.map((p) => [p[0] - 2.2, p[1] + 2.2]), B.alpha(SHADOW, 0.34));
      B.fill(c, surround, mixh(R.dress, R.shade, 0.2));
      B.fill(c, [[x1 + f - 1.4, d.sill + 1.4], [x1 + f - 1.4, spring - f], [x1 + f, spring - f], [x1 + f, d.sill + 1.4]], lit(R.dress, 0.5));
      const open = [[x0, d.sill]].concat(head(x0, x1, spring, d.rise), [[x1, d.sill]]);
      B.fill(c, open, R.door);
      // The reveal: the wall is thick, so the head and the left jamb shade the door.
      B.clip(c, open, function () {
        B.fill(c, [[x0 - 1, d.sill + 1], [x0 - 1, spring - d.rise - 1], [x1 + 1, spring - d.rise - 1], [x1 + 1, spring + 4], [x0 + 4, spring + 4], [x0 + 4, d.sill + 1]], mixh(R.door, INK, 0.5));
      });
      // The sill, a projecting stone, and its shadow.
      B.fill(c, [[x0 - f - 1, d.sill], [x1 + f + 1, d.sill], [x1 + f + 1, d.sill + 2.6], [x0 - f - 1, d.sill + 2.6]], lit(R.dress, 0.2));
      wash(c, [[x0 - f - 1, d.sill + 2.6], [x1 + f + 1, d.sill + 2.6], [x1 + f - 1, d.sill + 5], [x0 - f - 3, d.sill + 5]], SHADOW, 0.3);
    }
  };

  /**
   * The ladder, near tower only: one timber ladder from the shingle to the
   * sill, its stiles run up past the sill for a handhold.
   */
  const LAD = { top: [[6.5, -51], [17.5, -51]], foot: [[10.5, 9], [22, 9]], rungs: 7 };
  const paintLadder = function (c) {
    const [a0, a1] = LAD.top;
    const [b0, b1] = LAD.foot;
    const wood = mixh(R.ladder, R.ladderShade, 0.35); // in the landward half-light
    // Its shadow on the wall, thrown to the left, widening toward the foot
    // where the ladder stands off the wall.
    wash(c, [[a0[0] - 1, a0[1] + 8], [a1[0] - 3, a1[1] + 8], [b1[0] - 16, 0], [b0[0] - 22, 0]], SHADOW, 0.2);
    // The rungs sit from the sill down.
    const t0 = (-41 - a0[1]) / (b0[1] - a0[1]);
    for (let i = 0; i < LAD.rungs; i++) {
      const t = t0 + ((1 - t0) * (i + 0.5)) / LAD.rungs;
      const l = [a0[0] + (b0[0] - a0[0]) * t, a0[1] + (b0[1] - a0[1]) * t];
      const r = [a1[0] + (b1[0] - a1[0]) * t, a1[1] + (b1[1] - a1[1]) * t];
      line(c, l[0], l[1], r[0], r[1], 2.2, R.ladderShade);
    }
    for (const [p, q] of [[a0, b0], [a1, b1]]) {
      line(c, p[0], p[1], q[0], q[1], 3, wood);
      line(c, p[0] + 0.9, p[1], q[0] + 0.9, q[1], 1.1, lit(R.ladder, 0.25));
    }
  };

  // ---------------------------------------------------------------------------
  // 1. The sky: the shared brochure gradient, laid over a deeper horizon than
  // the plate's own so that its low end stays a clear step bluer and darker
  // than the render in sun. One cloud, on the right, to balance the gun.

  B.sky(ctx, W, 330);
  const cloud = function (x, y, size, seed) {
    const r = B.rng(seed);
    const lobes = [];
    for (let i = 0; i < 5; i++) {
      const dx = (i / 4 - 0.5) * size * 1.7 + (r() - 0.5) * size * 0.2;
      const rr = size * (0.34 + 0.22 * Math.sin((Math.PI * i) / 4) + r() * 0.08);
      lobes.push([x + dx, y - rr * 0.35, rr]);
    }
    const layer = B.layer(W, H);
    const c = layer.getContext('2d');
    const draw = function (ox, oy, color) {
      c.fillStyle = color;
      for (const [cx, cy, rr] of lobes) {
        c.beginPath();
        c.arc(cx + ox, cy + oy, rr, 0, Math.PI * 2);
        c.fill();
      }
    };
    // The cool body, cut flat along the base.
    draw(0, 0, mixh(B.C.skyLow, B.C.skyTop, 0.22));
    c.globalCompositeOperation = 'destination-out';
    c.fillRect(0, y + size * 0.12, W, H);
    // The sunlit top, the same lobes nudged up and to the right.
    c.globalCompositeOperation = 'source-atop';
    draw(size * 0.12, -size * 0.2, lit('#ffffff', 0.1));
    ctx.drawImage(layer, 0, 0);
  };
  cloud(304, 60, 30, 11);

  // ---------------------------------------------------------------------------
  // 2. The Channel: a low, level strip, the set's water turned toward the
  // inshore green-grey, in two flat tones and a line of surf.

  const SEA = mixh(B.C.water, R.channel, 0.4);
  strip(ctx, () => HZ, () => H + 1, shd(SEA, 0.14));
  strip(ctx, () => HZ + 3, () => H + 1, SEA);
  strip(ctx, (x) => shore(x) - 1.6, () => H + 1, lit(SEA, 0.55));

  // ---------------------------------------------------------------------------
  // 3. The shingle: the wet strand, the berm's lit seaward face, then the
  // upper beach in a few broad bands that darken toward us, so the
  // foreground is never the brightest thing in the plate.

  const SH = lit(R.shingle, 0.2); // shingle in sun, a little sunnier than life
  const berm = (x) => shore(x) + 6;
  const ridgeB = (x) => 247 - (6 * x) / W + 2.5 * Math.sin(x / 60);
  const ridgeC = (x) => 262 - (4 * x) / W + 2 * Math.sin(x / 45 + 1);
  // Each strip runs to the bottom of the plate and the next covers it, so no
  // two anti-aliased edges ever meet over nothing.
  const BOT = () => H + 1;
  strip(ctx, (x) => shore(x) + 0.4, BOT, mixh(R.shingle, R.shingleShade, 0.45));
  strip(ctx, (x) => shore(x) + 2.4, BOT, lit(R.shingle, 0.4));
  strip(ctx, berm, BOT, SH);
  strip(ctx, ridgeB, BOT, mixh(SH, R.shingleShade, 0.2));
  strip(ctx, (x) => ridgeC(x) - 1.5, (x) => ridgeC(x) + 1.5, lit(R.shingle, 0.12));
  strip(ctx, (x) => ridgeC(x) + 1.5, BOT, mixh(SH, R.shingleShade, 0.38));

  // The flint, as a sparse scatter of small low-contrast pebbles: 1-2 px near
  // the tower, a little larger toward us; never a field of cobbles.
  {
    const r = B.rng(1212);
    for (let i = 0; i < 46; i++) {
      const y = 222 + Math.pow(r(), 0.8) * (H - 226);
      const x = 6 + r() * (W - 12);
      const depth = (y - HZ) / (H - HZ);
      const rx = 0.9 + depth * 1.6 + r() * 0.5;
      ellipse(ctx, x, y, rx, rx * 0.55, B.alpha(mixh(R.shingleShade, SHADOW, 0.15), 0.4));
    }
  }

  // ---------------------------------------------------------------------------
  // 4. The towers. One function, stamped twice, each shadow on the shingle
  // first (one clean shape, down and to the left, short: the sun is high).

  const paintOne = function (T, near) {
    const x = T.x;
    const y = T.y;
    const s = T.s;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    B.fill(ctx, SHADOW_PTS, B.alpha(SHADOW, 0.38));
    ctx.restore();
    // The gun on its own layer, inked, so the far one keeps its dark iron.
    const gun = B.layer(W, H);
    const g = gun.getContext('2d');
    g.save();
    g.translate(x, y);
    g.scale(s, s);
    paintGun(g, s, near);
    g.restore();
    inkRound(gun, near ? 0.9 : 0.7);
    const layer = B.layer(W, H);
    const c = layer.getContext('2d');
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    paintTower(c, s, near);
    if (near) paintLadder(c);
    c.restore();
    // Aerial perspective on the far tower: a light wash of the low sky over
    // the drum, not the gun.
    if (!near) {
      c.save();
      c.globalCompositeOperation = 'source-atop';
      c.fillStyle = B.alpha(B.C.skyLow, 0.18);
      c.fillRect(0, 0, W, H);
      c.restore();
    }
    ctx.drawImage(gun, 0, 0);
    ctx.drawImage(layer, 0, 0);
  };

  paintOne(FAR, false);
  paintOne(NEAR, true);

  // The ladder's foot throws a short shadow on the shingle.
  {
    const lx = NEAR.x + 16 * NEAR.s;
    const ly = NEAR.y + 9 * NEAR.s;
    wash(ctx, [[lx - 12, ly - 1], [lx + 8, ly - 1], [lx + 4, ly + 2], [lx - 16, ly + 2]], SHADOW, 0.3);
  }

  // ---------------------------------------------------------------------------
  // 5. The foreground: one small cluster of flints on the right, each with
  // its shadow down and to the left.

  {
    const flint = function (x, y, rx, col) {
      const ry = rx * 0.55;
      ellipse(ctx, x - rx * 0.45, y + ry * 0.5, rx * 1.05, ry * 0.85, B.alpha(SHADOW, 0.34));
      ellipse(ctx, x, y, rx, ry, col);
      ellipse(ctx, x + rx * 0.22, y - ry * 0.3, rx * 0.58, ry * 0.5, mixh(col, SUN, 0.38));
    };
    const blue = mixh(R.shingleShade, SHADOW, 0.2);
    const brown = mixh(R.shingleShade, R.ladder, 0.35);
    flint(318, 263, 6.5, blue);
    flint(333, 257, 4, brown);
    flint(303, 267, 3.5, brown);
    flint(343, 266, 3, blue);
  }
};
