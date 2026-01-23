import { useMapEvents } from 'react-leaflet';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationPicker = ({ onLocationSelect }: LocationPickerProps) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export default LocationPicker;
