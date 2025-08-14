// Popup script for the extension
document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('saveKey');
  const statusDiv = document.getElementById('status');
  
  // Load existing API key
  chrome.storage.sync.get(['googleMapsApiKey'], function(result) {
    if (result.googleMapsApiKey) {
      apiKeyInput.value = result.googleMapsApiKey;
      statusDiv.textContent = 'API key loaded from storage';
      statusDiv.className = 'status success';
    }
  });
  
  // Save API key
  saveButton.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      statusDiv.textContent = 'Please enter an API key';
      statusDiv.className = 'status error';
      return;
    }
    
    chrome.storage.sync.set({googleMapsApiKey: apiKey}, function() {
      statusDiv.textContent = 'API key saved successfully!';
      statusDiv.className = 'status success';
      
      // Clear status after 3 seconds
      setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'status';
      }, 3000);
    });
  });
  
  // Save on Enter key
  apiKeyInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      saveButton.click();
    }
  });
});

console.log('Address Map Popup extension loaded');