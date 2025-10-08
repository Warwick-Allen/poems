# Poem to YAML Converter

This script converts `.poem` files to YAML format based on the formal syntax specification in `poem-syntax.ebnf`.

## Usage

### Convert all .poem files in poems/ directory

```bash
npm run build:yaml
```

This will convert all `.poem` files in the `poems/` directory to corresponding `.yaml` files.

### Convert a single file

```bash
node tools/poem-to-yaml.js input.poem output.yaml
```

Or let it auto-generate the output filename:

```bash
node tools/poem-to-yaml.js input.poem
```

## Features

The converter handles all features defined in the `.poem` syntax specification:

### Header
- Title (mandatory)
- Author (optional, defaults to "Warwick Allen" if omitted in YAML)
- Date in YYYY-MM-DD format (mandatory)

### Versions
- Multiple versions separated by `----` dividers
- Optional version labels with {% raw %}`{{ ... }}`{% endraw %}
- Segments with optional labels `{ ... }`
- Preserves all indentation and newlines in poem content

### Audio Section
- Audiomack presence indicator
- Suno URL paths

### Postscript Notes
- Multiple postscript notes separated by `----` dividers
- Optional labels for each note
- Multiple paragraphs per note (collapsed newlines, preserved paragraph breaks)
- Literal blocks with `<<<` ... `>>>` (including `$ref` references)

### Analysis
- Optional synopsis section with `{Synopsis}`
- Optional full analysis section with `{Full}`
- Markdown-style headings: `#` → `<h3>`, `##` → `<h4>`, `###` → `<h5>`
- Collapsed newlines within paragraphs, preserved paragraph breaks

### Inline Markup
Converts text markup to HTML entities:

| Source | Output |
|--------|--------|
| `_text_` | `<em>text</em>` |
| `*text*` | `<strong>text</strong>` |
| `~text~` | `<s>text</s>` |
| `[text\|url]` | `<a href="https://url">text</a>` |
| `` `text` `` | `&#8216;text&#8217;` (smart single quotes) |
| `"text"` | `&#8220;text&#8221;` (smart double quotes) |
| `--` | `&#8211;` (en dash) |
| `---` | `&#8212;` (em dash) |
| `&` | `&#38;` |
| `'` | `&#39;` |

Escaped characters with `\` are preserved as literals.

### Comment Blocks
Comment blocks delimited by `<<#` ... `#>>` are automatically removed during parsing.

### Variables
Variable syntax is documented in the specification but not yet implemented in this parser. The syntax includes:
- Single-line variables: `={token}= value`
- Multi-line variables: `={token}<<= ... =>>`
- Variable substitution: `${token}`

See `POEM-SYNTAX.md` and `poems/_example.poem` for complete variable documentation.

## Implementation Notes

- The parser removes comment blocks before processing
- All section delimiters (`====`) are expected in their specified positions
- Blank lines before/after structural elements are normalized
- The converter uses the `js-yaml` library for YAML generation
- Line numbers and positions are tracked for better error reporting

## Related Files

- `poem-syntax.ebnf` - Formal EBNF grammar specification
- `POEM-SYNTAX.md` - Human-readable syntax documentation
- `poems/_example.poem` - Complete example demonstrating all features
- `poems/_example.yaml` - Expected YAML output for the example

