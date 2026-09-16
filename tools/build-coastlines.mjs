#!/usr/bin/env node
/**
 * Regenerates `src/map/geo.ts` from Natural Earth, which is public domain.
 *
 * The coastlines used to be drawn by hand, a few dozen points for the whole of
 * Eurasia, and they read as blobs: no Italy, no Greece, no Black Sea, no Gulf.
 * A tour brochure simplifies a coastline; it does not invent one. So the shapes
 * come from the survey and the simplification is ours.
 *
 * Download the four layers first (they are not committed; the generated
 * `src/map/geo.ts` is):
 *
 *   base=https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson
 *   mkdir -p /tmp/ne
 *   for f in ne_10m_land ne_10m_minor_islands ne_50m_lakes \
 *            ne_50m_rivers_lake_centerlines; do
 *     curl -sSo /tmp/ne/$f.geojson $base/$f.geojson
 *   done
 *   node tools/build-coastlines.mjs /tmp/ne
 *
 * The land comes from 1:10m and is then thrown away almost everywhere. That is
 * on purpose: the survey is only fine enough near the sites if it starts fine,
 * and Douglas–Peucker removes the rest for free.
 *
 * Simplification is Douglas–Peucker in degrees, which is the space the map is
 * drawn in: the projection is equirectangular, so a tolerance in degrees is a
 * tolerance in pixels.
 *
 * The tolerance is not uniform. Near a site the tour visits it drops by an order
 * of magnitude, and a ring too small to keep is kept anyway if a site is on it.
 * Two reasons. A chapter map draws this same data at twenty to fifty times the
 * world map's scale, so the coast the player is looking at is the coast beside a
 * site. And a coastal site — Ostia, Leptis Magna, Dymchurch — ends up in the sea
 * when twenty kilometres of coastline are straightened past it, which breaks the
 * one rule `content/map/map-world.md` sets: every site falls on land.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** Everything the tour can reach, with room at the edges. */
const FRAME = { lon0: -130, lon1: 165, lat0: 78, lat1: -50 };
/** Degrees, out in the open ocean where nothing is happening: a third of a world-map pixel. */
const TOLERANCE = 0.4;
/** Degrees, within SITE_RADIUS of somewhere the tour goes. */
const SITE_TOLERANCE = 0.03;
/**
 * Degrees, for the Nile. Coarser than the coast beside it on purpose: every
 * meander kept is a wobble nobody can see at the world map's scale, and the
 * line ends up looking furry rather than drawn.
 */
const RIVER_TOLERANCE = 0.15;
/** Degrees, on an island small enough that the site is most of it. */
const ISLAND_TOLERANCE = 0.005;
/** Kilometres. How close a site has to be for a ring to count as its island. */
const SITE_ISLAND_KM = 8;
/**
 * No ring is ever straightened by more than this much of its own size. Without
 * it the open-sea tolerance turns anything smaller than itself into a triangle,
 * and the Cyclades come out as broken glass.
 */
const SHAPE_FRACTION = 0.05;
/** Degrees. Covers the part of a chapter map the player is actually looking at. */
const SITE_RADIUS = 2.5;
/** Square degrees. Keeps Crete and Sri Lanka; drops the specks. */
const MIN_LAND_AREA = 0.12;
/**
 * Square degrees, for an island within SITE_RADIUS of a site. About sixty square
 * kilometres: Naxos and Paros stay, because a Bronze Age Aegean with no Cyclades
 * in it is a lie, and the specks around them go.
 */
const NEAR_SITE_MIN_AREA = 0.005;
const MIN_LAKE_AREA = 0.9;
/** Coordinates are rounded to this many decimals: about 100 m, far below a pixel. */
const DP = 2;
/**
 * Kilometres. A site further than this from the coast means something is wrong —
 * a dropped island, a bad coordinate — and the build says so. Inside it, the site
 * is on the waterline, which is where several of them genuinely are: Akrotiri is
 * on Thera's shore and Victory is in a dry dock. At the world map's scale this is
 * a twentieth of a pixel.
 */
const ADRIFT_KM = 5;

const dir = process.argv[2] ?? '/tmp/ne';
const read = (name) => JSON.parse(readFileSync(join(dir, `${name}.geojson`), 'utf8'));

