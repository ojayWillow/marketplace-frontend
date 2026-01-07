# PWA Icons Setup

You need to create the following icon files for the PWA to work properly:

## Required Icons

1. **pwa-192x192.png** - 192x192 pixels
2. **pwa-512x512.png** - 512x512 pixels  
3. **apple-touch-icon.png** - 180x180 pixels (for iOS)
4. **favicon.ico** - Multi-size favicon

## How to Generate

### Option 1: Online Generator (Easiest)
1. Go to https://realfavicongenerator.net/
2. Upload your logo (use the existing logo.svg or create a 512x512 PNG)
3. Download the generated package
4. Extract and copy the files to the `public` folder

### Option 2: Use Your Logo
If you have a square logo/icon:
1. Create 512x512 PNG version → save as `pwa-512x512.png`
2. Resize to 192x192 → save as `pwa-192x192.png`
3. Resize to 180x180 → save as `apple-touch-icon.png`

### Design Tips for PWA Icons
- Use a **square** design (1:1 ratio)
- Add **padding** around the logo (about 10-15%)
- Use a **solid background color** (not transparent) - blue (#3B82F6) matches your theme
- Keep the design **simple** - it will be displayed small

## Quick Test Icons

For testing, you can use placeholder icons. Create simple colored squares:
- Blue background (#3B82F6) with white "M" letter

## Verify PWA Setup

After adding icons:
1. Run `npm run build`
2. Run `npm run preview`
3. Open Chrome DevTools → Application tab → Manifest
4. Check that all icons load correctly
5. Try "Install" from the browser menu
