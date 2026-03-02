import { useTranslation } from 'react-i18next';
import { PAYMENT_PRICES, type PaymentType } from '@marketplace/shared';

type PremiumMode = 'task' | 'offering';

interface PremiumOptionsProps {
  mode: PremiumMode;
  selected: PaymentType | null;
  onChange: (type: PaymentType | null) => void;
}

const TASK_OPTIONS: { type: PaymentType; icon: string; color: string; border: string; bg: string; darkBg: string }[] = [
  {
    type: 'urgent_task',
    icon: '⚡',
    color: 'text-red-600 dark:text-red-400',
    border: 'border-red-400 dark:border-red-500',
    bg: 'bg-red-50',
    darkBg: 'dark:bg-red-900/20',
  },
  {
    type: 'promote_task',
    icon: '⭐',
    color: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-400 dark:border-amber-500',
    bg: 'bg-amber-50',
    darkBg: 'dark:bg-amber-900/20',
  },
];

const OFFERING_OPTIONS: typeof TASK_OPTIONS = [
  {
    type: 'boost_offering',
    icon: '🚀',
    color: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-400 dark:border-blue-500',
    bg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/20',
  },
  {
    type: 'promote_offering',
    icon: '⭐',
    color: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-400 dark:border-amber-500',
    bg: 'bg-amber-50',
    darkBg: 'dark:bg-amber-900/20',
  },
];

const DESCRIPTIONS: Record<PaymentType, { en: string; key: string }> = {
  urgent_task: {
    key: 'premium.urgentDesc',
    en: 'Your task appears at the very top of all listings with an urgent badge',
  },
  promote_task: {
    key: 'premium.promoteTaskDesc',
    en: 'Priority placement above regular tasks for 3 days',
  },
  boost_offering: {
    key: 'premium.boostDesc',
    en: 'Boosted visibility with a badge for 24 hours',
  },
  promote_offering: {
    key: 'premium.promoteOfferingDesc',
    en: 'Priority placement above regular offerings for 3 days',
  },
};

const PremiumOptions = ({ mode, selected, onChange }: PremiumOptionsProps) => {
  const { t } = useTranslation();
  const options = mode === 'task' ? TASK_OPTIONS : OFFERING_OPTIONS;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        ✨ {t('premium.wantVisibility', 'Want more visibility?')}
        <span className="text-gray-400 dark:text-gray-500 font-normal text-xs ml-1">
          ({t('common.optional', 'Optional')})
        </span>
      </p>

      <div className="space-y-2">
        {options.map((opt) => {
          const price = PAYMENT_PRICES[opt.type];
          const desc = DESCRIPTIONS[opt.type];
          const isSelected = selected === opt.type;

          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => onChange(isSelected ? null : opt.type)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? `${opt.border} ${opt.bg} ${opt.darkBg}`
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="text-xl mt-0.5">{opt.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${isSelected ? opt.color : 'text-gray-800 dark:text-gray-200'}`}>
                    {price.label}
                  </span>
                  <span className={`text-sm font-bold ${isSelected ? opt.color : 'text-gray-500 dark:text-gray-400'}`}>
                    {price.amount} / {price.duration}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {t(desc.key, desc.en)}
                </p>
              </div>
              <span className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                isSelected
                  ? `${opt.border} ${opt.bg} ${opt.darkBg}`
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {isSelected && (
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    opt.type.includes('urgent') ? 'bg-red-500' :
                    opt.type.includes('boost') ? 'bg-blue-500' : 'bg-amber-500'
                  }`} />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-400 dark:text-gray-500">
        {t('premium.addLater', 'You can also add these later from the detail page.')}
      </p>
    </div>
  );
};

export default PremiumOptions;
