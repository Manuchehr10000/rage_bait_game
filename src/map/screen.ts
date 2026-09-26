/**
 * The tour map. One screen, three instruments, one job each:
 *
 *   - the map, left, says *where on Earth*, and nothing else. It draws the
 *     paper, the land and a marker per stop. The world draws no line between
 *     chapters at all, because the tour's order is chronological and the map's
 *     order is geographical, and any line through twelve chapters over real
 *     coordinates, even one leg of it, is a piece of a web. A chapter draws at
 *     most one dotted leg, from the previous site to the selected one, and
 *     numbers its pins the way the ribbon numbers its beads, so the two name a
 *     site the same way.
 *   - the panel, right, says *what is there*: the chapter, its dates, and a
 *     vignette of one of its own monuments, the way a brochure prints one.
 *   - the ribbon, along the bottom, says *where in the tour you are*: every
 *     stop on one straight rule, left to right, departure marked at the left
 *     end. Cleared stops are stamped solid, so progress fills from the left.
 *
 * Both views share that grammar: the world has its chapters on the ribbon,
 * a chapter has its five sites in play order. Painted art replaces the drawn
 * map when it exists (`map-world`, `map-chNN-slug`, `map-monument-chNN-slug`);
 * the markers, the ribbon, the vignette and the tourist are always drawn on
 * top, and every word is drawn in screen space so it stays crisp.
 */

import { paint } from '../engine/assets';
import type { Input } from '../engine/input';
import type { Progress } from '../engine/progress';
import { VIEW_H, VIEW_W } from '../engine/types';
import { blitFacing } from '../render/frame';
import { tourist } from '../render/scene';
import { CHAPTERS, chapterMonumentSite, chapterOpen, monumentArtId, type Chapter } from './atlas';

/** The title card counts the chapters the game shows, in words. */
const COUNT: Record<number, string> = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve' };
import { LAKES, LAND, RIVERS, type Polygon } from './geo';
import { ART_H, ART_W, drawMonument } from './monuments';

export type MapView = 'world' | 'chapter';
export type MapAction = { kind: 'enter'; level: string } | { kind: 'closed' } | { kind: 'move' } | null;

const FONT = 'Georgia, "Times New Roman", serif';
const INK = '#2b2116';
const INK_SOFT = '#6b5a3e';
const ROUTE = '#8e2f2a';
const PAPER = '#e6d8b4';
const CARD = '#f3ead4';
const BAND = '#dccda4';
const LAND_FILL = '#cbb98d';
const LAND_LINE = '#8a7250';

/** The three instruments, in world units. */
const MAP = { x: 0, y: 0, w: 208, h: 152 };
const PANEL = { x: 208, y: 0, w: VIEW_W - 208, h: 152 };
const RIBBON = { y: 152, h: VIEW_H - 152, rule: 166 };
/**
 * Where the words sit on the map, and how much room they take. The tourist
 * stands on the selected marker and is drawn a head above it, so anything
 * printed on the map has to keep out of his way: the title used to be top left,
 * which is the North Sea, which is where chapter 1 puts him. These two boxes,
 * and the digit in every pin (PIN_DIGIT), are the reserved area, and a test
 * walks every chapter and every site to check nothing ever stands in them.
 */
const TITLE = { x: 6, y: 126, w: 116, h: 21 };
const HEADER = { x: 6, y: 128, w: 152, h: 19 };
/** The number printed in a site's pin, centred on it: one digit, old-style figures included. */
const PIN_DIGIT = { w: 4, h: 6 };

/** The world map's frame in degrees. Equirectangular, which is what brochures use. */
const WORLD = { lon0: -115, lon1: 150, lat0: 65, lat1: -40 };

interface Projection {
  (lon: number, lat: number): { x: number; y: number };
}

const worldProject: Projection = (lon, lat) => ({
  x: MAP.x + ((lon - WORLD.lon0) / (WORLD.lon1 - WORLD.lon0)) * MAP.w,
  y: MAP.y + ((WORLD.lat0 - lat) / (WORLD.lat0 - WORLD.lat1)) * MAP.h,
});

