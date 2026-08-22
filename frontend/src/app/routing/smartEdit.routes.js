/**
 * Smart edit route registry.
 *
 * Routes in this file are for browser-based editing tools that mainly run
 * on the client side, such as editing, resizing, cropping, rotating, and flipping.
 *
 * These tools usually do not require the backend AI job pipeline.
 */

import React from 'react';

/**
 * Client-side smart editing routes.
 *
 * @type {{ path: string, component: React.LazyExoticComponent<React.ComponentType> }[]}
 */
const smartEditRoutes = [
  {
    path: '/image-editor',
    component: React.lazy(() => import('@/features/image-editor/ImageEditor')),
  },
  {
    path: '/resize-image',
    component: React.lazy(() => import('@/features/resize/ResizeImage')),
  },
  {
    path: '/crop-image',
    component: React.lazy(() => import('@/features/crop/CropImage')),
  },
  {
    path: '/rotate-flip',
    component: React.lazy(() => import('@/features/rotate-flip/RotateFlip')),
  },
];

export default smartEditRoutes;
