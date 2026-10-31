(async function () {
    const newsContainer = document.querySelector(".news-container");
    if (!newsContainer) return;

    try {
        const [data] = await Promise.all([fetchJSON("/data/news.json"), imageSizesReady]);
        data.news.forEach((group) => newsContainer.appendChild(renderNewsGroup(group)));
    } catch (error) {
        console.error("Error loading news data:", error);
        newsContainer.textContent = "Couldn't load the news right now. Please try again later.";
    }
})();
