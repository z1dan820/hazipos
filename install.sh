#!/bin/bash

# HaziPos Global Installer (PC & STB Armbian)
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}🚀 HAZIPOS UNIVERSAL INSTALLER STARTING...${NC}"
echo -e "${BLUE}==========================================${NC}"

# 1. Deteksi Arsitektur
ARCH=$(uname -m)
echo -e "${BLUE}🔍 Mendeteksi Sistem: $ARCH${NC}"

# 2. Update Repository Dasar
echo -e "${BLUE}🔄 Update paket sistem...${NC}"
sudo apt-get update -y

# 3. Install Dependensi Dasar (Wajib untuk kompilasi di ARM/STB)
echo -e "${BLUE}🛠 Menyiapkan tools dasar...${NC}"
sudo apt-get install -y git curl build-essential

# 4. Cek & Install Node.js (Universal via Nodesource)
if command -v node >/dev/null 2>&1; then
    echo -e "${GREEN}✔ Node.js sudah terinstall: $(node -v)${NC}"
else
    echo -e "${BLUE}📦 Menginstall Node.js v18...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 5. Cek & Install PM2
if command -v pm2 >/dev/null 2>&1; then
    echo -e "${GREEN}✔ PM2 sudah terinstall.${NC}"
else
    echo -e "${BLUE}⚙️ Menginstall PM2 secara global...${NC}"
    sudo npm install pm2 -g
fi

# 6. Setup Project
echo -e "${BLUE}📥 Menginstall dependensi aplikasi...${NC}"
if [ -f "package.json" ]; then
    npm install --production
else
    echo -e "${RED}❌ Error: file package.json tidak ditemukan!${NC}"
    exit 1
fi

# 7. Jalankan dengan PM2 (Auto-Restart Management)
echo -e "${BLUE}🏃 Menjalankan HaziPos dengan PM2...${NC}"
pm2 delete hazipos >/dev/null 2>&1 || true
pm2 start index.js --name "hazipos"

# 8. Konfigurasi Startup (Penting untuk STB/Server agar auto-ON)
echo -e "${BLUE}💾 Menyimpan konfigurasi startup...${NC}"
pm2 save
sudo env PATH=$PATH:$(which node) $(which pm2) startup systemd -u $USER --hp $HOME | bash

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}✅ HAZIPOS BERHASIL TERINSTALL!${NC}"
echo -e "${BLUE}Akses aplikasi di: http://localhost:3000${NC}"
echo -e "${BLUE}Atau via IP Alat: http://$(hostname -I | awk '{print $1}'):3000${NC}"
echo -e "${GREEN}==========================================${NC}"
