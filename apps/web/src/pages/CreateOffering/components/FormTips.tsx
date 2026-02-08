import { getCategoryByValue } from '../../../constants/categories';

interface FormTipsProps {
  category: string;
}

const FormTips = ({ category }: FormTipsProps) => {
  const selectedCategory = getCategoryByValue(category);

  return (
    <>
      {/* Matching hint */}
      {category && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-medium text-amber-800 mb-1">💡 Get connected with jobs</h3>
          <p className="text-sm text-amber-700">
            People who post {selectedCategory?.label || 'this type of'} jobs in your area will be able to find you and request your services!
          </p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <h3 className="font-medium text-gray-800 mb-2">✨ Tips for a great offering</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Use a clear, specific title that describes your service</li>
          <li>• Be detailed in the description — what's included?</li>
          <li>• Set a competitive price based on your experience</li>
          <li>• Respond quickly when people contact you</li>
        </ul>
      </div>
    </>
  );
};

export default FormTips;
