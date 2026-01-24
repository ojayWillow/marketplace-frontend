import React from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { haptic } from '../../../../../utils/haptics';

interface CreateModalProps {
  visible: boolean;
  onCreateJob: () => void;
  onCreateService: () => void;
  onClose: () => void;
  styles: any;
}

export default function CreateModal({ 
  visible, 
  onCreateJob, 
  onCreateService, 
  onClose, 
  styles 
}: CreateModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => { haptic.soft(); onClose(); }}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>What do you want to create?</Text>
          
          {/* POST JOB - Blue Gradient */}
          <TouchableOpacity 
            style={styles.modalOption} 
            onPress={() => { haptic.light(); onCreateJob(); }} 
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#0ea5e9', '#0284c7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 16 }}
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
            onPress={() => { haptic.light(); onCreateService(); }} 
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#f97316', '#ea580c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 16 }}
            />
            <Text style={styles.modalOptionIcon}>⚡</Text>
            <View style={styles.modalOptionText}>
              <Text style={styles.modalOptionTitle}>Offer a Service</Text>
              <Text style={styles.modalOptionSubtitle}>Share your skills</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.modalCancel} 
            onPress={() => { haptic.soft(); onClose(); }}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
