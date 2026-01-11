import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface HowItWorksProps {
  variant?: 'banner' | 'compact' | 'embedded';
  defaultExpanded?: boolean;
  showDismiss?: boolean;
}

const HowItWorks = ({ 
  variant = 'banner', 
  defaultExpanded,
  showDismiss = true 
}: HowItWorksProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  // Check if user has seen this before
  const [hasSeenBefore, setHasSeenBefore] = useState(() => {
    return localStorage.getItem('howItWorks_seen') === 'true';
  });
  
  // Expanded state - first-time users see it expanded
  const [isExpanded, setIsExpanded] = useState(() => {
    if (defaultExpanded !== undefined) return defaultExpanded;
    return !localStorage.getItem('howItWorks_seen');
  });
  
  // Active tab: 'earn' (job seekers) or 'hire' (job posters)
  const [activeTab, setActiveTab] = useState<'earn' | 'hire'>('earn');

  const handleDismiss = () => {
    setIsExpanded(false);
    localStorage.setItem('howItWorks_seen', 'true');
    setHasSeenBefore(true);
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  // Steps for earning money (job seekers)
  const earnSteps = [
    {
      icon: '🔍',
      title: t('howItWorks.earn.step1.title', 'Browse Jobs'),
      description: t('howItWorks.earn.step1.desc', 'Find tasks near you that match your skills')
    },
    {
      icon: '💬',
      title: t('howItWorks.earn.step2.title', 'Apply'),
      description: t('howItWorks.earn.step2.desc', 'Send a message explaining why you\'re the right fit')
    },
    {
      icon: '✅',
      title: t('howItWorks.earn.step3.title', 'Get Selected'),
      description: t('howItWorks.earn.step3.desc', 'The job poster reviews applications and picks you')
    },
    {
      icon: '💰',
      title: t('howItWorks.earn.step4.title', 'Get Paid'),
      description: t('howItWorks.earn.step4.desc', 'Complete the task and receive payment directly')
    }
  ];

  // Steps for hiring help (job posters)
  const hireSteps = [
    {
      icon: '📝',
      title: t('howItWorks.hire.step1.title', 'Post a Job'),
      description: t('howItWorks.hire.step1.desc', 'Describe what you need help with and set a budget')
    },
    {
      icon: '👀',
      title: t('howItWorks.hire.step2.title', 'Review Applications'),
      description: t('howItWorks.hire.step2.desc', 'Receive offers from local helpers with their profiles')
    },
    {
      icon: '🤝',
      title: t('howItWorks.hire.step3.title', 'Choose a Helper'),
      description: t('howItWorks.hire.step3.desc', 'Select the best person based on skills and reviews')
    },
    {
      icon: '⭐',
      title: t('howItWorks.hire.step4.title', 'Rate & Pay'),
      description: t('howItWorks.hire.step4.desc', 'Pay when satisfied and leave a review')
    }
  ];

  const currentSteps = activeTab === 'earn' ? earnSteps : hireSteps;

  // Compact version - just a clickable link
  if (variant === 'compact' || (variant === 'banner' && hasSeenBefore && !isExpanded)) {
    return (
      <button
        onClick={handleToggle}
        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 
                   hover:underline font-medium transition-colors"
      >
        <span>❓</span>
        <span>{t('howItWorks.title', 'How it works')}</span>
        <span className="text-xs">{isExpanded ? '▲' : '▼'}</span>
      </button>
    );
  }

  // Embedded version (for empty states) - no dismiss, always shows content
  if (variant === 'embedded') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>💡</span>
          {t('howItWorks.title', 'How it works')}
        </h3>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('earn')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'earn'
                ? 'bg-green-500 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            💰 {t('howItWorks.tabs.earn', 'Earn Money')}
          </button>
          <button
            onClick={() => setActiveTab('hire')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'hire'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            👋 {t('howItWorks.tabs.hire', 'Get Help')}
          </button>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {currentSteps.map((step, index) => (
            <div key={index} className="bg-white rounded-lg p-3 text-center shadow-sm">
              <div className="text-2xl mb-2">{step.icon}</div>
              <div className="text-xs text-gray-400 mb-1">{t('howItWorks.step', 'Step')} {index + 1}</div>
              <div className="font-semibold text-gray-900 text-sm mb-1">{step.title}</div>
              <div className="text-xs text-gray-500">{step.description}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full banner version
  return (
    <div className="mb-4">
      {/* Collapsed state - just the link */}
      {!isExpanded && (
        <button
          onClick={handleToggle}
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 
                     hover:underline font-medium transition-colors"
        >
          <span>❓</span>
          <span>{t('howItWorks.title', 'How it works')}</span>
          <span className="text-xs">▼</span>
        </button>
      )}

      {/* Expanded state - full banner */}
      {isExpanded && (
        <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10">
            {/* Header with dismiss button */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                  <span>🚀</span>
                  {t('howItWorks.welcome', 'Welcome to Quick Help!')}
                </h2>
                <p className="text-blue-100 text-sm">
                  {t('howItWorks.subtitle', 'Connect with your local community to earn money or get things done')}
                </p>
              </div>
              {showDismiss && (
                <button
                  onClick={handleDismiss}
                  className="text-white/70 hover:text-white text-sm hover:bg-white/10 
                             px-2 py-1 rounded transition-colors"
                >
                  {t('howItWorks.gotIt', 'Got it!')} ✕
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => setActiveTab('earn')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'earn'
                    ? 'bg-white text-green-600 shadow-md'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                💰 {t('howItWorks.tabs.earn', 'Earn Money')}
              </button>
              <button
                onClick={() => setActiveTab('hire')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'hire'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                👋 {t('howItWorks.tabs.hire', 'Get Help')}
              </button>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {currentSteps.map((step, index) => (
                <div 
                  key={index} 
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center 
                             hover:bg-white/20 transition-colors"
                >
                  <div className="text-3xl mb-2">{step.icon}</div>
                  <div className="text-xs text-blue-200 mb-1 uppercase tracking-wide">
                    {t('howItWorks.step', 'Step')} {index + 1}
                  </div>
                  <div className="font-semibold text-white mb-1">{step.title}</div>
                  <div className="text-xs text-blue-100">{step.description}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              {activeTab === 'earn' ? (
                <>
                  <button
                    onClick={() => {
                      handleDismiss();
                      // Scroll to jobs or just dismiss
                    }}
                    className="bg-white text-blue-600 px-5 py-2.5 rounded-lg font-semibold 
                               hover:bg-blue-50 transition-colors shadow-md"
                  >
                    🔍 {t('howItWorks.cta.browseJobs', 'Browse Jobs Now')}
                  </button>
                  {!isAuthenticated && (
                    <button
                      onClick={() => navigate('/register')}
                      className="bg-white/20 text-white px-5 py-2.5 rounded-lg font-semibold 
                                 hover:bg-white/30 transition-colors border border-white/30"
                    >
                      {t('howItWorks.cta.createAccount', 'Create Free Account')}
                    </button>
                  )}
                </>
              ) : (
                <>
                  {isAuthenticated ? (
                    <button
                      onClick={() => {
                        handleDismiss();
                        navigate('/tasks/create');
                      }}
                      className="bg-white text-blue-600 px-5 py-2.5 rounded-lg font-semibold 
                                 hover:bg-blue-50 transition-colors shadow-md"
                    >
                      📝 {t('howItWorks.cta.postJob', 'Post Your First Job')}
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/register')}
                      className="bg-white text-blue-600 px-5 py-2.5 rounded-lg font-semibold 
                                 hover:bg-blue-50 transition-colors shadow-md"
                    >
                      {t('howItWorks.cta.signUpToPost', 'Sign Up to Post a Job')}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleDismiss();
                      navigate('/offerings');
                    }}
                    className="bg-white/20 text-white px-5 py-2.5 rounded-lg font-semibold 
                               hover:bg-white/30 transition-colors border border-white/30"
                  >
                    👀 {t('howItWorks.cta.browseHelpers', 'Browse Available Helpers')}
                  </button>
                </>
              )}
            </div>

            {/* Collapse button */}
            <button
              onClick={handleToggle}
              className="mt-4 text-xs text-blue-200 hover:text-white flex items-center gap-1"
            >
              <span>▲</span>
              <span>{t('howItWorks.collapse', 'Collapse')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HowItWorks;
