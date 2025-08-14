## Technical Details

**Mapping Services Used:**
- **OpenStreetMap**: For tile layers and map display (using direct tile API)
- **Nominatim**: For geocoding addresses (free OSM service)
- **No external libraries**: Uses native browser APIs and OSM tile system

**How the Maps Work:**
- Calculates OSM tile coordinates for the location
- Loads a 3x3 grid of map tiles centered on the location
- Displays# Address Map Popup Chrome Extension (OpenStreetMap)

A Chrome extension that detects highlighted addresses and coordinates on web pages and shows them on an interactive OpenStreetMap popup. **No API keys required!**

## Features

- **Smart Detection**: Automatically detects various address formats and coordinate systems
- **Instant Maps**: Shows location on OpenStreetMap in a popup next to highlighted text
- **No API Keys**: Uses free OpenStreetMap and Nominatim services
- **Multiple Formats Supported**:
  - Street addresses (123 Main St, City, State ZIP)
  - Decimal coordinates (40.7128, -74.0060)
  - DMS coordinates (40°42'46"N 74°00'21"W)
- **Clean UI**: Non-intrusive popup that appears only when needed
- **Quick Actions**: Direct links to both OpenStreetMap and Google Maps

## Setup Instructions

### 1. No API Keys Needed! 🎉

Unlike Google Maps, OpenStreetMap is completely free and open. No registration or API keys required!

### 2. Install the Extension

1. Download/clone all the extension files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the extension folder
5. The extension should now appear in your extensions list

### 3. Start Using Immediately

1. Navigate to any webpage
2. Highlight text containing an address or coordinates
3. A map popup will automatically appear showing the location
4. Click "Open in OpenStreetMap" or "Open in Google Maps" for full view

## Supported Address Formats

The extension recognizes a wide variety of address formats from around the world:

**Street Addresses:**
- `123 Main Street, New York, NY 10001` (US format)
- `789 Broadway, Seattle` (US format without ZIP)
- `456 Oak Ave, Los Angeles, CA` (abbreviated street type)

**International Addresses:**
- `Av J.M. de Pueyrredón 85, CP 5000` (Spanish/Argentine format)
- `Via Roma 123, Milano` (Italian format)
- `Rue de la Paix 45, Paris` (French format)
- `Strasse Unter den Linden 77, Berlin` (German format)
- `Rua Augusta 1000, São Paulo` (Portuguese/Brazilian format)

**Various Street Formats:**
- Number first: `123 Broadway`, `85 Main Street`
- Street first: `Broadway 123`, `Pueyrredón 85` (European style)
- With prefixes: `Av. 9 de Julio 1234`, `Pl. San Martín 56`

**Postal Code Formats:**
- `CP 5000` (Código Postal)
- `ZIP 12345` (US ZIP code)
- `Postal Code: 1000` (Generic format)
- `PLZ 10115` (German Postleitzahl)

**City/Region Combinations:**
- `Buenos Aires, Argentina`
- `Paris, France`
- `Tokyo, Japan`
- `Seattle, WA`

**Coordinates:**
- `40.7128, -74.0060` (decimal degrees)
- `40.7128,-74.0060` (no spaces)
- `40°42'46"N 74°00'21"W` (degrees, minutes, seconds)

## Technical Details

**Mapping Services Used:**
- **OpenStreetMap**: For tile layers and map display (using direct tile API)
- **Nominatim**: For geocoding addresses (free OSM service)
- **No external libraries**: Uses native browser APIs and OSM tile system

**How the Maps Work:**
- Calculates OSM tile coordinates for the location
- Loads a 3x3 grid of map tiles centered on the location
- Displays a clickable map preview with accurate positioning
- No CSP issues since it only uses image tiles and native HTML/CSS

## File Structure

```
extension/
├── manifest.json          # Extension configuration
├── content.js            # Main content script with OSM integration
├── content.css           # Popup styling
├── popup.html            # Info popup (no settings needed!)
├── popup.js              # Simple popup script
├── background.js         # Optional service worker
└── README.md             # This file
```

## Permissions Explained

- `activeTab`: Access current tab content to detect text selection
- No storage permission needed (no API keys to store!)

## Advantages of OpenStreetMap

✅ **Free**: No costs, quotas, or billing  
✅ **Open**: Community-driven, transparent data  
✅ **Privacy**: No tracking or data collection  
✅ **Global**: Worldwide coverage with local contributions  
✅ **No Setup**: Works immediately after installation  

## Detection Features

**Smart Pattern Matching:**
- Supports Unicode characters for international street names
- Handles various street type abbreviations and translations
- Recognizes both "number street" and "street number" formats
- Scores potential matches to choose the best address candidate

**International Support:**
- Works with addresses in Spanish, French, German, Italian, Portuguese, and more
- Recognizes international postal code formats (CP, PLZ, CAP, etc.)
- Handles accented characters and special symbols in street names
- Supports various addressing conventions worldwide

## Troubleshooting

**Maps not loading:**
- Check internet connection
- Ensure cdnjs.cloudflare.com is accessible
- Check browser console for error messages

**Address not detected:**
- Try selecting more complete address text
- Ensure the address format matches supported patterns
- Check that text selection is clean (no extra characters)

**Popup not appearing:**
- Refresh the page after installing the extension
- Check that the extension is enabled in chrome://extensions/
- Try with a known good address format

## Customization

You can modify the detection patterns in `content.js`:
- Add new address patterns to `ADDRESS_PATTERNS` array
- Add coordinate formats to `COORDINATE_PATTERNS` array
- Adjust popup styling in `content.css`
- Change map providers in the CONFIG object

## Privacy

This extension:
- Only processes text you actively highlight
- Makes requests only to OpenStreetMap services
- Does not collect, store, or transmit personal data
- Uses community-maintained, open-source mapping data
- No tracking or analytics

## Contributing to OpenStreetMap

If you find missing or incorrect location data:
1. Visit [OpenStreetMap.org](https://www.openstreetmap.org)
2. Create a free account
3. Use the built-in editor to improve the map
4. Your changes will be available worldwide!