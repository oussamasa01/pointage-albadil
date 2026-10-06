# Guide d'Installation - École Al Badil Attarbaoui

## Option 1 : Installation avec Laravel Installer (Recommandée)

### Backend Laravel

```bash
cd ~/Desktop/SimpV
rm -rf backend  # Supprimer le dossier backend actuel

# Installer Laravel avec Composer
composer create-project laravel/laravel backend

cd backend

# Copier les fichiers du projet
# Les fichiers Models, Controllers, Migrations, etc. sont déjà créés
# Il faut juste les copier dans le nouveau projet Laravel
```

### Étapes détaillées :

1. **Créer le projet Laravel** :
```bash
cd ~/Desktop/SimpV
composer create-project laravel/laravel backend
cd backend
```

2. **Configurer la base de données** :
```bash
# Éditer .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pointage_db
DB_USERNAME=root
DB_PASSWORD=

# Créer la base de données
mysql -u root -p -e "CREATE DATABASE pointage_db;"
```

3. **Copier les fichiers du projet** :

Les fichiers suivants sont déjà créés dans `/home/oussama/Desktop/SimpV/backend` :
- `app/Models/Teacher.php`
- `app/Models/Pointage.php`
- `app/Models/User.php`
- `app/Http/Controllers/AuthController.php`
- `app/Http/Controllers/TeacherController.php`
- `app/Http/Controllers/PointageController.php`
- `app/Http/Controllers/DashboardController.php`
- `database/migrations/*.php`
- `database/seeders/*.php`
- `routes/api.php`

Ces fichiers remplacent ceux par défaut de Laravel.

4. **Installer Sanctum** :
```bash
php artisan install:api
```

5. **Mettre à jour config/cors.php** (déjà créé)

6. **Exécuter les migrations** :
```bash
php artisan migrate
php artisan db:seed
php artisan storage:link
```

7. **Démarrer le serveur** :
```bash
php artisan serve
```

---

## Option 2 : Script d'installation automatique

Créez un fichier `install.sh` :

```bash
#!/bin/bash

echo "Installation du système de pointage..."

# Backend
cd ~/Desktop/SimpV
composer create-project laravel/laravel backend-temp
mv backend backend-old
mv backend-temp backend

# Copier les fichiers personnalisés
cp backend-old/app/Models/* backend/app/Models/
cp backend-old/app/Http/Controllers/* backend/app/Http/Controllers/
cp -r backend-old/database/* backend/database/
cp backend-old/routes/api.php backend/routes/
cp backend-old/config/cors.php backend/config/
cp backend-old/.env.example backend/.env

cd backend

# Configuration
php artisan key:generate
php artisan install:api

# Base de données
echo "Création de la base de données..."
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS pointage_db;"

# Migrations
php artisan migrate
php artisan db:seed
php artisan storage:link

echo "Backend installé avec succès!"

# Frontend
cd ../frontend
npm install

echo "Installation terminée!"
echo ""
echo "Pour démarrer:"
echo "Terminal 1: cd backend && php artisan serve"
echo "Terminal 2: cd frontend && npm run dev"
echo ""
echo "Compte admin: admin@albadil.ma / admin123"
```

---

## Option 3 : Installation manuelle simple

### Backend

```bash
cd ~/Desktop/SimpV

# Supprimer et recréer
rm -rf backend
composer create-project laravel/laravel backend "11.*"

cd backend

# Configurer .env
nano .env
# Modifier:
# DB_DATABASE=pointage_db
# DB_USERNAME=root
# DB_PASSWORD=

# Installer Sanctum
php artisan install:api

# Créer la structure
mkdir -p app/Models
mkdir -p app/Http/Controllers
mkdir -p database/seeders
```

Ensuite, copiez manuellement tous les fichiers depuis l'ancien dossier backend vers le nouveau.

### Frontend

```bash
cd ~/Desktop/SimpV/frontend
npm install
npm run dev
```

---

## Fichiers principaux à copier

Une fois Laravel installé, assurez-vous que ces fichiers sont en place :

### Models
- `app/Models/Teacher.php`
- `app/Models/Pointage.php`
- `app/Models/User.php`

### Controllers
- `app/Http/Controllers/AuthController.php`
- `app/Http/Controllers/TeacherController.php`
- `app/Http/Controllers/PointageController.php`
- `app/Http/Controllers/DashboardController.php`

### Database
- `database/migrations/2024_01_01_000001_create_users_table.php`
- `database/migrations/2024_01_01_000002_create_teachers_table.php`
- `database/migrations/2024_01_01_000003_create_pointages_table.php`
- `database/seeders/UserSeeder.php`
- `database/seeders/TeacherSeeder.php`
- `database/seeders/DatabaseSeeder.php`

### Routes & Config
- `routes/api.php`
- `config/cors.php`

---

## Vérification

Pour vérifier que tout fonctionne :

```bash
# Backend
curl http://localhost:8000/api/teachers

# Frontend  
curl http://localhost:5173
```

---

## Dépannage

### Erreur : "Could not open input file: artisan"
→ Vous n'êtes pas dans le bon dossier ou Laravel n'est pas installé correctement

### Erreur : Composer security advisories
→ Utilisez Laravel 11 au lieu de Laravel 10

### Erreur : npm ENOENT
→ Vérifiez que vous êtes dans le dossier frontend avant de lancer npm install

---

## Support

Tous les fichiers du code sont déjà créés. Il suffit de :
1. Créer un projet Laravel frais avec Composer
2. Copier les fichiers personnalisés dedans
3. Installer les dépendances frontend
4. Lancer les serveurs
