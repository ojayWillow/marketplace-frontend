import { Stack } from 'expo-router';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

export default function OnboardingLayout() {
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: themeColors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="values" />
      <Stack.Screen name="tutorial" />
    </Stack>
  );
}