/** Fit a chapter's sites into the map box with a margin. */
function chapterProjection(c: Chapter): Projection {
  let lon0 = Infinity;
  let lon1 = -Infinity;
  let lat0 = Infinity;
  let lat1 = -Infinity;
  for (const s of c.sites) {
    lon0 = Math.min(lon0, s.lon);
    lon1 = Math.max(lon1, s.lon);
    lat0 = Math.min(lat0, s.lat);
    lat1 = Math.max(lat1, s.lat);
  }
  const span = Math.max(lon1 - lon0, lat1 - lat0, 2);
  const pad = span * 0.25 + 0.4;
  const s = Math.min((MAP.w - 48) / (lon1 - lon0 + pad * 2), (MAP.h - 40) / (lat1 - lat0 + pad * 2));
  const cx = (lon0 + lon1) / 2;
  const cy = (lat0 + lat1) / 2;
  return (lon, lat) => ({ x: MAP.x + MAP.w / 2 + (lon - cx) * s, y: MAP.y + MAP.h / 2 + 6 + (cy - lat) * s });
}

function chapterArtId(c: Chapter): string {
  return `map-ch${String(c.number).padStart(2, '0')}-${c.slug}`;
}

/** A chapter is stamped once every level it actually has is cleared. */
function chapterStamped(c: Chapter, progress: Progress): boolean {
  const built = c.sites.filter((s) => s.level);
  return built.length > 0 && built.every((s) => progress.isCleared(s.level!));
}

export class MapScreen {
  view: MapView = 'world';
  chapter = 0;
  site = 0;
  private t = 0;

  constructor(private readonly progress: Progress) {}

  /** Show the world, keeping the last selected chapter. */
  openWorld(): void {
    this.view = 'world';
  }

  /** Show a chapter with the next unfinished site selected. */
  openChapter(index: number): void {
    const c = CHAPTERS[index];
    if (!c) return;
    this.chapter = index;
    this.view = 'chapter';
    const next = c.sites.findIndex((s) => s.level && !this.progress.isCleared(s.level));
    const first = c.sites.findIndex((s) => s.level);
    this.site = next >= 0 ? next : first >= 0 ? first : 0;
  }

  /** Select the chapter and site a level belongs to, for returning from it. */
  showLevel(levelId: string): void {
    for (let i = 0; i < CHAPTERS.length; i++) {
      const c = CHAPTERS[i];
      const j = c?.sites.findIndex((s) => s.level === levelId) ?? -1;
      if (c && j >= 0) {
        this.chapter = i;
        this.view = 'chapter';
        this.site = j;
        return;
      }
    }
  }

  get current(): Chapter {
    return CHAPTERS[this.chapter] ?? CHAPTERS[0]!;
  }

  /** How many stops the ribbon is showing. */
  private get stops(): number {
    return this.view === 'world' ? CHAPTERS.length : this.current.sites.length;
  }

  /** The selected stop's index in whichever view is up. */
  private get selected(): number {
    return this.view === 'world' ? this.chapter : this.site;
  }

  /** Position of a stop's bead on the itinerary ribbon. */
  ribbonStop(i: number): { x: number; y: number } {
    const n = this.stops;
    const margin = n > 8 ? 20 : 40;
    const span = VIEW_W - margin * 2;
    return { x: Math.round(n <= 1 ? VIEW_W / 2 : margin + (span * i) / (n - 1)), y: RIBBON.rule };
  }

  /** Position of a chapter's badge on the world map. For tests and the mouse. */
  worldBadge(i: number): { x: number; y: number } {
    const c = CHAPTERS[i];
    if (!c) return { x: 0, y: 0 };
    const a = c.sites[c.anchor] ?? c.sites[0]!;
    const p = worldProject(a.lon, a.lat);
    return { x: Math.round(p.x + (c.badge?.dx ?? 0)), y: Math.round(p.y + (c.badge?.dy ?? 0)) };
  }

  /** Position of a site's pin in the chapter view. */
  sitePin(i: number): { x: number; y: number } {
    const c = this.current;
    const s = c.sites[i];
    if (!s) return { x: 0, y: 0 };
    const p = chapterProjection(c)(s.lon, s.lat);
    return { x: Math.round(p.x + (s.pin?.dx ?? 0)), y: Math.round(p.y + (s.pin?.dy ?? 0)) };
  }

  /** The site's true position in the chapter view, before any nudge. */
  private siteSpot(i: number): { x: number; y: number } {
    const c = this.current;
    const s = c.sites[i];
    if (!s) return { x: 0, y: 0 };
    const p = chapterProjection(c)(s.lon, s.lat);
    return { x: Math.round(p.x), y: Math.round(p.y) };
  }

