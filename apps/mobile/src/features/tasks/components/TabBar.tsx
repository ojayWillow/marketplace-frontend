import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { haptic } from '../../../../utils/haptics';
import { MainTab } from '../constants';

interface TabBarProps {
  mainTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  styles: any;
}

export function TabBar({ mainTab, onTabChange, styles }: TabBarProps) {
  const handleTabChange = (tab: MainTab) => {
    haptic.selection();
    onTabChange(tab);
  };

  return (
    <View style={styles.tabsWrapper}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabPill, mainTab === 'all' && styles.tabPillActive]}
          onPress={() => handleTabChange('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabPillText, mainTab === 'all' && styles.tabPillTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabPill, mainTab === 'jobs' && styles.tabPillActive]}
          onPress={() => handleTabChange('jobs')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabPillText, mainTab === 'jobs' && styles.tabPillTextActive]}>Jobs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabPill, mainTab === 'services' && styles.tabPillActive]}
          onPress={() => handleTabChange('services')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabPillText, mainTab === 'services' && styles.tabPillTextActive]}>Services</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
