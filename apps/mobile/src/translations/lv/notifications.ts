export const notifications = {
  title: 'Paziņojumi',
  noNotifications: 'Nav paziņojumu',
  allCaughtUp: 'Viss ir apskatīts!',
  markAllRead: 'Atzīmēt visu',
  clearAll: 'Notīrīt Visu',
  
  // Alerts
  deleteTitle: 'Dzēst paziņojumu',
  deleteMessage: 'Vai tiešām vēlaties dzēst šo paziņojumu?',
  markAllSuccess: 'Visi paziņojumi atzīmēti kā lasīti',
  noUnread: 'Nav nelasītu',
  noUnreadMessage: 'Jums nav nelasītu paziņojumu',
  
  // Time ago
  timeAgo: {
    justNow: 'Tikko',
    minutesAgo: 'm atpakaļ',
    hoursAgo: 'h atpakaļ',
    daysAgo: 'd atpakaļ',
    weeksAgo: 'n atpakaļ',
  },
  
  // Notification content by type (for i18n)
  content: {
    application_accepted: {
      title: '🎉 Pieteikums Apstiprināts!',
      message: 'Apsveicam! Jūsu pieteikums darbam "{taskTitle}" ir apstiprināts. Tagad varat sākt strādāt pie šī uzdevuma.',
    },
    application_rejected: {
      title: 'Pieteikuma Atjauninājums',
      message: 'Jūsu pieteikums darbam "{taskTitle}" netika izvēlēts. Turpiniet pieteikties citiem darbiem!',
    },
    new_application: {
      title: 'Saņemts Jauns Pieteikums',
      message: '{applicantName} pieteicās jūsu darbam "{taskTitle}".',
    },
    task_marked_done: {
      title: 'Darbs Atzīmēts kā Pabeigts',
      message: '{workerName} ir atzīmējis "{taskTitle}" kā pabeigtu. Lūdzu, pārskatiet un apstipriniet.',
    },
    task_completed: {
      title: '✅ Darbs Pabeigts!',
      message: 'Lieliski! "{taskTitle}" ir apstiprināts kā pabeigts.',
    },
    task_disputed: {
      title: '⚠️ Darbs Apstrīdēts',
      message: 'Darbam "{taskTitle}" ir iesniegta sūdzība. Mūsu komanda to drīzumā izskatīs.',
    },
  },
  
  settings: {
    title: 'Paziņojumi',
    signInRequired: {
      title: 'Nepieciešama Pierakstīšanās',
      message: 'Lūdzu, piesakieties, lai pārvaldītu paziņojumu iestatījumus',
    },
    channels: {
      title: 'Paziņojumu Kanāli',
      push: {
        label: 'Push Paziņojumi',
        description: 'Saņemiet brīdinājumus savā ierīcē',
      },
      email: {
        label: 'E-pasta Paziņojumi',
        description: 'Saņemiet atjauninājumus e-pastā',
      },
    },
    types: {
      title: 'Paziņojumu Veidi',
      newMessages: {
        label: 'Jaunas Ziņas',
        description: 'Kad kāds jums nosūta ziņu',
      },
      taskApplications: {
        label: 'Darbu Pieteikumi',
        description: 'Kad kāds piesacas jūsu darbam',
      },
      taskUpdates: {
        label: 'Darbu Atjauninājumi',
        description: 'Statusa izmaiņas jūsu darbos',
      },
      promotions: {
        label: 'Akcijas un Padomi',
        description: 'Īpaši piedāvājumi un lietotnes padomi',
      },
    },
    test: {
      button: 'Nosūtīt Testa Paziņojumu',
      success: {
        title: 'Tests Nosūtīts!',
        message: 'Pārbaudiet savus paziņojumus pēc dažām sekundēm',
      },
      error: {
        title: 'Kļūda',
        message: 'Neizdevās nosūtīt testa paziņojumu',
        notLoggedIn: 'Jums jāpiesakās, lai testētu paziņojumus',
        pushDisabled: 'Lūdzu, vispirms ieslēdziet push paziņojumus',
      },
    },
    alerts: {
      permissionRequired: {
        title: 'Nepieciešama Atļauja',
        message: 'Lūdzu, ieslēdziet paziņojumus savās ierīces iestatījumos, lai saņemtu push paziņojumus.',
      },
      enabled: {
        title: 'Veiksmīgi',
        message: 'Push paziņojumi ieslēgti!',
      },
      disabled: 'Push paziņojumi izslēgti',
      saveFailed: {
        title: 'Kļūda',
        message: 'Neizdevās saglabāt iestatījumus',
      },
    },
    warning: {
      allDisabled: 'Visi paziņojumi ir izslēgti. Jūs nesaņemsiet nekādus brīdinājumus.',
    },
    footer: 'Izmaiņas tiek saglabātas automātiski.',
  },
};
