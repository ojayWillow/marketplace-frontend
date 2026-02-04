export const dispute = {
  // Basic
  title: 'Спор',
  createDispute: 'Создать спор',
  reason: 'Причина',
  description: 'Описание',
  submit: 'Отправить',
  cancel: 'Отмена',

  // Status labels
  status: {
    open: 'Открыт',
    underReview: 'На рассмотрении',
    resolved: 'Решено',
  },

  // Reason labels
  reasons: {
    workNotCompleted: 'Работа не завершена',
    poorQuality: 'Низкое качество работы',
    taskChanged: 'Требования задачи изменились',
    paymentIssue: 'Проблема с оплатой',
    safetyConcern: 'Вопросы безопасности',
    communication: 'Проблема с коммуникацией',
    other: 'Другое',
  },

  // Info section
  info: {
    disputeStatus: 'Статус спора',
    filedBy: 'Подал:',
    you: 'Вы',
    theOtherParty: 'Другая сторона',
    reason: 'Причина:',
    theirComplaint: 'Их жалоба:',
    responseSubmitted: 'Ответ отправлен:',
  },

  // Response form
  responseForm: {
    title: 'Ваш ответ',
    subtitle: 'Объясните свою версию. Будьте конкретны и объективны.',
    placeholder: 'Опишите, что произошло с вашей точки зрения...',
    characterCount: '/ 20 минимальное количество символов',
    submitButton: 'Отправить ответ',
    cancelButton: 'Отмена',
  },

  // Notices
  notices: {
    respondNotice: 'Против вас подан спор. Пожалуйста, ответьте своей версией событий.',
    respondButton: 'Ответить на спор',
    waitingNotice: 'Ожидаем ответа другой стороны на ваш спор.',
    underReviewNotice: 'Обе стороны предоставили свои версии. Служба поддержки рассматривает этот спор и скоро свяжется с вами.',
  },

  // Alerts
  alerts: {
    responseSubmittedTitle: 'Ответ отправлен',
    responseSubmittedMessage: 'Ваш ответ отправлен. Спор теперь рассматривается нашей службой поддержки.',
    ok: 'OK',
    error: 'Ошибка',
    errorSubmit: 'Не удалось отправить ответ. Попробуйте еще раз.',
    errorMinLength: 'Пожалуйста, дайте подробный ответ (минимум 20 символов).',
  },
};
