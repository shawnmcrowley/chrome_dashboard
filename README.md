<div align="center">

# Chrome Dashboard Extension

**Personal productivity dashboard with weather, stock market data, RSS feeds, and task management**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4)](https://www.google.com/chrome/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)](https://developer.chrome.com/docs/extensions/mv3/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3)](https://getbootstrap.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

<a name="toc"></a>

[Features](#features) •
[Getting Started](#getting-started) •
[Configuration](#configuration) •
[API Setup](#api-setup) •
[Usage](#usage) •
[Troubleshooting](#troubleshooting)

</div>

---

<a name="overview"></a>

## 📋 Overview

A production-ready Chrome extension that replaces your new tab page with a beautiful, functional dashboard. Features real-time weather updates, live stock market data, RSS feed aggregation, and an integrated task manager with drag-and-drop functionality.

<a name="features"></a>

## ✨ Features

- 🕐 **Live Clock** - Real-time clock with date display
- 🌤️ **Weather Widget** - Current weather with location-based data (OpenWeather API)
- 📈 **Stock Market Data** - Live S&P 500, Dow Jones, and NASDAQ indices (Alpha Vantage API)
- 📰 **RSS Feed Reader** - Multi-feed aggregation with CORS proxy fallback
- ✅ **Task Manager** - Drag-and-drop to-do list with Chrome sync storage
- 🎨 **Modern UI** - Dark theme with gradient backgrounds and glassmorphism
- 🔧 **Utility Panel** - Quick access sidebar with local service links
- 💾 **Data Persistence** - Chrome storage sync across devices
- 🔐 **Secure Config** - API keys stored in gitignored config file

[Back to Top](#toc)

<a name="getting-started"></a>

## 🚀 Getting Started

### Prerequisites

- Google Chrome browser (version 110+)
- OpenWeather API key (free tier)
- Alpha Vantage API key (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/shawnmcrowley/chrome_dashboard.git

# Navigate to project directory
cd chrome_dashboard

# Copy config template
cp config.example.js config.js

# Edit config.js with your API keys
# OPENWEATHER_KEY: Get from https://openweathermap.org/api
# ALPHA_VANTAGE_KEY: Get from https://www.alphavantage.co/support/#api-key
```

### Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `chrome_dashboard` directory
5. Open a new tab to see your dashboard!

[Back to Top](#toc)

<a name="configuration"></a>

## 🔧 Configuration

### API Keys Setup

Edit `config.js` with your API keys:

```javascript
const CONFIG = {
  OPENWEATHER_KEY: 'your_openweather_api_key',
  ALPHA_VANTAGE_KEY: 'your_alpha_vantage_api_key'
};
```

### Weather Location

Edit `main.js` to change your location:

```javascript
// Line ~113
async function loadWeather() {
  const data = await fetchWeatherForCity('Your City, State', 'ZIP_CODE');
  // ...
}
```

### Stock Market Indices

Modify `US_INDICES` in `main.js` to customize displayed markets:

```javascript
const US_INDICES = [
  { symbol: 'SPY', name: 'S&P 500', multiplier: 10.0 },
  { symbol: 'DIA', name: 'Dow Jones', multiplier: 100.0 },
  { symbol: 'QQQ', name: 'NASDAQ', multiplier: 30.0 }
];
```

### RSS Feeds

Default feed is MakeUseOf. Add custom feeds in `main.js`:

```javascript
const DEFAULT_FEEDS = [
  'https://www.makeuseof.com/feed/',
  'https://your-custom-feed.com/rss'
];
```

[Back to Top](#toc)

<a name="api-setup"></a>

## 🔑 API Setup

### OpenWeather API

1. Visit [OpenWeather API](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to **API keys** section
4. Copy your API key
5. Add to `config.js`

**Features Used:**
- Current weather data
- Temperature (Fahrenheit)
- Weather conditions and icons
- Location name

### Alpha Vantage API

1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Enter your email to receive free API key
3. Copy the API key from email
4. Add to `config.js`

**Features Used:**
- Real-time stock quotes
- ETF data (SPY, DIA, QQQ)
- Price and percentage change
- 5 calls/minute, 100 calls/day limit

**Note:** The extension converts ETF prices to approximate index values:
- SPY × 10 ≈ S&P 500 (~6,000)
- DIA × 100 ≈ Dow Jones (~44,000)
- QQQ × 30 ≈ NASDAQ (~15,000)

[Back to Top](#toc)

<a name="usage"></a>

## 📖 Usage

### Task Manager

- **Add Task**: Type in input field and press Enter or click +
- **Complete Task**: Click checkbox to mark as done
- **Reorder Tasks**: Drag and drop tasks using the grip icon
- **Delete Task**: Click the X button
- **Clear Completed**: Remove all completed tasks
- **Toggle View**: Show/hide completed tasks

### RSS Feeds

- **Add Feed**: Paste RSS URL and click + button
- **View Articles**: Scroll through feed items
- **Open Article**: Click article title to open in new tab
- **CORS Handling**: Automatic proxy fallback for blocked feeds

### Utility Panel

- **Open Panel**: Click sidebar icon (top right) or right-click page
- **Context Menu**: Right-click anywhere → "Open Utility Panel"
- **Close Panel**: Right-click → "Close Utility Panel"
- **Quick Links**: Access local services (Postgres, N8N, etc.)

### Data Sync

All data syncs across Chrome browsers where you're signed in:
- To-do list items
- RSS feed subscriptions
- Last weather data (cache)
- Last market data (cache)

[Back to Top](#toc)

<a name="project-structure"></a>

## 📁 Project Structure

```
chrome_dashboard/
├── icons/                      # Extension icons (16x16, 48x48, 128x128)
├── vendor/                     # Local Bootstrap and icons
│   ├── bootstrap/
│   └── bootstrap-icons/
├── config.js                   # API keys (gitignored)
├── config.example.js           # Config template
├── index.html                  # Main dashboard page
├── main.js                     # Core application logic
├── styles.css                  # Custom styles
├── panel.html                  # Utility sidebar panel
├── popup.html                  # Extension popup (optional)
├── manifest.json               # Chrome extension manifest
├── service-worker.js           # Background service worker
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

[Back to Top](#toc)

<a name="troubleshooting"></a>

## 🔧 Troubleshooting

### Weather Not Loading

**Issue**: Weather shows "--°" or "No API key"

**Solutions:**
1. Verify API key in `config.js`
2. Check OpenWeather API key is activated (can take 1-2 hours)
3. Test API key: `https://api.openweathermap.org/data/2.5/weather?zip=19382,US&units=imperial&appid=YOUR_KEY`
4. Check browser console (F12) for errors

### Stock Market Data Not Showing

**Issue**: Market data shows "Market data unavailable"

**Solutions:**
1. Verify Alpha Vantage API key in `config.js`
2. Check API rate limits (5 calls/min, 100 calls/day)
3. Wait 12 seconds between page reloads (rate limiting)
4. Mock data will display if API fails

### RSS Feeds Not Loading

**Issue**: Feeds show "Failed to fetch (CORS or invalid feed)"

**Solutions:**
1. Verify RSS feed URL is valid
2. Extension uses proxy fallback automatically
3. Some feeds block all external access
4. Try alternative feed URLs

### Side Panel Not Opening

**Issue**: Button or context menu doesn't open panel

**Solutions:**
1. Reload extension in `chrome://extensions/`
2. Check manifest.json has `sidePanel` permission
3. Verify service-worker.js is running
4. Check browser console for errors

### Extension Not Loading

**Issue**: Extension shows errors or doesn't load

**Solutions:**
1. Ensure Chrome version 110+
2. Check all files are present
3. Verify manifest.json syntax
4. Reload extension after changes
5. Check service worker errors in extension details

[Back to Top](#toc)

<a name="customization"></a>

## 🎨 Customization

### Change Theme Colors

Edit `styles.css` CSS variables:

```css
:root {
  --bg-1: #040607;
  --bg-2: #071017;
  --accent-teal: #60d9c9;
  --accent-blue: #3aa6ff;
}
```

### Modify Clock Format

Edit `formatClockParts()` in `main.js` for 24-hour format:

```javascript
function formatClockParts(date) {
  const hh = String(date.getHours()).padStart(2,'0');
  const mm = String(date.getMinutes()).padStart(2,'0');
  return { time: `${hh}:${mm}`, ampm: '' };
}
```

### Add Custom Utility Links

Edit `panel.html` to add your own links:

```html
<a href="http://localhost:YOUR_PORT" class="btn btn-sm btn-outline-light" target="_blank">
  Your Service Name
</a>
```

[Back to Top](#toc)

<a name="security"></a>

## 🔐 Security Best Practices

- **API Keys**: Never commit `config.js` to git (already in `.gitignore`)
- **Permissions**: Extension only requests necessary permissions
- **Data Storage**: Uses Chrome's secure storage API
- **HTTPS**: All API calls use HTTPS
- **No Tracking**: No analytics or external tracking
- **Local First**: Data stored locally, synced via Chrome

**Note:** Chrome extensions run client-side, so API keys are visible in the browser. For production apps with sensitive keys, use a backend proxy server.

[Back to Top](#toc)

<a name="contributing"></a>

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

[Back to Top](#toc)

<a name="license"></a>

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

[Back to Top](#toc)

<a name="acknowledgments"></a>

## 🙏 Acknowledgments

- Bootstrap for the UI framework
- OpenWeather for weather data API
- Alpha Vantage for stock market data API
- Chrome Extensions team for Manifest V3
- Open source community for inspiration

[Back to Top](#toc)

<a name="contact"></a>

## 📧 Contact

**Shawn M. Crowley**

- 📧 Email: [shawn.crowley@lycra.com](mailto:shawn.crowley@lycra.com)
- 🔗 LinkedIn: [@shawnmcrowley](https://www.linkedin.com/in/shawnmcrowley)
- 🐦 Twitter: [@shawnmcrowley](https://twitter.com/shawnmcrowley)
- 🔗 GitHub: [chrome_dashboard](https://github.com/shawnmcrowley/chrome_dashboard)

[Back to Top](#toc)

---

<div align="center">
Made with ❤️ using Chrome Extensions API and Bootstrap
</div>
