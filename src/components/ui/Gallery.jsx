/**
 * @typedef {Object} GalleryProps
 * @property {Array<string>} images
 */

import React, { useState } from 'react';

export default function Gallery({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) {
    return <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-sm text-neutral-500">No gallery images available.</div>;
  }

  return (
    <div className="space-y-3">
      <img src={images[activeIndex]} alt="Property gallery view" className="h-80 w-full rounded-2xl object-cover shadow-card" />
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`overflow-hidden rounded-xl border ${activeIndex === index ? 'border-brand-700' : 'border-neutral-200'}`}
          >
            <img src={image} alt={`Property thumbnail ${index + 1}`} className="h-16 w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}
