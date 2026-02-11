FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Instalamos todas las dependencias necesarias para TS
RUN npm install

COPY . .

# Exponemos el puerto
EXPOSE 3000

# 🟢 PUNTO CRÍTICO: Apuntamos a la ubicación real del archivo
# Usamos npx ts-node para ejecutar el archivo .ts directamente
CMD ["npx", "ts-node", "src/server.ts"]