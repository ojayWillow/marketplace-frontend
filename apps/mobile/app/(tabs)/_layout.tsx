import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';
import { useActivityCounts } from '../../src/hooks/useActivityCounts';

export default function TabsLayout() {
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  const { total: activityCount, isLoading } = useActivityCounts();

  // Simple icon components using emoji (works cross-platform)
  const TabIcon = ({ emoji, focused, badge }: { emoji: string; focused: boolean; badge?: number }) => {
    const iconStyles = StyleSheet.create({
      container: {
        position: 'relative',
      },
      iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
      },
      iconFocused: {
        backgroundColor: activeTheme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe',
      },
      iconEmoji: {
        fontSize: 20,
      },
      badge: {
        position: 'absolute',
        top: -4,
        right: -6,
        backgroundColor: '#ef4444',
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        paddingHorizontal: 4,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: themeColors.tabBar,
      },
      badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700' as '700',
        textAlign: 'center' as 'center',
      },
    });

    // Ensure badge is a valid number and > 0
    const badgeCount = typeof badge === 'number' && badge > 0 ? badge : 0;
    const badgeDisplay = badgeCount > 9 ? '9+' : String(badgeCount);

    return (
      <View style={iconStyles.container}>
        <View style={[iconStyles.iconContainer, focused && iconStyles.iconFocused]}>
          <Text style={iconStyles.iconEmoji}>{emoji}</Text>
        </View>
        {badgeCount > 0 && (
          <View style={iconStyles.badge}>
            <Text style={iconStyles.badgeText}>{badgeDisplay}</Text>
          </View>
        )}
      </View>
    );
  };

  // Only show badge if not loading and count is valid
  const workBadge = !isLoading && typeof activityCount === 'number' ? activityCount : undefined;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.primaryAccent,
        tabBarInactiveTintColor: themeColors.tabBarInactive,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.tabBar,
          borderTopWidth: 1,
          borderTopColor: themeColors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        // PERFORMANCE: Enable lazy loading for all tabs
        // Tabs will only render when first visited
        lazy: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
          // Home tab loads eagerly since it's the default screen
          lazy: false,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Work',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💼" focused={focused} badge={workBadge} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💬" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
      {/* Hidden tabs - accessible via navigation but not in bottom bar */}
      <Tabs.Screen
        name="listings"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="offerings"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
