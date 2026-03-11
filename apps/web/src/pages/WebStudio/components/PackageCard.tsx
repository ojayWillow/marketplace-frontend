import PackageSlideshow from './PackageSlideshow';
import type { WebPackage } from '../../../constants/webPackages';

interface Props {
  pkg: WebPackage;
}

export default function PackageCard({ pkg }: Props) {
  return (
    <div
      className={`flex flex-col rounded-2xl border-2 ${pkg.borderColor} bg-white dark:bg-gray-900 shadow-lg overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-xl`}
    >
      {/* Live iframe slideshow at top */}
      <div className="p-3 pb-0">
        <PackageSlideshow slides={pkg.slides} />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        {/* Badge + name */}
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${pkg.badgeColor}`}>
            {pkg.name}
          </span>
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{pkg.tagline}</p>

        {/* Features */}
        <ul className="space-y-2 mb-6 flex-1">
          {pkg.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-emerald-500 mt-0.5">✓</span>
              {f}
            </li>
          ))}
        </ul>

        {/* Price */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{pkg.price}</span>
          <span className="text-xs text-gray-400 ml-2">{pkg.priceNote}</span>
        </div>

        {/* CTA */}
        <a
          href={`mailto:info@kolab.lv?subject=Web Studio - pakete: ${pkg.name}`}
          className={`w-full text-center py-3 px-4 rounded-xl text-white font-semibold text-sm transition-colors ${pkg.buttonColor}`}
        >
          Sazināties
        </a>
      </div>
    </div>
  );
}
