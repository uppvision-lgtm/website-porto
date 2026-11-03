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
