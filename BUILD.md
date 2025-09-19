# Building for GitHub Pages

This repository contains a collection of poems that are published to GitHub Pages at https://warwick-allen.github.io/poems/

## Build Process

Since GitHub Pages serves static files only, we use a build script to generate the concatenated "all poems" view.

### Quick Start

1. **Build the all-poems.html file:**

   ```bash
   npm run build
   ```

2. **Build and start local server:**

   ```bash
   npm run build:all
   ```

3. **View locally:**
   - Main page: http://localhost:8080
   - All poems: http://localhost:8080/all-poems.html

### What the Build Script Does

The `tools/build-all-poems.js` script:

1. Scans the `public/` directory for all HTML files
2. Extracts metadata (title, date, audio links) from each poem
3. Sorts poems chronologically by date
4. Generates a comprehensive `all-poems.html` file with:
   - Table of contents with sorting functionality
   - All poems concatenated in chronological order
   - Custom CSS from the template
   - Interactive sorting by title, date, or audio availability

### Workflow for Updates

When you add new poems or update existing ones:

1. Add your new poem HTML file to the `public/` directory
2. Run `npm run build` to regenerate `all-poems.html`
3. Commit and push to GitHub
4. GitHub Pages will automatically update

### File Structure

```
public/
├── index.html          # Main landing page
├── all-poems.html      # Generated concatenated view
├── poem1.html          # Individual poems
├── poem2.html
└── ...
```

### Customisation

The build script uses the same logic as the development server (`tools/serve-static.js`) but generates a static file instead of serving dynamically. You can modify the styling or functionality by editing the build script.
