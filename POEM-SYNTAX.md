# Poem File Format Syntax Specification

This document provides a human-readable guide to the formal EBNF grammar defined in `poem-syntax.ebnf`.

## File Extension

`.poem`

## Overview

A poem file consists of the following sections in strict order:

1. **Header** (mandatory)
2. **Versions** (mandatory, at least one)
3. **Audio** (may be empty, but delimiter required)
4. **Postscript** (may be empty, but delimiter required)
5. **Analysis** (may be empty, end delimiter optional)

## 1. Header Section

The header appears at the beginning of the file and consists of:

```
<Title>
[<Author>]
<Date>
```

### Fields

- **Title** (mandatory): The title of the poem (any text)
- **Author** (optional): The author's name. If omitted, defaults to "Warwick Allen"
- **Date** (mandatory): Must be in format `YYYY-MM-DD` (e.g., `1970-01-01`)

### Example

```
Example Poem
A Poet
1970-01-01
```

## 2. Versions Section

Contains one or more versions of the poem, separated by `----` dividers.

### Structure

```
[{{ <Version Label> }}]

[{<Segment Label>}]
<Poem lines>

[{<Segment Label>}]
<Poem lines>

----

[{{ <Version Label> }}]
...
```

### Rules

- Each version must contain at least one segment
- Version labels are optional (wrapped in `{{ }}`)
- Segment labels are optional (wrapped in `{ }`)
- Leading and trailing whitespace in labels is trimmed
- Poem lines preserve all newlines and indentation (including leading spaces/tabs)
- Versions are separated by `----` (exactly 4 hyphens)
- The section ends with `====` (exactly 4 equals signs)

### Example

```
{{ Version 1 }}

{Stanza 1}
These are the lines
   With some indentation
Of stanza 1

These are the lines
Of stanza 2

----

{{ Version 2 (song arrangement) }}

{Verse 1}
First verse lines

====
```

## 3. Audio Section

Section for audio links. The section may be empty, but the end marker is always required.

### Structure

```
[Audiomack]
[Suno: <url-path>]

====
```

### Rules

- **Audiomack**: The word "Audiomack" on its own line indicates presence of an Audiomack link
- **Suno**: Format is `Suno: ` followed by a URL path (e.g., `s/SongLink12345678` or `song/uuid`)
- Both lines are optional; if neither is present, the section will be empty
- The `====` end marker is **always required**, even if the section is empty

### Example

```
Audiomack
Suno: s/SongLink12345678

====
```

## 4. Postscript Section

Section for postscript notes. The section may be empty, but the end marker is always required.

### Structure

```
[{<Postscript Label>}]
<Content paragraph>

<Content paragraph>

----

[{<Postscript Label>}]
<Content paragraph>

[Literal blocks]

====
```

### Rules

- Multiple postscript notes separated by `----` (exactly 4 hyphens)
- Each note can have an optional label (wrapped in `{ }`)
- Single newlines within postscript paragraphs are **not preserved** (collapsed into single line)
- Blank lines indicate paragraph breaks
- Literal blocks can appear between postscript notes
- The `====` end marker is **always required**, even if the section is empty

### Literal Blocks

Literal blocks preserve content exactly as written without any markup conversion:

```
<<<
<arbitrary content>
>>>
```

- Start marker: `<<<` (must be at start of line)
- End marker: `>>>` (must be at start of line)
- Content between markers is not processed or converted

### Example

```
{Postscript 1}
Something to note.

----

This is another note
without a label.

This note has two paragraphs.

----

<<<
  - $ref: "_shared.yaml#/disclaimer"
>>>

====
```

## 5. Analysis Section

Section for poem analysis. The section may be empty. Can have two forms:

### Form 1: Single Analysis

```
{Full}

<Analysis content>

====
```

### Form 2: Synopsis and Full Analysis

```
{Synopsis}

<Synopsis content>

{Full}

<Full analysis content>

====
```

### Rules

- If `{Synopsis}` is present, `{Full}` **must** also be present
- `{Full}` can appear on its own without `{Synopsis}`
- Single newlines within paragraphs are **not preserved** (collapsed)
- Blank lines indicate paragraph breaks
- Supports heading markup and inline markup
- The `====` end marker is **optional** - only required if followed by ignored content (comments)

### Heading Markup

Analysis sections support Markdown-style headings:

- `# Text` → `<h3>` heading
- `## Text` → `<h4>` heading
- `### Text` → `<h5>` heading

Note: The grammar does not provide for `<h1>` or `<h2>` headings.

