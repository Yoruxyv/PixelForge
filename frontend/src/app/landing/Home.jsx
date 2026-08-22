import { Link } from 'react-router-dom';
import CategoryShowcases from './CategoryShowcases';
import FeatureShowcase from './FeatureShowcase';

/** Editorial, image-led entry point for the PixelForge workstation. */
export default function HomeHub() {
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

      <CategoryShowcases />
    </div>
  );
}
