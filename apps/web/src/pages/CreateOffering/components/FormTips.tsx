import { getCategoryByValue } from '../../../constants/categories';

interface FormTipsProps {
  category: string;
}

const FormTips = ({ category }: FormTipsProps) => {
  const selectedCategory = getCategoryByValue(category);

  return (
    <>
      {category && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-700">
            <span className="font-semibold">💡 Tip:</span> People who post {selectedCategory?.label || 'this type of'} jobs in your area will find you automatically!
          </p>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-xs font-medium text-gray-700 mb-1">✨ Stand out tips</p>
        <ul className="text-[11px] text-gray-500 space-y-0.5">
          <li>\u2022 Clear title = more clicks</li>
          <li>\u2022 Detailed description = more trust</li>
          <li>\u2022 Competitive price = more inquiries</li>
          <li>\u2022 Fast replies = higher ranking</li>
        </ul>
      </div>
    </>
  );
};

export default FormTips;
