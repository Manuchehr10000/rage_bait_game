/**
 * Chapter 9 vignette: Great Zimbabwe, the conical tower in the Great Enclosure.
 *
 * Asset map-monument-ch09-africa, 92 x 70 world px, painted 368 x 280. The view
 * is the one most photographs take (specs/conical-tower.json): from inside the
 * enclosure, north-west of the tower, at standing eye height, looking
 * south-east at the tower in front of the inside face of the outer wall, a
 * narrow strip of bare court between the towers' feet and the wall's foot.
 * The wall curves right across the plate, nearer (taller, lower foot) at the
 * frame edges, its level top a little below the tower's flat top. The small
 * tower stands close by the great tower's right flank as a broken stump with
 * its fallen blocks at its foot. A strip of sky, and two rounded miombo crowns
 * beyond the wall, one in the msasa's late-dry-season red flush. No Hill
 * Complex, no birds, no people.
 *
 * Provisional, for the asset note: the small tower's size, its side (drawn on
 * the right) and its gap from the great tower are not checked against a
 * measured plan (Caton-Thompson 1931, Garlake 1973, the NMMZ plan). It is
 * drawn with the great tower's own taper at 0.42 of its size, broken off in a
 * steep ragged slope from about 2.9 m down to about 1.1 m.
 *
 * Perspective: one eye level, EYE, about 2 m above the court; the towers at
 * D metres. Every course of a tower is the front half of a level circle, so
 * it bows up in the middle above the eye (strongly near the top) and down a
 * little at the foot; the flat top is the same kind of arc, broken where top
 * blocks are gone. The wall is k(x) times the towers' scale, k larger toward
 * the frame edges where the curving wall comes nearer; its courses bow down
 * in the middle because the viewer stands inside the ring. The wall leans
 * back as it rises: its courses close up strongly toward the top, the face
 * turns up into the light, and the capstone course is set back and bright.
 *
 * Light: the set's upper-right sun, loosely behind-right of the viewer. The
 * towers' fronts are lit; their shadows run back and left across the court
 * to the wall's foot and climb it, tapering to a rounded end.
 *
 * One masonry for both towers: bold level courses, fewer than the real ones,
 * dark dry joints, a faint sunlit arris under each on the lit flank, and
 * short irregular end joints about a course apart, crowding toward the edges.
 * The wall, a step darker and cooler, keeps only broad course bands, so the
 * detail and the light stay on the tower.
 */
