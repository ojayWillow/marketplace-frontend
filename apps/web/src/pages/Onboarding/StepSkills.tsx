import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FORM_CATEGORIES } from '@marketplace/shared'

interface Props {
  selected: string[]
  onChange: (skills: string[]) => void
  onNext: () => void
}

export default function StepSkills({ selected, onChange, onNext }: Props) {
  const { t } = useTranslation()
  const [error, setError] = useState('')

  const toggle = (key: string) => {
    if (selected.includes(key)) {
      onChange(selected.filter((s) => s !== key))
    } else {
      onChange([...selected, key])
    }
    setError('')
  }

  const handleNext = () => {
    if (selected.length === 0) {
      setError('Pick at least one skill')
      return
    }
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">
          {t('onboarding.whatCanYouDo', 'What can you help with?')}
        </h2>
        <p className="text-sm text-gray-400">
          {t('onboarding.skillsSubtitle', 'Pick the categories that match your skills. You can change these later.')}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {FORM_CATEGORIES.map((cat) => {
          const isSelected = selected.includes(cat.key)
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => toggle(cat.key)}
              className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10 text-white'
                  : 'border-[#2a2a3a] bg-[#0a0a0f] text-gray-400 hover:border-[#3a3a4a]'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="text-sm font-medium truncate">{cat.label}</span>
            </button>
          )
        })}
      </div>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}

      <button
        onClick={handleNext}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
      >
        {t('onboarding.continue', 'Continue')}
      </button>
    </div>
  )
}
