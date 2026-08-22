# Adding a New AI Feature to PixelForge

> A practical developer guide for adding a new AI-powered image feature to PixelForge without breaking the shared backend/frontend pipeline.

---

## 1. The Big Picture

PixelForge AI features follow a consistent workflow:

```txt
POST /{feature}/init
  -> verify Turnstile
  -> check usage limit
  -> create job_id
  -> create safe_filename
  -> return Azure upload_url

Frontend uploads image directly to Azure

POST /{feature}/start
  -> reserve queue slot
  -> increment usage
  -> run AI job in background

GET /result/{job_id}
  -> poll until ready, failed, or processing
```

Most features only need **one uploaded image**.

Some special features, like **Object Remove**, need extra generated files such as a mask image:

```txt
Object Remove:
original image + generated mask image -> AI model
```

---

## 2. Naming Rules

Choose one stable feature key and reuse it everywhere.

Example:

| Purpose | Example |
|---|---|
| Feature key | `cartoonize` |
| Display name | `Cartoonize` |
| Frontend route | `/cartoonize` |
| Init endpoint | `/cartoonize/init` |
| Start endpoint | `/cartoonize/start` |
| Usage key | `cartoonize` |
| Storage key prefix | `cartoonize_*` |

Recommended format:

```txt
lowercase
no spaces
no uppercase
short but clear
```

Good examples:

```txt
upscale
rembg
colorrestore
objectremove
cartoonize
denoise
```

Avoid:

```txt
ObjectRemove
object-remove
object remove
removeObjectAI
```

---

## 3. Backend Files

### Backend checklist

For a normal one-image AI feature, usually edit or create these files:

```txt
backend/domain/ai_features.py
backend/core/config.py
backend/core/model_registry.py
backend/api/schemas/ai_tools.py
backend/api/routes/ai_tools/<feature>.py
backend/api/routes/router.py
backend/services/ai/features/<feature_service>.py
backend/services/job/job_manager.py
```

For special features with extra uploads or custom model inputs, also check:

```txt
backend/services/job/job_initializer.py
backend/services/ai/features/<feature_service>.py
```

---

## 4. Backend Step-by-Step

Assume we are adding:

```txt
feature key: cartoonize
display name: Cartoonize
```

---

### 4.1 Update `backend/domain/ai_features.py`

Add the feature key to `FeatureType`.

```py
from typing import Literal

FeatureType = Literal[
    "upscale",
    "rembg",
    "colorrestore",
    "objectremove",
    "cartoonize",
]


FEATURE_DISPLAY_NAMES: dict[FeatureType, str] = {
    "upscale": "Upscale",
    "rembg": "RemBG",
    "colorrestore": "Color Restore",
    "objectremove": "Object Remove",
    "cartoonize": "Cartoonize",
}
```

Why this matters:

- FastAPI validates `{feature}` path parameters from routes like `/{feature}/init`
- Unsupported feature names are rejected before reaching the job logic
- Display names are used for user-facing backend responses

---

### 4.2 Update `backend/core/config.py`

Add a daily limit setting:

```py
CARTOONIZE_DAILY_USAGE_LIMIT: int = 5
```

Then add it to `FEATURE_LIMITS`:

```py
@property
def FEATURE_LIMITS(self) -> Dict[str, int]:
    return {
        "upscale": self.UPSCALE_DAILY_USAGE_LIMIT,
        "rembg": self.REMBG_DAILY_USAGE_LIMIT,
        "colorrestore": self.COLOR_RESTORE_DAILY_USAGE_LIMIT,
        "objectremove": self.OBJECT_REMOVE_DAILY_USAGE_LIMIT,
        "cartoonize": self.CARTOONIZE_DAILY_USAGE_LIMIT,
        "feedback": self.FEEDBACK_DAILY_USAGE_LIMIT,
    }
```

Why this matters:

- `/usage?feature=cartoonize` needs this
- `/{feature}/init` checks this before allowing uploads
- `/cartoonize/start` checks again before reserving the job

---

### 4.3 Update `backend/core/model_registry.py`

Register the AI model.

For a normal image-to-image model:

```py
"cartoonize": {
    "replicate_id": "owner/model:version_hash",
    "input_key": "image",
},
```

For a model with extra parameters:

```py
"cartoonize": {
    "replicate_id": "owner/model:version_hash",
    "input_key": "image",
    "style_key": "style",
},
```

