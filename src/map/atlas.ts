/**
 * The tour: every chapter and every site, in order, with where it is on Earth.
 * Derived from content/research/arc.md, which outranks this file on every
 * historical fact. Only sites with a `level` can be entered; the rest are
 * drawn on the map as closed.
 */

import type { Costume } from '../engine/types';
import type { MonumentId } from './monuments';

export interface Site {
  name: string;
  lat: number;
  lon: number;
  /** Level id in src/levels, once the level exists. */
  level?: string;
  /** Nudge for the pin on the chapter map when sites crowd; a leader line points at the true spot. */
  pin?: { dx: number; dy: number };
  /** Which side the name goes. Default alternates. */
  label?: 'left' | 'right';
}

export interface Chapter {
  number: number;
  /** Hyphenated form of the research slug; names the chapter's painted map. */
  slug: string;
  name: string;
  dates: string;
  /** Which site's position stands for the chapter on the world map. */
  anchor: number;
  /** Nudge for the chapter's badge on the world map, so clustered chapters do not overlap; a leader line points at the true spot. */
  badge?: { dx: number; dy: number };
  /** What the tourist wears here, from the research. Unset until the chapter is designed. */
  costume?: Costume;
  /**
   * The vignette that stands for the chapter on the tour map: which of the
   * chapter's own five sites it shows, and how the game draws it. Never a
   * monument borrowed from another chapter. `content/map/README.md` says what
   * must be right about each outline.
   */
  monument: { site: number; art: MonumentId };
  sites: Site[];
}

