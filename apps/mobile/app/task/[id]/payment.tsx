import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Appbar, Button, TextInput, Card, Divider, ActivityIndicator } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTaskById, createPaymentIntent, getStripeConfig } from '@marketplace/shared';
import { useThemeStore } from '../../../src/stores/themeStore';
import { colors } from '../../../src/theme';

export default function TaskPaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id);
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  const queryClient = useQueryClient();

  const [paymentAmount, setPaymentAmount] = useState('');

  // Fetch task
  const { data: taskData, isLoading: taskLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTaskById(taskId),
  });

  // Fetch Stripe config
  const { data: stripeConfig } = useQuery({
    queryKey: ['stripeConfig'],
    queryFn: getStripeConfig,
  });

  const task = taskData?.task;
  const platformFeePercent = parseFloat(stripeConfig?.platform_fee_percent || '10');

  // Calculate fees
  const amount = parseFloat(paymentAmount) || 0;
  const platformFee = amount * (platformFeePercent / 100);
  const workerAmount = amount - platformFee;

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: () => createPaymentIntent(taskId, amount),
    onSuccess: (data) => {
      Alert.alert(
        'Payment Initiated',
        `Payment of €${amount.toFixed(2)} is being processed. Funds will be held in escrow until task completion.`,
        [
          {
            text: 'OK',
            onPress: () => {
              queryClient.invalidateQueries({ queryKey: ['task', taskId] });
              router.back();
            },
          },
        ]
      );
    },
    onError: (error: any) => {
      Alert.alert('Payment Failed', error.message || 'Failed to process payment');
    },
  });

  const handlePayment = () => {
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount');
      return;
    }

    Alert.alert(
      'Confirm Payment',
      `Pay €${amount.toFixed(2)} for this task? Funds will be held in escrow until completion.\n\nBreakdown:\n• Amount: €${amount.toFixed(2)}\n• Platform fee (${platformFeePercent}%): €${platformFee.toFixed(2)}\n• Worker receives: €${workerAmount.toFixed(2)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pay Now', onPress: () => paymentMutation.mutate() },
      ]
    );
  };

  if (taskLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]} edges={['top']}>
        <Appbar.Header style={{ backgroundColor: themeColors.card }}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Payment" titleStyle={{ color: themeColors.text }} />
        </Appbar.Header>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]} edges={['top']}>
        <Appbar.Header style={{ backgroundColor: themeColors.card }}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Payment" titleStyle={{ color: themeColors.text }} />
        </Appbar.Header>
        <View style={styles.centered}>
          <Text style={{ color: themeColors.text }}>Task not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]} edges={['top']}>
      <Appbar.Header style={{ backgroundColor: themeColors.card }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Payment" titleStyle={{ color: themeColors.text }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Task Info */}
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <Text variant="titleMedium" style={[styles.taskTitle, { color: themeColors.text }]}>
              {task.title}
            </Text>
            {task.budget && (
              <Text variant="bodyMedium" style={[styles.budget, { color: themeColors.textSecondary }]}>
                Budget: €{task.budget}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Payment Amount */}
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: themeColors.text }]}>
              💳 Escrow Payment
            </Text>
            <Text variant="bodySmall" style={[styles.description, { color: themeColors.textSecondary }]}>
              Pay upfront. Funds are held safely until task completion.
            </Text>

            <TextInput
              label="Payment Amount (€)"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="currency-eur" />}
              placeholder={task.budget ? `${task.budget}` : '50.00'}
            />

            {amount > 0 && (
              <View style={styles.breakdown}>
                <Divider style={styles.divider} />
                <Text variant="labelLarge" style={[styles.breakdownTitle, { color: themeColors.text }]}>
                  Payment Breakdown
                </Text>
                
                <View style={styles.breakdownRow}>
                  <Text style={{ color: themeColors.textSecondary }}>Task amount:</Text>
                  <Text style={[styles.breakdownAmount, { color: themeColors.text }]}>€{amount.toFixed(2)}</Text>
                </View>

                <View style={styles.breakdownRow}>
                  <Text style={{ color: themeColors.textSecondary }}>Platform fee ({platformFeePercent}%):</Text>
                  <Text style={[styles.breakdownAmount, { color: '#ef4444' }]}>-€{platformFee.toFixed(2)}</Text>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.breakdownRow}>
                  <Text style={[styles.workerReceives, { color: themeColors.text }]}>Worker receives:</Text>
                  <Text style={[styles.workerAmount, { color: '#10b981' }]}>€{workerAmount.toFixed(2)}</Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* How it Works */}
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: themeColors.text }]}>
              🔒 How Escrow Works
            </Text>
            <View style={styles.steps}>
              <Text style={[styles.step, { color: themeColors.textSecondary }]}>1. Pay now → Funds held safely</Text>
              <Text style={[styles.step, { color: themeColors.textSecondary }]}>2. Worker completes task</Text>
              <Text style={[styles.step, { color: themeColors.textSecondary }]}>3. You confirm completion</Text>
              <Text style={[styles.step, { color: themeColors.textSecondary }]}>4. Payment released to worker</Text>
            </View>
            <Text variant="bodySmall" style={[styles.note, { color: themeColors.textMuted }]}>
              💡 Your money is protected. Refunds available if issues arise.
            </Text>
          </Card.Content>
        </Card>

        {/* Pay Button */}
        <Button
          mode="contained"
          onPress={handlePayment}
          loading={paymentMutation.isPending}
          disabled={!amount || amount <= 0 || paymentMutation.isPending}
          style={styles.payButton}
          contentStyle={styles.payButtonContent}
        >
          Pay €{amount.toFixed(2)} Now
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  taskTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  budget: {
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    marginTop: 8,
  },
  breakdown: {
    marginTop: 16,
  },
  divider: {
    marginVertical: 12,
  },
  breakdownTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownAmount: {
    fontWeight: '600',
  },
  workerReceives: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  workerAmount: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  steps: {
    marginTop: 8,
  },
  step: {
    marginBottom: 8,
    lineHeight: 22,
  },
  note: {
    marginTop: 12,
    fontStyle: 'italic',
  },
  payButton: {
    marginTop: 8,
    marginBottom: 32,
  },
  payButtonContent: {
    height: 50,
  },
});
