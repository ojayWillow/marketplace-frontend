import { View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { type Task } from '@marketplace/shared';
import { createTaskDetailStyles } from '../../styles/taskDetailStyles';
import { useThemeStore } from '../../../../stores/themeStore';
import { useTranslation } from '../../../../hooks/useTranslation';

interface TaskDescriptionProps {
  task: Task;
  onOpenMap: () => void;
}

export function TaskDescription({ task, onOpenMap }: TaskDescriptionProps) {
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const styles = createTaskDetailStyles(activeTheme);
  const { t } = useTranslation();
  
  const hasLocation = !!task.location;
  const hasCoordinates = !!(task.latitude && task.longitude);

  return (
    <View style={styles.sectionCard}>
      {/* Description */}
      <Text style={styles.sectionTitle}>{t.task?.description || 'Description'}</Text>
      <Text style={styles.descriptionText}>{task.description}</Text>

      {/* Location - in same card */}
      {hasLocation && (
        <>
          <View style={styles.divider} />
          <View style={styles.locationHeader}>
            <Text style={styles.sectionTitle}>{t.task?.location || 'Location'}</Text>
            {task.distance !== undefined && task.distance !== null && (
              <Text style={styles.distanceText}>
                {task.distance.toFixed(1)} km away
              </Text>
            )}
          </View>
          <Text style={styles.locationAddress}>{task.location}</Text>
          {hasCoordinates && (
            <TouchableOpacity style={styles.mapBtn} onPress={onOpenMap}>
              <Text style={styles.mapBtnText}>🗺️ {t.task?.openInMaps || 'Open in Maps'}</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}
