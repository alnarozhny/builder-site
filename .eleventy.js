module.exports = function (eleventyConfig) {
    // Dev-сервер: слушать на всех интерфейсах (нужно для Docker)
    eleventyConfig.setServerOptions({ host: "0.0.0.0", port: 8080 });

    // Копируем статические ассеты как есть (без обработки)
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("img");
    eleventyConfig.addPassthroughCopy("lib");
    eleventyConfig.addPassthroughCopy("js");
    eleventyConfig.addPassthroughCopy("favicon.ico");
    eleventyConfig.addPassthroughCopy("robots.txt");
    eleventyConfig.addPassthroughCopy("sitemap.xml");

    // Фильтр: строит абсолютный URL для canonical/OG
    // Использование: {{ page.url | pageUrl }}
    eleventyConfig.addFilter("pageUrl", function (url) {
        const base = this.ctx.site.base_url;
        // Eleventy отдаёт URL вида "/index.html" или "/about.html"
        // Для главной делаем base_url + "/" вместо base_url + "/index.html"
        if (url === "/index.html" || url === "/") {
            return base + "/";
        }
        return base + url;
    });

    // Фильтр: абсолютный URL картинки для OG
    // Использование: {{ "img/carousel-1.jpg" | imageUrl }}
    eleventyConfig.addFilter("imageUrl", function (img) {
        return this.ctx.site.base_url + "/" + img;
    });

    return {
        dir: {
            input: ".",
            includes: "_includes",
            data: "_data",
            output: "_site",
        },
        templateFormats: ["njk", "html", "md"],
        htmlTemplateEngine: "njk",
        markdownTemplateEngine: "njk",
    };
};
