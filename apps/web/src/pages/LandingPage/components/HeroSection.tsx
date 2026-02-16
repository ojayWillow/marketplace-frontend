import { MapPin, Zap, Shield, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
  const { t } = useTranslation();

  // Parse examples from translation (comma-separated)
  const examples = (t('landing.hero.examples', { returnObjects: true }) as string[]) || [];

  return (
    <div className="mb-8 lg:mb-0">
      <div className="inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs lg:text-sm font-medium mb-4 lg:mb-6">
        <MapPin className="w-3 h-3 lg:w-4 lg:h-4" />
        {t('landing.hero.badge')}
      </div>

      <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 lg:mb-6 leading-tight">
        {t('landing.hero.title')}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400"> {t('landing.hero.titleHighlight')}</span>
      </h1>

      <div className="text-base lg:text-xl text-gray-400 mb-5 lg:mb-6 leading-relaxed space-y-1">
        <p>{t('landing.hero.subtitleLine1')}</p>
        <p>{t('landing.hero.subtitleLine2')}</p>
        <p>{t('landing.hero.subtitleLine3')}</p>
      </div>

      {Array.isArray(examples) && examples.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5 lg:mb-6">
          {examples.map((example, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              {example}
            </span>
          ))}
        </div>
      )}

      <p className="text-base lg:text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 mb-6 lg:mb-8">
        {t('landing.hero.closingLine')}
      </p>

      <div className="grid grid-cols-3 gap-3 lg:flex lg:flex-wrap lg:gap-6 mb-8">
        <div className="text-center lg:text-left lg:flex lg:items-center lg:gap-2">
          <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto lg:mx-0 mb-1 lg:mb-0">
            <Zap className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <div className="text-white font-medium lg:font-semibold text-sm">{t('landing.hero.fast')}</div>
            <div className="text-gray-500 text-xs lg:text-sm">{t('landing.hero.fastDesc')}</div>
          </div>
        </div>
        <div className="text-center lg:text-left lg:flex lg:items-center lg:gap-2">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto lg:mx-0 mb-1 lg:mb-0">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-white font-medium lg:font-semibold text-sm">{t('landing.hero.verified')}</div>
            <div className="text-gray-500 text-xs lg:text-sm">
              <span className="lg:hidden">{t('landing.hero.verifiedDesc')}</span>
              <span className="hidden lg:inline">{t('landing.hero.verifiedDescFull')}</span>
            </div>
          </div>
        </div>
        <div className="text-center lg:text-left lg:flex lg:items-center lg:gap-2">
          <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto lg:mx-0 mb-1 lg:mb-0">
            <Star className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-white font-medium lg:font-semibold text-sm">{t('landing.hero.rated')}</div>
            <div className="text-gray-500 text-xs lg:text-sm">{t('landing.hero.ratedDesc')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
