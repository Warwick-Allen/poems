#!/usr/bin/env node
/**
 * Build script to generate individual poem HTML files from YAML sources
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const pug = require("pug");

const POEMS_DIR = path.join(process.cwd(), "poems");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const TEMPLATE_FILE = path.join(process.cwd(), "templates", "poem.pug");

/**
 * Read and parse a YAML poem file
 */
function readPoemFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const data = yaml.load(content);
    return data;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return null;
  }
}

/**
 * Generate HTML from a poem data object
 */
function generatePoemHTML(poemData) {
  try {
    const compiledFunction = pug.compileFile(TEMPLATE_FILE, {
      pretty: false,
    });
    const html = compiledFunction(poemData);
    return html;
  } catch (err) {
    console.error(`Error generating HTML for ${poemData.title}:`, err.message);
    return null;
  }
}

/**
 * Process all YAML files in the poems directory
 */
function buildAllPoems() {
  // Ensure directories exist
  if (!fs.existsSync(POEMS_DIR)) {
    console.error(`Error: Poems directory not found: ${POEMS_DIR}`);
    process.exit(1);
  }

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  if (!fs.existsSync(TEMPLATE_FILE)) {
    console.error(`Error: Template file not found: ${TEMPLATE_FILE}`);
    process.exit(1);
  }

  // Get all YAML files
  const yamlFiles = fs
    .readdirSync(POEMS_DIR)
    .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
    .filter((file) => !file.startsWith("YAML-SCHEMA"));

  if (yamlFiles.length === 0) {
    console.warn(`Warning: No YAML files found in ${POEMS_DIR}`);
    return;
  }

  console.log(`Found ${yamlFiles.length} poem(s) to build...`);

  let successCount = 0;
  let errorCount = 0;

  // Process each YAML file
  yamlFiles.forEach((yamlFile) => {
    const yamlPath = path.join(POEMS_DIR, yamlFile);
    const poemData = readPoemFile(yamlPath);

    if (!poemData) {
      errorCount++;
      return;
    }

    // Validate required fields
    if (!poemData.slug) {
      console.error(`Error: Missing 'slug' field in ${yamlFile}`);
      errorCount++;
      return;
    }

    // Check for empty segments and warn
    if (!poemData.segments || poemData.segments.length === 0) {
      console.warn(`⚠️  Warning: ${yamlFile} has empty segments block`);
    }

    // Generate HTML
    const html = generatePoemHTML(poemData);
    if (!html) {
      errorCount++;
      return;
    }

    // Write HTML file
    const outputFile = path.join(PUBLIC_DIR, `${poemData.slug}.html`);
    try {
      fs.writeFileSync(outputFile, html, "utf8");
      console.log(`✅ Generated ${poemData.slug}.html`);
      successCount++;
    } catch (err) {
      console.error(`Error writing ${outputFile}:`, err.message);
      errorCount++;
    }
  });

  console.log(
    `\n📊 Build complete: ${successCount} successful, ${errorCount} errors`
  );

  if (errorCount > 0) {
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  console.log("Building individual poem HTML files from YAML sources...\n");
  buildAllPoems();
}

module.exports = { buildAllPoems };
