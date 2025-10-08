#!/usr/bin/env node
/**
 * Convert .poem files to YAML format
 * Based on poem-syntax.ebnf specification
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Parse a .poem file and convert to structured data
 */
class PoemParser {
  constructor(content) {
    this.content = content;
    this.lines = content.split('\n');
    this.index = 0;
    this.result = {};
    this.variables = new Map();
    this.usedBeforeDefined = new Set();
  }

  /**
   * Main parse method
   */
  parse() {
    // Remove comment blocks first
    this.removeCommentBlocks();

    // Process variables (extract and remove definition lines)
    this.processVariables();

    this.parseHeader();
    this.parseVersions();

    // All subsequent sections and their markers are optional
    // If we hit EOF, all remaining sections are empty

    if (this.eof()) return this.result;
    this.expectMarker('====', 'end-of-poem');

    if (this.eof()) return this.result;
    this.parseAudio();

    if (this.eof()) return this.result;
    this.expectMarker('====', 'end-of-audio');

    if (this.eof()) return this.result;
    this.parsePostscript();

    if (this.eof()) return this.result;
    this.expectMarker('====', 'end-of-postscript');

    if (this.eof()) return this.result;
    this.parseAnalysis();

    // Warn about variables used before definition
    if (this.usedBeforeDefined.size > 0) {
      for (const varName of this.usedBeforeDefined) {
        console.warn(`Warning: Variable '\${${varName}}' used but not defined`);
      }
    }

    return this.result;
  }

  /**
   * Remove comment blocks (<<# ... #>>) from content
   */
  removeCommentBlocks() {
    const newLines = [];
    let inComment = false;

    for (const line of this.lines) {
      if (line.trimStart().startsWith('<<#')) {
        inComment = true;
        continue;
      }
      if (line.trimStart().startsWith('#>>')) {
        inComment = false;
        continue;
      }
      if (!inComment) {
        newLines.push(line);
      }
    }

    this.lines = newLines;
  }

  /**
   * Process variables: extract definitions and expand multi-line substitutions
   */
  processVariables() {
    const newLines = [];
    let i = 0;
    let inLiteralBlock = false;

    while (i < this.lines.length) {
      const line = this.lines[i];

      // Track literal blocks (variables not defined inside them)
      if (line.trim() === '<<<') {
        inLiteralBlock = true;
        newLines.push(line);
        i++;
        continue;
      }
      if (line.trim() === '>>>') {
        inLiteralBlock = false;
        newLines.push(line);
        i++;
        continue;
      }

      // Skip variable definition inside literal blocks
      if (inLiteralBlock) {
        newLines.push(line);
        i++;
        continue;
      }

      // Check for single-line variable: ={name}= value
      const singleLineMatch = line.match(/^=\{([^}]+)\}=(.*)$/);
      if (singleLineMatch) {
        const varName = singleLineMatch[1];
        const varValue = singleLineMatch[2];
        // Store value with nested variables unsubstituted for now
        this.variables.set(varName, varValue);
        i++;
        continue; // Don't add to newLines (remove from content)
      }

      // Check for multi-line variable start: ={name}<<= ...
      const multiLineMatch = line.match(/^=\{([^}]+)\}<<=.*$/);
      if (multiLineMatch) {
        const varName = multiLineMatch[1];
        const contentLines = [];
        i++; // Move past the start line

        // Collect lines until we find =>>
        while (i < this.lines.length) {
          const contentLine = this.lines[i];
          if (contentLine.match(/^=>>.*$/)) {
            // Found the end marker
            i++;
            break;
          }
          contentLines.push(contentLine);
          i++;
        }

        // Store content as array of lines for multi-line variables
        this.variables.set(varName, contentLines);
        continue; // Don't add to newLines (remove from content)
      }

