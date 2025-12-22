// Send message to background service worker (bypasses CORS)
/*
Updated Docker Daemon to open a port and call API on port 2375
Edit the Docker daemon configuration:

sudo nano /etc/docker/daemon.json

Add the hosts array to expose the API on TCP:

{
  "hosts": ["unix:///var/run/docker.sock", "tcp://127.0.0.1:2375"]
}

Reload Docker:

sudo systemctl daemon-reload
sudo systemctl restart docker

Verify it's listening:

curl http://localhost:2375/containers/json

For Temporrary Testing Only:

sudo dockerd -H unix:///var/run/docker.sock -H tcp://127.0.0.1:2375

For SSL

{
  "hosts": ["unix:///var/run/docker.sock", "tcp://127.0.0.1:2376"],
  "tlsverify": true,
  "tlscacert": "/path/to/ca.pem",
  "tlscert": "/path/to/cert.pem",
  "tlskey": "/path/to/key.pem"
}

*/

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
      statsText += `${name}\n  Status: ${status}\n  Image: ${container.Image}\n\n`;
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
