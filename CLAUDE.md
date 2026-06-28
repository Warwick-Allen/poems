# Fragments & Unity — Poems by Warwick Allen

Personal poem collection built with the [poetic](https://github.com/warwickallen/poetic) framework.
Published at <https://warwick-allen.github.io/fragments-and-unity/> and Blogger.

This VS Code workspace has two roots: this repo (poems) and `../Code/poetic` (the framework).

## What this repo is

Source poems → build pipeline → generated HTML in `public/`. Do not edit `public/` or
`src/poems/yaml/` directly; they are build artefacts.

## Directory map

```
poems/               ← symlink → src/poems/poem/   (edit poems here)
src/poems/poem/      ← canonical .poem source files (same dir, two paths)
src/poems/yaml/      ← generated YAML (build artefact, do not edit)
src/tools/           ← build scripts (Node.js)
src/templates/       ← Pug template for HTML output
public/              ← generated HTML + CSS (build artefact, do not edit)
raw/                 ← generated plain-text versions (build artefact)
docs/                ← documentation (YAML-SCHEMA.md, POEM-SYNTAX.md, etc.)
scripts/             ← shell helpers (sync-framework, setup-linux, etc.)
editors/             ← Vim syntax highlighting
```

## Build pipeline

```
.poem → (poem-to-yaml.js) → src/poems/yaml/*.yaml → (build-poems.js) → public/*.html
      → (poem-to-raw.js)  → raw/*
```

Full build: `npm run build`  
Build + serve: `npm run build:all` → <http://localhost:8080>

**On WSL/Linux**, npm may resolve Windows binaries. Wrap commands:
```bash
./scripts/setup-linux.sh npm run build
```

## Poem file format

Files live in `src/poems/poem/` (accessible as `poems/` from the repo root).

```
Title of the Poem
YYYY-MM-DD

Stanza one line one
Stanza one line two

Stanza two line one
```

- Line 1: title
- Line 2: ISO date (`YYYY-MM-DD`)
- Line 3: blank
- Remaining lines: poem body (blank lines = stanza breaks)
- Files starting with `_` or `.` are ignored by the build (use for drafts/templates)
- `.shared.poem` in `src/poems/poem/` is auto-prepended to every poem before processing
  (defines shared variables like disclaimer text); **user-owned — not overwritten by sync**

See `docs/POEM-SYNTAX.md` for the full syntax (variables, markup, embedded languages, etc.)
and `poem-syntax.ebnf` for the formal grammar.

## Adding or editing a poem

1. Edit/create the `.poem` file in `src/poems/poem/` (or equivalently `poems/`)
2. Run `npm run build` (or `./scripts/setup-linux.sh npm run build` on Linux/WSL)
3. Commit `.poem` file, the generated `src/poems/yaml/`, `public/`, and `raw/` files

## Framework sync

The build tools in `src/tools/`, `src/templates/`, `scripts/`, and `editors/` are owned by the
upstream `poetic` framework. Sync them with:
```bash
scripts/sync-framework.sh          # uses version in .poetic-version
scripts/sync-framework.sh --ref main   # pull latest
```

Do not hand-edit files that are synced from the framework — changes will be overwritten.
Exceptions — files that are **user-owned** and never overwritten by sync:
- `src/poems/poem/.shared.poem` — shared variables (author name, etc.)
- `public/custom.css` — personal CSS customisations (add styles here)
- `.poetic-config` — personal build settings (committed to this repo; see below)

`public/poetic.css` is framework-owned (synced). To stop it being overwritten (e.g. if you
pin a local tweak), add it to `skip_paths` in `.poetic-config`:
```
skip_paths=public/poetic.css
```

`.poetic-config` is committed to this repo so CI picks it up when building for GitHub Pages.
Supported keys: `favicon`, `subtitle`, `skip_paths`, `auto_sync`, `sync_schedule`.
See `docs/BUILD.md` for full details.

## Key docs

| File | Contents |
|------|----------|
| `docs/POEM-SYNTAX.md` | Complete `.poem` format spec |
| `docs/YAML-SCHEMA.md` | YAML poem schema |
| `docs/POEM-TO-YAML.md` | Converter docs |
| `docs/BUILD.md` | GitHub Pages deployment |
| `poem-syntax.ebnf` | Formal EBNF grammar |
