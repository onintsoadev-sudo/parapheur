# e-Parapheur — Frontend (React + Vite)

Interface modernisée, compatible avec le backend **Express.js**.

## Prérequis

- Node.js >= 18
- Backend Express démarré sur le port **8000**

## Installation

```bash
cd frontend
npm install
cp .env.example .env
```

Vérifiez `.env` :

```
VITE_API_URL=http://127.0.0.1:8000/api
```

## Lancer

```bash
npm run dev
```

Ouvrez l'URL affichée (souvent http://localhost:5173).

## Comptes de test (backend seed)

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@parapheur.local | Admin123! | admin |
| scc@parapheur.local | Admin123! | scc (enregistre les courriers) |
| sp@parapheur.local | Admin123! | sp |
| agent@parapheur.local | Admin123! | agent |

## Design

- Tailwind CSS + design system custom (brand indigo / accent or)
- Animations CSS (fade, float, blobs)
- Pages publiques redesignées : Accueil, Login, Support, Navigation
- Couleurs legacy unifiées vers la palette brand
- Axios avec intercepteurs JWT automatiques

Les fonctionnalités métier (routes, appels API, rôles) sont **inchangées**.
