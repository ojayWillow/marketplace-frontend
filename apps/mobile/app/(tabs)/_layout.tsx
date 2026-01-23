import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

export default function TabsLayout() {
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  // Simple icon components using emoji (works cross-platform)
  const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => {
    const iconStyles = StyleSheet.create({
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
    });

    return (
      <View style={[iconStyles.iconContainer, focused && iconStyles.iconFocused]}>
        <Text style={iconStyles.iconEmoji}>{emoji}</Text>
      </View>
    );
  };

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
          tabBarIcon: ({ focused }) => <TabIcon emoji="💼" focused={focused} />,
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
