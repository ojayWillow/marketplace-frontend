# Quick Help - Interactive Map Feature

## Overview

The Quick Help feature is now integrated with an interactive Leaflet map that displays nearby service requests in a game-like interface. Users can visually explore available tasks on a map of Riga, Latvia, and accept tasks to earn money by helping others in their community.

## Features Implemented

### 🗺️ Interactive Map
- **Technology**: Leaflet.js with React-Leaflet integration
- **Map Provider**: OpenStreetMap tiles
- **Location**: Centered on Riga, Latvia (56.9496°N, 24.1052°E)
- **Zoom Level**: 13 (neighborhood level view)

### 📍 Custom Markers
- Each task is represented by a custom marker with an emoji icon
- Blue circular markers with white borders for visibility
- Different emojis for different task categories:
  - 🐕 Pet care (dog walking)
  - 📦 Moving help (furniture)
  - 🛒 Shopping assistance
  - 🧹 Cleaning services
  - 📄 Delivery tasks
  - 🌿 Outdoor/garden work

### 💬 Interactive Popups
When clicking on a marker, users see:
- Task title and description
- Reward amount (in dollars)
- Distance from user location
- "Accept Task" button for immediate action

### 📋 Task List View
Below the map, a comprehensive list shows:
- All available tasks with details
- Category badges
- Distance indicators
- Reward amounts
- Accept buttons
- Hover effects for better UX

## Technical Implementation

### Dependencies Added
```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "@types/leaflet": "^1.9.8"
}
```

### Key Components

1. **MapContainer**: Main map wrapper from react-leaflet
2. **TileLayer**: OpenStreetMap tile provider
3. **Marker**: Custom markers with emoji icons
4. **Popup**: Information cards for each task

### Files Modified

1. **package.json**: Added Leaflet dependencies
2. **src/pages/Tasks.tsx**: Complete rewrite with map integration
3. **MAP_INTEGRATION.md**: Documentation of map options

### Custom Icon Generation

Markers are dynamically generated using SVG data URLs:
```typescript
const createCustomIcon = (emoji: string) => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
        <circle cx="20" cy="20" r="18" fill="#3b82f6" stroke="white" stroke-width="3"/>
        <text x="20" y="26" font-size="18" text-anchor="middle" fill="white">${emoji}</text>
      </svg>
    `)}`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  })
}
```

## Mock Data

Currently using 6 mock tasks centered around Riga:
- Tasks are distributed across different neighborhoods
- Distances range from 0.5km to 2.1km
- Rewards range from $8 to $35
- Various categories to demonstrate different use cases

## Future Enhancements

### Planned Features
1. **Real-time Location**: Use browser geolocation API to center map on user's actual location
2. **Live Data**: Connect to backend API for real task data
3. **Task Filtering**: Filter by category, distance, or reward amount
4. **User Location Marker**: Show user's current position on map
5. **Route Planning**: Show directions to selected tasks
6. **Clustering**: Group nearby markers for better performance
7. **Search**: Search for tasks by address or location
8. **Notifications**: Alert users to new nearby tasks

### Potential Map Providers
- Google Maps (requires API key, costs money)
- Mapbox (better customization, free tier available)
- OpenStreetMap (current - free, open source)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

This will install all required packages including:
- leaflet
- react-leaflet
- @types/leaflet

### 2. Run Development Server
```bash
npm run dev
```

### 3. Access the App
Open http://localhost:5173 in your browser and navigate to the "Quick Help" section.

## Styling

- Leaflet CSS is imported directly in Tasks.tsx
- Tailwind CSS classes for UI components
- Responsive design works on mobile and desktop
- Map height: 500px on all screen sizes
- Custom hover effects on task cards

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with touch interactions

## Performance Considerations

- Lightweight mock data (6 tasks)
- SVG icons are generated on-the-fly but cached
- Map tiles are loaded on-demand
- No external API calls yet (all data is local)

## Known Issues

1. Geolocation not yet implemented (defaults to Riga center)
2. No backend integration (mock data only)
3. Accept button not yet functional (needs backend endpoint)
4. No user authentication (will be added with backend)

## Contributing

To add new task categories:
1. Add emoji to task data
2. Create corresponding category type
3. Update styling if needed

## Resources

- [Leaflet Documentation](https://leafletjs.com/)
- [React-Leaflet Documentation](https://react-leaflet.js.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## Support

For questions or issues, please check:
1. MAP_INTEGRATION.md for map provider options
2. ROADMAP.md for planned features
3. Create a GitHub issue for bugs or feature requests
