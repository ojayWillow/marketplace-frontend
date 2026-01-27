# Stripe Payment Implementation Guide

## Overview
This guide provides the complete implementation of Stripe escrow payments for the marketplace app.

## Setup

### 1. Install Dependencies

```bash
cd apps/mobile
npm install @stripe/stripe-react-native
```

### 2. Add Environment Variables

Add to your `.env` file:
```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

## Implementation Steps

### Step 1: Update Task Creation Screen

Add payment toggle to `apps/mobile/app/task/create.tsx` - add after line 26:

```typescript
const [requirePayment, setRequirePayment] = useState(false);
```

Add this section before the "Mark as Urgent" section (around line 350):

```tsx
<Surface style={styles.section} elevation={0}>
  <View style={styles.urgentRow}>
    <View style={styles.urgentInfo}>
      <Text variant="titleMedium">💳 Require Payment (Escrow)</Text>
      <Text style={styles.urgentHint}>Payment held in escrow until task completion</Text>
    </View>
    <Chip
      selected={requirePayment}
      onPress={() => setRequirePayment(!requirePayment)}
      mode={requirePayment ? 'flat' : 'outlined'}
    >
      {requirePayment ? 'Yes' : 'No'}
    </Chip>
  </View>
</Surface>
```

Update the `handleSubmit` function to include payment flag (around line 85):

```typescript
create Mutation.mutate({
  title: title.trim(),
  description: description.trim(),
  budget: parseFloat(budget),
  category,
  difficulty,
  location: location.address,
  latitude: location.latitude,
  longitude: location.longitude,
  deadline: deadline?.toISOString(),
  is_urgent: isUrgent,
  payment_required: requirePayment, // ADD THIS LINE
  creator_id: user.id,
});
```

### Step 2: Create Payment Screen

Create new file `apps/mobile/app/task/[id]/payment.tsx`:

```typescript
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Surface, ActivityIndicator } from 'react-native-paper';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { StripeProvider, useStripe, CardField } from '@stripe/stripe-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask, createPaymentIntent, getStripeConfig } from '@marketplace/shared';
import { haptic } from '../../../utils/haptics';

function PaymentContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = parseInt(id);
  const { confirmPayment } = useStripe();
  const queryClient = useQueryClient();
  
  const [cardComplete, setCardComplete] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Get task details
  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(taskId),
  });

  // Create payment intent mutation
  const createPaymentMutation = useMutation({
    mutationFn: () => createPaymentIntent(taskId, task!.budget),
    onSuccess: (data) => {
      setClientSecret(data.client_secret);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to initialize payment');
    },
  });

  // Create payment intent when component mounts
  useEffect(() => {
    if (task && !clientSecret && !createPaymentMutation.isPending) {
      createPaymentMutation.mutate();
    }
  }, [task]);

  // Handle payment submission
  const handlePayment = async () => {
    if (!clientSecret || !cardComplete) return;

    haptic.heavy();

    try {
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        Alert.alert('Payment Failed', error.message);
        return;
      }

      if (paymentIntent?.status === 'Succeeded') {
        haptic.success();
        queryClient.invalidateQueries({ queryKey: ['task', taskId] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        
        Alert.alert(
          'Payment Successful! 🎉',
          'Funds are held in escrow until task completion.',
          [
            {
              text: 'View Task',
              onPress: () => router.replace(`/task/${taskId}`),
            },
          ]
        );
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Payment processing failed');
    }
  };

  if (taskLoading || !task) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const platformFee = task.budget * 0.1;
  const workerAmount = task.budget - platformFee;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Secure Payment',
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <Surface style={styles.section} elevation={1}>
          <Text variant="titleLarge" style={styles.title}>Task Payment</Text>
          <Text style={styles.subtitle}>Funds held in escrow until completion</Text>
        </Surface>

        <Surface style={styles.section} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Task Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Task:</Text>
            <Text style={styles.value}>{task.title}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Budget:</Text>
            <Text style={styles.value}>€{task.budget.toFixed(2)}</Text>
          </View>
        </Surface>

        <Surface style={styles.section} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Payment Breakdown</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Total Amount:</Text>
            <Text style={styles.value}>€{task.budget.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Platform Fee (10%):</Text>
            <Text style={styles.valueMuted}>-€{platformFee.toFixed(2)}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Text style={styles.labelBold}>Worker Receives:</Text>
            <Text style={styles.valueBold}>€{workerAmount.toFixed(2)}</Text>
          </View>
        </Surface>

        {clientSecret ? (
          <Surface style={styles.section} elevation={1}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Payment Method</Text>
            <CardField
              postalCodeEnabled={false}
              placeholders={{
                number: '4242 4242 4242 4242',
              }}
              cardStyle={{
                backgroundColor: '#f9fafb',
                textColor: '#000000',
                borderRadius: 8,
              }}
              style={styles.cardField}
              onCardChange={(cardDetails) => {
                setCardComplete(cardDetails.complete);
              }}
            />
            <Text style={styles.hint}>💳 Test card: 4242 4242 4242 4242</Text>
          </Surface>
        ) : (
          <Surface style={styles.section} elevation={1}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Initializing secure payment...</Text>
          </Surface>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Surface style={styles.bottomBar} elevation={4}>
        <Button
          mode="contained"
          onPress={handlePayment}
          disabled={!cardComplete || !clientSecret || createPaymentMutation.isPending}
          loading={createPaymentMutation.isPending}
          style={styles.payButton}
          contentStyle={styles.payButtonContent}
          icon="lock"
        >
          Pay €{task.budget.toFixed(2)}
        </Button>
        <Text style={styles.secureText}>🔒 Secured by Stripe</Text>
      </Surface>
    </SafeAreaView>
  );
}

export default function PaymentScreen() {
  const [publishableKey, setPublishableKey] = useState<string | null>(null);

  // Get Stripe config
  useEffect(() => {
    getStripeConfig().then((config) => {
      setPublishableKey(config.publishable_key);
    });
  }, []);

  if (!publishableKey) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <StripeProvider publishableKey={publishableKey}>
      <PaymentContent />
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  title: {
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 14,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    color: '#6b7280',
    fontSize: 15,
  },
  labelBold: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '700',
  },
  value: {
    color: '#1f2937',
    fontSize: 15,
    fontWeight: '500',
  },
  valueMuted: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '500',
  },
  valueBold: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 12,
  },
  hint: {
    color: '#6b7280',
    fontSize: 13,
    marginTop: 8,
  },
  loadingText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 12,
  },
  bottomSpacer: {
    height: 120,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 16,
    paddingBottom: 32,
  },
  payButton: {
    borderRadius: 12,
    marginBottom: 8,
  },
  payButtonContent: {
    paddingVertical: 8,
  },
  secureText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
  },
});
```

### Step 3: Update Task Detail Screen

In `apps/mobile/app/task/[id].tsx`, add payment buttons. Find the section where action buttons are shown and add:

```tsx
{/* Show Pay button if payment required and not paid */}
{task.payment_required && task.payment_status === 'not_required' && isCreator && (
  <Button
    mode="contained"
    onPress={() => router.push(`/task/${task.id}/payment`)}
    style={styles.actionButton}
    icon="credit-card"
  >
    Pay for Task (€{task.budget})
  </Button>
)}

