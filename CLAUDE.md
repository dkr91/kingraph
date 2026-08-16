# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
# Run all tests
yarn test
# or
npm test

# Run a single test file
node_modules/.bin/tape lib/slugify.test.js

# Run the CLI locally
node bin/kingraph examples/simpsons.yml > out.svg
node bin/kingraph examples/simpsons.yml -F png > out.png
node bin/kingraph examples/simpsons.yml -F dot
```

## Architecture

kingraph is a CLI tool that converts a YAML family tree definition into Graphviz DOT format, then renders it to SVG or PNG via `viz.js` and `svg2png`.

**Pipeline:** YAML input → `normalize` → `render_graph` (produces DOT) → `viz.js` (produces SVG) → optionally `to_png` (produces PNG)

The top-level `render.js` orchestrates this pipeline based on the requested `format` option (`dot`, `svg`, `png`, `png-image`).

### Key modules

- `lib/render_graph.js` — the core: walks the normalized data and emits a Graphviz DOT string. The graph uses invisible subgraphs (`:family`) to cluster parents and children around hidden intermediate nodes (`union_*` and `siblings_*`) that represent the union and sibling bar, respectively. This is the indirection that makes family tree layout work in a directed graph engine.
- `lib/apply_style.js` — merges default styles (`lib/defaults/styles.js`) with any user-defined `styles:` block, then maps the result to GraphViz attribute strings. Style resolution order: `before` overrides → default styles → user styles → `after` overrides.
- `lib/normalize.js` — currently a thin pass-through; reserved for future data normalization.
- `lib/join.js` — recursive array flattener/joiner used to build indented DOT output from nested JS arrays. `{ indent: [...] }` objects produce indented blocks.
- `lib/slugify.js` / `lib/id_generator.js` — helpers for generating unique DOT node/subgraph identifiers from path arrays.

### YAML input schema

The input YAML has three top-level keys:

- `families` — array of family objects, each with optional `parents`, `children`, `parents2` (step/adoptive), `children2` (adoptive/illegitimate), `house` (draws a labeled box), and nested `families`.
- `people` — map of person ID to metadata (`name`, `fullname`, `links`, `class`).
- `styles` — map of CSS-like class names to GraphViz attribute objects, merged with the defaults in `lib/defaults/styles.js`.

See `docs/schema.md` for the full schema reference and `examples/` for representative inputs.