      // Regular line - don't substitute yet, keep as-is
      newLines.push(line);
      i++;
    }

    this.lines = newLines;
    
    // Now substitute variables within variable definitions (for nesting)
    // and convert multi-line variables to strings
    for (const [varName, varValue] of this.variables.entries()) {
      if (Array.isArray(varValue)) {
        // Multi-line variable - substitute in each line then join
        const substitutedLines = varValue.map(line => this.substituteVariables(line));
        this.variables.set(varName, substitutedLines);
      } else {
        // Single-line variable - just substitute
        this.variables.set(varName, this.substituteVariables(varValue));
      }
    }

    // Now expand any standalone variable references into multiple lines
    const expandedLines = [];
    for (const line of this.lines) {
      // Check if line is a standalone variable reference: ${varname}
      const standaloneMatch = line.trim().match(/^\$\{([^}]+)\}$/);
      if (standaloneMatch) {
        const varName = standaloneMatch[1];
        if (this.variables.has(varName)) {
          const varValue = this.variables.get(varName);
          if (Array.isArray(varValue)) {
            // Multi-line variable - expand to multiple lines
            expandedLines.push(...varValue);
          } else {
            // Single-line variable - substitute normally
            expandedLines.push(this.substituteVariables(line));
          }
        } else {
          // Variable not defined
          this.usedBeforeDefined.add(varName);
          expandedLines.push(line);
        }
      } else {
        // Not a standalone variable reference - keep as-is (substitution happens during parsing)
        expandedLines.push(line);
      }
    }

    this.lines = expandedLines;
  }

  /**
   * Substitute variables in text
   */
  substituteVariables(text) {
    // Match ${variable_name} patterns
    return text.replace(/\$\{([^}]+)\}/g, (match, varName) => {
      if (this.variables.has(varName)) {
        const varValue = this.variables.get(varName);
        // If it's an array (multi-line variable), join with newlines
        if (Array.isArray(varValue)) {
          return varValue.join('\n');
        }
        return varValue;
      } else {
        // Variable not defined - track it and leave as literal
        this.usedBeforeDefined.add(varName);
        return match;
      }
    });
  }

  /**
   * Get current line without advancing
   */
  peek() {
    return this.index < this.lines.length ? this.lines[this.index] : null;
  }

  /**
   * Get current line and advance
   */
  next() {
    return this.index < this.lines.length ? this.lines[this.index++] : null;
  }

  /**
   * Check if we're at end of file
   */
  eof() {
    return this.index >= this.lines.length;
  }

  /**
   * Skip blank lines
   */
  skipBlankLines() {
    while (this.peek() !== null && this.peek().trim() === '') {
      this.next();
    }
  }

  /**
   * Expect a specific marker (e.g., ==== or ----)
   */
  expectMarker(marker, name) {
    this.skipBlankLines();
    const line = this.peek();
    if (line !== null && line.trim() === marker) {
      this.next();
      this.skipBlankLines();
      return true;
    }
    return false;
  }

  /**
   * Parse header section (title, author, date)
   */
  parseHeader() {
    this.skipBlankLines();

    // Title (mandatory)
    const title = this.next();
    if (!title) {
      throw new Error('Missing title');
    }
    this.result.title = this.substituteVariables(title.trim());

    // Author (optional) or Date
    let line = this.next();
    if (!line) {
      throw new Error('Missing date');
    }

    // Check if this is a date (YYYY-MM-DD format) after variable substitution
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const substitutedLine = this.substituteVariables(line.trim());
    if (datePattern.test(substitutedLine)) {
      // No author, this is the date - default to ${author}
      this.result.author = this.substituteVariables('${author}');
      this.result.date = substitutedLine;
    } else {
      // This is the author
      this.result.author = substitutedLine;
      // Next line must be date
      line = this.next();
      if (!line) {
        throw new Error('Missing date');
      }
      const substitutedDateLine = this.substituteVariables(line.trim());
      if (!datePattern.test(substitutedDateLine)) {
        throw new Error('Invalid or missing date');
      }
      this.result.date = substitutedDateLine;
    }

    this.skipBlankLines();
  }

  /**
   * Parse versions section
   */
  parseVersions() {
    this.result.versions = [];

    do {
      const version = this.parseVersion();
      if (version) {
        this.result.versions.push(version);
      }

      this.skipBlankLines();

      // Check for version divider (not end marker)
      // Divider is optional - only required if there's another version
      const line = this.peek();
      if (line && line.trim() === '----') {
        this.next();
        this.skipBlankLines();
        // Continue to parse next version
      } else {
        // No divider found - check if there might be another version
        // (i.e., a version label or segment label)
        if (line && (line.trim().startsWith('{{') || line.trim().startsWith('{'))) {
          // There's another version without a divider separator - continue parsing
        } else {
          // No more versions
          break;
        }
      }
    } while (true);
  }

  /**
   * Parse a single version
   */
  parseVersion() {
    this.skipBlankLines();

    // Check if we've hit the end-of-poem marker
    const firstLine = this.peek();
    if (!firstLine || firstLine.trim() === '====') {
      return null;
    }

    const version = {};

    // Check for version label
    if (firstLine.trim().startsWith('{{') && firstLine.trim().endsWith('}}')) {
      const label = firstLine.trim().slice(2, -2).trim();
      if (label) {
        version.label = this.substituteVariables(label);
      }
      this.next();
      this.skipBlankLines();
    }

    // Parse segments
    version.segments = [];
    while (true) {
      this.skipBlankLines();

      // Check if we've hit a divider or end marker
      const line = this.peek();
      if (!line || line.trim() === '----' || line.trim() === '====') {
        break;
      }

      const segment = this.parseSegment();
      if (!segment) {
        break;
      }
      version.segments.push(segment);
    }

    return version.segments.length > 0 ? version : null;
  }

  /**
   * Convert spaces to non-breaking spaces in poem lines
   * - Leading spaces (indentation) are converted to &nbsp;
   * - Multiple consecutive spaces within lines are converted to alternating
   *   space + &nbsp; pattern (e.g., "  " becomes " &nbsp;") to allow wrapping
   *   on small displays while preserving visual spacing
   */
  convertSpacesToNbsp(line) {
    // Convert leading spaces to &nbsp;
    const leadingSpaces = line.match(/^( +)/);
    if (leadingSpaces) {
      const nbspLeading = '&nbsp;'.repeat(leadingSpaces[1].length);
      line = nbspLeading + line.substring(leadingSpaces[1].length);
    }

    // Convert multiple consecutive spaces (2 or more) within the line
    // Pattern: first space is normal (allows wrapping), rest are &nbsp;
    line = line.replace(/( {2,})/g, (match) => ' ' + '&nbsp;'.repeat(match.length - 1));

    return line;
  }

  /**
   * Parse a segment within a version
   */
  parseSegment() {
    this.skipBlankLines();

    const line = this.peek();
    if (!line || line.trim() === '----' || line.trim() === '====') {
      return null;
    }

    const segment = {};

    // Check for segment label
    if (line.trim().startsWith('{') && line.trim().endsWith('}') && !line.trim().startsWith('{{')) {
      const label = line.trim().slice(1, -1).trim();
      if (label && label !== 'Synopsis' && label !== 'Full') {
        segment.label = this.substituteVariables(label);
        this.next();
        this.skipBlankLines();
      }
    }

    // Parse segment content (poem lines)
    const contentLines = [];
    while (true) {
      const contentLine = this.peek();
      if (!contentLine ||
          contentLine.trim() === '----' ||
          contentLine.trim() === '====') {
        break;
      }

      // Check if this is the start of a new segment (has a label)
      if (contentLine.trim().startsWith('{') && contentLine.trim().endsWith('}') &&
          !contentLine.trim().startsWith('{{')) {
        const possibleLabel = contentLine.trim().slice(1, -1).trim();
        if (possibleLabel && possibleLabel !== 'Synopsis' && possibleLabel !== 'Full') {
          // This is a new segment, stop here
          break;
        }
      }

      // Substitute variables first, then convert spaces to nbsp
      const processedLine = this.convertSpacesToNbsp(this.substituteVariables(this.next()));
      contentLines.push(processedLine);
    }

    if (contentLines.length > 0) {
      // Remove trailing blank lines from content
      while (contentLines.length > 0 && contentLines[contentLines.length - 1].trim() === '') {
        contentLines.pop();
      }

      if (contentLines.length > 0) {
        segment.lines = contentLines.join('\n') + '\n';
      }
    }

    return segment.lines ? segment : null;
  }

  /**
   * Parse audio section
   */
  parseAudio() {
    this.skipBlankLines();
    const audio = {};
    let hasAudio = false;

    while (true) {
      const line = this.peek();
      if (!line || line.trim() === '====') {
        break;
      }

      const trimmed = this.substituteVariables(line.trim());
      if (trimmed === 'Audiomack') {
        audio.audiomack = true;
        hasAudio = true;
        this.next();
      } else if (trimmed.startsWith('Suno:')) {
        const sunoPath = trimmed.substring(5).trim();
        if (sunoPath) {
          audio.suno = sunoPath;
          hasAudio = true;
        }
        this.next();
      } else if (trimmed === '') {
        this.next();
      } else {
        break;
      }
    }

    if (hasAudio) {
      this.result.audio = audio;
    }

    this.skipBlankLines();
  }

  /**
   * Parse postscript section
   */
  parsePostscript() {
    this.skipBlankLines();
    const postscripts = [];

    while (true) {
      this.skipBlankLines();

      // Check if we've hit the end marker or EOF
      const line = this.peek();
      if (!line || line.trim() === '====') {
        break;
      }

      const postscript = this.parsePostscriptNote();
      if (!postscript) {
        break;
      }
      postscripts.push(postscript);

      this.skipBlankLines();

      // Check for divider (optional - only required if there's another note)
      const divLine = this.peek();
      if (divLine && divLine.trim() === '----') {
        this.next();
        // Continue to parse next postscript note
      } else if (!divLine || divLine.trim() === '====') {
        break;
      } else {
        // Check if there might be another postscript note
        // (i.e., a label or content that's not a marker)
        if (divLine.trim().startsWith('{') || divLine.trim().startsWith('<<<')) {
          // There's another note without a divider - continue parsing
        } else {
          // Could be more content, let parsePostscriptNote decide
          break;
        }
      }
    }

    if (postscripts.length > 0) {
      this.result.postscript = postscripts;
    }

    this.skipBlankLines();
  }

  /**
   * Parse a single postscript note
   */
  parsePostscriptNote() {
    this.skipBlankLines();

    const line = this.peek();
    if (!line || line.trim() === '====') {
      return null;
    }

    // Check for literal block or reference
    if (line.trim() === '<<<') {
      return this.parseLiteralBlock();
    }

    const postscript = {};

    // Check for label
    if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
      const label = line.trim().slice(1, -1).trim();
      if (label && label !== 'Synopsis' && label !== 'Full') {
        postscript.label = this.substituteVariables(label);
        this.next();
        this.skipBlankLines();
      }
    }

    // Parse content paragraphs (keep reading until we hit a divider or marker)
    // Multiple paragraphs within one postscript are separated by blank lines
    // Different postscripts are separated by ---- dividers
    const paragraphs = [];
    let currentParagraph = [];

    while (true) {
      const contentLine = this.peek();

      // Stop at end of file or structural markers
      if (contentLine === null ||
          contentLine.trim() === '----' ||
          contentLine.trim() === '====' ||
          contentLine.trim() === '<<<') {
        break;
      }

      if (contentLine.trim() === '') {
        // Blank line - save current paragraph if we have one
        if (currentParagraph.length > 0) {
          paragraphs.push(this.convertMarkup(currentParagraph.join(' ')));
          currentParagraph = [];
        }
        this.next();
      } else {
        // Add line to current paragraph (with variable substitution)
        currentParagraph.push(this.substituteVariables(contentLine.trim()));
        this.next();
      }
    }

    // Add final paragraph
    if (currentParagraph.length > 0) {
      paragraphs.push(this.convertMarkup(currentParagraph.join(' ')));
    }

    if (paragraphs.length > 0) {
      postscript.content = paragraphs.map(p => `<p>${p}</p>`).join('\n\n') + '\n';
    }

    // Parse any literal blocks that follow
    const literalBlocks = [];
    while (true) {
      this.skipBlankLines();
      const nextLine = this.peek();
      
      // Stop at end of file or structural markers
      if (!nextLine || nextLine.trim() === '----' || nextLine.trim() === '====') {
        break;
      }
      
      // Check for literal block
      if (nextLine.trim() === '<<<') {
        const literalBlock = this.parseLiteralBlock();
        if (literalBlock) {
          literalBlocks.push(literalBlock);
        }
      } else {
        // Not a literal block, stop
        break;
      }
    }

    // Append literal blocks to content
    if (literalBlocks.length > 0) {
      for (const block of literalBlocks) {
        if (block.$ref) {
          // It's a $ref block, return just the reference
          return block;
        } else if (block.content) {
          // It's a literal content block, append to postscript content
          if (!postscript.content) {
            postscript.content = '';
          }
          postscript.content += '\n' + block.content;
        }
      }
    }

    return postscript.content || postscript.label ? postscript : null;
  }

  /**
   * Parse literal block
   */
  parseLiteralBlock() {
    this.next(); // Skip <<<
    const lines = [];

    while (true) {
      const line = this.peek();
      if (!line || line.trim() === '>>>') {
        break;
      }
      lines.push(line);
      this.next();
    }

    if (this.peek() && this.peek().trim() === '>>>') {
      this.next(); // Skip >>>
    }

    // Get the content
    const content = lines.join('\n');

    // Check if this is a $ref line
    if (content.trim().includes('$ref:')) {
      // Parse as YAML to get the reference
      try {
        const parsed = yaml.load(content.trim());
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].$ref) {
          return { '$ref': parsed[0].$ref };
        }
      } catch (e) {
        // If not valid YAML, fall through to return as literal content
      }
    }

    // Return the literal content as-is (no markup conversion)
    return { content: content };
  }

  /**
   * Parse analysis section
   */
  parseAnalysis() {
    this.skipBlankLines();

    const line = this.peek();
    if (!line || line.trim() === '====') {
      return;
    }

    const analysis = {};

    // Check for Synopsis
    if (line.trim() === '{Synopsis}') {
      this.next();
      this.skipBlankLines();
      analysis.synopsis = this.parseAnalysisContent();
      this.skipBlankLines();
    }

    // Check for Full
    const fullLine = this.peek();
    if (fullLine && fullLine.trim() === '{Full}') {
      this.next();
      this.skipBlankLines();
      analysis.full = this.parseAnalysisContent();
    }

    if (Object.keys(analysis).length > 0) {
      this.result.analysis = analysis;
    }
  }

  /**
   * Parse analysis content (synopsis or full)
   */
  parseAnalysisContent() {
    const blocks = [];
    let currentParagraph = [];

    while (true) {
      const line = this.peek();

      // Stop at end of file or end marker or if we hit the next section label
      if (line === null || line.trim() === '====') {
        break;
      }

      // Check for section labels (Synopsis or Full)
      if (line.trim() === '{Synopsis}' || line.trim() === '{Full}') {
        break;
      }

      const trimmed = line.trim();

      // Check for headings (process longer patterns first)
      if (trimmed.startsWith('### ')) {
        // H5
        if (currentParagraph.length > 0) {
          blocks.push(`<p>${this.convertMarkup(currentParagraph.join(' '))}</p>`);
          currentParagraph = [];
        }
        const headingText = this.convertMarkup(this.substituteVariables(trimmed.substring(4).trim()));
        blocks.push(`<h5>${headingText}</h5>`);
        this.next();
      } else if (trimmed.startsWith('## ')) {
        // H4
        if (currentParagraph.length > 0) {
          blocks.push(`<p>${this.convertMarkup(currentParagraph.join(' '))}</p>`);
          currentParagraph = [];
        }
        const headingText = this.convertMarkup(this.substituteVariables(trimmed.substring(3).trim()));
        blocks.push(`<h4>${headingText}</h4>`);
        this.next();
      } else if (trimmed.startsWith('# ')) {
        // H3
        if (currentParagraph.length > 0) {
          blocks.push(`<p>${this.convertMarkup(currentParagraph.join(' '))}</p>`);
          currentParagraph = [];
        }
        const headingText = this.convertMarkup(this.substituteVariables(trimmed.substring(2).trim()));
        blocks.push(`<h3>${headingText}</h3>`);
        this.next();
      } else if (trimmed === '') {
        // Blank line - end current paragraph
        if (currentParagraph.length > 0) {
          blocks.push(`<p>${this.convertMarkup(currentParagraph.join(' '))}</p>`);
          currentParagraph = [];
        }
        this.next();
      } else {
        currentParagraph.push(this.substituteVariables(trimmed));
        this.next();
      }
    }

    // Add final paragraph
    if (currentParagraph.length > 0) {
      blocks.push(`<p>${this.convertMarkup(currentParagraph.join(' '))}</p>`);
    }

    return blocks.length > 0 ? blocks.join('\n\n') + '\n' : '';
  }

  /**
   * Convert inline markup to HTML
   */
  convertMarkup(text) {
    // Process escapes first
    const escapes = new Map();
    let escapeIndex = 0;
    text = text.replace(/\\([_*~\[`"&'\-<>=$\\])/g, (match, char) => {
      const placeholder = `\x00ESCAPE${escapeIndex++}\x00`;
      escapes.set(placeholder, char);
      return placeholder;
    });

    // Convert markup (process longer patterns first)
    text = text.replace(/---/g, '&#8212;'); // Em dash
    text = text.replace(/--/g, '&#8211;'); // En dash

    // Links: [text|url] - use &quot; to avoid smart quote conversion
    text = text.replace(/\[([^\]|]+)\|([^\]]+)\]/g, '<a href=&quot;https://$2&quot;>$1</a>');

    // Span elements: <<.classname:content>> - use &quot; to avoid smart quote conversion
    text = text.replace(/<<\.([^:>]*):(.*?)>>/g, (match, className, content) => {
      if (className === '') {
        console.warn('Warning: Span element with empty class name');
        return `<span>${content}</span>`;
      }
      
      // Validate class name with regex: /^\w(?:[\w\.-]*\w)?$/
      const classNameRegex = /^\w(?:[\w\.-]*\w)?$/;
      if (!classNameRegex.test(className)) {
        console.warn(`Warning: Invalid span class name: "${className}"`);
        return match; // Leave unchanged
      }
      
      return `<span class=&quot;${className}&quot;>${content}</span>`;
    });

    // Smart quotes
    text = text.replace(/`([^`]+)`/g, '&#8216;$1&#8217;'); // Single quotes
    text = text.replace(/"([^"]+)"/g, '&#8220;$1&#8221;'); // Double quotes

    // Basic formatting
    text = text.replace(/\~([^~]+)\~/g, '<s>$1</s>'); // Strikethrough
    text = text.replace(/\*([^*]+)\*/g, '<strong>$1</strong>'); // Strong
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>'); // Emphasis

    // Entities - convert & to &#38; but NOT if it's already part of an entity (&#...;)
    text = text.replace(/&(?!#\d+;|[a-z]+;)/gi, '&#38;');
    text = text.replace(/'/g, '&#39;');

    // Restore escapes
    for (const [placeholder, char] of escapes.entries()) {
      text = text.replace(placeholder, char);
    }

    return text;
  }
}

/**
 * Convert a .poem file to YAML
 */
function convertPoemToYaml(poemFilePath) {
  let content = fs.readFileSync(poemFilePath, 'utf8');
  
  // Prepend .shared.poem if it exists in the same directory
  const poemDir = path.dirname(poemFilePath);
  const sharedPoemPath = path.join(poemDir, '.shared.poem');
  
  if (fs.existsSync(sharedPoemPath)) {
    const sharedContent = fs.readFileSync(sharedPoemPath, 'utf8');
    content = sharedContent + content;
  }
  
  const parser = new PoemParser(content);
  const data = parser.parse();

  return yaml.dump(data, {
    lineWidth: -1, // Don't wrap lines
    noRefs: true,  // Don't use YAML references
  });
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: poem-to-yaml.js <file.poem> [output.yaml]');
    console.error('   or: poem-to-yaml.js --all');
    process.exit(1);
  }

  if (args[0] === '--all') {
    // Convert all .poem files in poems/ directory
    const poemsDir = path.join(process.cwd(), 'poems');
    const files = fs.readdirSync(poemsDir);

    for (const file of files) {
      // Skip .shared.poem (it's included by other files)
      if (file.endsWith('.poem') && file !== '.shared.poem') {
        const poemPath = path.join(poemsDir, file);
        const yamlPath = path.join(poemsDir, file.replace('.poem', '.yaml'));

        try {
          console.log(`Converting ${file}...`);
          const yamlContent = convertPoemToYaml(poemPath);
          fs.writeFileSync(yamlPath, yamlContent, 'utf8');
          console.log(`  → ${path.basename(yamlPath)}`);
        } catch (error) {
          console.error(`Error converting ${file}:`, error.message);
        }
      }
    }
  } else {
    // Convert single file
    const inputFile = args[0];
    const outputFile = args[1] || inputFile.replace('.poem', '.yaml');

    try {
      const yamlContent = convertPoemToYaml(inputFile);
      fs.writeFileSync(outputFile, yamlContent, 'utf8');
      console.log(`Converted ${inputFile} → ${outputFile}`);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { PoemParser, convertPoemToYaml };

