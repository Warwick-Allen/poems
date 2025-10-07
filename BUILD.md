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

### What the Build Scripts Do

#### Main Build Script (`tools/build-all-poems.js`)

The main build script:

1. Scans the `public/` directory for all HTML files
2. Extracts metadata (title, date, audio links) from each poem
3. Sorts poems chronologically by date using the date utility functions
4. Generates a comprehensive `all-poems.html` file with:
   - Table of contents with sorting functionality
   - All poems concatenated in chronological order
   - Custom CSS from the template
   - Interactive sorting by title, date, or audio availability

#### Date Utility Functions (`tools/date-utils.js`)

The build system includes utility functions for handling date formats:

- **`formatDateForDisplay(dateStr)`** - Converts ISO date format (`yyyy-mm-dd`) to display format (`DayOfWeek, DD Month YYYY`)
- **`parseDateForSorting(dateStr)`** - Parses date strings for chronological sorting, handling both ISO and display formats

These utilities ensure consistent date handling across the build process and support migration from the old date format.

#### Blogger Template Script (`tools/build-blogger.js`)

The Blogger template script:

1. Reads CSS content from `public/styles.css`
2. Locates the Blogger template file `public/fragments-and-unity.template.html`
3. Finds CSS delimiters `/* ~~ CUSTOM CSS START ~~ */` and `/* ~~ CUSTOM CSS END ~~ */`
4. Replaces the content between these delimiters with the styles from `styles.css`
5. Provides error handling for missing files or malformed delimiters
6. Updates the template file in place for uploading to Blogger

### Workflow for Updates

When you add new poems or update existing ones:

1. Add your new poem HTML file to the `public/` directory
2. Run `npm run build` to regenerate `all-poems.html`
3. Commit and push to GitHub
4. GitHub Pages will automatically update

### Workflow for Blogger Template Updates

When you need to update the Blogger template with new CSS:

1. Make changes to `public/styles.css`
2. Run `npm run build:blogger` to inject the CSS into the template
3. Copy the updated `public/fragments-and-unity.template.html` content
4. Paste it into the Blogger template editor
5. Save the template in Blogger

The script will automatically handle the CSS injection and provide feedback on success or any errors encountered.

### Date Format Migration

The build system has been updated to use ISO date format (`yyyy-mm-dd`) in YAML files instead of the previous display format (`DayOfWeek, DD Month YYYY`). This change provides:

- **Better sorting**: ISO format sorts correctly as strings
- **Easier editing**: Standardised format is easier to work with
- **Backward compatibility**: The date utility functions handle both formats during migration

**Migration completed**: All poem YAML files have been updated to use the new ISO date format.

### File Structure

```
public/
├── index.html                           # Main landing page
├── all-poems.html                       # Generated concatenated view
├── styles.css                           # CSS styles for Blogger template
├── fragments-and-unity.template.html    # Blogger template with injected CSS
├── poem1.html                           # Individual poems
├── poem2.html
└── ...

tools/
├── build-all-poems.js                   # Main build script
├── build-poems.js                       # Individual poem builder
├── date-utils.js                        # Date format utilities
├── serve-static.js                      # Development server
└── ...
```

### Customisation

The build script uses the same logic as the development server (`tools/serve-static.js`) but generates a static file instead of serving dynamically. You can modify the styling or functionality by editing the build script.
