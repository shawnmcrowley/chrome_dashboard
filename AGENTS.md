# AGENTS.md - Chrome Dashboard Extension

This document provides guidelines for agentic coding agents working on this Chrome Extension project.

## Project Overview

Chrome Dashboard is a Manifest V3 Chrome extension that replaces the new tab page with a personal productivity dashboard featuring weather, stock market data, RSS feeds, and task management. The project uses vanilla JavaScript, HTML, CSS, and Bootstrap 5.

## Build, Lint, and Test Commands

### No Build System
This is a pure Chrome Extension with no build system. Changes are loaded directly:

1. **Load/Reload Extension in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `/home/scrowley/Source/chrome_dashboard` directory
   - After code changes, click the reload icon on the extension card

2. **Development Testing**:
   - Open `index.html` directly in Chrome for basic UI testing
   - For full functionality, load as unpacked extension
   - Check `chrome://extensions/` → "service worker" link for background script logs
   - Use F12 DevTools on the dashboard page for console output

3. **No Automated Tests**:
   - This project has no test suite
   - Manual testing via browser required after changes

## Code Style Guidelines

### JavaScript Conventions

**General Style**:
- Use `const` by default, `let` only when reassignment is necessary
- Prefer arrow functions for anonymous callbacks
- Use semicolons at statement endings
- Use template literals for string interpolation

**Naming Conventions**:
- `camelCase` for variables and functions: `updateClock`, `fetchWeather`
- `UPPER_SNAKE_CASE` for constants: `OPENWEATHER_KEY`, `DEFAULT_FEEDS`
- `PascalCase` for constructor-like patterns (if used)
- Prefix DOM helper with `$`: `const $ = (id) => document.getElementById(id)`
- Prefix async storage helpers with `storage`: `storageGet`, `storageSet`

**Error Handling**:
- Wrap async operations in try/catch blocks
- Log errors using the `log` utility: `log.e('context', error)`
- Return error objects with descriptive codes: `{ error: 'no_key' }`
- Use `console.warn` for non-critical failures: `console.warn('storageSet', e)`

**File Structure**:
- `main.js` - Core application logic (clock, weather, stocks, RSS, todos)
- `panel.js` - Side panel functionality (Docker stats, utility links)
- `service-worker.js` - Background service worker
- `styles.css` - All custom styling (Bootstrap overrides and custom components)
- `index.html` - Main dashboard page
- `panel.html` - Side panel page
- `manifest.json` - Extension configuration
- `config.js` - API keys (gitignored, use `config.example.js` as template)

**Code Patterns**:
- Storage fallback: try Chrome storage first, fall back to localStorage
- API key pattern: `typeof CONFIG !== 'undefined' ? CONFIG.KEY : ''`
- Logging pattern: `const log = { d: (...a)=>console.debug('app:',...a), i:(...a)=>console.info('app:',...a), w:(...a)=>console.warn('app:',...a), e:(...a)=>console.error('app:',...a) }`

### CSS Conventions

**General**:
- Use CSS custom properties (variables) in `:root` for theming
- Bootstrap is included locally in `vendor/`
- Use Bootstrap utility classes first, custom CSS only when necessary

**Naming**:
- `kebab-case` for class names: `.weather-top`, `.bottom-panel`
- Prefix state classes: `.dragging`, `.dragover`
- Use BEM-like naming for complex components: `.panel-section`, `.rss-item`

**Styling Patterns**:
- Dark theme with CSS variables for colors
- Media queries for responsive design (900px, 600px breakpoints)
- Use `!important` sparingly, primarily for Bootstrap overrides

**File Organization**:
- CSS variables at top of `:root`
- Group by component/region
- Responsive styles at the end

### HTML Conventions

- Use semantic HTML elements
- Bootstrap 5 classes for layout and components
- Data attributes for JavaScript hooks: `data-*` attributes
- Include local Bootstrap and Bootstrap Icons from `vendor/` directory

### Chrome Extension Specifics

**Manifest V3**:
- Permissions must be declared in `manifest.json`
- Background code in `service-worker.js` (no persistent background pages)
- Content Security Policy defined in manifest

**Storage**:
- Use `chrome.storage.sync` for data that should sync across devices
- Fall back to `localStorage` when Chrome storage is unavailable
- API keys should never be stored in synced storage

**API Keys**:
- Never commit `config.js` to git (already in `.gitignore`)
- Use `config.example.js` as template for new configurations
- API keys are loaded at runtime: `typeof CONFIG !== 'undefined' ? CONFIG.KEY : ''`

## Common Tasks

### Adding a New Widget
1. Add HTML structure to `index.html`
2. Add corresponding CSS to `styles.css`
3. Add initialization and update logic to `main.js`
4. Update `manifest.json` if new permissions are needed

### Modifying Weather Locations
Edit the `WEATHER_LOCATIONS` array in `main.js`:
```javascript
const WEATHER_LOCATIONS = [
  { idPrefix: 'local', query: 'City,CC', units: 'imperial', timeZone: 'Region/City' }
];
```

### Modifying Stock Indices
Edit the `US_INDICES` array in `main.js`:
```javascript
const US_INDICES = [{ symbol: 'TICKER', name: 'Display Name', multiplier: 10.0 }];
```

### Adding RSS Feeds
Edit `DEFAULT_FEEDS` array in `main.js`:
```javascript
const DEFAULT_FEEDS = ['https://feed-url.com/rss'];
```

## Important Files

- `/home/scrowley/Source/chrome_dashboard/main.js:575` - Total lines, contains all main application logic
- `/home/scrowley/Source/chrome_dashboard/styles.css:509` - All custom styling
- `/home/scrowley/Source/chrome_dashboard/manifest.json:50` - Extension configuration
- `/home/scrowley/Source/chrome_dashboard/README.md` - User documentation

## Security Notes

- API keys are client-side only; do not expose sensitive keys
- All API calls use HTTPS
- Extension uses minimal permissions required for functionality
- Never commit `config.js` with real API keys
