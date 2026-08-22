import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { NavLinks } from '../navigation/navConfig';

const CATEGORIES = [NavLinks.edit, NavLinks.optimize, NavLinks.tools];

function ToolIcon({ path }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="h-4 w-4 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function ToolLinks({ items }) {
  return (
    <div className="mt-8 grid gap-px border-y border-pf-editorial-line bg-pf-editorial-line sm:grid-cols-2">
      {items.map((item) => (
        <Link
          key={item.id}
          to={item.to}
          className="group flex items-center justify-between gap-4 bg-pf-editorial-surface px-4 py-3.5 text-sm font-semibold text-pf-editorial-ink transition-colors hover:bg-pf-editorial-raised hover:text-pf-editorial-accent focus-visible:z-10"
        >
          <span className="flex items-center gap-3">
            <ToolIcon path={item.icon} />
            {item.label}
          </span>
          <span className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">↗</span>
        </Link>
      ))}
    </div>
  );
}

function EditComposition() {
  const adjustments = [['Light', '+12'], ['Contrast', '+08'], ['Sharpness', '04']];

  return (
    <div className="relative min-h-[420px] overflow-hidden bg-pf-editorial-base p-4 sm:p-7">
      <div className="flex items-center justify-between border-b border-pf-editorial-line pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-pf-editorial-muted">
        <span>Canvas / Edit</span>
        <span>2048 × 1365 px</span>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_9rem]">
        <div className="relative min-h-[280px] overflow-hidden bg-pf-editorial-raised">
          <img src="/demo/res_color_after.png" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-[12%_14%] border border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.34)]">
            <span className="absolute -left-1 -top-1 h-2 w-2 border border-white bg-black" />
            <span className="absolute -bottom-1 -right-1 h-2 w-2 border border-white bg-black" />
            <span className="absolute left-1/3 top-0 h-full border-l border-dashed border-white/45" />
            <span className="absolute left-2/3 top-0 h-full border-l border-dashed border-white/45" />
          </div>
        </div>
        <div className="space-y-6 border-t border-pf-editorial-line pt-4 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          {adjustments.map(([label, value], index) => (
            <div key={label}>
              <div className="mb-2 flex justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-pf-editorial-muted">
                <span>{label}</span><span>{value}</span>
              </div>
              <div className="h-px bg-pf-editorial-line"><span className="block h-px bg-pf-editorial-accent" style={{ width: `${58 + index * 11}%` }} /></div>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-px bg-pf-editorial-line">
            <span className="bg-pf-editorial-surface py-3 text-center text-lg" aria-label="Rotate">↻</span>
            <span className="bg-pf-editorial-surface py-3 text-center text-lg" aria-label="Flip">↔</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptimizeComposition() {
  const rows = [
    ['File size', 'Source', 'Smaller output'],
    ['Format', 'JPEG', 'WEBP'],
    ['Metadata', 'EXIF / GPS / Camera', 'Removed'],
  ];

  return (
    <div className="relative overflow-hidden bg-pf-editorial-base px-5 py-7 sm:px-8 sm:py-10">
      <div className="mb-10 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-pf-editorial-muted">
        <span>Output inspection</span>
        <span className="text-pf-editorial-accent">Local processing</span>
      </div>
      <div className="space-y-0 border-t border-pf-editorial-line">
        {rows.map(([label, before, after], index) => (
          <div key={label} className="grid gap-3 border-b border-pf-editorial-line py-6 sm:grid-cols-[7rem_1fr_auto] sm:items-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-pf-editorial-muted">0{index + 1} / {label}</span>
            <span className="text-lg font-bold text-pf-editorial-ink sm:text-xl">{before}</span>
            <span className="flex items-center gap-3 text-sm font-semibold text-pf-editorial-accent"><span aria-hidden="true">→</span>{after}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 max-w-sm text-xs leading-5 text-pf-editorial-muted">Choose the quality, format, and privacy settings for each exported image.</p>
    </div>
  );
}

function UtilitiesComposition() {
  const swatches = [
    ['#16171B', 'bg-[#16171b]'],
    ['#7C6EA8', 'bg-[#7c6ea8]'],
    ['#C58A9F', 'bg-[#c58a9f]'],
    ['#E9E4DB', 'bg-[#e9e4db]'],
  ];

  return (
    <div className="grid min-h-[430px] overflow-hidden bg-pf-editorial-base sm:grid-cols-[1.25fr_0.75fr]">
      <div className="relative min-h-[300px] overflow-hidden">
        <img src="/demo/object_remove_after.png" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute bottom-6 right-5 border-b border-white/70 pb-1 text-[10px] font-bold uppercase tracking-[0.26em] text-white/80">PixelForge / Studio</span>
      </div>
      <div className="flex flex-col justify-between border-t border-pf-editorial-line p-5 sm:border-l sm:border-t-0 sm:p-7">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-pf-editorial-muted">Sample palette</p>
          <div className="mt-5 space-y-4">
            {swatches.map(([hex, color]) => (
              <div key={hex} className="flex items-center gap-3">
                <span className={`h-8 w-8 border border-pf-editorial-line ${color}`} />
                <span className="font-mono text-xs text-pf-editorial-ink">{hex}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t border-pf-editorial-line pt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-pf-editorial-muted">
          Extract color / Mark output
        </div>
      </div>
    </div>
  );
}

const COMPOSITIONS = {
  Edit: EditComposition,
  Optimize: OptimizeComposition,
  Utilities: UtilitiesComposition,
};

/** Editorial overview of the non-AI tool families. */
export default function CategoryShowcases() {
  return (
    <section id="tools" className="border-y border-pf-editorial-line bg-pf-editorial-surface py-16 sm:py-20">
      <div className="mx-auto max-w-pf-workspace px-pf-gutter">
        <div className="mb-10 grid gap-5 border-b border-pf-editorial-line pb-7 sm:grid-cols-2 sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-pf-editorial-accent">Tool library / Three families</p>
            <h2 className="mt-3 text-pf-title font-black tracking-[-0.04em] text-pf-editorial-ink">Built around<br />the image.</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-pf-editorial-muted sm:justify-self-end">Edit the frame, prepare the output, or inspect its visual language. Every tool opens directly into its workflow.</p>
        </div>

        {CATEGORIES.map((category, index) => {
          const Composition = COMPOSITIONS[category.title];
          const reversed = index === 1;

          return (
            <section key={category.title} className={`grid gap-8 py-14 lg:grid-cols-12 lg:items-center lg:gap-12 ${index === 0 ? 'pt-4' : 'border-t border-pf-editorial-line'}`} aria-labelledby={`tools-${category.title.toLowerCase()}`}>
              <div className={`${reversed ? 'lg:order-2' : ''} lg:col-span-7`}><Composition /></div>
              <div className="lg:col-span-5">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-pf-editorial-accent">0{index + 1}</span>
                  <h3 id={`tools-${category.title.toLowerCase()}`} className="text-sm font-bold uppercase tracking-[0.18em] text-pf-editorial-muted">{category.title}</h3>
                </div>
                <h4 className="mt-5 text-3xl font-black tracking-[-0.035em] text-pf-editorial-ink sm:text-4xl">
                  {category.title === 'Edit' && 'Shape the frame.'}
                  {category.title === 'Optimize' && 'Control the output.'}
                  {category.title === 'Utilities' && 'Read it. Mark it.'}
                </h4>
                <p className="mt-3 max-w-md text-base leading-7 text-pf-editorial-muted">
                  {category.title === 'Edit' && 'Adjust, resize, crop, rotate, and flip through one focused family of browser-based tools.'}
                  {category.title === 'Optimize' && 'Compress files, change formats, and remove embedded metadata before export.'}
                  {category.title === 'Utilities' && 'Extract a working color palette or add a text or image watermark to the output.'}
                </p>
                <ToolLinks items={category.items} />
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

ToolIcon.propTypes = {
  path: PropTypes.string.isRequired,
};

ToolLinks.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    icon: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  })).isRequired,
};
