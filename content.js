// Simple configuration
const CONFIG = {
  ANIMATION_DURATION: 300, // Animation duration in ms
  ANIMATION_DELAY: 50, // Small delay before starting animation
  MIN_CONFIDENCE_THRESHOLD: 0.6 // Minimum confidence score to show popup
};

// Address detection patterns and scoring
function detectAddressConfidence(text) {
  if (!text || text.length === 0) return 0;
  
  let confidence = 0;
  const normalizedText = text.toLowerCase().trim();
  
  // Test 1: Coordinate patterns (very high confidence)
  const coordinatePatterns = [
    /^\s*[-+]?\d{1,3}\.\d+\s*,\s*[-+]?\d{1,3}\.\d+\s*$/,
    /^\s*\(\s*[-+]?\d{1,3}\.\d+\s*,\s*[-+]?\d{1,3}\.\d+\s*\)\s*$/,
    /\d{1,2}°\d{1,2}'\d{1,2}"[NS]\s+\d{1,3}°\d{1,2}'\d{1,2}"[EW]/,
    /[-+]?\d{1,3}\.\d+°\s*[-+]?\d{1,3}\.\d+°/
  ];
  
  for (const pattern of coordinatePatterns) {
    if (pattern.test(normalizedText)) {
      return 0.95; // Very high confidence for coordinates
    }
  }
  
  // Test 2: Length check (addresses are typically short)
  if (text.length > 100) {
    confidence -= 0.3;
  } else if (text.length < 50) {
    confidence += 0.2;
  }
  
  // Test 3: Street indicators (Spanish and English)
  const streetIndicators = [
    /\b(av|ave|avenida|avenue|st|street|calle|c\.|blvd|boulevard|rd|road|dr|drive|pl|place|ct|court)\b/i
  ];
  
  for (const pattern of streetIndicators) {
    if (pattern.test(text)) {
      confidence += 0.3;
      break;
    }
  }
  
  // Test 4: Numbers (addresses usually have numbers)
  const hasNumbers = /\d+/.test(text);
  if (hasNumbers) {
    confidence += 0.25;
    
    // Bonus for numbers at the end (typical address format)
    if (/\d+\s*$/.test(text.trim())) {
      confidence += 0.15;
    }
  }
  
  // Test 5: Comma density (high comma density suggests address parts)
  const commaCount = (text.match(/,/g) || []).length;
  const wordCount = text.split(/\s+/).length;
  const commaDensity = commaCount / Math.max(wordCount, 1);
  
  if (commaDensity > 0.2) {
    confidence += 0.2;
  } else if (commaDensity > 0.1) {
    confidence += 0.1;
  }
  
  // Test 6: Common address words
  const addressWords = [
    /\b(city|ciudad|barrio|neighborhood|distrito|zone|zona)\b/i,
    /\b(apt|apartment|depto|departamento|piso|floor)\b/i,
    /\b(norte|sur|este|oeste|north|south|east|west)\b/i
  ];
  
  for (const pattern of addressWords) {
    if (pattern.test(text)) {
      confidence += 0.1;
    }
  }
  
  // Test 7: Penalty for very common non-address patterns
  const nonAddressPatterns = [
    /\b(the|and|or|but|however|therefore|because|although)\b/gi,
    /[.!?]{2,}/, // Multiple punctuation
    /\b(said|says|told|asked|replied)\b/i // Dialogue indicators
  ];
  
  for (const pattern of nonAddressPatterns) {
    if (pattern.test(text)) {
      confidence -= 0.2;
    }
  }
  
  // Ensure confidence is between 0 and 1
  return Math.max(0, Math.min(1, confidence));
}

let currentPopup = null;
let showTimeout = null;
let selectedText = '';
let selection = null;
let storedText = ''; // Store text permanently to prevent loss on deselection
let mapLoaded = false; // Track if map has been loaded

// Listen for text selection
document.addEventListener('mouseup', handleTextSelection);

function handleTextSelection() {
  // Clear any existing timeout
  if (showTimeout) {
    clearTimeout(showTimeout);
    showTimeout = null;
  }
  
  const currentSelection = window.getSelection();
  const newSelectedText = currentSelection.toString().trim();
  
  // If no text selected, hide popup
  if (newSelectedText.length === 0) {
    hidePopup();
    return;
  }
  
  // If the same text is selected again and popup is already showing, don't recreate it
  if (newSelectedText === storedText && currentPopup) {
    return;
  }
  
  // Update selectedText for new selection
  selectedText = newSelectedText;
  
  // Check if selected text looks like an address
  const confidence = detectAddressConfidence(selectedText);
  
  // If confidence is below threshold, hide popup and return
  if (confidence < CONFIG.MIN_CONFIDENCE_THRESHOLD) {
    hidePopup();
    return;
  }
  
  // Hide any existing popup before showing new one (only if different text)
  if (selectedText !== storedText) {
    hidePopup();
  }
  
  // Store the selection for later use
  selection = currentSelection;
  
  // Show popup immediately for valid addresses
  showPinPopup();
}

