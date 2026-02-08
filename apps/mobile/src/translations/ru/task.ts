export const task = {
  // Task Detail Actions
  applyNow: 'Подать заявку',
  withdrawApplication: 'Отозвать заявку',
  viewApplications: 'Просмотреть заявки',
  cancel: 'Отменить',
  edit: 'Редактировать',
  dispute: 'Спор',
  confirmDone: 'Подтвердить выполнение',
  markAsDone: 'Отметить как выполнено',
  reportIssue: 'Сообщить о проблеме',
  
  // Task Detail Info
  applicants: 'ЗАЯВКИ',
  difficulty: 'СЛОЖНОСТЬ',
  posted: 'ОПУБЛИКОВАНО',
  distance: 'РАССТОЯНИЕ',
  description: 'Описание',
  location: 'Местоположение',
  openInMaps: 'Открыть на карте',
  viewAndApply: 'Смотреть и подать',
  
  // Time formatting
  time: {
    justNow: 'Только что',
    minutesAgo: '{{count}}мин назад',
    hoursAgo: '{{count}}ч назад',
    daysAgo: '{{count}}д назад',
  },
  
  // Notices
  notices: {
    youHaveApplied: 'Вы подали заявку на эту задачу',
    workerMarkedDone: '{{name}} отметил как выполненное. Пожалуйста, проверьте и подтвердите.',
  },
  
  // Status messages
  taskNotFound: 'Задача не найдена',
  goBack: 'Назад',

  // Alert dialogs
  alerts: {
    // Apply
    applyTitle: 'Подать заявку',
    applyMessage: 'Подать заявку на эту задачу?',
    applyButton: 'Подать',
    signInRequired: 'Требуется вход',
    signInToApply: 'Вам нужно войти, чтобы подать заявку.',
    signInButton: 'Войти',
    applySuccess: 'Успешно',
    applySuccessMessage: 'Ваша заявка отправлена!',
    
    // Withdraw
    withdrawTitle: 'Отозвать',
    withdrawMessage: 'Отозвать вашу заявку?',
    withdrawButton: 'Отозвать',
    withdrawSuccess: 'Успешно',
    withdrawSuccessMessage: 'Заявка отозвана',
    
    // Mark done
    markDoneTitle: 'Отметить выполненным',
    markDoneMessage: 'Отметить эту задачу как выполненную?',
    markDoneButton: 'Отметить',
    markDoneSuccess: 'Успешно',
    markDoneSuccessMessage: 'Задача отмечена как выполненная!',
    
    // Confirm completion
    confirmTitle: 'Подтвердить',
    confirmMessage: 'Подтвердить выполнение задачи?',
    confirmButton: 'Подтвердить',
    
    // Cancel task
    cancelTitle: 'Отменить задачу',
    cancelMessage: 'Отменить эту задачу?',
    cancelYes: 'Да',
    cancelNo: 'Нет',
    cancelSuccess: 'Отменено',
    cancelSuccessMessage: 'Задача отменена.',
    
    // Report
    reportTitle: 'Пожаловаться',
    reportMessage: 'Пожаловаться на эту задачу?',
    reportButton: 'Пожаловаться',
    reportedTitle: 'Отправлено',
    reportedMessage: 'Спасибо.',
    
    // Message
    signInToMessage: 'Вам нужно войти, чтобы написать сообщение.',
    
    // Common
    error: 'Ошибка',
    cancelButton: 'Отмена',
  },
  
  // Task Create Form
  create: {
    title: 'Создать задачу',
    cancel: 'Отмена',
    
    // Form fields
    taskTitleLabel: 'Название задачи',
    taskTitlePlaceholder: 'Что нужно сделать?',
    descriptionLabel: 'Описание',
    descriptionPlaceholder: 'Опишите задачу подробно...',
    photosLabel: 'Фотографии',
    photosHint: 'Необязательно — добавьте до 5 фото',
    categoryLabel: 'Категория',
    selectCategory: 'Выберите категорию',
    budgetLabel: 'Бюджет',
    budgetPlaceholder: '50',
    difficultyLabel: 'Сложность',
    difficultyHint: 'Насколько сложна эта задача?',
    easy: 'Легко',
    medium: 'Средне',
    hard: 'Сложно',
    locationLabel: 'Местоположение',
    deadlineLabel: 'Срок',
    setDeadline: 'Установить срок',
    selectDeadline: 'Выбрать срок',
    clearDeadline: 'Очистить',
    urgentLabel: 'Срочно?',
    urgentHint: 'Приоритетное размещение',
    urgent: 'Срочно',
    normal: 'Обычно',
    markAsUrgent: 'Отметить как срочное',
    
    // Buttons
    createButton: 'Создать задачу',
    uploadingImages: 'Загрузка изображений...',
    
    // Auth messages
    signInRequired: 'Требуется вход',
    signInText: 'Вам нужно войти, чтобы создать задачу',
    signInButton: 'Войти',
    
    // Success messages
    successTitle: 'Успешно!',
    successMessage: 'Ваша задача создана',
    viewTask: 'Посмотреть задачу',
    
    // Error messages
    errorTitle: 'Ошибка',
    errorCreateFailed: 'Не удалось создать задачу',
    errorRequired: 'Обязательно',
    errorTitleRequired: 'Пожалуйста, введите название задачи',
    errorDescriptionRequired: 'Пожалуйста, введите описание',
    errorBudgetRequired: 'Пожалуйста, введите корректный бюджет',
    errorLocationRequired: 'Пожалуйста, выберите местоположение',
    errorUserNotFound: 'Пользователь не найден',
  },
};
