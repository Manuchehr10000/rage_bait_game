/**
 * The tour map. Two views: the world, with one numbered badge per chapter and
 * a dotted route through them in order; and a chapter, zoomed on its five sites
 * with the route between them. Painted art replaces the drawn map when it
 * exists (`map-world`, `map-chNN-slug`); the badges, route, pins and the
 * tourist are always drawn on top, and every word is drawn in screen space so
 * it stays crisp.
 */

import { paint } from '../engine/assets';
import type { Input } from '../engine/input';
import type { Progress } from '../engine/progress';
import { VIEW_H, VIEW_W } from '../engine/types';
import { blitFacing, frameOf } from '../render/frame';
import { TOURIST_FRAMES } from '../render/procedural';
import { CHAPTERS, chapterOpen, type Chapter } from './atlas';
import { LAND, RIVERS } from './geo';

export type MapView = 'world' | 'chapter';
export type MapAction = { kind: 'enter'; level: string } | { kind: 'closed' } | { kind: 'move' } | null;

const FONT = 'Georgia, "Times New Roman", serif';
const INK = '#2b2116';
const INK_SOFT = '#6b5a3e';
const ROUTE = '#8e2f2a';
const PAPER = '#e6d8b4';
const PAPER_LINE = '#d3c299';
const LAND_FILL = '#cbb98d';
const LAND_LINE = '#8a7250';

/** The world map's frame in degrees. Equirectangular, which is what brochures use. */
const WORLD = { lon0: -115, lon1: 150, lat0: 65, lat1: -40 };

interface Projection {
  (lon: number, lat: number): { x: number; y: number };
}

const worldProject: Projection = (lon, lat) => ({
  x: ((lon - WORLD.lon0) / (WORLD.lon1 - WORLD.lon0)) * VIEW_W,
  y: ((WORLD.lat0 - lat) / (WORLD.lat0 - WORLD.lat1)) * VIEW_H,
});

/** Fit a chapter's sites into the view with room for the header. */
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
  const pad = span * 0.2 + 0.4;
  const s = Math.min((VIEW_W - 60) / (lon1 - lon0 + pad * 2), (VIEW_H - 56) / (lat1 - lat0 + pad * 2));
  const cx = (lon0 + lon1) / 2;
  const cy = (lat0 + lat1) / 2;
  return (lon, lat) => ({ x: VIEW_W / 2 + (lon - cx) * s, y: VIEW_H / 2 + 10 + (cy - lat) * s });
}

