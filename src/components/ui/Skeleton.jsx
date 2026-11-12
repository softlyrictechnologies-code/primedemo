/**
 * @typedef {Object} SkeletonProps
 * @property {string} [className]
 */

import React from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function Skeleton({ className = '', style = {} }) {
  return <div className={cn('animate-pulse rounded-md bg-neutral-200/80', className)} style={style} />;
}
