/**
 * main.js — Updated: fixed-location weather (New Delhi), default feed, RSS rendering with image/title/author/date,
 * proxy fallback for CORS, constrained thumbnails, and UI wiring (To-Do + RSS).
 *
 * Notes:
 * - Ensure vendor/bootstrap and vendor/bootstrap-icons are stored locally in vendor/
 * - Manifest must allow connect-src https: if you want to fetch arbitrary feeds
 */

/* ====== CONFIG ====== */
// API keys are loaded from config.js (gitignored)
const OPENWEATHER_KEY = typeof CONFIG !== 'undefined' ? CONFIG.OPENWEATHER_KEY : '';
const ALPHA_VANTAGE_KEY = typeof CONFIG !== 'undefined' ? CONFIG.ALPHA_VANTAGE_KEY : 'demo';
const DEFAULT_FEEDS = ['https://www.makeuseof.com/feed/'];
const US_INDICES = [
  { symbol: 'SPY', name: 'S&P 500', multiplier: 10.0 },   // SPY * 10 ≈ S&P 500 index
  { symbol: 'DIA', name: 'Dow Jones', multiplier: 100.0 }, // DIA * 100 ≈ Dow Jones index
  { symbol: 'QQQ', name: 'NASDAQ', multiplier: 30.0 }     // QQQ * 30 ≈ NASDAQ index
];

/* ====== storage helpers ====== */
const storageGet = async (key) => {
  if (window.chrome?.storage?.sync) {
    return new Promise(res => chrome.storage.sync.get(key, data => res(data[key])));
  }
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
};
const storageSet = async (key, value) => {
  if (window.chrome?.storage?.sync) {
    return new Promise(res => chrome.storage.sync.set({ [key]: value }, res));
  }
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.warn('storageSet', e); }
};

/* ====== DOM helper ====== */
const $ = (id) => document.getElementById(id);

/* ====== state ====== */
const state = { todo: [], feeds: [], weather: null, showCompleted: false };

/* ====== logging ====== */
const log = { d: (...a)=>console.debug('app:',...a), i:(...a)=>console.info('app:',...a), w:(...a)=>console.warn('app:',...a), e:(...a)=>console.error('app:',...a) };

/* ====== CLOCK ====== */
function formatClockParts(date) {
  const hh = date.getHours();
  const h12 = ((hh + 11) % 12) + 1;
  const mm = String(date.getMinutes()).padStart(2,'0');
  const ampm = hh >= 12 ? 'PM' : 'AM';
  return { time: `${String(h12).padStart(2,'0')}:${mm}`, ampm };
}
function updateClock() {
  try {
    const now = new Date();
    const parts = formatClockParts(now);
    const clockEl = $('clock');
    if (clockEl) clockEl.innerHTML = `${parts.time} <span class="ampm">${parts.ampm}</span>`;
    const miniDateEl = $('mini-date');
    if (miniDateEl) miniDateEl.textContent = now.toLocaleDateString([], { weekday:'short', month:'short', day:'numeric' });
  } catch (e) { log.e('updateClock', e); }
}
let _clockTimer = null;
function startClock() { if (_clockTimer) clearInterval(_clockTimer); updateClock(); _clockTimer = setInterval(updateClock, 1000); }

