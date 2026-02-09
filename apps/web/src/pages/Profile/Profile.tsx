import { useEffect, useState } from 'react';
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

const Profile = () => {
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

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header (both mobile + desktop) */}
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

        {/* About Tab edit form - show on mobile when editing */}
        {editing && (
          <div className="md:hidden mb-4">
            <AboutTab
              profile={profile}
              editing={editing}
              formData={formData}
              onChange={handleChange}
              onFormDataChange={handleFormDataChange}
            />
          </div>
        )}

        {/* ========== MOBILE LAYOUT (< md) ========== */}
        {!editing && (
          <div className="md:hidden space-y-4">
            {/* Reviews Section - inline */}
            <MobileReviewsSection
              reviews={reviews}
              showAll={showAllReviews}
              onToggleShowAll={() => setShowAllReviews(!showAllReviews)}
              currentUserId={user?.id}
              onDeleteReview={actions.handleDeleteReview}
              setReviews={setReviews}
            />

            {/* Activity Section - Jobs + Services combined */}
            <MobileActivitySection
              activeMode={mobileActivityMode}
              onModeChange={setMobileActivityMode}
              // Jobs props
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
              // Services props
              offerings={myOfferings}
              offeringsLoading={offeringsLoading}
              onDeleteOffering={actions.handleDeleteOffering}
              // Notification count
              pendingNotifications={totalPendingApplicationsOnMyTasks}
            />

            {/* Listings Teaser - bottom of mobile profile */}
            <MobileListingsTeaser />
          </div>
        )}

        {/* ========== DESKTOP LAYOUT (>= md) ========== */}
        <div className="hidden md:block">
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
        </div>
      </div>
    </div>
  );
};

export default Profile;
