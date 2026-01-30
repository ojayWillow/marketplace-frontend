import { View, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { Task, Offering } from '@marketplace/shared';
import { getMarkerColor } from '../../../../src/features/home/constants';
import { OfferingMarker } from '../../../../src/features/home/components';

interface TaskWithOffset extends Task {
  displayLat: number;
  displayLng: number;
}

interface HomeMapMarkersProps {
  tasks: TaskWithOffset[];
  offerings: Offering[];
  focusedTaskId: number | null;
  onTaskMarkerPress: (task: Task) => void;
  onOfferingMarkerPress: (offering: Offering) => void;
  styles: any;
}

export function HomeMapMarkers({
  tasks,
  offerings,
  focusedTaskId,
  onTaskMarkerPress,
  onOfferingMarkerPress,
  styles,
}: HomeMapMarkersProps) {
  return (
    <>
      {/* Task markers */}
      {tasks.map((task) => {
        const markerColor = getMarkerColor(task.category);
        const isFocused = focusedTaskId === task.id;
        
        return (
          <Marker
            key={`task-${task.id}`}
            coordinate={{ latitude: task.displayLat, longitude: task.displayLng }}
            onPress={() => onTaskMarkerPress(task)}
            tracksViewChanges={false}
            zIndex={isFocused ? 10 : 1}
          >
            <View style={[
              styles.priceMarker,
              { borderColor: markerColor },
              isFocused && styles.priceMarkerFocused
            ]}>
              <Text style={[styles.priceMarkerText, { color: markerColor }]}>
                €{task.budget?.toFixed(0) || '0'}
              </Text>
            </View>
          </Marker>
        );
      })}

      {/* Boosted offerings markers */}
      {offerings.map((offering) => (
        <Marker 
          key={`offering-${offering.id}`} 
          coordinate={{ latitude: offering.latitude!, longitude: offering.longitude! }} 
          onPress={() => onOfferingMarkerPress(offering)} 
          tracksViewChanges={false}
          zIndex={2}
        >
          <OfferingMarker offering={offering} styles={styles} />
        </Marker>
      ))}
    </>
  );
}