// ---------------------------------------------------------------------------

function ringsOf(geometry) {
  const { type, coordinates } = geometry;
  if (type === 'Polygon') return [coordinates[0]];
  if (type === 'MultiPolygon') return coordinates.map((p) => p[0]);
  if (type === 'LineString') return [coordinates];
  if (type === 'MultiLineString') return coordinates;
  return [];
}

function area(ring) {
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++) a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  return Math.abs(a) / 2;
}

/** The longer side of a ring's bounding box, in degrees. */
function span(ring) {
  let lon0 = Infinity;
  let lon1 = -Infinity;
  let lat0 = Infinity;
  let lat1 = -Infinity;
  for (const [lon, lat] of ring) {
    lon0 = Math.min(lon0, lon);
    lon1 = Math.max(lon1, lon);
    lat0 = Math.min(lat0, lat);
    lat1 = Math.max(lat1, lat);
  }
  return Math.max(lon1 - lon0, lat1 - lat0);
}

function intersectsFrame(ring) {
  let lon0 = Infinity;
  let lon1 = -Infinity;
  let lat0 = Infinity;
  let lat1 = -Infinity;
  for (const [lon, lat] of ring) {
    lon0 = Math.min(lon0, lon);
    lon1 = Math.max(lon1, lon);
    lat0 = Math.min(lat0, lat);
    lat1 = Math.max(lat1, lat);
  }
  return lon1 >= FRAME.lon0 && lon0 <= FRAME.lon1 && lat1 >= FRAME.lat1 && lat0 <= FRAME.lat0;
}

