export const tasks = {
  title: 'Задачи',
  myTasks: 'Мои задачи',
  createTask: 'Создать задачу',
  noTasks: 'Пока нет задач',
  statusOpen: 'Открыто',
  statusInProgress: 'В процессе',
  statusCompleted: 'Завершено',
  statusCancelled: 'Отменено',
  noFilterMatch: 'Ни один элемент не соответствует вашим фильтрам',
  noJobsFilter: 'Ни одна работа не соответствует вашим фильтрам',
  noServicesCategory: 'Нет услуг в этой категории',
  noTasksEmpty: 'Нет доступных задач',
  noJobs: 'Нет доступных работ',
  noServices: 'Нет доступных услуг',
  tryDifferentFilters: 'Попробуйте другие фильтры',
  checkBackLater: 'Загляните позже для новых элементов',
  // Tabs
  tabAll: 'Все',
  tabJobs: 'Работы',
  tabServices: 'Услуги',
  
  // Filters
  filters: {
    title: 'Фильтры',
    difficultyLabel: 'СЛОЖНОСТЬ',
    categoryLabel: 'КАТЕГОРИИ',
    all: 'Все',
    easy: 'Легко',
    medium: 'Средне',
    hard: 'Сложно',
    clearAll: 'Очистить всё',
    apply: 'Применить',
  },

  // Progress Stepper
  progress: {
    // Role headers
    roles: {
      creator: 'ПРОГРЕСС ВАШЕЙ РАБОТЫ',
      worker: 'ХОД ВАШЕЙ РАБОТЫ',
      applicant: 'ВАША ЗАЯВКА',
      default: 'ПРОГРЕСС',
    },

    // Step labels - Creator
    creatorPosted: {
      title: 'Работа опубликована',
      description: 'Ваша работа видна помощникам',
    },
    creatorReviewing: {
      title: 'Просмотр заявок',
      description: 'Проверьте заявки и выберите помощника',
    },
    creatorAssigned: {
      title: 'Помощник назначен',
      description: 'Кто-то работает над вашей задачей',
    },
    creatorInProgress: {
      title: 'Работа выполняется',
      description: 'Дождитесь, пока помощник завершит работу',
    },
    creatorPendingReview: {
      title: 'Требуется подтверждение',
      description: 'Подтвердите, что работа выполнена удовлетворительно',
    },
    creatorCompleted: {
      title: 'Работа завершена',
      description: 'Оплата передана помощнику',
    },

    // Step labels - Worker
    workerAccepted: {
      title: 'Работа принята',
      description: 'Вы назначены на эту работу',
    },
    workerInProgress: {
      title: 'Выполните работу',
      description: 'Завершите работу согласно описанию',
    },
    workerPendingConfirmation: {
      title: 'Ожидание подтверждения',
      description: 'Ждём подтверждения от заказчика',
    },
    workerCompleted: {
      title: 'Работа завершена',
      description: 'Оплата получена!',
    },

    // Step labels - Applicant
    applicantApplied: {
      title: 'Заявка отправлена',
      description: 'Ваша заявка ожидает рассмотрения',
    },
    applicantWaiting: {
      title: 'Ожидание ответа',
      description: 'Заказчик рассмотрит вашу заявку',
    },
    applicantDecision: {
      title: 'Решение ожидается',
      description: 'Вы будете уведомлены о результате',
    },

    // Action prompts
    actions: {
      reviewApplicants: 'Просмотрите заявки и назначьте кого-то',
      confirmCompletion: 'Проверьте работу и подтвердите завершение',
      markComplete: 'Отметьте как завершенное, когда готово',
      waitForDecision: 'Ожидаем решения заказчика',
      takeAction: 'Действуйте',
    },

    // Badges
    badges: {
      now: 'Сейчас',
      waiting: 'Ожидание',
    },
  },
};