If the model needs a custom helper, add one:

```py
@classmethod
def get_style_key(cls, model_type: str) -> str:
    if model_type not in cls._MODELS:
        raise ValueError(f"Model type '{model_type}' is not registered.")
    return cls._MODELS[model_type].get("style_key", "style")
```

Why this matters:

- Keeps model IDs centralized
- Prevents hardcoding Replicate IDs inside feature services
- Makes future provider/model changes easier

---

### 4.4 Update `backend/api/schemas/ai_tools.py`

Create a start request schema.

For simple one-image features:

```py
class StartCartoonizeRequest(BaseModel):
    job_id: str
    safe_filename: str
```

For tools with user options:

```py
class StartCartoonizeRequest(BaseModel):
    job_id: str
    safe_filename: str
    style: str = "anime"
```

For tools with extra uploaded files:

```py
class StartObjectRemoveRequest(BaseModel):
    job_id: str
    safe_filename: str
    mask_filename: str
```

Why this matters:

- Keeps request validation explicit
- Makes FastAPI error messages clearer
- Prevents frontend/backend payload mismatch

---

### 4.5 Create `backend/api/routes/ai_tools/cartoonize.py`

For a normal feature:

```py
from fastapi import APIRouter, BackgroundTasks, Request, status

from api.schemas.ai_tools import StartCartoonizeRequest
from core.config import settings
from limiter.rate_limiter import limiter
from services.job.job_dispatcher import reserve_and_queue_job
from services.job.job_manager import JobManager

router = APIRouter(tags=["ai_tools"])


@router.post("/cartoonize/start", status_code=status.HTTP_202_ACCEPTED)
@limiter.limit(settings.UPLOAD_RATE_LIMIT)
async def start_cartoonize(
    request: Request,
    payload: StartCartoonizeRequest,
    bg_tasks: BackgroundTasks,
):
    return await reserve_and_queue_job(
        "cartoonize",
        request,
        payload.job_id,
        payload.safe_filename,
        bg_tasks,
        JobManager.process_cartoonize,
    )
```

For a feature with extra args:

```py
return await reserve_and_queue_job(
    "cartoonize",
    request,
    payload.job_id,
    payload.safe_filename,
    bg_tasks,
    JobManager.process_cartoonize,
    payload.style,
)
```

Remember the order:

```txt
reserve_and_queue_job(...)
  -> process_func(job_id, safe_filename, *process_args, client_ip)
```

---

### 4.6 Update `backend/api/routes/router.py`

Import the new route module:

```py
from api.routes.ai_tools import color_restore, object_remove, rembg, upscale, cartoonize
```

Include it:

```py
router.include_router(cartoonize.router)
```

Recommended grouping:

```py
# Real AI tool routes
router.include_router(upscale.router)
router.include_router(rembg.router)
router.include_router(color_restore.router)
router.include_router(object_remove.router)
router.include_router(cartoonize.router)
```

---

### 4.7 Create `backend/services/ai/features/cartoonizer.py`

For a normal model:

```py
from services.ai.pipeline.image_pipeline_service import ImagePipelineService
from provider.ai_provider import BaseAIProvider
from core.config import settings


class Cartoonizer(ImagePipelineService):
    def __init__(
        self,
        provider: BaseAIProvider = None,
        max_concurrent_remote_jobs: int = settings.MAX_CONCURRENT_JOBS,
    ):
        super().__init__(
            model_type="cartoonize",
            provider=provider,
            max_concurrent_remote_jobs=max_concurrent_remote_jobs,
        )

    async def run_cartoonize(self, safe_filename: str, job_id: str) -> bool:
        return await self.run(safe_filename, job_id)


cartoonizer = Cartoonizer()
```

For a model that needs custom inputs, override `_process_with_ai()`:

```py
async def _process_with_ai(self, image_stream: io.BytesIO, **kwargs) -> str:
    model_id = ModelRegistry.get_replicate_id(self.model_type)
    params = self.build_model_params(**kwargs)

    image_key = ModelRegistry.get_input_key(self.model_type)
    params[image_key] = image_stream
    params["style"] = kwargs.get("style", "anime")

    try:
        return await self.provider.run_model(model_id, params=params)
    finally:
        image_stream.close()
```

---

### 4.8 Update `backend/services/job/job_manager.py`

