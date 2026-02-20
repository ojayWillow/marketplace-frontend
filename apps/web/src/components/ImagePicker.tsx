import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface ImagePickerProps {
  images: File[];
  onChange: (images: File[]) => void;
  maxImages?: number;
  existingUrls?: string[];
  onRemoveExisting?: (url: string) => void;
  label?: string;
}

const ImagePicker = ({
  images,
  onChange,
  maxImages = 5,
  existingUrls = [],
  onRemoveExisting,
  label,
}: ImagePickerProps) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const totalImages = existingUrls.length + images.length;
  const canAddMore = totalImages < maxImages;

  const validateAndAddFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((file) => {
        if (!file.type.startsWith('image/')) return false;
        if (file.size > 10 * 1024 * 1024) return false;
        return true;
      });

      const remaining = maxImages - existingUrls.length - images.length;
      const toAdd = validFiles.slice(0, remaining);

      if (toAdd.length > 0) {
        onChange([...images, ...toAdd]);
      }
    },
    [images, onChange, maxImages, existingUrls.length]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateAndAddFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const removeNewImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      {existingUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {existingUrls.map((url, i) => (
            <div key={`existing-${i}`} className="relative group w-20 h-20">
              <img
                src={url}
                alt={`Existing ${i + 1}`}
                className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(url)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((file, i) => (
            <div key={`new-${i}`} className="relative group w-20 h-20">
              <img
                src={URL.createObjectURL(file)}
                alt={`New ${i + 1}`}
                className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <button
                type="button"
                onClick={() => removeNewImage(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            <span className="text-2xl block mb-1">📷</span>
            <p>{t('imagePicker.dropOrClick', 'Drop images here or click to browse')}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {t('imagePicker.limit', '{{current}} / {{max}} images (max 10MB each)', {
                current: totalImages,
                max: maxImages,
              })}
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ImagePicker;