function showPinPopup() {
  if (!selectedText || !selection) return;
  
  // Store the text permanently to prevent loss on deselection
  storedText = selectedText;
  
  // Get selection position
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  // Create transparent container
  const container = document.createElement('div');
  container.className = 'popup-container';
  container.style.position = 'fixed';
  container.style.left = `${Math.min(rect.left, window.innerWidth - 200)}px`;
  container.style.top = `${rect.bottom + 5}px`;
  container.style.zIndex = '999999';
  container.style.width = '400px'; // Max width to accommodate expanded state
  container.style.height = '300px'; // Max height to accommodate expanded state
  container.style.pointerEvents = 'none'; // Allow clicks to pass through initially
  
  // Create popup with compact initial state
  currentPopup = document.createElement('div');
  currentPopup.className = 'map-popup compact popup-hidden';
  currentPopup.innerHTML = `
    <div class="popup-content">
      <div class="compact-view">
        <span class="pin-icon">📍</span>
      </div>
      <div class="expanded-view">
         <div class="map-container" id="mapContainer">
           <div class="loading">Loading map...</div>
         </div>
       </div>
    </div>
  `;
  
  // Add hover handlers to expand/collapse
  currentPopup.addEventListener('mouseenter', expandPopup);
  currentPopup.addEventListener('mouseleave', collapsePopup);
  
  container.appendChild(currentPopup);
  document.body.appendChild(container);
  
  // Store reference to container
  currentPopup.container = container;
  
  // Animate in after a small delay
  setTimeout(() => {
    container.style.pointerEvents = 'auto'; // Enable interactions
    currentPopup.classList.remove('popup-hidden');
    currentPopup.classList.add('popup-visible');
  }, CONFIG.ANIMATION_DELAY);
  
}

function expandPopup(event) {
  
  if (!currentPopup || !storedText) {
    return;
  }
  
  // Check if already expanded
  if (currentPopup.classList.contains('expanded')) {
    return;
  }
  
  // Hide compact view and show expanded view
  const compactView = currentPopup.querySelector('.compact-view');
  const expandedView = currentPopup.querySelector('.expanded-view');
  
  // Add expanded class for styling
  currentPopup.classList.remove('compact');
  currentPopup.classList.add('expanded');
  
  // Show map with opacity if already loaded, otherwise load it
  if (mapLoaded) {
    currentPopup.classList.remove('map-hidden');
  } else {
    // Load map after a short delay to allow transition
    setTimeout(() => {
      loadSimpleMap();
    }, 200);
  }
}

function collapsePopup(event) {
  
  if (!currentPopup || !currentPopup.classList.contains('expanded')) {
    return;
  }
  
  // Add compact class for styling and hide map with opacity
  currentPopup.classList.remove('expanded');
  currentPopup.classList.add('compact');
  
  // If map was loaded, just hide it with opacity instead of removing
  if (mapLoaded) {
    currentPopup.classList.add('map-hidden');
  }
}

function loadSimpleMap() {
  // Get API key from storage
  chrome.storage.sync.get(['googleMapsApiKey'], (result) => {
    const apiKey = result.googleMapsApiKey;
    const mapContainer = document.getElementById('mapContainer');
    
    if (!mapContainer) return;
    
    if (!apiKey) {
      mapContainer.innerHTML = `
        <div class="no-api-key">
          <p>Please set your Google Maps API key in the extension popup.</p>
          <a href="https://developers.google.com/maps/documentation/embed/get-api-key" target="_blank">Get API Key</a>
        </div>
      `;
      mapLoaded = true;
      return;
    }
    
    // Create Google Maps embed with the exact selected text
    mapContainer.innerHTML = `
      <iframe
        frameborder="0"
        style="border:0;border-radius:8px;width:100%;height:100%"
        src="https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${encodeURIComponent(storedText)}"
        allowfullscreen>
      </iframe>
    `;
    mapLoaded = true;
  });
}

// Removed old complex functions - now using simple direct search

function hidePopup() {
  if (currentPopup) {
    // Animate out before removing
    currentPopup.classList.remove('popup-visible');
    currentPopup.classList.add('popup-hidden');
    
    // Remove after animation completes
    setTimeout(() => {
      if (currentPopup && currentPopup.container) {
        currentPopup.container.remove();
      }
      currentPopup = null;
    }, CONFIG.ANIMATION_DURATION);
  }
  if (showTimeout) {
    clearTimeout(showTimeout);
    showTimeout = null;
  }
  
  // Clear stored text and reset map loaded flag
  storedText = '';
  mapLoaded = false;
}

function closePopupOnOutsideClick(event) {
  // Don't close if clicking on selected text or if we're in the middle of text selection
  if (window.getSelection().toString().trim().length > 0) {
    return;
  }
  
  if (currentPopup && currentPopup.container && !currentPopup.container.contains(event.target)) {
    hidePopup();
  }
}

// Listen for clicks outside popup to close it
document.addEventListener('click', closePopupOnOutsideClick);

// Listen for escape key to close popup
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    hidePopup();
  }
});

// Clean up when page unloads
window.addEventListener('beforeunload', hidePopup);