Import the feature service:

```py
from services.ai.features.cartoonizer import cartoonizer
```

Add the processor method:

```py
@classmethod
async def process_cartoonize(
    cls,
    job_id: str,
    safe_filename: str,
    client_ip: str,
) -> None:
    async def _run():
        return await cartoonizer.run_cartoonize(
            safe_filename=safe_filename,
            job_id=job_id,
        )

    await cls._process_feature(
        job_id,
        safe_filename,
        client_ip,
        "cartoonize",
        _run,
    )
```

For extra args:

```py
@classmethod
async def process_cartoonize(
    cls,
    job_id: str,
    safe_filename: str,
    style: str,
    client_ip: str,
) -> None:
    async def _run():
        return await cartoonizer.run_cartoonize(
            safe_filename=safe_filename,
            job_id=job_id,
            style=style,
        )

    await cls._process_feature(
        job_id,
        safe_filename,
        client_ip,
        "cartoonize",
        _run,
    )
```

---

### 4.9 Modify `backend/services/job/job_initializer.py` only for special upload flows

Normal features do not need changes here.

Special features like Object Remove need extra upload URLs.

Example:

```py
response = {
    "job_id": job_id,
    "safe_filename": safe_filename,
    "upload_url": StorageService.generate_upload_sas(safe_filename),
}

if feature == "objectremove":
    mask_filename = f"{job_id}-mask.png"
    response["mask_filename"] = mask_filename
    response["mask_upload_url"] = StorageService.generate_upload_sas(mask_filename)

return response
```

Why this matters:

- The frontend uploads directly to Azure
- The backend must provide all upload URLs before `/start`
- `/start` should receive filenames, not raw files

---

## 5. Frontend Files

### Frontend checklist

Keep one AI capability together under its feature root:

```txt
frontend/src/features/<feature>/
├── <Feature>Page.jsx
├── <Feature>Controls.jsx
├── <feature>Service.js
├── use<Feature>Actions.js
├── use<Feature>Pipeline.js
└── <feature>Marketing.jsx
```

Then update application composition and shared fallback configuration where
required:

```txt
frontend/src/app/routing/aiFeature.routes.js
frontend/src/app/navigation/navConfig.js
frontend/src/shared/config/ai.js
```

Special tools with custom previews, validation, or extra uploads may add more
files inside their own feature folder. Change `shared` only when the capability
is genuinely useful to multiple independent features.

---

## 6. Frontend Step-by-Step

Assume we are adding:

```txt
feature key: cartoonize
display name: Cartoonize
```

### 6.1 Create `frontend/src/features/cartoonize/cartoonizeService.js`

Feature services call the shared transport directly. Do not add a central API
facade that imports sibling features.

```js
import { apiClient } from '@/shared/api/apiClient';

export async function cartoonizeImage(file, turnstileToken, style = 'anime') {
  return apiClient.executeAiJob('cartoonize', file, turnstileToken, { style });
}
```

Keep specialized multi-upload transport in the feature service, using shared
`apiClient` and `uploadToAzure` primitives as Object Removal does.

### 6.2 Create `frontend/src/features/cartoonize/useCartoonizeActions.js`

```js
import { useCallback } from 'react';
import { useActions } from '@/shared/hooks/ai/useActions';
import { cartoonizeImage } from './cartoonizeService';

export function useCartoonizeActions(props) {
  const apiCallFn = useCallback(
    (file, token, options = {}) =>
      cartoonizeImage(file, token, options.style),
    [],
  );

  return useActions({ ...props, apiCallFn });
}
```

### 6.3 Create `frontend/src/features/cartoonize/useCartoonizePipeline.js`

```js
import { usePipeline } from '@/shared/hooks/ai/usePipeline';
import { useCartoonizeActions } from './useCartoonizeActions';

export function useCartoonizePipeline(setProgress) {
  return usePipeline(setProgress, useCartoonizeActions, 'cartoonize');
}
```

The feature key controls storage namespacing, usage-limit calls, progress
persistence, and session restoration. It must match the backend key.

### 6.4 Add feature controls and page composition

Create `CartoonizeControls.jsx` and `CartoonizeImage.jsx` in the same feature
folder. Use shared AI primitives through their public modules:

```jsx
import AiFeatureWorkspace from '@/shared/components/ai/AiFeatureWorkspace';
import BaseToolControls from '@/shared/components/ai/BaseToolControls';
import { useSimulatedProgress } from '@/shared/hooks/ai/useSimulatedProgress';
```

The feature page owns its controls, display labels, options, marketing content,
and any custom preview or validation UI. `AiFeatureWorkspace` owns only the
cross-feature upload, processing, result, quota, and session presentation.

### 6.5 Add feature-owned marketing content

Create `frontend/src/features/cartoonize/cartoonizeMarketing.jsx` only when the
workspace currently renders marketing content. Do not move feature copy into
`shared`.

### 6.6 Update `frontend/src/app/routing/aiFeature.routes.js`

Add a lazy feature entry point:

```js
{
  path: '/cartoonize',
  component: React.lazy(() =>
    import('../../features/cartoonize/CartoonizeImage')
  ),
},
```

Route groups compose features; they do not own feature logic.

### 6.7 Update `frontend/src/app/navigation/navConfig.js`

Add the tool's discovery link to the appropriate navigation category. A
navigation category is not a feature folder.

### 6.8 Update `frontend/src/shared/config/ai.js`

Add the frontend fallback limit used before the backend usage response arrives:

```js
export const FEATURE_LIMITS = {
  default: 3,
  upscale: 3,
  rembg: 5,
  colorrestore: 5,
  objectremove: 5,
  cartoonize: 5,
};
```

The backend remains the source of truth for quotas. Pass result and restored
session labels from the feature page instead of adding feature copy to shared
configuration.

### 6.9 Add a public feature surface only when needed

Application routes may import the feature's root page directly. If another
feature must consume a capability, expose only that contract from a small
`frontend/src/features/<feature>/index.js` and import the index. Never deep-import
a sibling feature's internal hook, component, service, or helper.

---
## 7. Special Feature Patterns

### Pattern A: Normal one-image feature

Use this when the AI model only needs one image.

```txt
Frontend:
executeAiJob(feature, file, token)

Backend:
/{feature}/init returns:
- job_id
- safe_filename
- upload_url

/{feature}/start receives:
- job_id
- safe_filename
```

Examples:

```txt
upscale
rembg
colorrestore
```

---

### Pattern B: Feature with options

Use this when the AI model needs one image plus settings.

```txt
Frontend:
executeAiJob(feature, file, token, { style })

Backend:
/{feature}/start receives:
- job_id
- safe_filename
- style
```

Examples:

```txt
cartoonize with style
upscale with scale
```

---

### Pattern C: Feature with extra generated upload

Use this when the model needs more than one file.

```txt
Frontend:
custom execute<Feature>Job(file, extraBlob, token)

Backend:
/{feature}/init returns:
- job_id
- safe_filename
- upload_url
- extra_filename
- extra_upload_url

/{feature}/start receives:
- job_id
- safe_filename
- extra_filename
```

Example:

```txt
objectremove
```

---

## 8. Cloudflare Turnstile Precautions

Cloudflare Turnstile protects PixelForge AI endpoints from abuse. When adding a new AI feature, keep the Turnstile flow consistent with the existing tools.

---

### 8.1 Turnstile flow

The expected flow is:

```txt
User clicks process
  -> Turnstile generates token
  -> frontend sends cf_turnstile_response to POST /{feature}/init
  -> backend verifies token
  -> backend returns Azure upload URL
  -> frontend uploads file to Azure
  -> frontend calls POST /{feature}/start
```

For a normal feature, the token is passed into:

```js
apiClient.executeAiJob(feature, file, turnstileToken)
```

For a special feature such as Object Remove, the token should still be sent during init:

```js
apiClient.executeObjectRemoveJob(file, maskBlob, turnstileToken)
```

---

### 8.2 Required environment variables

Frontend:

```txt
VITE_TURNSTILE_SITE_KEY
VITE_API_BASE_URL
```

Backend:

```txt
CLOUDFLARE_TURNSTILE_SECRET_KEY
ALLOWED_ORIGINS
ENVIRONMENT
ALLOW_TURNSTILE_TEST_BYPASS
```

After changing environment variables, redeploy the affected service:

```txt
Frontend env changed -> redeploy Vercel
Backend env changed  -> redeploy backend service
```

---

### 8.3 Production and preview domains

Make sure Turnstile and backend CORS allow the correct domains.

Production examples:

