# Pengujian PixelForge

Panduan ini berisi command verifikasi lokal untuk API backend, pipeline AI, usage limit, build frontend, dan workflow yang sensitif terhadap dokumentasi.

Wrapper PowerShell dan Bash di `scripts/windows/testing/` and `scripts/unix/testing/` memakai implementasi Python bersama agar behavior konsisten di Windows, Linux, dan macOS. Check API mengasumsikan backend berjalan lokal dan bypass Turnstile lokal diaktifkan bila diperlukan:

```env
ENVIRONMENT=development
ALLOW_TURNSTILE_TEST_BYPASS=true
```

Jangan pernah mengaktifkan manual bypass di production.

---

## Menjalankan Aplikasi

Dari root repository.

Windows:

```powershell
.\scripts\windows\start_app.bat
```

Linux/macOS:

```bash
./scripts/unix/start_app.sh
```

Atau jalankan masing-masing secara manual.

Backend:

```bash
cd backend
uv sync --locked
uv run python run.py
```

Frontend:

```bash
cd frontend
npm run dev
```

---

## Pemeriksaan API Backend

Windows PowerShell:

```powershell
.\scripts\windows\testing\check_backend_limits_and_usage.ps1
```

Linux/macOS:

```bash
./scripts/unix/testing/check_backend_limits_and_usage.sh
```

Memverifikasi `/api/limits`, `/api/usage`, bentuk feature limit, dan konsistensi runtime limit.

Windows PowerShell:

```powershell
.\scripts\windows\testing\check_backend_error_responses.ps1
```

Linux/macOS:

```bash
./scripts/unix/testing/check_backend_error_responses.sh
```

Memverifikasi structured error response backend.

Windows PowerShell:

```powershell
.\scripts\windows\testing\check_backend_invalid_image_upload.ps1
```

Linux/macOS:

```bash
./scripts/unix/testing/check_backend_invalid_image_upload.sh
```

Memverifikasi bahwa data gambar invalid gagal secara aman dengan structured error.

---

## Pemeriksaan Usage Limit

Windows PowerShell:

```powershell
.\scripts\windows\testing\check_backend_usage_limit.ps1
```

Linux/macOS:

```bash
./scripts/unix/testing/check_backend_usage_limit.sh
```

Script sementara mengisi usage table lokal, memanggil init endpoint, memvalidasi response `RATE_LIMITED`, lalu mengembalikan state jam berjalan sebelumnya.

Fitur yang dicakup:

- `upscale`
- `rembg`
- `colorrestore`
- `objectremove`

Karena identitas quota saat ini berbasis IP, pemeriksaan ini memvalidasi behavior backend tetapi tidak menghilangkan keterbatasan shared NAT/shared proxy.

---

## Pemeriksaan Keberhasilan AI

Upscale, Windows PowerShell:

```powershell
.\scripts\windows\testing\check_ai_feature_success.ps1 -Feature upscale -Scale 2
```

Upscale, Linux/macOS:

```bash
./scripts/unix/testing/check_ai_feature_success.sh --feature upscale --scale 2
```

Remove Background, Windows PowerShell:

```powershell
.\scripts\windows\testing\check_ai_feature_success.ps1 `
  -Feature rembg `
  -FilePath ".\frontend\public\demo\rem_bg_before.jpg"
```

Remove Background, Linux/macOS:

```bash
./scripts/unix/testing/check_ai_feature_success.sh \
  --feature rembg \
  --file-path "./frontend/public/demo/rem_bg_before.jpg"
```

Restore Color, Windows PowerShell:

```powershell
.\scripts\windows\testing\check_ai_feature_success.ps1 `
  -Feature colorrestore `
  -FilePath ".\frontend\public\demo\res_color_before.jpg"
```

Restore Color, Linux/macOS:

```bash
./scripts/unix/testing/check_ai_feature_success.sh \
  --feature colorrestore \
  --file-path "./frontend/public/demo/res_color_before.jpg"
```

Object Remove memerlukan source image dan mask dengan ukuran yang sama:

- Pixel hitam: pertahankan area
- Pixel putih: hapus area

Buat mask dengan Pillow atau image tool lain, lalu jalankan workflow object removal.

Windows PowerShell:

```powershell
.\scripts\windows\testing\check_ai_feature_success.ps1 `
  -Feature objectremove `
  -FilePath ".\frontend\public\demo\object_remove_before.png" `
  -MaskPath ".\frontend\public\demo\object_remove_test_mask.png"
```

Linux/macOS:

```bash
./scripts/unix/testing/check_ai_feature_success.sh \
  --feature objectremove \
  --file-path "./frontend/public/demo/object_remove_before.png" \
  --mask-path "./frontend/public/demo/object_remove_test_mask.png"
```

---

## Pemeriksaan Alur Turnstile

Untuk setiap job AI:

1. Pastikan frontend menerima token Turnstile.
2. Pastikan `POST /api/{feature}/init` memverifikasinya.
3. Selesaikan atau gagalkan job.
4. Mulai job lain dan pastikan token baru diminta.

Kirim feedback sekali dan pastikan verifikasi dilakukan terpisah. Pada environment non-development, menghapus secret sementara harus menyebabkan verifikasi fail-closed, bukan melewati perlindungan.

---

## Pemeriksaan Frontend

Command berikut sama di Windows, Linux, dan macOS:

```bash
cd frontend
npm ci
npm run lint
npm run test -- --run
npm run build
```

---

## Pemeriksaan Quality Backend

```bash
cd backend
uv lock --check
uv sync --locked
uv run ruff check .
uv run ruff format --check .
uv run pytest
uv run mypy
```

Konfigurasi mypy saat ini bersifat blocking. Peningkatan ke kebijakan mypy yang
lebih strict tetap menjadi task terpisah.

---

## Pemeriksaan Manual UI

1. Upload gambar di atas public pixel limit ke tool AI.
2. Pastikan gambar di-resize sebelum upload dan alert resize muncul.
3. Pastikan preview tetap benar.
4. Pastikan job AI mencapai result ready.
5. Jalankan job kedua dan pastikan Turnstile memperoleh token baru.
6. Test dari dua network saat memeriksa behavior proxy/IP; jangan menganggap direct peer platform terkelola adalah IP pengunjung.

---

## Pemeriksaan Final Repository

```powershell
git diff --check
git status --short
```

Cari dependency workflow lama secara cross-platform:

```bash
git grep -n -E 'requirements(-dev)?\.txt|python -m pip|pip install -r' -- '*.md' '*.yml' '*.yaml' '*.ps1' '*.sh' '*.bat' || true
```

Command seharusnya tidak mengembalikan reference dependency workflow lama.
