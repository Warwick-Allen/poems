#!/bin/bash

shopt -quo dotglob

repo_toplevel=$(git rev-parse --show-toplevel)
mkdir -p "$repo_toplevel/raw"
for poem_file in "$repo_toplevel"/src/poems/*.poem; do
  [[ "$poem_file" =~ /_ ]] && continue;
  title="$(<"$poem_file" head -1)"
  (
    echo "$title" | tee >(sed s/./-/g)
    <"$poem_file" awk '
      /^\s*$/           {blank++}
      blank<1           {next}
      /^====\s*(#.*)?$/ {exit}
      /^\s*{[^{]/       {next}
      /^<<#/            {comment=1}
      /^#>>/            {comment=0; next}
      comment           {next}
                        {print}
    ' |
    perl -pe 'BEGIN {no warnings utf8; undef $/}
      s:  /\.\w+\{([^}]*)\}         :\1:gx;
      s:  \.\.\.                     :…:gx;
      s:( &hellip; | \.\.\.         ):…:gx;
      s:  &ldquo;                    :“:gx;
      s:  &rdquo;                    :”:gx;
      s:( &mdash;  | (?<!-)---(?!-) ):—:gx;
      s:  &mdash;                    :—:gx;
      s:  &ndash;                    :–:gx;
      s:  &# (\d+)         :chr     $1:egx;
      s:  &#x(\d+)         :chr hex $1:egx;
      s:  \n*                       $:\n:s;
    '
  ) >"$repo_toplevel/raw/$title"
done

