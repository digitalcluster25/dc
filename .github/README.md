# GitHub Actions Workflows

Этот проект использует GitHub Actions для автоматизации CI/CD процессов.

## Workflows

### CI (Continuous Integration)
- **Файл**: `.github/workflows/ci.yml`
- **Триггеры**: Push и Pull Request на ветки `main` и `develop`
- **Функции**:
  - Тестирование на Node.js 18.x и 20.x
  - Линтинг кода (ESLint)
  - Проверка форматирования (Prettier)
  - Запуск тестов с покрытием
  - Сборка приложения
  - Загрузка артефактов сборки

### CD (Continuous Deployment)
- **Файл**: `.github/workflows/cd.yml`
- **Триггеры**: Push на ветку `main`, ручной запуск
- **Функции**:
  - Автоматический деплой на Vercel
  - Комментирование PR с URL деплоя
  - Проверки перед деплоем

### Dependabot Auto-merge
- **Файл**: `.github/workflows/dependabot.yml`
- **Функции**:
  - Автоматическое слияние patch-обновлений от Dependabot
  - Безопасная автоматизация обновлений зависимостей

## Конфигурации

### Dependabot
- **Файл**: `.github/dependabot.yml`
- **Обновления**: npm пакеты и GitHub Actions
- **Расписание**: Еженедельно по понедельникам в 09:00
- **Игнорирование**: Major версии обновлений

### Codecov
- **Файл**: `codecov.yml`
- **Покрытие**: Минимум 70%
- **Статус**: Проверки в PR

### Vercel
- **Файл**: `vercel.json`
- **Фреймворк**: Next.js
- **Регион**: iad1
- **Безопасность**: Заголовки безопасности

## Шаблоны

### Issue Templates
- Bug Report (`.github/ISSUE_TEMPLATE/bug_report.md`)
- Feature Request (`.github/ISSUE_TEMPLATE/feature_request.md`)

### Pull Request Template
- **Файл**: `.github/pull_request_template.md`
- **Чеклист**: Проверки качества кода
- **Категории**: Типы изменений

## Секреты

Для работы CD pipeline необходимо настроить следующие секреты в GitHub:

- `VERCEL_TOKEN` - токен Vercel
- `ORG_ID` - ID организации Vercel
- `PROJECT_ID` - ID проекта Vercel

## Мониторинг

- **Статус**: GitHub Actions статус в README
- **Покрытие**: Codecov бейдж
- **Деплой**: Vercel статус