  update(input: Input, dt: number): MapAction {
    this.t += dt;
    const left = input.takePressed('ArrowLeft') || input.takePressed('KeyA') || input.takePressed('ArrowUp') || input.takePressed('KeyW');
    const right = input.takePressed('ArrowRight') || input.takePressed('KeyD') || input.takePressed('ArrowDown') || input.takePressed('KeyS');
    const confirm = input.takeNextPressed() || input.takeJumpPressed();
    const back = input.takePressed('Escape');
    input.takeRestartPressed();
    if (this.view === 'world') {
      if (left) return this.select((this.chapter + CHAPTERS.length - 1) % CHAPTERS.length);
      if (right) return this.select((this.chapter + 1) % CHAPTERS.length);
      if (confirm) return this.enterChapter(this.chapter);
      return null;
    }
    const n = this.current.sites.length;
    if (left) return this.selectSite((this.site + n - 1) % n);
    if (right) return this.selectSite((this.site + 1) % n);
    if (back) {
      this.openWorld();
      return { kind: 'move' };
    }
    if (confirm) return this.enterSite(this.site);
    return null;
  }

  /** Mouse in world units. Hover selects; a click enters. The ribbon picks too. */
  pointer(x: number, y: number, click: boolean): MapAction {
    const hit = this.hitTest(x, y);
    if (hit === null) return null;
    if (this.view === 'world') {
      if (!click) return hit === this.chapter ? null : this.select(hit);
      this.chapter = hit;
      return this.enterChapter(hit);
    }
    if (!click) return hit === this.site ? null : this.selectSite(hit);
    this.site = hit;
    return this.enterSite(hit);
  }

