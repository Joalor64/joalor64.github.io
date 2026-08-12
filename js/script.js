const isLocal =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname === "::1" ||
    location.hostname.startsWith("192.168.") ||
    location.hostname.startsWith("10.") ||
    location.hostname.startsWith("172.");

const body = document.body || document.documentElement;

document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('lightmode') === 'enabled') {
        body.classList.add('lightmode');
    }

    createNav();
    loadBanner();
    createFooterAndProgress();
    initFooterAndProgress();
    fixInternalLinks();
});

function fixInternalLinks() {
    const pages = ['gallery', 'socials', 'wallpapers', 'projects', 'news', 'fun'];

    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');

        if (!href ||
            href.startsWith('http') ||
            href.startsWith('https') ||
            href.startsWith('#') ||
            href.startsWith('mailto:') ||
            href.startsWith('javascript:') ||
            href.endsWith('.html') ||
            href.endsWith('/')) {
            return;
        }

        for (const page of pages) {
            if (href === page || href.startsWith(page + '/') || href.startsWith(page + '?')) {
                if (isLocal) {
                    if (href === page) {
                        link.href = page + '.html';
                    } else if (href.startsWith(page + '/')) {
                        const rest = href.substring(page.length + 1);
                        if (!rest.includes('.')) {
                            link.href = page + '/' + rest + '.html';
                        }
                    } else if (href.startsWith(page + '?')) {
                        link.href = page + '.html' + href.substring(page.length);
                    }
                }
                break;
            }
        }
    });
}

function pageUrl(page) {
    return isLocal ? `${page}.html` : page;
}

function getModPageUrl(mod, version) {
    const base = isLocal ? 'mod.html' : 'projects/mod';
    const params = new URLSearchParams();
    if (mod) params.set('mod', mod);
    if (version) params.set('v', version);
    const query = params.toString();
    return query ? `${base}?${query}` : base;
}

function getBasePath() {
    return isLocal ? '' : '../';
}

async function createNav() {
    const container = document.getElementById("topnav-container");
    if (!container) return;

    const response = await fetch("/navbar/navbar.html");
    const html = await response.text();
    container.innerHTML = html;

    container.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('https') ||
            href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) {
            return;
        }

        if (href.startsWith('/')) {
            if (isLocal) {
                if (href === '/') {
                    link.href = '/index.html';
                } else {
                    const page = href.substring(1);
                    if (page && !page.includes('.')) {
                        link.href = '/' + page + '.html';
                    }
                }
            }
        }
    });

    toggleTextChange();

    const pathname = window.location.pathname;
    const pathParts = pathname.split("/").filter(p => p);
    const suffix = isLocal ? ".html" : "";
    let currentPage = pathParts[0] || "index";

    if (pathParts.length > 1) {
        const directory = pathParts[pathParts.length - 2];
        const directoryMap = {
            "fun": "fun" + suffix,
            "projects": "projects" + suffix
        };
        if (directoryMap[directory]) {
            currentPage = directoryMap[directory];
        }
    }

    const links = container.querySelectorAll(".topnav a[href]");
    links.forEach(link => {
        let href = link.getAttribute("href");
        if (!href) return;

        let linkPage = href
            .replace("../", "")
            .replace(/^\/+/, "")
            .replace(/\.html$/, "");

        if (linkPage === "") linkPage = "index";

        if (linkPage === currentPage.replace(".html", "")) {
            link.classList.add("active");
            link.removeAttribute("href");
        }
    });

    const burger = container.querySelector(".navLinesBurger");
    const mobileNav = container.querySelector(".mobile-nav");
    if (burger && mobileNav) {
        burger.addEventListener("click", () => {
            mobileNav.classList.toggle("open");
        });
        mobileNav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                mobileNav.classList.remove("open");
            });
        });
    }

    container.querySelectorAll(".dropbtn").forEach(btn => {
        btn.addEventListener("click", () => {
            const dropdown = btn.parentElement;
            dropdown.classList.toggle("active");
            container.querySelectorAll(".dropdown").forEach(other => {
                if (other !== dropdown) other.classList.remove("active");
            });
        });
    });
}

async function loadBanner() {
    try {
        const response = await fetch("/data/banner.json");
        const banner = await response.json();
        if (banner.enabled) {
            createAnnouncementBanner(banner.text, banner.className);
        }
    } catch (e) {
    }
}

function createAnnouncementBanner(text, className = "") {
    if (!text) return;
    const banner = document.createElement('div');
    banner.className = 'announcement-banner';
    if (className && className.trim() !== "") {
        banner.classList.add(className);
    }
    banner.innerHTML = text;

    const navContainer = document.getElementById('topnav-container');
    if (navContainer && navContainer.parentNode) {
        navContainer.parentNode.insertBefore(banner, navContainer.nextSibling);
    } else {
        document.body.insertBefore(banner, document.body.firstChild);
    }
}

function toggleTheme() {
    if (body.classList.contains('lightmode')) {
        body.classList.remove('lightmode');
        localStorage.setItem('lightmode', 'disabled');
    } else {
        body.classList.add('lightmode');
        localStorage.setItem('lightmode', 'enabled');
    }
    toggleTextChange();
}

function toggleTextChange() {
    const toggleText = document.getElementById("toggle-text");
    if (!toggleText) return;
    toggleText.innerText = localStorage.getItem('lightmode') === 'enabled' ? "🌙" : "☀️";
}

function createFooterAndProgress() {
    const footerHTML = `
        <footer>
            <br>
            <p id="copyright">
                © 2021-<span id="currentYear"></span> Joalor64, All rights reserved.<br>
                Since March 21, 2021
            </p>
        </footer>
        <div class="progress-circle-wrapper" id="progressCircle">
            <div class="progress-circle">
                <svg width="40" height="40">
                    <circle cx="20" cy="20" r="18" stroke="#1976d2" stroke-width="4" fill="none" opacity="0.15" />
                    <circle id="progressBar" cx="20" cy="20" r="18" stroke="#1976d2" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="113.097" stroke-dashoffset="113.097" />
                </svg>
                <span class="progress-arrow"><i class="fa fa-caret-up"></i></span>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", footerHTML);
}

function initFooterAndProgress() {
    const progressCircle = document.getElementById('progressCircle');
    const progressBar = document.getElementById('progressBar');
    const yearSpan = document.getElementById('currentYear');
    const circumference = 2 * Math.PI * 18;

    function updateProgress() {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;
        progressBar.style.strokeDashoffset = circumference * (1 - progress);
        progressCircle.classList.toggle('visible', progress > 0.01);
    }

    window.addEventListener('scroll', updateProgress);
    window.addEventListener('resize', updateProgress);
    progressCircle.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    yearSpan.textContent = new Date().getFullYear();
    updateProgress();
}

const css = document.createElement('style');
css.innerHTML = `* { transition: none !important; }`;
document.head.appendChild(css);
window.addEventListener('load', () => {
    document.head.removeChild(css);
});