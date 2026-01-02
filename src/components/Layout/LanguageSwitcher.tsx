import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'lv', name: 'LV', flag: '🇱🇻' },
  { code: 'ru', name: 'RU', flag: '🇷🇺' },
  { code: 'en', name: 'EN', flag: '🇬🇧' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center space-x-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
            i18n.language === lang.code
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title={lang.name}
        >
          {lang.flag} {lang.name}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
