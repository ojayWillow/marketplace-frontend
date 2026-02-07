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
    html: '<div style="background: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-gray-900 mb-2">Location</h2>

      {/* Distance + Location row */}
      <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
        <span>📍</span>
        <span className="font-medium">{task.location?.split(',')[0] || 'Riga'}</span>
      </div>

      {/* Small compact map */}
      <div className="h-40 rounded-lg overflow-hidden border border-gray-200 mb-2">
        <MapContainer
          center={[task.latitude, task.longitude]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
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

      {/* Google Maps link */}
      <a
        href={`https://www.google.com/maps?q=${task.latitude},${task.longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
      >
        Open in Google Maps →
      </a>
    </div>
  );
};