/* ====== WEATHER (fixed location) ====== */
async function fetchWeatherForCity(city='West Chester, PA', zip='19382') {
  let key = OPENWEATHER_KEY || (await storageGet('openweather_key')) || '';
  key = (typeof key === 'string') ? key.trim() : key;
  if (!key) return { error: 'no_key' };

  // Try ZIP code first (more reliable), fallback to city name & Changed Units to Imperial for Fahrenheit, use metric for Celsius
  const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zip},US&units=imperial&appid=${key}`;
  log.d('Fetching weather from:', url.replace(key, 'API_KEY'));
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const txt = await res.text().catch(()=>'');
      log.e('Weather API error:', res.status, txt);
      return { error:true, status:res.status, body:txt };
    }
    const data = await res.json();
    log.d('Weather data received:', data);
    return data;
  } catch (e) { 
    log.e('fetchWeatherForCity', e); 
    return { error: true, message: e.message };
  }
}
function mapIcon(id, icon) {
  if (!id) return '🌤️';
  if (icon?.endsWith('d')) {
    if (id >= 200 && id < 600) return '⛈️';
    if (id >= 600 && id < 700) return '🌨️';
    if (id === 800) return '☀️';
    return '🌤️';
  } else return '🌙';
}
function renderWeather(data) {
  const miniWeatherEl = $('mini-weather'), miniLocationEl = $('mini-location'), weatherIconEl = $('weatherIcon');
  if (!miniWeatherEl) return;
  if (!data || data.error) {
    miniWeatherEl.textContent = '--°';
    miniLocationEl.textContent = data && data.error === 'no_key' ? 'No API key' : '—';
    weatherIconEl && (weatherIconEl.textContent = '🌙');
    return;
  }
  miniWeatherEl.textContent = `${Math.round(data.main.temp)}°`;
  miniLocationEl.textContent = data.name || '—';
  weatherIconEl && (weatherIconEl.textContent = mapIcon(data.weather?.[0]?.id, data.weather?.[0]?.icon));
}
async function loadWeather() {
  renderWeather(null);
  const data = await fetchWeatherForCity('West Chester, PA', '19382');
  if (data && !data.error) { state.weather = data; renderWeather(data); await storageSet('lastWeather', data); return; }
  const last = await storageGet('lastWeather');
  if (last) renderWeather(last);
}

/* ====== STOCK MARKET ====== */
// Mock data as fallback when APIs fail
const MOCK_MARKET_DATA = [
  { symbol: 'SPY', name: 'S&P 500', price: 6025.50, change: 53.20, changePercent: 0.89 },
  { symbol: 'DIA', name: 'Dow Jones', price: 44518.00, change: -215.00, changePercent: -0.48 },
  { symbol: 'QQQ', name: 'NASDAQ', price: 15470.10, change: 252.60, changePercent: 1.66 }
];

async function fetchMarketData() {
  const key = ALPHA_VANTAGE_KEY || (await storageGet('alpha_vantage_key')) || 'demo';
  const results = [];
  
  log.d('Fetching market data from Alpha Vantage...');
  
  for (const index of US_INDICES) {
    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${index.symbol}&apikey=${key}`;
      log.d('Fetching', index.symbol);
      const res = await fetch(url);
      if (!res.ok) { log.e('API error for', index.symbol, res.status); continue; }
      const data = await res.json();
      log.d('Full response for', index.symbol, JSON.stringify(data));
      
      // Check if we hit rate limit or demo key limitation
      if (data.Note || data.Information) {
        log.w('API limit reached:', data.Note || data.Information);
        break; // Stop trying, use mock data
      }
      
      const quote = data['Global Quote'];
      if (quote && quote['05. price']) {
        const etfPrice = parseFloat(quote['05. price']);
        const etfChange = parseFloat(quote['09. change']);
        const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
        
        // Convert ETF price to approximate index value
        results.push({
          symbol: index.symbol,
          name: index.name,
          price: etfPrice * index.multiplier,
          change: etfChange * index.multiplier,
          changePercent: changePercent
        });
        log.d('Added', index.name, 'to results');
      }
      
      if (US_INDICES.indexOf(index) < US_INDICES.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 12000));
      }
    } catch (e) { log.e('fetchMarketData error for', index.symbol, e); }
  }
  
  // If no results, use mock data
  if (results.length === 0) {
    log.w('Using mock market data');
    return MOCK_MARKET_DATA;
  }
  
  log.d('Market data fetch complete. Results:', results);
  return results;
}

function renderMarketData(data) {
  const container = $('us-markets');
  if (!container) { log.w('Market container not found'); return; }
  if (!data || !data.length) { 
    container.innerHTML = '<div style="color:var(--muted);font-size:12px;">Market data unavailable</div>'; 
    return; 
  }
  log.d('Rendering market data:', data);
  container.innerHTML = data.map(idx => {
    const changeClass = idx.change >= 0 ? 'positive' : 'negative';
    const changeSymbol = idx.change >= 0 ? '+' : '';
    // Format price with commas for thousands
    const formattedPrice = idx.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `<div class="market-item"><span class="market-symbol">${idx.name}</span><span class="market-price">$${formattedPrice}</span><span class="market-change ${changeClass}">${changeSymbol}${idx.changePercent.toFixed(2)}%</span></div>`;
  }).join('');
  log.d('Market data rendered successfully');
}

