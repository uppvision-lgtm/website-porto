#!/bin/bash
# ============================================================
#  SumoPod one-liner setup:
#  curl -sL https://raw.githubusercontent.com/uppvision-lgtm/website-porto/main/tools/deploy/sumopod-setup.sh | bash
#  -> install nginx, unduh seluruh situs dari GitHub, firewall, SSL
# ============================================================
set -e
echo "== 1. Install nginx + certbot + ufw =="
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nginx certbot python3-certbot-nginx ufw

echo "== 2. Unduh seluruh situs dari GitHub =="
BASE="https://raw.githubusercontent.com/uppvision-lgtm/website-porto/main"
DEST="/var/www/gatraglobal.id"
sudo mkdir -p "$DEST"
sudo chown -R ubuntu:ubuntu "$DEST"
cd "$DEST"

FILES="index.html karya.html proses.html testimoni.html faq.html favicon.svg"
FILES="$FILES css/style.css js/main.js"
FILES="$FILES projects/kasirku.html projects/smartcast.html projects/gokantin.html projects/kopisenja.html projects/tiketin.html projects/lensa.html"
FILES="$FILES projects/fokusin.html projects/godam.html projects/gymkuy.html projects/jajanin.html projects/racunin.html projects/phonefarm.html"
for f in $FILES; do
  echo "  - $f"
  curl -fsSL "$BASE/$f" -o "$f"
done

mkdir -p assets/videos assets/phonefarm
curl -fsSL "$BASE/assets/og-image.png" -o assets/og-image.png
for f in panel.jpg ig-workspace.png ig-autokomen.png koneksi.png; do
  curl -fsSL "$BASE/assets/phonefarm/$f" -o "assets/phonefarm/$f"
done
for f in fest-crowd.mp4 godam.mp4; do
  curl -fsSL "$BASE/assets/videos/$f" -o "assets/videos/$f"
done

echo "== 3. Konfigurasi nginx =="
curl -fsSL "$BASE/tools/deploy/nginx-gatraglobal.conf" | sudo tee /etc/nginx/sites-available/gatraglobal.id >/dev/null
sudo ln -sf /etc/nginx/sites-available/gatraglobal.id /etc/nginx/sites-enabled/gatraglobal.id
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "== 4. Firewall =="
sudo ufw allow 22/tcp >/dev/null 2>&1 || true
sudo ufw allow 80/tcp >/dev/null 2>&1 || true
sudo ufw allow 443/tcp >/dev/null 2>&1 || true
sudo ufw --force enable >/dev/null 2>&1 || true

echo "== 5. SSL otomatis (kalau DNS sudah mengarah) =="
IP=$(curl -s ifconfig.me)
if getent hosts gatraglobal.id | grep -q "$IP"; then
  sudo certbot --nginx -d gatraglobal.id -d www.gatraglobal.id --non-interactive --agree-tos -m uppvision@gmail.com --redirect
  echo "✅ SSL TERPASANG — https://gatraglobal.id"
else
  echo "ℹ DNS gatraglobal.id belum mengarah ke $IP"
  echo "  Setelah A record diatur di hPanel, jalankan:"
  echo "  sudo certbot --nginx -d gatraglobal.id -d www.gatraglobal.id --non-interactive --agree-tos -m uppvision@gmail.com --redirect"
fi

echo ""
echo "✅ WEBSITE LIVE — cek: http://$IP dan https://gatraglobal.id (setelah SSL)"
