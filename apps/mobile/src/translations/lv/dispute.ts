export const dispute = {
  // Basic
  title: 'Strīds',
  createDispute: 'Izveidot strīdu',
  reason: 'Iemesls',
  description: 'Apraksts',
  submit: 'Iesniegt',
  cancel: 'Atcelt',

  // Status labels
  status: {
    open: 'Atklāts',
    underReview: 'Tiek izskatīts',
    resolved: 'Atrisināts',
  },

  // Reason labels
  reasons: {
    workNotCompleted: 'Darbs nav pabeigts',
    poorQuality: 'Zema darba kvalitāte',
    taskChanged: 'Uzdevuma prasības mainījās',
    paymentIssue: 'Maksājuma problēma',
    safetyConcern: 'Drošības bažas',
    communication: 'Komunikācijas problēma',
    other: 'Cits',
  },

  // Info section
  info: {
    disputeStatus: 'Strīda statuss',
    filedBy: 'Iesniedza:',
    you: 'Jūs',
    theOtherParty: 'Otra puse',
    reason: 'Iemesls:',
    theirComplaint: 'Viņu sūdzība:',
    responseSubmitted: 'Atbilde iesniegta:',
  },

  // Response form
  responseForm: {
    title: 'Jūsu atbilde',
    subtitle: 'Paskaidrojiet savu versiju. Esiet konkrēts un objektīvs.',
    placeholder: 'Aprakstiet, kas notika no jūsu perspektīvas...',
    characterCount: '/ 20 minimālais rakstzīmju skaits',
    submitButton: 'Iesniegt atbildi',
    cancelButton: 'Atcelt',
  },

  // Notices
  notices: {
    respondNotice: 'Pret jums ir iesniegts strīds. Lūdzu, atbildiet ar savu versiju.',
    respondButton: 'Atbildēt uz strīdu',
    waitingNotice: 'Gaidām, kad otra puse atbildēs uz jūsu strīdu.',
    underReviewNotice: 'Abas puses ir sniegušas savu versiju. Atbalsta komanda izskata šo strīdu un drīz sazināsies.',
  },

  // Alerts
  alerts: {
    responseSubmittedTitle: 'Atbilde iesniegta',
    responseSubmittedMessage: 'Jūsu atbilde ir iesniegta. Strīdu tagad izskata mūsu atbalsta komanda.',
    ok: 'Labi',
    error: 'Kļūda',
    errorSubmit: 'Neizdevās iesniegt atbildi. Lūdzu, mēģiniet vēlreiz.',
    errorMinLength: 'Lūdzu, sniedziet detalizētu atbildi (vismaz 20 rakstzīmes).',
  },
};
