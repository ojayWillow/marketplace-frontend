/**
 * Task Progress Steps - Defines the step-by-step flow for tasks
 * 
 * Two perspectives:
 * 1. Creator (job poster) - Sees the hiring and completion flow
 * 2. Worker (helper) - Sees the application and work flow
 */

import type { Task, TaskApplication } from '@marketplace/shared';

export type StepStatus = 'completed' | 'current' | 'upcoming' | 'waiting';

export interface TaskStep {
  id: string;
  number: number;
  titleKey: string;       // i18n key for step title
  descriptionKey: string; // i18n key for step description
  status: StepStatus;
  icon: string;           // Emoji icon for the step
  actionKey?: string;     // i18n key for action button (if any)
}

export type UserRole = 'creator' | 'worker' | 'applicant' | 'visitor';

/**
 * Determine the user's role in relation to a task
 */
export function getUserRole(
  task: Task,
  userId: number | undefined
): UserRole {
  if (!userId) return 'visitor';
  if (task.creator_id === userId) return 'creator';
  if (task.assigned_to_id === userId) return 'worker';
  if (task.has_applied) return 'applicant';
  return 'visitor';
}

/**
 * Get the current step index based on task status and user role
 */
function getCurrentStepIndex(
  task: Task,
  role: UserRole,
  application?: TaskApplication | null
): number {
  const status = task.status;

  if (role === 'creator') {
    // Creator flow: Posted → Reviewing → Assigned → In Progress → Awaiting Review → Completed
    switch (status) {
      case 'open':
        return task.pending_applications_count && task.pending_applications_count > 0 ? 1 : 0;
      case 'assigned':
        return 2;
      case 'in_progress':
        return 3;
      case 'pending_confirmation':
        return 4;
      case 'completed':
        return 5;
      case 'cancelled':
      case 'disputed':
        return -1; // Special case
      default:
        return 0;
    }
  }

  if (role === 'worker') {
    // Worker flow: Accepted → Working → Marked Done → Awaiting Confirm → Completed
    switch (status) {
      case 'assigned':
        return 0;
      case 'in_progress':
        return 1;
      case 'pending_confirmation':
        return 2;
      case 'completed':
        return 3;
      case 'disputed':
        return -1;
      default:
        return 0;
    }
  }

  if (role === 'applicant') {
    // Applicant flow: Applied → Waiting
    const appStatus = application?.status;
    if (appStatus === 'pending') return 0;
    if (appStatus === 'rejected') return -1;
    return 0;
  }

  return -1; // Visitor
}

/**
 * Generate steps for the task Creator (job poster)
 */
export function getCreatorSteps(task: Task): TaskStep[] {
  const currentIndex = getCurrentStepIndex(task, 'creator');
  const applicantCount = task.pending_applications_count || 0;

  const steps: TaskStep[] = [
    {
      id: 'posted',
      number: 1,
      titleKey: 'tasks:steps.creator.posted.title',
      descriptionKey: 'tasks:steps.creator.posted.description',
      status: 'completed',
      icon: '📝',
    },
    {
      id: 'reviewing',
      number: 2,
      titleKey: 'tasks:steps.creator.reviewing.title',
      descriptionKey: applicantCount > 0 
        ? 'tasks:steps.creator.reviewing.descriptionWithCount'
        : 'tasks:steps.creator.reviewing.descriptionEmpty',
      status: currentIndex >= 1 ? (currentIndex === 1 ? 'current' : 'completed') : 'upcoming',
      icon: applicantCount > 0 ? '👥' : '⏳',
      actionKey: applicantCount > 0 ? 'tasks:steps.creator.reviewing.action' : undefined,
    },
    {
      id: 'assigned',
      number: 3,
      titleKey: 'tasks:steps.creator.assigned.title',
      descriptionKey: 'tasks:steps.creator.assigned.description',
      status: currentIndex >= 2 ? (currentIndex === 2 ? 'current' : 'completed') : 'upcoming',
      icon: '🤝',
    },
    {
      id: 'inProgress',
      number: 4,
      titleKey: 'tasks:steps.creator.inProgress.title',
      descriptionKey: 'tasks:steps.creator.inProgress.description',
      status: currentIndex >= 3 ? (currentIndex === 3 ? 'waiting' : 'completed') : 'upcoming',
      icon: '🔨',
    },
    {
      id: 'awaitingReview',
      number: 5,
      titleKey: 'tasks:steps.creator.awaitingReview.title',
      descriptionKey: 'tasks:steps.creator.awaitingReview.description',
      status: currentIndex >= 4 ? (currentIndex === 4 ? 'current' : 'completed') : 'upcoming',
      icon: '🔔',
      actionKey: currentIndex === 4 ? 'tasks:steps.creator.awaitingReview.action' : undefined,
    },
    {
      id: 'completed',
      number: 6,
      titleKey: 'tasks:steps.creator.completed.title',
      descriptionKey: 'tasks:steps.creator.completed.description',
      status: currentIndex >= 5 ? 'completed' : 'upcoming',
      icon: '✅',
      actionKey: currentIndex === 5 ? 'tasks:steps.creator.completed.action' : undefined,
    },
  ];

  return steps;
}

