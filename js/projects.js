(function () {
    const gallery = document.getElementById("creationsGallery");
    const controls = document.getElementById("categoryControls");
    if (!gallery || !controls) return;

    function renderProject(project) {
        const thumb = project.thumb
            ? previewImg(project.thumb, "", 'class="img"')
            : '<div class="img"></div>';
        const name = project.page
            ? `<a class="card-link" href="${project.page}">${project.name}</a>`
            : project.name;

        return `
            <article class="game-gallery-item${project.page ? " has-page" : ""}" id="${project.id}"
                data-category="${project.category}">
                <div class="game-thumbnail">${thumb}</div>
                <h3 class="game-name">${name}</h3>
                <div class="game-links">${renderLinkIcons(project.links)}</div>
            </article>`;
    }

    function filter(cat) {
        const button = controls.querySelector(`.category-btn[data-cat="${cat}"]`) ||
            controls.querySelector('.category-btn[data-cat="all"]');
        cat = button.dataset.cat;

        controls.querySelectorAll(".category-btn").forEach((b) => {
            const active = b === button;
            b.classList.toggle("active", active);
            b.setAttribute("aria-pressed", String(active));
        });

        gallery.querySelectorAll(".game-gallery-item").forEach((item) => {
            const cats = item.dataset.category.split(",").map((s) => s.trim());
            item.hidden = !(cat === "all" || cats.includes(cat));
        });
    }

    controls.addEventListener("click", (e) => {
        const btn = e.target.closest(".category-btn");
        if (!btn) return;
        const cat = btn.dataset.cat;
        filter(cat);
        history.replaceState(null, "", cat === "all" ? location.pathname : `#${cat}`);
    });

    fetchJSON("/data/projects.json")
        .then((data) => {
            gallery.innerHTML = data.projects.map(renderProject).join("");
            filter(location.hash.slice(1) || "all");
        })
        .catch((error) => {
            console.error("Error loading projects:", error);
            gallery.textContent = "Couldn't load the projects right now. Please try again later.";
        });
})();
