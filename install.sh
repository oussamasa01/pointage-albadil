#!/bin/bash

echo "=========================================="
echo "Installation - École Al Badil Attarbaoui"
echo "=========================================="
echo ""

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier que nous sommes dans le bon dossier
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo -e "${RED}Erreur: Exécutez ce script depuis le dossier SimpV${NC}"
    exit 1
fi

# Sauvegarder les fichiers personnalisés
echo -e "${YELLOW}Sauvegarde des fichiers du projet...${NC}"
mkdir -p .temp_backup
cp -r backend/app .temp_backup/
cp -r backend/database .temp_backup/
cp -r backend/routes .temp_backup/
cp -r backend/config .temp_backup/ 2>/dev/null || true
cp backend/.env.example .temp_backup/ 2>/dev/null || true

# Supprimer l'ancien backend
echo -e "${YELLOW}Suppression de l'ancien backend...${NC}"
rm -rf backend

# Créer un nouveau projet Laravel
echo -e "${YELLOW}Création d'un nouveau projet Laravel...${NC}"
composer create-project laravel/laravel backend

if [ $? -ne 0 ]; then
    echo -e "${RED}Erreur lors de la création du projet Laravel${NC}"
    echo -e "${YELLOW}Restauration des fichiers...${NC}"
    rm -rf backend
    mv .temp_backup backend
    exit 1
fi

# Restaurer les fichiers personnalisés
echo -e "${YELLOW}Restauration des fichiers personnalisés...${NC}"
cp -r .temp_backup/app/* backend/app/
cp -r .temp_backup/database/* backend/database/
cp .temp_backup/routes/api.php backend/routes/
cp .temp_backup/config/cors.php backend/config/ 2>/dev/null || true
cp .temp_backup/.env.example backend/.env.example 2>/dev/null || true

# Nettoyer
rm -rf .temp_backup

# Configurer le backend
cd backend

echo -e "${YELLOW}Configuration du backend...${NC}"

# Copier .env
cp .env.example .env

# Générer la clé
php artisan key:generate

# Installer Sanctum
echo -e "${YELLOW}Installation de Laravel Sanctum...${NC}"
php artisan install:api --quiet

# Configurer la base de données
echo ""
echo -e "${YELLOW}Configuration de la base de données${NC}"
read -p "Nom de la base de données [pointage_db]: " DB_NAME
DB_NAME=${DB_NAME:-pointage_db}

read -p "Utilisateur MySQL [root]: " DB_USER
DB_USER=${DB_USER:-root}

read -s -p "Mot de passe MySQL (appuyez sur Entrée si vide): " DB_PASS
echo ""

# Mettre à jour .env
sed -i "s/DB_DATABASE=.*/DB_DATABASE=$DB_NAME/" .env
sed -i "s/DB_USERNAME=.*/DB_USERNAME=$DB_USER/" .env
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" .env

# Créer la base de données
echo -e "${YELLOW}Création de la base de données...${NC}"
if [ -z "$DB_PASS" ]; then
    mysql -u "$DB_USER" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
else
    mysql -u "$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}Erreur lors de la création de la base de données${NC}"
    echo -e "${YELLOW}Vous devrez créer la base manuellement: CREATE DATABASE $DB_NAME;${NC}"
fi

# Exécuter les migrations
echo -e "${YELLOW}Exécution des migrations...${NC}"
php artisan migrate --force

if [ $? -ne 0 ]; then
    echo -e "${RED}Erreur lors des migrations${NC}"
    echo -e "${YELLOW}Vérifiez votre configuration MySQL${NC}"
    exit 1
fi

# Exécuter les seeders
echo -e "${YELLOW}Insertion des données de test...${NC}"
php artisan db:seed --force

# Créer le lien symbolique pour le stockage
echo -e "${YELLOW}Configuration du stockage...${NC}"
php artisan storage:link

cd ..

# Installer le frontend
echo ""
echo -e "${YELLOW}Installation du frontend...${NC}"
cd frontend

if [ ! -f "package.json" ]; then
    echo -e "${RED}Erreur: package.json introuvable dans le dossier frontend${NC}"
    exit 1
fi

npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}Erreur lors de l'installation des dépendances frontend${NC}"
    exit 1
fi

cd ..

# Résumé
echo ""
echo -e "${GREEN}=========================================="
echo "Installation terminée avec succès!"
echo "==========================================${NC}"
echo ""
echo "Pour démarrer l'application:"
echo ""
echo -e "${YELLOW}Terminal 1 (Backend):${NC}"
echo "  cd backend"
echo "  php artisan serve"
echo ""
echo -e "${YELLOW}Terminal 2 (Frontend):${NC}"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo -e "${GREEN}Accès:${NC}"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend API: http://localhost:8000"
echo "  - Interface pointage: http://localhost:5173/pointage"
echo "  - Admin: http://localhost:5173/admin/login"
echo ""
echo -e "${GREEN}Compte administrateur:${NC}"
echo "  Email: admin@albadil.ma"
echo "  Password: admin123"
echo ""
echo -e "${GREEN}Professeurs de test:${NC}"
echo "  - Ahmed Alaoui (Mathématiques) - Matricule: 1025"
echo "  - Sara Amrani (Français) - Matricule: 1026"
echo "  - Youssef Karim (Physique) - Matricule: 1027"
echo ""
