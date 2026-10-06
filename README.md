# Système de Pointage - École Al Badil Attarbaoui

Application web simple de gestion et de pointage des professeurs.

## Technologies

- **Backend**: Laravel 10
- **Frontend**: React + Vite
- **Database**: MySQL
- **Styling**: Tailwind CSS

---

## Installation Backend (Laravel)

### 1. Prérequis

- PHP 8.1 ou supérieur
- Composer
- MySQL
- Extension PHP: PDO, Mbstring, OpenSSL, etc.

### 2. Installation

```bash
cd backend

# Installer les dépendances
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Configurer la base de données dans .env
# DB_DATABASE=pointage_db
# DB_USERNAME=root
# DB_PASSWORD=

# Créer la base de données
mysql -u root -p -e "CREATE DATABASE pointage_db;"

# Exécuter les migrations
php artisan migrate

# Exécuter les seeders
php artisan db:seed

# Créer le lien symbolique pour le stockage
php artisan storage:link

# Démarrer le serveur
php artisan serve
```

Le backend sera accessible sur `http://localhost:8000`

### 3. Compte Admin par défaut

- **Email**: admin@albadil.ma
- **Password**: admin123

---

## Installation Frontend (React)

### 1. Prérequis

- Node.js 16 ou supérieur
- npm ou yarn

### 2. Installation

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

---

## Structure du Projet

```
SimpV/
├── backend/              # Laravel API
│   ├── app/
│   │   ├── Models/
│   │   └── Http/Controllers/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
│       └── api.php
│
└── frontend/            # React App
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── App.jsx
    └── package.json
```

---

## API Endpoints

### Publiques

- `POST /api/admin/login` - Connexion admin
- `POST /api/pointage/lookup` - Rechercher un professeur par matricule
- `POST /api/pointage/confirm` - Confirmer le pointage

### Protégées (nécessitent un token)

- `GET /api/dashboard` - Statistiques du dashboard
- `GET /api/teachers` - Liste des professeurs
- `POST /api/teachers` - Créer un professeur
- `PUT /api/teachers/{id}` - Modifier un professeur
- `DELETE /api/teachers/{id}` - Supprimer un professeur
- `GET /api/pointages` - Liste des pointages
- `GET /api/pointages/today` - Pointages d'aujourd'hui

---

## Fonctionnalités

### Dashboard Admin

- Statistiques (total professeurs, présents, absents)
- Liste des pointages du jour
- Gestion des professeurs (CRUD)
- Historique des pointages

### Interface Pointage

- Page publique à l'entrée de l'école
- Saisie du matricule
- Affichage des informations du professeur
- Enregistrement du pointage
- Protection contre le double pointage

---

## Base de Données

### Tables

**users**
- id, name, email, password

**teachers**
- id, nom, prenom, photo, matiere, matricule (unique)

**pointages**
- id, teacher_id, date, heure
- Contrainte: UNIQUE(teacher_id, date)

---

## Professeurs de Démonstration

| Nom | Prénom | Matière | Matricule |
|-----|--------|---------|-----------|
| Alaoui | Ahmed | Mathématiques | 1025 |
| Amrani | Sara | Français | 1026 |
| Karim | Youssef | Physique | 1027 |
| Bennani | Fatima | Arabe | 1028 |
| El Idrissi | Mohamed | Histoire | 1029 |

---

## Palette de Couleurs

- Navy: `#001030`
- Gold: `#d0a040`
- White: `#FFFFFF`
- Light background: `#F5F7FA`

---

## Production

### Backend

```bash
# Optimiser les fichiers de configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Mettre APP_DEBUG=false dans .env
```

### Frontend

```bash
# Construire pour la production
npm run build

# Les fichiers seront dans le dossier dist/
```

---

## Support

Pour toute question concernant l'application, contactez l'administration de l'école.
