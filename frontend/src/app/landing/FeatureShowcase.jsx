import './feature-showcase.css';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { NavLinks } from '@/app/navigation/navConfig';
import BeforeAfterSlider from './BeforeAfterSlider';

const AI_ROUTE_BY_NAV_ID = Object.freeze(
  Object.fromEntries(
    NavLinks.enhance.items.map(({ id, to }) => [id, to]),
  ),
);

const FEATURES = [
  {
    id: 'upscale',
    navId: 'upscale',
    name: 'Upscale',
    copy: 'Recover useful detail and enlarge an image for higher-resolution output.',
    before: '/demo/upscale_before.webp',
    after: '/demo/upscale_after.webp',
    afterSrcSet:
      '/demo/upscale_after-768.webp 768w, /demo/upscale_after.webp 1024w',
    afterSizes:
      '(min-width: 1280px) calc(58.333vw - 3.167rem), (min-width: 1024px) calc(66.667vw - 3.333rem), calc(100vw - 2rem)',
  },
  {
    id: 'background-removal',
    navId: 'remove-bg',
    name: 'Background removal',
    copy: 'Isolate the subject and create a clean, transparent output.',
    before: '/demo/rem_bg_before.webp',
    after: '/demo/rem_bg_after.png',
    imageClassName: 'object-contain',
    canvasClassName: 'pf-transparency-grid',
  },
  {
    id: 'color-restoration',
    navId: 'restore-color',
    name: 'Color restoration',
    copy: 'Bring faded photographs back with balanced, natural-looking color.',
    before: '/demo/res_color_before.jpg',
    after: '/demo/res_color_after.webp',
  },
  {
    id: 'object-removal',
    navId: 'object-remove',
    name: 'Object removal',
    copy: 'Remove a marked distraction and rebuild the surrounding image.',
    before: '/demo/object_remove_before.png',
    after: '/demo/object_remove_after.png',
  },
];

/** User-controlled editorial preview of PixelForge's core AI workflows. */
export default function FeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const activeFeature = FEATURES[activeIndex];
  const activeRoute = AI_ROUTE_BY_NAV_ID[activeFeature.navId];
  const presentationAnimationClassName = prefersReducedMotion
    ? ''
    : 'animate__animated animate__lightSpeedInLeft animate__faster';

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = (event) =>
      setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener('change', updateMotionPreference);
    return () =>
      mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    if (isHovered || hasInteracted || prefersReducedMotion) return undefined;

    const rotation = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % FEATURES.length);
    }, 6000);

    return () => window.clearInterval(rotation);
  }, [hasInteracted, isHovered, prefersReducedMotion]);

  const handleKeyDown = (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;

    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex =
      (activeIndex + direction + FEATURES.length) % FEATURES.length;
    setHasInteracted(true);
    setActiveIndex(nextIndex);
    document
      .getElementById(`feature-tab-${FEATURES[nextIndex].id}`)
      ?.focus();
  };

  return (
    <figure
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerDown={() => setHasInteracted(true)}
      onFocusCapture={() => setHasInteracted(true)}
    >
      <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-pf-editorial-muted sm:text-xs">
        <figcaption>01 / Core workflows</figcaption>
        <span>Drag to compare</span>
      </div>

      <div className="overflow-hidden">
        <div
          key={activeFeature.id}
          role="tabpanel"
          id="feature-panel"
          aria-labelledby={`feature-tab-${activeFeature.id}`}
          className={presentationAnimationClassName}
        >
          <BeforeAfterSlider
            beforeImage={activeFeature.before}
            afterImage={activeFeature.after}
            altText={`${activeFeature.name} example`}
            aspectClassName="aspect-[16/10]"
            imageClassName={activeFeature.imageClassName}
            canvasClassName={activeFeature.canvasClassName}
            prioritizeImages={activeFeature.id === 'upscale'}
            afterSrcSet={activeFeature.afterSrcSet}
            afterSizes={activeFeature.afterSizes}
          />
        </div>
      </div>

      <div className="grid border-b border-pf-editorial-line lg:grid-cols-[minmax(15rem,0.8fr)_minmax(0,1.2fr)]">
        <div className="border-b border-pf-editorial-line py-6 lg:border-b-0 lg:border-r lg:pr-8">
          <p className="text-2xl font-bold text-pf-editorial-ink">
            {activeFeature.name}
          </p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-pf-editorial-muted">
            {activeFeature.copy}
          </p>
          <Link
            to={activeRoute}
            className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-pf-editorial-accent underline-offset-4 transition-colors hover:text-pf-editorial-ink hover:underline"
          >
            OPEN {activeFeature.name.toUpperCase()}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div
          className="grid grid-cols-2 lg:grid-cols-4"
          role="tablist"
          aria-label="Core PixelForge workflows"
        >
          {FEATURES.map((feature, index) => {
            const isActive = activeIndex === index;
            return (
              <button
                key={feature.id}
                id={`feature-tab-${feature.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="feature-panel"
                tabIndex={isActive ? 0 : -1}
                onClick={() => {
                  setHasInteracted(true);
                  setActiveIndex(index);
                }}
                onKeyDown={handleKeyDown}
                className={`relative border-l border-t border-pf-editorial-line px-3 py-6 text-left transition-colors lg:border-t-0 ${
                  isActive
                    ? 'bg-pf-editorial-accent-soft text-pf-editorial-ink'
                    : 'text-pf-editorial-muted hover:bg-pf-editorial-raised hover:text-pf-editorial-ink'
                }`}
              >
                {isActive && (
                  <span className="absolute inset-x-0 top-0 h-0.5 bg-pf-editorial-accent" />
                )}
                <span
                  className={`block font-mono text-[10px] ${
                    isActive ? 'text-pf-editorial-accent' : ''
                  }`}
                >
                  0{index + 1}
                </span>
                <span className="mt-2 block text-xs font-bold uppercase tracking-[0.1em]">
                  {feature.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </figure>
  );
}
