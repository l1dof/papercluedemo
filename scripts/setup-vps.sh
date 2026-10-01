#!/usr/bin/env bash
# One-time VPS setup for Rocky Linux / RHEL-like hosts:
# installs Docker + compose plugin, opens HTTP/HTTPS, clones the repo.
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/l1dof/papercluedemo.git}"
APP_DIR="${APP_DIR:-$HOME/papercluedemo}"

if ! command -v docker >/dev/null; then
  sudo dnf -y install dnf-plugins-core git
  sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
  sudo dnf -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo systemctl enable --now docker
  sudo usermod -aG docker "$USER"
fi

if systemctl is-active --quiet firewalld; then
  sudo firewall-cmd --permanent --add-service=http --add-service=https
  sudo firewall-cmd --reload
fi

[ -d "$APP_DIR/.git" ] || git clone "$REPO_URL" "$APP_DIR"

if [ ! -f "$APP_DIR/.env" ]; then
  cat > "$APP_DIR/.env" <<'ENV'
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
DOMAIN=139-99-90-56.sslip.io
ENV
  echo "Edit $APP_DIR/.env with the Supabase values, then run: cd $APP_DIR && docker compose up -d --build"
fi

echo "Done. Log out and back in once so the docker group applies to $USER."
