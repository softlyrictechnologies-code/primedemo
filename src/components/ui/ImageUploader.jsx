/**
 * @typedef {Object} ImageUploaderProps
 * @property {Array<File>} [value]
 * @property {(files: File[]) => void} [onChange]
 * @property {number} [maxFiles]
 * @property {number} [maxSizeMB]
 */

import React, { useRef, useState } from 'react';
import { ImageUp, X } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function ImageUploader({ value = [], onChange, maxFiles = 6, maxSizeMB = 5 }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  const handleFiles = (fileList) => {
    const picked = Array.from(fileList || []);
    const valid = picked.filter((file) => file.type.startsWith('image/'));
    const tooLarge = picked.filter((file) => file.size > maxSizeMB * 1024 * 1024);

    if (tooLarge.length) {
      setError(`Some files exceed ${maxSizeMB}MB.`);
    } else if (valid.length !== picked.length) {
      setError('Only image files are accepted.');
    } else if (value.length + valid.length > maxFiles) {
      setError(`You can upload up to ${maxFiles} images.`);
    } else {
      setError('');
      onChange?.([...value, ...valid]);
    }
  };

  const removeAt = (index) => {
    onChange?.(value.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        className={cn('flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center hover:border-brand-400 hover:bg-brand-50/40')}
      >
        <ImageUp className="mb-2 h-8 w-8 text-brand-700" />
        <p className="text-sm font-semibold text-neutral-800">Upload images</p>
        <p className="text-xs text-neutral-500">Up to {maxFiles} images · {maxSizeMB}MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => { handleFiles(event.target.files); event.target.value = ''; }}
        />
      </div>

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {value.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} className="h-24 w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-neutral-700 shadow-sm"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
