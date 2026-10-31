/*
 * Wallpapers page, built from data/wallpapers.json:
 *   sections[] -> { title, rows[] }
 *   rows[]     -> { items[], compact? }   (compact = narrower items, used for album covers)
 *   items[]    -> { name, img, alt?: { label, img } }   (alt = an extra download, e.g. "Old")
 */
(function () {
    const container = document.getElementById("wallpapers");
    if (!container) return;

    const fileName = (path) => path.split("/").pop();

    function renderItem(item) {
        const extra = item.alt
            ? ` <a class="wallpaper-alt" href="/${item.alt.img}" download="${fileName(item.alt.img)}">(${item.alt.label})</a>`
            : "";
        return `
            <figure class="wallpaper-item">
                <a href="/${item.img}" download="${fileName(item.img)}" aria-label="Download ${item.name}">
                    ${previewImg(item.img, item.name)}
                </a>
                <figcaption>${item.name}${extra}</figcaption>
            </figure>`;
    }

    Promise.all([fetchJSON("/data/wallpapers.json"), imageSizesReady])
        .then(([data]) => {
            container.innerHTML = data.sections.map((section) => `
                <h2 class="hr-container"><span>• ${section.title} •</span></h2>
                ${section.rows.map((row) => `
                    <div class="wallpaper-gallery${row.compact ? " compact" : ""}">
                        ${row.items.map(renderItem).join("")}
                    </div>`).join("")}
            `).join("");
        })
        .catch((error) => {
            console.error("Error loading wallpapers:", error);
            container.textContent = "Couldn't load the wallpapers right now. Please try again later.";
        });
})();
