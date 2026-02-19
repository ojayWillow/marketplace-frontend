import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Task } from '@marketplace/shared';
import { MAP_TILE_URL, MAP_ATTRIBUTION, MAP_TILE_PERF, MAP_CONTAINER_PROPS } from '../../../constants/map';

interface TaskLocationMapProps {
  task: Task;
}

export const TaskLocationMap = ({ task }: TaskLocationMapProps) => {
  const { t } = useTranslation();

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
          <span>📍</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{task.location?.split(',')[0] || t('taskDetail.location', 'Location')}</span>
        </div>
        <a
          href={`https://www.google.com/maps?q=${task.latitude},${task.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium"
        >
          {t('taskDetail.openInMaps', 'Open in Maps →')}
        </a>
      </div>

      {/* Compact map — isolate z-index so Leaflet tiles don't bleed over modals */}
      <div className="h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative" style={{ zIndex: 0, isolation: 'isolate' }}>
        <MapContainer
          center={[task.latitude, task.longitude]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          zoomControl={false}
          {...MAP_CONTAINER_PROPS}
        >
          <TileLayer
            attribution={MAP_ATTRIBUTION}
            url={MAP_TILE_URL}
            {...MAP_TILE_PERF}
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
