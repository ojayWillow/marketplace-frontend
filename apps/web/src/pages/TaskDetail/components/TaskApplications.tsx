import { Link } from 'react-router-dom';
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
  return (
    <div className="mt-4">
      <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
        \uD83D\uDCCB Applications
        <span className="text-sm font-normal text-gray-500">({applications.length})</span>
      </h2>

      {applicationsLoading ? (
        <div className="text-center py-6 text-gray-500 text-sm">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <span className="text-3xl mb-2 block">\uD83D\uDCCB</span>
          <p className="text-gray-600 font-medium text-sm">No applications yet</p>
          <p className="text-gray-400 text-xs mt-1">Share your job to get more applicants!</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {applications.map(application => (
            <div
              key={application.id}
              className={`rounded-xl border overflow-hidden ${
                application.status === 'pending' ? 'border-blue-100 bg-blue-50/50'
                : application.status === 'accepted' ? 'border-green-100 bg-green-50/50'
                : 'border-gray-100 bg-gray-50/50'
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
                    className="font-semibold text-sm text-gray-900 hover:text-blue-600 truncate block"
                  >
                    {application.applicant_name}
                  </Link>
                </div>
                {application.status === 'pending' && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-100 text-yellow-700 flex-shrink-0">
                    Pending
                  </span>
                )}
                {application.status === 'accepted' && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700 flex-shrink-0">
                    \u2713 Accepted
                  </span>
                )}
              </div>

              {/* Application message */}
              {application.message && (
                <div className="px-3.5 pb-2.5">
                  <p className="text-sm text-gray-600 bg-white/80 rounded-lg px-3 py-2 border border-gray-100/80 leading-relaxed">
                    {application.message}
                  </p>
                </div>
              )}

              {/* Action buttons — full width at bottom */}
              {application.status === 'pending' && (
                <div className="flex border-t border-gray-200/60">
                  <button
                    onClick={() => onAccept(application.id)}
                    disabled={acceptingId === application.id}
                    className="flex-1 py-2.5 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 disabled:text-gray-400 disabled:bg-gray-50 transition-colors border-r border-gray-200/60"
                  >
                    {acceptingId === application.id ? '...' : '\u2713 Accept'}
                  </button>
                  <button
                    onClick={() => onReject(application.id)}
                    disabled={rejectingId === application.id}
                    className="flex-1 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:text-gray-300 transition-colors border-r border-gray-200/60"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => onMessage(application.applicant_id)}
                    className="px-5 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    \uD83D\uDCAC
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
