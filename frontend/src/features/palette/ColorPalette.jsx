import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import UploadCard from '@/shared/components/upload/UploadCard';
import ToolWorkspaceShell from '@/shared/components/workspace/ToolWorkspaceShell';
import ToolPageWrapper from '@/shared/components/workspace/ToolPageWrapper';
import PreviewImageBox from '@/shared/components/workspace/PreviewImageBox';
import WorkspaceErrorAlert from '@/shared/components/workspace/WorkspaceErrorAlert';
import ClientSideHeader from '@/shared/components/workspace/ClientSideHeader';

import { useWorkspaceFile } from '@/shared/hooks/useWorkspaceFile';
import ColorPaletteControls from './ColorPaletteControls';
import PaletteSwatches from './PaletteSwatches';
import usePaletteSampling from './usePaletteSampling';
import { useColorPaletteEditor } from './useColorPaletteEditor';

/**
 * Interactive color palette extraction tool.
 * Allows users to upload an image, position sampling points,
 * generate a color palette, and copy extracted colors.
 *
 * @returns {JSX.Element}
 */
export default function ColorPalette() {
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);
  const previewContainerRef = useRef(null);

  const [copiedHex, setCopiedHex] = useState(null);
  const [paletteStyle, setPaletteStyle] = useState(() => {
    if (typeof window === 'undefined') return 'square';
    return localStorage.getItem('paletteStyle') || 'square';
  });

  const {
    file,
    previewUrl,
    error,
    setError,
    onFileChange,
    resetAll: resetWorkspaceFile,
  } = useWorkspaceFile(fileInputRef);

  const {
    isProcessing,
    setIsProcessing,
    palette,
    setPalette,
    samplePaletteFromPoints,
  } = usePaletteSampling({ previewUrl, setError });

  const {
    paletteCount,
    paletteVariation,
    points,
    imageRect,
    handlePaletteCountChange,
    handleVariationChange,
    onPointPointerDown,
    onPointKeyDown,
    updateImageRect,
    resetEditor,
  } = useColorPaletteEditor({
    previewUrl,
    samplePaletteFromPoints,
    imageRef,
    previewContainerRef,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('paletteStyle', paletteStyle);
    }
  }, [paletteStyle]);

  /**
   * Resets the workspace to its initial state.
   * Clears the uploaded image, extracted palette,
   * copied color state, processing state, and editor data.
   */
  const handleReset = useCallback(() => {
    resetWorkspaceFile();
    setPalette([]);
    setIsProcessing(false);
    setCopiedHex(null);
    resetEditor();
  }, [resetWorkspaceFile, setIsProcessing, setPalette, resetEditor]);

  /**
   * Copies a color value to the clipboard and temporarily
   * marks it as the most recently copied color.
   *
   * @param {string} hex - Hex color value to copy.
   */
  const copyToClipboard = useCallback((hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  }, []);

  return (
    <ToolPageWrapper>
      <ToolWorkspaceShell
        minHeight="min-h-96"
        leftHeader={
          <ClientSideHeader
            category="Utilities / 02"
            title="Sampling controls"
            description="Move sampling points over the image, refine the variation, and copy colors directly."
          />
        }
        leftBody={
          <>
            {!file && (
              <div className="mb-4 min-h-32">
                <UploadCard
                  inputId="palette-file-input"
                  inputRef={fileInputRef}
                  onChange={onFileChange}
                  helperText="Any format up to 10MB"
                  maxSizeMB={10}
                  hasActiveFile={Boolean(file)}
                />
              </div>
            )}

            <ColorPaletteControls
              paletteCount={paletteCount}
              paletteVariation={paletteVariation}
              onCountChange={handlePaletteCountChange}
              onVariationChange={handleVariationChange}
              disabled={!file}
            />

            <AnimatePresence>
              {palette.length > 0 && (
                <motion.div
                  key="palette-wrapper"
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 flex flex-col"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-pf-editorial-ink">
                      Palette
                    </h3>
                    <div className="inline-flex border border-pf-editorial-line bg-pf-editorial-base p-1 text-[0.65rem] font-semibold">
                      <button
                        type="button"
                        onClick={() => setPaletteStyle('square')}
                        aria-pressed={paletteStyle === 'square'}
                        className={`rounded-pf-control px-2.5 py-1 transition-colors ${
                          paletteStyle === 'square'
                            ? 'bg-pf-editorial-accent text-white'
                            : 'text-pf-editorial-muted hover:bg-pf-editorial-raised hover:text-pf-editorial-ink'
                        }`}
                      >
                        Square
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaletteStyle('circle')}
                        aria-pressed={paletteStyle === 'circle'}
                        className={`rounded-pf-control px-2.5 py-1 transition-colors ${
                          paletteStyle === 'circle'
                            ? 'bg-pf-editorial-accent text-white'
                            : 'text-pf-editorial-muted hover:bg-pf-editorial-raised hover:text-pf-editorial-ink'
                        }`}
                      >
                        Circle
                      </button>
                    </div>
                  </div>

                  <PaletteSwatches
                    palette={palette.map((hex, i) => ({
                      id: points[i]?.id ?? i,
                      hex,
                    }))}
                    paletteStyle={paletteStyle}
                    copiedHex={copiedHex}
                    onCopy={copyToClipboard}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <WorkspaceErrorAlert error={error} />
          </>
        }
        leftFooter={
          <div className="flex flex-col gap-3">
            {file && (
              <button
                onClick={handleReset}
                disabled={isProcessing}
                className="inline-flex w-full items-center justify-center rounded-pf-control border border-pf-editorial-line bg-transparent px-5 py-3 text-sm font-semibold text-pf-editorial-muted transition-colors hover:border-pf-editorial-muted hover:text-pf-editorial-ink disabled:cursor-not-allowed disabled:opacity-45"
              >
                Upload Another Image
              </button>
            )}
          </div>
        }
        rightHeader={
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-pf-editorial-ink">Sampling canvas</h2>
            <span className="font-mono text-[0.65rem] uppercase tracking-wider text-pf-editorial-muted">{paletteCount} points</span>
          </div>
        }
        rightBody={
          <div className="absolute inset-2 flex flex-col">
            <PreviewImageBox
              previewUrl={previewUrl}
              isProcessing={isProcessing}
              imageRef={imageRef}
              onImageLoad={updateImageRect}
              previewClassName="opacity-100 transition-all duration-200"
              containerRef={previewContainerRef}
            >
              {previewUrl &&
                points.map((p, i) => {
                  const hex = palette[i] || '#ffffff';
                  return (
                    <motion.button
                      key={`picker-${p.id}`}
                      onPointerDown={(e) => onPointPointerDown(e, p.id)}
                      onKeyDown={(event) => onPointKeyDown(event, p.id)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-white/90 shadow-[0_0_0_1px_rgba(15,23,42,0.55)] active:cursor-grabbing"
                      initial={false}
                      animate={{
                        left: imageRect.left + p.x * imageRect.width,
                        top: imageRect.top + p.y * imageRect.height,
                        backgroundColor: hex,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 25,
                        mass: 0.8,
                      }}
                      style={{ width: 22, height: 22 }}
                      title={`${hex.toUpperCase()} · Use arrow keys to move`}
                      aria-label={`Move color picker ${i + 1}. Use arrow keys to adjust its position.`}
                    />
                  );
                })}
            </PreviewImageBox>
          </div>
        }
      />
    </ToolPageWrapper>
  );
}
