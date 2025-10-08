" Vim syntax file
" Language:     Poem
" Maintainer:   Warwick Allen
" Last Change:  2025-10-08
" Filenames:    *.poem
" URL:          https://github.com/warwickallen/poems

if exists("b:current_syntax")
  finish
endif

" Variables
syn match poemVariableDef "^={\w\+}=" nextgroup=poemVariableValue
syn region poemMultiLineVariableDef start="^={\w\+}<<=" end="^=>>" contains=poemMultiLineVarStart,poemMultiLineVarEnd
syn match poemVariableValue ".*$" contained
syn match poemVariableRef "\${[^}]\+}"

" Comment blocks
syn region poemComment start="^<<#" end="^#>>" contains=poemCommentStart,poemCommentEnd
syn match poemCommentStart "^<<#" contained
syn match poemCommentEnd "^#>>" contained

" Literal blocks
syn region poemLiteralBlock start="^<<<" end="^>>>" contains=poemLiteralStart,poemLiteralEnd
syn match poemLiteralStart "^<<<" contained
syn match poemLiteralEnd "^>>>" contained

" Dividers and markers
syn match poemDivider "^----$"
syn match poemEndMarker "^====$"

" Header section (first 3 lines)
syn match poemTitle "\%1l.*$"
syn match poemDate "^\d\{4\}-\d\{2\}-\d\{2\}$"

" Labels
syn region poemVersionLabel start="^{{\s*" end="\s*}}" contains=poemVersionLabelDelim,poemVariableRef
syn match poemVersionLabelDelim "{{" contained
syn match poemVersionLabelDelim "}}" contained

syn region poemSegmentLabel start="^{\S" end="}" contains=poemSegmentLabelDelim,poemVariableRef oneline
syn match poemSegmentLabelDelim "{" contained
syn match poemSegmentLabelDelim "}" contained

" Analysis labels
syn match poemAnalysisLabel "^{Synopsis}$"
syn match poemAnalysisLabel "^{Full}$"

" Postscript labels
syn region poemPostscriptLabel start="^{[A-Z]" end="}" contains=poemPostscriptLabelDelim,poemVariableRef oneline
syn match poemPostscriptLabelDelim "{" contained
syn match poemPostscriptLabelDelim "}" contained

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
syn match poemEmDash "---"
syn match poemEnDash "--"

" Define highlighting
hi def link poemTitle Title
hi def link poemDate Special
hi def link poemDivider Delimiter
hi def link poemEndMarker Delimiter

hi def link poemVersionLabel Identifier
hi def link poemVersionLabelDelim Delimiter
hi def link poemSegmentLabel Type
hi def link poemSegmentLabelDelim Delimiter
hi def link poemPostscriptLabel Type
hi def link poemPostscriptLabelDelim Delimiter
hi def link poemAnalysisLabel Type

hi def link poemVariableDef Macro
hi def link poemVariableValue String
hi def link poemMultiLineVariableDef Macro
hi def link poemVariableRef Identifier

hi def link poemComment Comment
hi def link poemCommentStart Comment
hi def link poemCommentEnd Comment

hi def link poemLiteralBlock PreProc
hi def link poemLiteralStart Delimiter
hi def link poemLiteralEnd Delimiter

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

