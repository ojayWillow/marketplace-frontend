import { StyleSheet } from 'react-native';
import { colors } from '../../../theme';

const JOB_COLOR = '#0ea5e9';

export const createStyles = (theme: 'light' | 'dark') => {
  const themeColors = colors[theme];
  
  return StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: themeColors.backgroundSecondary,
    },
    
    // Compact Header
    header: { 
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: themeColors.card,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
      position: 'relative',
    },
    
    // Tab Pills - Centered
    tabsWrapper: {
      flex: 1,
      alignItems: 'center',
    },
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: themeColors.backgroundSecondary,
      borderRadius: 20,
      padding: 3,
    },
    tabPill: {
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 17,
      minWidth: 70,
      alignItems: 'center',
    },
    tabPillActive: {
      backgroundColor: JOB_COLOR,
    },
    tabPillText: {
      fontSize: 14,
      fontWeight: '600',
      color: themeColors.textSecondary,
    },
    tabPillTextActive: {
      color: '#ffffff',
    },
    
    // Filter Button - Positioned Right
    filterButton: {
      position: 'absolute',
      right: 16,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: themeColors.backgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterButtonActive: {
      backgroundColor: '#e0f2fe',
    },
    filterIcon: {
      fontSize: 18,
      color: themeColors.text,
    },
    filterDot: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: JOB_COLOR,
      borderWidth: 1.5,
      borderColor: themeColors.card,
    },
    
    // Active Filter Banner
    activeFilterBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#e0f2fe',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      marginBottom: 12,
    },
    activeFilterContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    activeFilterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    difficultyDotSmall: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    activeFilterText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#0369a1',
    },
    clearFilterButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: JOB_COLOR,
      alignItems: 'center',
      justifyContent: 'center',
    },
    clearFilterText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    
    listContent: { 
      padding: 16 
    },
    centerContainer: { 
      alignItems: 'center', 
      paddingVertical: 48 
    },
    loadingText: { 
      marginTop: 12, 
      color: themeColors.textSecondary,
    },
    emptyText: { 
      marginTop: 12, 
      color: themeColors.textSecondary,
      fontSize: 16,
      fontWeight: '500',
    },
    emptySubtext: {
      marginTop: 4,
      color: themeColors.textMuted,
      fontSize: 14,
    },
    errorText: { 
      color: '#ef4444', 
      marginBottom: 12 
    },
    emptyIcon: { 
      fontSize: 48 
    },
    
    fabSpacer: { 
      height: 80 
    },
    
    // GRADIENT FAB - Custom
    fabContainer: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      width: 56,
      height: 56,
      borderRadius: 28,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    fabButton: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    fabIcon: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#ffffff',
      zIndex: 2,
    },
    
    // Modal Styles
    modalOverlay: { 
      flex: 1, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modalContent: { 
      backgroundColor: themeColors.card,
      borderRadius: 20, 
      padding: 24, 
      width: '100%',
      maxWidth: 400,
    },
    modalTitle: { 
      fontSize: 20,
      fontWeight: 'bold', 
      color: themeColors.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    modalOption: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      padding: 16, 
      borderRadius: 12, 
      marginBottom: 12,
      overflow: 'hidden',
    },
    modalOptionIcon: { 
      fontSize: 32, 
      marginRight: 16,
      zIndex: 2,
    },
    modalOptionTextWrapper: { 
      flex: 1,
      zIndex: 2,
    },
    modalOptionTitle: { 
      fontSize: 16, 
      fontWeight: '600', 
      color: '#ffffff',
    },
    modalOptionDesc: { 
      fontSize: 13, 
      color: 'rgba(255,255,255,0.9)',
      marginTop: 2 
    },
    cancelButton: { 
      marginTop: 8 
    },
    
    // Filter Modal
    filterModalContent: {
      backgroundColor: themeColors.card,
      borderRadius: 20,
      padding: 20,
      width: '100%',
      maxWidth: 400,
      maxHeight: '85%',
    },
    filterModalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: themeColors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    filterSectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: themeColors.textSecondary,
      marginTop: 8,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    
    // Difficulty Segment Control
    segmentContainer: {
      flexDirection: 'row',
      backgroundColor: themeColors.backgroundSecondary,
      borderRadius: 12,
      padding: 4,
      marginBottom: 16,
    },
    segmentButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 10,
      gap: 6,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    segmentButtonActive: {
      backgroundColor: themeColors.card,
    },
    segmentDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    segmentText: {
      fontSize: 13,
      fontWeight: '500',
      color: themeColors.textSecondary,
    },
    
    // Category ScrollView
    categoryScrollView: {
      maxHeight: 280,
    },
    
    // FLEXIBLE WRAP PILLS
    categoryWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.backgroundSecondary,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: themeColors.border,
    },
    categoryPillActive: {
      backgroundColor: '#e0f2fe',
      borderColor: JOB_COLOR,
    },
    categoryPillIcon: {
      fontSize: 16,
      marginRight: 6,
    },
    categoryPillLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: themeColors.text,
    },
    categoryPillLabelActive: {
      color: '#0369a1',
      fontWeight: '700',
    },
    categoryPillCheck: {
      fontSize: 14,
      color: JOB_COLOR,
      fontWeight: 'bold',
      marginLeft: 6,
    },
    
    // Filter Actions
    filterActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    clearFiltersButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: themeColors.backgroundSecondary,
      alignItems: 'center',
    },
    clearFiltersText: {
      fontSize: 15,
      fontWeight: '600',
      color: themeColors.textSecondary,
    },
    applyFiltersButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: JOB_COLOR,
      alignItems: 'center',
    },
    applyFiltersText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#ffffff',
    },
  });
};
