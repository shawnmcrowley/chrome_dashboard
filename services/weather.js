/**
 * Weather service module
 */

// Import dependencies
const storage = typeof window !== 'undefined' ? window.storage : null;
const CONSTANTS = typeof window !== 'undefined' ? window.CONSTANTS : null;

const log = {
  d: (...a) => console.debug('weather:', ...a),
  i: (...a) => console.info('weather:', ...a),
  w: (...a) => console.warn('weather:', ...a),
  e: (...a) => console.error('weather:', ...a),
};

/**
 * Fetch weather data from OpenWeather API
 * @param {string} query - Location query
 * @param {string} units - Units (imperial or metric)
 * @returns {Promise<Object>} Weather data or error
 */
async function fetchWeather(query, units = 'imperial') {
  const OPENWEATHER_KEY = typeof CONFIG !== 'undefined' ? CONFIG.OPENWEATHER_KEY : '';
  let key = OPENWEATHER_KEY || (storage ? await storage.storageGet('openweather_key') : '') || '';
  key = typeof key === 'string' ? key.trim() : key;
  if (!key) return { error: 'no_key' };

  const url = `${CONSTANTS.API_CONFIG.OPENWEATHER_BASE_URL}?q=${encodeURIComponent(query)}&units=${units}&appid=${key}`;
  log.d('Fetching weather from:', url.replace(key, 'API_KEY'));

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    log.e('Fetch weather error:', error);
    return { error: error.message };
  }
}

/**
 * Map OpenWeather icon code to weather condition
 * @param {string} id - Weather ID
 * @param {string} icon - Weather icon
 * @returns {string} Weather condition text
 */
function mapIcon(id, icon) {
  const icons = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '🌤️',
    '03d': '☁️', '03n': '☁️',
    '04d': '🌥️', '04n': '🌥️',
    '09d': '🌦️', '09n': '🌧️',
    '10d': '🌧️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };
  return icons[icon] || '🌐';
}

/**
 * Render weather data for a specific location
 * @param {string} prefix - Location prefix
 * @param {Object} data - Weather data
 */
function renderWeatherFor(prefix, data) {
  if (!data || data.error) {
    const el = document.getElementById(`mini-weather-${prefix}`);
    if (el) {
      el.textContent = data?.error === 'no_key' ? '🔑 Key Missing' : '⚠️ Error';
    }
    return;
  }

  const iconEl = document.getElementById(`mini-weather-${prefix}`);
  const tempEl = document.getElementById(`mini-temp-${prefix}`);
  const descEl = document.getElementById(`mini-desc-${prefix}`);

  if (iconEl) {
    const icon = mapIcon(data.weather?.[0]?.id, data.weather?.[0]?.icon);
    iconEl.textContent = `${icon} ${Math.round(data.main?.temp || 0)}°`;
  }

  if (tempEl) {
    tempEl.textContent = `${Math.round(data.main?.temp || 0)}°`;
  }

  if (descEl) {
    descEl.textContent = data.weather?.[0]?.main || '';
  }
}

/**
 * Load weather data for all locations
 */
async function loadWeather() {
  try {
    const results = await Promise.all(
      CONSTANTS.WEATHER_LOCATIONS.map(loc => 
        fetchWeather(loc.query, loc.units).then(data => ({
          prefix: loc.idPrefix,
          data,
        }))
      )
    );

    results.forEach(({ prefix, data }) => {
      renderWeatherFor(prefix, data);
    });
  } catch (error) {
    log.e('Load weather error:', error);
  }
}

// Export for Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fetchWeather,
    mapIcon,
    renderWeatherFor,
    loadWeather,
  };
} else {
  window.weather = {
    fetchWeather,
    mapIcon,
    renderWeatherFor,
    loadWeather,
  };
}