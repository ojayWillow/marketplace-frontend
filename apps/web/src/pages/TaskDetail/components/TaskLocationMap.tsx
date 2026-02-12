import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Task } from '@marketplace/shared';

interface TaskLocationMapProps {
  task: Task;
}

export const TaskLocationMap = ({ task }: TaskLocationMapProps) => {
  if (!task.latitude || !task.longitude) return null;

  const taskIcon = divIcon({
    className: 'custom-task-icon',
    html: '<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  return (
    <div>
      {/* City name + Google Maps link in one row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-sm">
          <span>\uD83D\uDCCD</span>
          <span className="font-medium text-gray-700">{task.location?.split(',')[0] || 'Location'}</span>
        </div>
        <a
          href={`https://www.google.com/maps?q=${task.latitude},${task.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 text-xs font-medium"
        >
          Open in Maps \u2192
        </a>
      </div>

      {/* Compact map — isolate z-index so Leaflet tiles don't bleed over modals */}
      <div className="h-32 rounded-lg overflow-hidden border border-gray-200 relative" style={{ zIndex: 0, isolation: 'isolate' }}>
        <MapContainer
          center={[task.latitude, task.longitude]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[task.latitude, task.longitude]} icon={taskIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-xs">{task.title}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};
