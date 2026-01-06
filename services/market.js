/**
 * Market data service module
 */

const CONSTANTS = typeof window !== 'undefined' ? window.CONSTANTS : null;

const log = {
  d: (...a) => console.debug('market:', ...a),
  i: (...a) => console.info('market:', ...a),
  w: (...a) => console.warn('market:', ...a),
  e: (...a) => console.error('market:', ...a),
};

// Mock market data for development
const MOCK_MARKET_DATA = {
  'SPY': { price: 450.25, change: 2.15, change_pct: 0.48 },
  'DIA': { price: 340.75, change: 1.25, change_pct: 0.37 },
  'QQQ': { price: 380.50, change: 3.75, change_pct: 1.00 },
};

/**
 * Fetch market data from Alpha Vantage API
 * @returns {Promise<Object>} Market data
 */
async function fetchMarketData() {
  const ALPHA_VANTAGE_KEY = typeof CONFIG !== 'undefined' ? CONFIG.ALPHA_VANTAGE_KEY : 'demo';
  
  // Use mock data for demo key
  if (ALPHA_VANTAGE_KEY === 'demo') {
    log.i('Using mock market data');
    return MOCK_MARKET_DATA;
  }

  try {
    const results = {};
    
    for (const index of CONSTANTS.US_INDICES) {
      // Small delay between API calls to avoid rate limiting
      await new Promise(res => setTimeout(res, CONSTANTS.TIME_INTERVALS.API_CALL_DELAY));
      
      const url = `${CONSTANTS.API_CONFIG.ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${index.symbol}&apikey=${ALPHA_VANTAGE_KEY}`;
      log.d('Fetching market data from:', url.replace(ALPHA_VANTAGE_KEY, 'API_KEY'));
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      if (data['Global Quote']) {
        const quote = data['Global Quote'];
        results[index.symbol] = {
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          change_pct: parseFloat(quote['10. change percent'].replace('%', '')),
        };
      }
    }
    
    return results;
  } catch (error) {
    log.e('Fetch market data error:', error);
    return MOCK_MARKET_DATA; // Fallback to mock data
  }
}

/**
 * Render market data
 * @param {Object} data - Market data
 */
function renderMarketData(data) {
  const container = document.getElementById('market-data');
  if (!container) return;

  container.innerHTML = '';
  
  CONSTANTS.US_INDICES.forEach(index => {
    const item = data[index.symbol];
    if (!item) return;

    const itemEl = document.createElement('div');
    itemEl.className = 'market-item';

    const symbolEl = document.createElement('div');
    symbolEl.className = 'market-symbol';
    symbolEl.textContent = index.name;

    const priceEl = document.createElement('div');
    priceEl.className = 'market-price';
    priceEl.textContent = `$${item.price.toFixed(2)}`;

    const changeEl = document.createElement('div');
    changeEl.className = `market-change ${item.change >= 0 ? 'positive' : 'negative'}`;
    changeEl.textContent = `${item.change >= 0 ? '+' : ''}${item.change.toFixed(2)} (${item.change_pct.toFixed(2)}%)`;

    itemEl.appendChild(symbolEl);
    itemEl.appendChild(priceEl);
    itemEl.appendChild(changeEl);

    container.appendChild(itemEl);
  });
}

/**
 * Load and render market data
 */
async function loadMarketData() {
  try {
    const data = await fetchMarketData();
    renderMarketData(data);
  } catch (error) {
    log.e('Load market data error:', error);
  }
}

// Export for Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fetchMarketData,
    renderMarketData,
    loadMarketData,
    MOCK_MARKET_DATA,
  };
} else {
  window.market = {
    fetchMarketData,
    renderMarketData,
    loadMarketData,
    MOCK_MARKET_DATA,
  };
}