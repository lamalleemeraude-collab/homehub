# Déployer HomeHub sur OVH — https://francoislamalle.fr/hub

HomeHub est une app **Next.js** : il faut un **VPS (SSH + Node)**, pas un hébergement FTP/PHP seul.

## 0. Sécurité urgente — supprimer le listing public

Si [https://francoislamalle.fr/homehub/](https://francoislamalle.fr/homehub/) affiche encore un **Index of /homehub** (fichiers `.git`, `src`, `node_modules` visibles) :

1. Connexion FTP / File Manager OVH (hébergement mutualisé).
2. **Supprimer entièrement** le dossier `homehub` du webroot (ou le déplacer hors de `www`).
3. Ne jamais republier les sources en FTP : ça n’exécute pas Next.js et expose le code.

Sans VPS Node, l’URL `/hub` ne pourra pas servir l’app.

## 1. Prérequis VPS

- Ubuntu/Debian (ou équivalent) avec SSH
- Node.js **20+** (`node -v`)
- Apache (ou Nginx) devant le site `francoislamalle.fr`
- Modules Apache : `proxy`, `proxy_http`, `headers`

```bash
sudo apt update
sudo apt install -y nodejs npm   # ou NodeSource / nvm pour Node 20+
sudo a2enmod proxy proxy_http headers
```

## 2. Installer l’app

```bash
sudo mkdir -p /var/www/homehub
sudo chown "$USER":www-data /var/www/homehub
# Depuis ta machine : rsync (exclure node_modules et .next)
rsync -avz --exclude node_modules --exclude .next --exclude .git \
  ./ user@VPS_IP:/var/www/homehub/
```

Sur le VPS :

```bash
cd /var/www/homehub
npm ci
cp .env.example .env.local
# Éditer .env.local : au minimum
#   BASE_PATH=/hub
# + URLs calendriers / secrets si besoin
mkdir -p data
chmod 775 data

npm run build:hub

# Standalone : public + static à côté du serveur
cp -r public .next/standalone/
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/
```

## 3. Service systemd

```bash
sudo cp deploy/homehub.service /etc/systemd/system/homehub.service
# Vérifier User, chemins Node et WorkingDirectory
sudo systemctl daemon-reload
sudo systemctl enable --now homehub
sudo systemctl status homehub
# Test local :
curl -sI http://127.0.0.1:3000/hub | head
```

## 4. Reverse-proxy Apache → `/hub`

Dans le VirtualHost **HTTPS** de `francoislamalle.fr`, inclure :

```apache
IncludeOptional /var/www/homehub/deploy/apache-hub.conf
```

Puis :

```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

Ne pas créer un dossier webroot `/hub` en FTP qui ferait concurrence au proxy.

## 5. HTTPS

Let’s Encrypt / certificat OVH déjà en place en général. Vérifier que le conf proxy est bien dans le vhost **443**.

## 6. Vérifications

- [ ] https://francoislamalle.fr/hub s’ouvre (plus de listing de fichiers)
- [ ] https://francoislamalle.fr/homehub n’existe plus ou redirige
- [ ] Météo / calendrier OK
- [ ] Sur iPad Safari : Partager → **Sur l’écran d’accueil** (PWA)
- [ ] Webhook iPhone : URL `https://francoislamalle.fr/hub/api/webhook-calendar` (dossier `data/` writable)

## 7. Hue (lampe)

Le bridge Hue est en **réseau local**. Depuis un VPS distant, le contrôle Hue ne marchera en général **pas** sans tunnel VPN/Tailscale vers la maison. Le reste du hub (calendrier, météo, routines) fonctionne en ligne.

## 8. Mises à jour

```bash
cd /var/www/homehub
# rsync / git pull
npm ci
npm run build:hub
cp -r public .next/standalone/
mkdir -p .next/standalone/.next && cp -r .next/static .next/standalone/.next/
sudo systemctl restart homehub
```

## Alternative sans VPS

Hébergement **mutualisé PHP seul** : impossible. Il faut un VPS, un Cloud Web Node (souvent mieux en sous-domaine `hub.…`), ou un hébergeur Node (Vercel, etc.).
