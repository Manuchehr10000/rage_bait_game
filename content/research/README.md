# Research

The historical research that determines the arc of the game lives here. Drop the
research as Markdown files in this folder. It is the source of truth for:

- which chapters exist and in what order, and which five sites make up each chapter
- the historical relics and features each level is built from
- the tourist's costume for each chapter

**Rule for anyone designing a chapter or a level, human or otherwise:** read every file in
this folder first. A chapter, level, beat, asset note or costume that contradicts the
research is wrong, and the research is corrected here before the game is changed, never
the other way round. When the research and an existing level disagree, say so and fix
the level.

Suggested layout, one file per topic, but any Markdown is fine:

```
content/research/
  README.md          this file
  arc.md             the chapters in order, why, and the sites in each
  ch02-egypt.md      per-chapter detail: sites, relics, costume, sources
  ch02-....md
```

Slugs in the research (`ch02_egypt`, `abu_simbel`) name sites. Paths and ids in the
repository use the same words with hyphens (`ch02-egypt`, `abu-simbel`), because URL
hashes and asset ids are hyphenated. The research stays authoritative on the words.

The per-level history the designer reads (`LEVEL.md`, the asset notes, `easter-eggs.md`)
is derived from this research and must cite it where it can.
