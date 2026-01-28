import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import type { Task } from '@marketplace/shared';
import { useAuthStore } from '@marketplace/shared';
import { getTaskSteps, getCurrentStep, type TaskStep, type StepStatus } from '../../utils/taskSteps';

interface TaskProgressStepperProps {
  task: Task;
  onActionPress?: (stepId: string) => void;
}

// Role labels (avoiding useTranslation hook issue)
const ROLE_LABELS: Record<string, string> = {
  creator: 'YOUR JOB PROGRESS',
  worker: 'YOUR WORK PROGRESS', 
  applicant: 'YOUR APPLICATION',
};

// Step labels
const STEP_LABELS: Record<string, { title: string; description: string }> = {
  // Creator steps
  'creator_posted': { title: 'Job Posted', description: 'Your job is visible to helpers' },
  'creator_reviewing': { title: 'Review Applicants', description: 'Check applications and choose a helper' },
  'creator_assigned': { title: 'Helper Assigned', description: 'Someone is working on your job' },
  'creator_in_progress': { title: 'Work in Progress', description: 'Wait for the helper to complete the work' },
  'creator_pending_review': { title: 'Review Required', description: 'Confirm the work is done satisfactorily' },
  'creator_completed': { title: 'Job Completed', description: 'Payment released to helper' },
  // Worker steps
  'worker_accepted': { title: 'Job Accepted', description: 'You are assigned to this job' },
  'worker_in_progress': { title: 'Do the Work', description: 'Complete the job as described' },
  'worker_pending_confirmation': { title: 'Awaiting Confirmation', description: 'Waiting for the poster to confirm' },
  'worker_completed': { title: 'Job Completed', description: 'Payment received!' },
  // Applicant steps
  'applicant_applied': { title: 'Application Sent', description: 'Your application is pending review' },
  'applicant_waiting': { title: 'Waiting for Response', description: 'The poster will review your application' },
  'applicant_decision': { title: 'Decision Pending', description: 'You will be notified of the outcome' },
};

// Action prompts
const ACTION_PROMPTS: Record<string, string> = {
  'tasks:steps.actions.review_applicants': 'Review applicants and assign someone',
  'tasks:steps.actions.confirm_completion': 'Review the work and confirm completion',
  'tasks:steps.actions.mark_complete': 'Mark as complete when done',
  'tasks:steps.actions.wait_for_decision': 'Waiting for poster to decide',
};

/**
 * Visual progress stepper showing task workflow status
 * Adapts based on user role (Creator, Worker, or Applicant)
 */
export const TaskProgressStepper = ({ task, onActionPress }: TaskProgressStepperProps) => {
  const { user } = useAuthStore();
  
  const result = getTaskSteps(task, user?.id);
  
  // Don't render if no steps (visitor or cancelled/disputed task)
  if (!result) return null;
  
  const { role, steps } = result;
  const currentStep = getCurrentStep(steps);

  return (
    <View style={styles.container}>
      {/* Role indicator */}
      <View style={styles.roleHeader}>
        <Text style={styles.roleText}>
          {role === 'creator' && '💼'}
          {role === 'worker' && '🛠️'}
          {role === 'applicant' && '📩'}
          {' '}
          {ROLE_LABELS[role] || 'PROGRESS'}
        </Text>
      </View>

      {/* Steps */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <StepItem
            key={step.id}
            step={step}
            isLast={index === steps.length - 1}
            onActionPress={onActionPress}
          />
        ))}
      </View>

      {/* Current action prompt */}
      {currentStep?.actionKey && currentStep.status === 'current' && (
        <View style={styles.actionPrompt}>
          <Text style={styles.actionPromptText}>
            👉 {ACTION_PROMPTS[currentStep.actionKey] || 'Take action'}
          </Text>
        </View>
      )}
    </View>
  );
};

/**
 * Individual step item component
 */
interface StepItemProps {
  step: TaskStep;
  isLast: boolean;
  onActionPress?: (stepId: string) => void;
}

