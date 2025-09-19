#!/usr/bin/env node
/**
 * Build script to generate all-poems.html for GitHub Pages
 * Extracts the concatenation logic from serve-static.js
 */

const fs = require("fs");
const path = require("path");

function extractCustomCSSFromTemplate() {
  try {
    const templatePath = path.join(
      process.cwd(),
      "fragments-and-unity.template.html"
    );
    if (!fs.existsSync(templatePath)) {
      return "";
    }

    const templateContent = fs.readFileSync(templatePath, "utf8");
    const customCSSMatch = templateContent.match(
      /\/\* ~~ CUSTOM CSS START ~~ \*\/([\s\S]*?)\/\* ~~ CUSTOM CSS END ~~ \*\//
    );

    if (customCSSMatch && customCSSMatch[1]) {
      return customCSSMatch[1].trim();
    }

    return "";
  } catch (err) {
    console.warn(
      "Warning: Could not extract custom CSS from template:",
      err.message
    );
    return "";
  }
}

function concatenateAllHtmlFiles(dirPath) {
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    const htmlFiles = items
      .filter(
        (item) => item.isFile() && item.name.toLowerCase().endsWith(".html")
      )
      .filter((item) => !["index.html", "all-poems.html"].includes(item.name))
      .sort(); // Sort alphabetically for consistent ordering

    if (htmlFiles.length === 0) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>No HTML Files Found</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        h1 { color: #333; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>No HTML Files Found</h1>
        <p>No HTML files were found in the directory.</p>
    </div>
</body>
</html>`;
    }

    // Extract poem data from HTML files
    const poemData = [];
    htmlFiles.forEach((file, index) => {
      const filePath = path.join(dirPath, file.name);
      const fileName = file.name.replace(".html", "");
      const anchor = `poem-${index}`;

      try {
        const content = fs.readFileSync(filePath, "utf8");

        // Extract title from span id="title--suffix" or fallback to id="title"
        // Handle both single-line and multiline formats
        const titleMatch =
          content.match(/<span id="title--[^"]*"[^>]*>([\s\S]*?)<\/span>/) ||
          content.match(/<span id="title"[^>]*>([\s\S]*?)<\/span>/);
        const title = titleMatch ? titleMatch[1].trim() : fileName;

        // Extract date from span id="date--suffix" or fallback to id="date"
        // Handle both single-line and multiline formats
        const dateMatch =
          content.match(/<span id="date--[^"]*"[^>]*>([\s\S]*?)<\/span>/) ||
          content.match(/<span id="date"[^>]*>([\s\S]*?)<\/span>/);
        const date = dateMatch ? dateMatch[1].trim() : "Unknown Date";

        // Check for active song link (not commented out) - handle both old and new ID formats
        const hasSongLink =
          (content.includes('<div id="song--') &&
            !content.includes('<!-- div id="song--')) ||
          (content.includes('<div id="song" class="song-link">') &&
            !content.includes('<!-- div id="song" class="song-link">'));

        poemData.push({
          fileName,
          title,
          date,
          anchor,
          filePath,
          hasSongLink,
        });
      } catch (err) {
        poemData.push({
          fileName,
          title: fileName,
          date: "Unknown Date",
          anchor,
          filePath,
          hasSongLink: false,
        });
      }
    });

    // Sort poems by date (oldest first) for display order
    poemData.sort((a, b) => {
      const parseDate = (dateStr) => {
        if (dateStr === "Unknown Date") return new Date(0);

        // Handle format: "Monday, 4 May 2015" or "Friday, 1 August 1997"
        const months = {
          January: 0,
          February: 1,
          March: 2,
          April: 3,
          May: 4,
          June: 5,
          July: 6,
          August: 7,
          September: 8,
          October: 9,
          November: 10,
          December: 11,
        };

        const parts = dateStr.split(", ");
        if (parts.length >= 2) {
          const datePart = parts[1].split(" ");
          if (datePart.length >= 3) {
            const day = parseInt(datePart[0]);
            const month = months[datePart[1]];
            const year = parseInt(datePart[2]);
            if (!isNaN(day) && month !== undefined && !isNaN(year)) {
              return new Date(year, month, day);
            }
          }
        }
        return new Date(0); // fallback for invalid dates
      };

      const aDate = parseDate(a.date);
      const bDate = parseDate(b.date);
      return aDate - bDate; // oldest first
    });

    // Regenerate anchors based on sorted order
    poemData.forEach((poem, index) => {
      poem.anchor = `poem-${index}`;
    });

    // Extract custom CSS from template
    const customCSS = extractCustomCSSFromTemplate();

    let concatenatedContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Poems - Concatenated View</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 30px; text-align: center; }
        h1 { color: #333; margin: 0 0 10px 0; font-weight: 300; }
        .subtitle { color: #666; margin: 0; }
        .poem-section { background: white; margin-bottom: 30px; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .poem-title { color: #333; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #f0f0f0; font-size: 1.5em; }
        .poem-content { line-height: 1.6; color: #444; }
        .toc { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 30px; }
        .toc h2 { color: #333; margin: 0 0 20px 0; }
        .toc-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .toc-table th, .toc-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        .toc-table th { background: #f8f9fa; font-weight: 600; color: #333; cursor: pointer; user-select: none; }
        .toc-table th:hover { background: #e9ecef; }
        .toc-table th.sortable::after { content: " ↕"; opacity: 0.5; }
        .toc-table th.sort-asc::after { content: " ↑"; opacity: 1; }
        .toc-table th.sort-desc::after { content: " ↓"; opacity: 1; }
        .toc-table tr:hover { background: #f8f9fa; }
        .toc-table a { color: #007AFF; text-decoration: none; }
        .toc-table a:hover { text-decoration: underline; }
        .audio-cell { text-align: center; font-size: 1.2em; }
        .audio-cell:empty::after { content: "—"; color: #ccc; }
        .back-link { display: inline-block; margin-bottom: 20px; color: #007AFF; text-decoration: none; }
        .back-link:hover { text-decoration: underline; }
        
        /* Custom CSS from template */
        ${customCSS}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>All Poems</h1>
            <p class="subtitle">Concatenated view of all HTML files (${htmlFiles.length} files)</p>
            <a href="index.html" class="back-link">← Back to Main Page</a>
        </div>
        
        <div class="toc">
            <h2>Table of Contents</h2>
            <table class="toc-table" id="poemTable">
                <thead>
                    <tr>
                        <th class="sortable" onclick="sortTable(0, 'title')">Poem Title</th>
                        <th class="sortable" onclick="sortTable(1, 'date')">Poem Date</th>
                        <th class="sortable" onclick="sortTable(2, 'audio')">🎵 Audio</th>
                    </tr>
                </thead>
                <tbody id="poemTableBody">`;

    // Add table rows with poem data
    poemData.forEach((poem) => {
      const audioIcon = poem.hasSongLink ? "🎵" : "";
      concatenatedContent += `<tr>
                        <td><a href="#${poem.anchor}">${poem.title}</a></td>
                        <td>${poem.date}</td>
                        <td class="audio-cell">${audioIcon}</td>
                    </tr>`;
    });

    concatenatedContent += `</tbody>
            </table>
        </div>`;

    // Add each HTML file content
    poemData.forEach((poem) => {
      try {
        const content = fs.readFileSync(poem.filePath, "utf8");

        // Extract content between <body> tags, or use the entire content if no body tags
        const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const poemContent = bodyMatch ? bodyMatch[1] : content;

        concatenatedContent += `
        <div class="poem-section" id="${poem.anchor}">
            <h2 class="poem-title">${poem.title}</h2>
            <div class="poem-content">${poemContent}</div>
        </div>`;
      } catch (err) {
        concatenatedContent += `
        <div class="poem-section" id="${poem.anchor}">
            <h2 class="poem-title">${poem.title}</h2>
            <div class="poem-content"><p style="color: #999; font-style: italic;">Error reading file: ${err.message}</p></div>
        </div>`;
      }
    });

    concatenatedContent += `
    </div>
    
    <script>
        let currentSort = { column: -1, direction: 'asc' };
        
        function parseDate(dateStr) {
            if (dateStr === "Unknown Date") return new Date(0);
            
            // Handle format: "Monday, 4 May 2015" or "Friday, 1 August 1997"
            const months = {
                'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
                'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
            };
            
            const parts = dateStr.split(', ');
            if (parts.length >= 2) {
                const datePart = parts[1].split(' ');
                if (datePart.length >= 3) {
                    const day = parseInt(datePart[0]);
                    const month = months[datePart[1]];
                    const year = parseInt(datePart[2]);
                    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
                        return new Date(year, month, day);
                    }
                }
            }
            return new Date(0); // fallback for invalid dates
        }
        
        function sortTable(columnIndex, sortType) {
            const table = document.getElementById('poemTable');
            const tbody = document.getElementById('poemTableBody');
            const rows = Array.from(tbody.getElementsByTagName('tr'));
            
            // Determine sort direction
            if (currentSort.column === columnIndex) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.direction = 'asc';
            }
            currentSort.column = columnIndex;
            
            // Update header styling
            const headers = table.getElementsByTagName('th');
            for (let i = 0; i < headers.length; i++) {
                headers[i].className = 'sortable';
                if (i === columnIndex) {
                    headers[i].className = currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc';
                }
            }
            
            // Sort rows
            rows.sort((a, b) => {
                const aVal = a.cells[columnIndex].textContent.trim();
                const bVal = b.cells[columnIndex].textContent.trim();
                
                let comparison = 0;
                
                if (sortType === 'date') {
                    const aDate = parseDate(aVal);
                    const bDate = parseDate(bVal);
                    comparison = aDate - bDate;
                } else if (sortType === 'audio') {
                    // Audio sorting: songs first (🎵), then no audio
                    const aHasAudio = aVal.includes('🎵');
                    const bHasAudio = bVal.includes('🎵');
                    comparison = bHasAudio - aHasAudio; // Songs first (1-0 = 1, 0-1 = -1)
                } else {
                    // String comparison (for titles)
                    comparison = aVal.localeCompare(bVal);
                }
                
                return currentSort.direction === 'asc' ? comparison : -comparison;
            });
            
            // Re-append sorted rows
            rows.forEach(row => tbody.appendChild(row));
        }
    </script>
</body>
</html>`;

    return concatenatedContent;
  } catch (err) {
    return `<!DOCTYPE html><html><body><h1>Error reading directory</h1><p>${err.message}</p></body></html>`;
  }
}

// Main execution
function main() {
  const publicDir = path.join(process.cwd(), "public");

  if (!fs.existsSync(publicDir)) {
    console.error(`Error: Public directory not found: ${publicDir}`);
    process.exit(1);
  }

  console.log("Building all-poems.html...");

  const concatenatedContent = concatenateAllHtmlFiles(publicDir);
  const outputPath = path.join(publicDir, "all-poems.html");

  fs.writeFileSync(outputPath, concatenatedContent, "utf8");

  console.log(`✅ Successfully generated ${outputPath}`);
  console.log(
    `📊 Processed ${
      fs.readdirSync(publicDir).filter((f) => f.endsWith(".html")).length
    } HTML files`
  );
}

if (require.main === module) {
  main();
}

module.exports = { concatenateAllHtmlFiles, extractCustomCSSFromTemplate };
