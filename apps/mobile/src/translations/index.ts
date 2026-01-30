// Language types and union type for supported languages
export type Language = 'en' | 'lv' | 'ru';

// Base translation structure - all language files must match this
export interface Translations {
  // Auth screens
  auth: {
    login: {
      title: string;
      subtitle: string;
      emailLabel: string;
      passwordLabel: string;
      signIn: string;
      signInLoading: string;
      forgotPassword: string;
      noAccount: string;
      signUp: string;
      browseGuest: string;
      errorNoCredentials: string;
      errorNoToken: string;
      errorGeneric: string;
    };
    register: {
      title: string;
      subtitle: string;
      nameLabel: string;
      emailLabel: string;
      passwordLabel: string;
      confirmPasswordLabel: string;
      createAccount: string;
      creatingAccount: string;
      hasAccount: string;
      signIn: string;
      errorPasswordMatch: string;
      errorNoName: string;
      errorNoEmail: string;
      errorNoPassword: string;
      errorGeneric: string;
      termsAgreement: string;
    };
    forgotPassword: {
      title: string;
      subtitle: string;
      emailLabel: string;
      sendResetLink: string;
      sending: string;
      backToLogin: string;
      successMessage: string;
      errorNoEmail: string;
      errorGeneric: string;
    };
    phone: {
      title: string;
      subtitle: string;
      phoneLabel: string;
      sendCode: string;
      sending: string;
      verifyCode: string;
      verifying: string;
      codeLabel: string;
      resendCode: string;
      backToLogin: string;
    };
  };

  // Bottom tabs
  tabs: {
    home: string;
    tasks: string;
    messages: string;
    profile: string;
  };

  // Home/Feed screen
  home: {
    title: string;
    searchPlaceholder: string;
    noResults: string;
    categories: string;
    featured: string;
    popular: string;
    new: string;
  };

  // Tasks screen
  tasks: {
    title: string;
    myTasks: string;
    createTask: string;
    noTasks: string;
    statusOpen: string;
    statusInProgress: string;
    statusCompleted: string;
    statusCancelled: string;
  };

  // Messages/Conversation screen
  messages: {
    title: string;
    noMessages: string;
    typeMessage: string;
    send: string;
    typing: string;
  };

  // Profile screen
  profile: {
    title: string;
    editProfile: string;
    myOfferings: string;
    myActivity: string;
    settings: string;
    logout: string;
    memberSince: string;
    verified: string;
    notVerified: string;
  };

  // Settings screen
  settings: {
    title: string;
    language: string;
    languageEnglish: string;
    languageLatvian: string;
    languageRussian: string;
    notifications: string;
    darkMode: string;
    privacy: string;
    terms: string;
    help: string;
    about: string;
    version: string;
  };

  // Activity screen
  activity: {
    title: string;
    noActivity: string;
    tabPending: string;
    tabInProgress: string;
    tabCompleted: string;
  };

  // Offering screen
  offering: {
    title: string;
    createOffering: string;
    editOffering: string;
    deleteOffering: string;
    price: string;
    category: string;
    description: string;
    contact: string;
    bookNow: string;
  };

  // Notifications screen
  notifications: {
    title: string;
    noNotifications: string;
    markAllRead: string;
    clearAll: string;
  };

  // Onboarding
  onboarding: {
    welcome: {
      title: string;
      subtitle: string;
      next: string;
    };
    location: {
      title: string;
      subtitle: string;
      allowLocation: string;
      skip: string;
    };
    complete: {
      title: string;
      subtitle: string;
      getStarted: string;
    };
  };

  // Dispute
  dispute: {
    title: string;
    createDispute: string;
    reason: string;
    description: string;
    submit: string;
    cancel: string;
  };

  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    done: string;
    loading: string;
    error: string;
    retry: string;
    close: string;
    back: string;
    next: string;
    confirm: string;
    dismiss: string;
    yes: string;
    no: string;
  };
}
