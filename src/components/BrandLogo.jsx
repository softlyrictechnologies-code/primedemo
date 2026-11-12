import React from 'react';
import { BRAND_NAME, LOGO_FALLBACK, LOGO_URL } from '../config/brand';

export default function BrandLogo({
  className = 'h-10 md:h-11 w-auto object-contain',
  alt = BRAND_NAME,
  ...props
}) {
  const handleError = (event) => {
    if (event.currentTarget.dataset.fallbackApplied === 'true') {
      return;
    }

    event.currentTarget.dataset.fallbackApplied = 'true';
    event.currentTarget.src = LOGO_FALLBACK;
  };

  return (
    <img
      src={LOGO_URL}
      alt={alt}
      className={className}
      loading="eager"
      decoding="async"
      draggable="false"
      onError={handleError}
      {...props}
    />
  );
}
