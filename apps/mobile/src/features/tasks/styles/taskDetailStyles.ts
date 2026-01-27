import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ACCENT_COLOR = '#3B82F6';
export const IMAGE_HEIGHT = 200;

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 16, color: '#6b7280', marginBottom: 16 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 12, paddingBottom: 100 },

  // Hero Card - Contains Posted By + Stats
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: ACCENT_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  
  // TOP ROW
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  urgentBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
  },
  urgentText: {
    fontSize: 12,
  },
  flagIcon: {
    fontSize: 16,
    opacity: 0.5,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: ACCENT_COLOR,
  },
  
  // Title
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 26,
  },

  // User Row - Inside hero card
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: ACCENT_COLOR, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  userInfo: { flex: 1, marginLeft: 10, gap: 2 },
  userName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  userCity: { fontSize: 12, color: '#6b7280' },
  messageBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: ACCENT_COLOR, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  messageBtnText: { fontSize: 18 },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
  statLabel: { 
    fontSize: 9, 
    color: '#9ca3af', 
    marginTop: 2, 
    fontWeight: '600', 
    letterSpacing: 0.5 
  },
  statDivider: { width: 1, height: 24, backgroundColor: '#e5e7eb' },
  difficultyRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  difficultyDot: { width: 8, height: 8, borderRadius: 4 },

  // Image Card
  imageCard: { 
    borderRadius: 12, 
    marginBottom: 10, 
    position: 'relative' 
  },
  taskImage: { width: SCREEN_WIDTH - 24, height: IMAGE_HEIGHT, borderRadius: 12 },
  imageCounter: { 
    position: 'absolute', 
    bottom: 10, 
    right: 10, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 16 
  },
  imageCounterText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },

  // Section Card - Contains Description + Location
  sectionCard: { 
    backgroundColor: '#ffffff', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 2 
  },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#9ca3af', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5, 
    marginBottom: 8 
  },
  descriptionText: { fontSize: 15, color: '#1f2937', lineHeight: 22 },

  // Divider between description and location
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },

  // Location
  locationHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  distanceText: { fontSize: 13, fontWeight: '600', color: ACCENT_COLOR },
  locationAddress: { fontSize: 14, color: '#1f2937', marginBottom: 10 },
  mapBtn: { 
    backgroundColor: '#eff6ff', 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 10, 
    alignSelf: 'flex-start' 
  },
  mapBtnText: { fontSize: 13, fontWeight: '600', color: ACCENT_COLOR },

  // Notices
  noticeCard: { borderRadius: 10, padding: 12, marginBottom: 10 },
  noticeInfo: { backgroundColor: '#dbeafe' },
  noticeWarning: { backgroundColor: '#fef3c7' },
  noticeSuccess: { backgroundColor: '#dcfce7' },
  noticeText: { fontSize: 13, fontWeight: '500', color: '#1f2937', textAlign: 'center' },

  // Bottom Bar
  bottomBar: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#ffffff', 
    padding: 12, 
    paddingBottom: 30, 
    borderTopWidth: 1, 
    borderTopColor: '#e5e7eb', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: -4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 12, 
    elevation: 10 
  },
  primaryBtn: { borderRadius: 12 },
  btnContent: { paddingVertical: 6 },
  btnLabel: { fontSize: 16, fontWeight: '700' },
  dangerBtn: { borderColor: '#fecaca' },
  successBtn: { backgroundColor: '#10b981' },
  ownerActions: { gap: 8 },
  ownerBtnRow: { flexDirection: 'row', gap: 8 },
  halfBtn: { flex: 1, borderRadius: 12 },

  // Celebrate / Review Prompt
  celebrateIcon: { fontSize: 64, marginBottom: 16 },
  celebrateTitle: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 },
  celebrateText: { fontSize: 16, color: '#6b7280', marginBottom: 24 },
  celebrateButtons: { flexDirection: 'row', gap: 12 },
});
