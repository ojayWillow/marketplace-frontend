import React from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { haptic } from '../../../../../utils/haptics';
import { JOB_COLOR, OFFERING_COLOR } from '../../constants';

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
          
          {/* Grid of options */}
          <View style={styles.modalGrid}>
            {/* POST JOB Card */}
            <TouchableOpacity 
              style={styles.modalCard} 
              onPress={() => { haptic.light(); onCreateJob(); }} 
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#0ea5e9', '#0284c7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalCardGradient}
              />
              <View style={styles.modalCardContent}>
                <View style={styles.modalCardIconContainer}>
                  <Text style={styles.modalCardIcon}>💼</Text>
                </View>
                <Text style={styles.modalCardTitle}>Post a Job</Text>
                <Text style={styles.modalCardSubtitle}>Find someone to help</Text>
              </View>
            </TouchableOpacity>
            
            {/* OFFER SERVICE Card */}
            <TouchableOpacity 
              style={styles.modalCard} 
              onPress={() => { haptic.light(); onCreateService(); }} 
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#f97316', '#ea580c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalCardGradient}
              />
              <View style={styles.modalCardContent}>
                <View style={styles.modalCardIconContainer}>
                  <Text style={styles.modalCardIcon}>⚡</Text>
                </View>
                <Text style={styles.modalCardTitle}>Offer Service</Text>
                <Text style={styles.modalCardSubtitle}>Share your skills</Text>
              </View>
            </TouchableOpacity>
          </View>
          
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
