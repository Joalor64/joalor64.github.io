const MOD_CONFIG = {
    foreverbox: {
        title: "Foreverbox",
        subtitle: "My cool Incredibox mod that's better to be enjoyed than to be explained.",
        iconPath: "../img/foreverbox/icons/",
        imagePath: "../img/foreverbox/",
        dataPath: "../data/foreverbox/",
        versionNames: ["Battle", "Ascension", "New Era", "Golden Sands", "Quartzland", "Sunlight Shore"],
        availableVersions: ["1", "2", "3", "4", "5"],
        unavailableVersions: ["6"],
        colors: {
            "1": "#8c14f7",
            "2": "#00e9ff",
            "3": "#b6b6d4",
            "4": "#dcb551",
            "5": "#00d7ff",
            "6": "#000"
        },
        showAllVersions: true
    },
    dreambox: {
        title: "Dreambox",
        subtitle: "An Incredibox mod featuring random versions made for fun, with cool and unique themes.",
        imagePath: "../img/dreambox/",
        iconPath: "../img/dreambox/icons/",
        dataPath: "../data/dreambox/",
        versionNames: ["Sprunki", "Soleil", "Eternyx", "???", "???", "???"],
        availableVersions: ["1", "2", "3"],
        unavailableVersions: ["4", "5", "6"],
        colors: {
            "1": "#04a",
            "2": "#ff6657",
            "3": "#6100bb",
            "4": "#000",
            "5": "#000",
            "6": "#000"
        },
        showAllVersions: true
    }
};

function getCurrentMod() {
    return new URLSearchParams(window.location.search).get('mod') || 'foreverbox';
}

function getVersionParam() {
    return new URLSearchParams(window.location.search).get('v') || null;
}

function getModConfig() {
    const mod = getCurrentMod();
    return MOD_CONFIG[mod] || MOD_CONFIG.foreverbox;
}

function updatePageHeader() {
    const config = getModConfig();
    document.title = `Joalor64's Website - ${config.title}`;
    document.querySelector('h1.logo').textContent = config.title;
    document.querySelector('h2.sub-head').textContent = config.subtitle;
}

document.addEventListener("DOMContentLoaded", () => {
    updatePageHeader();
    initModPage();
});

async function initModPage() {
    const config = getModConfig();
    const mod = getCurrentMod();
    const v = getVersionParam();

    if (config.title === "Foreverbox") {
        createAnnouncementBanner("Foreverbox is no longer being worked on. Thanks for playing!", "discontinued");
    }

    await loadModIcons(config);

    if (v && config.availableVersions.includes(v)) {
        const data = await loadVersionData(mod, v);
        if (data) renderVersion(data, config);
    }

    handleRoute();
}

async function loadModIcons(config) {
    const iconCols = document.querySelectorAll('.foreverbox-icon-col');
    const { iconPath, availableVersions, unavailableVersions = [], versionNames, colors } = config;

    iconCols.forEach((col, index) => {
        const version = String(index + 1);
        const isVersionExists = availableVersions.includes(version) || unavailableVersions.includes(version);

        if (!isVersionExists) {
            col.style.display = 'none';
            return;
        }

        const icon = col.querySelector('.foreverbox-icon');
        const label = col.querySelector('.foreverbox-icon-label');

        if (icon) {
            icon.style.backgroundImage = `url(${iconPath}v${version}.png)`;
            if (unavailableVersions.includes(version)) {
                icon.style.filter = 'grayscale(0.5)';
            }
            icon.style.cursor = 'pointer';
        }

        if (label && versionNames[index]) {
            label.textContent = versionNames[index];
            if (colors[version]) label.style.color = colors[version];
        }

        col.style.display = '';
        col.dataset.icon = version;
        col.dataset.available = !unavailableVersions.includes(version);
    });
}

async function loadVersionData(mod, version) {
    const config = getModConfig();
    try {
        const response = await fetch(`${config.dataPath}v${version}.json`);
        if (!response.ok) throw new Error('Version data not found');
        return await response.json();
    } catch (error) {
        console.error(`Failed to load version ${version}:`, error);
        return null;
    }
}

function handleRoute() {
    const mod = getCurrentMod();
    const v = getVersionParam();
    const config = getModConfig();

    const isAvailable = v && config.availableVersions.includes(v);
    const isUnavailable = v && config.unavailableVersions?.includes(v);

    const hideContent = () => {
        document.getElementById('version-dynamic-content').style.display = 'none';
        document.getElementById('characters-header').style.display = 'none';
        document.getElementById('characters-grid').style.display = 'none';
        document.querySelectorAll('.foreverbox-icons-row').forEach(row => row.style.display = '');
    };

    const showContent = () => {
        document.querySelectorAll('.foreverbox-icons-row').forEach(row => row.style.display = 'none');
        document.getElementById('version-dynamic-content').style.display = '';
        document.getElementById('characters-header').style.display = '';
        document.getElementById('characters-grid').style.display = '';
    };

    if (isAvailable) {
        showContent();
        loadVersionData(mod, v).then(data => {
            if (data) renderVersion(data, config);
        });
    } else if (isUnavailable) {
        document.getElementById('blankIconModal').style.display = 'block';
        hideContent();
        history.pushState(null, "", `?mod=${mod}`);
    } else {
        hideContent();
    }
}

window.addEventListener("popstate", handleRoute);