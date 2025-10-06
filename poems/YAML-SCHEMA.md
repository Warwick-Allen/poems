# YAML Schema for Poems

This document describes the YAML schema for poem files.

## Required Fields

- `title`: String - The title of the poem
- `author`: String - The author's name
- `date`: String - The date in format "DayOfWeek, DD Month YYYY"
- `slug`: String - URL-friendly identifier (used for HTML filename and IDs)
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
  suno:
    - url: https://suno.com/s/...
```

**Notes:**
- Audio platforms are arrays of objects with `url` fields
- For `audiomack`: use `active: true` to indicate the audio is active
- For `suno`: presence of a `url` indicates the audio is active (no `active` field needed)

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

YAML files should be named using the slug with `.yaml` extension:
- `slug: my-poem` → `my-poem.yaml`

The build script will generate:
- `public/my-poem.html`


