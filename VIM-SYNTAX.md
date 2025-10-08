# Vim Syntax Highlighting for Poem Files

This directory contains Vim syntax highlighting support for `.poem` files.

## Features

The syntax highlighting provides colour-coding for:

- **Header elements**: Title, author, and date
- **Dividers and markers**: `----` and `====` separators
- **Labels**: Version labels `{{ ... }}`, segment labels `{ ... }`, postscript labels, and analysis labels
- **Variables**: Single-line and multi-line variable definitions (`={var}=`), and variable references (`${var}`)
- **Comment blocks**: `<<# ... #>>`
- **Literal blocks**: `<<< ... >>>`
- **Audio section**: `Audiomack` and `Suno:` keywords
- **Analysis headings**: `#`, `##`, and `###` headings
- **Inline markup**: Emphasis (`_text_`), strong (`*text*`), strikethrough (`~text~`), links (`[text|url]`), smart quotes (`` `text` `` and `"text"`), and span elements (`/.class{text}`)
- **Special characters**: Escaped characters (`\*`), em dashes (`---`), and en dashes (`--`)

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

