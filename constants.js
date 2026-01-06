// Constants for time intervals
const TIME_INTERVALS = {
  CLOCK_UPDATE: 1000,        // 1 second
  WEATHER_REFRESH: 10000,    // 10 seconds
  MARKET_REFRESH: 900000,    // 15 minutes (900,000 ms)
  API_CALL_DELAY: 12000,      // 12 seconds
};

// API configuration
const API_CONFIG = {
  OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5/weather',
  ALPHA_VANTAGE_BASE_URL: 'https://www.alphavantage.co/query',
};

// Default feeds
const DEFAULT_FEEDS = ['https://www.makeuseof.com/feed/'];

// Market indices
const US_INDICES = [
  { symbol: 'SPY', name: 'S&P 500', multiplier: 10.0 },
  { symbol: 'DIA', name: 'Dow Jones', multiplier: 100.0 },
  { symbol: 'QQQ', name: 'NASDAQ', multiplier: 30.0 }
];

// Weather locations
const WEATHER_LOCATIONS = [
  {
    idPrefix: 'local',
    query: 'West Chester,US',
    units: 'imperial',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  {
    idPrefix: 'delhi',
    query: 'New Delhi,IN',
    units: 'imperial',
    timeZone: 'Asia/Kolkata',
  },
  {
    idPrefix: 'ireland',
    query: 'Dublin,IE',
    units: 'imperial',
    timeZone: 'Europe/Dublin',
  },
];

// Export constants
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TIME_INTERVALS,
    API_CONFIG,
    DEFAULT_FEEDS,
    US_INDICES,
    WEATHER_LOCATIONS,
  };
} else {
  window.CONSTANTS = {
    TIME_INTERVALS,
    API_CONFIG,
    DEFAULT_FEEDS,
    US_INDICES,
    WEATHER_LOCATIONS,
  };
}