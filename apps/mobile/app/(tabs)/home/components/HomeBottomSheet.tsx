import { View, FlatList, Animated, TouchableOpacity } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Task, Offering } from '@marketplace/shared';
import { FocusedTaskCard, FocusedOfferingCard, TaskCard } from '../../../../src/features/home/components';
import { JOB_COLOR, OFFERING_COLOR } from '../../../../src/features/home/constants';

interface HomeBottomSheetProps {
  sheetHeight: Animated.AnimatedInterpolation<number>;
  panResponder: any;
  focusedTask: Task | null;
  focusedOffering: Offering | null;
  sortedTasks: Task[];
  userLocation: { latitude: number; longitude: number };
  hasRealLocation: boolean;
  onViewTaskDetails: (id: number) => void;
  onViewOfferingDetails: (id: number) => void;
  onCloseFocusedTask: () => void;
  onCloseFocusedOffering: () => void;
  onTaskItemPress: (task: Task) => void;
  onCreatePress: () => void;
  listRef: React.RefObject<FlatList>;
  styles: any;
}

export function HomeBottomSheet({
  sheetHeight,
  panResponder,
  focusedTask,
  focusedOffering,
  sortedTasks,
  userLocation,
  hasRealLocation,
  onViewTaskDetails,
  onViewOfferingDetails,
  onCloseFocusedTask,
  onCloseFocusedOffering,
  onTaskItemPress,
  onCreatePress,
  listRef,
  styles,
}: HomeBottomSheetProps) {
  const renderJobItem = ({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      userLocation={userLocation}
      hasRealLocation={hasRealLocation}
      onPress={onTaskItemPress}
      styles={styles}
    />
  );

  const renderEmptyList = () => (
    <View style={styles.emptySheet}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyText}>No jobs found</Text>
      <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
    </View>
  );

  return (
    <Animated.View style={[styles.bottomSheet, { height: sheetHeight }]}>
      <View {...panResponder.panHandlers} style={styles.sheetHandle}>
        <View style={styles.handleBar} />
        <View style={styles.sheetTitleRow}>
          <Text style={styles.sheetTitle}>
            {focusedTask ? 'Job Details' : focusedOffering ? 'Service Details' : `${sortedTasks.length} job${sortedTasks.length !== 1 ? 's' : ''} nearby`}
          </Text>
          {(focusedTask || focusedOffering) ? (
            <IconButton 
              icon="close" 
              size={20} 
              onPress={focusedTask ? onCloseFocusedTask : onCloseFocusedOffering} 
            />
          ) : (
            <TouchableOpacity 
              style={styles.quickPostButton}
              onPress={onCreatePress}
              activeOpacity={0.8}
            >
              <LinearGradient 
                colors={[JOB_COLOR, OFFERING_COLOR]} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 1 }} 
                style={{ position: 'absolute', width: '100%', height: '100%' }} 
              />
              <Text style={styles.quickPostIcon}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {focusedTask ? (
        <FocusedTaskCard 
          task={focusedTask} 
          userLocation={userLocation} 
          hasRealLocation={hasRealLocation} 
          onViewDetails={onViewTaskDetails} 
          styles={styles} 
        />
      ) : focusedOffering ? (
        <FocusedOfferingCard
          offering={focusedOffering}
          onViewDetails={onViewOfferingDetails}
          styles={styles}
        />
      ) : sortedTasks.length === 0 ? (
        renderEmptyList()
      ) : (
        <FlatList
          ref={listRef}
          data={sortedTasks}
          renderItem={renderJobItem}
          keyExtractor={(item) => `task-${item.id}`}
          showsVerticalScrollIndicator
          contentContainerStyle={styles.listContent}
        />
      )}
    </Animated.View>
  );
}
