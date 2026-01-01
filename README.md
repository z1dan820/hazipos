# HaziPos 🛒
**Lightweight & Universal POS System**

[![Platform](https://img.shields.io/badge/Platform-PC%20%7C%20STB%20Armbian-blue)](https://github.com/fhamzidan/hazipos)

HaziPos dirancang untuk berjalan di berbagai perangkat, mulai dari PC High-end hingga STB (Set Top Box) bekas dengan RAM terbatas.

## 📥 Cara Instalasi (Satu Baris Perintah)
Buka terminal di perangkat Anda (PC Linux atau STB Armbian) dan jalankan:
```bash
curl -sSL [https://raw.githubusercontent.com/z1dan820/hazipos/main/install.sh](https://raw.githubusercontent.com/z1dan820/hazipos/main/install.sh) | bash

```
***🐳 Menggunakan Docker
Jika perangkat Anda sudah terinstall Docker:**
```bash
docker build -t hazipos .
docker run -d -p 3000:3000 --name hazipos-app --restart always hazipos
```
**🖥️ Akses Aplikasi**

Setelah instalasi selesai, buka browser dan akses:

Lokal: http://localhost:3000

Jaringan (STB): http://[IP-ALAT-ANDA]:3000
