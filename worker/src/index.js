/**
 * Cloudflare Worker — приём форм и отправка в Telegram
 *
 * Переменные окружения (настраиваются через Cloudflare dashboard или wrangler):
 *   BOT_TOKEN  — токен бота от @BotFather
 *   CHAT_ID    — ваш chat_id (число, например 123456789)
 *
 * Развернуть:
 *   cd worker
 *   npx wrangler deploy
 *
 * Или через dashboard: https://dash.cloudflare.com → Workers → Create
 */

// CORS-заголовки — сайт лежит на github.io, worker на workers.dev
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
};

// Простая защита от спама: минимальная длина и проверка honeypot
function validate(data) {
    if (!data || typeof data !== "object") return "Нет данных";
    // Honeypot-поле: если заполнено — это бот
    if (data.website) return "spam";
    // Минимальная проверка
    if (!data.name || data.name.trim().length < 2) return "Имя слишком короткое";
    if (!data.email || !data.email.includes("@")) return "Некорректный email";
    return null;
}

// Форматирование сообщения для Telegram (HTML)
function formatMessage(data, formType) {
    const escapeHtml = (s) =>
        String(s || "").replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");

    const lines = [
        `<b>🔔 Новая заявка (${escapeHtml(formType)})</b>`,
        "",
        `<b>Имя:</b> ${escapeHtml(data.name)}`,
        `<b>Email:</b> ${escapeHtml(data.email)}`,
    ];

    if (data.phone) lines.push(`<b>Телефон:</b> ${escapeHtml(data.phone)}`);
    if (data.service) lines.push(`<b>Услуга:</b> ${escapeHtml(data.service)}`);
    if (data.date) lines.push(`<b>Дата:</b> ${escapeHtml(data.date)}`);
    if (data.time) lines.push(`<b>Время:</b> ${escapeHtml(data.time)}`);
    if (data.subject) lines.push(`<b>Тема:</b> ${escapeHtml(data.subject)}`);
    if (data.message) lines.push(`<b>Сообщение:</b>\n${escapeHtml(data.message)}`);

    lines.push("", `<i>Отправлено: ${new Date().toLocaleString("ru-RU")}</i>`);

    return lines.join("\n");
}

async function sendTelegram(env, text) {
    const url = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: env.CHAT_ID,
            text: text,
            parse_mode: "HTML",
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Telegram API ${res.status}: ${body}`);
    }

    return res.json();
}

export default {
    async fetch(request, env) {
        // Preflight CORS
        if (request.method === "OPTIONS") {
            return new Response(null, { headers: CORS_HEADERS });
        }

        if (request.method !== "POST") {
            return new Response(
                JSON.stringify({ ok: false, error: "Только POST" }),
                { status: 405, headers: CORS_HEADERS }
            );
        }

        try {
            const data = await request.json();

            // Откуда форма (для заголовка сообщения)
            const formType = data._form_type || "форма";

            // Honeypot-поле _website не должно быть заполнено человеком
            const err = validate(data);
            if (err === "spam") {
                // Бот — отвечаем как будто успех, молча игнорируем
                return new Response(
                    JSON.stringify({ ok: true }),
                    { status: 200, headers: CORS_HEADERS }
                );
            }
            if (err) {
                return new Response(
                    JSON.stringify({ ok: false, error: err }),
                    { status: 400, headers: CORS_HEADERS }
                );
            }

            const text = formatMessage(data, formType);
            await sendTelegram(env, text);

            return new Response(
                JSON.stringify({ ok: true }),
                { status: 200, headers: CORS_HEADERS }
            );
        } catch (e) {
            return new Response(
                JSON.stringify({ ok: false, error: e.message }),
                { status: 500, headers: CORS_HEADERS }
            );
        }
    },
};