```txt
https://pixelforge-project.vercel.app
https://your-production-backend-domain
```

Preview examples:

```txt
https://pixel-forge-git-feature-branch-*.vercel.app
https://your-preview-url.vercel.app
```

If a feature works locally but fails in Vercel Preview or Production, check:

```txt
[ ] Is the current frontend URL allowed by Turnstile?
[ ] Is the current frontend URL included in backend ALLOWED_ORIGINS?
[ ] Is VITE_API_BASE_URL pointing to the correct backend?
[ ] Did you redeploy after changing env vars?
```

---

### 8.4 About `401` from `challenges.cloudflare.com`

In DevTools, you may see a request like:

```txt
GET https://challenges.cloudflare.com/... 401 Unauthorized
```

This often comes from Cloudflare's Private Access Token challenge. It does **not always mean the full Turnstile flow failed**.

Do not debug only from that line. Check the actual app flow instead:

```txt
[ ] Did Turnstile onSuccess run?
[ ] Is turnstileToken set in frontend state?
[ ] Was POST /{feature}/init sent?
[ ] Did /{feature}/init return 200?
```

If `/init` is never sent, the issue is usually frontend validation or missing input, not Turnstile.

Example: Object Remove should not call `/objectremove/init` if the user has not painted a mask yet. In that case, show a user-friendly modal such as `missing_mask`, not a generic server failure modal.

---

### 8.5 Local testing bypass

PixelForge can use a manual Turnstile bypass for local development.

Example payload:

```json
{
  "cf_turnstile_response": "manual_test_bypass",
  "filename": "test.png"
}
```

The bypass should only work when the environment is safe:

```txt
ENVIRONMENT = local/dev/development
ALLOW_TURNSTILE_TEST_BYPASS = true
```

Never enable manual bypass in production.

Recommended safety rule:

```txt
Production backend must reject manual_test_bypass.
```

---

### 8.6 Debugging order

When a feature fails, debug in this order:

```txt
1. Browser DevTools Console
2. Browser DevTools Network
3. Was /{feature}/init sent?
4. Did Turnstile generate a token?
5. Did backend receive /{feature}/init?
6. Did Azure upload succeed?
7. Was /{feature}/start sent?
8. Did backend job logs show the feature processor running?
9. Did /result/{job_id} return failed, processing, or ready?
```

This avoids blaming Turnstile when the actual issue is missing frontend input, stale Vercel deployment, CORS, or a failed Azure upload.

---

### 8.7 Deployment reminder

Vercel Preview and Production are not always the same.

```txt
Preview deployment:
created from feature branches or pull requests

Production deployment:
usually updates only after merge/push to master
```

If local works and preview works but production does not, check the latest Production deployment commit SHA.

```bash
git log --oneline -5
```

Compare it with the commit shown in Vercel's Production Deployment page.

---

## 9. Manual Backend Testing

Example PowerShell flow:

```powershell
$init = Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/cartoonize/init" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"cf_turnstile_response":"manual_test_bypass","filename":"test.png"}'
```

Upload to Azure:

```powershell
Invoke-WebRequest `
  -Uri $init.upload_url `
  -Method Put `
  -Headers @{
    "x-ms-blob-type" = "BlockBlob"
    "Content-Type" = "image/png"
  } `
  -InFile "test.png"
```

Start job:

