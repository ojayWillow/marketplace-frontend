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
  
  settings: {
    title: 'Paziņojumi',
    signInRequired: {
      title: 'Nepieciešama Pierakstīšanās',
      message: 'Lūdzu, piesakieties, lai pārvaldītu paziņojumu iestatījumus',
    },
    channels: {
      title: 'Paziņojumu Kanāli',
      push: {
        label: 'Puspāru Paziņojumi',
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
        notLoggedIn: 'Jūsu jāpiesakas, lai testētu paziņojumus',
        pushDisabled: 'Lūdzu, vispirms ieslēdziet puspāru paziņojumus',
      },
    },
    alerts: {
      permissionRequired: {
        title: 'Nepieciešama Atļauja',
        message: 'Lūdzu, ieslēdziet paziņojumus savās ierīces iestatījumos, lai saņemtu puspāru paziņojumus.',
      },
      enabled: {
        title: 'Veiksmīgi',
        message: 'Puspāru paziņojumi ieslēgti!',
      },
      disabled: 'Puspāru paziņojumi izslēgti',
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
