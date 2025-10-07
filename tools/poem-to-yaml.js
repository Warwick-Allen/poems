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
  }

  /**
   * Main parse method
   */
  parse() {
    // Remove comment blocks first
    this.removeCommentBlocks();
    
    this.parseHeader();
    this.parseVersions();
    this.expectMarker('====', 'end-of-poem');
    this.parseAudio();
    this.expectMarker('====', 'end-of-audio');
    this.parsePostscript();
    this.expectMarker('====', 'end-of-postscript');
    this.parseAnalysis();
    
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
    this.result.title = title.trim();

    // Author (optional) or Date
    let line = this.next();
    if (!line) {
      throw new Error('Missing date');
    }

    // Check if this is a date (YYYY-MM-DD format)
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (datePattern.test(line.trim())) {
      // No author, this is the date
      this.result.date = line.trim();
    } else {
      // This is the author
      this.result.author = line.trim();
      // Next line must be date
      line = this.next();
      if (!line || !datePattern.test(line.trim())) {
        throw new Error('Invalid or missing date');
      }
      this.result.date = line.trim();
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
      const line = this.peek();
      if (line && line.trim() === '----') {
        this.next();
        this.skipBlankLines();
      } else {
        // No more versions
        break;
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
        version.label = label;
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
        segment.label = label;
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
      
      contentLines.push(this.next());
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

      const trimmed = line.trim();
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
      
      // Check if we've hit the end marker
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
      
      // Check for divider
      const divLine = this.peek();
      if (divLine && divLine.trim() === '----') {
        this.next();
      } else if (!divLine || divLine.trim() === '====') {
        break;
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
        postscript.label = label;
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
        // Add line to current paragraph
        currentParagraph.push(contentLine.trim());
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

    // Check if this is a $ref line
    const content = lines.join('\n').trim();
    if (content.includes('$ref:')) {
      // Parse as YAML to get the reference
      try {
        const parsed = yaml.load(content);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].$ref) {
          return { '$ref': parsed[0].$ref };
        }
      } catch (e) {
        // If not valid YAML, return as literal content
      }
    }

    return null;
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
        const headingText = this.convertMarkup(trimmed.substring(4).trim());
        blocks.push(`<h5>${headingText}</h5>`);
        this.next();
      } else if (trimmed.startsWith('## ')) {
        // H4
        if (currentParagraph.length > 0) {
          blocks.push(`<p>${this.convertMarkup(currentParagraph.join(' '))}</p>`);
          currentParagraph = [];
        }
        const headingText = this.convertMarkup(trimmed.substring(3).trim());
        blocks.push(`<h4>${headingText}</h4>`);
        this.next();
      } else if (trimmed.startsWith('# ')) {
        // H3
        if (currentParagraph.length > 0) {
          blocks.push(`<p>${this.convertMarkup(currentParagraph.join(' '))}</p>`);
          currentParagraph = [];
        }
        const headingText = this.convertMarkup(trimmed.substring(2).trim());
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
        currentParagraph.push(trimmed);
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
    text = text.replace(/\\([_*~\[`"&'\-<>\\])/g, (match, char) => {
      const placeholder = `__ESCAPE_${escapeIndex++}__`;
      escapes.set(placeholder, char);
      return placeholder;
    });

    // Convert markup (process longer patterns first)
    text = text.replace(/---/g, '&#8212;'); // Em dash
    text = text.replace(/--/g, '&#8211;'); // En dash
    
    // Links: [text|url]
    text = text.replace(/\[([^\]|]+)\|([^\]]+)\]/g, '<a href="https://$2">$1</a>');
    
    // Smart quotes
    text = text.replace(/`([^`]+)`/g, '&#8216;$1&#8217;'); // Single quotes
    text = text.replace(/"([^"]+)"/g, '&#8220;$1&#8221;'); // Double quotes
    
    // Basic formatting
    text = text.replace(/\~([^~]+)\~/g, '<s>$1</s>'); // Strikethrough
    text = text.replace(/\*([^*]+)\*/g, '<strong>$1</strong>'); // Strong
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>'); // Emphasis
    
    // Entities
    text = text.replace(/&/g, '&#38;');
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
  const content = fs.readFileSync(poemFilePath, 'utf8');
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
      if (file.endsWith('.poem')) {
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

