export const notifications = {
  title: 'Уведомления',
  noNotifications: 'Нет уведомлений',
  allCaughtUp: 'Всё просмотрено!',
  markAllRead: 'Отметить все',
  clearAll: 'Очистить все',
  
  // Alerts
  deleteTitle: 'Удалить уведомление',
  deleteMessage: 'Вы уверены, что хотите удалить это уведомление?',
  markAllSuccess: 'Все уведомления отмечены как прочитанные',
  noUnread: 'Нет непрочитанных',
  noUnreadMessage: 'У вас нет непрочитанных уведомлений',
  
  // Time ago
  timeAgo: {
    justNow: 'Только что',
    minutesAgo: 'м назад',
    hoursAgo: 'ч назад',
    daysAgo: 'д назад',
    weeksAgo: 'н назад',
  },
  
  // Settings screen (keeping existing settings)
  settings: {
    title: 'Уведомления',
    signInRequired: {
      title: 'Требуется вход',
      message: 'Войдите, чтобы управлять настройками уведомлений',
    },
    channels: {
      title: 'Каналы уведомлений',
      push: {
        label: 'Push-уведомления',
        description: 'Получайте оповещения на ваше устройство',
      },
      email: {
        label: 'Уведомления по электронной почте',
        description: 'Получайте обновления по электронной почте',
      },
    },
    types: {
      title: 'Типы уведомлений',
      newMessages: {
        label: 'Новые сообщения',
        description: 'Когда кто-то отправляет вам сообщение',
      },
      taskApplications: {
        label: 'Заявки на задания',
        description: 'Когда кто-то откликается на ваше задание',
      },
      taskUpdates: {
        label: 'Обновления заданий',
        description: 'Изменения статуса ваших заданий',
      },
      promotions: {
        label: 'Акции и советы',
        description: 'Специальные предложения и подсказки',
      },
    },
    test: {
      button: 'Отправить тестовое уведомление',
      success: {
        title: 'Отправлено!',
        message: 'Проверьте уведомления через несколько секунд',
      },
      error: {
        title: 'Ошибка',
        message: 'Не удалось отправить тестовое уведомление',
        notLoggedIn: 'Вы должны войти, чтобы тестировать уведомления',
        pushDisabled: 'Сначала включите push-уведомления',
      },
    },
    alerts: {
      permissionRequired: {
        title: 'Требуется разрешение',
        message: 'Включите уведомления в настройках устройства.',
      },
      enabled: {
        title: 'Успех',
        message: 'Push-уведомления включены!',
      },
      disabled: 'Push-уведомления отключены',
      saveFailed: {
        title: 'Ошибка',
        message: 'Не удалось сохранить настройки',
      },
    },
    warning: {
      allDisabled: 'Все уведомления отключены. Вы не будете получать оповещения.',
    },
    footer: 'Изменения сохраняются автоматически.',
  },
};
