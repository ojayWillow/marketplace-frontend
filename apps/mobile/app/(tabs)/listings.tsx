import { View, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Surface } from 'react-native-paper';

export default function ListingsScreen() {
  const handleOpenWeb = () => {
    Linking.openURL('https://marketplace-frontend-tau-seven.vercel.app/listings');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>Listings</Text>
      </Surface>

      <View style={styles.content}>
        <View style={styles.comingSoonContainer}>
          <Text style={styles.emoji}>🛍️</Text>
          <Text variant="headlineSmall" style={styles.comingSoonTitle}>
            Coming Soon!
          </Text>
          <Text style={styles.comingSoonText}>
            Buy & sell classifieds are coming to the mobile app soon.
          </Text>
          <Text style={styles.comingSoonSubtext}>
            In the meantime, you can browse listings on our web version.
          </Text>
          
          <Button
            mode="contained"
            onPress={handleOpenWeb}
            style={styles.webButton}
            icon="open-in-new"
          >
            Open Web Version
          </Button>
        </View>

        {/* Features Preview */}
        <Surface style={styles.featuresCard} elevation={0}>
          <Text style={styles.featuresTitle}>What's coming:</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📸</Text>
            <Text style={styles.featureText}>Browse listings with photos</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🏷️</Text>
            <Text style={styles.featureText}>Filter by category & price</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>➕</Text>
            <Text style={styles.featureText}>Create and manage your listings</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureText}>Message sellers directly</Text>
          </View>
        </Surface>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontWeight: 'bold',
    color: '#1f2937',
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
    color: '#1f2937',
    marginBottom: 12,
  },
  comingSoonText: {
    color: '#4b5563',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  comingSoonSubtext: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  webButton: {
    borderRadius: 12,
  },
  featuresCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
  },
  featuresTitle: {
    fontWeight: '600',
    color: '#1f2937',
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
    color: '#4b5563',
    fontSize: 15,
  },
});
