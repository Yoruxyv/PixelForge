import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { bytesToMB } from '@/shared/lib/fileUtils';

/**
 * Displays the final result size comparison and the download action button.
 * @param {Object} props - The component props.
 * @param {string} props.resultUrl - The object URL linking to the blob.
 * @param {Blob} props.resultBlob - The exported Blob object payload.
 * @param {File} props.originalFile - The source File object payload.
 * @param {string} props.downloadName - Formatted string for the file download name.
 * @param {string} [props.downloadLabel='Download Image'] - Text for the action button.
 * @returns {JSX.Element | null}
 */
export default function WorkspaceResultDownload({
  resultUrl,
  resultBlob,
  originalFile,
  downloadName,
  downloadLabel = 'Download Image',
}) {
  if (!resultUrl) return null;

  const originalSize = originalFile?.size || 0;
  const newSize = resultBlob?.size || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 flex shrink-0 flex-col gap-3"
    >
      {originalFile && resultBlob && (
        <div className="flex w-full items-center justify-between border-y border-pf-editorial-line px-1 py-3">
            <div className="flex flex-col">
              <span className="mb-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-pf-editorial-muted">
                Original
              </span>
              <span className="font-mono text-sm font-semibold text-pf-editorial-ink">
                {bytesToMB(originalSize)} MB
              </span>
            </div>

            <div className="flex items-center justify-center px-4 text-pf-editorial-muted" aria-hidden="true">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </div>

            <div className="flex flex-col text-right">
              <span className="mb-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-pf-editorial-accent">
                Output
              </span>
              <span className="font-mono text-sm font-semibold text-pf-editorial-ink">
                {bytesToMB(newSize)} MB
              </span>
            </div>
        </div>
      )}

      <a
        href={resultUrl}
        download={downloadName}
        className="inline-flex w-full items-center justify-center gap-2 rounded-pf-control bg-pf-editorial-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-pf-accent-hover"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        {downloadLabel}
      </a>
    </motion.div>
  );
}

WorkspaceResultDownload.propTypes = {
  resultUrl: PropTypes.string,
  resultBlob: PropTypes.shape({ size: PropTypes.number }),
  originalFile: PropTypes.shape({ size: PropTypes.number }),
  downloadName: PropTypes.string.isRequired,
  downloadLabel: PropTypes.string,
};