/**
 * Generate steps for the assigned Worker (helper)
 */
export function getWorkerSteps(task: Task): TaskStep[] {
  const currentIndex = getCurrentStepIndex(task, 'worker');

  const steps: TaskStep[] = [
    {
      id: 'accepted',
      number: 1,
      titleKey: 'tasks:steps.worker.accepted.title',
      descriptionKey: 'tasks:steps.worker.accepted.description',
      status: 'completed',
      icon: '🎉',
    },
    {
      id: 'working',
      number: 2,
      titleKey: 'tasks:steps.worker.working.title',
      descriptionKey: 'tasks:steps.worker.working.description',
      status: currentIndex >= 1 ? (currentIndex === 1 ? 'current' : 'completed') : 'upcoming',
      icon: '💪',
      actionKey: currentIndex === 1 ? 'tasks:steps.worker.working.action' : undefined,
    },
    {
      id: 'markedDone',
      number: 3,
      titleKey: 'tasks:steps.worker.markedDone.title',
      descriptionKey: 'tasks:steps.worker.markedDone.description',
      status: currentIndex >= 2 ? (currentIndex === 2 ? 'waiting' : 'completed') : 'upcoming',
      icon: '⏳',
    },
    {
      id: 'completed',
      number: 4,
      titleKey: 'tasks:steps.worker.completed.title',
      descriptionKey: 'tasks:steps.worker.completed.description',
      status: currentIndex >= 3 ? 'completed' : 'upcoming',
      icon: '🏆',
      actionKey: currentIndex === 3 ? 'tasks:steps.worker.completed.action' : undefined,
    },
  ];

  return steps;
}

/**
 * Generate steps for an Applicant (pending application)
 */
export function getApplicantSteps(task: Task, application?: TaskApplication | null): TaskStep[] {
  const appStatus = application?.status;

  const steps: TaskStep[] = [
    {
      id: 'applied',
      number: 1,
      titleKey: 'tasks:steps.applicant.applied.title',
      descriptionKey: 'tasks:steps.applicant.applied.description',
      status: 'completed',
      icon: '📨',
    },
    {
      id: 'waiting',
      number: 2,
      titleKey: 'tasks:steps.applicant.waiting.title',
      descriptionKey: 'tasks:steps.applicant.waiting.description',
      status: appStatus === 'pending' ? 'waiting' : 'completed',
      icon: '⏳',
      actionKey: 'tasks:steps.applicant.waiting.action',
    },
  ];

  return steps;
}

/**
 * Get the appropriate steps based on user role
 */
export function getTaskSteps(
  task: Task,
  userId: number | undefined
): { role: UserRole; steps: TaskStep[] } | null {
  const role = getUserRole(task, userId);

  // Handle cancelled/disputed states
  if (task.status === 'cancelled' || task.status === 'disputed') {
    return null; // Don't show steps for these states
  }

  switch (role) {
    case 'creator':
      return { role, steps: getCreatorSteps(task) };
    case 'worker':
      return { role, steps: getWorkerSteps(task) };
    case 'applicant':
      return { role, steps: getApplicantSteps(task, task.user_application) };
    default:
      return null; // Visitors don't see progress steps
  }
}

/**
 * Get the current active step for quick reference
 */
export function getCurrentStep(steps: TaskStep[]): TaskStep | undefined {
  return steps.find(s => s.status === 'current' || s.status === 'waiting');
}

/**
 * Check if user has pending action
 */
export function hasPendingAction(steps: TaskStep[]): boolean {
  const current = getCurrentStep(steps);
  return current?.status === 'current' && !!current.actionKey;
}
