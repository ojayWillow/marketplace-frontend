export const task = {
  // Task Detail Actions
  applyNow: 'Pieteikties',
  withdrawApplication: 'Atsaukt pieteikumu',
  viewApplications: 'Skatīt pieteikumus',
  cancel: 'Atcelt',
  edit: 'Rediģēt',
  dispute: 'Strīds',
  confirmDone: 'Apstiprināt pabeigšanu',
  markAsDone: 'Atzīmēt kā pabeigtu',
  reportIssue: 'Ziņot par problēmu',
  
  // Task Detail Info
  applicants: 'PIETEIKUMI',
  difficulty: 'GRŪTĪBA',
  posted: 'PUBLICĒTS',
  distance: 'ATTĀLUMS',
  description: 'Apraksts',
  location: 'Atrašanās vieta',
  openInMaps: 'Atvērt kartēs',
  viewAndApply: 'Skatīt un pieteikties',
  
  // Time formatting
  time: {
    justNow: 'Tikko',
    minutesAgo: 'pirms {{count}}min',
    hoursAgo: 'pirms {{count}}h',
    daysAgo: 'pirms {{count}}d',
  },
  
  // Notices
  notices: {
    youHaveApplied: 'Jūs esat pieteicies šim uzdevumam',
    workerMarkedDone: '{{name}} atzīmēja kā pabeigtu. Lūdzu, pārskatiet un apstipriniet.',
  },
  
  // Status messages
  taskNotFound: 'Uzdevums nav atrasts',
  goBack: 'Atpakaļ',

  // Alert dialogs
  alerts: {
    // Apply
    applyTitle: 'Pieteikties',
    applyMessage: 'Pieteikties šim uzdevumam?',
    applyButton: 'Pieteikties',
    signInRequired: 'Nepieciešama pieteikšanās',
    signInToApply: 'Jums jāpiesakās, lai pieteiktos.',
    signInButton: 'Pieteikties',
    applySuccess: 'Veiksmīgi',
    applySuccessMessage: 'Jūsu pieteikums ir iesniegts!',
    
    // Withdraw
    withdrawTitle: 'Atsaukt',
    withdrawMessage: 'Atsaukt jūsu pieteikumu?',
    withdrawButton: 'Atsaukt',
    withdrawSuccess: 'Veiksmīgi',
    withdrawSuccessMessage: 'Pieteikums atsaukts',
    
    // Mark done
    markDoneTitle: 'Atzīmēt kā pabeigtu',
    markDoneMessage: 'Atzīmēt šo uzdevumu kā pabeigtu?',
    markDoneButton: 'Atzīmēt',
    markDoneSuccess: 'Veiksmīgi',
    markDoneSuccessMessage: 'Uzdevums atzīmēts kā pabeigts!',
    
    // Confirm completion
    confirmTitle: 'Apstiprināt',
    confirmMessage: 'Apstiprināt uzdevuma pabeigšanu?',
    confirmButton: 'Apstiprināt',
    
    // Cancel task
    cancelTitle: 'Atcelt uzdevumu',
    cancelMessage: 'Atcelt šo uzdevumu?',
    cancelYes: 'Jā',
    cancelNo: 'Nē',
    cancelSuccess: 'Atcelts',
    cancelSuccessMessage: 'Uzdevums ir atcelts.',
    
    // Report
    reportTitle: 'Ziņot',
    reportMessage: 'Ziņot par šo uzdevumu?',
    reportButton: 'Ziņot',
    reportedTitle: 'Ziņots',
    reportedMessage: 'Paldies.',
    
    // Message
    signInToMessage: 'Jums jāpiesakās, lai rakstītu ziņas.',
    
    // Common
    error: 'Kļūda',
    cancelButton: 'Atcelt',
  },
  
  // Task Create Form
  create: {
    title: 'Izveidot uzdevumu',
    cancel: 'Atcelt',
    
    // Form fields
    taskTitleLabel: 'Uzdevuma nosaukums',
    taskTitlePlaceholder: 'Kas jāizdara?',
    descriptionLabel: 'Apraksts',
    descriptionPlaceholder: 'Aprakstiet uzdevumu detalizēti...',
    photosLabel: 'Fotogrāfijas',
    categoryLabel: 'Kategorija',
    selectCategory: 'Izvēlēties kategoriju',
    budgetLabel: 'Budžets',
    budgetPlaceholder: '50',
    difficultyLabel: 'Grūtība',
    difficultyHint: 'Cik sarežģīts ir šis uzdevums?',
    easy: 'Viegli',
    medium: 'Vidēji',
    hard: 'Grūti',
    locationLabel: 'Atrašanās vieta',
    deadlineLabel: 'Termiņš',
    selectDeadline: 'Izvēlēties termiņu',
    clearDeadline: 'Notīrīt',
    markAsUrgent: 'Atzīmēt kā steidzamu',
    urgentHint: 'Prioritārs izvietojums',
    
    // Buttons
    createButton: 'Izveidot uzdevumu',
    uploadingImages: 'Augšupielādē attēlus...',
    
    // Auth messages
    signInRequired: 'Nepieciešama pieteikšanās',
    signInText: 'Jums jāpiesakās, lai izveidotu uzdevumu',
    signInButton: 'Pierakstīties',
    
    // Success messages
    successTitle: 'Veiksmīgi!',
    successMessage: 'Jūsu uzdevums ir izveidots',
    viewTask: 'Skatīt uzdevumu',
    
    // Error messages
    errorTitle: 'Kļūda',
    errorCreateFailed: 'Neizdevās izveidot uzdevumu',
    errorRequired: 'Obligāti',
    errorTitleRequired: 'Lūdzu, ievadiet uzdevuma nosaukumu',
    errorDescriptionRequired: 'Lūdzu, ievadiet aprakstu',
    errorBudgetRequired: 'Lūdzu, ievadiet derīgu budžetu',
    errorLocationRequired: 'Lūdzu, izvēlieties atrašanās vietu',
    errorUserNotFound: 'Lietotājs nav atrasts',
  },
};