```powershell
$body = @{
  job_id = $init.job_id
  safe_filename = $init.safe_filename
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/cartoonize/start" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

Poll result:

```powershell
$result = Invoke-RestMethod "http://127.0.0.1:8000/result/$($init.job_id)"
$result
$result.url
```

Open result:

```powershell
Start-Process $result.url
```

---

## 10. Frontend Testing Checklist

After adding the feature:

```txt
[ ] Route opens correctly
[ ] Navbar item appears
[ ] Upload works
[ ] Turnstile token is received
[ ] Init endpoint is called
[ ] Azure upload succeeds
[ ] Start endpoint is called
[ ] Progress bar appears
[ ] Polling reaches ready
[ ] Result viewer displays before/after
[ ] Download button works
[ ] Cancel/reset works
[ ] Usage limit updates
[ ] Refresh/session restore does not break
```

---

## 11. Backend Testing Checklist

```txt
[ ] Feature key exists in FeatureType
[ ] Display name exists in FEATURE_DISPLAY_NAMES
[ ] Daily limit exists in FEATURE_LIMITS
[ ] Model exists in ModelRegistry
[ ] Start request schema exists
[ ] Route file exists
[ ] Route is included in router.py
[ ] JobManager processor exists
[ ] Feature service exists
[ ] /{feature}/init works
[ ] Azure upload works
[ ] /{feature}/start works
[ ] /result/{job_id} returns processing then ready
[ ] Failed jobs are marked failed
[ ] Usage is refunded on failure
```

---

## 12. Common Mistakes

### 1. Feature key mismatch

Example bug:

```txt
frontend uses: object-remove
backend expects: objectremove
```

Fix:

```txt
Use objectremove everywhere for the backend feature key.
Use /object-remove only as the user-facing route if desired.
```

---

### 2. Adding a route file but forgetting `router.py`

If the file exists but is not included in `backend/api/routes/router.py`, FastAPI will never register it.

---

### 3. Adding frontend route but forgetting nav

The page may work directly by URL, but users cannot discover it.

---

### 4. Adding backend feature limit but forgetting frontend limit

The backend may allow usage, but the frontend usage card can show the wrong number.

---

### 5. Special feature forced into `executeAiJob()`

Do not force multi-upload features into the standard one-upload helper.

Use a specialized method:

```js
executeObjectRemoveJob(file, maskBlob, token)
```

---

### 6. Missing result label

If the feature page omits `resultLabel`, the shared result viewer falls back to
`Processed`.

That is safe, but less polished.
---

### 7. User validation uses a server error modal

If the user forgot a required input such as a mask, selected area, or option, do not show a generic server failure modal.

Avoid:

```js
setAppAlert({ show: true, type: 'dos' });
```

Use a specific alert type instead:

```js
setAppAlert({ show: true, type: 'missing_mask' });
```

Keep the user-friendly modal with the feature that owns the validation rule:

```txt
frontend/src/features/object-removal/MissingMaskModal.jsx
```

Example message:

```txt
Please paint the object area first.
Object Remove needs a painted mask so PixelForge knows exactly which part of the image you want to remove.
```

---

## 13. Safe Git Workflow

Always work from a feature branch.

```bash
git switch master
git pull origin master
git switch -c feat/cartoonize
```

After implementation:

```bash
git status
git add .
git commit -m "feat: add cartoonize AI feature"
git push -u origin feat/cartoonize
```

Then open a pull request into `master`.

Before merging:

```bash
git diff master...feat/cartoonize --stat
git log --oneline --decorate -5
```

---

## 14. Quick Reference

### Normal AI feature

```txt
Backend:
[ ] domain/ai_features.py
[ ] core/config.py
[ ] core/model_registry.py
[ ] api/schemas/ai_tools.py
[ ] api/routes/ai_tools/<feature>.py
[ ] api/routes/router.py
[ ] services/ai/features/<feature_service>.py
[ ] services/job/job_manager.py

Frontend:
[ ] features/<feature>/<feature>Service.js
[ ] features/<feature>/use<Feature>Actions.js
[ ] features/<feature>/use<Feature>Pipeline.js
[ ] features/<feature>/<Feature>Controls.jsx
[ ] features/<feature>/<Feature>Page.jsx
[ ] features/<feature>/<feature>Marketing.jsx
[ ] app/routing/aiFeature.routes.js
[ ] app/navigation/navConfig.js
[ ] shared/config/ai.js
```

### Special AI feature

```txt
Also check:
[ ] backend/services/job/job_initializer.py
[ ] frontend/src/shared/api/apiClient.js
[ ] frontend/src/shared/components/ai/AiFeatureWorkspace.jsx
[ ] frontend/src/features/<feature>/<Feature>CustomEditor.jsx
[ ] frontend/src/features/<feature>/<Feature>Modal.jsx
```

---

## 15. Maintainability Notes

PixelForge is maintainable because:

- Backend route groups are separated by purpose
- Shared AI job routes handle init, polling, and usage
- Each AI feature owns only its start route
- Model configuration is centralized
- Frontend transport is shared while service adapters remain feature-owned
- Frontend features reuse shared state and polling only where contracts match
- Workspace UI is reusable through `AiFeatureWorkspace`
- Special tools can override preview UI through `previewOverride`
- Route categories remain application composition rather than product owners
- No registry or facade is added until current source evidence justifies it
