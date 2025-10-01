# YAML Schema for Poems

This document describes the YAML schema for poem files.

## Required Fields

- `title`: String - The title of the poem
- `author`: String - The author's name
- `date`: String - The date in format "DayOfWeek, DD Month YYYY"
- `slug`: String - URL-friendly identifier (used for HTML filename and IDs)

## Content Fields (choose one)

### Option 1: Plain body (no song segments)
```yaml
body: |
  Poem text with HTML markup where needed<br />
  Line breaks preserved<br />
```

### Option 2: Segmented body (with song segments)
```yaml
segments:
  - label: "[Verse 1]"
    lines: |
      Poem text<br />
  - label: "[Chorus]"
    lines: |
      More text<br />
```

## Optional Fields

### Audio
```yaml
audio:
  audiomack: https://audiomack.com/embed/...
  suno: https://suno.com/s/...
```

### Analysis (3 scenarios)

#### No Analysis
Omit the `analysis` field entirely.

#### Single Analysis
```yaml
analysis:
  type: single
  content: |
    <h2>Analysis Title</h2>
    <p>Analysis content with HTML markup...</p>
```

#### Dual Analysis (Synopsis and Full)
```yaml
analysis:
  type: dual
  synopsis: |
    <h2>Synopsis Title</h2>
    <p>Synopsis content...</p>
  full: |
    <h2>Full Analysis Title</h2>
    <p>Full analysis content...</p>
```

## File Naming

YAML files should be named using the slug with `.yaml` extension:
- `slug: my-poem` → `my-poem.yaml`

The build script will generate:
- `public/my-poem.html`