  private hitTest(x: number, y: number): number | null {
    let best: number | null = null;
    let bestD = 12;
    const n = this.stops;
    for (let i = 0; i < n; i++) {
      const spots = [this.ribbonStop(i), this.view === 'world' ? this.worldBadge(i) : this.sitePin(i)];
      for (const p of spots) {
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
    }
    return best;
  }

  private select(i: number): MapAction {
    this.chapter = i;
    return { kind: 'move' };
  }

  private selectSite(i: number): MapAction {
    this.site = i;
    return { kind: 'move' };
  }

  private enterChapter(i: number): MapAction {
    const c = CHAPTERS[i];
    if (!c || !chapterOpen(c)) return { kind: 'closed' };
    this.openChapter(i);
    return { kind: 'move' };
  }

  private enterSite(i: number): MapAction {
    const s = this.current.sites[i];
    if (!s?.level || !this.progress.isOpen(s.level)) return { kind: 'closed' };
    return { kind: 'enter', level: s.level };
  }

  // -------------------------------------------------------------------
  // Drawing, in world units.

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.view === 'world') this.drawWorld(ctx);
    else this.drawChapter(ctx);
    this.drawPanel(ctx);
    this.drawRibbon(ctx);
  }

  private drawWorld(ctx: CanvasRenderingContext2D): void {
    if (!paint(ctx, 'map-world', MAP.x, MAP.y)) {
      drawPaper(ctx);
      drawLand(ctx, worldProject);
      // In the Indian Ocean: the bottom left corner is the title's now.
      drawCompass(ctx, 158, 112);
    }
    // No leg here: from one chapter to the next is a jump in time, not a road.
    CHAPTERS.forEach((c, i) => {
      const p = this.worldBadge(i);
      const selected = i === this.chapter;
      if (!chapterOpen(c) && !selected) {
        // A chapter you cannot enter is a dot. The ribbon still lists it.
        dot(ctx, p.x, p.y, 1.4, LAND_LINE);
        return;
      }
      const a = c.sites[c.anchor] ?? c.sites[0]!;
      const ap = worldProject(a.lon, a.lat);
      if (c.badge) {
        ctx.strokeStyle = INK_SOFT;
        ctx.lineWidth = 0.5;
        line(ctx, ap.x, ap.y, p.x, p.y);
        dot(ctx, ap.x, ap.y, 1, INK_SOFT);
      }
      const open = chapterOpen(c);
      const stamped = chapterStamped(c, this.progress);
      badge(ctx, p.x, p.y, 5.5, stamped ? INK : selected ? ROUTE : CARD, stamped || selected ? CARD : open ? ROUTE : LAND_LINE);
      if (selected) this.pulse(ctx, p.x, p.y, 8);
    });
    this.drawTourist(ctx, this.worldBadge(this.chapter));
  }

  private drawChapter(ctx: CanvasRenderingContext2D): void {
    const c = this.current;
    const proj = chapterProjection(c);
    if (!paint(ctx, chapterArtId(c), MAP.x, MAP.y)) {
      drawPaper(ctx);
      drawLand(ctx, proj);
      drawCompass(ctx, MAP.w - 24, 30);
    }
    // The sites in play order are the ribbon's business. The map shows one leg.
    this.drawLeg(ctx, this.site > 0 ? this.sitePin(this.site - 1) : null, this.sitePin(this.site));
    c.sites.forEach((s, i) => {
      const p = this.sitePin(i);
      const selected = i === this.site;
      if (!this.hasPin(i)) {
        dot(ctx, p.x, p.y, 1.4, LAND_LINE);
        return;
      }
      if (s.pin) {
        const t = this.siteSpot(i);
        ctx.strokeStyle = INK_SOFT;
        ctx.lineWidth = 0.5;
        line(ctx, t.x, t.y, p.x, p.y);
        dot(ctx, t.x, t.y, 1, INK_SOFT);
      }
      const cleared = !!s.level && this.progress.isCleared(s.level);
      badge(ctx, p.x, p.y, 4.5, cleared ? INK : selected ? ROUTE : CARD, selected || cleared ? CARD : s.level ? ROUTE : LAND_LINE);
      if (selected) this.pulse(ctx, p.x, p.y, 7);
    });
    this.drawTourist(ctx, this.sitePin(this.site));
  }

  /**
   * A site is a pin when it has a level, or when it is selected; otherwise it is
   * a dot, and a dot has no room for a number.
   */
  private hasPin(i: number): boolean {
    return i === this.site || !!this.current.sites[i]?.level;
  }

  /** The one dotted line allowed on screen, in a chapter only: the leg you just travelled. */
  private drawLeg(ctx: CanvasRenderingContext2D, from: { x: number; y: number } | null, to: { x: number; y: number }): void {
    if (!from) return;
    ctx.save();
    ctx.setLineDash([1.5, 2.5]);
    ctx.strokeStyle = ROUTE;
    ctx.lineWidth = 0.8;
    line(ctx, from.x, from.y, to.x, to.y);
    ctx.restore();
  }

  private pulse(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
    ctx.strokeStyle = ROUTE;
    ctx.lineWidth = 0.6;
    ctx.globalAlpha = 0.45 + 0.55 * Math.sin(this.t * 4);
    ring(ctx, x, y, r);
    ctx.globalAlpha = 1;
  }

  /** The tourist, dressed for the chapter under the cursor. Chapters not yet designed get the hiker. */
  private drawTourist(ctx: CanvasRenderingContext2D, at: { x: number; y: number }): void {
    const f = tourist(this.current.costume ?? 'hiker', 'idle');
    const bob = Math.round(Math.sin(this.t * 3) * 1);
    blitFacing(ctx, f, at.x - 6, at.y - 22 + bob, 1);
  }

  /** Where the tourist stands, bob included, so the words can keep clear of him. */
  touristRect(): { x: number; y: number; w: number; h: number } {
    const at = this.view === 'world' ? this.worldBadge(this.chapter) : this.sitePin(this.site);
    return { x: at.x - 6, y: at.y - 23, w: 12, h: 18 };
  }

  /** The words printed on the map, as rectangles. For the test that keeps them apart. */
  wordRects(): { x: number; y: number; w: number; h: number }[] {
    if (this.view === 'world') return [TITLE];
    const numbers = this.current.sites.flatMap((_, i) => {
      if (!this.hasPin(i)) return [];
      const p = this.sitePin(i);
      return [{ x: p.x - PIN_DIGIT.w / 2, y: p.y - PIN_DIGIT.h / 2, w: PIN_DIGIT.w, h: PIN_DIGIT.h }];
    });
    return [HEADER, ...numbers];
  }

  // -------------------------------------------------------------------
  // The panel: the chapter's own monument, printed the way a brochure prints one.

  /** The vignette's frame, so the words can be laid out around it. */
  private get vignette(): { x: number; y: number; w: number; h: number } {
    const w = PANEL.w - 20;
    const h = Math.round((w * ART_H) / ART_W);
    return { x: Math.round(PANEL.x + (PANEL.w - w) / 2), y: this.view === 'world' ? 40 : 18, w, h };
  }

  private drawPanel(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = CARD;
    ctx.fillRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h);
    ctx.fillStyle = LAND_LINE;
    ctx.fillRect(PANEL.x, PANEL.y, 0.6, PANEL.h);
    const c = this.current;
    const v = this.vignette;
    ctx.fillStyle = PAPER;
    ctx.fillRect(v.x, v.y, v.w, v.h);
    if (!paint(ctx, monumentArtId(c), v.x, v.y)) {
      drawMonument(ctx, c.monument.art, v.x, v.y, v.w, v.h, INK, PAPER);
    }
    ctx.strokeStyle = INK_SOFT;
    ctx.lineWidth = 0.6;
    ctx.strokeRect(v.x + 0.3, v.y + 0.3, v.w - 0.6, v.h - 0.6);
  }

  // -------------------------------------------------------------------
  // The ribbon: every stop of the tour on one rule, departure at the left.

  private drawRibbon(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = BAND;
    ctx.fillRect(0, RIBBON.y, VIEW_W, RIBBON.h);
    ctx.fillStyle = LAND_LINE;
    ctx.fillRect(0, RIBBON.y, VIEW_W, 0.6);
    const n = this.stops;
    const first = this.ribbonStop(0);
    const last = this.ribbonStop(n - 1);
    // The whole itinerary, then the part of it you have actually walked, over
    // the top. The heavy rule measures progress, never where the cursor is.
    ctx.fillStyle = INK_SOFT;
    ctx.fillRect(first.x - 10, RIBBON.rule - 0.4, last.x - first.x + 20, 0.8);
    const done = this.walked();
    if (done > 0) {
      const here = this.ribbonStop(done - 1);
      ctx.fillStyle = ROUTE;
      ctx.fillRect(first.x - 10, RIBBON.rule - 0.7, here.x - first.x + 10, 1.4);
    }
    // Departure, at the left end, and the last stop, at the right.
    poly(ctx, ROUTE, [
      [first.x - 14, RIBBON.rule - 3.5],
      [first.x - 8, RIBBON.rule],
      [first.x - 14, RIBBON.rule + 3.5],
    ]);
    ctx.fillStyle = INK_SOFT;
    ctx.fillRect(last.x + 8, RIBBON.rule - 3, 3, 6);
    for (let i = 0; i < n; i++) {
      const p = this.ribbonStop(i);
      const selected = i === this.selected;
      const stamped = this.stampedAt(i);
      const open = this.view === 'world' ? chapterOpen(CHAPTERS[i]!) : !!this.current.sites[i]?.level;
      if (stamped) badge(ctx, p.x, p.y, 5.5, INK, INK);
      else if (open) badge(ctx, p.x, p.y, 5.5, CARD, ROUTE);
      else badge(ctx, p.x, p.y, 4.5, BAND, LAND_LINE);
      if (selected) this.pulse(ctx, p.x, p.y, 8);
    }
  }

  /**
   * How far down the itinerary you have got without leaving a gap: the length of
   * the heavy rule on the ribbon, in stops. Clearing a stop out of order still
   * stamps its bead; it does not move the rule.
   */
  walked(): number {
    let i = 0;
    while (i < this.stops && this.stampedAt(i)) i++;
    return i;
  }

  private stampedAt(i: number): boolean {
    if (this.view === 'chapter') return this.siteCleared(i);
    const c = CHAPTERS[i];
    return !!c && chapterStamped(c, this.progress);
  }

  private siteCleared(i: number): boolean {
    const s = this.current.sites[i];
    return !!s?.level && this.progress.isCleared(s.level);
  }

  // -------------------------------------------------------------------
  // Words, in screen space.

  drawText(ctx: CanvasRenderingContext2D, scale: number, lifetimeDeaths: number): void {
    const s = scale;
    const c = this.current;
    const v = this.vignette;
    const px = (PANEL.x + 6) * s;
    const pw = (PANEL.w - 12) * s;
    ctx.save();
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    if (this.view === 'world') {
      labelBox(ctx, s, TITLE.x, TITLE.y, [
        { text: 'LOST TOURIST', font: `bold ${7 * s}px ${FONT}`, color: INK },
        { text: `A guided tour in ${COUNT[CHAPTERS.length] ?? CHAPTERS.length} chapters`, font: `italic ${5 * s}px ${FONT}`, color: INK_SOFT },
      ]);
      // The panel names the chapter; the map and the ribbon do not.
      ctx.font = `${4.5 * s}px ${FONT}`;
      ctx.fillStyle = INK_SOFT;
      ctx.fillText(`CHAPTER ${c.number}`, px, 9 * s);
      let y = 18;
      ctx.font = `bold ${6 * s}px ${FONT}`;
      for (const l of wrap(ctx, c.name.toUpperCase(), pw)) {
        ctx.fillStyle = INK;
        ctx.fillText(l, px, y * s);
        y += 8;
      }
      ctx.font = `italic ${5 * s}px ${FONT}`;
      ctx.fillStyle = INK_SOFT;
      ctx.fillText(c.dates, px, 34 * s);
    } else {
      // A number in every pin, the same as its bead's on the ribbon. Before the
      // header, so a pin under the label is covered whole, number and all.
      ctx.textAlign = 'center';
      ctx.font = `bold ${5 * s}px ${FONT}`;
      for (let i = 0; i < c.sites.length; i++) {
        if (!this.hasPin(i)) continue;
        const p = this.sitePin(i);
        ctx.fillStyle = i === this.site || this.siteCleared(i) ? CARD : ROUTE;
        ctx.fillText(String(i + 1), p.x * s, (p.y + 0.3) * s);
      }
      ctx.textAlign = 'left';
      labelBox(ctx, s, HEADER.x, HEADER.y, [
        { text: `CHAPTER ${c.number} · ${c.name.toUpperCase()}`, font: `bold ${6 * s}px ${FONT}`, color: INK },
        { text: c.dates, font: `italic ${5 * s}px ${FONT}`, color: INK_SOFT },
      ]);
    }

    // The vignette's caption: which of the chapter's own sites this is.
    const monument = chapterMonumentSite(c);
    ctx.font = `italic ${4.5 * s}px ${FONT}`;
    ctx.fillStyle = INK_SOFT;
    ctx.fillText(monument.name, px, (v.y + v.h + 6) * s);

    // What pressing Enter does, and the lifetime counter.
    if (this.view === 'world') {
      const open = chapterOpen(c);
      ctx.font = `${5 * s}px ${FONT}`;
      ctx.fillStyle = open ? ROUTE : INK_SOFT;
      ctx.fillText(open ? 'Enter to visit' : 'Closed', px, 127 * s);
    } else {
      const sel = c.sites[this.site];
      // Built but not reached yet is 'Not yet'; never built is 'Closed'.
      const reached = !!sel?.level && this.progress.isOpen(sel.level);
      const hint = !sel?.level ? 'Closed' : this.progress.isCleared(sel.level) ? 'Enter to visit again' : reached ? 'Enter to visit' : 'Not yet';
      ctx.fillStyle = LAND_LINE;
      ctx.fillRect(px, 100 * s, pw, 0.6 * s);
      ctx.font = `bold ${5.5 * s}px ${FONT}`;
      ctx.fillStyle = INK;
      ctx.fillText(`${this.site + 1}. ${sel?.name ?? ''}`, px, 108 * s);
      ctx.font = `${5 * s}px ${FONT}`;
      ctx.fillStyle = reached ? ROUTE : INK_SOFT;
      ctx.fillText(hint, px, 118 * s);
      ctx.font = `italic ${4.5 * s}px ${FONT}`;
      ctx.fillStyle = INK_SOFT;
      ctx.fillText('Esc for the world', px, 127 * s);
    }
    ctx.font = `${4.5 * s}px ${FONT}`;
    ctx.fillStyle = INK_SOFT;
    ctx.fillText('ALL VISITS', px, 138 * s);
    ctx.font = `bold ${8 * s}px ${FONT}`;
    ctx.fillStyle = INK;
    ctx.fillText(`${lifetimeDeaths} deaths`, px, 147 * s);

    // The ribbon: a number in every bead, and in a chapter, a name under it.
    ctx.textAlign = 'center';
    const n = this.stops;
    for (let i = 0; i < n; i++) {
      const p = this.ribbonStop(i);
      const stamped = this.stampedAt(i);
      const open = this.view === 'world' ? chapterOpen(CHAPTERS[i]!) : !!this.current.sites[i]?.level;
      ctx.font = `bold ${5 * s}px ${FONT}`;
      ctx.fillStyle = stamped ? CARD : open ? ROUTE : INK_SOFT;
      ctx.fillText(String(i + 1), p.x * s, (p.y + 0.3) * s);
      if (this.view === 'chapter') {
        const site = this.current.sites[i];
        if (!site) continue;
        ctx.font = `${i === this.site ? 'bold ' : ''}${4.5 * s}px ${FONT}`;
        ctx.fillStyle = site.level ? INK : INK_SOFT;
        ctx.fillText(site.name, p.x * s, 176 * s);
      }
    }
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------

/** Break a line to fit a width, at most two lines, the second one clipped. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  if (ctx.measureText(text).width <= maxW) return [text];
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (line && ctx.measureText(next).width > maxW) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

function drawPaper(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = PAPER;
  ctx.fillRect(MAP.x, MAP.y, MAP.w, MAP.h);
  // No brochure fold any more: the sheet is two thirds of the screen, and a
  // crease down the middle of it was one more line pretending to mean something.
  ctx.strokeStyle = LAND_LINE;
  ctx.lineWidth = 0.6;
  ctx.strokeRect(MAP.x + 2.5, MAP.y + 2.5, MAP.w - 5, MAP.h - 5);
}

function drawLand(ctx: CanvasRenderingContext2D, proj: Projection): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(MAP.x + 3, MAP.y + 3, MAP.w - 6, MAP.h - 6);
  ctx.clip();
  ctx.lineJoin = 'round';
  ctx.lineWidth = 0.5;
  // Every coastline in one path, so the fill and the line are laid down once
  // rather than once per island. A hairline at this many points is what a
  // brochure prints: the shape does the work, not the weight of the ink.
  ctx.fillStyle = LAND_FILL;
  ctx.strokeStyle = LAND_LINE;
  ctx.beginPath();
  trace(ctx, LAND, proj, true);
  ctx.fill();
  ctx.stroke();
  // Inland water, in the sea's colour, over the land it sits in.
  ctx.fillStyle = PAPER;
  ctx.strokeStyle = '#7d93a0';
  ctx.beginPath();
  trace(ctx, LAKES, proj, true);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#6f8fa0';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  trace(ctx, RIVERS, proj, false);
  ctx.stroke();
  ctx.restore();
}

/** Lay a list of rings into the current path. */
function trace(ctx: CanvasRenderingContext2D, rings: Polygon[], proj: Projection, close: boolean): void {
  for (const ring of rings) {
    ring.forEach(([lon, lat], i) => {
      const p = proj(lon, lat);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    if (close) ctx.closePath();
  }
}

function drawCompass(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = INK_SOFT;
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 0.5;
  ring(ctx, 0, 0, 8);
  ctx.beginPath();
  ctx.moveTo(0, -9);
  ctx.lineTo(1.8, 0);
  ctx.lineTo(0, 9);
  ctx.lineTo(-1.8, 0);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-9, 0);
  ctx.lineTo(0, 1.4);
  ctx.lineTo(9, 0);
  ctx.lineTo(0, -1.4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = ROUTE;
  ctx.beginPath();
  ctx.moveTo(0, -9);
  ctx.lineTo(1.8, 0);
  ctx.lineTo(-1.8, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function line(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number): void {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

function poly(ctx: CanvasRenderingContext2D, color: string, pts: [number, number][]): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.fill();
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ring(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

function badge(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string, stroke: string): void {
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

interface Line {
  text: string;
  font: string;
  color: string;
}

/** A museum label: cream box, rule at the bottom, lines of text. x, y in world units. */
function labelBox(ctx: CanvasRenderingContext2D, s: number, x: number, y: number, lines: Line[]): void {
  let w = 0;
  for (const l of lines) {
    ctx.font = l.font;
    w = Math.max(w, ctx.measureText(l.text).width);
  }
  const padX = 4 * s;
  const lineH = 7 * s;
  const boxW = w + padX * 2;
  const boxH = lines.length * lineH + 4 * s;
  ctx.fillStyle = 'rgba(243, 234, 212, 0.96)';
  ctx.fillRect(x * s, y * s, boxW, boxH);
  ctx.fillStyle = INK_SOFT;
  ctx.fillRect(x * s, y * s + boxH - s * 0.5, boxW, s * 0.5);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  lines.forEach((l, i) => {
    ctx.font = l.font;
    ctx.fillStyle = l.color;
    ctx.fillText(l.text, x * s + padX, y * s + 2 * s + lineH * (i + 0.5));
  });
}
