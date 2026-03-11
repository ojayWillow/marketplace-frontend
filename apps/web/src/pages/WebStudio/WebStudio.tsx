import { WEB_PACKAGES, ADD_ONS } from '../../constants/webPackages';
import PackageCard from './components/PackageCard';
import AddOnCard from './components/AddOnCard';

export default function WebStudio() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f]">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-violet-50/60 dark:hidden" />
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-blue-600/10 via-transparent to-violet-600/10" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-20">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
            Kolab Web Studio
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Mājas lapa tavam uzņēmumam
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Profesionālas vietnes jauniem uzņēmumiem. Skaidras cenas, ātri rezultāti.
            Atvērt katru piemēru un pieredzi to tieši šeit.
          </p>
        </div>

        {/* Package cards — stacked vertically for full experience */}
        <div className="flex flex-col gap-10 mb-20">
          {WEB_PACKAGES.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>

        {/* Add-ons section */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Papildu pakalpojumi
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Papildini savu paketi ar šiem digitālajiem produktiem
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ADD_ONS.map((addon) => (
              <AddOnCard key={addon.title} addon={addon} />
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-3">
            Nav skaidrs, kura pakete der tev vislabāk?
          </p>
          <a
            href="mailto:info@kolab.lv?subject=Web Studio - konsultācija"
            className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Jautā mums ✉️
          </a>
        </div>
      </div>
    </div>
  );
}
