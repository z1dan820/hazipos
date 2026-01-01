# Menggunakan Alpine Linux karena sangat ringan (cocok untuk RAM STB yang kecil)
FROM node:18-alpine

# Set direktori kerja
WORKDIR /app

# Install git & build tools (diperlukan untuk beberapa package npm di ARM)
RUN apk add --no-cache git python3 make g++

# Copy package files saja untuk efisiensi layer
COPY package*.json ./

# Install dependensi (Hanya versi produksi agar ringan)
RUN npm install --production && npm install pm2 -g

# Copy semua file ke container
COPY . .

# Port aplikasi
EXPOSE 3000

# Jalankan dengan pm2-runtime agar container tetap hidup
CMD ["pm2-runtime", "start", "index.js", "--name", "hazipos-prod"]
