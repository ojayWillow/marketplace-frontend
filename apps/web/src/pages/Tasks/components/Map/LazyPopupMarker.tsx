import { useRef, useState, useCallback } from 'react';
import { Marker, Popup } from 'react-leaflet';
import type { Marker as LeafletMarker } from 'leaflet';
import type { Icon, DivIcon } from 'leaflet';

interface LazyPopupMarkerProps {
  position: [number, number];
  icon: Icon | DivIcon;
  popupProps?: {
    maxWidth?: number;
    minWidth?: number;
    autoPan?: boolean;
    autoPanPadding?: [number, number];
    className?: string;
  };
  children: React.ReactNode;
  markerKey: string;
}

/**
 * A Marker that only renders its Popup children when opened.
 * This avoids mounting heavy popup DOM for every marker on the map.
 *
 * How it works:
 * 1. Marker renders with just an icon (cheap)
 * 2. On click, Leaflet fires 'popupopen' → we set isOpen=true
 * 3. React renders the popup children (JobMapPopup etc.)
 * 4. On close, we set isOpen=false → children unmount
 */
const LazyPopupMarker = ({
  position,
  icon,
  popupProps = {},
  children,
  markerKey,
}: LazyPopupMarkerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const markerRef = useRef<LeafletMarker>(null);

  const handlePopupOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handlePopupClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Marker
      key={markerKey}
      position={position}
      icon={icon}
      ref={markerRef}
      eventHandlers={{
        popupopen: handlePopupOpen,
        popupclose: handlePopupClose,
      }}
    >
      <Popup
        maxWidth={popupProps.maxWidth ?? 260}
        minWidth={popupProps.minWidth ?? 240}
        autoPan={popupProps.autoPan ?? true}
        autoPanPadding={popupProps.autoPanPadding ?? [20, 20]}
        className={popupProps.className}
      >
        {isOpen ? children : <div style={{ width: 240, height: 80 }} />}
      </Popup>
    </Marker>
  );
};

export default LazyPopupMarker;
