#!/bin/bash

echo "🚀 === ДЕПЛОЙ RAILWAY SaaS PLATFORM ==="
echo

# Проверка Railway CLI
echo "🔍 Проверка Railway CLI..."
railway --version || { echo "❌ Railway CLI не установлен"; exit 1; }

# Проверка Git
echo "📁 Проверка Git репозитория..."
if [ ! -d ".git" ]; then
    echo "🔧 Инициализация Git..."
    git init
    git remote add origin https://github.com/digitalcluster25/dc.git
fi

# Проверка файлов
echo "📦 Проверка файлов проекта..."
[ -f "package.json" ] && echo "✅ package.json" || { echo "❌ package.json отсутствует"; exit 1; }
[ -f "pages/index.tsx" ] && echo "✅ pages/index.tsx" || echo "⚠️ Главная страница не найдена"

# Коммит изменений
echo "💾 Коммит изменений..."
git add .
git commit -m "deploy: Railway SaaS Platform v$(date +%Y%m%d_%H%M%S)" || echo "ℹ️ Нет изменений для коммита"

# Push в GitHub
echo "📤 Push в GitHub..."
git push origin main || echo "⚠️ Push не удался"

# Деплой на Railway
echo "🚀 Деплой на Railway..."
railway login --browserless || echo "⚠️ Требуется вход в Railway"
railway link e0fc7f70-e8f8-4ec8-8f98-6efc24fc28df || echo "⚠️ Не удалось подключиться к проекту"
railway up || echo "⚠️ Деплой не удался"

echo
echo "✅ Деплой завершен!"
echo "🌐 Проверь домен: https://www.digitalcluster.online"
echo "📊 Статус проекта: https://railway.app/project/e0fc7f70-e8f8-4ec8-8f98-6efc24fc28df"
