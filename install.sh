
#!/bin/bash
# HaziPos Universal Installer v1.1
# Maintainer: z1dan820

BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'
REPO_URL="https://github.com/z1dan820/hazipos.git"
INSTALL_DIR="$HOME/hazipos" # Diubah ke Home agar aman dari kendala permission

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}🚀 HAZIPOS SMART INSTALLER STARTING...   ${NC}"
echo -e "${BLUE}==========================================${NC}"

# 1. Update & Alat Dasar
echo -e "${BLUE}[1/5] Memperbarui sistem & alat dasar...${NC}"
sudo apt-get update -y
sudo apt-get install -y git curl build-essential

# 2. Proses Clone/Update
if [ ! -d "$INSTALL_DIR" ]; then
    echo -e "${BLUE}[2/5] Mengunduh source code HaziPos...${NC}"
    git clone $REPO_URL $INSTALL_DIR
else
    echo -e "${BLUE}[2/5] Folder ditemukan, memperbarui kode...${NC}"
    cd $INSTALL_DIR && git pull
fi

cd $INSTALL_DIR

# 3. Cek Node.js & PM2
echo -e "${BLUE}[3/5] Verifikasi Node.js & PM2...${NC}"
if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
    sudo npm install pm2 -g
fi

# 4. Install Dependensi
echo -e "${BLUE}[4/5] Menginstall dependensi (npm install)...${NC}"
npm install --production

# 5. Konfigurasi Izin & Menjalankan Aplikasi
echo -e "${BLUE}[5/5] Konfigurasi izin folder & PM2...${NC}"
chmod -R 777 $INSTALL_DIR # Pastikan aplikasi bisa menulis database/log
pm2 delete hazipos >/dev/null 2>&1 || true
pm2 start server.js --name "hazipos"

# Auto-start saat reboot
pm2 save
sudo env PATH=$PATH:$(which node) $(which pm2) startup systemd -u $USER --hp $HOME | bash

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}✅ HAZIPOS BERHASIL TERPASANG!${NC}"
echo -e "${BLUE}Direktori: $INSTALL_DIR${NC}"
echo -e "${BLUE}Akses via Browser:${NC}"
echo -e "${BLUE}Local: http://localhost:3010${NC}"
echo -e "${BLUE}STB IP: http://$(hostname -I | awk '{print $1}'):3010${NC}"
echo -e "${GREEN}==========================================${NC}"