/** Perpendicular distance from p to the segment a–b, in degrees. */
function segmentDistance(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

function simplify(points, toleranceAt) {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [lo, hi] = stack.pop();
    let worst = 0;
    let at = -1;
    for (let i = lo + 1; i < hi; i++) {
      const d = segmentDistance(points[i], points[lo], points[hi]);
      if (d > worst) {
        worst = d;
        at = i;
      }
    }
    if (at > 0 && worst > toleranceAt(points[at])) {
      keep[at] = 1;
      stack.push([lo, at], [at, hi]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

const round = (ring) => ring.map(([lon, lat]) => [+lon.toFixed(DP), +lat.toFixed(DP)]);

/** Closed rings repeat their first point; the drawer closes them itself. */
function open(ring) {
  const last = ring[ring.length - 1];
  return ring[0][0] === last[0] && ring[0][1] === last[1] ? ring.slice(0, -1) : ring;
}

function pointInRing([lon, lat], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// ---------------------------------------------------------------------------
// Where the tour goes, read straight out of the atlas.

const atlas = readFileSync('src/map/atlas.ts', 'utf8');
const sites = [...atlas.matchAll(/name: '([^']+)', lat: (-?[\d.]+), lon: (-?[\d.]+)/g)].map((m) => ({
  name: m[1],
  lat: +m[2],
  lon: +m[3],
}));
if (sites.length === 0) throw new Error('found no sites in src/map/atlas.ts');

const onItsIsland = (ring) =>
  sites.some((s) => ring.some(([x, y]) => Math.hypot(x - s.lon, y - s.lat) * 111 < SITE_ISLAND_KM));
const nearSite = ([lon, lat]) => sites.some((s) => Math.abs(s.lon - lon) < SITE_RADIUS && Math.abs(s.lat - lat) < SITE_RADIUS);
const toleranceAt = (p) => (nearSite(p) ? SITE_TOLERANCE : TOLERANCE);
/**
 * What earns a place on the sheet: anything big, anything near a site and not a
 * speck, and any island a site actually stands on however small it is.
 */
const worthDrawing = (ring) => {
  const a = area(ring);
  if (a >= MIN_LAND_AREA) return true;
  if (a >= NEAR_SITE_MIN_AREA && ring.some(nearSite)) return true;
  return onItsIsland(ring);
};
/**
 * An island kept only because a site is on it is drawn nearly unsimplified.
 * Thera is twelve kilometres across: straighten it at the usual site tolerance
 * and it becomes a pentagon with Akrotiri outside it.
 */
function toleranceFor(ring) {
  if (area(ring) < MIN_LAND_AREA && onItsIsland(ring)) return () => ISLAND_TOLERANCE;
  const cap = span(ring) * SHAPE_FRACTION;
  return (p) => Math.min(toleranceAt(p), cap);
}

// ---------------------------------------------------------------------------

const land = [...read('ne_10m_land').features, ...read('ne_10m_minor_islands').features]
  .flatMap((f) => ringsOf(f.geometry))
  .filter((r) => intersectsFrame(r) && worthDrawing(r))
  .map((r) => round(open(simplify(r, toleranceFor(r)))))
  .filter((r) => r.length >= 3)
  .sort((a, b) => b.length - a.length);

const lakes = read('ne_50m_lakes')
  .features.filter((f) => {
    const r = ringsOf(f.geometry)[0];
    if (!r || !intersectsFrame(r)) return false;
    return area(r) >= MIN_LAKE_AREA || /Nasser|Aral|Chad/i.test(f.properties.name ?? '');
  })
  .map((f) => round(open(simplify(ringsOf(f.geometry)[0], toleranceAt))))
  .filter((r) => r.length >= 3);

// The Nile only. `content/map/map-world.md`: coastlines, the Nile, nothing else.
const rivers = read('ne_50m_rivers_lake_centerlines')
  .features.filter((f) => /nile/i.test(f.properties.name ?? '') || /nile/i.test(f.properties.name_en ?? ''))
  .flatMap((f) => ringsOf(f.geometry))
  .map((r) => round(simplify(r, () => RIVER_TOLERANCE)))
  .filter((r) => r.length >= 2);

function kmToCoast({ lon, lat }) {
  let best = Infinity;
  for (const ring of land) for (const [x, y] of ring) best = Math.min(best, Math.hypot(x - lon, y - lat));
  return best * 111;
}

const adrift = sites
  .filter((s) => !land.some((r) => pointInRing([s.lon, s.lat], r)))
  .map((s) => ({ ...s, km: kmToCoast(s) }))
  .sort((a, b) => b.km - a.km);

const points = land.reduce((n, r) => n + r.length, 0);
const body = `/**
 * The world as the survey has it, simplified to what a brochure would print.
 *
 * Generated by \`tools/build-coastlines.mjs\` from Natural Earth, which is public
 * domain: land at 1:10m, lakes and the Nile at 1:50m. Do not edit this file by
 * hand — run the tool. Longitude, latitude pairs, each ring closed by the drawer.
 *
 * Douglas-Peucker at ${TOLERANCE}° out at sea and ${SITE_TOLERANCE}° within ${SITE_RADIUS}° of a site, because a
 * chapter map draws this same data twenty to fifty times larger, and a coastline
 * straightened past a coastal site puts the site in the water.
 */

export type Polygon = [number, number][];

/** Coastlines: ${land.length} rings, ${points} points, largest first. */
export const LAND: Polygon[] = [
${land.map((r) => `  [${r.map(([a, b]) => `[${a},${b}]`).join(',')}],`).join('\n')}
];

/** Inland water big enough for a brochure, drawn in the sea colour over the land. */
export const LAKES: Polygon[] = [
${lakes.map((r) => `  [${r.map(([a, b]) => `[${a},${b}]`).join(',')}],`).join('\n')}
];

/** The Nile, and nothing else: the one river the tour is about. */
export const RIVERS: Polygon[] = [
${rivers.map((r) => `  [${r.map(([a, b]) => `[${a},${b}]`).join(',')}],`).join('\n')}
];
`;

writeFileSync('src/map/geo.ts', body);
console.log(`land ${land.length} rings / ${points} points, lakes ${lakes.length}, rivers ${rivers.length}`);
const onTheWaterline = adrift.filter((s) => s.km <= ADRIFT_KM);
const lost = adrift.filter((s) => s.km > ADRIFT_KM);
for (const s of onTheWaterline) console.log(`on the waterline: ${s.name}, ${s.km.toFixed(1)} km off the drawn coast`);
if (lost.length) {
  for (const s of lost) console.error(`ADRIFT: ${s.name} is ${s.km.toFixed(1)} km out to sea`);
  process.exitCode = 1;
} else {
  console.log(`all ${sites.length} sites in the atlas are on land or within ${ADRIFT_KM} km of it`);
}
