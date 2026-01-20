import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, ActivityIndicator, Button } from 'react-native-paper';
import { Stack, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMyOfferings, type Offering } from '@marketplace/shared';

export default function MyServicesScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['my-services'],
    queryFn: getMyOfferings,
  });

  const offerings = data?.offerings || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: '#dcfce7', text: '#166534' };
      case 'paused': return { bg: '#fef3c7', text: '#92400e' };
      case 'inactive': return { bg: '#f3f4f6', text: '#374151' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'paused': return 'Paused';
      case 'inactive': return 'Inactive';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'My Services', headerBackTitle: 'Profile' }} />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#f97316" />
            </View>
          ) : isError ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>Failed to load</Text>
              <Button mode="contained" onPress={() => refetch()}>Retry</Button>
            </View>
          ) : offerings.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyIcon}>🛠️</Text>
              <Text style={styles.emptyText}>No services yet</Text>
              <Text style={styles.emptySubtext}>Create a service to start offering your skills</Text>
              <Button mode="contained" onPress={() => router.push('/offering/create')} style={styles.createButton}>
                Create Service
              </Button>
            </View>
          ) : (
            offerings.map((offering: Offering) => {
              const statusColors = getStatusColor(offering.status || 'active');
              return (
                <Card key={offering.id} style={styles.card} onPress={() => router.push(`/offering/${offering.id}`)}>
                  <Card.Content>
                    <View style={styles.cardHeader}>
                      <Text variant="titleMedium" numberOfLines={1} style={styles.cardTitle}>{offering.title}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>{getStatusLabel(offering.status || 'active')}</Text>
                      </View>
                    </View>
                    <Text style={styles.category}>{offering.category}</Text>
                    <Text style={styles.description} numberOfLines={2}>{offering.description}</Text>
                    <View style={styles.cardFooter}>
                      <Text style={styles.price}>
                        {offering.price_type === 'hourly' ? `€${offering.price}/hr` :
                         offering.price_type === 'fixed' ? `€${offering.price}` : 'Negotiable'}
                      </Text>
                      <Button 
                        mode="text" 
                        compact 
                        onPress={() => router.push(`/offering/${offering.id}/edit`)}
                        textColor="#f97316"
                      >
                        Edit
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollView: { flex: 1 },
  content: { padding: 16 },
  centerContainer: { alignItems: 'center', paddingVertical: 48 },
  errorText: { color: '#ef4444', marginBottom: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { marginTop: 12, color: '#6b7280', fontSize: 16, fontWeight: '500' },
  emptySubtext: { marginTop: 4, color: '#9ca3af', fontSize: 14 },
  createButton: { marginTop: 16, backgroundColor: '#f97316' },
  card: { marginBottom: 12, backgroundColor: '#ffffff', borderRadius: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontWeight: '600', flex: 1, marginRight: 12, color: '#1f2937' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },
  category: { color: '#f97316', fontSize: 13, marginBottom: 6 },
  description: { color: '#6b7280', marginBottom: 12, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: '#f97316', fontWeight: 'bold', fontSize: 16 },
});
