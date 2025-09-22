# Используем Node.js образ
FROM node:18-alpine

# Рабочая директория
WORKDIR /app

# Копируем package.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы
COPY . .

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "run", "dev"]
