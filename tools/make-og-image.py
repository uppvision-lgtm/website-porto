"""Generate og-image.png 1200x630 untuk preview share (WA/Twitter/FB)."""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
LIME, INK, WHITE, PINK, PURPLE, BLUE = "#C8F04B", "#141414", "#FFFFFF", "#FF90E8", "#B69BFF", "#8ECAE6"
ARIAL_B = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"
out = "/Users/mymac/Documents/website porto/assets/og-image.png"
os.makedirs(os.path.dirname(out), exist_ok=True)

im = Image.new("RGB", (W, H), LIME)
d = ImageDraw.Draw(im)

# bingkai neo-brutalism
d.rectangle([24, 24, W - 24, H - 24], outline=INK, width=6)

# chip warna dekoratif kiri-atas
for i, c in enumerate([WHITE, PINK, PURPLE, BLUE]):
    x = 70 + i * 64
    d.rounded_rectangle([x, 70, x + 52, 122], radius=10, fill=c, outline=INK, width=4)

# wordmark
f_logo = ImageFont.truetype(ARIAL_B, 170)
d.text((70, 165), "mood.", font=f_logo, fill=INK)

# tagline
f_tag = ImageFont.truetype(ARIAL_B, 44)
d.text((70, 400), "Studio IT — Website · Apps · AI · POS", font=f_tag, fill=INK)

# catatan kaki
f_small = ImageFont.truetype(ARIAL, 30)
d.text((70, 490), "Dari ide jadi produk digital nyata — no drama, cuma hasil.", font=f_small, fill=INK)
d.text((70, 535), "halo@mood.dev  ·  dibalas dalam 24 jam", font=f_small, fill=INK)

# stiker miring kanan-bawah (pojok, tidak menutupi teks)
stick = Image.new("RGBA", (360, 90), (0, 0, 0, 0))
sd = ImageDraw.Draw(stick)
sd.rounded_rectangle([0, 0, 359, 89], radius=14, fill=INK)
sf = ImageFont.truetype(ARIAL_B, 34)
sd.text((28, 26), "GAS, NGOBROL →", font=sf, fill=LIME)
rot = stick.rotate(-4, expand=True, resample=Image.BICUBIC)
im.paste(rot, (W - rot.width - 24, H - rot.height - 12), rot)

im.save(out, "PNG", optimize=True)
print("og-image:", out, "|", os.path.getsize(out) // 1024, "KB")