async function loadMarketData() {
  const container = $('us-markets');
  if (container) container.innerHTML = '<div style="color:var(--muted);font-size:12px;">Loading...</div>';
  
  const data = await fetchMarketData();
  if (data) { renderMarketData(data); await storageSet('lastMarket', data); return; }
  const last = await storageGet('lastMarket');
  if (last) { log.d('Using cached market data'); renderMarketData(last); }
}

let _marketTimer = null;
function startMarketUpdates() { loadMarketData(); if (_marketTimer) clearInterval(_marketTimer); _marketTimer = setInterval(loadMarketData, 900000); }

/* ====== RSS helpers & rendering (unchanged from earlier) ====== */
function extractImageFromItem(item) {
  try {
    const encl = item.querySelector('enclosure[url][type^="image"], enclosure[url]');
    if (encl && encl.getAttribute('url')) return encl.getAttribute('url');
    const media = item.querySelector('media\\:content, content, media\\:thumbnail, thumbnail');
    if (media && media.getAttribute && media.getAttribute('url')) return media.getAttribute('url');
    const contentElem = item.querySelector('content\\:encoded, encoded, description') || item.querySelector('description');
    if (contentElem) {
      const raw = contentElem.textContent || contentElem.innerHTML || '';
      const m = raw.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (m && m[1]) return m[1];
    }
    const img = item.querySelector('img');
    if (img && img.src) return img.src;
    return null;
  } catch (e) {
    log.w('extractImageFromItem', e);
    return null;
  }
}
function extractAuthorFromItem(item) {
  try {
    const authorElem = item.querySelector('author, dc\\:creator, creator');
    if (authorElem && authorElem.textContent) return authorElem.textContent.trim();
    const authName = item.querySelector('author > name');
    if (authName && authName.textContent) return authName.textContent.trim();
    return '';
  } catch (e) { return ''; }
}
function parseFeedXmlToItems(xmlText, feedUrl) {
  try {
    const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
    const items = Array.from(doc.querySelectorAll('item')).slice(0, 8).map(item => {
      const title = item.querySelector('title')?.textContent?.trim() || '';
      const link = item.querySelector('link')?.textContent?.trim() || item.querySelector('guid')?.textContent?.trim() || feedUrl;
      const pubDateRaw = item.querySelector('pubDate')?.textContent || item.querySelector('date')?.textContent || '';
      const pubDate = pubDateRaw ? new Date(pubDateRaw) : null;
      const author = extractAuthorFromItem(item) || '';
      const image = extractImageFromItem(item) || '';
      const desc = item.querySelector('description')?.textContent || item.querySelector('content\\:encoded')?.textContent || '';
      const excerpt = desc ? desc.replace(/<[^>]+>/g, '').trim().slice(0, 220) : '';
      return { title, link, pubDate, author, image, excerpt };
    });
    return items;
  } catch (e) {
    log.w('parseFeedXmlToItems', e);
    return [];
  }
}
async function fetchAndParseFeed(url) {
  const tryDirect = async () => {
    const res = await fetch(url, { method: 'GET', credentials: 'omit' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const txt = await res.text();
    const parsed = parseFeedXmlToItems(txt, url);
    if (parsed.length) return parsed;
    throw new Error('no-items-parsed');
  };
  const tryProxy = async () => {
    const proxy = 'https://api.allorigins.win/raw?url=';
    const proxyUrl = proxy + encodeURIComponent(url);
    const pres = await fetch(proxyUrl, { method: 'GET' });
    if (!pres.ok) throw new Error(`proxy HTTP ${pres.status}`);
    const ptxt = await pres.text();
    const parsed = parseFeedXmlToItems(ptxt, url);
    return parsed;
  };
  try {
    return await tryDirect();
  } catch (err) {
    log.w('Direct fetch failed, trying proxy for', url, err);
    try {
      const items = await tryProxy();
      const noteEl = $('feedNote');
      if (noteEl) {
        noteEl.textContent = 'Proxy used to fetch feeds (CORS blocked).';
        setTimeout(() => { if (noteEl) noteEl.textContent = 'Default feed: https://www.makeuseof.com/feed/'; }, 7000);
      }
      return items;
    } catch (perr) {
      log.w('Proxy fetch also failed for', url, perr);
      return [];
    }
  }
}
async function renderFeeds() {
  const rssListEl = $('rssList');
  const feedCountEl = $('feedCount');
  if (!rssListEl) return;
  rssListEl.innerHTML = '';
  feedCountEl && (feedCountEl.textContent = `${state.feeds.length}`);
  if (!state.feeds.length) {
    const li = document.createElement('li'); li.className='list-group-item text-muted'; li.textContent='No feeds yet — add one.'; rssListEl.appendChild(li); return;
  }
  for (const feedUrl of state.feeds) {
    const header = document.createElement('li'); header.className='list-group-item'; header.style.padding='6px 8px'; header.innerHTML = `<strong>${feedUrl}</strong>`; rssListEl.appendChild(header);
    const items = await fetchAndParseFeed(feedUrl);
    if (!items.length) {
      const li = document.createElement('li'); li.className='list-group-item text-muted'; li.textContent='Failed to fetch (CORS or invalid feed).'; rssListEl.appendChild(li); continue;
    }
    items.slice(0,6).forEach(it => {
      const li = document.createElement('li'); li.className='rss-item';
      const thumb = document.createElement('div'); thumb.className='rss-thumb';
      if (it.image) {
        const img = document.createElement('img'); img.src = it.image; img.alt = it.title || 'thumbnail';
        img.style.width='100%'; img.style.height='100%'; img.style.objectFit='cover';
        img.onerror = () => { img.style.display='none'; thumb.style.minWidth='0'; };
        thumb.appendChild(img);
      } else {
        thumb.innerHTML = '<svg width="100%" height="100%" viewBox="0 0 4 3" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><rect width="4" height="3" fill="#0b1116"/></svg>';
      }
      const body = document.createElement('div'); body.className='rss-body';
      const a = document.createElement('a'); a.href = it.link || feedUrl; a.target = '_blank'; a.rel='noopener'; a.className='rss-title'; a.textContent = it.title || it.link || 'Untitled';
      const meta = document.createElement('div'); meta.className='rss-meta'; const authorPart = it.author ? `${it.author}` : ''; const datePart = it.pubDate ? (it.pubDate.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })) : ''; meta.textContent = [authorPart, datePart].filter(Boolean).join(' • ');
      const excerpt = document.createElement('div'); excerpt.className='rss-excerpt'; excerpt.textContent = it.excerpt || '';
      body.appendChild(a); body.appendChild(meta); if (it.excerpt) body.appendChild(excerpt);
      li.appendChild(thumb); li.appendChild(body); rssListEl.appendChild(li);
    });
  }
}

