/**
 * @typedef {Object} PriceTextProps
 * @property {number|string} value
 */

import React from 'react';

export default function PriceText({ value = 0 }) {
  const numeric = Number(value || 0);
  if (numeric >= 100) {
    return <span>₹ {((numeric / 100).toFixed(2).replace(/\.00$/, '')).replace(/(\..*)0+$/, '$1')} Cr</span>;
  }
  return <span>₹ {numeric} Lakh{numeric === 1 ? '' : 's'}</span>;
}
