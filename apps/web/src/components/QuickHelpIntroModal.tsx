import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface CommunityRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  showCheckboxes?: boolean;
}

/** Unified localStorage key — used everywhere. */
export const COMMUNITY_RULES_KEY = 'communityRulesAccepted';

const CommunityRulesModal = ({ isOpen, onClose, showCheckboxes = true }: CommunityRulesModalProps) => {
  const { t } = useTranslation();
  const [agreed, setAgreed] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (showCheckboxes) {
      if (agreed) {
        localStorage.setItem(COMMUNITY_RULES_KEY, 'true');
        onClose();
      }
    } else {
      onClose();
    }
  };

  const canContinue = showCheckboxes ? agreed : true;

  const communityRules = [
    {
      icon: '🤝',
      text: t('community.respectRule', 'Be respectful to everyone'),
    },
    {
      icon: '✅',
      text: t('community.commitRule', 'Complete jobs you commit to'),
    },
    {
      icon: '💰',
      text: t('community.payRule', 'Pay fairly for completed work'),
    },
    {
      icon: '🚫',
      text: t('community.noAbuseRule', 'No fraud, spam, or abuse'),
    },
  ];

  return (
    <>
      {/* Full-screen modal */}
      <div className="fixed inset-0 z-[10000] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-y-auto">
        <div className="min-h-full px-4 py-6 sm:py-8 flex flex-col items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-6 text-center rounded-t-2xl relative">
              {/* Close button — only when re-viewing */}
              {!showCheckboxes && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  ×
                </button>
              )}
              <div className="text-4xl sm:text-5xl mb-3">🤝</div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1">
                {t('community.title', 'Kolab Community Rules')}
              </h2>
              <p className="text-blue-100 text-sm">
                {t('community.subtitle', 'Before you start, please agree to our community guidelines')}
              </p>
            </div>

            {/* Rules */}
            <div className="px-5 sm:px-6 py-5">
              <div className="space-y-3 mb-6">
                {communityRules.map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <span className="text-2xl flex-shrink-0">{rule.icon}</span>
                    <span className="text-sm sm:text-base font-medium text-gray-800">
                      {rule.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Single checkbox — only on first time */}
              {showCheckboxes && (
                <label className="flex items-start gap-3 cursor-pointer group mb-5">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-snug">
                    {t('community.agreeText', 'I agree to the Community Rules,')}{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTermsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 underline font-medium"
                    >
                      {t('community.termsLink', 'Terms of Service & Privacy Policy')}
                    </button>
                  </span>
                </label>
              )}

              {/* Action button */}
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`w-full py-3.5 rounded-xl font-bold text-base text-white transition-all ${
                  canContinue
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {showCheckboxes
                  ? canContinue
                    ? t('community.joinButton', 'Agree & Continue') + ' 🚀'
                    : t('community.checkFirst', 'Please check the box above')
                  : t('community.gotIt', 'Got it!') + ' 👍'
                }
              </button>

              {/* Footer hint — only on first time */}
              {showCheckboxes && (
                <p className="text-center text-xs text-gray-400 mt-4">
                  {t('community.accessLater', 'You can review these rules anytime from the')}{' '}
                  <span className="font-medium">❓ {t('kolab.howItWorksButton', 'How it works')}</span>{' '}
                  {t('kolab.button', 'button')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Privacy sub-modal */}
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="prose prose-sm max-w-none">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Terms of Service</h4>
                <p className="text-gray-700 mb-4">
                  By using Kolab, you agree to use the platform responsibly and in good faith.
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
                  setAgreed(true);
                  setShowTermsModal(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white"
              >
                {t('kolab.acceptAndClose', 'Accept & Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommunityRulesModal;
