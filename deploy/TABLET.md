# Hub sur la tablette murale — mise en ligne rapide

Objectif : une URL HTTPS → Safari iPad → **Sur l’écran d’accueil** → plein écran kiosk.

> **Ne passe pas par FTP OVH** : ça affiche un listing de fichiers, pas l’app.

---

## Chemin recommandé : Vercel (5–10 min)

### 1. Compte
- Crée un compte sur [vercel.com](https://vercel.com) (GitHub recommandé)

### 2. Mettre le code sur GitHub
Sur ton Mac, dans le dossier du projet :

```bash
cd /Users/fl/www/homehub
git add -A
git status
# puis commit quand tu veux, et :
# créer un repo vide sur GitHub nommé homehub, puis :
git remote add origin https://github.com/TON_USER/homehub.git
git push -u origin main
```

### 3. Déployer
1. Vercel → **Add New Project** → importe `homehub`
2. **Root Directory** : `.`
3. **Environment Variables** (optionnel) :
   - `OPENAI_API_KEY` = ta clé (idées repas IA)
   - `MAELLE_CALENDAR_URL` / `PAPA_CALENDAR_URL` si besoin
4. **Ne pas** mettre `BASE_PATH` (l’URL sera du type `https://homehub-xxx.vercel.app`)
5. Deploy

### 4. Tablette murale (iPad)
1. Ouvre l’URL Vercel dans **Safari**
2. Bouton **Partager** → **Sur l’écran d’accueil**
3. Ouvre l’icône **Hub** (mode app, sans barre Safari)
4. (Optionnel) Réglages → Accessibilité → **Guided Access** : verrouille sur le Hub pour la tablette murale
5. Luminosité auto / ne pas verrouiller l’écran : Réglages → Luminosité → Auto-Lock → **Jamais** (ou chargeur + Guided Access)

---

## Plus tard : francoislamalle.fr/hub

Quand tu as un **VPS OVH avec SSH**, suis `deploy/DEPLOY-OVH.md`  
(`BASE_PATH=/hub` + reverse-proxy).

En attendant, la tablette peut déjà tourner 24/7 sur l’URL Vercel.

---

## Checklist mur

- [ ] URL ouverte sur la tablette
- [ ] Icône « Hub » sur l’écran d’accueil
- [ ] Wi‑Fi fiable / chargeur branché
- [ ] Auto-Lock désactivé ou Guided Access
- [ ] (Optionnel) Hue : marche surtout en local ; depuis le cloud le pont maison n’est pas joignable sans VPN
