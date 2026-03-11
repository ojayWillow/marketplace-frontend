import PackagePreview from './PackagePreview';
import type { WebPackage } from '../../../constants/webPackages';

interface Props {
  pkg: WebPackage;
}

export default function PackageCard({ pkg }: Props) {
  return (
    <div
      className={`flex flex-col rounded-2xl border-2 ${pkg.borderColor} bg-white dark:bg-gray-900 shadow-lg overflow-hidden transition-shadow hover:shadow-xl`}
    >
      {/* Header gradient band */}
      <div className={`bg-gradient-to-r ${pkg.color} px-6 py-5`}>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-white/70 text-xs font-medium uppercase tracking-widest">
              Pakete
            </span>
            <h2 className="text-white text-2xl font-bold mt-0.5">{pkg.name}</h2>
            <p className="text-white/80 text-sm mt-1">{pkg.tagline}</p>
          </div>
          <div className="text-right">
            <p className="text-white text-2xl font-bold">{pkg.price}</p>
            <p className="text-white/60 text-xs">{pkg.priceNote}</p>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Live preview accordion */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Piemēru vietnes — noklikšķini, lai pieredzētu
          </p>
          <PackagePreview slides={pkg.slides} accentColor={pkg.dotColor} />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-gray-800" />

        {/* Features */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Iekļauts cenā
          </p>
          <ul className="space-y-2">
            {pkg.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <a
          href={`mailto:info@kolab.lv?subject=Web Studio - pakete: ${pkg.name}`}
          className={`w-full text-center py-3.5 px-4 rounded-xl text-white font-semibold text-sm transition-all ${pkg.buttonColor} hover:scale-[1.02] active:scale-100 shadow-sm`}
        >
          Sākt projektu →
        </a>
      </div>
    </div>
  );
}
