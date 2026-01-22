import { View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, RadioButton } from 'react-native-paper';
import { Stack } from 'expo-router';
import { useThemeStore, ThemeMode } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';

export default function AppearanceSettingsScreen() {
  const { mode, setMode, getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const options: { value: ThemeMode; label: string; description: string; icon: string }[] = [
    {
      value: 'light',
      label: 'Light',
      description: 'Always use light theme',
      icon: '☀️',
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Always use dark theme',
      icon: '🌙',
    },
    {
      value: 'system',
      label: 'System',
      description: 'Follow device settings',
      icon: '📱',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Appearance',
          headerStyle: { backgroundColor: themeColors.card },
          headerTintColor: themeColors.text,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.content}>
        <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>
          THEME
        </Text>
        
        <Surface style={[styles.optionsContainer, { backgroundColor: themeColors.card }]} elevation={0}>
          {options.map((option, index) => (
            <View key={option.value}>
              {index > 0 && <View style={[styles.divider, { backgroundColor: themeColors.border }]} />}
              <Pressable
                style={({ pressed }) => [
                  styles.option,
                  pressed && { backgroundColor: themeColors.backgroundSecondary },
                ]}
                onPress={() => setMode(option.value)}
              >
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionLabel, { color: themeColors.text }]}>
                    {option.label}
                  </Text>
                  <Text style={[styles.optionDescription, { color: themeColors.textSecondary }]}>
                    {option.description}
                  </Text>
                </View>
                <RadioButton
                  value={option.value}
                  status={mode === option.value ? 'checked' : 'unchecked'}
                  onPress={() => setMode(option.value)}
                  color="#0ea5e9"
                />
              </Pressable>
            </View>
          ))}
        </Surface>

        <Text style={[styles.footnote, { color: themeColors.textMuted }]}>
          When set to System, the app will automatically switch between light and dark themes based on your device settings.
        </Text>

        {/* Preview */}
        <Text style={[styles.sectionLabel, { color: themeColors.textSecondary, marginTop: 32 }]}>
          PREVIEW
        </Text>
        
        <Surface style={[styles.previewContainer, { backgroundColor: themeColors.card }]} elevation={0}>
          <View style={styles.previewRow}>
            <View style={[styles.previewBox, { backgroundColor: themeColors.background }]}>
              <Text style={[styles.previewLabel, { color: themeColors.textSecondary }]}>Background</Text>
            </View>
            <View style={[styles.previewBox, { backgroundColor: themeColors.card }]}>
              <Text style={[styles.previewLabel, { color: themeColors.textSecondary }]}>Card</Text>
            </View>
          </View>
          <View style={styles.previewRow}>
            <Text style={[styles.previewText, { color: themeColors.text }]}>Primary Text</Text>
            <Text style={[styles.previewText, { color: themeColors.textSecondary }]}>Secondary Text</Text>
          </View>
        </Surface>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginHorizontal: 16,
  },
  optionsContainer: {
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 64,
  },
  footnote: {
    fontSize: 13,
    marginTop: 12,
    marginHorizontal: 16,
    lineHeight: 18,
  },
  previewContainer: {
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  previewBox: {
    width: 120,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewLabel: {
    fontSize: 12,
  },
  previewText: {
    fontSize: 14,
  },
});
