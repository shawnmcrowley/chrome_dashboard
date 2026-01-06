// Send message to background service worker (bypasses CORS)
function sendMessage(action, payload = {}) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({action, payload}, resolve);
  });
}

// Function to format container stats
async function updateDockerStats() {
  console.log('updateDockerStats called');
  try {
    console.log('Sending dockerContainers message...');
    const resp = await sendMessage('dockerContainers');
    console.log('Response received:', resp);
    
    if (!resp || !resp.ok) {
      const errorMsg = resp?.error || 'No response from service worker';
      console.error('Docker error:', errorMsg);
      document.getElementById('docker-stats').textContent = `Error: ${errorMsg}`;
      return;
    }
    
    const containers = resp.data;
    console.log('Containers:', containers);
    let statsText = '';
    
    for (const container of containers) { // Show all containers
      const name = container.Names?.[0]?.replace(/^\/+/, '') || container.Id.slice(0, 12);
      const status = container.State;
      const mounts = container.Mounts || [];
      const volumes = mounts.map(mount => {
        if (mount.Type === 'volume') {
          return `${mount.Name || mount.Source}`;
        } else if (mount.Type === 'bind') {
          return `${mount.Source}:${mount.Destination}`;
        }
        return `${mount.Source || mount.Destination}`;
      }).join(', ') || 'None';
      
      statsText += `${name}\n  Status: ${status}\n  Image: ${container.Image}\n  Volumes: ${volumes}\n\n`;
    }
    
    document.getElementById('docker-stats').textContent = statsText || 'No containers running';
  } catch (err) {
    console.error('updateDockerStats error:', err);
    document.getElementById('docker-stats').textContent = `Error: ${err.message}`;
  }
}

// Load stats when page loads and refresh every 10 seconds
document.addEventListener('DOMContentLoaded', () => {
  console.log('panel.js DOMContentLoaded');
  updateDockerStats();
  setInterval(updateDockerStats, 10000);
});
}

// Function to format container stats
async function updateDockerStats() {
  console.log('updateDockerStats called');
  try {
    console.log('Sending dockerContainers message...');
    const resp = await sendMessage('dockerContainers');
    console.log('Response received:', resp);
    
    if (!resp || !resp.ok) {
      const errorMsg = resp?.error || 'No response from service worker';
      console.error('Docker error:', errorMsg);
      document.getElementById('docker-stats').textContent = `Error: ${errorMsg}`;
      return;
    }
    
    const containers = resp.data;
    console.log('Containers:', containers);
    let statsText = '';
    
    for (const container of containers) { // Show all containers
      const name = container.Names?.[0]?.replace(/^\/+/, '') || container.Id.slice(0, 12);
      const status = container.State;
      const mounts = container.Mounts || [];
      const volumes = mounts.map(mount => {
        if (mount.Type === 'volume') {
          return `${mount.Name || mount.Source}`;
        } else if (mount.Type === 'bind') {
          return `${mount.Source}:${mount.Destination}`;
        }
        return `${mount.Source || mount.Destination}`;
      }).join(', ') || 'None';
      
      statsText += `${name}\n  Status: ${status}\n  Image: ${container.Image}\n  Volumes: ${volumes}\n\n`;
    }
    
    document.getElementById('docker-stats').textContent = statsText || 'No containers running';
  } catch (err) {
    console.error('updateDockerStats error:', err);
    document.getElementById('docker-stats').textContent = `Error: ${err.message}`;
  }
}

// Load stats when page loads and refresh every 10 seconds
document.addEventListener('DOMContentLoaded', () => {
  console.log('panel.js DOMContentLoaded');
  updateDockerStats();
  setInterval(updateDockerStats, 10000);
});
