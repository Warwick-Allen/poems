# Poems by Warwick Allen

These are shared publicly at [Fragments & Unity](https://fragments-and-unity.blogspot.com/) and [GitHub Pages](https://warwick-allen.github.io/poems/).

## Repository Structure

This repository uses a YAML-based build system to generate HTML files:

- **`poems/`** - Source files for all poems (one file per poem)
  - `.yaml` files - YAML format (see `poems/YAML-SCHEMA.md`)
  - `.poem` files - Poem format (see `POEM-SYNTAX.md` and `poem-syntax.ebnf`)
  - Files beginning with `_` (e.g., `_shared.yaml`, `_example.poem`) are ignored by the build process
- **`public/`** - Generated HTML files and assets
- **`templates/`** - Pug template for rendering poems
- **`tools/`** - Build scripts (including `.poem` to YAML converter)
- **`.github/workflows/`** - GitHub Actions for automated deployment

## Development

### Prerequisites

```bash
npm install
```

### Building Poems

#### On Windows
```bash
# Build all HTML files from YAML sources
npm run build

# Build and start local development server
npm run build:all

# Inject CSS into Blogger template
npm run build:blogger

# View at http://localhost:8080
```

#### On Linux/WSL
If you encounter issues with npm using Windows binaries, use the setup script:

```bash
# Build all HTML files from YAML sources
./setup-linux.sh npm run build

# Build and start local development server
./setup-linux.sh npm run build:all

# Inject CSS into Blogger template
./setup-linux.sh npm run build:blogger

# View at http://localhost:8080
```

The `setup-linux.sh` script ensures the correct Linux Node.js and npm versions are used.

### Adding a New Poem

1. Create a new YAML file in the `poems/` directory (see `poems/YAML-SCHEMA.md` for format)
2. Run `npm run build` to generate the HTML
3. Commit both the YAML source and generated HTML files

### Editing an Existing Poem

1. Edit the YAML file in the `poems/` directory
2. Run `npm run build` to regenerate the HTML
3. Commit the changes

## Local Viewing

To view the poems locally without building:
1. Open [`public/index.html`](public/index.html) in your web browser
2. Or run `npm start` to start a local server at http://localhost:8080

## Blogger Template Integration

The repository includes functionality to inject custom CSS into a Blogger template for the [Fragments & Unity blog](https://fragments-and-unity.blogspot.com/):

```bash
npm run build:blogger
```

This script:
- Reads CSS from `public/styles.css`
- Injects it into `public/fragments-and-unity.template.html`
- Replaces content between `/* ~~ CUSTOM CSS START ~~ */` and `/* ~~ CUSTOM CSS END ~~ */` delimiters
- Provides error handling for missing files or delimiters

The updated template can then be uploaded to Blogger to apply the custom styling.

## Date Format

All poem YAML files use the ISO date format (`yyyy-mm-dd`, e.g., `2015-05-04`) for the `date` field. The build system automatically converts these dates to the display format (`DayOfWeek, DD Month YYYY`) in the generated HTML files.

## Documentation

- **`poems/YAML-SCHEMA.md`** - Detailed schema for poem YAML files
- **`POEM-SYNTAX.md`** - Complete specification for the `.poem` file format
- **`poem-syntax.ebnf`** - Formal EBNF grammar for the Poem file format
- **`REFACTORING-SUMMARY.md`** - Technical details about the build system
- **`BUILD.md`** - GitHub Pages deployment information
