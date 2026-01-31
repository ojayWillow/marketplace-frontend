import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface } from 'react-native-paper';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';
import { useTranslation } from '../../src/hooks/useTranslation';

export default function ListingsScreen() {
  const { t } = useTranslation();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.backgroundSecondary,
    },
    header: {
      padding: 16,
      backgroundColor: themeColors.card,
    },
    title: {
      fontWeight: 'bold',
      color: themeColors.text,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    comingSoonContainer: {
      alignItems: 'center',
      paddingVertical: 48,
    },
    emoji: {
      fontSize: 64,
      marginBottom: 16,
    },
    comingSoonTitle: {
      fontWeight: 'bold',
      color: themeColors.text,
      marginBottom: 12,
    },
    comingSoonText: {
      color: themeColors.textSecondary,
      fontSize: 16,
      textAlign: 'center',
    },
    featuresCard: {
      backgroundColor: themeColors.card,
      borderRadius: 16,
      padding: 20,
      marginTop: 24,
    },
    featuresTitle: {
      fontWeight: '600',
      color: themeColors.text,
      fontSize: 16,
      marginBottom: 16,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    featureIcon: {
      fontSize: 20,
      marginRight: 12,
      width: 28,
    },
    featureText: {
      color: themeColors.textSecondary,
      fontSize: 15,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>{t('listings.title')}</Text>
      </Surface>

      <View style={styles.content}>
        <View style={styles.comingSoonContainer}>
          <Text style={styles.emoji}>🛍️</Text>
          <Text variant="headlineSmall" style={styles.comingSoonTitle}>
            {t('listings.comingSoon')}
          </Text>
          <Text style={styles.comingSoonText}>
            {t('listings.comingSoonDescription')}
          </Text>
        </View>

        {/* Features Preview */}
        <Surface style={styles.featuresCard} elevation={0}>
          <Text style={styles.featuresTitle}>{t('listings.featuresTitle')}</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📸</Text>
            <Text style={styles.featureText}>{t('listings.features.browsePhotos')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🏷️</Text>
            <Text style={styles.featureText}>{t('listings.features.filterCategory')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>➕</Text>
            <Text style={styles.featureText}>{t('listings.features.createListings')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureText}>{t('listings.features.messageSellers')}</Text>
          </View>
        </Surface>
      </View>
    </SafeAreaView>
  );
}
