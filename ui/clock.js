/**
 * Clock component module
 */

const CONSTANTS = typeof window !== 'undefined' ? window.CONSTANTS : null;

const log = {
  d: (...a) => console.debug('clock:', ...a),
  i: (...a) => console.info('clock:', ...a),
  w: (...a) => console.warn('clock:', ...a),
  e: (...a) => console.error('clock:', ...a),
};

/**
 * Update clock display
 */
function updateClock() {
  try {
    const now = new Date();

    // Update per-location date/time next to weather
    if (CONSTANTS && CONSTANTS.WEATHER_LOCATIONS) {
      CONSTANTS.WEATHER_LOCATIONS.forEach(loc => {
        if (!loc.timeZone) return;
        const dtEl = document.getElementById(`mini-datetime-${loc.idPrefix}`);
        if (!dtEl) return;
        const formatted = new Intl.DateTimeFormat('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: loc.timeZone,
        }).format(now);
        dtEl.textContent = formatted;
      });
    }
  } catch (e) {
    log.e('updateClock', e);
  }
}

let _clockTimer = null;

/**
 * Start clock updates
 */
function startClock() {
  if (_clockTimer) clearInterval(_clockTimer);
  updateClock();
  _clockTimer = setInterval(updateClock, CONSTANTS.TIME_INTERVALS.CLOCK_UPDATE);
}

/**
 * Stop clock updates
 */
function stopClock() {
  if (_clockTimer) clearInterval(_clockTimer);
  _clockTimer = null;
}

// Export for Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    updateClock,
    startClock,
    stopClock,
  };
} else {
  window.clock = {
    updateClock,
    startClock,
    stopClock,
  };
}