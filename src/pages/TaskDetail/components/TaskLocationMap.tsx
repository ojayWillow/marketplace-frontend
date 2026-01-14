import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Task } from '../../../api/tasks';

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
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
      <div className="flex items-start gap-2 text-gray-600 mb-4">
        <span className="text-red-500 text-lg">📍</span>
        <span>{task.location || 'Location not specified'}</span>
      </div>
      <div className="h-72 rounded-lg overflow-hidden border border-gray-200">
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
                <p className="font-semibold">{task.title}</p>
                <p className="text-sm text-gray-500">Job location</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      <a 
        href={`https://www.google.com/maps?q=${task.latitude},${task.longitude}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-600 hover:underline text-sm mt-3 inline-block"
      >
        Open in Google Maps →
      </a>
    </div>
  );
};
