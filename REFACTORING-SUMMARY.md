# Poems Repository Refactoring Summary

## Overview
The poems repository has been successfully refactored to use YAML source files with a Node.js/Pug build system.

## What Was Done

### 1. Directory Structure
- Created `poems/` source directory containing all poem YAML files (58 poems)
- Maintained `public/` directory for generated HTML output
- Created `templates/` directory for Pug templates

### 2. YAML Schema
All poems are now defined in YAML format with the following structure:
- **Required fields**: `title`, `author`, `date`, `slug`
- **Content**: Either `body` (plain poems) or `segments` (songs with verse/chorus labels)
- **Optional fields**: `audio` (Audiomack and Suno links), `analysis` (none, single, or dual)

See `poems/YAML-SCHEMA.md` for detailed schema documentation.

### 3. CSS Extraction
- Extracted custom CSS from `fragments-and-unity.template.html`
- Created `public/styles.css` as a standalone stylesheet
- All HTML files now reference this external CSS file

### 4. Build System

#### Scripts Created:
1. **`tools/build-poems.js`** - Generates individual poem HTML files from YAML sources
2. **`tools/build-all-poems.js`** - Updated to call `build-poems.js`, then generates `all-poems.html` and `index.html`
3. **`tools/convert-html-to-yaml.js`** - Helper script for converting existing HTML to YAML (used once for migration)

#### Package Dependencies:
- `pug` (^3.0.2) - Templating engine
- `js-yaml` (^4.1.0) - YAML parser

#### NPM Scripts:
- `npm run build:poems` - Build individual poems
- `npm run build` - Full build (poems + index + all-poems)
- `npm run build:all` - Build and start local server

### 5. Templates
Created `templates/poem.pug` - Single template used for all poem HTML generation, supporting:
- Plain poem bodies
- Segmented poems (verses, choruses, etc.)
- Optional audio embeds
- Optional analysis sections (single or dual: synopsis/full)

### 6. GitHub Actions
Updated `.github/workflows/build-poems.yml` to:
- Install npm dependencies
- Run the full build process
- Verify all artifacts (individual poems, index.html, all-poems.html, styles.css)
- Deploy to GitHub Pages

## File Counts
- **YAML source files**: 58 poems
- **Generated HTML files**: 60 total (58 poems + index.html + all-poems.html)
- **Templates**: 1 (poem.pug)
- **CSS files**: 1 (styles.css)

## Build Process Flow
1. `npm run build` is executed
2. `build-poems.js` reads all YAML files from `poems/`
3. For each YAML file, Pug template generates corresponding HTML in `public/`
4. `build-all-poems.js` then:
   - Reads all generated poem HTML files
   - Generates `public/all-poems.html` (concatenated view with TOC)
   - Updates `public/index.html` with poem list and metadata

## Verification
All 58 poems have been converted and successfully build without errors. The generated HTML files maintain the exact same structure and styling as the original files, ensuring no visible changes in the rendered output.

## Usage

### Building Locally
```bash
# Install dependencies (one time)
npm install

# Build all poems
npm run build

# Build and start local server
npm run build:all
```

### Adding New Poems
1. Create a new YAML file in `poems/` directory following the schema
2. Run `npm run build` to generate HTML
3. Commit both the YAML source and generated HTML

### Editing Poems
1. Edit the YAML file in `poems/` directory
2. Run `npm run build` to regenerate HTML
3. Commit changes

## Technical Notes
- The build system preserves HTML markup in poem bodies where needed for styling
- Song segments are stored as YAML arrays with labels and lines
- Analysis content is stored as raw HTML to preserve formatting
- All IDs and slugs are automatically generated from the slug field
- The Pug template handles all three analysis scenarios (none, single, dual)