/* ====== To-do list rendering & events ====== */
function createTodoNode(task, idx) {
  const li = document.createElement('li'); li.className='list-group-item'; li.dataset.idx=idx;
  const handle = document.createElement('span'); handle.className='todo-handle me-2'; handle.innerHTML = '<i class="bi bi-grip-vertical"></i>'; handle.title='Drag to reorder';
  const chk = document.createElement('input'); chk.type='checkbox'; chk.className='form-check-input me-2'; chk.checked=!!task.done; chk.addEventListener('change', async ()=>{ state.todo[idx].done = chk.checked; await storageSet('todo', state.todo); renderTodos(); });
  const text = document.createElement('div'); text.className='todo-text'; text.textContent = task.text; if (task.done) text.classList.add('todo-done');
  const meta = document.createElement('div'); meta.className='todo-meta ms-2 text-muted'; meta.textContent = new Date(task.created).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  const del = document.createElement('button'); del.className='btn btn-sm btn-outline-light ms-2'; del.innerHTML = '<i class="bi bi-x-lg"></i>'; del.title='Delete'; del.addEventListener('click', async ()=>{ state.todo.splice(idx,1); await storageSet('todo', state.todo); renderTodos(); });
  li.draggable = true;
  li.addEventListener('dragstart', e=>{ e.dataTransfer.setData('text/plain', idx); li.classList.add('dragging'); });
  li.addEventListener('dragend', ()=>li.classList.remove('dragging'));
  li.addEventListener('dragover', e=>{ e.preventDefault(); li.classList.add('dragover'); });
  li.addEventListener('dragleave', ()=>li.classList.remove('dragover'));
  li.addEventListener('drop', async (e)=>{ e.preventDefault(); const from = Number(e.dataTransfer.getData('text/plain')); const to = Array.from(todoListEl.children).indexOf(li); if (from===to) return; const [moved] = state.todo.splice(from,1); state.todo.splice(to,0,moved); await storageSet('todo', state.todo); renderTodos(); });
  li.appendChild(handle); li.appendChild(chk); li.appendChild(text); li.appendChild(meta); li.appendChild(del);
  return li;
}
function renderTodos() {
  try {
    const todoListElLocal = $('todoList');
    if (!todoListElLocal) return;
    todoListElLocal.innerHTML = '';
    const filtered = state.showCompleted ? state.todo : state.todo.filter(t=>!t.done);
    filtered.forEach(t => { const realIdx = state.todo.indexOf(t); todoListElLocal.appendChild(createTodoNode(t, realIdx)); });
    const todoCountEl = $('todoCount'); if (todoCountEl) todoCountEl.textContent = `${state.todo.filter(t=>!t.done).length}`;
  } catch (e) { log.e('renderTodos error', e); }
}

