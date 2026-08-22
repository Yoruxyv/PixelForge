import PropTypes from 'prop-types';

/**
 * Displays a success card with the generated result, reset actions, and download options.
 * @param {Object} props - The component props.
 * @param {string} [props.title='Task Successful!'] - Header title text.
 * @param {string} [props.description='Your file is ready to use.'] - Subtitle description text.
 * @param {string} [props.resultUrl] - Object URL of the generated output image.
 * @param {string} [props.downloadName] - Formatted filename string for the download link.
 * @param {Function} props.onReset - Callback to clear the workspace and start over.
 * @param {string} [props.resetText='Start Over'] - Custom label for the reset button.
 * @param {string} [props.downloadText='Download File'] - Custom label for the download button.
 * @param {React.ReactNode} [props.icon] - Optional custom icon to replace the default checkmark.
 * @param {string} [props.imageContainerStyle='max-h-[500px] h-auto overflow-y-auto result-scroll p-2'] - CSS classes for the preview image container.
 * @returns {JSX.Element}
 */
export default function WorkspaceSuccessCard({
  title = 'Task complete',
  description = 'Your file is ready to use.',
  resultUrl,
  downloadName,
  onReset,
  resetText = 'Start Over',
  downloadText = 'Download File',
  icon,
  imageContainerStyle = 'max-h-[500px] h-auto overflow-y-auto result-scroll p-2'
}) {
  const DefaultIcon = (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center border-y border-pf-editorial-line py-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center text-pf-editorial-accent">
        {icon || DefaultIcon}
      </div>
      
      <h3 className="mb-2 text-2xl font-semibold text-pf-editorial-ink">{title}</h3>
      <p className="mb-6 text-pf-editorial-muted">{description}</p>

      {resultUrl && (
        <div className="mb-8 flex w-full max-w-xl flex-col items-center overflow-hidden rounded-pf-control border border-pf-editorial-line bg-pf-editorial-footer">
           <div className={`w-full ${imageContainerStyle}`}>
              <img 
                src={resultUrl} 
                alt="Result preview" 
                className="block h-auto w-full"
              />
           </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-2 w-full">
        <button
          onClick={onReset}
          className="w-full rounded-pf-control border border-pf-editorial-line bg-transparent py-2.5 text-sm font-semibold text-pf-editorial-muted transition-colors hover:border-pf-editorial-muted hover:text-pf-editorial-ink sm:w-40"
        >
          {resetText}
        </button>
        <a
          href={resultUrl}
          download={downloadName}
          className="flex w-full items-center justify-center rounded-pf-control bg-pf-editorial-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pf-accent-hover sm:w-48"
        >
          {downloadText}
        </a>
      </div>
    </div>
  );
}

WorkspaceSuccessCard.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  resultUrl: PropTypes.string,
  downloadName: PropTypes.string,
  onReset: PropTypes.func.isRequired,
  resetText: PropTypes.string,
  downloadText: PropTypes.string,
  icon: PropTypes.node,
  imageContainerStyle: PropTypes.string,
};
