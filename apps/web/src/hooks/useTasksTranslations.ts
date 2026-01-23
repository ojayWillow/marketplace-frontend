import { useTranslation } from 'react-i18next';

/**
 * Custom hook that provides all translations for the Tasks/Quick Help page.
 * This allows incremental adoption - import this hook and replace strings one by one.
 */
export const useTasksTranslations = () => {
  const { t } = useTranslation();

  return {
    // Page header
    pageTitle: t('tasks.title', 'Quick Help'),
    pageSubtitle: t('tasks.subtitle', 'Find jobs nearby and earn money 💰'),
    
    // Action buttons
    postJob: t('tasks.postJob', 'Post a Job'),
    offerService: t('tasks.offerService', 'Offer Service'),
    loginToPost: t('tasks.loginToPost', 'Login to Post Jobs or Offer Services'),
    
    // Tabs
    tabAll: t('tasks.tabs.all', 'All'),
    tabJobs: t('tasks.tabs.jobs', 'Jobs'),
    tabOfferings: t('tasks.tabs.offerings', 'Offerings'),
    
    // Search and filters
    searchPlaceholder: t('tasks.search.placeholder', 'Search jobs or offerings...'),
    filters: t('tasks.filters', 'Filters'),
    category: t('tasks.category', 'Category'),
    
    // Location
    findingLocation: t('tasks.location.finding', 'Finding your location...'),
    locationHelp: t('tasks.location.help', 'This helps show nearby jobs and services'),
    skipLocation: t('tasks.location.skip', 'Skip → Use Riga as default'),
    yourLocation: t('tasks.location.yours', 'Your location'),
    defaultLocation: t('tasks.location.default', 'Riga, Latvia'),
    selectedLocation: t('tasks.location.selected', 'Selected location'),
    resetToAuto: t('tasks.location.resetAuto', 'Reset to auto-detect'),
    searchAddress: t('tasks.location.searchAddress', 'Search address or city...'),
    
    // Loading states
    loading: t('common.loading', 'Loading...'),
    findingOpportunities: t('tasks.loading.opportunities', 'Finding opportunities...'),
    searchingWithin: t('tasks.loading.searchingWithin', 'Searching within {{radius}}km of {{location}}'),
    updating: t('tasks.loading.updating', 'Updating...'),
    
    // Matching notification
    matchingTitle: t('tasks.matching.title', '{{count}} job(s) match your offerings!'),
    matchingSubtitle: t('tasks.matching.subtitle', 'Based on your services: {{categories}}'),
    viewMatching: t('tasks.matching.view', 'View Matching Jobs →'),
    
    // Map legend
    mapLegend: t('tasks.map.legend', 'Map'),
    mapYou: t('tasks.map.you', 'You'),
    mapQuickTasks: t('tasks.map.quickTasks', 'Quick tasks'),
    mapMedium: t('tasks.map.medium', 'Medium'),
    mapPremium: t('tasks.map.premium', 'Premium'),
    jobsOnMap: t('tasks.map.jobsOnMap', '{{count}} job(s) on map'),
    topPayout: t('tasks.map.topPayout', 'Top payout: €{{amount}}'),
    premiumAvailable: t('tasks.map.premiumAvailable', 'Premium jobs available!'),
    
    // Content sections
    jobsAndOfferings: t('tasks.content.jobsAndOfferings', 'Jobs & Offerings'),
    availableJobs: t('tasks.content.availableJobs', 'Available Jobs'),
    serviceOfferings: t('tasks.content.serviceOfferings', 'Service Offerings'),
    searching: t('tasks.content.searching', 'Searching: "{{query}}"'),
    
    // Empty states - Jobs
    noJobsTitle: t('tasks.empty.jobs.title', 'No jobs posted nearby yet'),
    noJobsSubtitle: t('tasks.empty.jobs.subtitle', 'Be the first to post a job in your area! Need help with moving, cleaning, or any task? Post it here.'),
    postFirstJob: t('tasks.empty.jobs.postFirst', 'Post Your First Job'),
    loginToPostJob: t('tasks.empty.jobs.loginToPost', 'Login to Post a Job'),
    
    // Empty states - Offerings
    noOfferingsTitle: t('tasks.empty.offerings.title', 'No service providers in your area yet'),
    noOfferingsSubtitle: t('tasks.empty.offerings.subtitle', 'Are you skilled at something? Advertise your services here and get hired by people nearby!'),
    offerYourServices: t('tasks.empty.offerings.offer', 'Offer Your Services'),
    loginToOffer: t('tasks.empty.offerings.loginToOffer', 'Login to Offer Services'),
    offeringsTip: t('tasks.offerings.tip', 'Offerings are shown in the list below. Want your offering to appear on the map? Premium features coming soon!'),
    
    // Card labels
    distance: t('tasks.card.distance', 'Distance'),
    posted: t('tasks.card.posted', 'Posted'),
    applicants: t('tasks.card.applicants', 'Applicants'),
    viewAndApply: t('tasks.card.viewApply', 'View & Apply →'),
    viewProfile: t('tasks.card.viewProfile', 'View Profile →'),
    premiumOpportunity: t('tasks.card.premium', 'Premium opportunity!'),
    matchesYou: t('tasks.card.matches', 'Matches your skills!'),
    
    // Time formatting
    justNow: t('tasks.time.justNow', 'Just now'),
    
    // CTA section
    manageActivity: t('tasks.cta.title', 'Manage Your Activity'),
    manageSubtitle: t('tasks.cta.subtitle', 'View your posted jobs, offerings, and applications in your profile page.'),
    goToTasks: t('tasks.cta.goToTasks', 'Go to My Tasks →'),
    
    // Errors
    errorTitle: t('tasks.error.title', 'Oops!'),
    errorRetry: t('tasks.error.retry', 'Try Again'),
    errorLoad: t('tasks.error.load', 'Failed to load data. Please try again later.'),
    
    // Popup labels
    saved: t('tasks.popup.saved', 'Saved!'),
    nearby: t('tasks.popup.nearby', 'Nearby'),
  };
};

export default useTasksTranslations;
