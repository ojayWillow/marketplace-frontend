// Core client
export { apiClient, default as api } from './client';

// API modules - export the api objects
export { authApi } from './auth';
export * from './favorites';
export * from './geocoding';
export * from './listings';
export * from './messages';
export * from './notifications';
export * from './offerings';
export * from './push';
export * from './reviews';
export * from './taskResponses';
export * from './tasks';
export * from './uploads';
export * from './users';

// Re-export types from api/types.ts
export * from './types';
