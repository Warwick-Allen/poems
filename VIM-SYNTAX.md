# Vim Syntax Highlighting for Poem Files

This directory contains Vim syntax highlighting support for `.poem` files.

## Features

The syntax highlighting provides colour-coding for:

- **Header elements**: Title, author, and date
- **Dividers and markers**: `----` and `====` separators
- **Labels**: Version labels `{{ ... }}`, segment labels `{ ... }`, postscript labels, and analysis labels
- **Variables**: Single-line and multi-line variable definitions (`={var}=`), and variable references (`${var}`)
- **Comment blocks**: `<<# ... #>>`
- **Literal blocks**: `<<< ... >>>` with optional language-specific syntax highlighting
- **Embedded languages**: HTML, CSS, JavaScript, Python, YAML, JSON, XML, SQL, Shell/Bash, Markdown
- **Audio section**: `Audiomack` and `Suno:` keywords
- **Analysis headings**: `#`, `##`, and `###` headings
- **Inline markup**: Emphasis (`_text_`), strong (`*text*`), strikethrough (`~text~`), links (`[text|url]`), smart quotes (`` `text` `` and `"text"`), and span elements (`/.class{text}`)
- **Special characters**: Escaped characters (`\*`), em dashes (`---`), and en dashes (`--`)
- **Trailing text**: Inline comments after line-anchored tokens (e.g., `----  # comment`)

## Embedded Language Support

Literal blocks can specify a language tag for syntax-specific highlighting:

```poem
<<<html
<p>This HTML will be highlighted with HTML syntax</p>
>>>

<<<python
def hello():
    print("Python code with proper highlighting!")
>>>

<<<yaml
key: value
nested:
  - item1
  - item2
>>>
```

### Supported Languages

The following languages are supported with their alternative tags:

| Language | Tags | Notes |
|----------|------|-------|
| HTML | `html` | Web markup |
| CSS | `css` | Stylesheets |
| JavaScript | `javascript`, `js` | ECMAScript |
| Python | `python`, `py` | Python code |
| YAML | `yaml`, `yml` | Configuration files |
| JSON | `json` | Data interchange |
| XML | `xml` | Markup language |
| SQL | `sql` | Database queries |
| Shell | `shell`, `bash`, `sh` | Shell scripts |
| Markdown | `markdown`, `md` | Markdown text |

**Notes:**
- Language tags are case-sensitive (use lowercase)
- The language name must immediately follow `<<<` with no space (e.g., `<<<html`)
- Text after the language tag is treated as a comment (e.g., `<<<html # My HTML block`)
- Plain `<<<` without a language tag uses default literal block highlighting
- Unrecognized language tags also use default literal block highlighting

### Examples

```poem
<<<html  # A complete HTML snippet
<!DOCTYPE html>
<html>
<head><title>Example</title></head>
<body><p>Hello, world!</p></body>
</html>
>>>

<<<python  # Python function
def calculate_sum(numbers):
    """Calculate the sum of a list of numbers."""
    return sum(numbers)
>>>

<<<yaml  # Configuration example
server:
  host: localhost
  port: 8080
  ssl: true
>>>

<<<  # Plain literal block (no language tag)
  - $ref: "_shared.yaml#/disclaimer"
>>>
```

The embedded language syntax uses Vim's built-in syntax files, so you get the same highlighting you're used to in dedicated language files.

### Disabling Embedded Languages

If you experience performance issues or want to disable embedded language highlighting, add this to your `.vimrc`:

```vim
let g:poem_no_embedded_languages = 1
```

This will disable all embedded language syntax loading, and literal blocks will use default highlighting regardless of language tags.

## Installation

### Method 1: Manual Installation (Recommended)

1. Copy the syntax and filetype detection files to your Vim configuration directory:

   ```bash
   # For Linux/macOS
   mkdir -p ~/.vim/syntax
   mkdir -p ~/.vim/ftdetect
   cp vim/syntax/poem.vim ~/.vim/syntax/
   cp vim/ftdetect/poem.vim ~/.vim/ftdetect/
   ```

   Or for Neovim:

   ```bash
   # For Neovim
   mkdir -p ~/.config/nvim/syntax
   mkdir -p ~/.config/nvim/ftdetect
   cp vim/syntax/poem.vim ~/.config/nvim/syntax/
   cp vim/ftdetect/poem.vim ~/.config/nvim/ftdetect/
   ```

2. Restart Vim or reload your configuration:

   ```vim
   :source $MYVIMRC
   ```

### Method 2: Using a Plugin Manager

If you use a plugin manager like [vim-plug](https://github.com/junegunn/vim-plug), [Vundle](https://github.com/VundleVim/Vundle.vim), or [Pathogen](https://github.com/tpope/vim-pathogen), you can add this syntax highlighting by creating a symbolic link or copying the `vim/` directory to your plugin directory.

#### Example with vim-plug:

1. Create a local plugin directory structure:

   ```bash
   mkdir -p ~/.vim/bundle/poem-syntax/syntax
   mkdir -p ~/.vim/bundle/poem-syntax/ftdetect
   cp vim/syntax/poem.vim ~/.vim/bundle/poem-syntax/syntax/
   cp vim/ftdetect/poem.vim ~/.vim/bundle/poem-syntax/ftdetect/
   ```

2. Add to your `.vimrc`:

   ```vim
   Plug '~/.vim/bundle/poem-syntax'
   ```

3. Run `:PlugInstall` in Vim.

### Method 3: Single-File Installation

If you prefer a simpler approach, you can manually enable syntax highlighting for `.poem` files by adding this to your `.vimrc`:

```vim
" Enable Poem syntax highlighting
au BufRead,BufNewFile *.poem set filetype=poem

" Add the syntax directory to Vim's runtime path
set runtimepath+=~/poems/vim
```

Replace `~/poems/vim` with the full path to the `vim/` directory in this repository.

## Verification

To verify the syntax highlighting is working:

1. Open a `.poem` file in Vim:

   ```bash
   vim poems/_example.poem
   ```

2. Check the filetype:

   ```vim
   :set filetype?
   ```

   It should display `filetype=poem`.

3. The syntax highlighting should be automatically applied. If not, manually apply it:

   ```vim
   :set syntax=poem
   ```

## Customisation

If you want to customise the colours, you can add highlighting overrides to your `.vimrc`. For example:

```vim
" Custom Poem syntax highlighting colours
autocmd Syntax poem hi poemTitle ctermfg=cyan guifg=#00ffff
autocmd Syntax poem hi poemSegmentLabel ctermfg=yellow guifg=#ffff00
autocmd Syntax poem hi poemVariableRef ctermfg=green guifg=#00ff00
```

## Troubleshooting

### Syntax highlighting not working

1. Check that filetype detection is enabled in your `.vimrc`:

   ```vim
   filetype on
   filetype plugin on
   syntax on
   ```

2. Verify the files are in the correct location:

   ```bash
   # For Vim
   ls ~/.vim/syntax/poem.vim
   ls ~/.vim/ftdetect/poem.vim

   # For Neovim
   ls ~/.config/nvim/syntax/poem.vim
   ls ~/.config/nvim/ftdetect/poem.vim
   ```

3. Check for errors when loading the syntax file:

   ```vim
   :syntax on
   :set filetype=poem
   ```

### Syntax highlighting looks incorrect

Try clearing the syntax cache and reloading:

```vim
:syntax clear
:edit
```

## Supported Vim Versions

This syntax file has been tested with:
- Vim 8.0 and later
- Neovim 0.5 and later

It should work with older versions as well, but this has not been extensively tested.

## License

This syntax highlighting file is provided as-is for use with the Poem file format.

