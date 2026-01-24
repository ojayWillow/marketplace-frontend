import React, { memo } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { haptic } from '../../../../../utils/haptics';
import { colors } from '../../../../../src/theme';

interface CreateModalProps {
  visible: boolean;
  onCreateJob: () => void;
  onCreateService: () => void;
  onClose: () => void;
  themeColors: typeof colors.light;
}

const CreateModalComponent: React.FC<CreateModalProps> = ({
  visible,
  onCreateJob,
  onCreateService,
  onClose,
  themeColors,
}) => {
  const styles = createStyles(themeColors);

  const handleCreateJob = () => {
    haptic.light();
    onCreateJob();
  };

  const handleCreateService = () => {
    haptic.light();
    onCreateService();
  };

  const handleClose = () => {
    haptic.soft();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>What do you want to create?</Text>

          {/* POST JOB - Blue Gradient */}
          <TouchableOpacity
            style={styles.modalOption}
            onPress={handleCreateJob}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#0ea5e9', '#0284c7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBackground}
            />
            <Text style={styles.modalOptionIcon}>💼</Text>
            <View style={styles.modalOptionText}>
              <Text style={styles.modalOptionTitle}>Post a Job</Text>
              <Text style={styles.modalOptionSubtitle}>Find someone to help you</Text>
            </View>
          </TouchableOpacity>

          {/* OFFER SERVICE - Orange Gradient */}
          <TouchableOpacity
            style={styles.modalOption}
            onPress={handleCreateService}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#f97316', '#ea580c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBackground}
            />
            <Text style={styles.modalOptionIcon}>⚡</Text>
            <View style={styles.modalOptionText}>
              <Text style={styles.modalOptionTitle}>Offer a Service</Text>
              <Text style={styles.modalOptionSubtitle}>Share your skills</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalCancel} onPress={handleClose}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export const CreateModal = memo(CreateModalComponent, (prev, next) => {
  return prev.visible === next.visible;
});

const createStyles = (themeColors: typeof colors.light) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    fontWeight: '700',
    color: themeColors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  modalOptionIcon: {
    fontSize: 40,
    marginRight: 20,
    zIndex: 2,
  },
  modalOptionText: {
    flex: 1,
    zIndex: 2,
  },
  modalOptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  modalOptionSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.95)',
  },
  modalCancel: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: themeColors.textSecondary,
  },
});
