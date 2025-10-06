# YAML Schema for Poems

This document describes the YAML schema for poem files.

## Required Fields

- `title`: String - The title of the poem
- `author`: String - The author's name
- `date`: String - The date in format "DayOfWeek, DD Month YYYY"
- `versions`: Array - List of poem versions, each containing segments

## Content Fields

### Versions Format
```yaml
versions:
  - label: "Original poem (2015)"  # Optional: omit for unlabelled versions
    segments:
      - label: "[Verse 1]"  # Optional: omit for unlabelled segments
        lines: |
          Poem text with HTML markup where needed
          Line breaks preserved
      - lines: |
          Unlabelled segment text
      - label: "[Chorus]"
        lines: |
          More text
  - segments:  # Version without label
      - lines: |
          Another version's content
```

**Notes:**
- The version `label` field is optional. When omitted, the version will be rendered without a label.
- The segment `label` field is optional. When omitted, the segment will be rendered without a label.
- Each version contains its own `segments` list.

## Optional Fields

### Audio
```yaml
audio:
  audiomack:
    - url: https://audiomack.com/embed/...
      active: true
  suno: s/...
```

**Notes:**
- For `audiomack`: use array format with `url` and `active` fields
- For `suno`: use relative path format (e.g., `s/...` or `song/...`). The full URL will be automatically constructed by the template

### Postscript Notes
```yaml
postscript:
  - label: "Disclaimer"
    content: |
      <p>HTML content.</p>
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

YAML files should be named using a URL-friendly version of the title with `.yaml` extension:
- `title: "My Poem"` → `my-poem.yaml`

The build script will automatically generate a slug from the title and create:
- `public/my-poem.html`

**Note:** The slug is automatically calculated from the title using the same logic as the `slugify` function in the Pug template:
1. Convert to lowercase and trim whitespace
2. Remove all characters except letters, numbers, spaces, and hyphens
3. Replace one or more consecutive spaces with a single hyphen


