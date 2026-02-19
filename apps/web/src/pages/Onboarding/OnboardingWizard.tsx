import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { useAuthStore, apiClient as api } from '@marketplace/shared'
import StepBasicInfo from './StepBasicInfo'
import StepSkills from './StepSkills'
import StepNotifications from './StepNotifications'
import StepPhoneVerify from './StepPhoneVerify'
import StepHomeScreen from './StepHomeScreen'

const TOTAL_STEPS = 5

export default function OnboardingWizard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, token, setAuth } = useAuthStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Profile data collected across steps
  const [profileData, setProfileData] = useState({
    username: user?.username?.startsWith('user_') ? '' : (user?.username || ''),
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    country: user?.country || '',
    city: user?.city || '',
    avatar_url: user?.avatar_url || user?.profile_picture_url || '',
    skills: (user?.helper_categories?.split(',').filter(Boolean)) || [] as string[],
  })

  // If already onboarded, redirect home
  useEffect(() => {
    if (user?.onboarding_completed) {
      navigate('/', { replace: true })
    }
  }, [user?.onboarding_completed, navigate])

  const updateData = (partial: Record<string, unknown>) => {
    setProfileData(prev => ({ ...prev, ...partial }))
  }

  // Determine if phone step should be shown
  const isPhoneVerified = user?.phone_verified || user?.is_verified
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  // Build visible steps
  const steps: { key: string; component: React.ReactNode }[] = [
    {
      key: 'basic',
      component: (
        <StepBasicInfo
          data={profileData}
          onChange={updateData}
          onNext={() => setStep(2)}
        />
      ),
    },
    {
      key: 'skills',
      component: (
        <StepSkills
          selected={profileData.skills}
          onChange={(skills: string[]) => updateData({ skills })}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      ),
    },
    {
      key: 'notifications',
      component: (
        <StepNotifications
          onNext={() => {
            // Skip phone step if already verified
            if (isPhoneVerified) {
              // Skip to home screen step if mobile, otherwise finish
              if (isMobile) setStep(5)
              else handleFinish()
            } else {
              setStep(4)
            }
          }}
          onSkip={() => {
            if (isPhoneVerified) {
              if (isMobile) setStep(5)
              else handleFinish()
            } else {
              setStep(4)
            }
          }}
        />
      ),
    },
    {
      key: 'phone',
      component: (
        <StepPhoneVerify
          onNext={() => {
            if (isMobile) setStep(5)
            else handleFinish()
          }}
          onSkip={() => {
            if (isMobile) setStep(5)
            else handleFinish()
          }}
        />
      ),
    },
    {
      key: 'homescreen',
      component: (
        <StepHomeScreen
          onNext={() => handleFinish()}
          onSkip={() => handleFinish()}
        />
      ),
    },
  ]

  const handleFinish = async () => {
    setLoading(true)
    try {
      const res = await api.put(
        '/api/auth/complete-onboarding',
        {
          username: profileData.username,
          first_name: profileData.first_name,
          last_name: profileData.last_name || undefined,
          country: profileData.country,
          city: profileData.city,
          avatar_url: profileData.avatar_url || undefined,
          helper_categories: profileData.skills,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Update local auth state
      if (res.data.user) {
        setAuth(res.data.user, token!)
      }

      navigate('/', { replace: true })
    } catch (err) {
      console.error('Onboarding finish error:', err)
      // Still navigate — don't trap user
      navigate('/', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  // Calculate progress (steps 1-2 are mandatory, rest are optional)
  const progress = (step / TOTAL_STEPS) * 100

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-gray-400">{t('onboarding.settingUp', 'Setting up your profile...')}</p>
        </div>
      </div>
    )
  }

  const currentStep = steps[step - 1]

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>{t('onboarding.step', 'Step')} {step} / {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-[#1a1a24] rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step title */}
        <div className="mb-6">
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-white">{t('onboarding.basicInfoTitle', 'Set up your profile')}</h1>
              <p className="text-gray-400 mt-1">{t('onboarding.basicInfoSub', 'Let people know who you are')}</p>
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold text-white">{t('onboarding.skillsTitle', 'What can you help with?')}</h1>
              <p className="text-gray-400 mt-1">{t('onboarding.skillsSub', 'Pick the categories that match your skills')}</p>
            </>
          )}
          {step === 3 && (
            <>
              <h1 className="text-2xl font-bold text-white">{t('onboarding.notificationsTitle', 'Stay in the loop')}</h1>
              <p className="text-gray-400 mt-1">{t('onboarding.notificationsSub', 'Tasks get taken fast — notifications help you land them first')}</p>
            </>
          )}
          {step === 4 && (
            <>
              <h1 className="text-2xl font-bold text-white">{t('onboarding.phoneTitle', 'Get verified')}</h1>
              <p className="text-gray-400 mt-1">{t('onboarding.phoneSub', 'Verified users get more trust and better visibility')}</p>
            </>
          )}
          {step === 5 && (
            <>
              <h1 className="text-2xl font-bold text-white">{t('onboarding.homeScreenTitle', 'Use Kolab like an app')}</h1>
              <p className="text-gray-400 mt-1">{t('onboarding.homeScreenSub', 'Add to your home screen for quick access')}</p>
            </>
          )}
        </div>

        {/* Step content */}
        <div className="bg-[#1a1a24] rounded-2xl border border-[#2a2a3a] p-6">
          {currentStep?.component}
        </div>
      </div>
    </div>
  )
}