/* ====== UI wiring ====== */
function wireUiEvents() {
  try {
    // Side panel toggle button
    const sidePanelBtn = $('sidePanelToggle');
    if (sidePanelBtn) {
      sidePanelBtn.addEventListener('click', () => {
        console.log('Side panel button clicked');
        chrome.runtime.sendMessage({ action: 'openSidePanel' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error opening side panel:', chrome.runtime.lastError);
          }
        });
      });
    }
    
    const addTodoBtn = $('addTodo'), todoInput = $('todoInput');
    if (addTodoBtn && todoInput) {
      addTodoBtn.addEventListener('click', async ()=>{ const text = todoInput.value.trim(); if (!text) return; state.todo.unshift({text, done:false, created:Date.now()}); todoInput.value=''; await storageSet('todo', state.todo); renderTodos(); });
      todoInput.addEventListener('keydown', e=>{ if (e.key==='Enter') addTodoBtn.click(); });
    }
    const clearBtn = $('clearCompleted'); if (clearBtn) clearBtn.addEventListener('click', async ()=>{ state.todo = state.todo.filter(t=>!t.done); await storageSet('todo', state.todo); renderTodos(); });
    const toggleDoneBtn = $('toggleDoneView'); if (toggleDoneBtn) toggleDoneBtn.addEventListener('click', ()=>{ state.showCompleted = !state.showCompleted; toggleDoneBtn.classList.toggle('active', state.showCompleted); toggleDoneBtn.textContent = state.showCompleted ? 'Show active' : 'Hide completed'; renderTodos(); });
    const addRssBtn = $('addRss'), rssUrlInput = $('rssUrl'); if (addRssBtn && rssUrlInput) {
      addRssBtn.addEventListener('click', async ()=>{ const url = rssUrlInput.value.trim(); if (!url) return; if (!state.feeds.includes(url)) { state.feeds.unshift(url); await storageSet('feeds', state.feeds); rssUrlInput.value=''; await renderFeeds(); }});
      rssUrlInput.addEventListener('keydown', e=>{ if (e.key==='Enter') addRssBtn.click(); });
    }
  } catch (e) { log.e('wireUiEvents error', e); }
}

/* ====== INIT ====== */
async function initApp() {
  try {
    state.todo = (await storageGet('todo')) || [];
    state.feeds = (await storageGet('feeds')) || DEFAULT_FEEDS.slice();
    startClock();
    wireUiEvents();
    renderTodos();
    await renderFeeds();
    await loadWeather();
    startMarketUpdates();
  } catch (e) { log.e('initApp error', e); }
}
document.addEventListener('DOMContentLoaded', ()=>{ try { initApp(); } catch (e) { log.e('DOMContentLoaded', e); } });

/* Expose for debug */
window.appState = state;
window.loadWeather = loadWeather;
window.renderFeeds = renderFeeds;
window.updateClock = updateClock;