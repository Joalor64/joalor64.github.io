const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/socials", label: "Socials" },
    { href: "/projects", label: "Projects" },
    { href: "/fun", label: "Fun Stuff" },
    { href: "/gallery", label: "Gallery" },
    { href: "/wallpapers", label: "Wallpapers" },
    { href: "/radio", label: "Radio Chat" },
    { href: "/news", label: "News" }
];

const ICONS = {
    bars: '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" fill="currentColor"><rect x="3" y="5" width="18" height="2.4" rx="1.2"/><rect x="3" y="10.8" width="18" height="2.4" rx="1.2"/><rect x="3" y="16.6" width="18" height="2.4" rx="1.2"/></svg>',
    caretUp: '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" fill="currentColor"><path d="M12 7l7 9H5z"/></svg>',
    home: '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" fill="currentColor"><path d="M12 3l9 8h-2.5v9h-5v-6h-3v6h-5v-9H3z"/></svg>',
    chevronLeft: '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    chevronRight: '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    zoom: '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M10.5 7.5v6M7.5 10.5h6"/></svg>'
};

function storageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
}

function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { }
}

function currentSection() {
    const first = location.pathname.replace(/\.html$/, "").split("/").filter(Boolean)[0] || "";
    return first === "index" ? "" : first;
}

function siteUrl(path) {
    return /^(https?:)?\/\//.test(path) ? path : "/" + path.replace(/^\.?\//, "");
}

function createNav() {
    const container = document.getElementById("topnav-container");
    if (!container) return;

    const section = currentSection();
    const linksHtml = NAV_LINKS.map(({ href, label }) => {
        const isActive = href.slice(1) === section;
        return `<a href="${href}"${isActive ? ' class="active" aria-current="page"' : ""}>${label}</a>`;
    }).join("");

    container.innerHTML = `
        <nav class="topnav" aria-label="Main">
            <div class="txt">Joalor64's Website</div>
            <div class="topnav-middle">
                <div class="nav-links">${linksHtml}</div>
                <div class="topnav-right">
                    <button type="button" class="navLinesBurger" aria-label="Menu" aria-expanded="false"
                        aria-controls="mobile-nav">${ICONS.bars}</button>
                    <button type="button" id="toggle-text" class="theme-toggle"></button>
                </div>
                <div class="mobile-nav" id="mobile-nav">${linksHtml}</div>
            </div>
        </nav>`;

    updateThemeButton();
    container.querySelector("#toggle-text").addEventListener("click", toggleTheme);

    const burger = container.querySelector(".navLinesBurger");
    const mobileNav = container.querySelector(".mobile-nav");
    const setOpen = (open) => {
        mobileNav.classList.toggle("open", open);
        burger.setAttribute("aria-expanded", String(open));
    };
    burger.addEventListener("click", () => setOpen(!mobileNav.classList.contains("open")));
    mobileNav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
}

function isLightMode() {
    return document.documentElement.classList.contains("lightmode");
}

function toggleTheme() {
    const light = !isLightMode();
    document.documentElement.classList.toggle("lightmode", light);
    storageSet("lightmode", light ? "enabled" : "disabled");
    updateThemeButton();
}

function updateThemeButton() {
    const button = document.getElementById("toggle-text");
    if (!button) return;
    const light = isLightMode();
    button.textContent = light ? "🌙" : "☀️";
    button.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
}

async function loadBanner() {
    try {
        const response = await fetch("/data/banner.json");
        const banner = await response.json();
        if (banner.enabled) createAnnouncementBanner(banner.text, banner.className);
    } catch (e) {
    }
}

function createAnnouncementBanner(text, className = "") {
    if (!text) return;
    const banner = document.createElement("div");
    banner.className = "announcement-banner";
    if (className && className.trim()) banner.classList.add(className.trim());
    banner.innerHTML = text;

    const navContainer = document.getElementById("topnav-container");
    if (navContainer) navContainer.after(banner);
    else document.body.prepend(banner);
}

function createFooterAndProgress() {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;

    document.body.insertAdjacentHTML("beforeend", `
        <footer>
            <br>
            <p id="copyright">
                © 2021-${new Date().getFullYear()} Joalor64, All rights reserved.<br>
                Since March 21, 2021
            </p>
        </footer>
        <button type="button" class="progress-circle-wrapper" id="progressCircle" aria-label="Back to top">
            <span class="progress-circle">
                <svg width="40" height="40" aria-hidden="true">
                    <circle cx="20" cy="20" r="${radius}" stroke="#1976d2" stroke-width="4" fill="none" opacity="0.15" />
                    <circle id="progressBar" cx="20" cy="20" r="${radius}" stroke="#1976d2" stroke-width="4" fill="none"
                        stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}" />
                </svg>
                <span class="progress-arrow">${ICONS.caretUp}</span>
            </span>
        </button>`);

    const progressCircle = document.getElementById("progressCircle");
    const progressBar = document.getElementById("progressBar");
    let ticking = false;

    function updateProgress() {
        ticking = false;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0;
        progressBar.style.strokeDashoffset = circumference * (1 - progress);
        progressCircle.classList.toggle("visible", progress > 0.01);
    }

    const requestUpdate = () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(updateProgress);
        }
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    progressCircle.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    updateProgress();
}