PAINTERS['conical-tower'] = function (ctx, W, H, B) {
  const S = {
    lit: '#c4b9a6',
    mid: '#a39889',
    joint: '#5b534a',
    streak: '#4d4944',
    lichen: '#a8ab94',
    rust: '#c98a3e',
    sand: '#b8a07a',
    grass: '#c8ab66',
    msasa: '#8e3a2a',
  };
  const INK = B.C.ink;
  const SHADOW = B.C.shadow;
  const SUN = B.C.sun;

  const mixh = function (a, b, t) {
    const x = B.hex(a);
    const y = B.hex(b);
    let s = '#';
    for (let i = 0; i < 3; i++) s += Math.round(x[i] + (y[i] - x[i]) * t).toString(16).padStart(2, '0');
    return s;
  };
  const lit = (h, t) => mixh(h, SUN, t);
  const shd = (h, t) => mixh(h, SHADOW, t);
  // A colour ramp through [t, hex] stops, painted as 1-px strips of solid
  // colour: a canvas gradient is dithered, and the indexed palette turns that
  // dither into a checker.
  const ramp = function (stops, t) {
    if (t <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i++) {
      if (t <= stops[i][0]) return mixh(stops[i - 1][1], stops[i][1], (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]));
    }
    return stops[stops.length - 1][1];
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

  // ---------------------------------------------------------------------------
  // Layout and perspective. The great tower: about 9.5 m tall, 5.5 m across
  // the base, about 2.1 m across the top.
  const TX = 150; // tower axis
  const TB = 254; // tower foot, at its silhouette edges
  const TT = 46; // tower top, at its silhouette edges
  const TH_M = 9.5;
  const PXM = (TB - TT) / TH_M; // px per metre at the towers
  const EYE_M = 2.0;
  const EYE = TB - EYE_M * PXM;
  const D = 15; // metres from the eye to the towers' axis
  const rMetres = (hm) => {
    const t = Math.max(0, Math.min(1, hm / TH_M));
    return 2.75 + (1.05 - 2.75) * t + 0.2 * Math.sin(Math.PI * t); // the sides swell a little
  };
  // A point on a level circle of radius rm (metres) at height hm, angle th
  // round from the front (0) to the silhouette edges (+-pi/2).
  const project = function (cx, base, hm, rm, th) {
    const ySide = base - hm * PXM;
    return [cx + rm * PXM * Math.sin(th), EYE - (EYE - ySide) * (D / (D - rm * Math.cos(th)))];
  };
  // The wall: k(x) is the towers' distance over the wall's.
  const WALL_M = 10.6;
  const k = (x) => 0.8 + 0.09 * Math.pow((x - 180) / 190, 2);
  const WB = (x) => EYE + EYE_M * PXM * k(x); // wall foot
  const WT = (x) => EYE - (WALL_M - EYE_M) * PXM * k(x); // wall top
  const COURSE_M = 12 / PXM; // one bold course, about 0.55 m

  // The granite, warm pale buff, a little sunnier than life. The tower's lit
  // front is the lightest stone in the plate; the wall sits a clear step
  // under it and cooler.
  const G = {
    towerHi: lit(S.lit, 0.46),
    towerLit: lit(S.lit, 0.3),
    towerTerm: mixh(lit(S.mid, 0.12), S.rust, 0.06),
    towerShade: shd(S.mid, 0.28),
    towerDeep: shd(S.mid, 0.38),
    wallLit: mixh(lit(S.mid, 0.14), S.rust, 0.16),
    wallMid: mixh(shd(S.mid, 0.08), S.rust, 0.12),
    wallShade: mixh(shd(S.mid, 0.24), S.rust, 0.05),
    wallDeep: shd(S.mid, 0.32),
  };

  // ---------------------------------------------------------------------------
  // 1. Sky.
  B.sky(ctx, W, 110);

  // 2. Two miombo crowns beyond the wall: broad, rounded, dense domes, their
  // lower edge and trunks out of sight behind the crest. One dark mass, one
  // mid mass up and to the right, one lit shape at the upper right.
  const crown = function (cx, top, w, h, seed, flush) {
    const L = B.layer(W, H);
    const c = L.getContext('2d');
    const r = B.rng(seed);
    const lobes = [];
    const n = 6;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const dome = Math.sin(t * Math.PI);
      lobes.push([cx + (t - 0.5) * w * 0.66, top + h * 0.62 - dome * h * 0.3 + (r() - 0.5) * 2, w * (0.2 + r() * 0.03), h * (0.36 + dome * 0.12)]);
    }
    for (const [x, y, rx, ry] of lobes) B.dab(c, x, y, rx, ry, B.C.foliageDark, 0);
    B.dab(c, cx, top + h * 0.75, w * 0.5, h * 0.3, B.C.foliageDark, 0);
    c.save();
    c.globalCompositeOperation = 'source-atop';
    const mid = flush ? mixh(B.C.foliage, S.msasa, 0.3) : B.C.foliage;
    for (const [x, y, rx, ry] of lobes) B.dab(c, x + rx * 0.25, y - ry * 0.28, rx * 0.86, ry * 0.7, mid, 0);
    B.dab(c, cx + w * 0.16, top + h * 0.22, w * 0.27, h * 0.24, lit(mid, 0.28), 0);
    c.restore();
    ctx.drawImage(L, 0, 0);
  };
  crown(54, 20, 104, 42, 11, false);
  crown(316, 22, 92, 40, 31, true);

  // ---------------------------------------------------------------------------
  // 3. The outer wall's inside face: lit on the left where the curving face
  // turns toward the sun, cool in the shade on the right, lighter toward the
  // top where the battered face tips up into the light. Its courses are broad
  // bands closing up toward the top, with a fine joint between them, and no
  // end joints: the detail stays on the tower.
  const wall = [];
  for (let x = 0; x <= W; x += 4) wall.push([x, WT(x)]);
  for (let x = W; x >= 0; x -= 4) wall.push([x, WB(x) + 2]);
  const wallStops = [[0, G.wallLit], [0.45, G.wallMid], [0.8, G.wallShade], [1, G.wallDeep]];
  const BAND = 1.7; // wall bands, in bold courses
  const bandH = [];
  {
    let h = 0.25;
    let step = BAND * COURSE_M;
    while (h < WALL_M - 0.8 && step > 0.2) {
      bandH.push(h);
      h += step;
      step *= 0.93; // the batter: courses close up as the face leans back
    }
  }
  const wallY = (x, hm) => WB(x) - hm * PXM * k(x);
  const capY = (x) => WT(x) + 4;
  B.clip(ctx, wall, function () {
    for (let x = 0; x < W; x++) {
      const u = (x + 0.5) / W;
      const base = ramp(wallStops, u);
      const top = WT(x) - 1;
      const bot = WB(x) + 3;
      // The face tips up into the light toward the top: a lighter wash there.
      for (let y = Math.floor(top); y < bot; y++) {
        const v = (WB(x) - y) / (WB(x) - WT(x));
        ctx.fillStyle = mixh(base, SUN, 0.02 + 0.18 * Math.max(0, v - 0.4));
        ctx.fillRect(x, y, 1, 1);
      }
      // Alternate bands a shade apart, a fine dark joint at each.
      for (let i = 0; i < bandH.length; i++) {
        const y0 = Math.round(wallY(x, bandH[i]));
        const y1 = Math.round(i + 1 < bandH.length ? wallY(x, bandH[i + 1]) : capY(x));
        if (i % 2 === 1 && y1 < y0) {
          ctx.fillStyle = B.alpha(SHADOW, 0.05);
          ctx.fillRect(x, y1, 1, y0 - y1);
        }
        ctx.fillStyle = B.alpha(S.joint, 0.2 - 0.08 * u);
        ctx.fillRect(x, y0, 1, 1);
      }
    }
    // Weathering: two broad, soft ochre lichen washes low on the lit stretch,
    // and two wide soft rain streaks from the top.
    const soft = function (x, y, rx, ry, color, a) {
      B.dab(ctx, x, y, rx, ry, B.alpha(color, a), 6);
    };
    soft(30, WB(30) - 30, 34, 15, S.rust, 0.2);
    soft(70, WB(70) - 16, 22, 9, S.rust, 0.16);
    soft(18, WB(18) - 76, 18, 12, S.rust, 0.12);
    const streak = function (x, len, w, a) {
      const y = WT(x) + 2;
      ctx.save();
      ctx.filter = 'blur(4px)';
      B.fill(ctx, [[x - w / 2, y], [x + w / 2, y], [x + w * 0.3, y + len * 0.7], [x, y + len], [x - w * 0.35, y + len * 0.6]], B.alpha(S.streak, a));
      ctx.restore();
    };
    streak(44, 70, 18, 0.2);
    streak(300, 60, 20, 0.16);
  });
  // The capstone course: set back and bright where it catches the sun, with a
  // dark step under it and a fine ink edge on the sky.
  {
    const rim = [];
    for (let x = 0; x <= W; x += 4) rim.push([x, WT(x)]);
    for (let x = W; x >= 0; x -= 4) rim.push([x, capY(x)]);
    B.fill(ctx, rim, B.alpha(SUN, 0.62));
    const step = [];
    for (let x = 0; x <= W; x += 4) step.push([x, capY(x)]);
    for (let x = W; x >= 0; x -= 4) step.push([x, capY(x) + 1.6]);
    B.fill(ctx, step, B.alpha(SHADOW, 0.4));
    ctx.beginPath();
    for (let x = 0; x <= W; x += 4) (x === 0 ? ctx.moveTo : ctx.lineTo).call(ctx, x, WT(x));
    ctx.lineWidth = 1.3;
    ctx.strokeStyle = B.alpha(INK, 0.6);
    ctx.stroke();
  }

  // ---------------------------------------------------------------------------
  // 4. Ground: level granite sand from the wall's foot to the viewer, a step
  // under the lit stone and darker toward the viewer, a few broad patches of
  // dry grass.
  const ground = [[0, H]];
  for (let x = 0; x <= W; x += 4) ground.push([x, WB(x)]);
  ground.push([W, H]);
  {
    const stops = [[0, S.sand], [0.5, shd(S.sand, 0.1)], [1, shd(S.sand, 0.24)]];
    B.clip(ctx, ground, function () {
      for (let y = 230; y < H; y++) {
        ctx.fillStyle = ramp(stops, (y - 244) / (H - 244));
        ctx.fillRect(0, y, W, 1);
      }
      const grass = shd(mixh(S.grass, B.C.foliage, 0.35), 0.1);
      const patch = function (x, y, w, h) {
        B.fill(ctx, [[x - w, y + h * 0.35], [x - w * 0.55, y - h * 0.45], [x + w * 0.05, y - h * 0.6], [x + w * 0.75, y - h * 0.4], [x + w, y + h * 0.25], [x + w * 0.35, y + h * 0.6], [x - w * 0.5, y + h * 0.6]], grass);
      };
      patch(30, 258, 30, 4);
      patch(330, 257, 36, 4);
      patch(236, 276, 70, 7);
      patch(40, 278, 60, 7);
    });
    // The wall's foot where it meets the sand.
    const f = [];
    for (let x = 0; x <= W; x += 4) f.push([x, WB(x) - 1]);
    for (let x = W; x >= 0; x -= 4) f.push([x, WB(x) + 2.5]);
    B.fill(ctx, f, B.alpha(SHADOW, 0.3));
  }

  // ---------------------------------------------------------------------------
  // 5. The towers. One brush for both: a solid round of dry granite, its tone
  // set by how each part of the round faces the upper-right sun (coolest at
  // the left edge, warmest right of centre), then the one masonry: course
  // arcs, a faint sunlit arris under each on the lit flank, and short
  // irregular end joints about a course apart, crowding toward the edges.
  // `topAt(th)` is the height of the top at angle th: flat for the great
  // tower with a few blocks gone, a steep broken slope for the small one.
  const STONE = [[-1, G.towerDeep], [-0.45, G.towerShade], [0.1, G.towerTerm], [0.55, G.towerLit], [0.95, G.towerHi]];
  const tower = function (o) {
    const L = B.layer(W, H);
    const c = L.getContext('2d');
    const rm = (hm) => o.s * rMetres(hm / o.s);
    const P = (hm, th) => project(o.cx, o.base, hm, rm(hm), th);
    // The silhouette: left side up, the top arc, right side down, the foot arc.
    const pts = [];
    const hl = o.topAt(-Math.PI / 2);
    for (let h = 0; h < hl; h += 0.1) pts.push(P(h, -Math.PI / 2));
    const N = 180;
    for (let i = 0; i <= N; i++) {
      const th = -Math.PI / 2 + (Math.PI * i) / N;
      pts.push(P(o.topAt(th - 0.0001), th));
      pts.push(P(o.topAt(th + 0.0001), th));
    }
    const hr = o.topAt(Math.PI / 2);
    for (let h = hr; h > 0; h -= 0.1) pts.push(P(h, Math.PI / 2));
    for (let i = N; i >= 0; i--) pts.push(P(0, -Math.PI / 2 + (Math.PI * i) / N));
    o.pts = pts;
    B.path(c, pts);
    c.save();
    c.clip();
    // Modelling: each pixel's height gives the round's radius there, its x the
    // angle round the tower, and that angle how it faces the sun.
    const bb = B.bounds(pts);
    const TONES = 48;
    const tone = [];
    for (let i = 0; i < TONES; i++) tone.push(ramp(STONE, -1 + (2 * (i + 0.5)) / TONES));
    for (let y = Math.floor(bb.y0); y <= Math.ceil(bb.y1); y++) {
      const hm = Math.max(0, Math.min(o.s * TH_M, (o.base - y) / PXM));
      const R = rm(hm) * PXM;
      let runStart = Math.floor(bb.x0);
      let runTone = -1;
      for (let x = Math.floor(bb.x0); x <= Math.ceil(bb.x1) + 1; x++) {
        const sn = Math.max(-1, Math.min(1, (x + 0.5 - o.cx) / R));
        const th = Math.asin(sn);
        const lam = 0.78 * Math.sin(th) + 0.52 * Math.cos(th) - 0.16;
        const q = x > bb.x1 ? -2 : Math.max(0, Math.min(TONES - 1, Math.floor(((lam + 1) / 2) * TONES)));
        if (q !== runTone) {
          if (runTone >= 0) {
            c.fillStyle = tone[runTone];
            c.fillRect(runStart, y, x - runStart, 1);
          }
          runStart = x;
          runTone = q;
        }
      }
    }
    // The courses: the front half of a level circle each.
    const r = B.rng(o.seed);
    const courses = [];
    for (let h = COURSE_M; h < o.s * TH_M - 0.2; h += COURSE_M) courses.push(h);
    const arcY = (h, x) => {
      const sn = Math.max(-1, Math.min(1, (x - o.cx) / (rm(h) * PXM)));
      return P(h, Math.asin(sn))[1];
    };
    for (const h of courses) {
      const R = rm(h) * PXM;
      for (let x = Math.floor(o.cx - R); x <= Math.ceil(o.cx + R); x++) {
        const sn = (x + 0.5 - o.cx) / R;
        if (Math.abs(sn) > 1) continue;
        const th = Math.asin(sn);
        if (h > o.topAt(th) - 0.15) continue;
        const y = Math.round(P(h, th)[1]);
        c.fillStyle = B.alpha(S.joint, sn < -0.3 ? 0.36 : 0.5);
        c.fillRect(x, y, 1, 1);
        if (sn > -0.2) {
          c.fillStyle = B.alpha(SUN, Math.min(0.26, (sn + 0.2) * 0.4));
          c.fillRect(x, y + 1, 1, 1);
        }
      }
    }
    // End joints: blocks of irregular length, laid about a course apart
    // along the round, so they crowd toward the edges; random stagger.
    const levels = [0].concat(courses);
    for (let i = 0; i < levels.length; i++) {
      const h0 = levels[i];
      const h1 = i + 1 < levels.length ? levels[i + 1] : o.s * TH_M;
      const rmid = rm((h0 + h1) / 2);
      let a = -Math.PI / 2 + r() * (0.7 / rmid);
      while (a < Math.PI / 2) {
        const sn = Math.sin(a);
        if (Math.abs(sn) < 0.9 && h1 <= o.topAt(a) + 0.01 && r() > 0.22) {
          const x = Math.round(o.cx + sn * rmid * PXM);
          const ya = Math.round(arcY(h1, x + 0.5)) + 2;
          const yb = Math.round(arcY(h0, x + 0.5)) - 1;
          if (yb > ya) {
            c.fillStyle = B.alpha(S.joint, sn < -0.3 ? 0.18 : 0.3);
            c.fillRect(x, ya, 1, yb - ya);
          }
        }
        a += (0.42 + r() * 0.36) / rmid;
      }
    }
    // The top's broken edge: the upper arris of whatever course is on top
    // catches the sun.
    for (let x = Math.floor(bb.x0); x <= Math.ceil(bb.x1); x++) {
      const sn = (x + 0.5 - o.cx) / (rm(o.topAt(0)) * PXM);
      if (Math.abs(sn) > 1) continue;
      const th = Math.asin(sn);
      const y = P(o.topAt(th), th)[1];
      c.fillStyle = B.alpha(SUN, sn < -0.3 ? 0.2 : 0.5);
      c.fillRect(x, Math.round(y), 1, 2);
    }
    if (o.extra) o.extra(c, P);
    c.restore();
    inkRound(L, 0.9);
    return L;
  };

  // The conical tower: flat-topped, its top edge ragged where a few blocks of
  // the top course (and one of the course under it) are gone.
  const TOPM = TH_M;
  const gaps = [[-1.58, -0.7, 1], [-0.7, -0.52, 0.5], [0.12, 0.6, 1]];
  const bigTop = function (th) {
    for (const [a, b, n] of gaps) if (th >= a && th < b) return TOPM - n * COURSE_M;
    return TOPM;
  };
  const T = tower({ cx: TX, base: TB, s: 1, seed: 311, topAt: bigTop });

  // The small tower: the same brush at 0.42 of the size, broken off in a
  // steep ragged slope, high on the left and low on the right.
  const SS = 0.42;
  const SX = 246;
  const SB = TB;
  const brk = [[-1.58, 2.8], [-0.62, 2.84], [-0.52, 2.44], [-0.4, 2.5], [-0.2, 2.02], [0.04, 1.92], [0.3, 1.44], [0.44, 1.5], [0.7, 1.08], [1.58, 1.0]];
  const smallTop = function (th) {
    for (let i = 1; i < brk.length; i++) {
      if (th <= brk[i][0]) {
        const t = (th - brk[i - 1][0]) / (brk[i][0] - brk[i - 1][0]);
        return brk[i - 1][1] + (brk[i][1] - brk[i - 1][1]) * Math.max(0, t);
      }
    }
    return brk[brk.length - 1][1];
  };
  const small = tower({ cx: SX, base: SB, s: SS, seed: 97, topAt: smallTop });

  // ---------------------------------------------------------------------------
  // 6. Cast shadows, one direction: from each tower's foot back and to the
  // left across the court to the wall's foot, then up the wall, narrowing to
  // a rounded end. One layer, so overlaps do not double up.
  {
    const Ls = B.layer(W, H);
    const c = Ls.getContext('2d');
    const cast = function (cx, s, rise, lean, top) {
      const dx = -54 * s - 10;
      const r0 = rMetres(0) * s * PXM;
      const kw = k(cx + dx);
      const foot = WB(cx + dx);
      const wx = cx + dx;
      // On the court: from the foot back to the wall's foot.
      B.fill(c, [[cx - r0, TB + 1], [cx + r0 * 0.4, TB - 2], [wx + r0 * kw * 0.4, foot + 1], [wx - r0 * kw, foot + 1]], '#000');
      // On the wall: the tower's own taper, lower than the tower and leaning a
      // little left, rounded at the end.
      const pts = [];
      const Hs = rise * PXM * kw;
      const n = 16;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const rr = rMetres(t * TH_M * (top || 1)) * s * PXM * kw * (0.96 - 0.3 * t);
        pts.push([wx - rr - lean * t, foot + 1 - Hs * t]);
      }
      const rTop = rMetres(TH_M * (top || 1)) * s * PXM * kw * 0.66;
      for (let i = 1; i < 12; i++) {
        const a = Math.PI - (Math.PI * i) / 12;
        pts.push([wx - lean + rTop * Math.cos(a), foot + 1 - Hs - rTop * 0.9 * Math.sin(a)]);
      }
      for (let i = n; i >= 0; i--) {
        const t = i / n;
        const rr = rMetres(t * TH_M * (top || 1)) * s * PXM * kw * (0.96 - 0.3 * t);
        pts.push([wx + rr - lean * t, foot + 1 - Hs * t]);
      }
      B.fill(c, pts, '#000');
    };
    cast(TX, 1, 5.4, 34, 1);
    cast(SX, SS, 1.6, 4, 0.55);
    const Lc = silhouette(Ls, SHADOW);
    ctx.save();
    ctx.globalAlpha = 0.36;
    ctx.drawImage(Lc, 0, 0);
    ctx.restore();
  }

  // Contact shade where each tower's round foot meets the sand.
  for (const [cx, s] of [[TX, 1], [SX, SS]]) {
    const r0 = rMetres(0) * s;
    const pts = [];
    for (let i = 0; i <= 40; i++) pts.push(project(cx, TB, 0, r0, -Math.PI / 2 + (Math.PI * i) / 40));
    for (let i = 40; i >= 0; i--) {
      const p = project(cx, TB, 0, r0, -Math.PI / 2 + (Math.PI * i) / 40);
      pts.push([p[0] - 3, p[1] + 3]);
    }
    B.fill(ctx, pts, B.alpha(SHADOW, 0.34));
  }
  ctx.drawImage(T, 0, 0);
  ctx.drawImage(small, 0, 0);

  // ---------------------------------------------------------------------------
  // 7. The small tower's fallen blocks, spilled at its right foot: one block,
  // painted once and stamped (pillar 4).
  {
    const blk = B.layer(14, 10);
    const c = blk.getContext('2d');
    B.fill(c, [[1, 3], [3, 1], [12, 1], [10, 3]], lit(S.lit, 0.42)); // top, in the sun
    B.fill(c, [[1, 3], [10, 3], [10, 8], [1, 8]], mixh(S.mid, S.lit, 0.4)); // front
    B.fill(c, [[10, 3], [12, 1], [12, 6], [10, 8]], lit(S.mid, 0.2)); // right flank
    inkRound(blk, 0.85);
    const spill = [[266, 251], [280, 255], [258, 258], [273, 260], [292, 262], [308, 266]];
    for (const [x, y] of spill) {
      B.fill(ctx, [[x - 3, y + 8], [x + 9, y + 8], [x + 6, y + 10], [x - 6, y + 10]], B.alpha(SHADOW, 0.3));
    }
    for (const [x, y] of spill) ctx.drawImage(blk, x, y);
  }

  // ---------------------------------------------------------------------------
  // 7. The plate's own palette. The harness saves 255 colours by median cut,
  // which spends most of them on the few pixels of antialiased edges and
  // leaves the broad washes to posterize. Choose the 255 here instead, by
  // splitting whichever group of colours carries the most error, so the big
  // quiet surfaces keep their gradations; the harness then keeps them exactly.
  {
    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;
    const count = new Map();
    for (let i = 0; i < d.length; i += 4) {
      const key = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
      count.set(key, (count.get(key) || 0) + 1);
    }
    const cols = [];
    for (const [key, n] of count) cols.push([(key >> 16) & 255, (key >> 8) & 255, key & 255, n]);
    const stat = function (box) {
      let n = 0;
      const m = [0, 0, 0];
      for (const e of box) {
        n += e[3];
        for (let c = 0; c < 3; c++) m[c] += e[0 + c] * e[3];
      }
      for (let c = 0; c < 3; c++) m[c] /= n;
      const v = [0, 0, 0];
      for (const e of box) for (let c = 0; c < 3; c++) v[c] += e[3] * (e[c] - m[c]) * (e[c] - m[c]);
      return { box: box, n: n, m: m, v: v, err: v[0] + v[1] + v[2] };
    };
    const boxes = [stat(cols)];
    while (boxes.length < 255) {
      let bi = -1;
      for (let i = 0; i < boxes.length; i++) if (boxes[i].box.length > 1 && (bi < 0 || boxes[i].err > boxes[bi].err)) bi = i;
      if (bi < 0 || boxes[bi].err <= 0) break;
      const b = boxes[bi];
      const k = b.v[0] >= b.v[1] && b.v[0] >= b.v[2] ? 0 : b.v[1] >= b.v[2] ? 1 : 2;
      b.box.sort((p, q) => p[k] - q[k]);
      // Cut at the group's mean along its widest channel.
      let cut = 1;
      while (cut < b.box.length - 1 && b.box[cut][k] <= b.m[k]) cut++;
      boxes.splice(bi, 1, stat(b.box.slice(0, cut)), stat(b.box.slice(cut)));
    }
    const pal = boxes.map((b) => b.m.map((v) => Math.round(v)));
    const near = new Map();
    for (const e of cols) {
      let best = 0;
      let bd = Infinity;
      for (let i = 0; i < pal.length; i++) {
        const dr = e[0] - pal[i][0];
        const dg = e[1] - pal[i][1];
        const db = e[2] - pal[i][2];
        const dd = 3 * dr * dr + 4 * dg * dg + 2 * db * db;
        if (dd < bd) {
          bd = dd;
          best = i;
        }
      }
      near.set((e[0] << 16) | (e[1] << 8) | e[2], pal[best]);
    }
    for (let i = 0; i < d.length; i += 4) {
      const p = near.get((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
      d[i] = p[0];
      d[i + 1] = p[1];
      d[i + 2] = p[2];
      d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }
};
