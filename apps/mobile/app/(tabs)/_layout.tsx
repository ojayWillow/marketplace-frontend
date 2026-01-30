import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';
import { useTranslation } from '../../src/hooks/useTranslation';

export default function TabsLayout() {
  const { t } = useTranslation();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

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
        lazy: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.home,
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
          lazy: false,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: t.tabs.tasks,
          tabBarIcon: ({ focused }) => <TabIcon emoji="💼" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t.tabs.messages,
          tabBarIcon: ({ focused }) => <TabIcon emoji="💬" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.tabs.profile,
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="listings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="offerings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
