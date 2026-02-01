export const tasks = {
  title: 'Uzdevumi',
  myTasks: 'Mani uzdevumi',
  createTask: 'Izveidot uzdevumu',
  noTasks: 'Vēl nav uzdevumu',
  statusOpen: 'Atvērts',
  statusInProgress: 'Progresā',
  statusCompleted: 'Pabeigts',
  statusCancelled: 'Atcelts',
  noFilterMatch: 'Neviens elements neatbilst jūsu filtriem',
  noJobsFilter: 'Neviens darbs neatbilst jūsu filtriem',
  noServicesCategory: 'Nav pakalpojumu šajā kategorijā',
  noTasksEmpty: 'Nav pieejamu uzdevumu',
  noJobs: 'Nav pieejamu darbu',
  noServices: 'Nav pieejamu pakalpojumu',
  tryDifferentFilters: 'Mēģiniet citus filtrus',
  checkBackLater: 'Pārbaudiet vēlāk, vai ir jauni vienumi',
  // Tabs
  tabAll: 'Visi',
  tabJobs: 'Darbi',
  tabServices: 'Pakalpojumi',
  
  // Status badge labels (for TaskCard bubbles)
  status: {
    open: 'Atvērts',
    assigned: 'Piešķirts',
    in_progress: 'Progresā',
    pending_confirmation: 'Gaida apstiprinājumu',
    completed: 'Pabeigts',
    disputed: 'Apstrīdēts',
    cancelled: 'Atcelts',
  },

  // Action labels for status badges
  actionNeeded: 'Nepieciešama darbība',
  waiting: 'Gaida',
  applied: 'Pieteicies',
  applicantLabel: 'pieteikums',
  applicantsLabel: 'pieteikumi',
  
  // Filters
  filters: {
    title: 'Filtri',
    difficultyLabel: 'GRŪTĪBA',
    categoryLabel: 'KATEGORIJAS',
    all: 'Visi',
    easy: 'Viegli',
    medium: 'Vidēji',
    hard: 'Grūti',
    clearAll: 'Notīrīt visu',
    apply: 'Pielietot',
  },

  // Difficulty labels
  difficulty: {
    easy: 'Viegli',
    medium: 'Vidēji',
    hard: 'Grūti',
  },

  // Progress Stepper
  progress: {
    // Role headers
    roles: {
      creator: 'JŪSU DARBA PROGRESS',
      worker: 'JŪSU DARBA GAITA',
      applicant: 'JŪSU PIETEIKUMS',
      default: 'PROGRESS',
    },

    // Step labels - Creator
    creatorPosted: {
      title: 'Darbs publicēts',
      description: 'Jūsu darbs ir redzams palīgiem',
    },
    creatorReviewing: {
      title: 'Pārskatīt pieteikumus',
      description: 'Pārbaudiet pieteikumus un izvēlieties palīgu',
    },
    creatorAssigned: {
      title: 'Palīgs piešķirts',
      description: 'Kāds strādā pie jūsu darba',
    },
    creatorInProgress: {
      title: 'Darbs norit',
      description: 'Gaidiet, kamēr palīgs pabeidz darbu',
    },
    creatorPendingReview: {
      title: 'Nepieciešams apstiprinājums',
      description: 'Apstipriniet, ka darbs ir paveikts apmierinoši',
    },
    creatorCompleted: {
      title: 'Darbs pabeigts',
      description: 'Maksājums nodots palīgam',
    },

    // Step labels - Worker
    workerAccepted: {
      title: 'Darbs pieņemts',
      description: 'Jūs esat piešķirts šim darbam',
    },
    workerInProgress: {
      title: 'Veiciet darbu',
      description: 'Pabeidziet darbu kā aprakstīts',
    },
    workerPendingConfirmation: {
      title: 'Gaida apstiprinājumu',
      description: 'Gaidām, kad pasūtītājs apstiprinās',
    },
    workerCompleted: {
      title: 'Darbs pabeigts',
      description: 'Maksājums saņemts!',
    },

    // Step labels - Applicant
    applicantApplied: {
      title: 'Pieteikums nosūtīts',
      description: 'Jūsu pieteikums gaida izskatīšanu',
    },
    applicantWaiting: {
      title: 'Gaida atbildi',
      description: 'Pasūtītājs izskatīs jūsu pieteikumu',
    },
    applicantDecision: {
      title: 'Lēmums gaida',
      description: 'Jūs tiksiet informēts par rezultātu',
    },

    // Action prompts
    actions: {
      reviewApplicants: 'Pārskatiet pieteikumus un piešķiriet kādu',
      confirmCompletion: 'Pārskatiet darbu un apstipriniet pabeigšanu',
      markComplete: 'Atzīmējiet kā pabeigtu, kad gatavs',
      waitForDecision: 'Gaidām pasūtītāja lēmumu',
      takeAction: 'Rīkojieties',
    },

    // Badges
    badges: {
      now: 'Tagad',
      waiting: 'Gaida',
    },
  },
};
