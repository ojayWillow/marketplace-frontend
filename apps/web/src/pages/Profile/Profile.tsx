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
      <div className="flex flex-col flex-1 bg-gray-50 animate-page-enter">
        {/* Profile Header — with gear icon for settings */}
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
                      {t('profile.backToProfile', 'Back to profile')}
                    </button>
                    <SettingsTab onHowItWorks={() => setShowHowItWorks(true)} />
                  </div>
                ) : (
                  <>
                    {/* Reviews Section — right after header */}
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
    <div className="min-h-screen bg-gray-50 py-6 animate-page-enter">
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
