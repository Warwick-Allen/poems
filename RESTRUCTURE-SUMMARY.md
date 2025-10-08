# Repository Restructuring Summary

**Date**: October 8, 2025

## Overview

The repository has been reorganised into a clean, logical directory structure that separates source code, documentation, tools, and generated output. All changes were made using `git mv` to preserve file history.

## New Directory Structure

```
/home/wallen/poems/
├── docs/                          # All documentation
│   ├── BUILD.md
│   ├── CHANGELOG-TRAILING-TEXT.md
│   ├── EMBEDDED-LANGUAGES.md
│   ├── POEM-SYNTAX.md
│   ├── POEM-TO-YAML.md
│   ├── QUICKSTART-VIM.md
│   ├── VIM-SYNTAX.md
│   └── YAML-SCHEMA.md
├── editors/                       # Editor integrations
│   └── vim/                       # Vim syntax highlighting
│       ├── ftdetect/
│       ├── syntax/
│       ├── install.sh
│       └── README.md
├── examples/                      # Example files
│   ├── example-embedded.poem
│   └── rom8/
│       ├── rom8.html
│       └── rom8.txt
├── scripts/                       # Shell scripts
│   ├── remove-trailing-spaces.sh
│   └── setup-linux.sh
├── src/                          # Source code
│   ├── poems/                    # Poem source files (.poem and .yaml)
│   ├── templates/                # Pug templates
│   │   └── poem.pug
│   └── tools/                    # Build scripts
│       ├── build-all-poems.js
│       ├── build-blogger.js
│       ├── build-poems.js
│       ├── convert-html-to-yaml.js
│       ├── date-utils.js
│       ├── poem-to-yaml.js
│       ├── serve-static.js
│       ├── slugify.js
│       ├── update-analysis-format.js
│       └── yaml-to-poem.js
├── public/                       # Generated HTML files
├── poem-syntax.ebnf             # EBNF grammar specification
├── package.json
├── package-lock.json
├── poems.code-workspace
└── README.md
```

## Changes Made

### Directory Moves (Using `git mv`)

All file moves were performed using `git mv` to preserve Git history tracking:

1. **Documentation** (8 files)
   - Moved to `docs/` directory
   - `poems/YAML-SCHEMA.md` → `docs/YAML-SCHEMA.md`
   - `tools/poem-to-yaml-README.md` → `docs/POEM-TO-YAML.md`
   - All other `.md` files from root → `docs/`

2. **Vim Support** (4 files)
   - Moved to `editors/vim/`
   - Maintains same internal structure (ftdetect/, syntax/)

3. **Example Files** (3 files)
   - Moved to `examples/`
   - Rom8 files organised in `examples/rom8/` subdirectory

4. **Shell Scripts** (2 files)
   - Moved to `scripts/`

5. **Source Code** (95+ files)
   - `poems/` → `src/poems/` (58 .poem files + supporting files)
   - `templates/` → `src/templates/` (1 file)
   - `tools/` → `src/tools/` (10 files)

### File Reference Updates

All path references were updated in the following files:

#### Configuration Files
- **package.json**: Updated 8 script paths from `tools/` to `src/tools/`
- **.gitignore**: Updated `poems/*.yaml` to `src/poems/*.yaml`

#### Build Scripts (5 files)
- **src/tools/build-poems.js**: Updated `POEMS_DIR` and `TEMPLATE_FILE` paths
- **src/tools/build-all-poems.js**: Updated `poemsDir` paths (2 locations)
- **src/tools/poem-to-yaml.js**: Updated `poemsDir` path
- **src/tools/yaml-to-poem.js**: Updated `poemsDir` path

#### Documentation (10 files)
- **README.md**: Updated repository structure section and all path references
- **docs/BUILD.md**: Updated tool script paths (4 locations)
- **docs/POEM-SYNTAX.md**: Updated implementation note path
- **docs/POEM-TO-YAML.md**: Updated usage examples and related files paths (7 locations)
- **docs/VIM-SYNTAX.md**: Updated vim directory path and example paths (2 locations)
- **docs/QUICKSTART-VIM.md**: Updated example file path
- **docs/CHANGELOG-TRAILING-TEXT.md**: Updated file paths (2 locations)

## Git History Preservation

All 90+ file moves were performed using `git mv`, which means:

- ✅ Git properly tracks them as renames (shown as `R` in `git status`)
- ✅ File history is preserved (`git log --follow` works)
- ✅ Git blame continues to work correctly
- ✅ Merge conflicts are minimized for concurrent branches

## Verification

The build system has been tested and confirmed working:

```bash
$ npm run build
```

Results:
- ✅ All 58 poems converted from .poem to .yaml
- ✅ All 58 HTML files generated successfully
- ✅ index.html and all-poems.html created
- ✅ 0 errors encountered

## Benefits of New Structure

1. **Clear Separation of Concerns**
   - Source code in `src/`
   - Documentation in `docs/`
   - Scripts in `scripts/`
   - Editor tools in `editors/`

2. **Improved Navigation**
   - Easier to find specific types of files
   - Logical grouping of related files
   - Root directory is cleaner and more focused

3. **Better Maintainability**
   - Clear ownership of directories
   - Easier to add new content types
   - Professional repository structure

4. **Git History Preserved**
   - Using `git mv` maintains complete file history
   - Makes tracking changes over time easier
   - Facilitates code archaeology and debugging

## Migration Notes for Contributors

- All file references in code have been updated
- npm scripts automatically use new paths
- Build process remains unchanged from user perspective
- Git history is fully preserved for all moved files

## Commit Summary

When committing these changes, you'll see:
- 89 renamed files (tracked with `R` status)
- 3 modified files (.gitignore, README.md, package.json)
- 2 new files (RESTRUCTURE-SUMMARY.md, src/poems/_example.yaml)
- 1 deleted file (poems/_example.yaml relocated)
- 0 files with lost history

This restructuring provides a solid foundation for future development while maintaining complete historical continuity.

