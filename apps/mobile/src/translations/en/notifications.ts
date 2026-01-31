export const notifications = {
  title: 'Notifications',
  noNotifications: 'No Notifications',
  allCaughtUp: "You're all caught up!",
  markAllRead: 'Mark All Read',
  clearAll: 'Clear All',
  
  // Alerts
  deleteTitle: 'Delete Notification',
  deleteMessage: 'Are you sure you want to delete this notification?',
  markAllSuccess: 'All notifications marked as read',
  noUnread: 'No Unread',
  noUnreadMessage: 'You have no unread notifications',
  
  // Time ago
  timeAgo: {
    justNow: 'Just now',
    minutesAgo: 'm ago',
    hoursAgo: 'h ago',
    daysAgo: 'd ago',
    weeksAgo: 'w ago',
  },
  
  // Notification content by type (for i18n)
  content: {
    application_accepted: {
      title: '🎉 Application Accepted!',
      message: 'Congratulations! Your application for "{taskTitle}" has been accepted. You can now start working on this task.',
    },
    application_rejected: {
      title: 'Application Update',
      message: 'Your application for "{taskTitle}" was not selected. Keep applying to other tasks!',
    },
    new_application: {
      title: 'New Application Received',
      message: '{applicantName} applied for your task "{taskTitle}".',
    },
    task_marked_done: {
      title: 'Task Marked as Done',
      message: '{workerName} has marked "{taskTitle}" as complete. Please review and confirm.',
    },
    task_completed: {
      title: '✅ Task Completed!',
      message: 'Great job! "{taskTitle}" has been confirmed as complete.',
    },
    task_disputed: {
      title: '⚠️ Task Disputed',
      message: 'A dispute has been raised for "{taskTitle}". Our team will review it shortly.',
    },
  },
  
  // Settings screen
  settings: {
    title: 'Notifications',
    signInRequired: {
      title: 'Sign In Required',
      message: 'Please sign in to manage your notification preferences',
    },
    channels: {
      title: 'Notification Channels',
      push: {
        label: 'Push Notifications',
        description: 'Receive alerts on your device',
      },
      email: {
        label: 'Email Notifications',
        description: 'Receive updates via email',
      },
    },
    types: {
      title: 'Notification Types',
      newMessages: {
        label: 'New Messages',
        description: 'When someone sends you a message',
      },
      taskApplications: {
        label: 'Task Applications',
        description: 'When someone applies to your task',
      },
      taskUpdates: {
        label: 'Task Updates',
        description: 'Status changes on your tasks',
      },
      promotions: {
        label: 'Promotions & Tips',
        description: 'Special offers and app tips',
      },
    },
    test: {
      button: 'Send Test Notification',
      success: {
        title: 'Test Sent!',
        message: 'Check your notifications in a few seconds',
      },
      error: {
        title: 'Error',
        message: 'Failed to send test notification',
        notLoggedIn: 'You must be logged in to test notifications',
        pushDisabled: 'Please enable push notifications first',
      },
    },
    alerts: {
      permissionRequired: {
        title: 'Permission Required',
        message: 'Please enable notifications in your device settings to receive push notifications.',
      },
      enabled: {
        title: 'Success',
        message: 'Push notifications enabled!',
      },
      disabled: 'Push notifications disabled',
      saveFailed: {
        title: 'Error',
        message: 'Failed to save settings',
      },
    },
    warning: {
      allDisabled: 'All notifications are disabled. You won\'t receive any alerts.',
    },
    footer: 'Changes are saved automatically.',
  },
};
