/**
 * 🧩 Pocket-Gull Chrome Extension Background Service Worker (Manifest V3)
 * Manages EHR Sidepanel behavior and Chrome Built-in AI bindings.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('🧩 Pocket-Gull Chrome Extension Installed v1.16.0');
});

// Enable side panel on extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    await chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Relay messages between EHR webpage and Pocket-Gull engine
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'POCKETGULL_GET_STATUS') {
    sendResponse({ status: 'ACTIVE', version: '1.16.0', targetUrl: 'https://pocketgull.com' });
  }
  return true;
});
