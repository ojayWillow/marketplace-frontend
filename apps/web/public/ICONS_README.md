# Icon Generation Guide

This folder contains SVG source files for the Tirgus branding. PNG versions need to be generated for full browser/device compatibility.

## Source Files (SVG)

- `favicon.svg` - Main favicon (512x512 viewBox)
- `logo.svg` - Horizontal logo with text (200x50 viewBox)
- `og-image.svg` - Social sharing image (1200x630 viewBox)

## Required PNG Files

Generate these from the SVG sources:

### Favicons (from favicon.svg)
```bash
# Using Inkscape (recommended)
inkscape favicon.svg -w 16 -h 16 -o favicon-16x16.png
inkscape favicon.svg -w 32 -h 32 -o favicon-32x32.png
inkscape favicon.svg -w 180 -h 180 -o apple-touch-icon.png
inkscape favicon.svg -w 192 -h 192 -o android-chrome-192x192.png
inkscape favicon.svg -w 512 -h 512 -o android-chrome-512x512.png

# Or using ImageMagick
convert -background none favicon.svg -resize 16x16 favicon-16x16.png
convert -background none favicon.svg -resize 32x32 favicon-32x32.png
convert -background none favicon.svg -resize 180x180 apple-touch-icon.png
convert -background none favicon.svg -resize 192x192 android-chrome-192x192.png
convert -background none favicon.svg -resize 512x512 android-chrome-512x512.png
```

### Social Sharing (from og-image.svg)
```bash
inkscape og-image.svg -w 1200 -h 630 -o og-image.png

# Or using ImageMagick
convert -background none og-image.svg -resize 1200x630 og-image.png
```

### Logo (from logo.svg)
```bash
inkscape logo.svg -w 400 -h 100 -o logo.png
inkscape logo.svg -w 200 -h 50 -o logo-small.png
```

## Online Tools

If you don't have Inkscape or ImageMagick:

1. **RealFaviconGenerator** - https://realfavicongenerator.net/
   - Upload favicon.svg, generates all sizes automatically

2. **CloudConvert** - https://cloudconvert.com/svg-to-png
   - Convert SVG to PNG with custom dimensions

3. **Figma** - https://figma.com
   - Import SVG, export as PNG at various sizes

## File Checklist

- [ ] `favicon.svg` ✅ (source)
- [ ] `favicon-16x16.png`
- [ ] `favicon-32x32.png`
- [ ] `apple-touch-icon.png` (180x180)
- [ ] `android-chrome-192x192.png`
- [ ] `android-chrome-512x512.png`
- [ ] `og-image.svg` ✅ (source)
- [ ] `og-image.png` (1200x630)
- [ ] `logo.svg` ✅ (source)
- [ ] `logo.png` (400x100)

## Design Specs

### Colors
- Primary Blue: `#3B82F6`
- Dark Blue: `#1D4ED8`
- Light Blue: `#60A5FA`
- Text Dark: `#1F2937`

### Icon Concept
Shopping bag with location pin - represents:
- Marketplace (buy/sell)
- Local services (Quick Help)
- Location-based discovery
