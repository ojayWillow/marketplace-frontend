import React from 'react';
import { Modal, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
}: CreateModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={localStyles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => { haptic.soft(); onClose(); }} />
        
        <View style={localStyles.container}>
          {/* Header */}
          <Text style={localStyles.title}>Create</Text>
          <Text style={localStyles.subtitle}>What would you like to do?</Text>
          
          {/* POST JOB */}
          <TouchableOpacity 
            style={localStyles.optionCard} 
            onPress={() => { haptic.light(); onCreateJob(); }} 
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#0ea5e9', '#0369a1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={localStyles.optionGradient}
            />
            <View style={localStyles.iconCircle}>
              <Text style={localStyles.icon}>💼</Text>
            </View>
            <View style={localStyles.optionContent}>
              <Text style={localStyles.optionTitle}>Post a Job</Text>
              <Text style={localStyles.optionDesc}>Find someone to help you with a task</Text>
            </View>
            <Text style={localStyles.arrow}>›</Text>
          </TouchableOpacity>
          
          {/* OFFER SERVICE */}
          <TouchableOpacity 
            style={localStyles.optionCard} 
            onPress={() => { haptic.light(); onCreateService(); }} 
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#f97316', '#c2410c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={localStyles.optionGradient}
            />
            <View style={localStyles.iconCircle}>
              <Text style={localStyles.icon}>⚡</Text>
            </View>
            <View style={localStyles.optionContent}>
              <Text style={localStyles.optionTitle}>Offer a Service</Text>
              <Text style={localStyles.optionDesc}>Share your skills and earn money</Text>
            </View>
            <Text style={localStyles.arrow}>›</Text>
          </TouchableOpacity>
          
          {/* Cancel */}
          <TouchableOpacity 
            style={localStyles.cancelButton} 
            onPress={() => { haptic.soft(); onClose(); }}
            activeOpacity={0.7}
          >
            <Text style={localStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 28,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    overflow: 'hidden',
  },
  optionGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 26,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 3,
  },
  optionDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
  },
  arrow: {
    fontSize: 28,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
});
