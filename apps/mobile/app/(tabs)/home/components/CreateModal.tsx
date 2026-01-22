import React from 'react';
import { View, Modal, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { haptic } from '../../../../../utils/haptics';
import { styles } from '../styles';

interface CreateModalProps {
  visible: boolean;
  onCreateJob: () => void;
  onCreateService: () => void;
  onClose: () => void;
}

export const CreateModal: React.FC<CreateModalProps> = ({
  visible,
  onCreateJob,
  onCreateService,
  onClose,
}) => {
  const handleClose = () => {
    haptic.soft();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleClose}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>What do you want to create?</Text>
          
          <TouchableOpacity style={styles.modalOption} onPress={onCreateJob} activeOpacity={0.7}>
            <Text style={styles.modalOptionIcon}>💼</Text>
            <View style={styles.modalOptionText}>
              <Text style={styles.modalOptionTitle}>Post a Job</Text>
              <Text style={styles.modalOptionSubtitle}>Find someone to help you</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.modalOption} onPress={onCreateService} activeOpacity={0.7}>
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
