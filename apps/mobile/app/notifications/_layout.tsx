import { Stack } from 'expo-router';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

export default function NotificationsLayout() {
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerStyle: { backgroundColor: themeColors.card },
        headerTintColor: themeColors.primaryAccent,
        headerTitleStyle: { color: themeColors.text },
      }}
    />
  );
}
