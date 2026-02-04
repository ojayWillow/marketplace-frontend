export const tasks = {
  title: 'Tasks',
  myTasks: 'My Tasks',
  createTask: 'Create Task',
  noTasks: 'No tasks yet',
  statusOpen: 'Open',
  statusInProgress: 'In Progress',
  statusCompleted: 'Completed',
  statusCancelled: 'Cancelled',
  noFilterMatch: 'No items match your filters',
  noJobsFilter: 'No jobs match your filters',
  noServicesCategory: 'No services in this category',
  noTasksEmpty: 'No tasks available',
  noJobs: 'No jobs available',
  noServices: 'No services available',
  tryDifferentFilters: 'Try different filters',
  checkBackLater: 'Check back later for new items',
  // Tabs
  tabAll: 'All',
  tabJobs: 'Jobs',
  tabServices: 'Services',
  
  // Status badge labels (for TaskCard bubbles)
  status: {
    open: 'Open',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    pending_confirmation: 'Awaiting Confirmation',
    completed: 'Completed',
    disputed: 'Disputed',
    cancelled: 'Cancelled',
  },

  // Action labels for status badges
  actionNeeded: 'Action needed',
  waiting: 'Waiting',
  applied: 'Applied',
  applicantLabel: 'applicant',
  applicantsLabel: 'applicants',

  // Time ago labels
  time: {
    justNow: 'Just now',
    minutesAgo: '{{count}}m ago',
    hoursAgo: '{{count}}h ago',
    daysAgo: '{{count}}d ago',
  },
  
  // Filters
  filters: {
    title: 'Filters',
    difficultyLabel: 'DIFFICULTY',
    categoryLabel: 'CATEGORIES',
    all: 'All',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    clearAll: 'Clear All',
    apply: 'Apply',
  },

  // Difficulty labels
  difficulty: {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  },

  // Progress Stepper
  progress: {
    // Role headers
    roles: {
      creator: 'YOUR JOB PROGRESS',
      worker: 'YOUR WORK PROGRESS',
      applicant: 'YOUR APPLICATION',
      default: 'PROGRESS',
    },

    // Step labels - Creator
    creatorPosted: {
      title: 'Job Posted',
      description: 'Your job is visible to helpers',
    },
    creatorReviewing: {
      title: 'Review Applicants',
      description: 'Check applications and choose a helper',
    },
    creatorAssigned: {
      title: 'Helper Assigned',
      description: 'Someone is working on your job',
    },
    creatorInProgress: {
      title: 'Work in Progress',
      description: 'Wait for the helper to complete the work',
    },
    creatorPendingReview: {
      title: 'Review Required',
      description: 'Confirm the work is done satisfactorily',
    },
    creatorCompleted: {
      title: 'Job Completed',
      description: 'Payment released to helper',
    },

    // Step labels - Worker
    workerAccepted: {
      title: 'Job Accepted',
      description: 'You are assigned to this job',
    },
    workerInProgress: {
      title: 'Do the Work',
      description: 'Complete the job as described',
    },
    workerPendingConfirmation: {
      title: 'Awaiting Confirmation',
      description: 'Waiting for the poster to confirm',
    },
    workerCompleted: {
      title: 'Job Completed',
      description: 'Payment received!',
    },

    // Step labels - Applicant
    applicantApplied: {
      title: 'Application Sent',
      description: 'Your application is pending review',
    },
    applicantWaiting: {
      title: 'Waiting for Response',
      description: 'The poster will review your application',
    },
    applicantDecision: {
      title: 'Decision Pending',
      description: 'You will be notified of the outcome',
    },

    // Action prompts
    actions: {
      reviewApplicants: 'Review applicants and assign someone',
      confirmCompletion: 'Review the work and confirm completion',
      markComplete: 'Mark as complete when done',
      waitForDecision: 'Waiting for poster to decide',
      takeAction: 'Take action',
    },

    // Badges
    badges: {
      now: 'Now',
      waiting: 'Waiting',
    },
  },
};
