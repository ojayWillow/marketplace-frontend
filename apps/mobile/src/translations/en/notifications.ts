export const notifications = {
  title: 'Notifications',
  noNotifications: 'No notifications',
  markAllRead: 'Mark All as Read',
  clearAll: 'Clear All',
  
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
