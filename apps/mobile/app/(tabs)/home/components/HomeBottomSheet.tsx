import { View, FlatList, Animated, TouchableOpacity, ScrollView } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Task, Offering } from '@marketplace/shared';
import { FocusedTaskCard, FocusedOfferingCard, TaskCard } from '../../../../src/features/home/components';
import { JOB_COLOR, OFFERING_COLOR } from '../../../../src/features/home/constants';
import { useTranslation } from '../../../../src/hooks/useTranslation';

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
  const { t } = useTranslation();
  
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
      <Text style={styles.emptyText}>{t.home.bottomSheet.noJobsFound}</Text>
      <Text style={styles.emptySubtext}>{t.home.bottomSheet.tryAdjustFilters}</Text>
    </View>
  );
  
  const getSheetTitle = () => {
    if (focusedTask) return t.home.bottomSheet.jobDetails;
    if (focusedOffering) return t.home.bottomSheet.serviceDetails;
    const count = sortedTasks.length;
    const jobText = count === 1 ? t.home.bottomSheet.jobNearby : t.home.bottomSheet.jobsNearby;
    return `${count} ${jobText}`;
  };

  return (
    <Animated.View style={[styles.bottomSheet, { height: sheetHeight }]}>
      <View {...panResponder.panHandlers} style={styles.sheetHandle}>
        <View style={styles.handleBar} />
        <View style={styles.sheetTitleRow}>
          <Text style={styles.sheetTitle}>
            {getSheetTitle()}
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <FocusedTaskCard 
            task={focusedTask} 
            userLocation={userLocation} 
            hasRealLocation={hasRealLocation} 
            onViewDetails={onViewTaskDetails} 
            styles={styles} 
          />
        </ScrollView>
      ) : focusedOffering ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <FocusedOfferingCard
            offering={focusedOffering}
            onViewDetails={onViewOfferingDetails}
            styles={styles}
          />
        </ScrollView>
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
