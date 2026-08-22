/**
 * Metadata removal workspace page.
 *
 * Lets users inspect detected image metadata, remove it locally, and download
 * the cleaned file without changing the processor contract.
 */

import { useMemo } from 'react';
import ToolPageWrapper from '@/shared/components/workspace/ToolPageWrapper';
import ToolStateWrapper from '@/shared/components/workspace/ToolStateWrapper';
import ClientSideHeader from '@/shared/components/workspace/ClientSideHeader';
import { useObjectUrlCleanup } from '@/shared/hooks/useObjectUrlCleanup';
import { bytesToMB } from '@/shared/lib/fileUtils';
import { useMetadataProcessor } from './useMetadataProcessor';

const formatKey = (key) =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, (character) => character.toUpperCase());

/** @returns {JSX.Element} */
export default function MetadataWorkspace() {
  const {
    selectedFile,
    previewUrl,
    metadata,
    strippedUrl,
    isProcessing,
    isClean,
    handleFileSelect,
    handleCancel,
  } = useMetadataProcessor();

  const trackedUrls = useMemo(
    () => [previewUrl, strippedUrl],
    [previewUrl, strippedUrl],
  );
  useObjectUrlCleanup(trackedUrls);

  const metadataRows = useMemo(
    () =>
      Object.entries(metadata || {}).filter(
        ([, value]) => typeof value === 'string' || typeof value === 'number',
      ),
    [metadata],
  );

  return (
    <ToolPageWrapper>
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-6 max-w-xl">
          <ClientSideHeader
            category="Utilities / 01"
            title="Privacy scan"
            description="Inspect embedded image data, strip it locally, and download a clean copy ready to share."
          />
        </div>

        <ToolStateWrapper
          file={selectedFile}
          error={null}
          isProcessing={isProcessing}
          processingText="Scanning the image for embedded data..."
          onFileSelect={handleFileSelect}
          onReset={handleCancel}
        >
          {selectedFile && !isProcessing && isClean ? (
            <div className="grid overflow-hidden rounded-pf-card border border-pf-editorial-line bg-pf-editorial-surface lg:grid-cols-[1.1fr_0.9fr]">
              <figure className="flex min-h-96 items-center justify-center bg-pf-editorial-footer p-5">
                <img src={previewUrl} alt="Uploaded preview" className="max-h-[32rem] w-full object-contain" />
              </figure>
              <div className="flex flex-col justify-center border-t border-pf-editorial-line p-pf-panel lg:border-l lg:border-t-0">
                <span className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-pf-success">
                  Scan complete · 0 fields found
                </span>
                <h2 className="text-3xl font-semibold tracking-[-0.03em] text-pf-editorial-ink">
                  No embedded metadata
                </h2>
                <p className="mt-3 text-sm leading-6 text-pf-editorial-muted">
                  This file does not contain readable EXIF, location, or camera fields. No new copy is needed.
                </p>
                <dl className="mt-8 grid grid-cols-2 border-y border-pf-editorial-line py-4">
                  <div>
                    <dt className="text-[0.6rem] uppercase tracking-wider text-pf-editorial-muted">File</dt>
                    <dd className="mt-1 truncate text-sm font-semibold text-pf-editorial-ink">{selectedFile.name}</dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-[0.6rem] uppercase tracking-wider text-pf-editorial-muted">Size</dt>
                    <dd className="mt-1 font-mono text-sm text-pf-editorial-ink">{bytesToMB(selectedFile.size)} MB</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="mt-6 rounded-pf-control border border-pf-editorial-line px-5 py-3 text-sm font-semibold text-pf-editorial-muted transition-colors hover:border-pf-editorial-muted hover:text-pf-editorial-ink"
                >
                  Scan another image
                </button>
              </div>
            </div>
          ) : null}

          {selectedFile && !isProcessing && !isClean ? (
            <div className="grid overflow-hidden rounded-pf-card border border-pf-editorial-line bg-pf-editorial-surface lg:grid-cols-2">
              <article className="flex min-h-0 flex-col p-pf-panel">
                <div className="mb-4 flex items-baseline justify-between gap-4">
                  <h2 className="text-lg font-semibold text-pf-editorial-ink">Original file</h2>
                  <span className="font-mono text-[0.65rem] uppercase tracking-wider text-pf-danger">
                    {metadataRows.length} fields
                  </span>
                </div>
                <figure className="flex h-60 items-center justify-center rounded-pf-control border border-pf-editorial-line bg-pf-editorial-footer p-3">
                  <img src={previewUrl} alt="Original preview" className="h-full w-full object-contain" />
                </figure>
                <div className="mt-5 min-h-0 flex-1 border-t border-pf-editorial-line pt-4">
                  <h3 className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-pf-editorial-muted">
                    Detected metadata
                  </h3>
                  <dl className="max-h-64 overflow-y-auto pr-2">
                    {metadataRows.map(([key, value]) => (
                      <div key={key} className="grid grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.2fr)] gap-4 border-b border-pf-editorial-line py-2 text-sm">
                        <dt className="text-pf-editorial-muted">{formatKey(key)}</dt>
                        <dd className="truncate text-right font-mono text-xs text-pf-editorial-ink" title={String(value)}>
                          {String(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>

              <article className="flex flex-col border-t border-pf-editorial-line bg-pf-editorial-base p-pf-panel lg:border-l lg:border-t-0">
                <div className="mb-4 flex items-baseline justify-between gap-4">
                  <h2 className="text-lg font-semibold text-pf-editorial-ink">Cleaned output</h2>
                  <span className="font-mono text-[0.65rem] uppercase tracking-wider text-pf-success">Metadata stripped</span>
                </div>
                <figure className="flex h-60 items-center justify-center rounded-pf-control border border-pf-editorial-line bg-pf-editorial-footer p-3">
                  <img src={strippedUrl} alt="Cleaned output" className="h-full w-full object-contain" />
                </figure>
                <div className="flex flex-1 flex-col justify-center py-8">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-pf-editorial-accent">Ready to share</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-pf-editorial-ink">A clean local copy</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-pf-editorial-muted">
                    The generated image keeps its visible pixels while removing the detected embedded fields.
                  </p>
                </div>
                <div className="grid gap-3 border-t border-pf-editorial-line pt-5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-pf-control border border-pf-editorial-line px-5 py-3 text-sm font-semibold text-pf-editorial-muted transition-colors hover:border-pf-editorial-muted hover:text-pf-editorial-ink"
                  >
                    Scan another
                  </button>
                  <a
                    href={strippedUrl}
                    download={`Cleaned-${selectedFile.name}`}
                    className="flex items-center justify-center rounded-pf-control bg-pf-editorial-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-pf-accent-hover"
                  >
                    Download clean image
                  </a>
                </div>
              </article>
            </div>
          ) : null}
        </ToolStateWrapper>
      </section>
    </ToolPageWrapper>
  );
}
