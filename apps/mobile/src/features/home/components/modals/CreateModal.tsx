import React from 'react';
import { Modal, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { haptic } from '../../../../../utils/haptics';
import { useThemeStore } from '../../../../stores/themeStore';
import { useLanguageStore } from '../../../../stores/languageStore';
import { colors } from '../../../../theme';

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
  const { getActiveTheme } = useThemeStore();
  const { t } = useLanguageStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];

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
      backgroundColor: themeColors.card,
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
      color: themeColors.text,
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 15,
      color: themeColors.textSecondary,
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
      color: themeColors.textSecondary,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={localStyles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => { haptic.soft(); onClose(); }} />
        
        <View style={localStyles.container}>
          {/* Header */}
          <Text style={localStyles.title}>{t('home.createModal.title')}</Text>
          <Text style={localStyles.subtitle}>{t('home.createModal.subtitle')}</Text>
          
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
              <Text style={localStyles.optionTitle}>{t('home.createModal.postJob')}</Text>
              <Text style={localStyles.optionDesc}>{t('home.createModal.postJobDesc')}</Text>
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
              <Text style={localStyles.optionTitle}>{t('home.createModal.offerService')}</Text>
              <Text style={localStyles.optionDesc}>{t('home.createModal.offerServiceDesc')}</Text>
            </View>
            <Text style={localStyles.arrow}>›</Text>
          </TouchableOpacity>
          
          {/* Cancel */}
          <TouchableOpacity 
            style={localStyles.cancelButton} 
            onPress={() => { haptic.soft(); onClose(); }}
            activeOpacity={0.7}
          >
            <Text style={localStyles.cancelText}>{t('home.createModal.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
