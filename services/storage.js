/**
 * Storage service for handling Chrome storage and localStorage
 */

const storageGet = async (key) => {
  if (window.chrome?.storage?.sync) {
    return new Promise(res => chrome.storage.sync.get(key, data => res(data[key])));
  }
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
};

const storageSet = async (key, value) => {
  if (window.chrome?.storage?.sync) {
    return new Promise(res => chrome.storage.sync.set({ [key]: value }, res));
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('storageSet', e);
  }
};

const storageRemove = async (key) => {
  if (window.chrome?.storage?.sync) {
    return new Promise(res => chrome.storage.sync.remove(key, res));
  }
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn('storageRemove', e);
  }
};

// Export for Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    storageGet,
    storageSet,
    storageRemove,
  };
} else {
  window.storage = {
    storageGet,
    storageSet,
    storageRemove,
  };
}