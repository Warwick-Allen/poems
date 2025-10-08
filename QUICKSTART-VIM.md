# Quick Start: Vim Syntax Highlighting for Poem Files

## Installation (30 seconds)

Run the installation script from the project root:

```bash
# For standard Vim
./vim/install.sh

# For Neovim
./vim/install.sh neovim
```

## Verify Installation

Open a poem file to see syntax highlighting in action:

```bash
vim poems/_example.poem
```

## What Gets Highlighted?

The syntax highlighting provides colour-coding for all major Poem file elements:

| Element | Example | Highlight |
|---------|---------|-----------|
| **Title** | First line of file | Special formatting |
| **Date** | `2025-01-15` | Date format |
| **Version labels** | `{{ Version 1 }}` | Identifier |
| **Segment labels** | `{Verse 1}` | Type |
| **Variables** | `={var}=value`, `${var}` | Macro/Identifier |
| **Comments** | `<<# comment #>>` | Comment style |
| **Literal blocks** | `<<< ... >>>` | PreProc style |
| **Dividers** | `----`, `====` | Delimiter |
| **Audio keywords** | `Audiomack`, `Suno:` | Keyword |
| **Headings** | `#`, `##`, `###` | Title style |
| **Emphasis** | `_text_` | Underlined |
| **Strong** | `*text*` | Bold/Statement |
| **Links** | `[text\|url]` | Underlined |
| **Smart quotes** | `` `text` ``, `"text"` | String |

## Requirements

Your `.vimrc` (or `~/.config/nvim/init.vim` for Neovim) must include:

```vim
filetype on
filetype plugin on
syntax on
```

Most Vim installations include these by default.

## Customisation

To customise colours, add to your `.vimrc`:

```vim
" Example: Change title colour to cyan
autocmd Syntax poem hi poemTitle ctermfg=cyan guifg=#00ffff

" Example: Change variable references to green
autocmd Syntax poem hi poemVariableRef ctermfg=green guifg=#00ff00
```

## Complete Documentation

For complete documentation, customisation options, and troubleshooting, see:
- `VIM-SYNTAX.md` - Full documentation
- `vim/README.md` - Quick reference

## File Structure

```
vim/
├── syntax/
│   └── poem.vim          # Syntax highlighting rules
├── ftdetect/
│   └── poem.vim          # Filetype detection
├── install.sh            # Installation script
└── README.md             # Quick reference
```

