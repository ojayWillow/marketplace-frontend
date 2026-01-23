import { Stack } from 'expo-router';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

export default function AuthLayout() {
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerStyle: {
          backgroundColor: themeColors.card,
        },
        headerTintColor: themeColors.text,
        headerTitleStyle: {
          color: themeColors.text,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: themeColors.backgroundSecondary,
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'Sign In',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Create Account',
        }}
      />
    </Stack>
  );
}
