# Arkitektur — Architecture Site

Static multi-page website (architecture/interior design template) refactored with
shared partials to avoid duplicating the header and footer across pages.

## Project structure

```
.
├── index.html, about.html, service.html, ...   # страницы (только уникальный контент)
├── partials/                                    # общие блоки, грузятся через JS
│   ├── spinner.html                             # спиннер загрузки
│   ├── topbar.html                              # верхняя панель (контакты)
│   ├── navbar.html                              # навигация (активный пункт через data-active)
│   ├── footer.html                              # подвал
│   └── scripts.html                             # кнопка "наверх" + JS-библиотеки + аналитика
├── js/
│   ├── includes.js                              # загрузчик партиалов
│   └── main.js                                  # логика шаблона (карусели, счётчики и т.д.)
├── css/  img/  lib/  scss/                      # стили, изображения, библиотеки
└── READ-ME.txt                                  # оригинальное описание шаблона
```

## Как это работает

Каждая HTML-страница содержит только `<head>` и свой уникальный контент.
Общие блоки (шапка, футер, скрипты) вставлены как пустые `<div>` с атрибутом
`data-include`:

```html
<div data-include="partials/navbar.html" data-active="team"></div>
```

`js/includes.js` находит все такие `div`, через `fetch()` подгружает соответствующий
партиал и вставляет его содержимое. Активный пункт навигации задаётся через
`data-active` (например `team`, `about`, `index`).

Аналитика (Google Analytics 4 и Hotjar) уже подключена в `partials/scripts.html`
с плейсхолдерами `GA_ID` и `HJ_ID` — замени их на реальные ID.

## Запуск локально

Партиалы грузятся через `fetch()`, а `fetch()` не работает по протоколу
`file://` (блокируется браузером из соображений безопасности). Поэтому сайт
нужно открывать через локальный HTTP-сервер, а не двойным кликом по файлу.

### Вариант 1 — Python (уже установлен почти везде)

```bash
python3 -m http.server 8000
```

Затем открыть в браузере: <http://localhost:8000/>

### Вариант 2 — Node.js

```bash
npx serve .
# или
npx http-server -p 8000
```

### Вариант 3 — VS Code

Установить расширение **Live Server**, правый клик по `index.html` →
"Open with Live Server".

## Деплой на GitHub Pages

1. Запушить репозиторий на GitHub.
2. В настройках репозитория: **Settings → Pages**.
3. **Source**: Deploy from a branch → **Branch**: `main` / `(root)` → Save.

GitHub Pages раздаёт сайт по HTTPS, поэтому `fetch()` для партиалов работает
без дополнительной настройки. Первый деплой занимает 1–2 минуты.

## Лицензия

Шаблон от [HTML Codex](https://htmlcodex.com), распространяется через
[ThemeWagon](https://themewagon.com). Бесплатен при сохранении атрибуции в
подвале (см. `partials/footer.html`).
