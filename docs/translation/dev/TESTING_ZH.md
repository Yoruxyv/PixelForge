# PixelForge 测试

本指南列出后端 API、AI pipeline、使用限制、前端构建以及文档相关工作流的本地验证命令。

`scripts/windows/testing/` and `scripts/unix/testing/` 下的 PowerShell 与 Bash wrapper 共享同一套 Python 实现，使 Windows、Linux 与 macOS 的行为保持一致。API 检查假设后端在本地运行，并在需要时启用本地 Turnstile bypass：

```env
ENVIRONMENT=development
ALLOW_TURNSTILE_TEST_BYPASS=true
```

Production 中绝不能启用手动 bypass。

---

## 启动应用

从仓库根目录运行。

Windows：

```powershell
.\scripts\windows\start_app.bat
```

Linux/macOS：

```bash
./scripts/unix/start_app.sh
```

也可以分别手动启动。

Backend：

```bash
cd backend
uv sync --locked
uv run python run.py
```

Frontend：

```bash
cd frontend
npm run dev
```

---

## 后端 API 检查

Windows PowerShell：

```powershell
.\scripts\windows\testing\check_backend_limits_and_usage.ps1
```

Linux/macOS：

```bash
./scripts/unix/testing/check_backend_limits_and_usage.sh
```

验证 `/api/limits`、`/api/usage`、feature limit 结构以及 runtime limit 一致性。

Windows PowerShell：

```powershell
.\scripts\windows\testing\check_backend_error_responses.ps1
```

Linux/macOS：

```bash
./scripts/unix/testing/check_backend_error_responses.sh
```

验证结构化后端错误响应。

Windows PowerShell：

```powershell
.\scripts\windows\testing\check_backend_invalid_image_upload.ps1
```

Linux/macOS：

```bash
./scripts/unix/testing/check_backend_invalid_image_upload.sh
```

验证无效图像数据会以结构化错误安全失败。

---

## Usage Limit 检查

Windows PowerShell：

```powershell
.\scripts\windows\testing\check_backend_usage_limit.ps1
```

Linux/macOS：

```bash
./scripts/unix/testing/check_backend_usage_limit.sh
```

脚本会临时写入本地 usage table、调用 init endpoint、验证结构化 `RATE_LIMITED` 响应，并恢复当前小时之前的状态。

覆盖功能：

- `upscale`
- `rembg`
- `colorrestore`
- `objectremove`

当前 quota identity 基于 IP，因此这些检查只能验证后端行为，不能消除 shared NAT/shared proxy 的已知限制。

---

## AI 成功流程检查

Upscale，Windows PowerShell：

```powershell
.\scripts\windows\testing\check_ai_feature_success.ps1 -Feature upscale -Scale 2
```

Upscale，Linux/macOS：

```bash
./scripts/unix/testing/check_ai_feature_success.sh --feature upscale --scale 2
```

Remove Background，Windows PowerShell：

```powershell
.\scripts\windows\testing\check_ai_feature_success.ps1 `
  -Feature rembg `
  -FilePath ".\frontend\public\demo\rem_bg_before.jpg"
```

Remove Background，Linux/macOS：

```bash
./scripts/unix/testing/check_ai_feature_success.sh \
  --feature rembg \
  --file-path "./frontend/public/demo/rem_bg_before.jpg"
```

Restore Color，Windows PowerShell：

```powershell
.\scripts\windows\testing\check_ai_feature_success.ps1 `
  -Feature colorrestore `
  -FilePath ".\frontend\public\demo\res_color_before.jpg"
```

Restore Color，Linux/macOS：

```bash
./scripts/unix/testing/check_ai_feature_success.sh \
  --feature colorrestore \
  --file-path "./frontend/public/demo/res_color_before.jpg"
```

Object Remove 需要源图像以及相同尺寸的 mask：

- 黑色像素：保留区域
- 白色像素：移除区域

先使用 Pillow 或其他图像工具创建 mask，然后运行 object removal 流程。

Windows PowerShell：

```powershell
.\scripts\windows\testing\check_ai_feature_success.ps1 `
  -Feature objectremove `
  -FilePath ".\frontend\public\demo\object_remove_before.png" `
  -MaskPath ".\frontend\public\demo\object_remove_test_mask.png"
```

Linux/macOS：

```bash
./scripts/unix/testing/check_ai_feature_success.sh \
  --feature objectremove \
  --file-path "./frontend/public/demo/object_remove_before.png" \
  --mask-path "./frontend/public/demo/object_remove_test_mask.png"
```

---

## Turnstile 流程检查

每个 AI 任务：

1. 确认前端收到 Turnstile token。
2. 确认 `POST /api/{feature}/init` 对其进行验证。
3. 完成任务或使任务失败。
4. 启动另一个任务并确认请求了新 token。

另外提交一次反馈并确认它执行独立验证。在非 development 环境中，临时移除 secret 必须让验证 fail-closed，而不是绕过保护。

---

## 前端检查

以下命令在 Windows、Linux 与 macOS 上相同：

```bash
cd frontend
npm ci
npm run lint
npm run test -- --run
npm run build
```

---

## 后端质量检查

```bash
cd backend
uv lock --check
uv sync --locked
uv run ruff check .
uv run ruff format --check .
uv run pytest
uv run mypy
```

当前 mypy 配置为 blocking check；更严格的 mypy 策略仍属于后续独立任务。

---

## 手动 UI 检查

1. 向 AI 工具上传超过公开像素限制的图像。
2. 确认上传前进行了 resize，并显示 resize alert。
3. 确认预览仍然正确。
4. 确认 AI 任务达到 ready 结果。
5. 运行第二个任务并确认 Turnstile 获取新 token。
6. 检查 proxy/IP 行为时从两个网络测试；不要假设托管平台的 direct peer 就是访客 IP。

---

## 最终仓库检查

```powershell
git diff --check
git status --short
```

跨平台搜索旧 dependency workflow：

```bash
git grep -n -E 'requirements(-dev)?\.txt|python -m pip|pip install -r' -- '*.md' '*.yml' '*.yaml' '*.ps1' '*.sh' '*.bat' || true
```

该命令不应返回旧 dependency workflow 引用。
