import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  ProfileHeader,
  AvatarPicker,
  ProfileTabs,
  LoadingState,
  ErrorState,
} from './components';
import {
  AboutTab,
  ListingsTab,
  OfferingsTab,
  TasksTab,
  ReviewsTab,
  SettingsTab,
} from './components/tabs';
import {
  useProfileData,
  useProfileTabs,
  useAvatarPicker,
  useProfileActions,
} from './hooks';
import { MobileReviewsSection } from './components/mobile/MobileReviewsSection';
import { MobileActivitySection } from './components/mobile/MobileActivitySection';
import { MobileListingsTeaser } from './components/mobile/MobileListingsTeaser';
import CommunityRulesModal from '../../components/QuickHelpIntroModal';

const Profile = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const {
    profile,
    reviews,
    setReviews,
    myListings,
    setMyListings,
    myOfferings,
    setMyOfferings,
    createdTasks,
    myApplications,
    taskMatchCounts,
    user,
    loading,
    listingsLoading,
    offeringsLoading,
    tasksLoading,
    applicationsLoading,
    editing,
    setEditing,
    saving,
    formData,
    setFormData,
    handleSave,
    handleChange,
    fetchTasks,
    fetchApplications,
  } = useProfileData();

  const {
    activeTab,
    taskViewMode,
    taskStatusFilter,
    setActiveTab,
    setTaskViewMode,
    setTaskStatusFilter,
  } = useProfileTabs();

  const avatarPicker = useAvatarPicker({
    initialSeed: profile?.username || '',
    setFormData,
  });

  const [mobileActivityMode, setMobileActivityMode] = useState<'jobs' | 'services'>('jobs');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  useEffect(() => {
    if (profile?.username) {
      avatarPicker.setAvatarSeed(profile.username);
    }
  }, [profile?.username]);

  const actions = useProfileActions({
    setMyListings,
    setMyOfferings,
    setReviews,
    fetchTasks,
    fetchApplications,
  });

  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleOpenMobileSettings = () => {
    setShowMobileSettings(true);
  };

  const handleCloseMobileSettings = () => {
    setShowMobileSettings(false);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!profile) {
    return <ErrorState />;
  }

  const myTasksCount = createdTasks.length;
  const myJobsCount = myApplications.filter(app => app.status === 'accepted').length;
  const totalPendingApplicationsOnMyTasks = createdTasks.reduce((sum, task) => {
    return sum + (task.pending_applications_count || 0);
  }, 0);

  const tasksCompletedAsWorker = myApplications.filter(app => 
    app.status === 'accepted' && app.task?.status === 'completed'
  ).length;
  const tasksCompletedAsCreator = createdTasks.filter(t => t.status === 'completed').length;
  const totalTasksCompleted = tasksCompletedAsWorker + tasksCompletedAsCreator;

  const hasListings = myListings.length > 0;
  const hasOfferings = myOfferings.length > 0;
  const hasTasks = createdTasks.length > 0 || myApplications.length > 0;
  const hasReviews = reviews.length > 0;

  // Mobile layout
  if (isMobile) {
    return (
      <div className="flex flex-col flex-1 bg-gray-50 dark:bg-gray-950 animate-page-enter">
        <div className="flex-shrink-0">
          <ProfileHeader
            profile={profile}
            formData={formData}
            editing={editing}
            saving={saving}
            totalTasksCompleted={totalTasksCompleted}
            onEdit={() => setEditing(true)}
            onCancel={() => setEditing(false)}
            onSave={handleSave}
            onChangeAvatar={() => avatarPicker.setShowAvatarPicker(true)}
            onOpenSettings={handleOpenMobileSettings}
          />
        </div>

        <AvatarPicker
          isOpen={avatarPicker.showAvatarPicker}
          onClose={() => avatarPicker.setShowAvatarPicker(false)}
          selectedStyle={avatarPicker.selectedAvatarStyle}
          onStyleChange={avatarPicker.setSelectedAvatarStyle}
          seed={avatarPicker.avatarSeed}
          onSeedChange={avatarPicker.setAvatarSeed}
          onRandomize={avatarPicker.handleRandomizeSeed}
          onSelect={avatarPicker.handleSelectGeneratedAvatar}
          uploading={avatarPicker.uploadingAvatar}
          onFileUpload={avatarPicker.handleFileUpload}
          onTriggerFileInput={avatarPicker.triggerFileInput}
          fileInputRef={avatarPicker.fileInputRef}
        />

        <CommunityRulesModal
          isOpen={showHowItWorks}
          onClose={() => setShowHowItWorks(false)}
          showCheckboxes={false}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-4 space-y-4">
            {editing && (
              <AboutTab
                profile={profile}
                editing={editing}
                formData={formData}
                onChange={handleChange}
                onFormDataChange={handleFormDataChange}
              />
            )}

            {!editing && (
              <>
                {showMobileSettings ? (
                  <div>
                    <button
                      onClick={handleCloseMobileSettings}
                      className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 mb-4 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      {t('profile.backToProfile', 'Back to profile')}
                    </button>
                    <SettingsTab onHowItWorks={() => setShowHowItWorks(true)} />
                  </div>
                ) : (
                  <>
                    <MobileReviewsSection
                      reviews={reviews}
                      showAll={showAllReviews}
                      onToggleShowAll={() => setShowAllReviews(!showAllReviews)}
                      currentUserId={user?.id}
                      onDeleteReview={actions.handleDeleteReview}
                      setReviews={setReviews}
                    />

                    <MobileListingsTeaser />

                    <MobileActivitySection
                      activeMode={mobileActivityMode}
                      onModeChange={setMobileActivityMode}
                      createdTasks={createdTasks}
                      myApplications={myApplications}
                      taskMatchCounts={taskMatchCounts}
                      tasksLoading={tasksLoading}
                      applicationsLoading={applicationsLoading}
                      taskViewMode={taskViewMode}
                      taskStatusFilter={taskStatusFilter}
                      onViewModeChange={setTaskViewMode}
                      onStatusFilterChange={setTaskStatusFilter}
                      onCancelTask={actions.handleCancelTask}
                      onTaskConfirmed={fetchTasks}
                      userId={user?.id}
                      offerings={myOfferings}
                      offeringsLoading={offeringsLoading}
                      onDeleteOffering={actions.handleDeleteOffering}
                      pendingNotifications={totalPendingApplicationsOnMyTasks}
                    />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-6 animate-page-enter">
      <div className="max-w-4xl mx-auto px-4">
        <ProfileHeader
          profile={profile}
          formData={formData}
          editing={editing}
          saving={saving}
          totalTasksCompleted={totalTasksCompleted}
          onEdit={() => setEditing(true)}
          onCancel={() => setEditing(false)}
          onSave={handleSave}
          onChangeAvatar={() => avatarPicker.setShowAvatarPicker(true)}
        />

        <AvatarPicker
          isOpen={avatarPicker.showAvatarPicker}
          onClose={() => avatarPicker.setShowAvatarPicker(false)}
          selectedStyle={avatarPicker.selectedAvatarStyle}
          onStyleChange={avatarPicker.setSelectedAvatarStyle}
          seed={avatarPicker.avatarSeed}
          onSeedChange={avatarPicker.setAvatarSeed}
          onRandomize={avatarPicker.handleRandomizeSeed}
          onSelect={avatarPicker.handleSelectGeneratedAvatar}
          uploading={avatarPicker.uploadingAvatar}
          onFileUpload={avatarPicker.handleFileUpload}
          onTriggerFileInput={avatarPicker.triggerFileInput}
          fileInputRef={avatarPicker.fileInputRef}
        />

        <CommunityRulesModal
          isOpen={showHowItWorks}
          onClose={() => setShowHowItWorks(false)}
          showCheckboxes={false}
        />

        {editing && (
          <div className="mb-4">
            <AboutTab
              profile={profile}
              editing={editing}
              formData={formData}
              onChange={handleChange}
              onFormDataChange={handleFormDataChange}
            />
          </div>
        )}

        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={{
            tasks: myTasksCount + myJobsCount,
            offerings: myOfferings.length,
            listings: myListings.length,
            reviews: reviews.length,
            pendingNotifications: totalPendingApplicationsOnMyTasks,
          }}
          hasContent={{
            tasks: hasTasks,
            offerings: hasOfferings,
            listings: hasListings,
            reviews: hasReviews,
          }}
        />

        {activeTab === 'about' && (
          <AboutTab
            profile={profile}
            editing={editing}
            formData={formData}
            onChange={handleChange}
            onFormDataChange={handleFormDataChange}
          />
        )}

        {activeTab === 'listings' && (
          <ListingsTab
            listings={myListings}
            loading={listingsLoading}
            onDelete={actions.handleDeleteListing}
          />
        )}

        {activeTab === 'offerings' && (
          <OfferingsTab
            offerings={myOfferings}
            loading={offeringsLoading}
            onDelete={actions.handleDeleteOffering}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksTab
            createdTasks={createdTasks}
            myApplications={myApplications}
            taskMatchCounts={taskMatchCounts}
            tasksLoading={tasksLoading}
            applicationsLoading={applicationsLoading}
            taskViewMode={taskViewMode}
            taskStatusFilter={taskStatusFilter}
            onViewModeChange={setTaskViewMode}
            onStatusFilterChange={setTaskStatusFilter}
            onCancelTask={actions.handleCancelTask}
            onTaskConfirmed={fetchTasks}
            userId={user?.id}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewsTab
            reviews={reviews}
            currentUserId={user?.id}
            onDeleteReview={actions.handleDeleteReview}
            setReviews={setReviews}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            onHowItWorks={() => setShowHowItWorks(true)}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;