{/* Show payment status badge */}
{task.payment_required && (
  <Surface style={styles.paymentBadge} elevation={0}>
    <Text style={styles.paymentBadgeText}>
      {task.payment_status === 'held' && '💰 Payment in Escrow'}
      {task.payment_status === 'released' && '✅ Payment Released'}
      {task.payment_status === 'pending' && '⏳ Payment Pending'}
      {task.payment_status === 'refunded' && '💸 Payment Refunded'}
    </Text>
  </Surface>
)}

{/* Release payment button for creator after completion */}
{task.payment_status === 'held' && task.status === 'completed' && isCreator && (
  <Button
    mode="contained"
    onPress={handleReleasePayment}
    style={styles.actionButton}
    buttonColor="#10b981"
    icon="cash"
  >
    Release Payment to Worker
  </Button>
)}
```

Add the handler function:

```typescript
const releasePaymentMutation = useMutation({
  mutationFn: () => releasePayment(taskId),
  onSuccess: () => {
    haptic.success();
    queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    Alert.alert('Success', 'Payment released to worker!');
  },
  onError: (error: any) => {
    Alert.alert('Error', error.response?.data?.error || 'Failed to release payment');
  },
});

const handleReleasePayment = () => {
  Alert.alert(
    'Release Payment',
    'Are you sure you want to release the payment to the worker? This action cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Release', onPress: () => releasePaymentMutation.mutate() },
    ]
  );
};
```

Add these imports at the top:

```typescript
import { releasePayment } from '@marketplace/shared';
```

Add styles:

```typescript
paymentBadge: {
  backgroundColor: '#fef3c7',
  padding: 12,
  borderRadius: 8,
  marginVertical: 8,
},
paymentBadgeText: {
  color: '#92400e',
  fontSize: 14,
  fontWeight: '600',
  textAlign: 'center',
},
```

## Testing

### Test Flow:

1. **Create Task with Payment**
   - Toggle "Require Payment" ON
   - Set budget (e.g., €50)
   - Submit task

2. **Pay for Task**
   - Click "Pay for Task" button
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date, any CVC
   - Submit payment

3. **Worker Completes Task**
   - Worker accepts and marks as done

4. **Release Payment**
   - Creator confirms completion
   - Creator clicks "Release Payment to Worker"
   - Worker receives €45 (50 minus 10% platform fee)

### Stripe Test Cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

## Status Flow:

```
payment_required: true
payment_status: null → pending → held → released
                                  └─→ refunded
```

## Environment Setup

### Backend (Already Done):
- `STRIPE_SECRET_KEY`=sk_test_...
- `STRIPE_PUBLISHABLE_KEY`=pk_test_...
- `STRIPE_WEBHOOK_SECRET`=whsec_...
- `PLATFORM_FEE_PERCENT`=10.0

### Frontend:
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`=pk_test_...

## Notes:

- Payments are held in Stripe escrow until task completion
- Platform takes 10% fee on release
- Only task creator can initiate payment
- Only task creator can release payment after completion
- Admin can refund payments if disputes arise
- All payment processing is PCI compliant via Stripe

## Done!

The Stripe escrow payment system is now fully implemented! Test it with the flow above.
