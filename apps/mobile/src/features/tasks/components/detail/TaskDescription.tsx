import { View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { type Task } from '@marketplace/shared';
import { styles } from '../../styles/taskDetailStyles';

interface TaskDescriptionProps {
  task: Task;
  onOpenMap: () => void;
}

export function TaskDescription({ task, onOpenMap }: TaskDescriptionProps) {
  const hasLocation = !!task.location;
  const hasCoordinates = !!(task.latitude && task.longitude);

  return (
    <View style={styles.sectionCard}>
      {/* Description */}
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.descriptionText}>{task.description}</Text>

      {/* Location - in same card */}
      {hasLocation && (
        <>
          <View style={styles.divider} />
          <View style={styles.locationHeader}>
            <Text style={styles.sectionTitle}>Location</Text>
            {task.distance !== undefined && task.distance !== null && (
              <Text style={styles.distanceText}>
                {task.distance.toFixed(1)} km away
              </Text>
            )}
          </View>
          <Text style={styles.locationAddress}>{task.location}</Text>
          {hasCoordinates && (
            <TouchableOpacity style={styles.mapBtn} onPress={onOpenMap}>
              <Text style={styles.mapBtnText}>🗺️ Open in Maps</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}
