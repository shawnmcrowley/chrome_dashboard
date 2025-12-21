chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  
  chrome.contextMenus.create({
    id: 'openSidePanel',
    title: 'Open Utility Panel',
    contexts: ['all']
  });
  
  chrome.contextMenus.create({
    id: 'closeSidePanel',
    title: 'Close Utility Panel',
    contexts: ['all']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openSidePanel') {
    chrome.sidePanel.open({ windowId: tab.windowId });
  } else if (info.menuItemId === 'closeSidePanel') {
    chrome.sidePanel.setOptions({ enabled: false });
    setTimeout(() => chrome.sidePanel.setOptions({ enabled: true }), 100);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);
  if (message.action === 'openSidePanel') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        console.log('Opening side panel for window:', tabs[0].windowId);
        chrome.sidePanel.open({ windowId: tabs[0].windowId });
      }
    });
  }
});