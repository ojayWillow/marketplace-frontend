import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TaskApplication } from '@marketplace/shared';

interface TaskApplicationsProps {
  applications: TaskApplication[];
  applicationsLoading: boolean;
  acceptingId: number | null;
  rejectingId: number | null;
  onAccept: (applicationId: number) => void;
  onReject: (applicationId: number) => void;
  onMessage: (applicantId: number) => void;
}

export const TaskApplications = ({
  applications,
  applicationsLoading,
  acceptingId,
  rejectingId,
  onAccept,
  onReject,
  onMessage,
}: TaskApplicationsProps) => {
  const { t } = useTranslation();

  return (
    <div className="mt-4">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
        📋 {t('taskDetail.applications.title', 'Applications')}
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({applications.length})</span>
      </h2>

      {applicationsLoading ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">{t('taskDetail.applications.loading', 'Loading applications...')}</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <span className="text-3xl mb-2 block">📋</span>
          <p className="text-gray-600 dark:text-gray-300 font-medium text-sm">{t('taskDetail.applications.none', 'No applications yet')}</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{t('taskDetail.applications.shareHint', 'Share your job to get more applicants!')}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {applications.map(application => (
            <div
              key={application.id}
              className={`rounded-xl border overflow-hidden ${
                application.status === 'pending' ? 'border-blue-100 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-900/20'
                : application.status === 'accepted' ? 'border-green-100 dark:border-green-800/40 bg-green-50/50 dark:bg-green-900/20'
                : 'border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50'
              }`}
            >
              {/* Applicant header */}
              <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-2">
                <Link to={`/users/${application.applicant_id}`} className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden">
                    {application.applicant_avatar ? (
                      <img src={application.applicant_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-sm font-bold">
                        {application.applicant_name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/users/${application.applicant_id}`}
                    className="font-semibold text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 truncate block"
                  >
                    {application.applicant_name}
                  </Link>
                </div>
                {application.status === 'pending' && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 flex-shrink-0">
                    {t('taskDetail.applications.pending', 'Pending')}
                  </span>
                )}
                {application.status === 'accepted' && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex-shrink-0">
                    {t('taskDetail.applications.accepted', '✓ Accepted')}
                  </span>
                )}
              </div>

              {/* Application message */}
              {application.message && (
                <div className="px-3.5 pb-2.5">
                  <p className="text-sm text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 rounded-lg px-3 py-2 border border-gray-100/80 dark:border-gray-700/80 leading-relaxed">
                    {application.message}
                  </p>
                </div>
              )}

              {/* Action buttons — full width at bottom */}
              {application.status === 'pending' && (
                <div className="flex border-t border-gray-200/60 dark:border-gray-700/60">
                  <button
                    onClick={() => onAccept(application.id)}
                    disabled={acceptingId === application.id}
                    className="flex-1 py-2.5 text-sm font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 disabled:text-gray-400 disabled:bg-gray-50 dark:disabled:bg-gray-800 transition-colors border-r border-gray-200/60 dark:border-gray-700/60"
                  >
                    {acceptingId === application.id ? '...' : t('taskDetail.applications.accept', '✓ Accept')}
                  </button>
                  <button
                    onClick={() => onReject(application.id)}
                    disabled={rejectingId === application.id}
                    className="flex-1 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:text-gray-300 dark:disabled:text-gray-600 transition-colors border-r border-gray-200/60 dark:border-gray-700/60"
                  >
                    {t('taskDetail.applications.reject', 'Reject')}
                  </button>
                  <button
                    onClick={() => onMessage(application.applicant_id)}
                    className="px-5 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    💬
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
