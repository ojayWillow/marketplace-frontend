import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import English translations
import enCommon from './locales/en/common.json'
import enAuth from './locales/en/auth.json'
import enHome from './locales/en/home.json'
import enMenu from './locales/en/menu.json'
import enQuickHelp from './locales/en/quickHelp.json'
import enCreateModal from './locales/en/createModal.json'
import enFilters from './locales/en/filters.json'
import enMessages from './locales/en/messages.json'
import enReviews from './locales/en/reviews.json'
import enProfile from './locales/en/profile.json'
import enUserProfile from './locales/en/userProfile.json'
import enNotFound from './locales/en/notFound.json'
import enToast from './locales/en/toast.json'
import enFooter from './locales/en/footer.json'
import enListings from './locales/en/listings.json'
import enMap from './locales/en/map.json'
import enTasks from './locales/en/tasks.json'
import enOfferings from './locales/en/offerings.json'
import enCreateOffering from './locales/en/createOffering.json'
import enCreateTask from './locales/en/createTask.json'
import enLegal from './locales/en/legal.json'

// Import Latvian translations
import lvCommon from './locales/lv/common.json'
import lvAuth from './locales/lv/auth.json'
import lvHome from './locales/lv/home.json'
import lvMenu from './locales/lv/menu.json'
import lvQuickHelp from './locales/lv/quickHelp.json'
import lvCreateModal from './locales/lv/createModal.json'
import lvFilters from './locales/lv/filters.json'
import lvMessages from './locales/lv/messages.json'
import lvReviews from './locales/lv/reviews.json'
import lvProfile from './locales/lv/profile.json'
import lvUserProfile from './locales/lv/userProfile.json'
import lvNotFound from './locales/lv/notFound.json'
import lvToast from './locales/lv/toast.json'
import lvFooter from './locales/lv/footer.json'
import lvListings from './locales/lv/listings.json'
import lvMap from './locales/lv/map.json'
import lvTasks from './locales/lv/tasks.json'
import lvOfferings from './locales/lv/offerings.json'
import lvCreateOffering from './locales/lv/createOffering.json'
import lvCreateTask from './locales/lv/createTask.json'
import lvLegal from './locales/lv/legal.json'

// Import Russian translations
import ruCommon from './locales/ru/common.json'
import ruAuth from './locales/ru/auth.json'
import ruHome from './locales/ru/home.json'
import ruMenu from './locales/ru/menu.json'
import ruQuickHelp from './locales/ru/quickHelp.json'
import ruCreateModal from './locales/ru/createModal.json'
import ruFilters from './locales/ru/filters.json'
import ruMessages from './locales/ru/messages.json'
import ruReviews from './locales/ru/reviews.json'
import ruProfile from './locales/ru/profile.json'
import ruUserProfile from './locales/ru/userProfile.json'
import ruNotFound from './locales/ru/notFound.json'
import ruToast from './locales/ru/toast.json'
import ruFooter from './locales/ru/footer.json'
import ruListings from './locales/ru/listings.json'
import ruMap from './locales/ru/map.json'
import ruTasks from './locales/ru/tasks.json'
import ruOfferings from './locales/ru/offerings.json'
import ruCreateOffering from './locales/ru/createOffering.json'
import ruCreateTask from './locales/ru/createTask.json'
import ruLegal from './locales/ru/legal.json'

// Combine all translations per language
const en = {
  common: enCommon,
  auth: enAuth,
  home: enHome,
  menu: enMenu,
  quickHelp: enQuickHelp,
  createModal: enCreateModal,
  filters: enFilters,
  messages: enMessages,
  reviews: enReviews,
  profile: enProfile,
  userProfile: enUserProfile,
  notFound: enNotFound,
  toast: enToast,
  footer: enFooter,
  listings: enListings,
  map: enMap,
  tasks: enTasks,
  offerings: enOfferings,
  createOffering: enCreateOffering,
  createTask: enCreateTask,
  legal: enLegal,
}

const lv = {
  common: lvCommon,
  auth: lvAuth,
  home: lvHome,
  menu: lvMenu,
  quickHelp: lvQuickHelp,
  createModal: lvCreateModal,
  filters: lvFilters,
  messages: lvMessages,
  reviews: lvReviews,
  profile: lvProfile,
  userProfile: lvUserProfile,
  notFound: lvNotFound,
  toast: lvToast,
  footer: lvFooter,
  listings: lvListings,
  map: lvMap,
  tasks: lvTasks,
  offerings: lvOfferings,
  createOffering: lvCreateOffering,
  createTask: lvCreateTask,
  legal: lvLegal,
}

const ru = {
  common: ruCommon,
  auth: ruAuth,
  home: ruHome,
  menu: ruMenu,
  quickHelp: ruQuickHelp,
  createModal: ruCreateModal,
  filters: ruFilters,
  messages: ruMessages,
  reviews: ruReviews,
  profile: ruProfile,
  userProfile: ruUserProfile,
  notFound: ruNotFound,
  toast: ruToast,
  footer: ruFooter,
  listings: ruListings,
  map: ruMap,
  tasks: ruTasks,
  offerings: ruOfferings,
  createOffering: ruCreateOffering,
  createTask: ruCreateTask,
  legal: ruLegal,
}

const resources = {
  lv: { translation: lv },
  ru: { translation: ru },
  en: { translation: en },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'lv',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
