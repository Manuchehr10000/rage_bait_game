# favicon — the tourist's head

Site chrome, not level art: this is the icon in the browser tab, the bookmark bar and
the phone home screen. It is not painted. It is generated at build time from
`tools/favicon.mjs`, which holds the grid and the palette, the same way every sprite in
the game is a grid and a palette.

**16 x 16, authored at that size.** The in-game head is 12 px wide inside a 12 x 16
sprite; shrunk into a tab it loses the brim and the eye, and a hat you cannot see is not
a costume joke. So the same head is redrawn a third larger, in the same colours, in the
same flat unshaded style, facing the same way he faces in every level.

## Must be right

- **The costume is chapter 1's hiker**, and the colours are the ones in `HIKER` in
  `src/render/procedural.ts`: bucket hat `#b5a06a`, fleece `#e0632c`, skin `#e6b48c`,
  strap `#3c4a5a`, outline `#2b1d10`. `tests/favicon.spec.ts` fails if they drift apart.
- **He faces right**, because he walks left to right and the camera never scrolls back.
- **Flat colour, no shading, no anti-aliasing.** Nothing in this game has a gradient.
- **The background is `#0b0a08`**, the page background, so the icon is a tile of the
  game rather than a cut-out. It also keeps the dark outline from vanishing into a dark
  browser theme.

## Deliberately wrong

- **The headlamp is lit.** In game the lamp is off until he walks into the dark, and the
  lens is grey. There is no cave in a browser tab, and an unlit lamp at this size is a
  grey pixel that reads as nothing. The lit colour is not invented: it is the game's own
  lamp wash, `rgba(255, 244, 190, 0.45)`, which is what the level draws over the lens.
- **The proportions are not the sprite's.** The head is larger relative to the shoulders
  than it is in game, because at 16 px a correctly proportioned figure is four pixels of
  face. This is the only place in the project where the tourist is off-model, and it is
  off-model on purpose: it is an icon of him, not him.

## Not in it

No site, no relic, no period detail. The tab icon is the tourist alone — the one thing
that is in every chapter — so it never has to change when the chapter does.
