# Etapa de build
FROM node:20-alpine AS build
WORKDIR /app

# Dependencias del frontend
COPY package*.json ./
RUN npm install

# Código del frontend (solo lo necesario)
COPY index.html ./
COPY vite.config.js ./
COPY eslint.config.js ./
COPY public ./public
COPY src ./src

# Build de producción
RUN npm run build

# Etapa de servidor web
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración básica de nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]