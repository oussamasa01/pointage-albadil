#!/bin/bash

echo "=========================================="
echo "Installation - École Al Badil Attarbaoui"
echo "Nouveau PC"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vérifier que nous sommes dans le bon dossier
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo -e "${RED}Erreur: Exécutez ce script depuis le dossier SimpV${NC}"
    exit 1
fi

# Backend
echo -e "${YELLOW}Configuration du backend...${NC}"
cd backend

# Installer les dépendances Composer
if [ ! -d "vendor" ]; then
    echo -e "${YELLOW}Installation des dépendances PHP...${NC}"
    composer install
fi

# Copier .env si nécessaire
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Création du fichier .env...${NC}"
    cp .env.example .env
fi

# Générer la clé d'application
echo -e "${YELLOW}Génération de la clé d'application...${NC}"
php artisan key:generate

# Configuration de la base de données
echo ""
echo -e "${YELLOW}Configuration de la base de données${NC}"
read -p "Nom de la base de données [pointage_db]: " DB_NAME
DB_NAME=${DB_NAME:-pointage_db}

read -p "Utilisateur MySQL [pointage_admin]: " DB_USER
DB_USER=${DB_USER:-pointage_admin}

read -s -p "Mot de passe MySQL [admin2024]: " DB_PASS
DB_PASS=${DB_PASS:-admin2024}
echo ""

# Mettre à jour .env
sed -i "s/DB_DATABASE=.*/DB_DATABASE=$DB_NAME/" .env
sed -i "s/DB_USERNAME=.*/DB_USERNAME=$DB_USER/" .env
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" .env

# Créer la base de données et l'utilisateur
echo -e "${YELLOW}Création de la base de données...${NC}"
sudo mysql <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Base de données créée avec succès${NC}"
else
    echo -e "${RED}Erreur lors de la création de la base de données${NC}"
    echo -e "${YELLOW}Créez-la manuellement avec :${NC}"
    echo "sudo mysql"
    echo "CREATE DATABASE $DB_NAME;"
    echo "CREATE USER '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
    echo "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
    echo "FLUSH PRIVILEGES;"
fi

# Migrations
echo -e "${YELLOW}Exécution des migrations...${NC}"
php artisan migrate --force

# Seeders
echo -e "${YELLOW}Insertion des données de test...${NC}"
php artisan db:seed --force

# Lien symbolique pour le stockage
echo -e "${YELLOW}Configuration du stockage...${NC}"
php artisan storage:link

cd ..

# Frontend
echo ""
echo -e "${YELLOW}Configuration du frontend...${NC}"
cd frontend

# Installer les dépendances npm
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installation des dépendances Node.js...${NC}"
    npm install
fi

# Copier le logo si nécessaire
if [ -f "../logoECole-removebg-preview.png" ] && [ ! -f "public/logo.png" ]; then
    echo -e "${YELLOW}Copie du logo de l'école...${NC}"
    mkdir -p public
    cp ../logoECole-removebg-preview.png public/logo.png
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
echo "  - Interface pointage: http://localhost:5173/pointage"
echo "  - Admin: http://localhost:5173/admin/login"
echo ""
echo -e "${GREEN}Compte administrateur:${NC}"
echo "  Email: admin@albadil.ma"
echo "  Password: admin123"
echo ""
