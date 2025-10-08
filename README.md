# Poems by Warwick Allen

These are shared publicly at [Fragments & Unity](https://fragments-and-unity.blogspot.com/) and [GitHub Pages](https://warwick-allen.github.io/poems/).

## Repository Structure

This repository uses a YAML-based build system to generate HTML files:

- **`src/`** - Source code and content
  - **`poems/`** - Source files for all poems (one file per poem)
    - `.yaml` files - YAML format (see `docs/YAML-SCHEMA.md`)
    - `.poem` files - Poem format (see `docs/POEM-SYNTAX.md` and `poem-syntax.ebnf`)
    - Files beginning with `_` (e.g., `_shared.yaml`, `_example.poem`) are ignored by the build process
  - **`templates/`** - Pug template for rendering poems
  - **`tools/`** - Build scripts (including `.poem` to YAML converter)
- **`public/`** - Generated HTML files and assets
- **`docs/`** - Documentation files
- **`editors/`** - Editor integrations (Vim syntax highlighting)
- **`examples/`** - Example files
- **`scripts/`** - Shell scripts for setup and maintenance

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
./scripts/setup-linux.sh npm run build

# Build and start local development server
./scripts/setup-linux.sh npm run build:all

# Inject CSS into Blogger template
./scripts/setup-linux.sh npm run build:blogger

# View at http://localhost:8080
```

The `scripts/setup-linux.sh` script ensures the correct Linux Node.js and npm versions are used.

### Adding a New Poem

You can create poems in either YAML or Poem format:

#### Using YAML Format
1. Create a new YAML file in the `src/poems/` directory (see `docs/YAML-SCHEMA.md` for format)
2. Run `npm run build` to generate the HTML
3. Commit both the YAML source and generated HTML files

#### Using Poem Format
1. Create a new `.poem` file in the `src/poems/` directory (see `docs/POEM-SYNTAX.md` for format)
2. Convert to YAML: `node src/tools/poem-to-yaml.js src/poems/your-poem.poem`
3. Run `npm run build` to generate the HTML
4. Commit the `.poem` file, generated YAML, and HTML files

**Note**: The Poem format supports variable substitution and other features detailed in `docs/POEM-SYNTAX.md`.

### Editing an Existing Poem

1. Edit the source file (`.yaml` or `.poem`) in the `src/poems/` directory
2. If editing a `.poem` file, regenerate the YAML: `node src/tools/poem-to-yaml.js src/poems/your-poem.poem`
3. Run `npm run build` to regenerate the HTML
4. Commit the changes

### Converting Poem Files to YAML

The `poem-to-yaml.js` tool converts `.poem` files to YAML format:

```bash
# Convert a single file
node src/tools/poem-to-yaml.js src/poems/your-poem.poem src/poems/your-poem.yaml

# Convert a single file (output defaults to same name with .yaml extension)
node src/tools/poem-to-yaml.js src/poems/your-poem.poem

# Convert all .poem files in the src/poems/ directory
node src/tools/poem-to-yaml.js --all
```

The converter fully supports all features including variable substitution, markup, literal blocks, and all structural elements defined in `docs/POEM-SYNTAX.md`.

**Shared Variables**: The converter automatically prepends `.shared.poem` (if it exists in the `src/poems/` directory) to each poem file before processing. This allows you to define common variables (like disclaimer text) once and use them across all poems.

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

- **`docs/YAML-SCHEMA.md`** - Detailed schema for poem YAML files
- **`docs/POEM-SYNTAX.md`** - Complete specification for the `.poem` file format
- **`docs/POEM-TO-YAML.md`** - Documentation for the poem-to-yaml converter
- **`poem-syntax.ebnf`** - Formal EBNF grammar for the Poem file format
- **`docs/BUILD.md`** - GitHub Pages deployment information
- **`docs/VIM-SYNTAX.md`** - Vim syntax highlighting documentation
- **`docs/QUICKSTART-VIM.md`** - Quick start guide for Vim users
