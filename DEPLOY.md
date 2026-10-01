# Déploiement sur un VPS

Stack : Docker Compose avec l'app Next.js (build `standalone`) derrière Caddy, qui gère le HTTPS automatiquement via Let's Encrypt.

## 1. Préparer le VPS (une seule fois)

```bash
# Docker + plugin compose (Debian/Ubuntu)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # puis se reconnecter

git clone https://github.com/l1dof/papercluedemo.git ~/papercluedemo
cd ~/papercluedemo
```

Créer `~/papercluedemo/.env` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
# Obligatoire : un nom d'hôte dont l'enregistrement A pointe vers l'IP du VPS (HTTPS auto).
# Sans nom de domaine, utiliser <IP-avec-tirets>.sslip.io, ex. 203-0-113-10.sslip.io
DOMAIN=app.exemple.com
```

Ouvrir les ports 80 et 443 (par ex. `sudo ufw allow 80,443/tcp`).

## 2. Lancer

```bash
docker compose up -d --build
docker compose logs -f app
```

Dans Supabase → Authentication → URL Configuration, ajouter l'URL publique (`https://app.exemple.com`) comme Site URL / Redirect URL, sinon les liens de confirmation d'email pointeront vers localhost.

## 3. Déploiement automatique (optionnel)

`.github/workflows/deploy.yml` se connecte au VPS en SSH à chaque push sur `main` (ou à la main via « Run workflow »), puis fait `git reset --hard origin/main` et `docker compose up -d --build`.

Secrets à créer dans GitHub → Settings → Secrets and variables → Actions :

| Secret | Valeur |
|---|---|
| `VPS_HOST` | IP ou nom d'hôte du VPS |
| `VPS_USER` | utilisateur SSH (membre du groupe `docker`) |
| `VPS_SSH_KEY` | clé privée SSH dont la clé publique est dans `~/.ssh/authorized_keys` sur le VPS |
| `VPS_PORT` | optionnel, 22 par défaut |
| `VPS_APP_DIR` | optionnel, `~/papercluedemo` par défaut |

Si le dépôt est privé, le VPS doit pouvoir faire `git fetch` (deploy key en lecture seule ou token).