export const CHAPTERS: Chapter[] = [
  {
    number: 1,
    slug: 'palaeolithic',
    name: 'Palaeolithic Europe',
    dates: '27,000–13,000 BP',
    anchor: 3,
    badge: { dx: -10, dy: 6 },
    costume: 'hiker',
    monument: { site: 4, art: 'hand-stencil' },
    sites: [
      { name: 'Cap Blanc', lat: 44.95, lon: 1.1, level: 'cap-blanc', pin: { dx: 16, dy: -12 }, label: 'right' },
      { name: 'Roc-aux-Sorciers', lat: 46.69, lon: 0.87, level: 'roc-aux-sorciers', label: 'right' },
      { name: 'Pech Merle', lat: 44.51, lon: 1.64, level: 'pech-merle', pin: { dx: 10, dy: 10 }, label: 'right' },
      { name: 'Rouffignac', lat: 45.01, lon: 0.99, level: 'rouffignac', pin: { dx: -14, dy: -6 }, label: 'left' },
      { name: 'Gargas', lat: 43.05, lon: 0.52, level: 'gargas', label: 'left' },
    ],
  },
  {
    number: 2,
    slug: 'egypt',
    name: 'Egypt',
    dates: '2667 BC – AD 30',
    anchor: 2,
    costume: 'pharaoh',
    monument: { site: 0, art: 'abu-simbel' },
    sites: [
      { name: 'Abu Simbel', lat: 22.34, lon: 31.63, level: 'abu-simbel' },
      { name: 'Philae', lat: 24.02, lon: 32.88, level: 'philae', pin: { dx: 12, dy: 2 }, label: 'right' },
      { name: 'Karnak', lat: 25.72, lon: 32.66, level: 'karnak', pin: { dx: -12, dy: 0 }, label: 'left' },
      { name: 'Dendera', lat: 26.14, lon: 32.67, pin: { dx: 10, dy: -8 }, label: 'right' },
      { name: 'Saqqara', lat: 29.87, lon: 31.22 },
    ],
  },
  {
    number: 3,
    slug: 'aegean',
    name: 'Bronze Age Aegean',
    dates: '1900–1200 BC',
    anchor: 0,
    badge: { dx: 4, dy: 8 },
    monument: { site: 3, art: 'lion-gate' },
    sites: [
      { name: 'Knossos', lat: 35.3, lon: 25.16 },
      { name: 'Phaistos', lat: 35.05, lon: 24.81 },
      { name: 'Akrotiri', lat: 36.35, lon: 25.4 },
      { name: 'Mycenae', lat: 37.73, lon: 22.76 },
      { name: 'Tiryns', lat: 37.6, lon: 22.8 },
    ],
  },
  {
    number: 4,
    slug: 'persia',
    name: 'Iron Age Near East & Persia',
    dates: '900–330 BC',
    anchor: 0,
    monument: { site: 0, art: 'apadana' },
    sites: [
      { name: 'Persepolis', lat: 29.93, lon: 52.89 },
      { name: 'Behistun', lat: 34.39, lon: 47.44 },
      { name: 'Naqsh-e Rustam', lat: 29.99, lon: 52.87 },
      { name: 'Susa', lat: 32.19, lon: 48.26 },
      { name: 'Pasargadae', lat: 30.2, lon: 53.18 },
    ],
  },
  {
    number: 5,
    slug: 'classical',
    name: 'Classical Mediterranean',
    dates: '450 BC – AD 200',
    anchor: 2,
    badge: { dx: -8, dy: -6 },
    monument: { site: 3, art: 'doric-temple' },
    sites: [
      { name: 'Ephesus', lat: 37.94, lon: 27.34 },
      { name: 'Ostia Antica', lat: 41.76, lon: 12.29 },
      { name: 'Pompeii', lat: 40.75, lon: 14.49 },
      { name: 'Segesta', lat: 37.94, lon: 12.83 },
      { name: 'Leptis Magna', lat: 32.64, lon: 14.29 },
    ],
  },
  {
    number: 6,
    slug: 'americas',
    name: 'The Americas',
    dates: 'AD 200–1500',
    anchor: 1,
    monument: { site: 2, art: 'roof-comb' },
    sites: [
      { name: 'Teotihuacan', lat: 19.69, lon: -98.84 },
      { name: 'Chichén Itzá', lat: 20.68, lon: -88.57 },
      { name: 'Tikal', lat: 17.22, lon: -89.62 },
      { name: 'Monte Albán', lat: 17.04, lon: -96.77 },
      { name: 'Ollantaytambo', lat: -13.26, lon: -72.26 },
    ],
  },
  {
    number: 7,
    slug: 'monsoon',
    name: 'Monsoon Asia',
    dates: 'AD 400–1300',
    anchor: 4,
    monument: { site: 0, art: 'lion-paws' },
    sites: [
      { name: 'Sigiriya', lat: 7.96, lon: 80.76 },
      { name: 'Ajanta', lat: 20.55, lon: 75.7 },
      { name: 'Chand Baori', lat: 27.01, lon: 76.61 },
      { name: 'Borobudur', lat: -7.61, lon: 110.2 },
      { name: 'Angkor Wat', lat: 13.41, lon: 103.87 },
    ],
  },
  {
    number: 8,
    slug: 'east-asia',
    name: 'East Asia',
    dates: 'AD 600–1600',
    anchor: 1,
    monument: { site: 0, art: 'tiered-roofs' },
    sites: [
      { name: 'Himeji', lat: 34.84, lon: 134.69 },
      { name: 'Great Wall', lat: 40.36, lon: 116.02 },
      { name: 'Nijō Castle', lat: 35.01, lon: 135.75 },
      { name: 'Gyeongbokgung', lat: 37.58, lon: 126.98 },
      { name: 'Foguang Temple', lat: 39.0, lon: 113.4 },
    ],
  },
  {
    number: 9,
    slug: 'africa',
    name: 'Africa & the Indian Ocean',
    dates: 'AD 1000–1600',
    anchor: 0,
    monument: { site: 0, art: 'conical-tower' },
    sites: [
      { name: 'Great Zimbabwe', lat: -20.27, lon: 30.93 },
      { name: 'Gede', lat: -3.31, lon: 40.02 },
      { name: 'Kilwa Kisiwani', lat: -8.96, lon: 39.51 },
      { name: 'Loropéni', lat: 10.28, lon: -3.57 },
      { name: 'Songo Mnara', lat: -9.03, lon: 39.55 },
    ],
  },
  {
    number: 10,
    slug: 'islamic',
    name: 'Islamic Central Asia & al-Andalus',
    dates: 'AD 1200–1600',
    anchor: 0,
    monument: { site: 0, art: 'iwan' },
    sites: [
      { name: 'Registan', lat: 39.65, lon: 66.98 },
      { name: 'Alhambra', lat: 37.18, lon: -3.59 },
      { name: 'Medina Azahara', lat: 37.89, lon: -4.87 },
      { name: 'Sultan Han', lat: 38.25, lon: 33.55 },
      { name: 'Arg-e Bam', lat: 29.12, lon: 58.37 },
    ],
  },
  {
    number: 11,
    slug: 'industrial',
    name: 'The Industrial Dawn',
    dates: '1700–1800',
    anchor: 0,
    badge: { dx: -6, dy: -8 },
    monument: { site: 0, art: 'iron-bridge' },
    sites: [
      { name: 'The Iron Bridge', lat: 52.63, lon: -2.49 },
      { name: 'Cromford Mill', lat: 53.11, lon: -1.56 },
      { name: 'Ditherington Flaxmill', lat: 52.72, lon: -2.74 },
      { name: 'East Pool', lat: 50.23, lon: -5.28 },
      { name: 'Pontcysyllte', lat: 52.97, lon: -3.09 },
    ],
  },
  {
    number: 12,
    slug: 'napoleonic',
    name: 'Napoleonic Wars',
    dates: '1796–1815',
    anchor: 2,
    badge: { dx: 10, dy: -4 },
    monument: { site: 0, art: 'martello' },
    sites: [
      { name: 'Martello Towers', lat: 51.02, lon: 1.0 },
      { name: 'Simplon Pass', lat: 46.25, lon: 8.03 },
      { name: 'Neuf-Brisach', lat: 48.02, lon: 7.53 },
      { name: 'Chappe Tower, Saverne', lat: 48.74, lon: 7.36 },
      { name: 'HMS Victory', lat: 50.8, lon: -1.11 },
    ],
  },
];

/** True if any level of the chapter exists in the game. */
export function chapterOpen(c: Chapter): boolean {
  return c.sites.some((s) => s.level);
}

/** The site whose monument stands for the chapter on the tour map. */
export function chapterMonumentSite(c: Chapter): Site {
  return c.sites[c.monument.site] ?? c.sites[0]!;
}

/** The painted-art id for a chapter's vignette, if anybody ever paints one. */
export function monumentArtId(c: Chapter): string {
  return `map-monument-ch${String(c.number).padStart(2, '0')}-${c.slug}`;
}

/** The chapter and site index a level belongs to. */
export function locate(levelId: string): { chapter: Chapter; site: number } | null {
  for (const c of CHAPTERS) {
    const i = c.sites.findIndex((s) => s.level === levelId);
    if (i >= 0) return { chapter: c, site: i };
  }
  return null;
}
