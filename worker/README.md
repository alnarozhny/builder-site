# Формы → Telegram через Cloudflare Worker

Формы на сайте (`contact.html`, `appointment.html`) отправляются через
Cloudflare Worker в Telegram-бота. Бесплатно, без лимитов.

## Архитектура

```
Браузер → form-handler.js → Cloudflare Worker → Telegram Bot API → ваш Telegram
```

## Шаг 1. Создать Telegram-бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Задайте имя и username (должен заканчиваться на `bot`)
4. Получите **токен** вида `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
5. Напишите боту любое сообщение (боты не могут писать первыми)

## Шаг 2. Узнать свой chat_id

1. Откройте в браузере:
   ```
   https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates
   ```
2. Найдите `"chat":{"id":123456789}` — это ваш **chat_id**

Или используйте [@userinfobot](https://t.me/userinfobot) — отправьте ему
любое сообщение, он вернёт ваш chat_id.

## Шаг 3. Зарегистрироваться на Cloudflare

1. Создайте аккаунт на [cloudflare.com](https://cloudflare.com) (бесплатно)
2. Workers & Pages → Create application → Worker

## Шаг 4. Развернуть Worker

### Вариант А — через dashboard (проще)

1. Workers → Create → Create Worker
2. Скопируйте содержимое `worker/src/index.js` в редактор
3. Save and Deploy
4. Запомните URL вида `https://builder-site-form.ваш-subdomain.workers.dev`

### Вариант Б — через wrangler (CLI)

```bash
cd worker
npx wrangler login
npx wrangler deploy
```

## Шаг 5. Задать секреты

### Через dashboard:
Workers → ваш worker → Settings → Variables:
- `BOT_TOKEN` = ваш токен от BotFather
- `CHAT_ID` = ваш chat_id

### Через wrangler:
```bash
npx wrangler secret put BOT_TOKEN
npx wrangler secret put CHAT_ID
```

## Шаг 6. Подключить Worker к сайту

Замените `WORKER_URL_PLACEHOLDER` на URL вашего Worker в двух местах:

1. **`js/form-handler.js`** — строка `var WORKER_URL = "WORKER_URL_PLACEHOLDER";`
2. **`contact.html`** — `data-form-endpoint="WORKER_URL_PLACEHOLDER"`
3. **`appointment.html`** — `data-form-endpoint="WORKER_URL_PLACEHOLDER"`

Можно задать URL либо в `form-handler.js` (глобально), либо в атрибуте
`data-form-endpoint` на каждой форме (приоритет). Достаточно одного места.

## Шаг 7. Проверить

1. Запустите локальный сервер: `python3 -m http.server 8000`
2. Откройте `http://localhost:8000/contact.html`
3. Заполните форму, отправьте
4. Уведомление должно прийти в Telegram

## Что приходит в Telegram

```
🔔 Новая заявка (Contact Form)

Имя: Иван Иванов
Email: ivan@example.com
Тема: Консультация по проекту
Сообщение: Хочу построить дом

Отправлено: 01.10.2026, 15:30:00
```

## Безопасность

- **BOT_TOKEN и CHAT_ID** хранятся как секреты Cloudflare — не видны в браузере
- **Honeypot** — скрытое поле `website`, боты его заполняют и отклоняются
- **Валидация** — минимальная длина имени, проверка email
- **CORS** — worker принимает запросы с любого домена (можно ограничить)
