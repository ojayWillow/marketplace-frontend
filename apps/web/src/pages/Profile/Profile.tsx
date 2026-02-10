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

  // How it works modal
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Data management
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

  // Tab state management
  const {
    activeTab,
    taskViewMode,
    taskStatusFilter,
    setActiveTab,
    setTaskViewMode,
    setTaskStatusFilter,
  } = useProfileTabs();

  // Avatar picker
  const avatarPicker = useAvatarPicker({
    initialSeed: profile?.username || '',
    setFormData,
  });

  // Mobile activity toggle
  const [mobileActivityMode, setMobileActivityMode] = useState<'jobs' | 'services'>('jobs');

  // Mobile reviews expansion
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Mobile settings view — use local state for reliability
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  // Update avatar seed when profile loads
  useEffect(() => {
    if (profile?.username) {
      avatarPicker.setAvatarSeed(profile.username);
    }
  }, [profile?.username]);

  // Actions
  const actions = useProfileActions({
    setMyListings,
    setMyOfferings,
    setReviews,
    fetchTasks,
    fetchApplications,
  });

  // Helper to update formData fields directly (for skills, country+city reset, etc.)
  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleOpenMobileSettings = () => {
    setShowMobileSettings(true);
  };

  const handleCloseMobileSettings = () => {
    setShowMobileSettings(false);
  };

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (!profile) {
    return <ErrorState />;
  }

  // Calculate counts and stats
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

  // Content checks
  const hasListings = myListings.length > 0;
  const hasOfferings = myOfferings.length > 0;
  const hasTasks = createdTasks.length > 0 || myApplications.length > 0;
  const hasReviews = reviews.length > 0;

  // Mobile: flex layout that fills the space from fullscreen Layout
  if (isMobile) {
    return (
      <div className="flex flex-col flex-1 bg-gray-50">
        {/* Profile Header */}
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
          />
        </div>

        {/* Avatar Picker Modal */}
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

        {/* How It Works Modal */}
        <CommunityRulesModal
          isOpen={showHowItWorks}
          onClose={() => setShowHowItWorks(false)}
          showCheckboxes={false}
        />

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-4 space-y-4">
            {/* About Tab edit form - show on mobile when editing */}
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
                {/* Show SettingsTab when active on mobile */}
                {showMobileSettings ? (
                  <div>
                    <button
                      onClick={handleCloseMobileSettings}
                      className="flex items-center gap-1 text-sm text-blue-600 mb-4 hover:text-blue-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to profile
                    </button>
                    <SettingsTab />
                  </div>
                ) : (
                  <>
                    {/* How It Works + Settings row */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowHowItWorks(true)}
                        className="flex-1 flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <span className="text-lg">❓</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {t('quickHelp.howItWorks', 'How it works')}
                          </span>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      <button
                        onClick={handleOpenMobileSettings}
                        className="flex-1 flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-900">Settings</span>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Reviews Section */}
                    <MobileReviewsSection
                      reviews={reviews}
                      showAll={showAllReviews}
                      onToggleShowAll={() => setShowAllReviews(!showAllReviews)}
                      currentUserId={user?.id}
                      onDeleteReview={actions.handleDeleteReview}
                      setReviews={setReviews}
                    />

                    {/* Listings Teaser */}
                    <MobileListingsTeaser />

                    {/* Activity Section */}
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

  // ========== DESKTOP LAYOUT (>= md) ==========
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
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

        {/* Avatar Picker Modal */}
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

        {/* How It Works Modal */}
        <CommunityRulesModal
          isOpen={showHowItWorks}
          onClose={() => setShowHowItWorks(false)}
          showCheckboxes={false}
        />

        {/* About Tab edit form */}
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

        {/* Tabs */}
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

        {/* Tab Content */}
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
