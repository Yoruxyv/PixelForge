import PropTypes from 'prop-types';

/** Compact source metadata and current processing state. */
export default function StagedFileCard({ selectedFile, isProcessing, resultUrl }) {
  if (!selectedFile) return null;

  let status = 'Ready';
  if (isProcessing) status = 'Processing';
  if (resultUrl) status = 'Complete';

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-pf-editorial-accent">
          01 / Source
        </p>
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-pf-editorial-muted">
          {status}
        </span>
      </div>
      <p className="mt-3 truncate text-sm font-bold text-pf-editorial-ink" title={selectedFile.name}>
        {selectedFile.name}
      </p>
      <div className="mt-2 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.1em] text-pf-editorial-muted">
        <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
        {selectedFile.type && <span>{selectedFile.type.replace('image/', '')}</span>}
      </div>
    </div>
  );
}

StagedFileCard.propTypes = {
  selectedFile: PropTypes.shape({
    name: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    type: PropTypes.string,
  }),
  isProcessing: PropTypes.bool,
  resultUrl: PropTypes.string,
};
