import { useTranslation } from 'react-i18next';
import { TaskCard } from '../../Tasks/components/TaskCard';
import { OfferingCard } from '../../Tasks/components/OfferingCard';
import { ActiveTab } from '../hooks';

interface ItemListsProps {
  activeTab: ActiveTab;
  filteredTasks: any[];
  filteredOfferings: any[];
  userLocation: { lat: number; lng: number };
  hasActiveFilters: boolean;
  isAuthenticated: boolean;
  isJobMatchingMyOfferings: (category: string) => boolean;
}

const ItemLists = ({
  activeTab, filteredTasks, filteredOfferings, userLocation,
  hasActiveFilters, isAuthenticated, isJobMatchingMyOfferings,
}: ItemListsProps) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Jobs List */}
      {(activeTab === 'all' || activeTab === 'jobs') && (
        <div className="mb-8">
          {activeTab === 'all' && (
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              \uD83D\uDCB0 {t('tasks.availableJobs', 'Available Jobs')}
            </h2>
          )}
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500 text-lg mb-2">{t('tasks.noJobsFound', 'No jobs found')}</p>
              <p className="text-gray-400">
                {hasActiveFilters
                  ? t('tasks.tryDifferentFilters', 'Try adjusting your filters')
                  : t('tasks.checkBackLater', 'Check back later')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  userLocation={userLocation}
                  isMatching={isAuthenticated && isJobMatchingMyOfferings(task.category)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Offerings List */}
      {(activeTab === 'all' || activeTab === 'offerings') && (
        <div>
          {activeTab === 'all' && (
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              \uD83D\uDC4B {t('offerings.availableServices', 'Available Services')}
            </h2>
          )}
          {filteredOfferings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500 text-lg mb-2">{t('offerings.noOfferingsFound', 'No services found')}</p>
              <p className="text-gray-400">
                {hasActiveFilters
                  ? t('tasks.tryDifferentFilters', 'Try adjusting your filters')
                  : t('offerings.checkBackLater', 'Check back later')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOfferings.map((offering) => (
                <OfferingCard key={offering.id} offering={offering} userLocation={userLocation} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ItemLists;
