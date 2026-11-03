#!/bin/bash
# ============================================================
#  Deploy otomatis: website portofolio mood -> VPS SumoPod
#  User SSH: ubuntu (standar cloud image SumoPod)
#  Pakai:  bash deploy.sh <IP-VPS> [--ssl]
#  --ssl : hanya dijalankan setelah DNS mengarah ke IP VPS
# ============================================================
set -e
IP="${1:?pakai: bash deploy.sh <IP-VPS> [--ssl]}"
SSL="${2:-}"
KEY="$HOME/.ssh/sumopod_gatra"
PASS="Gatraglobal_tech2026"
SITE="$(cd "$(dirname "$0")/../.." && pwd)"
CONF="$(dirname "$0")/nginx-gatraglobal.conf"
REMOTE="ubuntu@$IP"
SSHOPTS="-i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
WWW="/var/www/gatraglobal.id"
PUBKEY="$(cat "$KEY.pub")"

echo "=== 1/8 Pasang SSH key (sekali saja, pakai password) ==="
expect <<EOF
set timeout 40
spawn ssh $SSHOPTS ubuntu@$IP "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '$PUBKEY' >> ~/.ssh/authorized_keys && sort -u ~/.ssh/authorized_keys -o ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo KEY-OK"
expect {
  -re "(?i)password" { send "$PASS\r"; exp_continue }
  "KEY-OK" {}
  timeout { puts "TIMEOUT"; exit 1 }
}
EOF

echo "=== 2/8 Verifikasi login pakai key + siapkan folder web ==="
ssh $SSHOPTS $REMOTE "echo KEY-LOGIN-OK; head -2 /etc/os-release; sudo -n mkdir -p $WWW && sudo -n chown -R ubuntu:ubuntu $WWW && echo SUDO-OK"

echo "=== 3/8 Install nginx + certbot + ufw ==="
ssh $SSHOPTS $REMOTE "sudo -n apt-get update -y && sudo -n DEBIAN_FRONTEND=noninteractive apt-get install -y nginx certbot python3-certbot-nginx ufw"

echo "=== 4/8 Deploy file website (rsync) ==="
rsync -az --delete -e "ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" \
  --exclude '.git' --exclude 'tools' --exclude 'server.py' \
  --exclude '__pycache__' --exclude '.DS_Store' --exclude 'deploy' \
  "$SITE/" "$REMOTE:$WWW/"

echo "=== 5/8 Pasang konfigurasi nginx ==="
scp -i $KEY -o IdentitiesOnly=yes "$CONF" $REMOTE:/tmp/gatraglobal.id.conf
ssh $SSHOPTS $REMOTE "sudo -n mv /tmp/gatraglobal.id.conf /etc/nginx/sites-available/gatraglobal.id && sudo -n ln -sf /etc/nginx/sites-available/gatraglobal.id /etc/nginx/sites-enabled/gatraglobal.id && sudo -n rm -f /etc/nginx/sites-enabled/default && sudo -n nginx -t && sudo -n systemctl reload nginx"

echo "=== 6/8 Firewall (ufw) ==="
ssh $SSHOPTS $REMOTE "sudo -n ufw allow 22/tcp && sudo -n ufw allow 80/tcp && sudo -n ufw allow 443/tcp && sudo -n ufw --force enable"

echo "=== 7/8 Hardening: matikan login password SSH ==="
ssh $SSHOPTS $REMOTE "sudo -n sed -i 's/^#\\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config && (sudo -n systemctl reload ssh || sudo -n systemctl reload sshd) && echo HARDENED"

echo "=== 8/8 SSL (opsional) ==="
if [ "$SSL" = "--ssl" ]; then
  ssh $SSHOPTS $REMOTE "sudo -n certbot --nginx -d gatraglobal.id -d www.gatraglobal.id --non-interactive --agree-tos -m uppvision@gmail.com --redirect"
else
  echo "   Lewati dulu. Setelah DNS mengarah ke $IP, jalankan: bash deploy.sh $IP --ssl"
fi

echo ""
echo "✅ DEPLOY SELESAI — cek: http://$IP"
