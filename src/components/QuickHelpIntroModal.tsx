import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface QuickHelpIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickHelpIntroModal = ({ isOpen, onClose }: QuickHelpIntroModalProps) => {
  const { t } = useTranslation();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (agreedToTerms && agreedToPrivacy) {
      localStorage.setItem('quickHelpIntroSeen', 'true');
      onClose();
    }
  };

  const canContinue = agreedToTerms && agreedToPrivacy;

  return (
    <>
      {/* Main Intro Modal */}
      <div className="fixed inset-0 z-[10000] bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header - Blue gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-8 text-center rounded-t-2xl">
            <div className="text-5xl mb-3">🤝</div>
            <h2 className="text-2xl font-bold mb-2">
              {t('quickHelp.welcome', 'Welcome to Quick Help')}
            </h2>
            <p className="text-blue-100">
              {t('quickHelp.subtitle', 'Connect with your local community - get help or earn money')}
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* What is Quick Help? */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                💡 {t('quickHelp.whatIsTitle', 'What is Quick Help?')}
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🗺️</span>
                  <p>{t('quickHelp.mapDescription', 'An interactive map showing jobs near you - the closer, the easier to help!')}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">💰</span>
                  <p>{t('quickHelp.postOrApply', 'Post tasks you need help with, or apply to jobs and earn money.')}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚡</span>
                  <p>{t('quickHelp.services', 'From cleaning to deliveries to repairs - find or offer any local service!')}</p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                📋 {t('quickHelp.howItWorks', 'How It Works')}
              </h3>
              
              {/* Two tabs */}
              <div className="mb-3 flex gap-2">
                <button className="flex-1 py-2 px-3 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm">
                  💼 {t('quickHelp.lookingForWork', 'Looking for Work?')}
                </button>
                <button className="flex-1 py-2 px-3 bg-pink-100 text-pink-700 rounded-lg font-medium text-sm">
                  🆘 {t('quickHelp.needHelp', 'Need Help?')}
                </button>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center text-xl mb-2">🔍</div>
                  <p className="text-xs font-medium text-gray-700">{t('quickHelp.browse', 'Browse')}</p>
                  <p className="text-[10px] text-gray-500">{t('quickHelp.browseDesc', 'Find jobs on the map near you')}</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-xl mb-2">📝</div>
                  <p className="text-xs font-medium text-gray-700">{t('quickHelp.apply', 'Apply')}</p>
                  <p className="text-[10px] text-gray-500">{t('quickHelp.applyDesc', 'Send your application')}</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center text-xl mb-2">🎯</div>
                  <p className="text-xs font-medium text-gray-700">{t('quickHelp.getSelected', 'Get Selected')}</p>
                  <p className="text-[10px] text-gray-500">{t('quickHelp.getSelectedDesc', 'Job poster picks you')}</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-yellow-100 rounded-full flex items-center justify-center text-xl mb-2">💰</div>
                  <p className="text-xs font-medium text-gray-700">{t('quickHelp.getPaid', 'Get Paid')}</p>
                  <p className="text-[10px] text-gray-500">{t('quickHelp.getPaidDesc', 'Complete & earn money')}</p>
                </div>
              </div>
            </div>

            {/* Create account notice */}
            <div className="mb-6 p-3 bg-pink-50 border border-pink-200 rounded-lg">
              <p className="text-sm text-pink-800 flex items-start gap-2">
                <span className="text-lg">👤</span>
                <span>
                  <strong>{t('quickHelp.createAccount', 'Create a free account to apply for jobs and start earning!')}</strong>
                  <br />
                  <span className="text-xs text-pink-600">
                    {t('quickHelp.browseWithoutAccount', 'You can browse jobs without an account, but you\'ll need to sign up to apply.')}
                  </span>
                </span>
              </p>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 mb-6">
              {/* Checkbox 1: Understanding */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {t('quickHelp.agreeToTerms', 'I understand how Quick Help works and will treat other users with respect, complete jobs I commit to, and pay helpers fairly for completed work.')}
                </span>
              </label>

              {/* Checkbox 2: Terms & Privacy */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {t('quickHelp.agreeToPrivacy', 'I agree to the')}{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 underline font-medium"
                  >
                    {t('quickHelp.termsAndPrivacy', 'Terms of Service and Privacy Policy')}
                  </button>
                </span>
              </label>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
                canContinue
                  ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {canContinue
                ? t('common.continue', 'Continue')
                : t('quickHelp.checkBoxes', 'Please check the boxes above to continue')}
            </button>

            {/* Footer note */}
            <p className="text-center text-xs text-gray-500 mt-4">
              {t('quickHelp.alwaysAccess', 'You can always access this guide from the')}{' '}
              <span className="font-medium">❓ {t('quickHelp.howItWorksButton', 'How it works')}</span>{' '}
              {t('quickHelp.button', 'button')}
            </p>
          </div>
        </div>
      </div>

      {/* Terms & Privacy Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[10001] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {t('footer.terms', 'Terms of Service')} & {t('footer.privacy', 'Privacy Policy')}
              </h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Content - scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="prose prose-sm max-w-none">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Terms of Service</h4>
                <p className="text-gray-700 mb-4">
                  By using Quick Help, you agree to use the platform responsibly and in good faith. 
                  You agree to:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-6">
                  <li>Provide accurate information in your job postings or service offerings</li>
                  <li>Complete jobs you commit to as a helper</li>
                  <li>Pay helpers fairly and promptly for completed work</li>
                  <li>Treat all users with respect and professionalism</li>
                  <li>Not post illegal, harmful, or fraudulent content</li>
                  <li>Report any issues or disputes through proper channels</li>
                </ul>

                <h4 className="text-lg font-semibold text-gray-900 mb-3">Privacy Policy</h4>
                <p className="text-gray-700 mb-4">
                  We respect your privacy and are committed to protecting your personal data.
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-6">
                  <li><strong>Information we collect:</strong> Profile information, location data (for showing nearby jobs), job/offering details, messages between users</li>
                  <li><strong>How we use it:</strong> To connect job posters with helpers, show relevant opportunities, facilitate communication, and improve the service</li>
                  <li><strong>Data sharing:</strong> We do not sell your personal data. Location and profile info is shared with other users only as needed for the service (e.g., showing your job on the map)</li>
                  <li><strong>Your rights:</strong> You can view, edit, or delete your data at any time through your profile settings</li>
                  <li><strong>Security:</strong> We use industry-standard security measures to protect your data</li>
                </ul>

                <p className="text-sm text-gray-600">
                  For full details, visit our{' '}
                  <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                  {' '}pages.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-gray-700"
              >
                {t('common.close', 'Close')}
              </button>
              <button
                onClick={() => {
                  setAgreedToPrivacy(true);
                  setShowTermsModal(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white"
              >
                {t('quickHelp.acceptAndClose', 'Accept & Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickHelpIntroModal;