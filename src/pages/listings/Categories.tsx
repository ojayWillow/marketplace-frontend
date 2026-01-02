import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  Car,
  Home,
  Armchair,
  Shirt,
  Dumbbell,
  BookOpen,
  Grid3x3,
} from 'lucide-react';
import { CATEGORIES } from './constants';
import type { ListingCategory } from '../../types';

interface CategoryCardProps {
  category: ListingCategory;
  icon: React.ReactNode;
  label: string;
}

const CategoryCard = ({ category, icon, label }: CategoryCardProps) => {
  return (
    <Link
      to={`/listings?category=${category}`}
      className="group block p-6 bg-white rounded-lg border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all duration-200"
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
          {label}
        </h3>
      </div>
    </Link>
  );
};

export default function Categories() {
  const { t } = useTranslation();

  const categoryConfig: Record<ListingCategory, React.ReactNode> = {
    electronics: <Smartphone size={32} />,
    vehicles: <Car size={32} />,
    property: <Home size={32} />,
    furniture: <Armchair size={32} />,
    clothing: <Shirt size={32} />,
    sports: <Dumbbell size={32} />,
    books: <BookOpen size={32} />,
    other: <Grid3x3 size={32} />,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('listings.browseCategories')}
          </h1>
          <p className="text-gray-600">
            {t('listings.browseCategoriesDesc')}
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category}
              category={category}
              icon={categoryConfig[category]}
              label={t(`listings.categories.${category}`)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/listings"
            className="inline-block text-primary-600 hover:text-primary-700 font-medium"
          >
            {t('listings.viewAllListings')} →
          </Link>
        </div>
      </div>
    </div>
  );
}
