import PropTypes from 'prop-types';
import CountdownTimer from '@/shared/components/common/CountdownTimer';

/** Daily quota exhausted state for AI workspaces. */
export default function WorkspaceLimitCard({
  maxLimit,
  resetTimestamp,
  featureText,
}) {
  return (
    <div className="grid min-h-[34rem] border border-pf-editorial-line bg-pf-editorial-surface lg:grid-cols-2">
      <div className="flex flex-col justify-between border-b border-pf-editorial-line p-8 lg:border-b-0 lg:border-r lg:p-12">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-pf-editorial-accent">
          Usage / Paused
        </p>
        <div className="py-16 lg:py-0">
          <h2 className="max-w-md text-4xl font-black tracking-[-0.045em] text-pf-editorial-ink sm:text-5xl">
            Daily limit reached.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-pf-editorial-muted">
            You have used all {maxLimit} free {featureText} for this period. Your workspace will reopen automatically.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-pf-editorial-raised p-8 text-center lg:p-12">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-pf-editorial-muted">
            Available again in
          </p>
          <div className="mt-4 font-mono text-4xl font-bold tracking-[-0.04em] text-pf-editorial-ink sm:text-5xl">
            <CountdownTimer targetTimestamp={resetTimestamp} />
          </div>
        </div>
      </div>
    </div>
  );
}

WorkspaceLimitCard.propTypes = {
  maxLimit: PropTypes.number.isRequired,
  resetTimestamp: PropTypes.number,
  featureText: PropTypes.string.isRequired,
};
