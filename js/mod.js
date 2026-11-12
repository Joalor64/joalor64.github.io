(function () {
    const MOD_CONFIG = {
        foreverbox: {
            title: "Foreverbox",
            subtitle: "My cool Incredibox mod that's better to be enjoyed than to be explained.",
            imagePath: "/img/foreverbox/",
            dataPath: "/data/foreverbox/",
            versionNames: ["Battle", "Ascension", "New Era", "Golden Sands", "Quartzland", "Sunlight Shore"],
            availableVersions: ["1", "2", "3", "4", "5"],
            unavailableVersions: ["6"],
            colors: { "1": "#8c14f7", "2": "#00e9ff", "3": "#b6b6d4", "4": "#dcb551", "5": "#00d7ff" },
            banner: { text: "Foreverbox is no longer being worked on. Thanks for playing!", className: "discontinued" }
        },
        dreambox: {
            title: "Dreambox",
            subtitle: "An Incredibox mod featuring random versions made for fun, with cool and unique themes.",
            imagePath: "/img/dreambox/",
            dataPath: "/data/dreambox/",
            versionNames: ["Sprunki", "Soleil", "Eternyx", "???", "???", "???", "???", "???"],
            availableVersions: ["1", "2", "3"],
            unavailableVersions: ["4", "5", "6", "7". "8"],
            colors: { "1": "#04a", "2": "#ff6657", "3": "#6100bb" }
        }
    };

    const SEAL_PATH = "M79.162 75.367q-4.04 0.495 -4.655 4.519 -0.615 4.022 -4.611 3.247t-5.823 2.859q-1.829 3.635 -5.389 1.663 -3.559 -1.972 -6.423 0.92 -2.862 2.893 -5.638-0.084 -2.775-2.977 -6.391-1.109 -3.616 1.866 -5.336-1.822 -1.72-3.689 -5.736-3.031 -4.016 0.657 -4.513-3.381 -0.496-4.04 -4.519-4.655 -4.023-0.616 -3.247-4.611 0.777-3.994 -2.859-5.824 -3.635-1.827 -1.663-5.387 1.973-3.56 -0.92-6.422 -2.893-2.864 0.084-5.639 2.977-2.775 1.11-6.391-1.867 -3.617 1.821 -5.336 3.688 -1.72 3.03 -5.737-0.657 -4.016 3.382 -4.512 4.039 -0.496 4.655 -4.519 0.615-4.023 4.61-3.247 3.995 0.777 5.824-2.859 1.828-3.636 5.388-1.663t6.422-0.919c1.908-1.93 3.788-1.901 5.638 0.083q2.776 2.976 6.392 1.111 3.616-1.867 5.337 1.821 1.72 3.688 5.736 3.03 4.016-0.658 4.512 3.381 0.497 4.039 4.519 4.654t3.247 4.611q-0.776 3.996 2.859 5.824 3.636 1.829 1.663 5.388 -1.972 3.56 0.92 6.423 2.892 2.863 -0.085 5.638c-2.977 2.775 -2.354 3.981 -1.109 6.392q1.866 3.615 -1.823 5.337 -3.688 1.72 -3.03 5.736c0.439 2.679 -0.687 4.181 -3.38 4.513";

    const modId = MOD_CONFIG[new URLSearchParams(location.search).get("mod")]
        ? new URLSearchParams(location.search).get("mod")
        : "foreverbox";
    const config = MOD_CONFIG[modId];

    const el = {
        logo: document.querySelector("h1.logo"),
        subtitle: document.querySelector(".sub-head"),
        headerText: document.querySelector("#header .header-text"),
        headerBack: document.querySelector("#header .header-back"),
        icons: document.getElementById("versionIcons"),
        iconsWrap: document.querySelector(".fvbxVersionsArray"),
        view: document.getElementById("version-view"),
        content: document.getElementById("version-dynamic-content"),
        characters: document.getElementById("characters-grid"),
        charactersHeader: document.getElementById("characters-header")
    };

    const versionCache = {};
    let routeToken = 0;
    let slideshowKeyHandler = null;

    function versionUrl(version) {
        const params = new URLSearchParams({ mod: modId });
        if (version) params.set("v", version);
        return `${location.pathname}?${params}`;
    }

    function currentVersion() {
        return new URLSearchParams(location.search).get("v");
    }

    function navigate(version) {
        history.pushState(null, "", versionUrl(version));
        route();
    }

    function openModal(id) {
        const modal = document.getElementById(id);
        modal.hidden = false;
        const close = modal.querySelector("[data-close]");
        if (close) close.focus();
    }

    function closeModal(modal) {
        if (modal.hidden) return;
        modal.hidden = true;
        if (modal.id === "previewModal") {
            document.getElementById("previewVideoWrap").replaceChildren();
        }
    }

    function openModalIsShowing() {
        return Boolean(document.querySelector(".modal:not([hidden])"));
    }

    document.querySelectorAll(".modal").forEach((modal) => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal || e.target.closest("[data-close]")) closeModal(modal);
        });
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") document.querySelectorAll(".modal").forEach(closeModal);
    });

    function renderIcons() {
        const versions = [...config.availableVersions, ...config.unavailableVersions]
            .sort((a, b) => Number(a) - Number(b));

        el.icons.innerHTML = versions.map((version) => {
            const name = config.versionNames[Number(version) - 1] || `V${version}`;
            const available = config.availableVersions.includes(version);
            const color = available && config.colors[version] ? ` style="color:${config.colors[version]}"` : "";
            const label = `<span class="foreverbox-icon-label"${color}>${name}</span>`;

            if (available) {
                return `
                    <a class="foreverbox-icon-col" href="${versionUrl(version)}" data-version="${version}">
                        <span class="foreverbox-icon" style="background-image:url('${config.imagePath}icons/v${version}.png')"></span>
                        ${label}
                    </a>`;
            }
            return `
                <button type="button" class="foreverbox-icon-col unavailable" data-version="${version}"
                    aria-label="${name} (not available yet)">
                    <span class="foreverbox-icon locked" aria-hidden="true">?</span>
                    ${label}
                </button>`;
        }).join("");
    }

    el.icons.addEventListener("click", (e) => {
        const col = e.target.closest(".foreverbox-icon-col");
        if (!col) return;
        if (col.classList.contains("unavailable")) {
            openModal("blankIconModal");
            return;
        }
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(col.dataset.version);
    });

    el.headerBack.addEventListener("click", (e) => {
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        navigate(null);
    });

    async function loadVersionData(version) {
        if (!versionCache[version]) {
            versionCache[version] = fetchJSON(`${config.dataPath}v${version}.json`).catch((error) => {
                delete versionCache[version];
                throw error;
            });
        }
        return versionCache[version];
    }

    function showPicker() {
        el.view.hidden = true;
        el.iconsWrap.hidden = false;
        el.content.innerHTML = "";
        el.characters.innerHTML = "";
        el.headerText.hidden = false;
        el.headerBack.hidden = true;
        setSlideshowKeys(null);
    }

    async function route() {
        const token = ++routeToken;
        const version = currentVersion();

        if (version && config.unavailableVersions.includes(version)) {
            history.replaceState(null, "", versionUrl(null));
            showPicker();
            openModal("blankIconModal");
            return;
        }

        if (!version || !config.availableVersions.includes(version)) {
            showPicker();
            return;
        }

        el.iconsWrap.hidden = true;
        el.view.hidden = false;
        el.headerText.hidden = true;
        el.headerBack.hidden = false;
        el.headerBack.href = versionUrl(null);
        el.content.innerHTML = '<p class="version-loading">Loading...</p>';
        el.characters.innerHTML = "";

        try {
            const data = await loadVersionData(version);
            if (token !== routeToken) return;
            renderVersion(data);
        } catch (error) {
            console.error(`Failed to load version ${version}:`, error);
            if (token !== routeToken) return;
            el.content.innerHTML = "<p>Couldn't load this version. Please try again later.</p>";
            el.charactersHeader.hidden = true;
        }
    }

    window.addEventListener("popstate", route);

    function seal(fill, text, fontSize, viewBox = "0 0 100 100") {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="${viewBox}" fill="${fill}" aria-hidden="true">
                <path d="${SEAL_PATH}" />
                ${text ? `<text x="50%" y="52%" text-anchor="middle" fill="white" font-size="${fontSize}"
                    font-family="Urbanist" font-weight="bold" dy=".3em">${text}</text>` : ""}
            </svg>`;
    }

    function badges(meta) {
        const list = [];
        if (meta.isNew) {
            list.push(`<div class="version-icon-top-right" title="New">${seal("#00ff00", "NEW", "30px")}</div>`);
        }
        if (meta.isModIo) {
            list.push(`
                <div class="version-icon-top-right" title="Available on mod.io">
                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 100 100" fill="#07c1d8" aria-hidden="true">
                        <path d="${SEAL_PATH}" />
                        <svg width="100" height="100" viewBox="0 0 60 60" fill="#ffffff">
                            <path d="m43.9 30.3c0-.8.1-1.6.4-2.3-1.1.4-2.4.6-3.7.6-1.2 0-2.4-.2-3.5-.5-.1.7-.2 1.4-.2 2.1 0 1.2.1 2.3.4 3.4-3.2.5-6 2-8 4.2-1.2-1.3-2.7-2.3-4.4-3.1-.8 2.5-2.4 4.6-4.4 6.3 2.9.7 5.1 3.3 5.1 6.4 1.4.4 2.9.6 4.4.6 1.1 0 2.1-.1 3.1-.3.1-3.5 3-6.3 6.5-6.3 1.2 0 2.4.3 3.4.9l.4-.4c1.5-1.8 2.8-3.8 3.5-6.1-1.8-1.2-3-3.2-3-5.5z" />
                            <path d="m43.9 18.5c-.3.1-.6.3-.9.4-.7.2-1.4.3-2.1.3-3.6 0-6.6-2.9-6.6-6.6v-.1c-1.4-.3-2.8-.5-4.3-.5-1.1 0-2.1.1-3.1.3-.1 3.5-3 6.3-6.6 6.3-1.2 0-2.4-.3-3.4-.9-1.7 1.8-3.1 4-3.9 6.5 1.8 1.2 3 3.2 3 5.5 0 2.4-1.3 4.5-3.2 5.6.7 2.3 1.9 4.4 3.4 6.2 3-1.6 5.3-4.2 6.5-7.5.5-1.5.8-3 .8-4.7 0-1.1-.1-2.2-.4-3.2 2.9-.6 5.5-2 7.4-4.1 1.8 2 4.3 3.4 7 4h.1c.9.2 1.9.3 2.9.3 2.3 0 4.5-.6 6.4-1.6.1 0 .1-.1.2-.1-.6-2.2-1.7-4.3-3.2-6.1z" />
                        </svg>
                    </svg>
                </div>`);
        }
        if (meta.isApproved) {
            list.push('<div class="version-icon-top-right incredimods" title="Approved by IncrediMods"></div>');
        }
        return list.map((html, i) => i === 0 ? html : html.replace('class="version-icon-top-right',
            `style="right:${10 + i * 50}px" class="version-icon-top-right`)).join("");
    }

    function renderVersion(data) {
        if (!data || !data.versionInfo) {
            el.content.innerHTML = "<p>Version not found.</p>";
            el.charactersHeader.hidden = true;
            return;
        }

        const { meta, visu } = data.versionInfo;
        const splash = `${config.imagePath}splashes/${meta.name.toLowerCase().replace(/ /g, "-")}.jpg`;

        document.title = `Joalor64's Website - ${config.title}: ${meta.name}`;
        el.content.innerHTML = `
            <div class="version-container" style="background-color: ${visu.colCont};">
                ${badges(meta)}
                <div class="version-content">
                    <div class="version-image">${previewImg(splash, meta.name)}</div>
                    <div class="version-info">
                        <div class="version-name-container">
                            <div class="version-icon">${seal(visu.colVerIcon, `V${meta.version}`, "40px", "10 0 100 100")}</div>
                            <h2 class="version-name">${meta.name}</h2>
                        </div>
                        <p class="version-date">Released: ${meta.date}</p>
                        <p class="version-description">${meta.desc}</p>
                        <div class="version-buttons">
                            <button type="button" class="btn download-btn">⤓ Download</button>
                            <button type="button" class="btn preview-btn">► Preview</button>
                        </div>
                    </div>
                </div>
            </div>`;

        setupVersionButtons(meta);

        const hasCharacters = Array.isArray(data.characters) && data.characters.length > 0;
        el.charactersHeader.hidden = !hasCharacters;
        if (hasCharacters) renderCharacters(data.characters);
    }

    function setupVersionButtons(meta) {
        const downloadBtn = el.content.querySelector(".download-btn");
        const previewBtn = el.content.querySelector(".preview-btn");

        downloadBtn.addEventListener("click", () => {
            [
                ["windowsDownload", meta.downloadWin],
                ["androidDownload", meta.downloadAnd],
                ["modIoDownload", meta.downloadModIo]
            ].forEach(([id, url]) => {
                const link = document.getElementById(id);
                link.hidden = !url;
                if (url) {
                    link.href = url;
                    link.target = "_blank";
                    link.rel = "noopener";
                } else {
                    link.removeAttribute("href");
                }
            });
            openModal("downloadModal");
        });

        if (meta.previewID) {
            previewBtn.addEventListener("click", () => {
                const iframe = document.createElement("iframe");
                iframe.id = "previewVideo";
                iframe.title = "Preview video";
                iframe.allow = "autoplay; encrypted-media; fullscreen";
                iframe.allowFullscreen = true;
                iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(meta.previewID)}?autoplay=1`;
                document.getElementById("previewVideoWrap").replaceChildren(iframe);
                openModal("previewModal");
            });
        } else {
            previewBtn.disabled = true;
            previewBtn.title = "No preview available";
        }
    }

    const GENDERS = { M: "Male", F: "Female" };

    function renderCharacters(characters) {
        const charPath = `${config.imagePath}characters/`;

        const slidesHtml = characters.map((char, i) => {
            const looks = Array.isArray(char.imgs) ? char.imgs : [];
            const lookButtons = looks.map((look, idx) => `
                <button type="button" class="appearance-btn${idx === 0 ? " active" : ""}" data-char-index="${i}"
                    data-img-index="${idx}" aria-pressed="${idx === 0}">${look.title || `Look ${idx + 1}`}</button>`).join("");

            return `
                <div class="slide" data-index="${i}" ${i === 0 ? "" : "hidden"} role="group"
                    aria-roledescription="slide" aria-label="${i + 1} of ${characters.length}: ${char.name}">
                    <div class="slide-img">
                        <img src="${charPath}${looks[0] ? looks[0].img : ""}" alt="${char.name}" loading="lazy">
                    </div>
                    <div class="slide-info">
                        <h3 class="character-name">${char.name}</h3>
                        <p class="character-modal-desc">${char.desc || ""}</p>
                        <div class="character-modal-meta">
                            <span><b>Age:</b> ${char.age || "-"}</span> |
                            <span><b>Gender:</b> ${GENDERS[char.gender] || char.gender || "-"}</span>
                        </div>
                        ${looks.length > 1 ? `<div class="appearance-buttons">${lookButtons}</div>` : ""}
                    </div>
                </div>`;
        }).join("");

        el.characters.innerHTML = `
            <div class="character-slideshow" aria-roledescription="carousel" aria-label="Characters">
                <button type="button" class="slide-nav prev" aria-label="Previous character">◀</button>
                <div class="slides-wrapper" aria-live="polite">${slidesHtml}</div>
                <button type="button" class="slide-nav next" aria-label="Next character">▶</button>
            </div>`;

        const slides = el.characters.querySelectorAll(".slide");
        let current = 0;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, i) => { slide.hidden = i !== current; });
        }

        el.characters.querySelector(".slide-nav.prev").addEventListener("click", () => show(current - 1));
        el.characters.querySelector(".slide-nav.next").addEventListener("click", () => show(current + 1));

        el.characters.addEventListener("click", (e) => {
            const btn = e.target.closest(".appearance-btn");
            if (!btn) return;
            const char = characters[Number(btn.dataset.charIndex)];
            const look = char.imgs[Number(btn.dataset.imgIndex)];
            const slide = btn.closest(".slide");
            const img = slide.querySelector(".slide-img img");
            img.src = charPath + look.img;
            img.alt = char.name + (look.title ? ` - ${look.title}` : "");
            slide.querySelectorAll(".appearance-btn").forEach((b) => {
                b.classList.toggle("active", b === btn);
                b.setAttribute("aria-pressed", String(b === btn));
            });
        });

        setSlideshowKeys((e) => {
            if (openModalIsShowing() || e.target.closest("input, select, textarea")) return;
            if (e.key === "ArrowLeft") show(current - 1);
            if (e.key === "ArrowRight") show(current + 1);
        });
    }

    function setSlideshowKeys(handler) {
        if (slideshowKeyHandler) document.removeEventListener("keydown", slideshowKeyHandler);
        slideshowKeyHandler = handler;
        if (handler) document.addEventListener("keydown", handler);
    }

    document.title = `Joalor64's Website - ${config.title}`;
    el.logo.textContent = config.title;
    el.subtitle.textContent = config.subtitle;
    if (config.banner) createAnnouncementBanner(config.banner.text, config.banner.className);
    renderIcons();
    route();
})();