function chapterArtId(c: Chapter): string {
  return `map-ch${String(c.number).padStart(2, '0')}-${c.slug}`;
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

  /** Mouse in world units. Hover selects; a click enters. */
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
    const n = this.view === 'world' ? CHAPTERS.length : this.current.sites.length;
    for (let i = 0; i < n; i++) {
      const p = this.view === 'world' ? this.worldBadge(i) : this.sitePin(i);
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestD) {
        bestD = d;
        best = i;
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
    if (!s?.level) return { kind: 'closed' };
    return { kind: 'enter', level: s.level };
  }

  // -------------------------------------------------------------------
  // Drawing, in world units.

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.view === 'world') this.drawWorld(ctx);
    else this.drawChapter(ctx);
  }

  private drawWorld(ctx: CanvasRenderingContext2D): void {
    if (!paint(ctx, 'map-world', 0, 0)) {
      drawPaper(ctx);
      ctx.strokeStyle = PAPER_LINE;
      ctx.lineWidth = 0.5;
      for (let lon = -90; lon <= 150; lon += 30) {
        const p = worldProject(lon, 0);
        line(ctx, p.x, 0, p.x, VIEW_H);
      }
      for (let lat = -30; lat <= 60; lat += 30) {
        const p = worldProject(0, lat);
        line(ctx, 0, p.y, VIEW_W, p.y);
      }
      drawLand(ctx, worldProject);
      drawCompass(ctx, 24, 150);
    }
    // The route, chapter to chapter.
    ctx.save();
    ctx.setLineDash([1.5, 2.5]);
    ctx.strokeStyle = ROUTE;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    CHAPTERS.forEach((_, i) => {
      const p = this.worldBadge(i);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.restore();
    // Badges.
    CHAPTERS.forEach((c, i) => {
      const p = this.worldBadge(i);
      const a = c.sites[c.anchor] ?? c.sites[0]!;
      const ap = worldProject(a.lon, a.lat);
      if (c.badge) {
        ctx.strokeStyle = INK_SOFT;
        ctx.lineWidth = 0.5;
        line(ctx, ap.x, ap.y, p.x, p.y);
        dot(ctx, ap.x, ap.y, 1, INK_SOFT);
      }
      const open = chapterOpen(c);
      const selected = i === this.chapter;
      badge(ctx, p.x, p.y, 5.5, selected ? ROUTE : open ? '#f3ead4' : '#d9cdb0', selected ? '#f3ead4' : open ? ROUTE : LAND_LINE);
      if (selected) {
        ctx.strokeStyle = ROUTE;
        ctx.lineWidth = 0.6;
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(this.t * 4);
        ring(ctx, p.x, p.y, 8);
        ctx.globalAlpha = 1;
      }
    });
    this.drawTourist(ctx, this.worldBadge(this.chapter));
  }

  private drawChapter(ctx: CanvasRenderingContext2D): void {
    const c = this.current;
    const proj = chapterProjection(c);
    if (!paint(ctx, chapterArtId(c), 0, 0)) {
      drawPaper(ctx);
      drawLand(ctx, proj);
      drawCompass(ctx, VIEW_W - 24, 34);
    }
    ctx.save();
    ctx.setLineDash([1.5, 2.5]);
    ctx.strokeStyle = ROUTE;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    c.sites.forEach((_, i) => {
      const p = this.siteSpot(i);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.restore();
    c.sites.forEach((s, i) => {
      const p = this.sitePin(i);
      if (s.pin) {
        const t = this.siteSpot(i);
        ctx.strokeStyle = INK_SOFT;
        ctx.lineWidth = 0.5;
        line(ctx, t.x, t.y, p.x, p.y);
        dot(ctx, t.x, t.y, 1, INK_SOFT);
      }
      const cleared = !!s.level && this.progress.isCleared(s.level);
      const open = !!s.level;
      const selected = i === this.site;
      const fill = cleared ? INK : open ? '#f3ead4' : '#d9cdb0';
      const stroke = open ? ROUTE : LAND_LINE;
      badge(ctx, p.x, p.y, 4, fill, stroke);
      if (!open) {
        ctx.strokeStyle = LAND_LINE;
        ctx.lineWidth = 0.8;
        line(ctx, p.x - 3, p.y + 3, p.x + 3, p.y - 3);
      }
      if (selected) {
        ctx.strokeStyle = ROUTE;
        ctx.lineWidth = 0.6;
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(this.t * 4);
        ring(ctx, p.x, p.y, 6.5);
        ctx.globalAlpha = 1;
      }
    });
    this.drawTourist(ctx, this.sitePin(this.site));
  }

  private drawTourist(ctx: CanvasRenderingContext2D, at: { x: number; y: number }): void {
    const f = frameOf('tourist', 0, TOURIST_FRAMES.idle);
    const bob = Math.round(Math.sin(this.t * 3) * 1);
    blitFacing(ctx, f, at.x - 6, at.y - 22 + bob, 1);
  }

  // -------------------------------------------------------------------
  // Words, in screen space.

  drawText(ctx: CanvasRenderingContext2D, scale: number, lifetimeDeaths: number): void {
    const s = scale;
    ctx.save();
    ctx.textBaseline = 'middle';
    if (this.view === 'world') {
      // Badge numbers.
      CHAPTERS.forEach((c, i) => {
        const p = this.worldBadge(i);
        ctx.font = `bold ${5 * s}px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.fillStyle = i === this.chapter ? '#f3ead4' : chapterOpen(c) ? ROUTE : INK_SOFT;
        ctx.fillText(String(c.number), p.x * s, (p.y + 0.3) * s);
      });
      // Title.
      labelBox(ctx, s, 6, 6, [
        { text: 'LOST TOURIST', font: `bold ${7 * s}px ${FONT}`, color: INK },
        { text: 'A guided tour in twelve chapters', font: `italic ${5 * s}px ${FONT}`, color: INK_SOFT },
      ]);
      // The selected chapter.
      const c = this.current;
      const open = chapterOpen(c);
      labelBox(ctx, s, 6, VIEW_H - 30, [
        { text: `${c.number}. ${c.name.toUpperCase()}`, font: `bold ${5.5 * s}px ${FONT}`, color: INK },
        { text: c.dates, font: `${5 * s}px ${FONT}`, color: INK_SOFT },
        { text: open ? 'Enter to visit' : 'Closed', font: `italic ${5 * s}px ${FONT}`, color: open ? ROUTE : INK_SOFT },
      ]);
    } else {
      const c = this.current;
      labelBox(ctx, s, 6, 6, [
        { text: `CHAPTER ${c.number} · ${c.name.toUpperCase()}`, font: `bold ${6 * s}px ${FONT}`, color: INK },
        { text: c.dates, font: `italic ${5 * s}px ${FONT}`, color: INK_SOFT },
      ]);
      c.sites.forEach((site, i) => {
        const p = this.sitePin(i);
        const right = site.label ? site.label === 'right' : i % 2 === 0;
        ctx.textAlign = right ? 'left' : 'right';
        ctx.font = `${i === this.site ? 'bold ' : ''}${5 * s}px ${FONT}`;
        ctx.fillStyle = site.level ? INK : INK_SOFT;
        const text = site.level ? site.name : `${site.name} (closed)`;
        ctx.strokeStyle = 'rgba(230, 216, 180, 0.9)';
        ctx.lineWidth = s * 1.5;
        ctx.lineJoin = 'round';
        const tx = (p.x + (right ? 7 : -7)) * s;
        ctx.strokeText(text, tx, p.y * s);
        ctx.fillText(text, tx, p.y * s);
      });
      const sel = c.sites[this.site];
      const hint = sel?.level ? (this.progress.isCleared(sel.level) ? 'Enter to visit again' : 'Enter to fall in') : 'Closed';
      labelBox(ctx, s, 6, VIEW_H - 22, [
        { text: `${this.site + 1}. ${sel?.name ?? ''}`, font: `bold ${5.5 * s}px ${FONT}`, color: INK },
        { text: `${hint}   ·   Esc for the map`, font: `italic ${5 * s}px ${FONT}`, color: sel?.level ? ROUTE : INK_SOFT },
      ]);
    }
    // The passport stamp.
    ctx.textAlign = 'right';
    ctx.font = `${5 * s}px ${FONT}`;
    ctx.fillStyle = INK_SOFT;
    ctx.fillText('ALL VISITS', (VIEW_W - 6) * s, (VIEW_H - 16) * s);
    ctx.font = `bold ${8 * s}px ${FONT}`;
    ctx.fillStyle = INK;
    ctx.fillText(`${lifetimeDeaths} deaths`, (VIEW_W - 6) * s, (VIEW_H - 8) * s);
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------

function drawPaper(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // A brochure fold, and a little wear at the edges.
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(VIEW_W / 2 - 1, 0, 2, VIEW_H);
  ctx.strokeStyle = LAND_LINE;
  ctx.lineWidth = 0.6;
  ctx.strokeRect(2.5, 2.5, VIEW_W - 5, VIEW_H - 5);
}

function drawLand(ctx: CanvasRenderingContext2D, proj: Projection): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(3, 3, VIEW_W - 6, VIEW_H - 6);
  ctx.clip();
  ctx.fillStyle = LAND_FILL;
  ctx.strokeStyle = LAND_LINE;
  ctx.lineWidth = 0.7;
  ctx.lineJoin = 'round';
  for (const poly of LAND) {
    ctx.beginPath();
    poly.forEach(([lon, lat], i) => {
      const p = proj(lon, lat);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.strokeStyle = '#6f8fa0';
  ctx.lineWidth = 0.8;
  for (const river of RIVERS) {
    ctx.beginPath();
    river.forEach(([lon, lat], i) => {
      const p = proj(lon, lat);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
  }
  ctx.restore();
}

function drawCompass(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = INK_SOFT;
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 0.5;
  ring(ctx, 0, 0, 9);
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(2, 0);
  ctx.lineTo(0, 10);
  ctx.lineTo(-2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(0, 1.5);
  ctx.lineTo(10, 0);
  ctx.lineTo(0, -1.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = ROUTE;
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(2, 0);
  ctx.lineTo(-2, 0);
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
