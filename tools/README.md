# Auto-edit video demo

Generate ulang video slot di assets/videos/ dari materi asli:

```sh
python3 -m venv /tmp/vidvenv
/tmp/vidvenv/bin/pip install pillow
/tmp/vidvenv/bin/python tools/make-demo-frames.py
bash tools/make-demo-videos.sh
```

- `make-demo-frames.py` — crop foto ke 1920x1080 + caption, bikin kartu terminal Godam (butuh Pillow)
- `make-demo-videos.sh` — zoom Ken Burns + crossfade via ffmpeg, output `assets/videos/phonefarm.mp4` & `godam.mp4`

Ganti dengan rekaman layar asli? Timpa saja file mp4-nya — slot di halaman otomatis memakai file terbaru.

## Pemeriksaan setelah perbaikan UI

Jalankan server dari root repository, lalu tes regresi Playwright:

```sh
python3 server.py 8137
# Di terminal kedua, dengan Playwright tersedia di environment Node:
node tools/qa-regression.cjs
```

Jika Playwright dipasang di luar repository, atur `PLAYWRIGHT_MODULE` ke direktori modulnya. `QA_BASE_URL` dan `QA_OUTPUT` dapat mengganti alamat server dan folder hasil. Tes mencakup navigasi HP/keyboard, FAQ, overflow pada empat ukuran, reset Jajan.in, keranjang GoKantin, render ulang Automasi, fitur demo KasirKu, audio SmartCast, video ScrapPulse, serta seluruh tab aplikasi mobile. Screenshot dan hasil JSON ditulis ke `artifacts/fix-2026-11-10` secara default.

Media demo tambahan:

- `assets/videos/scrap.mp4`: rekaman halaman ScrapPulse **simulasi**, bukan rekaman pipeline production.
- `assets/audio/smartcast-demo.mp3`: narasi contoh dengan suara sintetis Damayanti dari macOS, bukan episode podcast asli.
- Perubahan stok dan pengaturan KasirKu hanya bertahan selama halaman dibuka; semua data transaksi adalah contoh.
