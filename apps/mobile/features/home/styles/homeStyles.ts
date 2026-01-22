import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // ==================== Layout ====================
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24 
  },
  mapContainer: { 
    flex: 1, 
    position: 'relative' 
  },
  map: { 
    flex: 1 
  },

  // ==================== Status/Error ====================
  statusText: { 
    marginTop: 12, 
    color: '#6b7280', 
    textAlign: 'center' 
  },
  errorText: { 
    color: '#ef4444', 
    marginBottom: 12, 
    textAlign: 'center' 
  },
  retryButton: { 
    backgroundColor: '#3b82f6', 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 8, 
    marginTop: 8 
  },
  retryText: { 
    color: '#ffffff', 
    fontWeight: '600' 
  },

  // ==================== Floating Header ====================
  floatingHeader: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    zIndex: 10 
  },
  filterButtonsContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 12, 
    paddingTop: 8, 
    gap: 8,
    alignItems: 'center',
  },
  filterButton: { 
    flex: 1, 
    borderRadius: 12, 
    overflow: 'hidden' 
  },
  filterButtonBlur: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 14, 
    paddingVertical: 12 
  },
  filterButtonText: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#1f2937', 
    flex: 1 
  },
  filterButtonIcon: { 
    fontSize: 10, 
    color: '#6b7280', 
    marginLeft: 6 
  },
  filterButtonPrefix: {
    fontSize: 14,
    marginRight: 6,
  },

  // ==================== Search Bubble (Compact) ====================
  searchBubble: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchBubbleBlur: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  searchBubbleIcon: {
    fontSize: 20,
  },

  // ==================== Search Bar (Expanded) ====================
  searchBarContainer: { 
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    zIndex: 20,
  },
  searchBarBlur: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 12, 
    overflow: 'hidden' 
  },
  searchIcon: { 
    fontSize: 18, 
    marginRight: 10 
  },
  searchInput: { 
    flex: 1, 
    fontSize: 15, 
    color: '#1f2937', 
    paddingVertical: 0 
  },
  searchClearButton: { 
    marginLeft: 8, 
    padding: 4 
  },
  searchClearIcon: { 
    fontSize: 16, 
    color: '#9ca3af', 
    fontWeight: '600' 
  },
  searchLoader: { 
    marginLeft: 8 
  },

  // ==================== Empty State (Map) ====================
  emptyMapOverlay: { 
    position: 'absolute', 
    top: '40%', 
    left: 24, 
    right: 24, 
    alignItems: 'center' 
  },
  emptyMapCard: { 
    paddingVertical: 20, 
    paddingHorizontal: 28, 
    borderRadius: 16, 
    alignItems: 'center', 
    overflow: 'hidden' 
  },
  emptyMapIcon: { 
    fontSize: 32, 
    marginBottom: 8 
  },
  emptyMapText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#374151' 
  },
  emptyMapSubtext: { 
    fontSize: 14, 
    color: '#6b7280', 
    marginTop: 4 
  },

  // ==================== My Location Button ====================
  myLocationButton: { 
    position: 'absolute', 
    bottom: 100, 
    right: 16, 
    zIndex: 10 
  },
  myLocationBlur: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    alignItems: 'center', 
    justifyContent: 'center', 
    overflow: 'hidden' 
  },
  myLocationIcon: { 
    fontSize: 22 
  },

  // ==================== Map Markers - Coin Cluster ====================
  coinClusterContainer: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinCluster: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FCD34D',
    borderWidth: 3,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  coinEuro: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#92400E',
    textShadowColor: 'rgba(251, 191, 36, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  coinBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#DC2626',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  coinBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  // ==================== Map Markers - User Location ====================
  userMarkerFull: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerHalo: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  userMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  userMarkerSubtle: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.6)',
  },
  userMarkerFar: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerSmallDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },

  // ==================== Map Markers - Price Tags ====================
  priceMarker: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0ea5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  priceMarkerFocused: {
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
  },
  priceMarkerOffering: {
    borderColor: '#f97316',
  },
  priceMarkerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  priceMarkerTextOffering: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f97316',
  },

  // ==================== Bottom Sheet ====================
  bottomSheet: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#ffffff', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: -4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 10 
  },
  sheetHandle: { 
    alignItems: 'center', 
    paddingTop: 12, 
    paddingBottom: 8, 
    paddingHorizontal: 16 
  },
  handleBar: { 
    width: 40, 
    height: 5, 
    backgroundColor: '#d1d5db', 
    borderRadius: 3, 
    marginBottom: 12 
  },
  sheetTitleRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    width: '100%' 
  },
  sheetTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1f2937' 
  },
  closeButton: { 
    margin: -8 
  },
  quickPostButton: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#0ea5e9', 
    width: 32, 
    height: 32, 
    borderRadius: 16 
  },
  quickPostIcon: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#ffffff' 
  },
  listContent: { 
    paddingBottom: 40 
  },

  // ==================== Empty State (Sheet) ====================
  emptySheet: { 
    alignItems: 'center', 
    paddingVertical: 32 
  },
  emptyIcon: { 
    fontSize: 40, 
    marginBottom: 12 
  },
  emptyText: { 
    fontSize: 16, 
    fontWeight: '500', 
    color: '#6b7280' 
  },
  emptySubtext: { 
    fontSize: 14, 
    color: '#9ca3af', 
    marginTop: 4 
  },
  emptyPostButton: { 
    marginTop: 16, 
    backgroundColor: '#0ea5e9', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 20 
  },
  emptyPostText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#ffffff' 
  },

  // ==================== Job List Item ====================
  jobItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 14, 
    paddingHorizontal: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f3f4f6' 
  },
  jobLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  jobCategoryDot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    marginRight: 12 
  },
  jobInfo: { 
    flex: 1 
  },
  jobTitle: { 
    fontSize: 15, 
    fontWeight: '500', 
    color: '#1f2937', 
    marginBottom: 2 
  },
  jobMeta: { 
    fontSize: 13, 
    color: '#9ca3af' 
  },
  jobRight: { 
    alignItems: 'flex-end', 
    marginLeft: 12 
  },
  jobPrice: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#0ea5e9' 
  },
  jobDistance: { 
    fontSize: 12, 
    color: '#9ca3af', 
    marginTop: 2 
  },

  // ==================== Focused Job Details ====================
  focusedJobContainer: { 
    padding: 20 
  },
  focusedJobHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  focusedCategoryBadge: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12 
  },
  focusedCategoryText: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#ffffff', 
    letterSpacing: 0.5 
  },
  focusedDistance: { 
    fontSize: 13, 
    color: '#6b7280', 
    fontWeight: '500' 
  },
  focusedTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1f2937', 
    marginBottom: 10, 
    lineHeight: 26 
  },
  focusedBudgetRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f3f4f6' 
  },
  focusedBudget: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#0ea5e9' 
  },
  focusedMeta: { 
    fontSize: 13, 
    color: '#9ca3af' 
  },
  focusedSection: { 
    marginBottom: 14 
  },
  focusedSectionTitle: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#6b7280', 
    marginBottom: 6, 
    textTransform: 'uppercase', 
    letterSpacing: 0.5 
  },
  focusedDescription: { 
    fontSize: 15, 
    color: '#374151', 
    lineHeight: 22 
  },
  focusedLocation: { 
    fontSize: 14, 
    color: '#374151', 
    lineHeight: 20 
  },
  viewDetailsButton: { 
    marginTop: 16, 
    borderRadius: 12 
  },

  // ==================== Modals ====================
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24 
  },
  modalContent: { 
    backgroundColor: '#ffffff', 
    borderRadius: 20, 
    padding: 24, 
    width: '100%', 
    maxWidth: 400 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1f2937', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  modalOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f9fafb', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12 
  },
  modalOptionIcon: { 
    fontSize: 32, 
    marginRight: 16 
  },
  modalOptionText: { 
    flex: 1 
  },
  modalOptionTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1f2937', 
    marginBottom: 4 
  },
  modalOptionSubtitle: { 
    fontSize: 14, 
    color: '#6b7280' 
  },
  modalCancel: { 
    marginTop: 8, 
    paddingVertical: 14, 
    alignItems: 'center' 
  },
  modalCancelText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#6b7280' 
  },

  // ==================== Filter Modal ====================
  filterModalContent: { 
    backgroundColor: '#ffffff', 
    borderRadius: 20, 
    padding: 24, 
    width: '100%', 
    maxWidth: 400, 
    maxHeight: '70%' 
  },
  filterOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16, 
    paddingHorizontal: 16, 
    borderRadius: 12, 
    marginBottom: 8, 
    backgroundColor: '#f9fafb' 
  },
  filterOptionActive: { 
    backgroundColor: '#e0f2fe' 
  },
  filterOptionIcon: { 
    fontSize: 20, 
    marginRight: 12 
  },
  filterOptionText: { 
    flex: 1, 
    fontSize: 16, 
    color: '#1f2937', 
    fontWeight: '500' 
  },
  filterOptionTextActive: { 
    color: '#0ea5e9', 
    fontWeight: '600' 
  },
  filterOptionCheck: { 
    fontSize: 18, 
    color: '#0ea5e9', 
    fontWeight: 'bold' 
  },
});
