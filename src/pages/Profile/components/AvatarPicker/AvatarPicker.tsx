import { AVATAR_STYLES, generateAvatarUrl } from '../../utils/avatarHelpers';

interface AvatarPickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStyle: string;
  onStyleChange: (style: string) => void;
  seed: string;
  onSeedChange: (seed: string) => void;
  onRandomize: () => void;
  onSelect: () => void;
  uploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTriggerFileInput: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const AvatarPicker = ({
  isOpen,
  onClose,
  selectedStyle,
  onStyleChange,
  seed,
  onSeedChange,
  onRandomize,
  onSelect,
  uploading,
  onFileUpload,
  onTriggerFileInput,
  fileInputRef,
}: AvatarPickerProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Choose Avatar</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {/* Upload Custom Photo */}
        <div className="mb-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileUpload}
            className="hidden"
          />
          <button
            onClick={onTriggerFileInput}
            disabled={uploading}
            className="w-full border-2 border-dashed border-gray-200 rounded-lg py-6 px-4 text-center hover:border-blue-300 hover:bg-blue-50/50 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <span className="text-gray-500">Uploading...</span>
            ) : (
              <>
                <div className="text-2xl mb-1">📷</div>
                <p className="text-gray-600 text-sm">Upload photo</p>
              </>
            )}
          </button>
        </div>

        <div className="border-t pt-5">
          <p className="text-sm text-gray-500 mb-3">Or generate an avatar</p>
          
          {/* Style Selection */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {AVATAR_STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => onStyleChange(style.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedStyle === style.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {style.name}
              </button>
            ))}
          </div>

          {/* Seed Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={seed}
              onChange={(e) => onSeedChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type anything..."
            />
            <button
              onClick={onRandomize}
              className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
            >
              🎲
            </button>
          </div>

          {/* Preview */}
          <div className="flex justify-center mb-4">
            <img
              src={generateAvatarUrl(selectedStyle, seed)}
              alt="Preview"
              className="w-20 h-20 rounded-full border-4 border-gray-100"
            />
          </div>

          <button
            onClick={onSelect}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
          >
            Use This Avatar
          </button>
        </div>
      </div>
    </div>
  );
};
