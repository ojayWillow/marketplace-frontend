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
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        📋 Applications
        <span className="text-base font-normal text-gray-500">({applications.length})</span>
      </h2>

      {applicationsLoading ? (
        <div className="text-center py-8 text-gray-500">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 bg-blue-50 rounded-xl">
          <span className="text-5xl mb-4 block">📋</span>
          <p className="text-gray-700 font-medium">No applications yet</p>
          <p className="text-gray-500 text-sm mt-1">Share your job to get more applicants!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(application => (
            <div 
              key={application.id} 
              className={`border rounded-xl p-4 ${
                application.status === 'pending' ? 'border-blue-200 bg-blue-50' 
                : application.status === 'accepted' ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {application.applicant_avatar ? (
                      <img src={application.applicant_avatar} alt="" className="w-full h-full object-cover"/>
                    ) : (
                      <span className="text-gray-500 font-medium">{application.applicant_name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to={`/users/${application.applicant_id}`} className="font-semibold text-gray-900 hover:text-blue-600">
                        {application.applicant_name}
                      </Link>
                      {application.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Pending</span>
                      )}
                      {application.status === 'accepted' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">✓ Accepted</span>
                      )}
                    </div>
                    {application.message && (
                      <p className="mt-2 text-sm text-gray-600 bg-white p-3 rounded-lg border">{application.message}</p>
                    )}
                  </div>
                </div>
                {application.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button 
                      onClick={() => onAccept(application.id)} 
                      disabled={acceptingId === application.id} 
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-medium text-sm"
                    >
                      {acceptingId === application.id ? '...' : 'Accept'}
                    </button>
                    <button 
                      onClick={() => onReject(application.id)} 
                      disabled={rejectingId === application.id} 
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => onMessage(application.applicant_id)} 
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                    >
                      💬
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
