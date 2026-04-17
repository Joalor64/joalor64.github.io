
const allowedHosts = ["10.5.0.2", "192.168.43.160", "127.0.0.1", "localhost"];

if (!allowedHosts.includes(location.hostname)) {
    const extRemover = document.createElement("script");
    extRemover.src = "../js/urlExtRemover.js";
    document.head.appendChild(extRemover);
}

const body = document.body;

document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('lightmode') === 'enabled') {
        body.classList.add('lightmode');
    }

    createNav();
    createAnnouncementBanner();
    createFooterAndProgress();
    toggleTextChange();
    initFooterAndProgress();
});

function createAnnouncementBanner() {
    const announcementText = "NOTICE: The website is undergoing some changes! <u>Report issues on <a href='https://github.com/Joalor64/joalor64.github.io/issues' target='_blank'>GitHub</a>.</u>";
    if (!announcementText) return;

    const banner = document.createElement('div');
    banner.className = 'announcement-banner';
    banner.innerHTML = announcementText;

    const navContainer = document.getElementById('topnav-container');
    if (navContainer && navContainer.parentNode) {
        navContainer.parentNode.insertBefore(banner, navContainer.nextSibling);
    } else {
        document.body.insertBefore(banner, document.body.firstChild);
    }
}

function createNav() {
    const navHTML = `
    <div class="topnav">
	    <div class="topnav-middle">
	        <div class="nav-links">
                <a href="../">Home</a>
                <a href="../socials">Socials</a>
                <a href="../projects">Projects</a>
                <a href="../fun">Fun Stuff</a>
                <a href="../gallery">Gallery</a>
                <a href="../wallpapers">Wallpapers</a>
                <a href="../radio">Radio Chat</a>
                <a href="../news">News</a>
	        </div>

            <div class="topnav-right">
			    <div class="navLinesBurger">
			        <i class="fa fa-bars"></i>
			    </div>
            <a id="toggle-text" onclick="toggleTheme()">☀️</a>
        </div>
	
	    <div class="mobile-nav">
            <a href="../">Home</a>
            <a href="../socials">Socials</a>
            <a href="../projects">Projects</a>
            <a href="../fun">Fun Stuff</a>
            <a href="../gallery">Gallery</a>
            <a href="../wallpapers">Wallpapers</a>
            <a href="../radio">Radio Chat</a>
            <a href="../news">News</a>
	    </div>
    </div>
    `;

    const container = document.getElementById("topnav-container");
    if (!container) return;

    container.innerHTML = navHTML;

    const pathname = window.location.pathname;
    const pathParts = pathname.split("/").filter(p => p);
    let currentPage = pathParts[pathParts.length - 1] || "index.html";

    if (pathParts.length > 1) {
        let suffix = allowedHosts.includes(location.hostname) ? ".html" : "";
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
        let linkPage = link.getAttribute("href").replace("../", "");
        if (!linkPage || linkPage === "") {
            linkPage = "index.html";
        }
        if (linkPage === currentPage) {
            link.classList.add("active");
            link.removeAttribute("href");
        }
    });

    const burger = container.querySelector(".navLinesBurger");
    const mobileNav = container.querySelector(".mobile-nav");

    burger.addEventListener("click", () => {
        mobileNav.classList.toggle("open");
    });

    mobileNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            mobileNav.classList.remove("open");
        });
    });

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
    document.getElementById("toggle-text").innerText = (localStorage.getItem('lightmode') === 'enabled') ? "🌙" : "☀️";
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
                    <circle cx="20" cy="20" r="18"
                        stroke="#1976d2"
                        stroke-width="4"
                        fill="none"
                        opacity="0.15" />
                    <circle id="progressBar"
                        cx="20" cy="20"
                        r="18"
                        stroke="#1976d2"
                        stroke-width="4"
                        fill="none"
                        stroke-linecap="round"
                        stroke-dasharray="113.097"
                        stroke-dashoffset="113.097" />
                </svg>
                <span class="progress-arrow">
                    <i class="fa fa-caret-up"></i>
                </span>
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

        if (progress > 0.01) {
            progressCircle.classList.add('visible');
        } else {
            progressCircle.classList.remove('visible');
        }
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
css.innerHTML = `
  * {
    transition: none !important;
  }
`;
document.head.appendChild(css);

window.addEventListener('load', () => {
    document.head.removeChild(css);
});