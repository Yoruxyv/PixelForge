/**
 * Optimization route registry.
 *
 * Routes in this file are for tools focused on reducing file size,
 * changing image formats, or cleaning file metadata.
 *
 * Most optimization tools are client-side and should stay separate from
 * AI feature routes to keep the route structure easy to scan.
 */

import React from 'react';

/**
 * Image optimization routes.
 *
 * @type {{ path: string, component: React.LazyExoticComponent<React.ComponentType> }[]}
 */
const optimizeRoutes = [
  {
    path: '/compress-image',
    component: React.lazy(() => import('../../features/compress/CompressImage')),
  },
  {
    path: '/convert-format',
    component: React.lazy(() => import('../../features/convert/ConvertFormat')),
  },
  {
    path: '/metadata',
    component: React.lazy(() =>
      import('../../features/metadata-removal/MetadataWorkspace')
    ),
  },
];

export default optimizeRoutes;
