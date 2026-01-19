// Core client
export { apiClient, default as api } from './client';

// API types (export from api/types.ts only, not the root types)
export type {
  ApiError,
  PaginatedResponse,
  LoginCredentials,
  RegisterData,
  User,
  Listing,
  CreateListingData,
} from './types';

// Auth
export { login, register, getCurrentUser, logout } from './auth';

// Favorites
export {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkIsFavorite,
} from './favorites';

// Geocoding
export {
  reverseGeocode,
  searchAddress,
  type GeocodingResult,
  type ReverseGeocodeResult,
} from './geocoding';

// Listings
export {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
} from './listings';

// Messages
export {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount as getUnreadMessagesCount,
  markAsRead as markMessagesAsRead,
  getOrCreateConversation,
  type Conversation,
  type Message,
} from './messages';

// Notifications
export {
  getNotifications,
  getUnreadCount as getUnreadNotificationsCount,
  markAsRead as markNotificationAsRead,
  markAllAsRead as markAllNotificationsAsRead,
  type Notification,
} from './notifications';

// Offerings
export {
  getOfferings,
  getOffering,
  createOffering,
  updateOffering,
  deleteOffering,
  getOfferingsByUser,
  type Offering,
  type OfferingsResponse,
  type CreateOfferingData,
} from './offerings';

// Push notifications
export {
  registerPushToken,
  unregisterPushToken,
  sendTestNotification,
} from './push';

// Reviews
export { getReviewsForUser, createReview } from './reviews';

// Task responses
export {
  createTaskResponse,
  updateTaskResponseStatus,
} from './taskResponses';

// Tasks
export {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTasksByUser,
  getMyTasks,
  getAppliedTasks,
  getTaskResponses,
  acceptTaskResponse,
  rejectTaskResponse,
  completeTask,
  type Task,
  type TasksResponse,
  type TaskResponse,
  type CreateTaskData,
} from './tasks';

// Uploads
export {
  uploadImage,
  uploadImages,
  deleteImage,
  getImageUrl,
  type UploadResponse,
} from './uploads';

// Users
export { getUserProfile, updateUserProfile, type UserProfile } from './users';
