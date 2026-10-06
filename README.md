# Arkitektur — Architecture Site

Static multi-page website built with [Eleventy](https://www.11ty.dev/) (static
site generator). Templates use Nunjucks with shared includes for header, footer,
and scripts — no duplication, no client-side fetch hacks.

## Project structure

```
.
├── *.njk                          # страницы (frontmatter + контент)
├── _includes/                     # общие шаблоны
│   ├── base.njk                   # базовый layout (head, body, includes)
│   ├── spinner.njk                # спиннер загрузки
│   ├── topbar.njk                 # верхняя панель
│   ├── navbar.njk                 # навигация (active через frontmatter)
│   ├── footer.njk                 # подвал
│   └── scripts.njk                # JS-библиотеки + аналитика
├── _data/
│   └── site.json                  # контакты, соцсети, базовый URL
├── .eleventy.js                   # конфиг Eleventy
├── css/  img/  lib/  scss/        # стили, изображения, библиотеки
├── js/
│   ├── main.js                    # логика шаблона
│   └── form-handler.js            # отправка форм → Cloudflare Worker → Telegram
├── worker/                        # Cloudflare Worker для форм
├── Dockerfile                     # Docker для локальной разработки
├── docker-compose.yml             # docker compose up → dev-сервер на :8080
├── package.json                   # зависимости и скрипты npm
└── .github/workflows/             # CI: сборка + деплой на GitHub Pages
```

## Как это работает

Каждая страница — `.njk` файл с frontmatter:

```yaml
---
layout: base.njk
title: "About Us — Arkitektur"
description: "..."
active: "about"        # активный пункт навигации
og_image: "img/about-1.jpg"
---

{% block content %}
  ...уникальный контент страницы...
{% endblock %}
```

`base.njk` собирает `<head>`, шапку, футер и скрипты из `_includes/`.
Активный пункт меню определяется через `active` в frontmatter.

## Запуск локально

### Вариант 1 — Docker (рекомендуется, не нужен установленный Node.js)

```bash
# Сборка образа и запуск dev-сервера с hot-reload
docker compose up

# Сайт доступен на http://localhost:8081
# Остановка: Ctrl+C, затем docker compose down
```

### Вариант 2 — Node.js напрямую

Нужен Node.js 18+ (LTS):

```bash
npm install        # установить зависимости
npm run dev        # dev-сервер на http://localhost:8081 (hot-reload)
```

### Вариант 3 — Разовая сборка без dev-сервера

```bash
npm install
npm run build      # собирает статический HTML в _site/
```

Результат в `_site/` — чистые HTML-файлы, можно открыть через любой
HTTP-сервер:

```bash
cd _site && python3 -m http.server 8000
```

## Деплой на GitHub Pages

Деплой происходит **автоматически** через GitHub Actions при пуше в `main`.

1. Запушить изменения в `main`
2. GitHub Actions соберёт сайт через `npm run build`
3. Загрузит `_site/` в GitHub Pages

Настройка (один раз): **Settings → Pages → Source → GitHub Actions**.

Сайт: https://alnarozhny.github.io/builder-site/

## Формы → Telegram

Формы (`contact.njk`, `appointment.njk`) отправляются через Cloudflare Worker
в Telegram-бота. Настройка описана в `worker/README.md`.

## Аналитика

Google Analytics 4 и Hotjar подключены в `_includes/scripts.njk` с
плейсхолдерами `GA_ID` и `HJ_ID`. Замените на реальные ID.

## Лицензия

Шаблон от [HTML Codex](https://htmlcodex.com), распространяется через
[ThemeWagon](https://themewagon.com). Бесплатен при сохранении атрибуции в
подвале (см. `_includes/footer.njk`).
