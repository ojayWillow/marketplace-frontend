import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapControllerProps {
  lat: number;
  lng: number;
  radius: number;
}

// Map component that handles recentering and zoom based on radius
const MapController = ({ lat, lng, radius }: MapControllerProps) => {
  const map = useMap();
  
  useEffect(() => {
    // Calculate zoom level based on radius
    // 0 = All Latvia, use zoom 7 and center on Latvia
    // Otherwise zoom based on radius
    if (radius === 0) {
      // Center on Latvia (approximately) but still show user's location area
      map.setView([56.8796, 24.6032], 7);
    } else {
      // Zoom levels: 5km=13, 10km=12, 25km=11, 50km=10, 100km=9
      let zoom = 13;
      if (radius <= 5) zoom = 13;
      else if (radius <= 10) zoom = 12;
      else if (radius <= 25) zoom = 11;
      else if (radius <= 50) zoom = 10;
      else if (radius <= 100) zoom = 9;
      else zoom = 8;
      
      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, radius, map]);
  
  return null;
};

export default MapController;
