# Node.js LTS для сборки Eleventy
FROM node:22-slim

WORKDIR /app

# Кешируем установку зависимостей
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Копируем исходники
COPY . .

# Порт dev-сервера Eleventy
EXPOSE 8080

# По умолчанию — dev-сервер с горячей перезагрузкой
CMD ["npx", "@11ty/eleventy", "--serve"]
