export const task = {
  // Task Detail Actions
  applyNow: 'Apply Now',
  withdrawApplication: 'Withdraw Application',
  viewApplications: 'View Applications',
  cancel: 'Cancel',
  edit: 'Edit',
  dispute: 'Dispute',
  confirmDone: 'Confirm Done',
  markAsDone: 'Mark as Done',
  reportIssue: 'Report Issue',
  
  // Task Detail Info
  applicants: 'APPLICANTS',
  difficulty: 'DIFFICULTY',
  posted: 'POSTED',
  distance: 'DISTANCE',
  description: 'Description',
  location: 'Location',
  openInMaps: 'Open in Maps',
  viewAndApply: 'View and apply',
  
  // Time formatting
  time: {
    justNow: 'Just now',
    minutesAgo: '{{count}}m ago',
    hoursAgo: '{{count}}h ago',
    daysAgo: '{{count}}d ago',
  },
  
  // Notices
  notices: {
    youHaveApplied: 'You have applied for this task',
    workerMarkedDone: '{{name}} marked this as done. Please review and confirm.',
  },
  
  // Status messages
  taskNotFound: 'Task not found',
  goBack: 'Go Back',

  // Alert dialogs
  alerts: {
    // Apply
    applyTitle: 'Apply',
    applyMessage: 'Apply for this task?',
    applyButton: 'Apply',
    signInRequired: 'Sign In Required',
    signInToApply: 'You need to sign in to apply.',
    signInButton: 'Sign In',
    applySuccess: 'Success',
    applySuccessMessage: 'Your application has been submitted!',
    
    // Withdraw
    withdrawTitle: 'Withdraw',
    withdrawMessage: 'Withdraw your application?',
    withdrawButton: 'Withdraw',
    withdrawSuccess: 'Success',
    withdrawSuccessMessage: 'Application withdrawn',
    
    // Mark done
    markDoneTitle: 'Mark Done',
    markDoneMessage: 'Mark this task as completed?',
    markDoneButton: 'Mark Done',
    markDoneSuccess: 'Success',
    markDoneSuccessMessage: 'Task marked as done!',
    
    // Confirm completion
    confirmTitle: 'Confirm',
    confirmMessage: 'Confirm task completion?',
    confirmButton: 'Confirm',
    
    // Cancel task
    cancelTitle: 'Cancel Task',
    cancelMessage: 'Cancel this task?',
    cancelYes: 'Yes',
    cancelNo: 'No',
    cancelSuccess: 'Cancelled',
    cancelSuccessMessage: 'Task has been cancelled.',
    
    // Report
    reportTitle: 'Report',
    reportMessage: 'Report this task?',
    reportButton: 'Report',
    reportedTitle: 'Reported',
    reportedMessage: 'Thanks.',
    
    // Message
    signInToMessage: 'You need to sign in to message.',
    
    // Common
    error: 'Error',
    cancelButton: 'Cancel',
  },
  
  // Task Create Form
  create: {
    title: 'Create Task',
    cancel: 'Cancel',
    
    // Form fields
    taskTitleLabel: 'Task Title',
    taskTitlePlaceholder: 'What needs to be done?',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Describe the task in detail...',
    photosLabel: 'Photos',
    categoryLabel: 'Category',
    selectCategory: 'Select Category',
    budgetLabel: 'Budget',
    budgetPlaceholder: '50',
    difficultyLabel: 'Difficulty',
    difficultyHint: 'How complex is this task?',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    locationLabel: 'Location',
    deadlineLabel: 'Deadline',
    selectDeadline: 'Select Deadline',
    clearDeadline: 'Clear',
    markAsUrgent: 'Mark as Urgent',
    urgentHint: 'Priority placement',
    
    // Buttons
    createButton: 'Create Task',
    uploadingImages: 'Uploading images...',
    
    // Auth messages
    signInRequired: 'Sign In Required',
    signInText: 'You need to be signed in to create a task',
    signInButton: 'Sign In',
    
    // Success messages
    successTitle: 'Success!',
    successMessage: 'Your task has been created',
    viewTask: 'View Task',
    
    // Error messages
    errorTitle: 'Error',
    errorCreateFailed: 'Failed to create task',
    errorRequired: 'Required',
    errorTitleRequired: 'Please enter a task title',
    errorDescriptionRequired: 'Please enter a description',
    errorBudgetRequired: 'Please enter a valid budget',
    errorLocationRequired: 'Please select a location',
    errorUserNotFound: 'User not found',
  },
};
