const express = require("express");
const axios = require("axios");
const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

const validCategories = ["business", "economic", "finances", "politics"];

app.get("/:count/news/for/:category", async (req, res) => {
    const { count, category } = req.params;

    if (!validCategories.includes(category)) {
        return res.status(400).send("Неверная категория.");
    }

    if (isNaN(count) || count <= 0) {
        return res.status(400).send("Количество новостей должно быть положительным числом.");
    }

    try {
        const rssUrl = `https://www.vedomosti.ru/rss/rubric/${category}`;
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

        const response = await axios.get(apiUrl);
        const newsItems = response.data.items.slice(0, count);

        res.render("news", {
            count,
            categoryName: category,
            newsItems
        });
    } catch (error) {
        console.error("Ошибка при получении новостей:", error);
        res.status(500).send("Ошибка при получении новостей.");
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
