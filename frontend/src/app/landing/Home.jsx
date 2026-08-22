import { Link } from 'react-router-dom';
import { NavLinks } from '../navigation/navConfig';
import FeatureShowcase from './FeatureShowcase';

const FEATURED_TOOLS = {
  AI: {
    id: 'upscale',
    image: '/demo/upscale_after.png',
    meta: 'AI enlargement / 4× output',
    imageClassName: 'object-contain p-8 sm:p-12',
    frameClassName: 'aspect-[4/3] bg-pf-editorial-raised lg:col-span-7',
    copyClassName: 'lg:col-span-5',
  },
  Edit: {
    id: 'editor',
    image: '/demo/res_color_after.png',
    meta: 'Direct adjustments / live preview',
    frameClassName: 'aspect-[16/10] lg:order-2 lg:col-span-8',
    copyClassName: 'lg:col-span-4',
  },
  Optimize: {
    id: 'compress',
    image: '/demo/rem_bg_before.jpg',
    meta: 'Output control / smaller files',
    frameClassName: 'aspect-[3/2] lg:col-span-7',
    copyClassName: 'lg:col-span-5',
  },
  Utilities: {
    id: 'palette',
    image: '/demo/object_remove_after.png',
    meta: 'Image analysis / extracted color',
    frameClassName: 'aspect-square sm:aspect-[4/3] lg:order-2 lg:col-span-6',
    copyClassName: 'lg:col-span-6',
  },
};

/** Editorial, image-led entry point for the PixelForge workstation. */
export default function HomeHub() {
  const categories = Object.values(NavLinks);

  return (
    <div className="w-full flex-1 bg-pf-editorial-base text-pf-editorial-ink">
      <section className="mx-auto max-w-pf-workspace px-pf-gutter pb-16 pt-6 sm:pb-20 lg:pb-24">
        <div className="flex items-center justify-between border-b border-pf-editorial-line pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-pf-editorial-muted sm:text-xs">
          <span>PixelForge / Image workstation</span>
          <span>Open source / 2026</span>
        </div>

        <div className="grid gap-14 pt-12 lg:grid-cols-12 lg:items-center lg:gap-8 lg:pt-16">
          <div className="lg:col-span-4 xl:col-span-5">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-pf-editorial-accent">Creative image processing / 01—04</p>
            <h1 className="max-w-3xl text-[clamp(3.5rem,6.4vw,6.75rem)] font-black leading-[0.86] tracking-[-0.065em] text-pf-editorial-ink">
              Images,<br />forged with<br /><span className="text-pf-editorial-muted">intent.</span>
            </h1>
            <p className="mt-8 max-w-md text-base leading-7 text-pf-editorial-muted sm:text-lg sm:leading-8">
              Edit, enhance, inspect, and export in a focused workstation that keeps the image—not the interface—at the center.
            </p>
            <Link to="/image-editor" className="mt-8 inline-flex w-fit items-center gap-3 border-b border-pf-editorial-accent pb-1 text-sm font-bold text-pf-editorial-ink transition-colors hover:text-pf-editorial-accent">
              Enter the image editor <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="lg:col-span-8 xl:col-span-7">
            <FeatureShowcase />
          </div>
        </div>
      </section>

      <section id="tools" className="border-y border-pf-editorial-line bg-pf-editorial-surface py-16 sm:py-20">
        <div className="mx-auto max-w-pf-workspace px-pf-gutter">
          <div className="mb-10 grid gap-5 border-b border-pf-editorial-line pb-6 sm:grid-cols-2 sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-pf-editorial-accent">Tool library / Four categories</p>
              <h2 className="mt-3 text-pf-title font-black tracking-[-0.04em] text-pf-editorial-ink">See the result,<br />not the promise.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-pf-editorial-muted sm:justify-self-end">Start with a featured workflow or move directly to a supporting tool. No project setup required.</p>
          </div>

          {categories.map((category, categoryIndex) => {
            const feature = FEATURED_TOOLS[category.title];
            const featuredItem = category.items.find((item) => item.id === feature.id);
            const supportingItems = category.items.filter((item) => item.id !== feature.id);
            const textOrder = categoryIndex % 2 === 0 ? 'lg:order-2' : '';

            return (
              <section key={category.title} className="grid gap-8 border-t border-pf-editorial-line py-12 first:border-t-0 first:pt-2 lg:grid-cols-12 lg:items-center lg:gap-12" aria-labelledby={`tools-${categoryIndex}`}>
                <Link to={featuredItem.to} className={`group relative overflow-hidden bg-pf-editorial-raised ${feature.frameClassName}`}>
                  <img src={feature.image} alt={`${featuredItem.label} workflow preview`} loading="lazy" className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015] ${feature.imageClassName || ''}`} />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-5 pb-5 pt-20 text-white">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/75">{feature.meta}</span>
                    <span className="text-lg transition-transform group-hover:translate-x-1" aria-hidden="true">↗</span>
                  </span>
                </Link>

                <div className={`${textOrder} ${feature.copyClassName}`}>
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-xs text-pf-editorial-accent">0{categoryIndex + 1}</span>
                    <h3 id={`tools-${categoryIndex}`} className="text-sm font-bold uppercase tracking-[0.18em] text-pf-editorial-muted">{category.title}</h3>
                  </div>
                  <h4 className="mt-5 text-3xl font-black tracking-[-0.035em] text-pf-editorial-ink sm:text-4xl">{featuredItem.label}</h4>
                  <p className="mt-3 max-w-md text-base leading-7 text-pf-editorial-muted">{featuredItem.desc}</p>
                  <Link to={featuredItem.to} className="mt-6 inline-flex items-center gap-3 border-b border-pf-editorial-accent pb-1 text-sm font-bold text-pf-editorial-ink transition-colors hover:text-pf-editorial-accent">
                    Open workflow <span aria-hidden="true">→</span>
                  </Link>

                  {supportingItems.length > 0 && (
                    <div className="mt-8 border-t border-pf-editorial-line pt-4">
                      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-pf-editorial-muted">Also in {category.title}</p>
                      <div className="flex flex-wrap gap-x-5 gap-y-3">
                        {supportingItems.map((item) => (
                          <Link key={item.id} to={item.to} className="text-sm font-semibold text-pf-editorial-muted transition-colors hover:text-pf-editorial-accent">
                            {item.label} <span aria-hidden="true">↗</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}
