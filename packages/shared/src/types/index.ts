// Types barrel file
// 
// All shared types are now defined in api/types.ts and re-exported
// through the api barrel (src/api/index.ts → src/index.ts).
//
// This file previously contained duplicate/outdated versions of:
//   User, Listing, LoginCredentials, RegisterData, CreateListingData,
//   ApiError, PaginatedResponse, AuthState, ListingCategory,
//   ListingCondition, ListingsFilter, ApiResponse
//
// None of those were imported by the web app from this file.
// See api/types.ts for the canonical type definitions.

export {};