const StepItem = ({ step, isLast }: StepItemProps) => {
  const statusStyles = getStatusStyles(step.status);
  const labels = STEP_LABELS[step.id] || { title: step.titleKey, description: step.descriptionKey };

  return (
    <View style={styles.stepRow}>
      {/* Step indicator column */}
      <View style={styles.indicatorColumn}>
        {/* Circle with icon/number */}
        <View style={[styles.stepCircle, statusStyles.circle]}>
          {step.status === 'completed' ? (
            <Text style={styles.checkmark}>✓</Text>
          ) : step.status === 'waiting' ? (
            <Text style={styles.stepIcon}>⏳</Text>
          ) : (
            <Text style={[styles.stepIcon, statusStyles.icon]}>{step.icon}</Text>
          )}
        </View>
        
        {/* Connector line */}
        {!isLast && (
          <View style={[styles.connector, statusStyles.connector]} />
        )}
      </View>

      {/* Content column */}
      <View style={styles.contentColumn}>
        <View style={styles.stepHeader}>
          <Text style={[styles.stepTitle, statusStyles.title]}>
            {labels.title}
          </Text>
          {step.status === 'current' && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>← Now</Text>
            </View>
          )}
          {step.status === 'waiting' && (
            <View style={styles.waitingBadge}>
              <Text style={styles.waitingBadgeText}>Waiting</Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.stepDescription, statusStyles.description]}>
          {labels.description}
        </Text>
      </View>
    </View>
  );
};

/**
 * Get styles based on step status
 */
function getStatusStyles(status: StepStatus) {
  switch (status) {
    case 'completed':
      return {
        circle: styles.circleCompleted,
        connector: styles.connectorCompleted,
        icon: styles.iconCompleted,
        title: styles.titleCompleted,
        description: styles.descriptionCompleted,
      };
    case 'current':
      return {
        circle: styles.circleCurrent,
        connector: styles.connectorUpcoming,
        icon: styles.iconCurrent,
        title: styles.titleCurrent,
        description: styles.descriptionCurrent,
      };
    case 'waiting':
      return {
        circle: styles.circleWaiting,
        connector: styles.connectorUpcoming,
        icon: styles.iconWaiting,
        title: styles.titleWaiting,
        description: styles.descriptionWaiting,
      };
    case 'upcoming':
    default:
      return {
        circle: styles.circleUpcoming,
        connector: styles.connectorUpcoming,
        icon: styles.iconUpcoming,
        title: styles.titleUpcoming,
        description: styles.descriptionUpcoming,
      };
  }
}

const ACCENT_COLOR = '#3B82F6';
const SUCCESS_COLOR = '#10b981';
const WARNING_COLOR = '#f59e0b';
const MUTED_COLOR = '#9ca3af';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Role header
  roleHeader: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: MUTED_COLOR,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Steps container
  stepsContainer: {
    paddingLeft: 4,
  },
  
  // Step row
  stepRow: {
    flexDirection: 'row',
    minHeight: 60,
  },
  
  // Indicator column (circle + connector)
  indicatorColumn: {
    width: 32,
    alignItems: 'center',
  },
  
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  
  // Circle status variants
  circleCompleted: {
    backgroundColor: SUCCESS_COLOR,
    borderColor: SUCCESS_COLOR,
  },
  circleCurrent: {
    backgroundColor: '#ffffff',
    borderColor: ACCENT_COLOR,
    borderWidth: 3,
  },
  circleWaiting: {
    backgroundColor: '#fef3c7',
    borderColor: WARNING_COLOR,
  },
  circleUpcoming: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  
  stepIcon: {
    fontSize: 12,
  },
  iconCompleted: {
    opacity: 0,
  },
  iconCurrent: {
    fontSize: 14,
  },
  iconWaiting: {
    fontSize: 12,
  },
  iconUpcoming: {
    opacity: 0.5,
  },
  
  // Connector line
  connector: {
    flex: 1,
    width: 2,
    marginVertical: 4,
    minHeight: 20,
  },
  connectorCompleted: {
    backgroundColor: SUCCESS_COLOR,
  },
  connectorUpcoming: {
    backgroundColor: '#e5e7eb',
  },
  
  // Content column
  contentColumn: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  titleCompleted: {
    color: SUCCESS_COLOR,
  },
  titleCurrent: {
    color: '#111827',
  },
  titleWaiting: {
    color: WARNING_COLOR,
  },
  titleUpcoming: {
    color: MUTED_COLOR,
  },
  
  stepDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  descriptionCompleted: {
    color: '#6b7280',
  },
  descriptionCurrent: {
    color: '#374151',
  },
  descriptionWaiting: {
    color: '#92400e',
  },
  descriptionUpcoming: {
    color: '#9ca3af',
  },
  
  // Badges
  currentBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: ACCENT_COLOR,
  },
  waitingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  waitingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: WARNING_COLOR,
  },
  
  // Action prompt
  actionPrompt: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT_COLOR,
  },
  actionPromptText: {
    fontSize: 13,
    fontWeight: '600',
    color: ACCENT_COLOR,
  },
});
