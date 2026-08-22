# Frontend Architecture Baseline and Ownership Map

This document records the Phase 01 frontend architecture baseline at commit
`f7d7826bb2cf1cd9f7c24b700940481e768e02a8` (Phase 00, PR #199). It is a
migration map, not the post-migration architecture.

No production source, route, API contract, behavior, or styling is changed by
this phase.

## Evidence and baseline

The ownership map is based on the current source tree, static import consumers,
route registries, package scripts, lint configuration, and the existing test.
The directed source graph contains 165 JavaScript/JSX modules, 415 symbols, and
1,020 relationships. CSS and image assets were inspected separately because
they are not represented in that graph.

Current quality baseline:

| Check | Result |
|---|---|
| `npm run lint` | Pass |
| `npm run test -- --run` | Pass: 1 file, 6 tests |
| `npm run build` | Pass; Vite reports the existing duplicate static/dynamic import of `pages/Special/NotFound.jsx` |

The only frontend test is
`frontend/src/components/Workspace/display/ResultViewer/ResultViewer.test.jsx`.
It covers loading copy, delayed loading states, image load completion, and timer
cleanup for `ResultViewer`.

## Ownership rules for the migration

- `app` owns bootstrap composition, routing, persistent layout, navigation, and
  application-only pages.
- Each product tool owns its page, controls, hooks, service adapter, content,
  helpers, and tests.
- `shared` owns a responsibility only when current imports prove multiple
  independent feature consumers.
- Route/navigation categories (`AiFeatures`, `SmartEdit`, `Optimize`, and
  `Utilities`) are composition groups, not feature owners.
- Application composition may consume feature public surfaces. Features must
  not deep-import another feature's internals.

## Application ownership

| Current path and module | Current responsibility | Main consumers | Proposed owner | Action and evidence |
|---|---|---|---|---|
| `frontend/src/main.jsx` (`main`) | Mounts React and imports the global stylesheet and root application component. | Browser entry point | repository root bootstrap | **Keep.** The target layout keeps `main.jsx` at the source root. |
| `frontend/src/App.jsx` (`App`, `PageLoader`, `WorkspaceLoader`) | Owns `BrowserRouter`, route rendering, persistent chrome, legal-modal state, chatbot composition, and lazy-load fallbacks. | `main.jsx` | `app` with `app/layout` and `app/routing` collaborators | **Split when migrated.** Routing/loading and persistent layout are independently changeable app concerns; no split is performed in Phase 01. |
| `frontend/src/routes.js`; `frontend/src/routes/aiFeature.routes.js`; `frontend/src/routes/landing.routes.js`; `frontend/src/routes/optimize.routes.js`; `frontend/src/routes/smartEdit.routes.js`; `frontend/src/routes/special.routes.js`; `frontend/src/routes/utility.routes.js` | Compose lazy route registries for landing, AI, edit, optimize, utility, and special pages. | `App.jsx`; each category file is consumed by `routes.js` | `app/routing` | **Move.** These files compose the application and should consume deliberate feature entry points after each feature moves. |
| `frontend/src/components/Layout/Core/NavBar.jsx`; `frontend/src/components/Layout/Core/GlobalHeader.jsx`; `frontend/src/components/Layout/Core/Header.jsx`; `frontend/src/components/Layout/Core/Footer.jsx` | Persistent navigation, route-aware header, branding, and footer. | `App.jsx`; `Header.jsx` is consumed by `GlobalHeader.jsx` | `app/layout` | **Move.** All consumers are application composition modules. |
| `frontend/src/content/navigation/navConfig.js`; `frontend/src/content/navigation/headerConfig.js` | Defines route discovery groups and route-aware header copy. | `NavBar.jsx`, `GlobalHeader.jsx`, and `pages/Landing/Home.jsx` | `app/navigation` | **Move.** The data composes application routes; category names must not become feature folders. Keep the landing page app-owned to avoid `features -> app` imports. |
| `frontend/src/pages/Landing/Home.jsx`; `frontend/src/components/Landing/AmbientBackground.jsx`; `frontend/src/components/Landing/RotatingText.jsx`; `frontend/src/components/Common/BeforeAfterSlider.jsx`; `frontend/src/components/Common/CardIcon.jsx`; `frontend/src/components/Common/TiltCard.jsx`; `SHOWCASES` in `frontend/src/config.js` | Application landing/discovery experience and showcase-only presentation. | `/` in `landing.routes.js`; the listed components are consumed only by `Home.jsx` | `app/landing` | **Move together.** Despite the `Common` path, current consumers prove the three presentation components are landing-only. |
| `frontend/src/content/modals/legalModalData.jsx` | Legal content selected by the root shell. | `App.jsx` | `app/layout` or `app/legal` | **Move with the app shell.** It has one application-level consumer. |
| `frontend/src/pages/Special/ComingSoon.jsx`; `frontend/src/pages/Special/NotFound.jsx` | Application fallback pages. | `special.routes.js`; `NotFound.jsx` is also imported directly by `App.jsx` | `app/routing` | **Move and consolidate later.** `NotFound.jsx` has duplicate static/dynamic ownership, confirmed by the Vite warning. Preserve the wildcard behavior. |
| `frontend/src/assets/*` | Branding and chatbot image assets. | `frontend/src/config.js` | `assets` | **Keep (`NO ACTION`).** The target direction already keeps the asset root and there is no cohesion benefit from moving binary assets during feature migration. |
| `frontend/src/index.css` | Global Tailwind import, global font/style rules, and application-wide CSS. | `main.jsx` | `shared/styles` (or root entry while migrations run) | **Move only with import verification.** Phase 01 does not touch styling or CSS order. |
| `frontend/src/App.css` | Legacy stylesheet with no static import consumer. | None found | unowned candidate | **Verify.** Do not delete until runtime and repository-reference checks confirm it is obsolete. |

## Proven shared ownership

| Current path and module | Current responsibility | Main consumers | Proposed owner | Action and evidence |
|---|---|---|---|---|
| `frontend/src/components/Common/AppModals.jsx` | Generic modal shell. | `App.jsx`, `content/modals/WorkspaceModals.jsx`, `pages/Optimize/ConvertFormat.jsx` | `shared/components` | **Move.** It has independent app, AI-workspace, and conversion consumers. |
| `frontend/src/components/Common/CountdownTimer.jsx`; `frontend/src/components/Common/EmptyWorkspaceState.jsx`; `frontend/src/components/Common/ProgressBar.jsx` | Generic countdown, empty state, and progress presentation. | AI limit/modals, preview box, and AI controls | `shared/components` | **Move.** Each is presentation-only and supports more than one feature path. |
| `frontend/src/components/Layout/Tool/ToolPageWrapper.jsx`; `frontend/src/components/Layout/Tool/ToolStateWrapper.jsx`; `frontend/src/components/Layout/Tool/ToolWorkspaceShell.jsx`; `frontend/src/components/Layout/Tool/WorkspaceLayout.jsx` | Reusable workspace/page layout and upload/result state composition. | Multiple edit, optimize, utility, and AI workspaces | `shared/components/workspace` | **Move.** Static consumers span independent product tools. |
| `frontend/src/components/Upload/UploadCard.jsx`; `frontend/src/components/Upload/UploadDropzone.jsx`; `frontend/src/hooks/client/useFileUpload.js`; `frontend/src/hooks/client/useImagePaste.js` | File selection, drag/drop, paste, validation handoff, and upload UI. | AI workspace plus image editor, resize, rotate/flip, compress, convert, palette, watermark, crop, and metadata flows through the tool wrappers | `shared/components/upload` and `shared/hooks` | **Move.** Upload behavior is genuinely cross-feature. Preserve validation semantics. |
| `frontend/src/utils/file/fileValidation.js`; `frontend/src/utils/file/validators/errorMessages.js`; `frontend/src/utils/file/validators/grayscaleValidation.js`; `frontend/src/utils/file/validators/imageMetadata.js`; `frontend/src/utils/file/validators/imageOptimization.js`; `frontend/src/utils/file/validators/mimeValidation.js`; `frontend/src/utils/file/validators/resolutionValidation.js`; `frontend/src/utils/file/validators/runtimeLimits.js` | Stable upload-validation entry point, backend-limit lookup/cache, MIME/size/resolution checks, browser downscaling, metadata decode, and optional grayscale validation. | `useFileUpload.js`; validators call each other and `runtimeLimits.js` calls `apiClient.js` | `shared/validation` | **Move as one contract.** The public entry point is cross-feature; color restoration's grayscale option remains a parameter rather than owning the whole validator. |
| `frontend/src/services/base/apiClient.js` | HTTP response normalization, backend limit lookup, Azure SAS upload, generic AI init/start, and specialized object-mask upload. | Feature services, polling, and runtime-limit validation | `shared/api` plus a feature-owned object-removal adapter | **Split carefully.** Generic HTTP/Azure job transport is shared; `executeObjectRemoveJob` is feature-specific branching and should move with object removal without changing its contract. |
| `frontend/src/services/base/pollingService.js` | Polls `/result/{jobId}` and normalizes ready, failed, processing, and error states. | `services/apiService.js` | `shared/api` | **Move.** Four AI workflows consume it through the facade/action hook. |
| `frontend/src/hooks/actions/useActions.js`; `frontend/src/hooks/pipeline/usePipeline.js`; `frontend/src/hooks/auth/useUsageLimit.js`; `frontend/src/hooks/workspace/Core/useSessionPersistence.js`; `frontend/src/hooks/workspace/Core/useSimulatedProgress.js`; `frontend/src/utils/storage/idb.js`; `frontend/src/utils/storage/session.js`; `frontend/src/utils/storage/storageKeys.js` | Shared AI lifecycle: processing start, Turnstile token wait/reset, polling, quota UI, feature-scoped persistence, cancellation, progress, and result restoration. | All four AI feature pipeline/action adapters | `shared/hooks`, `shared/api`, and `shared/storage` | **Move as the proven AI lifecycle.** Four independent features use the same behavior. Preserve feature keys, storage migration, polling cadence, quotas, and expiration handling exactly. |
| `frontend/src/components/Workspace/AiFeatureWorkspace.jsx`; `frontend/src/components/Workspace/controls/AiFeatures/BaseToolControls.jsx`; `frontend/src/components/Actions/ResultActions.jsx`; `frontend/src/components/Workspace/cards/StagedFileCard.jsx`; `frontend/src/components/Workspace/cards/WorkspaceLimitCard.jsx`; `frontend/src/components/Workspace/cards/WorkspaceMarketing.jsx`; `frontend/src/components/Workspace/display/ResultViewer/ResultViewer.jsx`; `frontend/src/content/modals/WorkspaceModals.jsx` | Shared AI upload/process/result workspace, Turnstile mount, quota/error/result states, marketing slots, and result comparison/actions. | All four AI feature pages through `AiFeatureWorkspace.jsx` | `shared/components/ai-workspace` | **Move.** Current consumers prove cross-feature reuse. Keep feature-specific controls and marketing content out of this owner. |
| `frontend/src/components/Workspace/display/ResultViewer/ResultViewer.test.jsx` | Tests shared result loading and timer behavior. | `ResultViewer.jsx` | beside the shared result viewer | **Move with owner.** Tests follow the module they verify. |
| `frontend/src/hooks/workspace/Core/useWorkspaceFile.js`; `frontend/src/hooks/workspace/Core/useObjectUrlCleanup.js` | Client-side file/result object URL state and cleanup. | Multiple edit/optimize/utility pages; metadata uses URL cleanup directly | `shared/hooks` | **Move.** Independent browser tools share the lifecycle. |
| `frontend/src/components/Actions/WorkspaceActionRow.jsx`; `frontend/src/components/Workspace/display/PreviewImageBox.jsx`; `frontend/src/components/Workspace/display/WorkspaceErrorAlert.jsx`; `frontend/src/components/Workspace/display/WorkspaceFileSummary.jsx`; `frontend/src/components/Workspace/display/WorkspaceResultDownload.jsx`; `frontend/src/components/Workspace/Header/ClientSideHeader.jsx` | Repeated client-workspace actions, preview, error, file metadata, download, and heading UI. | Resize, rotate/flip, image editor, compress, convert, palette, and watermark in varying combinations | `shared/components/workspace` | **Move.** Consumers span multiple feature families. |
| `frontend/src/components/Workspace/controls/Editor/FitModeToggle.jsx`; `frontend/src/components/Workspace/controls/Editor/Magnifier.jsx` | Image fit and zoom controls. | Image editor, crop editor, and shared AI result viewer | `shared/components/image-viewer` | **Move.** These are not owned by a single editor feature. |
| `frontend/src/components/Workspace/controls/Convert/FormatDropdown.jsx` | Generic string-option dropdown with portal positioning, focus, and type-to-search behavior. | Convert page and watermark text controls | `shared/components/forms` | **Move without semantic changes.** Its current directory name is narrower than its actual consumers. Rename only if Phase 04 finds the old name harmful. |
| `frontend/src/utils/file/fileUtils.js` | File-size formatting, safe output filenames, extension comparison, and accepted MIME constants. | Upload UI and multiple edit/optimize/utility features | `shared/lib` | **Move.** The helpers have broad, non-feature-specific consumers. |
| `frontend/src/utils/image/imageUtils.js` | Generic canvas conversion, loading, safe dimensions, and resize processing. | Compression, conversion, resize, and metadata hooks | `shared/lib/image` | **Move.** Current consumers prove general browser-image processing ownership. |

## Feature ownership map

Paths in this table are relative to `frontend/src`.

Route registry files remain app-owned. Each route should consume the named
feature's public page surface after migration.

| Feature | Exact current modules | Current responsibility and consumers | Proposed owner | Action and cohesion reason |
|---|---|---|---|---|
| AI Upscaler | `pages/AiFeatures/UpscaleImage.jsx`; `components/Workspace/controls/AiFeatures/UpscaleControls.jsx`; `components/Workspace/controls/AiFeatures/ScaleSelector.jsx`; `hooks/pipeline/useUpscalePipeline.js`; `hooks/actions/useUpscaleActions.js`; `services/features/upscaleService.js`; `content/feature/upscaleMarketing.jsx` | `/upscale` page composition, scale state/control, feature adapter, `upscale` API call, and feature marketing. The route is the page consumer; wrappers feed the shared AI lifecycle. | `features/upscale` | **Move together.** These modules change for upscale-specific UI, payload, or copy. Keep shared lifecycle modules outside the feature. |
| Background Removal | `pages/AiFeatures/RemoveBackground.jsx`; `components/Workspace/controls/AiFeatures/RemoveBgControls.jsx`; `hooks/pipeline/useRemBGPipeline.js`; `hooks/actions/useRemBGActions.js`; `services/features/rembgService.js`; `content/feature/remBgMarketing.jsx` | `/remove-bg` page composition, transparent empty state, progress copy, `rembg` adapter/API call, and marketing. | `features/background-removal` | **Move together.** All modules have one product owner even though they are scattered across six technical folders. |
| Color Restoration | `pages/AiFeatures/ColorRestoration.jsx`; `components/Workspace/controls/AiFeatures/ColorRestoreControls.jsx`; `hooks/pipeline/useColorRestorePipeline.js`; `hooks/actions/useColorRestoreActions.js`; `services/features/colorRestoreService.js`; `content/feature/colorRestoreMarketing.jsx` | `/color-restoration` composition, grayscale-required upload option, progress copy, `colorrestore` API adapter, and marketing. | `features/color-restoration` | **Move together.** The grayscale rule is feature configuration; the validation implementation remains shared. |
| Object Removal | `pages/AiFeatures/ObjectRemover.jsx`; `components/Workspace/controls/AiFeatures/ObjectRemoveControls.jsx`; `components/Workspace/display/ObjectRemoveMaskCanvas.jsx`; `hooks/pipeline/useObjectRemovePipeline.js`; `hooks/actions/useObjectRemoveActions.js`; `services/features/objectRemoveService.js`; `content/feature/objectRemoverMarketing.jsx`; object-upload branch in `services/base/apiClient.js` | `/object-remove` composition, brush/mask state, mask canvas, two-blob API payload, progress copy, and marketing. | `features/object-removal` | **Move together and split the transport adapter.** The mask upload is unique to this feature; generic HTTP/Azure helpers remain shared. |
| Image Editor | `pages/SmartEdit/ImageEditor.jsx`; `components/Workspace/controls/Editor/ImageEditorFilters.jsx`; `hooks/workspace/Editor/useImageEditor.js`; `utils/image/editorUtils.js` | `/image-editor` filters, preview/export state, and filter rendering. Shared fit/zoom and workspace UI are external consumers. | `features/image-editor` | **Move together.** These modules have only the image editor as product consumer. |
| Resize | `pages/SmartEdit/ResizeImage.jsx`; `components/Workspace/controls/Editor/ResizeControls.jsx`; `hooks/workspace/Editor/useImageResize.js` | `/resize-image` dimensions/aspect state and resize controls; `ResizeControls.jsx` imports `MaxDimension` from the hook. | `features/resize` | **Move together.** Co-location contains the existing hook/control coupling; generic canvas processing stays shared. |
| Rotate / Flip | `pages/SmartEdit/RotateFlip.jsx`; `components/Workspace/controls/Editor/RotateFlipControls.jsx`; `hooks/workspace/Editor/useRotateFlip.js` | `/rotate-flip` orientation state, controls, preview transform, and export. | `features/rotate-flip` | **Move together.** All three modules have one route and one product responsibility. |
| Crop | `pages/SmartEdit/CropImage.jsx`; `components/Workspace/display/CropEditor.jsx`; `components/Workspace/Header/CropHeader.jsx`; `components/Workspace/controls/Editor/AspectRatioControls.jsx`; `components/Workspace/cards/WorkspaceSuccessCard.jsx`; `hooks/workspace/Editor/useImageCrop.js`; `utils/image/cropUtils.js`; `CROP_ASPECT_RATIOS` in `config.js` | `/crop-image` selection, crop geometry, aspect presets, crop canvas/export, and success state. `CropEditor` also consumes shared fit/zoom controls. | `features/crop` | **Move feature-only modules together.** Leave fit/zoom shared because other features consume them. |
| Compress | `pages/Optimize/CompressImage.jsx`; `hooks/client/useImageCompression.js` | `/compress-image` quality state and client-side JPEG generation; shared workspace and canvas helpers provide the rest. | `features/compress` | **Move together.** Both modules change with compression behavior. |
| Convert | `pages/Optimize/ConvertFormat.jsx`; `hooks/client/useImageConversion.js` | `/convert-format` target format/quality state, same-format confirmation, and canvas conversion. It consumes the cross-feature `FormatDropdown`. | `features/convert` | **Move page and hook.** Do not claim the dropdown as convert-owned because watermark also consumes it. |
| Metadata Removal | `pages/Optimize/MetadataWorkspace.jsx`; `hooks/workspace/Utility/useMetadataProcessor.js` | `/metadata` metadata extraction/removal and sanitized output. It consumes generic URL cleanup, tool state, and canvas helpers. | `features/metadata-removal` | **Move together.** The page and processor have one product owner; generic lifecycle remains shared. |
| Palette Extraction | `pages/Utilities/ColorPalette.jsx`; `components/Workspace/controls/Palette/ColorPaletteControls.jsx`; `components/Workspace/display/PaletteSwatches.jsx`; `hooks/client/usePaletteSampling.js`; `hooks/workspace/Utility/useColorPaletteEditor.js`; `utils/image/paletteMath.js` | `/color-palette` sampling points, palette state, display, clipboard interaction, and palette math. | `features/palette` | **Move together.** The modules are palette-specific despite being spread across page/component/hook/utility layers. |
| Watermark | `pages/Utilities/WatermarkAdder.jsx`; `components/Workspace/controls/Watermark/ImageWatermarkControls.jsx`; `components/Workspace/controls/Watermark/RichTextWatermarkInput.jsx`; `components/Workspace/controls/Watermark/TextWatermarkControls.jsx`; `components/Workspace/controls/Watermark/WatermarkModeTabs.jsx`; `components/Workspace/display/WatermarkPreviewOverlay.jsx`; `components/Workspace/controls/Common/ColorSwatches.jsx`; `components/Workspace/controls/Common/RangeSlider.jsx`; `components/Workspace/controls/Common/TextStyleToggles.jsx`; `hooks/workspace/Watermark/useTextWatermarkEditor.js`; `hooks/workspace/Watermark/useWatermark.js`; `utils/image/watermarkMath.js`; `utils/image/watermarkRender.js`; `utils/image/watermarkUtils.js`; `FontFamilies`, `WatermarkDefaulText`, `WatermarkDefaultImage`, and `WatermarkColors` in `config.js` | `/watermark-adder` text/image watermark state, controls, overlay, drag geometry, rendering, and defaults. The three `controls/Common` modules are consumed only by watermark controls. | `features/watermark` | **Move together.** Current consumers disprove the apparent global ownership of `controls/Common`. Keep only the generic dropdown and workspace primitives shared. |
| Chatbot | `pages/Special/FaqChatbotWidget.jsx`; `components/Bot/AnswerView.jsx`; `components/Bot/BackButton.jsx`; `components/Bot/CategoryView.jsx`; `components/Bot/ChatbotHeader.jsx`; `components/Bot/FabToggle.jsx`; `components/Bot/FeedbackView.jsx`; `components/Bot/HomeView.jsx`; `components/Bot/SearchView.jsx`; `components/Bot/TypingDots.jsx`; `hooks/bot/useFaqChatBot.js`; `content/bot/chatBotdata.js`; `content/bot/chatBotStyles.js` | Global FAQ/search widget and its internal view state. `App.jsx` mounts the widget; `FeedbackView.jsx` composes the feedback form into chatbot navigation. | `features/chatbot` | **Move together.** The widget is a product feature, not a special route. It should consume feedback through a deliberate public surface. |
| Feedback | `components/Bot/FeedbackForm.jsx`; `services/features/feedbackService.js`; feedback-related constants in `config.js` | Turnstile-protected feedback form, local submission limit, and `/feedback` request. `FeedbackView.jsx` is the form's product consumer through the API facade. | `features/feedback` | **Move form, service, and constants together.** Expose only the form/view contract needed by chatbot; do not make feedback an internal chatbot implementation. |

## Mixed-owner modules that require splitting

| Current path | Proven mixed responsibilities | Proposed split | Maintenance cost |
|---|---|---|---|
| `frontend/src/config.js` | API/fallback limits; validation thresholds; legacy/runtime/feedback storage keys; branding assets; AI limits/result labels; crop presets; landing showcases; watermark defaults. It has more than twenty static consumers across app, shared, and feature code. | Shared runtime/validation configuration; app branding/landing data; AI lifecycle configuration; crop constants; watermark constants; feedback constants. | A feature-only configuration change currently touches a global module imported by unrelated features, obscuring ownership and increasing merge/conflict scope. |
| `frontend/src/services/apiService.js` | Imports five feature services plus shared polling, then exposes one facade used by AI action hooks and the feedback form. | Feature services imported by their owning adapters; shared polling imported by the shared lifecycle; feedback service imported through the feedback public surface. | Moving one feature while retaining the facade would make feature modules depend on a central module that imports sibling features. |
| `frontend/src/services/base/apiClient.js` | Generic HTTP/Azure AI-job transport plus the object-removal two-upload workflow. | Keep generic request/upload/job helpers shared; move the object-removal orchestration adapter to `features/object-removal`. | A unique mask contract currently lives in the generic base client and must change for object-removal-specific payload evolution. |
| `frontend/src/components/Common/` | Contains truly shared modal/state components and landing-only presentation components. | Shared components versus `app/landing`. | The directory name currently suggests reuse that the import graph does not support. |
| `frontend/src/components/Workspace/controls/Common/` | All three modules are consumed only by watermark text controls. | `features/watermark/components`. | The apparent shared location hides a single product owner. |

## Concrete coupling and migration risks

1. `App.jsx` and `routes/special.routes.js` both own the wildcard Not Found
   rendering path. Vite confirms this with a static/dynamic import warning.
2. `services/apiService.js` creates a central cross-feature dependency: shared AI
   actions and feedback import a facade that imports every feature service.
3. `config.js` mixes independently changing app, validation, AI, crop,
   watermark, and feedback constants behind one import surface.
4. `AiFeatureWorkspace.jsx` is correctly shared by four tools, but it also
   reaches into global config and modal/marketing presentation. Its migration
   must preserve all current result, quota, upload, and alert states without
   absorbing feature-specific controls.
5. `FormatDropdown.jsx` is stored under `controls/Convert` but is also used for
   watermark font selection; moving it with convert would create a feature-to-
   feature deep import.
6. `FaqChatbotWidget.jsx` is stored under `pages/Special` even though it is
   mounted globally by `App.jsx`; feedback is embedded inside it but has its own
   backend service and rate/Turnstile behavior.
7. The migration has only one existing frontend test surface. File upload,
   client canvas tools, AI polling, session restoration, and most feature states
   are not covered by automated frontend tests.

## Verify before move or deletion

| Current path | Static finding | Classification |
|---|---|---|
| `frontend/src/components/Workspace/cards/WorkspaceSectionCard.jsx` | No static import consumer found. | **Verify**, then remove in Phase 04 if still unused. |
| `frontend/src/components/Workspace/controls/Palette/PaletteStyleToggle.jsx` | No static import consumer found; `ColorPalette.jsx` currently renders its own style controls. | **Verify**, then remove in Phase 04 if still unused. |
| `frontend/src/App.css` | No static import consumer found. | **Verify**, then remove in Phase 04 if no runtime/build reference exists. |
| Legacy job keys in `STORAGE_KEYS` inside `frontend/src/config.js` | AI session code uses `makeStorageKeys`; only feedback and runtime-limit keys have direct consumers in the static graph. | **Verify** each key before the config split; do not remove storage compatibility early. |

## Proposed migration order

### Phase 02: application foundation and AI features

1. Move app routing/layout composition without changing URLs or lazy loading;
   consolidate the duplicate Not Found owner.
2. Establish only the shared upload, validation, API transport, AI lifecycle,
   storage, and AI-workspace modules required by multiple current AI consumers.
3. Migrate **Upscale** first as the standard one-image workflow and verify its
   route, upload, Turnstile, polling, result, cancellation, quota, and restore
   behavior.
4. Migrate **Background Removal**, which uses the same transport but has a
   distinct result/preview presentation.
5. Migrate **Color Restoration**, preserving the shared validator's grayscale
   option and browser auto-optimization behavior.
6. Migrate **Object Removal** last because its mask canvas and two-upload API
   adapter are unique.
7. Leave a minimal API facade only where an unmigrated consumer still requires
   it; do not create feature-to-feature imports.

### Phase 03: remaining features

1. Migrate **Resize** and **Rotate / Flip** to validate the client-workspace
   boundary with small, isolated tools.
2. Migrate **Compress**, **Convert**, and **Metadata Removal**, retaining the
   shared canvas/file lifecycle and the cross-feature dropdown.
3. Migrate **Image Editor** and **Crop**, keeping proven fit/zoom controls shared.
4. Migrate **Palette Extraction**, then **Watermark** with its currently
   misclassified `controls/Common` modules.
5. Migrate **Feedback**, then **Chatbot**, so chatbot consumes an intentional
   feedback surface rather than feedback internals.
6. Move the landing/discovery implementation under app ownership after all
   feature destinations expose stable public route surfaces.

### Phase 04: stabilization

1. Remove any temporary facades/re-exports after all consumers move.
2. Enforce `app -> features -> shared`; check circular dependencies and deep
   feature imports.
3. Resolve verified dead candidates and split remaining mixed-owner config.
4. Move the existing result-viewer test with its owner and add only regression
   coverage justified by migrated behavior.
5. Update the durable architecture documentation after the migration, then
   confirm the application still looks and behaves the same.

## `NO ACTION`

- No production source is moved in Phase 01.
- No `app`, `features`, or `shared` folder is created until real code moves in
  Phase 02.
- No backend production or test file is changed.
- No visual, CSS, typography, spacing, or interaction change is justified in
  this architecture-baseline phase.
- Navigation groups remain navigation groups; no `smart-edit`, `optimize`, or
  `utilities` god feature is proposed.
- Binary assets remain in `frontend/src/assets`.
- No dependency, registry, event bus, state library, or speculative abstraction
  is added.

## `NEEDS RUNTIME VERIFICATION`

- AI upload/init/start/poll/result flows require a configured backend, Azure,
  provider, database quota state, and valid Turnstile environment.
- Feature-scoped session restoration and expiry require browser reload testing
  with IndexedDB and localStorage.
- Object-removal brush input and mask-blob generation require pointer/canvas
  interaction testing.
- Browser-side resize, rotate/flip, crop, edit, compress, convert, metadata,
  palette, and watermark output correctness requires real image and Canvas/File
  API testing; lint/test/build do not prove pixel output.
- The three unreferenced candidates above require a runtime/build reference check
  before deletion.
