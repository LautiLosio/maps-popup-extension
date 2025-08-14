// Optional background service worker for handling settings updates
// Add this to manifest.json if you want more advanced features:
// "background": {
//   "service_worker": "background.js"
// }

// Listen for messages from popup to update content script settings
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateAllTabs') {
    // Update all tabs with new settings
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Some tabs might not have content script loaded
        });
      });
    });
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open options page on first install
    chrome.tabs.create({
      url: chrome.runtime.getURL('popup.html')
    });
  }
});