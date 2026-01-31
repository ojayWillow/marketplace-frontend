export const notifications = {
  title: 'Paziņojumi',
  noNotifications: 'Nav paziņojumu',
  markAllRead: 'Atzīmēt Visu Kā Lasitu',
  clearAll: 'Notīrīt Visu',
  
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
        description: 'Kad kāds piesacas jsu darbam',
      },
      taskUpdates: {
        label: 'Darbu Atjauninājumi',
        description: 'Statusa izmaiņas jsu darbos',
      },
      promotions: {
        label: 'Akcijas un Padomi',
        description: 'īpaši piedāvājumi un lietotnes padomi',
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
      allDisabled: 'Visi paziņojumi ir izslēgti. Jūs nesaņemsiet nekus brīdinājumus.',
    },
    footer: 'Izmaiņas tiek saglabātas automrtiski.',
  },
};