function renderNewsGroup(group, posts = group.posts || []) {
    const dateGroup = document.createElement("section");
    dateGroup.className = "news-date-group";

    const dateHeader = document.createElement("h2");
    dateHeader.className = "news-date-header";
    dateHeader.textContent = group.date;
    dateGroup.appendChild(dateHeader);

    posts.forEach((post) => {
        const newsPost = document.createElement("article");
        newsPost.className = "news-post";

        if (post.img) {
            const newsImg = document.createElement("div");
            newsImg.className = "news-img";
            const img = document.createElement("img");
            img.src = previewSrc(post.img);
            img.onerror = () => { img.onerror = null; img.src = siteUrl(post.img); };
            img.alt = "";
            img.loading = "lazy";
            const size = imageSize(post.img);
            if (size) {
                img.width = size[0];
                img.height = size[1];
            }
            newsImg.appendChild(img);
            newsPost.appendChild(newsImg);
        }

        const newsContent = document.createElement("div");
        newsContent.className = "news-content";

        const newsTitle = document.createElement("h3");
        newsTitle.className = "news-title";
        newsTitle.textContent = post.title;
        newsContent.appendChild(newsTitle);

        const newsInfo = document.createElement("div");
        newsInfo.className = "news-info";
        newsInfo.innerHTML = post.info;
        newsContent.appendChild(newsInfo);

        if (post.buttons && post.buttons.length) {
            const newsButtons = document.createElement("div");
            newsButtons.className = "news-buttons";
            post.buttons.forEach((button) => {
                const a = document.createElement("a");
                a.href = button.link;
                a.textContent = button.text;
                a.target = "_blank";
                a.rel = "noopener";
                newsButtons.appendChild(a);
            });
            newsContent.appendChild(newsButtons);
        }

        newsPost.appendChild(newsContent);
        dateGroup.appendChild(newsPost);
    });

    return dateGroup;
}

const LINK_LABELS = {
    page: "Project page",
    itch: "itch.io",
    github: "GitHub",
    gamebanana: "GameBanana",
    modio: "mod.io",
    windows: "Download for Windows",
    android: "Download for Android",
    mega: "MEGA",
    website: "Website"
};

function renderLinkIcons(links = {}) {
    return Object.entries(links)
        .filter(([type, url]) => type !== "page" && url)
        .map(([type, url]) => `<a class="link-icon" data-type="${type}" href="${url}" target="_blank" rel="noopener"
            aria-label="${LINK_LABELS[type] || type}" title="${LINK_LABELS[type] || type}"></a>`)
        .join("");
}

const PREVIEW_FOLDERS = ["comics", "wallpapers", "gallery", "thumbnails", "news", "foreverbox/splashes", "foreverbox/albums",
    "foreverbox/icons", "dreambox/splashes", "dreambox/icons"];

function previewSrc(path) {
    const rel = path.replace(/^\.?\//, "").replace(/^img\//, "");
    if (/^(https?:)?\/\//.test(path) || !PREVIEW_FOLDERS.some((folder) => rel.startsWith(folder + "/"))) {
        return siteUrl(path);
    }
    return "/img/previews/" + rel.replace(/\.\w+$/, ".webp");
}

let IMAGE_SIZES = {};
const imageSizesReady = fetchJSON("/img/previews/sizes.json")
    .then((sizes) => { IMAGE_SIZES = sizes; })
    .catch(() => { });

function imageSize(path) {
    return IMAGE_SIZES[path.replace(/^\.?\//, "").replace(/^img\//, "")] || null;
}

function previewImg(path, alt = "", extra = "") {
    const original = siteUrl(path);
    const size = imageSize(path);
    const dims = size ? ` width="${size[0]}" height="${size[1]}"` : "";
    return `<img src="${previewSrc(path)}" alt="${alt}"${dims} loading="lazy" decoding="async" ${extra}
        onerror="this.onerror=null;this.src='${original}'">`;
}

async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    return response.json();
}

createNav();
loadBanner();
createFooterAndProgress();

window.addEventListener("load", () => document.documentElement.classList.remove("preload"));
