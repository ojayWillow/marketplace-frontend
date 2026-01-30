import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, useTheme, Snackbar, Card } from 'react-native-paper';
import { authApi, useAuthStore } from '@marketplace/shared';
import Constants from 'expo-constants';
import { haptic } from '../../_utils/haptics';
import { useThemeStore } from '../../src/stores/themeStore';
import { colors } from '../../src/theme';
import { Video, ResizeMode, Audio } from 'expo-av';
import { useRef } from 'react';
import { useTranslation } from '../../src/hooks/useTranslation';

// Check if phone auth is available (not in Expo Go)
const isExpoGo = Constants.appOwnership === 'expo';
const isPhoneAuthAvailable = !isExpoGo;

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const theme = useTheme();
  const { getActiveTheme } = useThemeStore();
  const activeTheme = getActiveTheme();
  const themeColors = colors[activeTheme];
  const videoRef = useRef(null);

  // Configure audio session for video playback with sound
  useEffect(() => {
    async function setupAudio() {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.error('Error setting up audio:', error);
      }
    }
    setupAudio();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      haptic.warning();
      setError(t.auth.login.errorNoCredentials);
      return;
    }

    setLoading(true);
    setError('');
    haptic.medium();

    try {
      const response = await authApi.login({ email: email.trim(), password });
      const token = response.access_token || (response as any).token;
      
      if (!token) {
        haptic.error();
        setError(t.auth.login.errorNoToken);
        return;
      }
      
      haptic.success();
      setAuth(response.user, token);
      
      // Check if user needs onboarding
      if (response.user && response.user.onboarding_completed === false) {
        router.replace('/onboarding/welcome');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      haptic.error();
      const message = error.response?.data?.message || t.auth.login.errorGeneric;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    haptic.light();
    router.push('/(auth)/forgot-password');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    videoBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 60,
      alignItems: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 32,
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: 16,
      borderRadius: 60,
    },
    brandTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 8,
      letterSpacing: 1,
      color: '#ffffff',
    },
    subtitle: {
      fontSize: 14,
      marginBottom: 48,
      color: 'rgba(255, 255, 255, 0.7)',
      textAlign: 'center',
    },
    formContainer: {
      width: '100%',
    },
    infoBanner: {
      marginBottom: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    infoBannerText: {
      color: '#000000',
      lineHeight: 20,
    },
    input: {
      marginBottom: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    forgotButton: {
      alignSelf: 'flex-end',
      marginBottom: 24,
    },
    loginButton: {
      borderRadius: 12,
      marginBottom: 16,
      backgroundColor: themeColors.primaryAccent,
    },
    buttonContent: {
      paddingVertical: 8,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 16,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    dividerText: {
      marginHorizontal: 16,
      color: '#ffffff',
    },
    phoneButton: {
      borderRadius: 12,
      marginBottom: 16,
      borderColor: '#ffffff',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    registerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    registerText: {
      color: '#ffffff',
    },
    guestButton: {
      marginTop: 16,
    },
  });

  return (
    <View style={styles.container}>
      {/* Background Video with Audio Enabled */}
      <Video
        ref={videoRef}
        style={styles.videoBackground}
        source={require('../../assets/background-video.mov')}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted={false}
        volume={1.0}
        rate={1.0}
        audioMode={{
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        }}
      />
      
      {/* Dark overlay */}
      <View style={styles.overlay} />

      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.content}>
              {/* Logo and Brand Name */}
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/kolabsmall.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.brandTitle}>
                  {t.auth.login.title}
                </Text>
                <Text style={styles.subtitle}>
                  {t.auth.login.subtitle}
                </Text>
              </View>

              {/* Form Container */}
              <View style={styles.formContainer}>
                {isExpoGo && (
                  <Card style={styles.infoBanner} elevation={0}>
                    <Card.Content>
                      <Text variant="bodySmall" style={styles.infoBannerText}>
                        📱 Running in Expo Go - Email login only. Phone authentication will be available in production builds.
                      </Text>
                    </Card.Content>
                  </Card>
                )}

                <TextInput
                  label={t.auth.login.emailLabel}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  disabled={loading}
                  mode="outlined"
                  style={styles.input}
                  outlineColor="rgba(255, 255, 255, 0.5)"
                  activeOutlineColor={themeColors.primaryAccent}
                  textColor="#000000"
                  placeholderTextColor="#666666"
                  left={<TextInput.Icon icon="email" color={themeColors.primaryAccent} />}
                />

                <TextInput
                  label={t.auth.login.passwordLabel}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  disabled={loading}
                  mode="outlined"
                  style={styles.input}
                  outlineColor="rgba(255, 255, 255, 0.5)"
                  activeOutlineColor={themeColors.primaryAccent}
                  textColor="#000000"
                  placeholderTextColor="#666666"
                  left={<TextInput.Icon icon="lock" color={themeColors.primaryAccent} />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      color="#666666"
                      onPress={() => { haptic.soft(); setShowPassword(!showPassword); }}
                    />
                  }
                />

                <Button
                  mode="text"
                  onPress={handleForgotPassword}
                  disabled={loading}
                  style={styles.forgotButton}
                  textColor="#ffffff"
                >
                  {t.auth.login.forgotPassword}
                </Button>

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                  style={styles.loginButton}
                  contentStyle={styles.buttonContent}
                  buttonColor={themeColors.primaryAccent}
                  textColor="#ffffff"
                >
                  {loading ? t.auth.login.signInLoading : t.auth.login.signIn}
                </Button>

                {isPhoneAuthAvailable && (
                  <>
                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text variant="bodySmall" style={styles.dividerText}>
                        {t.common.next || 'or'}
                      </Text>
                      <View style={styles.dividerLine} />
                    </View>

                    <Link href="/(auth)/phone" asChild>
                      <Button
                        mode="outlined"
                        disabled={loading}
                        style={styles.phoneButton}
                        contentStyle={styles.buttonContent}
                        icon="phone"
                        textColor="#ffffff"
                        onPress={() => haptic.light()}
                      >
                        {t.auth.phone.signIn}
                      </Button>
                    </Link>
                  </>
                )}

                <View style={styles.registerRow}>
                  <Text variant="bodyMedium" style={styles.registerText}>
                    {t.auth.login.noAccount + ' '}
                  </Text>
                  <Link href="/(auth)/register" asChild>
                    <Button 
                      mode="text" 
                      disabled={loading} 
                      compact 
                      textColor="#ffffff"
                      onPress={() => haptic.light()}
                    >
                      {t.auth.login.signUp}
                    </Button>
                  </Link>
                </View>

                <Link href="/(tabs)" asChild>
                  <Button 
                    mode="text" 
                    disabled={loading} 
                    style={styles.guestButton} 
                    textColor="rgba(255, 255, 255, 0.7)"
                    onPress={() => haptic.light()}
                  >
                    {t.auth.login.browseGuest}
                  </Button>
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={4000}
        action={{
          label: t.common.dismiss,
          onPress: () => { haptic.soft(); setError(''); },
        }}
      >
        {error}
      </Snackbar>
    </View>
  );
}
