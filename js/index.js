(function () {
    async function loadFeaturedProjects() {
        const gallery = document.getElementById("featuredProjects");
        if (!gallery) return;

        try {
            const data = await fetchJSON("/data/featured.json");
            gallery.innerHTML = data.featured.map((project) => `
                <article class="game-gallery-item">
                    <div class="game-thumbnail">
                        ${previewImg(project.img, "", 'class="img" style="object-fit:cover"')}
                    </div>
                    <h3 class="game-name">${project.name}</h3>
                    <p class="featured-desc">${project.desc}</p>
                    <div class="game-links">${renderLinkIcons(project.links)}</div>
                </article>
            `).join("");
        } catch (error) {
            console.error("Error loading featured projects:", error);
        }
    }

    async function loadLatestNews() {
        const newsContainer = document.querySelector(".home-news-container");
        if (!newsContainer) return;

        try {
            const [data] = await Promise.all([fetchJSON("/data/news.json"), imageSizesReady]);
            const latestGroup = data.news && data.news[0];
            if (!latestGroup || !latestGroup.posts || !latestGroup.posts.length) return;
            newsContainer.appendChild(renderNewsGroup(latestGroup, latestGroup.posts.slice(0, 1)));
        } catch (error) {
            console.error("Error loading latest news:", error);
        }
    }

    function updateAge() {
        const el = document.getElementById("age");
        const birthdate = el && el.dataset.birthdate;
        if (!birthdate) return;

        const born = new Date(birthdate + "T00:00:00");
        if (Number.isNaN(born.getTime())) return;

        const now = new Date();
        let age = now.getFullYear() - born.getFullYear();
        const hadBirthday = now.getMonth() > born.getMonth() ||
            (now.getMonth() === born.getMonth() && now.getDate() >= born.getDate());
        if (!hadBirthday) age--;
        el.textContent = age;
    }

    loadFeaturedProjects();
    loadLatestNews();
    updateAge();
})();
