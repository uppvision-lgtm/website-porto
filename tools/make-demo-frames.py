#!/usr/bin/env python3
"""Render frame 1920x1080 untuk video portofolio: caption PhoneFarm + kartu terminal Godam."""
import os
from PIL import Image, ImageDraw, ImageFont

A = "/Users/mymac/Documents/website porto/assets/phonefarm"
T = "/tmp/vidauto"
ARIAL_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
MENLO = "/System/Library/Fonts/Menlo.ttc"
W, H = 1920, 1080
os.makedirs(T, exist_ok=True)

def cover(img):
    r = max(W / img.width, H / img.height)
    im = img.resize((round(img.width * r), round(img.height * r)), Image.LANCZOS)
    x = (im.width - W) // 2
    y = (im.height - H) // 2
    return im.crop((x, y, x + W, y + H))

def caption_strip(im, text):
    d = ImageDraw.Draw(im, "RGBA")
    f = ImageFont.truetype(ARIAL_BOLD, 40)
    l, t, r, b = d.textbbox((0, 0), text, font=f)
    tw, th = r - l, b - t
    x0, y0 = 70, H - th - 70 - 44
    d.rounded_rectangle([x0, y0, x0 + tw + 44, y0 + th + 44], radius=16, fill=(10, 10, 10, 168))
    d.text((x0 + 22, y0 + 22), text, font=f, fill=(255, 255, 255, 255))
    return im

photos = [
    (A + "/panel.jpg",        "PhoneFarm — dashboard perangkat (screenshot asli)"),
    (A + "/ig-workspace.png", "Workspace Instagram — auto komen & auto upload"),
    (A + "/ig-autokomen.png", "Auto komen — akun per HP, jeda & riwayat"),
    (A + "/koneksi.png",      "Koneksi — status 20 slot via serial"),
]
for i, (path, cap) in enumerate(photos, 1):
    im = cover(Image.open(path).convert("RGB"))
    caption_strip(im, cap).save(f"{T}/p{i}.png")
    print("frame:", f"p{i}.png")

cards = [
    ("$ curl POST /api/start-job",          (124, 227, 139)),
    ("# DeepSeek: komen sesuai tone",       (143, 163, 184)),
    ("$ curl POST /api/video/hook",         (255, 212, 59)),
    ("# link → template 9:16 → render",     (255, 212, 59)),
    ("$ curl POST /api/upload/start",       (124, 227, 139)),
    ("# komen, video, upload — satu suite", (124, 227, 139)),
]
f_menlo = ImageFont.truetype(MENLO, 58)
for i, (text, color) in enumerate(cards, 1):
    im = Image.new("RGB", (W, H), (16, 20, 24))
    d = ImageDraw.Draw(im)
    for j, cx in enumerate((70, 110, 150)):  # titik-titik jendela terminal
        d.ellipse([cx, 60, cx + 26, 86], fill=(58, 74, 90))
    l, t, r, b = d.textbbox((0, 0), text, font=f_menlo)
    d.text((210, (H - (b - t)) // 2), text, font=f_menlo, fill=color)
    im.save(f"{T}/g{i}.png")
    print("frame:", f"g{i}.png")
print("SELESAI render frame")
