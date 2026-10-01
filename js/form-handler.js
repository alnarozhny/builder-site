/**
 * form-handler.js — отправка форм на Cloudflare Worker → Telegram
 *
 * Форма помечается атрибутом data-form-endpoint="WORKER_URL".
 * Скрипт собирает данные, отправляет JSON и показывает статус.
 *
 * Honeypot: скрытое поле name="website" — если бот его заполнит,
 * worker молча отклонит заявку.
 */
(function () {
    "use strict";

    // Замени на URL своего Cloudflare Worker после деплоя
    // Например: https://builder-site-form.ваш-subdomain.workers.dev
    var WORKER_URL = "WORKER_URL_PLACEHOLDER";

    function showMessage(form, text, ok) {
        // Ищем или создаём блок для сообщения
        var box = form.querySelector(".form-status");
        if (!box) {
            box = document.createElement("div");
            box.className = "form-status";
            box.style.cssText =
                "padding:12px;margin-top:12px;border-radius:8px;font-size:15px;";
            form.appendChild(box);
        }
        box.style.background = ok ? "#d4edda" : "#f8d7da";
        box.style.color = ok ? "#155724" : "#721c24";
        box.textContent = text;
    }

    function setLoading(button, loading) {
        if (!button) return;
        if (loading) {
            button.dataset.originalText = button.textContent;
            button.disabled = true;
            button.textContent = "Отправка...";
        } else {
            button.disabled = false;
            if (button.dataset.originalText) {
                button.textContent = button.dataset.originalText;
            }
        }
    }

    function collectData(form) {
        var data = {};
        var fields = form.querySelectorAll("input, textarea, select");
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (!field.name) continue;
            data[field.name] = field.value;
        }
        // Тип формы для заголовка сообщения в Telegram
        data._form_type = form.dataset.formType || "заявка";
        return data;
    }

    function handleSubmit(form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var button = form.querySelector('button[type="submit"]');
            var data = collectData(form);

            setLoading(button, true);

            fetch(WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
                .then(function (res) {
                    return res.json().then(function (body) {
                        return { ok: res.ok, body: body };
                    });
                })
                .then(function (result) {
                    if (result.ok && result.body.ok) {
                        showMessage(
                            form,
                            "Спасибо! Заявка отправлена. Мы свяжемся с вами в ближайшее время.",
                            true
                        );
                        form.reset();
                    } else {
                        showMessage(
                            form,
                            "Ошибка: " + (result.body.error || "попробуйте позже"),
                            false
                        );
                    }
                })
                .catch(function () {
                    showMessage(
                        form,
                        "Не удалось отправить. Проверьте интернет и попробуйте снова.",
                        false
                    );
                })
                .finally(function () {
                    setLoading(button, false);
                });
        });
    }

    function init() {
        var forms = document.querySelectorAll("form[data-form-endpoint]");
        for (var i = 0; i < forms.length; i++) {
            // Если у формы задан свой URL — используем его, иначе общий
            var url = forms[i].getAttribute("data-form-endpoint");
            if (url && url !== "WORKER_URL_PLACEHOLDER") {
                WORKER_URL = url;
            }
            handleSubmit(forms[i]);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