### Example

```
{Synopsis}

This is where the synopsis goes.

Another paragraph.

# Section Heading

Some more text here.

{Full}

This is the full analysis.

## Sub-Section Heading

More detailed content.

====
```

## 6. Comment Blocks

Comment blocks allow you to include notes that won't appear in the output:

```
<<#
This is a comment
It can span multiple lines
#>>
```

### Rules

- Start marker: `<<#` (must be at start of line)
- End marker: `#>>` (must be at start of line)
- Text after markers on the same line is also ignored
- Comment blocks can appear anywhere in the file
- Content is completely removed during parsing

### Example

```
{Verse 1}
These are poem lines

<<# This is a note to myself
Don't forget to revise this verse
#>>

{Verse 2}
More poem lines
```

## 7. Inline Markup

Text content supports inline markup for formatting:

### Basic Formatting

| Syntax | Output |
|--------|--------|
| `_text_` | `<em>text</em>` (emphasis) |
| `*text*` | `<strong>text</strong>` (strong) |
| `~text~` | `<s>text</s>` (strikethrough) |

### Links

| Syntax | Output |
|--------|--------|
| `[text\|url]` | `<a href="https://url">text</a>` |

### Smart Quotes and Punctuation

| Syntax | Output |
|--------|--------|
| `` `text` `` | `&#8216;text&#8217;` (smart single quotes) |
| `"text"` | `&#8220;text&#8221;` (smart double quotes) |
| `--` | `&#8211;` (en dash) |
| `---` | `&#8212;` (em dash) |
| `&` | `&#38;` (ampersand entity) |
| `'` | `&#39;` (apostrophe entity) |

### Escaped Characters

Use backslash to prevent markup conversion:

| Syntax | Output |
|--------|--------|
| `\_` | `_` |
| `\*` | `*` |
| `\~` | `~` |
| `\[` | `[` |
| `` \` `` | `` ` `` |
| `\"` | `"` |
| `\&` | `&` |
| `\'` | `'` |
| `\-` | `-` |
| `\<` | `<` |
| `\>` | `>` |
| `\\` | `\` |

### Markup Rules

1. **Nesting**: Markup can be nested (e.g., `` `[*_text_*\|url]` ``)
2. **Paragraph Boundaries**: Markup pairs (`_`, `*`, `~`, `` ` ``, `"`) match across lines within a paragraph but **not** across paragraph boundaries
3. **Unmatched Pairs**: If a pair is not matched, it remains as literal text
4. **Context**: Inline markup applies in:
   - Poem segment content
   - Postscript note content
   - Analysis section content
   - Labels (version and segment labels)

## 8. Minimal File Structure

The absolute minimal valid poem file looks like this:

```
Title
1970-01-01

{Verse}
Some lines

====

====

====
```

This demonstrates that:
- The audio section delimiter `====` is always required (even when empty)
- The postscript section delimiter `====` is always required (even when empty)
- The analysis section may be empty, and its delimiter `====` is optional

If you want to add comments after the analysis section, you must include the final `====` delimiter:

```
Title
1970-01-01

{Verse}
Some lines

====

====

====

====

<<# Comment about this poem
This won't appear in the output
#>>
```

## 9. Structural Rules

### Line Anchoring

The following elements **must** appear at the start of a line (column 0):

- Dividers: `----`
- End markers: `====`
- Version labels: `{{ ... }}`
- Segment labels: `{ ... }`
- Literal block markers: `<<<`, `>>>`
- Comment block markers: `<<#`, `#>>`

### Whitespace Handling

- **Poem segments**: All newlines and indentation (spaces/tabs) are preserved exactly
- **Postscript notes**: Single newlines are collapsed; only blank lines (paragraph breaks) are preserved
- **Analysis sections**: Single newlines are collapsed; only blank lines (paragraph breaks) are preserved
- **Blank lines**: Any number of blank lines before/after dividers, markers, and labels are normalized (have no effect on output)

### Indentation in Poem Segments

Indentation is preserved in poem segments:

```
{Verse}
Line one
   Indented line two
      More indented line three
```

Converts to:

```yaml
- label: Verse
  lines: |
    Line one
    &nbsp;&nbsp;&nbsp;Indented line two
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;More indented line three
```

## 10. Complete Example

See `_example.poem` for a complete example file demonstrating all features.

## 11. Formal Grammar

For the complete formal specification, see `poem-syntax.ebnf`, which defines the grammar in Extended Backus-Naur Form (EBNF).

