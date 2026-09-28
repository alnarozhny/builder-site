(function () {
    "use strict";

    // Pages that live under the "Pages" dropdown. When one of these is active,
    // the dropdown toggle itself also gets the active class.
    var SUBPAGES = ["feature", "project", "team", "appointment", "testimonial", "404"];

    function activateNav(container, active) {
        if (!active) return;
        var link = container.querySelector('[data-page="' + active + '"]');
        if (link) link.classList.add("active");
        if (SUBPAGES.indexOf(active) !== -1) {
            var pagesToggle = container.querySelector('[data-page="pages"]');
            if (pagesToggle) pagesToggle.classList.add("active");
        }
    }

    // Scripts inserted via innerHTML do not execute, so rebuild each <script>
    // as a real element. async=false preserves insertion (document) order so
    // jQuery is ready before main.js runs.
    function reexecuteScripts(container) {
        var scripts = Array.prototype.slice.call(container.querySelectorAll("script"));
        scripts.forEach(function (oldScript) {
            var newScript = document.createElement("script");
            for (var i = 0; i < oldScript.attributes.length; i++) {
                var attr = oldScript.attributes[i];
                newScript.setAttribute(attr.name, attr.value);
            }
            newScript.async = false;
            newScript.textContent = oldScript.textContent;
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }

    function loadInclude(el) {
        var url = el.getAttribute("data-include");
        return fetch(url)
            .then(function (res) {
                if (!res.ok) throw new Error(url + " -> " + res.status + " " + res.statusText);
                return res.text();
            })
            .then(function (html) {
                el.innerHTML = html;
                if (el.hasAttribute("data-active")) {
                    activateNav(el, el.getAttribute("data-active"));
                }
                reexecuteScripts(el);
            })
            .catch(function (err) {
                console.error("[includes] " + err.message);
            });
    }

    function init() {
        var placeholders = Array.prototype.slice.call(document.querySelectorAll("[data-include]"));
        // Load sequentially in document order so the scripts partial (last in
        // the document) runs after the header/footer partials are in the DOM.
        var chain = Promise.resolve();
        placeholders.forEach(function (el) {
            chain = chain.then(function () { return loadInclude(el); });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
