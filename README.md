# FF Tournois — Prototype

Petit prototype de site pour gérer des tournois Free Fire (frontend statique).

## Contenu
- `index.html` : page d'accueil avec listing de tournois, formulaire d'inscription (modal) et un exemple de bracket
- `admin.html` : interface d'administration simple pour consulter/exporter/vider les inscriptions
- `styles.css` : styles basiques responsives
- `script.js` : logique côté client (stockage dans `localStorage`)

## Lancement local
1. Installer les dépendances et démarrer le serveur:
   - `npm install`
   - Copier `.env.example` en `.env` et définir `ADMIN_API_KEY`.
   - `npm start` (ou `npm run dev` si tu as `nodemon`).
2. Le serveur écoute sur `http://localhost:3000` par défaut et sert aussi le frontend (`/public`).
3. Option : utiliser Docker Compose:
   - `docker compose up --build` puis ouvrir `http://localhost:3000`

## Tester l'API
- Health: `GET /api/health` → Retourne `{ok:true}`
- Liste des tournois: `GET /api/tournaments`
- Inscription: `POST /api/registrations` (JSON: `{ tournamentId, teamName, captain, players, contact }`)
- Opérations admin (utiliser le header `X-API-KEY`):
  - `GET /api/registrations` (liste)
  - `GET /api/export` (CSV)
  - `DELETE /api/registrations` (vider)

## Déployer sur Render (pas-à-pas)
1. Mettre le projet sur GitHub (repo public ou privé).
2. Créer un nouveau service **Web Service** sur Render et connecter ton repo GitHub.
   - Branch: `main` (ou celle que tu veux déployer)
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Port: `3000` (par défaut)
3. Dans la section **Environment** du service, définir les variables d'environnement:
   - `ADMIN_API_KEY` = **(ta clé admin)**
   - `DB_PATH` = `/data/ff.db`  (voir note sur disque persistant)
4. Pour que le fichier SQLite survive aux redéploiements, **activer un Persistent Disk** dans Render et monter le disque sur `/data`.
   - Dans l'UI Render, ajoute un "Persistent Disk" et choisis la taille souhaitée, puis attache-le au service avec le **mount path** `/data`.
5. Déployer: clic sur _Create Web Service_ / _Deploy_.
6. Vérifier les logs (Render Dashboard) et tester l'API: `GET https://<ton-service>.onrender.com/api/health`.

Remarques et options:
- Alternative (recommandée pour production): utiliser une base centralisée (Postgres sur Render) et migrer la logique DB au lieu de SQLite pour scalabilité et sauvegardes.
- Si tu préfères déployer via Docker, choisis "Docker" comme environment sur Render et laisse le service builder utiliser ton `Dockerfile`.

## Déployer le frontend sur Netlify
1. Pousser ton code sur GitHub (branche `main` recommandée).
2. Sur Netlify, créer un nouveau **Site from Git** et connecter ton repository.
   - Branch: `main` (ou autre branche)
   - Build command: laisse vide (site statique) ou indique ton build si tu ajoutes un bundler
   - Publish directory: `public`
3. Si tu veux que les appels `/api/*` pointent vers ton backend (par ex. Render/Railway), remplace `YOUR_API_HOST` dans `netlify.toml` et `/public/_redirects` par l'URL de ton API (ex: `https://mon-api.onrender.com`). Netlify redirigera automatiquement les requêtes API.
4. Option d'hébergement rapide: tu peux aussi utiliser le bouton **Deploys → Deploy site** et simplement glisser‑déposer le dossier `public` dans Netlify (Drag & Drop) pour un déploiement instantané.
5. Menu Settings → Environment pour définir des variables d'environnement (ex: `API_BASE_URL` si tu préfères utiliser une variable côté client).

### Si tu veux tout héberger chez Netlify (fonctions serverless)
- Réécrire les routes backend en **Netlify Functions** (dossier `netlify/functions`) et remplacer SQLite par une base distante (Supabase/Postgres) car Netlify n'offre pas de disque persistant pour SQLite.
- Supabase (Postgres hébergé) s'intègre très bien: garde la logique DB centralisée et accessible depuis Netlify Functions.

---

## Fonctionnalités
- Inscription d'équipes (sauvegardées dans `localStorage`)
- Export CSV depuis la page `admin.html`
- Bracket d'exemple affiché côté client

## Extensions possibles
- Remplacer `localStorage` par une API backend (Node/Express, Firebase, etc.) pour persistance
- Authentification admin
- Génération automatique de brackets, gestion des résultats en temps réel

---
Si tu veux, je peux :
- Ajouter la partie backend (Node + SQLite) pour stocker les inscriptions,
- Intégrer une version responsive plus travaillée et des animations,
- Ajouter la gestion des matchs (marquer gagnants) et la mise à jour automatique du bracket.

Dis-moi quelle option tu préfères et je l'implémente. 🚀