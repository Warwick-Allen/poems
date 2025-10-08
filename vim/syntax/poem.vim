" Vim syntax file
" Language:     Poem
" Maintainer:   Warwick Allen
" Last Change:  2025-10-08
" Filenames:    *.poem
" URL:          https://github.com/warwickallen/poems

if exists("b:current_syntax")
  finish
endif

" Comment blocks
syn region poemComment start="^<<#" end="^#>>" keepend

" Literal blocks
syn region poemLiteralBlock start="^<<<$" end="^>>>$" keepend

" Literal block markers with trailing text
syn match poemLiteralStartLine "^<<<\s\+.*$" contains=poemLiteralStartMark
syn match poemLiteralStartMark "^<<<" contained
syn match poemLiteralEndLine "^>>>\s\+.*$" contains=poemLiteralEndMark
syn match poemLiteralEndMark "^>>>" contained

" Variables
syn match poemVariableDef "^={\w\+}=" nextgroup=poemVariableValue
syn match poemVariableValue ".*$" contained
syn match poemVariableRef "\${[^}]\+}"

" Multi-line variables
syn region poemMultiLineVarDef start="^={\w\+}<<=" end="^=>>" keepend

" Version labels MUST come before segment labels to have priority
" Version labels with trailing text - entire line is Comment, but label part is Identifier
syn match poemVersionLabelLineTrailing "^{{.\{-}}}\s\+.*$" contains=poemVersionLabelPart
syn match poemVersionLabelPart "^{{.\{-}}}" contained contains=poemVersionLabelDelim,poemVariableRef
syn match poemVersionLabelDelim "{{" contained
syn match poemVersionLabelDelim "}}" contained
" Version labels without trailing text
syn match poemVersionLabelLineOnly "^{{.\{-}}}$" contains=poemVersionLabelDelim,poemVariableRef

" Segment labels with trailing text - must NOT start with {{
syn match poemSegmentLabelLineTrailing "^{[^{}]\+}\s\+.*$" contains=poemSegmentLabelPart
syn match poemSegmentLabelPart "^{[^{}]\+}" contained contains=poemSegmentLabelDelim,poemVariableRef
syn match poemSegmentLabelDelim "{" contained
syn match poemSegmentLabelDelim "}" contained
" Segment labels without trailing text
syn match poemSegmentLabelLineOnly "^{[^{}]\+}$" contains=poemSegmentLabelDelim,poemVariableRef

" Dividers without trailing text (must come before trailing version for priority)
syn match poemDividerLineOnly "^----$"
" Dividers with trailing text - entire line is Comment, but ---- is Delimiter
syn match poemDividerLineTrailing "^----\s\+.*$" contains=poemDividerMark
syn match poemDividerMark "^----" contained

" End markers without trailing text (must come before trailing version for priority)
syn match poemEndMarkerLineOnly "^====$"
" End markers with trailing text
syn match poemEndMarkerLineTrailing "^====\s\+.*$" contains=poemEndMarkerMark
syn match poemEndMarkerMark "^====" contained

" Header section (first 3 lines)
syn match poemTitle "\%1l.*$"
syn match poemDate "^\d\{4\}-\d\{2\}-\d\{2\}$"

" Audio section
syn match poemAudioKeyword "^Audiomack$"
syn match poemSunoLine "^Suno:\s\+\S\+" contains=poemSunoKeyword
syn match poemSunoKeyword "^Suno:" contained

" Headings in analysis section
syn match poemHeading1 "^#\s\+.*$"
syn match poemHeading2 "^##\s\+.*$"
syn match poemHeading3 "^###\s\+.*$"

" Inline markup
syn region poemEmphasis start="_" end="_" oneline contains=poemStrong,poemStrikethrough,poemVariableRef
syn region poemStrong start="\*" end="\*" oneline contains=poemEmphasis,poemStrikethrough,poemVariableRef
syn region poemStrikethrough start="\~" end="\~" oneline contains=poemEmphasis,poemStrong,poemVariableRef
syn region poemLink start="\[" end="\]" contains=poemLinkPipe,poemVariableRef oneline
syn match poemLinkPipe "|" contained
syn region poemSmartSingleQuote start="`" end="`" oneline
syn region poemSmartDoubleQuote start='"' end='"' oneline

" Span elements
syn region poemSpan start="/\.\w\+{" end="}" oneline

" Special characters
syn match poemEscaped "\\[_*~\[`\"&'\-<>=$/{}\\]"
" Em-dash: three hyphens not followed by another hyphen
syn match poemEmDash "---\%(-\)\@!"
" En-dash: two hyphens not followed by another hyphen  
syn match poemEnDash "--\%(-\)\@!"

" Define highlighting - lines with trailing text are Comment
hi def link poemTitle Title
hi def link poemDate Special

hi def link poemDividerLineTrailing Comment
hi def link poemDividerMark Delimiter
hi def link poemDividerLineOnly Delimiter
hi def link poemEndMarkerLineTrailing Comment
hi def link poemEndMarkerMark Delimiter
hi def link poemEndMarkerLineOnly Delimiter

hi def link poemVersionLabelLineTrailing Comment
hi def link poemVersionLabelPart Identifier
hi def link poemVersionLabelLineOnly Identifier
hi def link poemVersionLabelDelim Delimiter

hi def link poemSegmentLabelLineTrailing Comment
hi def link poemSegmentLabelPart Type
hi def link poemSegmentLabelLineOnly Type
hi def link poemSegmentLabelDelim Delimiter

hi def link poemVariableDef Macro
hi def link poemVariableValue String
hi def link poemMultiLineVarDef Macro
hi def link poemVariableRef Identifier

hi def link poemComment Comment
hi def link poemLiteralBlock PreProc
hi def link poemLiteralStartLine Comment
hi def link poemLiteralStartMark Delimiter
hi def link poemLiteralEndLine Comment
hi def link poemLiteralEndMark Delimiter

hi def link poemAudioKeyword Keyword
hi def link poemSunoKeyword Keyword
hi def link poemSunoLine String

hi def link poemHeading1 Title
hi def link poemHeading2 Title
hi def link poemHeading3 Title

hi def link poemEmphasis Underlined
hi def link poemStrong Statement
hi def link poemStrikethrough Comment
hi def link poemLink Underlined
hi def link poemLinkPipe Delimiter
hi def link poemSmartSingleQuote String
hi def link poemSmartDoubleQuote String
hi def link poemSpan Special

hi def link poemEscaped Special
hi def link poemEmDash Special
hi def link poemEnDash Special

let b:current_syntax = "poem"
