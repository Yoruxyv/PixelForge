/**
 * AI feature route registry.
 *
 * Routes in this file are for tools that depend on the backend AI pipeline,
 * cloud upload flow, queue handling, usage limits, and result polling.
 *
 * Add new AI-powered tools here, then make sure the matching page component,
 * frontend service, pipeline hook, backend endpoint, and navigation item exist.
 */

import React from 'react';

/**
 * AI-powered image tool routes.
 *
 * @type {{ path: string, component: React.LazyExoticComponent<React.ComponentType> }[]}
 */
const aiFeatureRoutes = [
  {
    path: '/upscale',
    component: React.lazy(() => import('@/features/upscale/UpscaleImage')),
  },
  {
    path: '/remove-bg',
    component: React.lazy(() =>
      import('@/features/background-removal/RemoveBackground')
    ),
  },
  {
    path: '/color-restoration',
    component: React.lazy(() =>
      import('@/features/color-restoration/ColorRestoration')
    ),
  },
  {
    path: '/object-remove',
    component: React.lazy(() =>
      import('@/features/object-removal/ObjectRemover')
    ),
  },
];

export default aiFeatureRoutes;
