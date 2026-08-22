/**
 * React application entry point.
 *
 * This file mounts the PixelForge React tree into the root DOM node and wraps the
 * app with global providers that should exist once for the entire frontend.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import './index.css'
import App from './app/App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
)
