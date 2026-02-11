# ETAPA 1: Construcción (Build)
FROM node:18-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ETAPA 2: Producción con Nginx (Fase 3.2)
FROM nginx:stable-alpine
# Copiamos los archivos estáticos de React a Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copiamos una configuración básica si fuera necesario, o usamos la default
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]