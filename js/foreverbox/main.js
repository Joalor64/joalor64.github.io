const sfsgModApi = "https://www.incredibox.com/ph4/api.php?q=modio";
const isOffline = !navigator.onLine;

let versionCache = {};
let modApprovalCache = {};
let preloaded = false;

let cachedModList = null;
let modListTimestamp = 0;
const MOD_CACHE_DURATION = 5 * 60 * 1000;

async function fetchModList() {
    if (isOffline) return [];
    if (cachedModList && (Date.now() - modListTimestamp) < MOD_CACHE_DURATION) {
        return cachedModList;
    }

    try {
        const res = await fetch(sfsgModApi);
        if (!res.ok) throw new Error("Failed to fetch mod list");

        const data = await res.json();
        const mods = data?.data || data?.modslist?.data || [];

        cachedModList = mods;
        modListTimestamp = Date.now();

        return mods;

    } catch (err) {
        return [];
    }
}

async function isApprovedMod(modId, platform = "windows") {
    if (!modId || isOffline) return false;

    const mods = await fetchModList();
    const mod = mods.find(m => Number(m.id) === Number(modId));
    if (!mod) return false;

    if (mod.status !== 1 || mod.visible !== 1) return false;

    const platformStatus = mod.modfile?.platforms?.find(p => p.platform === platform)?.status;
    return platformStatus === 1;
}

function getVersionParam() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('v'), 10) || null;
}

function renderVersion(data) {
    const container = document.getElementById('version-dynamic-content');
    const charHeader = document.getElementById('characters-header');
    if (!data || !data.versionInfo) {
        container.innerHTML = "<p>Version not found.</p>";
        document.getElementById('characters-header').innerHTML = '';
        return;
    } else {
        charHeader.style.display = '';
    }

    const params = new URLSearchParams(window.location.search);
    if (params.has('v')) {
        addVersionHr();
    }

    const version = data.versionInfo;

    const newIcon = version.meta.isNew ? `
        <div class="version-icon-top-right">
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 100 100"
                fill="#00ff00">
                <path
                    d="M79.162 75.367q-4.04 0.495 -4.655 4.519 -0.615 4.022 -4.611 3.247t-5.823 2.859q-1.829 3.635 -5.389 1.663 -3.559 -1.972 -6.423 0.92 -2.862 2.893 -5.638-0.084 -2.775-2.977 -6.391-1.109 -3.616 1.866 -5.336-1.822 -1.72-3.689 -5.736-3.031 -4.016 0.657 -4.513-3.381 -0.496-4.04 -4.519-4.655 -4.023-0.616 -3.247-4.611 0.777-3.994 -2.859-5.824 -3.635-1.827 -1.663-5.387 1.973-3.56 -0.92-6.422 -2.893-2.864 0.084-5.639 2.977-2.775 1.11-6.391-1.867 -3.617 1.821 -5.336 3.688 -1.72 3.03 -5.737-0.657 -4.016 3.382 -4.512 4.039 -0.496 4.655 -4.519 0.615-4.023 4.61-3.247 3.995 0.777 5.824-2.859 1.828-3.636 5.388-1.663t6.422-0.919c1.908-1.93 3.788-1.901 5.638 0.083q2.776 2.976 6.392 1.111 3.616-1.867 5.337 1.821 1.72 3.688 5.736 3.03 4.016-0.658 4.512 3.381 0.497 4.039 4.519 4.654t3.247 4.611q-0.776 3.996 2.859 5.824 3.636 1.829 1.663 5.388 -1.972 3.56 0.92 6.423 2.892 2.863 -0.085 5.638c-2.977 2.775 -2.354 3.981 -1.109 6.392q1.866 3.615 -1.823 5.337 -3.688 1.72 -3.03 5.736c0.439 2.679 -0.687 4.181 -3.38 4.513" />
                <text x="50%" y="52%" text-anchor="middle" fill="white" font-size="30px"
                    font-family="Urbanist" font-weight="bold" dy=".3em">NEW</text>
                </svg>
        </div>
    ` : '';
    const modioIcon = version.meta.isModIo ? `
        <div class="version-icon-top-right" ${(version.meta.isNew ? 'style="right: 60px;"' : '')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 100 100"
                fill="#07c1d8">
                <path
                    d="M79.162 75.367q-4.04 0.495 -4.655 4.519 -0.615 4.022 -4.611 3.247t-5.823 2.859q-1.829 3.635 -5.389 1.663 -3.559 -1.972 -6.423 0.92 -2.862 2.893 -5.638-0.084 -2.775-2.977 -6.391-1.109 -3.616 1.866 -5.336-1.822 -1.72-3.689 -5.736-3.031 -4.016 0.657 -4.513-3.381 -0.496-4.04 -4.519-4.655 -4.023-0.616 -3.247-4.611 0.777-3.994 -2.859-5.824 -3.635-1.827 -1.663-5.387 1.973-3.56 -0.92-6.422 -2.893-2.864 0.084-5.639 2.977-2.775 1.11-6.391-1.867 -3.617 1.821 -5.336 3.688 -1.72 3.03 -5.737-0.657 -4.016 3.382 -4.512 4.039 -0.496 4.655 -4.519 0.615-4.023 4.61-3.247 3.995 0.777 5.824-2.859 1.828-3.636 5.388-1.663t6.422-0.919c1.908-1.93 3.788-1.901 5.638 0.083q2.776 2.976 6.392 1.111 3.616-1.867 5.337 1.821 1.72 3.688 5.736 3.03 4.016-0.658 4.512 3.381 0.497 4.039 4.519 4.654t3.247 4.611q-0.776 3.996 2.859 5.824 3.636 1.829 1.663 5.388 -1.972 3.56 0.92 6.423 2.892 2.863 -0.085 5.638c-2.977 2.775 -2.354 3.981 -1.109 6.392q1.866 3.615 -1.823 5.337 -3.688 1.72 -3.03 5.736c0.439 2.679 -0.687 4.181 -3.38 4.513" />
                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 60 60"
                        fill="#ffffff">
                    <path
                        d='m43.9 30.3c0-.8.1-1.6.4-2.3-1.1.4-2.4.6-3.7.6-1.2 0-2.4-.2-3.5-.5-.1.7-.2 1.4-.2 2.1 0 1.2.1 2.3.4 3.4-3.2.5-6 2-8 4.2-1.2-1.3-2.7-2.3-4.4-3.1-.8 2.5-2.4 4.6-4.4 6.3 2.9.7 5.1 3.3 5.1 6.4 1.4.4 2.9.6 4.4.6 1.1 0 2.1-.1 3.1-.3.1-3.5 3-6.3 6.5-6.3 1.2 0 2.4.3 3.4.9l.4-.4c1.5-1.8 2.8-3.8 3.5-6.1-1.8-1.2-3-3.2-3-5.5z' />
                    <path
                        d='m43.9 18.5c-.3.1-.6.3-.9.4-.7.2-1.4.3-2.1.3-3.6 0-6.6-2.9-6.6-6.6v-.1c-1.4-.3-2.8-.5-4.3-.5-1.1 0-2.1.1-3.1.3-.1 3.5-3 6.3-6.6 6.3-1.2 0-2.4-.3-3.4-.9-1.7 1.8-3.1 4-3.9 6.5 1.8 1.2 3 3.2 3 5.5 0 2.4-1.3 4.5-3.2 5.6.7 2.3 1.9 4.4 3.4 6.2 3-1.6 5.3-4.2 6.5-7.5.5-1.5.8-3 .8-4.7 0-1.1-.1-2.2-.4-3.2 2.9-.6 5.5-2 7.4-4.1 1.8 2 4.3 3.4 7 4h.1c.9.2 1.9.3 2.9.3 2.3 0 4.5-.6 6.4-1.6.1 0 .1-.1.2-.1-.6-2.2-1.7-4.3-3.2-6.1z' />
                    </svg>
                </svg>
        </div>
    ` : '';

    let incredimodsIcon = '';
    if (version.meta.modioID && modApprovalCache[version.meta.version]) {
        incredimodsIcon = `<div class="version-icon-top-right" style="${version.meta.isNew ? 'right: 110px;' : version.meta.isModIo ? 'right: 60px;' : ''}" id="incredimods"></div>`;
    }

    container.innerHTML = `
        <div class="version-container" style="background-color: ${version.visu.colCont};" 
            data-download-windows-url="${version.meta.downloadWin}"
            data-download-android-url="${version.meta.downloadAnd}"
            data-download-modio-url="${version.meta.downloadModIo}">
            <div class="version-content">
                <div class="version-image">
                    <img src="../img/foreverbox/splashes/${version.meta.name.toLowerCase().replace(' ', '-')}.jpg" alt="${version.meta.name}">
                </div>
                <div class="version-info">
                    <div class="version-name-container">
                        ${newIcon}
                        ${modioIcon}
                        ${incredimodsIcon}
                        <div class="version-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 100 100"
                                fill=${version.visu.colVerIcon}>
                                <path
                                    d="M79.162 75.367q-4.04 0.495 -4.655 4.519 -0.615 4.022 -4.611 3.247t-5.823 2.859q-1.829 3.635 -5.389 1.663 -3.559 -1.972 -6.423 0.92 -2.862 2.893 -5.638-0.084 -2.775-2.977 -6.391-1.109 -3.616 1.866 -5.336-1.822 -1.72-3.689 -5.736-3.031 -4.016 0.657 -4.513-3.381 -0.496-4.04 -4.519-4.655 -4.023-0.616 -3.247-4.611 0.777-3.994 -2.859-5.824 -3.635-1.827 -1.663-5.387 1.973-3.56 -0.92-6.422 -2.893-2.864 0.084-5.639 2.977-2.775 1.11-6.391-1.867 -3.617 1.821 -5.336 3.688 -1.72 3.03 -5.737-0.657 -4.016 3.382 -4.512 4.039 -0.496 4.655 -4.519 0.615-4.023 4.61-3.247 3.995 0.777 5.824-2.859 1.828-3.636 5.388-1.663t6.422-0.919c1.908-1.93 3.788-1.901 5.638 0.083q2.776 2.976 6.392 1.111 3.616-1.867 5.337 1.821 1.72 3.688 5.736 3.03 4.016-0.658 4.512 3.381 0.497 4.039 4.519 4.654t3.247 4.611q-0.776 3.996 2.859 5.824 3.636 1.829 1.663 5.388 -1.972 3.56 0.92 6.423 2.892 2.863 -0.085 5.638c-2.977 2.775 -2.354 3.981 -1.109 6.392q1.866 3.615 -1.823 5.337 -3.688 1.72 -3.03 5.736c0.439 2.679 -0.687 4.181 -3.38 4.513" />
                                <text x="50%" y="52%" text-anchor="middle" fill="white" font-size="40px"
                                    font-family="Urbanist" font-weight="bold" dy=".3em">V${version.meta.version}</text>
                            </svg>
                        </div>
                        <h2 class="version-name">${version.meta.name}</h2>
                    </div>
                    <p class="version-date">Released: ${version.meta.date}</p>
                    <p class="version-description">${version.meta.desc}</p>
                    <div class="version-buttons">
                        <button class="btn download-btn">⤓ Download</button>
                        <button class="btn preview-btn">► Preview</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const versionContainer = container.querySelector('.version-container');
    const downloadBtn = versionContainer.querySelector('.download-btn');
    const previewBtn = versionContainer.querySelector('.preview-btn');
    const downloadWindowsUrl = versionContainer.getAttribute('data-download-windows-url');
    const downloadAndroidUrl = versionContainer.getAttribute('data-download-android-url');
    const downloadModIoUrl = versionContainer.getAttribute('data-download-modio-url');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const modal = document.getElementById('downloadModal');
            const windowsLink = document.getElementById('windowsDownload');
            const androidLink = document.getElementById('androidDownload');
            const modIoLink = document.getElementById('modIoDownload');

            if (downloadWindowsUrl) {
                windowsLink.href = downloadWindowsUrl;
                windowsLink.style.display = 'inline-block';
            } else {
                windowsLink.style.display = 'none';
            }

            if (downloadAndroidUrl) {
                androidLink.href = downloadAndroidUrl;
                androidLink.style.display = 'inline-block';
            } else {
                androidLink.style.display = 'none';
            }

            if (downloadModIoUrl) {
                modIoLink.href = downloadModIoUrl;
                modIoLink.style.display = 'inline-block';
            } else {
                modIoLink.style.display = 'none';
            }

            modal.style.display = 'block';
        });
    }

    if (previewBtn && version.meta.previewID) {
        previewBtn.addEventListener('click', () => {
            const modal = document.getElementById('previewModal');
            const iframe = document.getElementById('previewVideo');
            iframe.src = `https://www.youtube.com/embed/${version.meta.previewID}?autoplay=1`;
            modal.style.display = 'flex';
        });
    }

    if (data.characters) {
        renderCharacters(data.characters, data.versionInfo.meta.version);
    } else {
        document.getElementById('characters-grid').innerHTML = '';
    }
}

function renderCharacters(characters, versionId) {
    const grid = document.getElementById('characters-grid');
    if (!characters || !Array.isArray(characters) || characters.length === 0) {
        grid.innerHTML = '';
        return;
    }

    const slidesHtml = characters.map((char, i) => {
        const appearances = Array.isArray(char.imgs) ? char.imgs : [];
        const appearanceButtons = appearances.map((img, idx) => `
            <button class="appearance-btn" data-char-index="${i}" data-img-index="${idx}">${img.title || `Look ${idx+1}`}</button>
        `).join('');

        return `
        <div class="slide" data-index="${i}" style="display:${i === 0 ? 'flex' : 'none'}">
            <div class="slide-img">
                <img src="../img/foreverbox/characters/${appearances[0]?.img || ''}" alt="${char.name}">
            </div>
            <div class="slide-info">
                <h3 class="character-name">${char.name}</h3>
                <p class="character-modal-desc">${char.desc || ''}</p>
                <div class="character-modal-meta">
                    <span><b>Age:</b> ${char.age || '-'}</span> |
                    <span><b>Gender:</b> ${getCharacterGender(char.gender)}</span>
                </div>
                ${appearances.length > 1 ? `<div class="appearance-buttons">${appearanceButtons}</div>` : ''}
            </div>
        </div>`;
    }).join('');

    grid.innerHTML = `
        <div class="character-slideshow">
            <button class="slide-nav prev" aria-label="Previous">◀</button>
            <div class="slides-wrapper">${slidesHtml}</div>
            <button class="slide-nav next" aria-label="Next">▶</button>
        </div>
    `;

    let currentIndex = 0;
    const slides = grid.querySelectorAll('.slide');

    function showSlide(idx) {
        if (idx < 0) idx = slides.length - 1;
        if (idx >= slides.length) idx = 0;
        slides.forEach((s, i) => {
            s.style.display = (i === idx) ? 'flex' : 'none';
        });
        currentIndex = idx;
        const visibleSlide = slides[idx];
        if (visibleSlide) {
            const imgEl = visibleSlide.querySelector('.slide-img img');
            const btns = visibleSlide.querySelectorAll('.appearance-btn');
            if (btns && btns.length > 0) {
                const src = imgEl?.getAttribute('src') || '';
                const currentFile = src.split('/').pop();
                let matched = false;
                btns.forEach(b => b.classList.remove('active'));
                btns.forEach(b => {
                    const imgIdx = parseInt(b.getAttribute('data-img-index'), 10);
                    const appearances = characters[idx].imgs || [];
                    const expected = appearances[imgIdx]?.img || '';
                    if (expected && expected === currentFile) {
                        b.classList.add('active');
                        matched = true;
                    }
                });
                if (!matched) {
                    btns[0].classList.add('active');
                }
            }
        }
    }

    const prevBtn = grid.querySelector('.slide-nav.prev');
    const nextBtn = grid.querySelector('.slide-nav.next');
    prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));

    grid.querySelectorAll('.appearance-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const charIdx = parseInt(this.getAttribute('data-char-index'), 10);
            const imgIdx = parseInt(this.getAttribute('data-img-index'), 10);
            const slide = grid.querySelector(`.slide[data-index="${charIdx}"]`);
            const imgEl = slide.querySelector('.slide-img img');
            const appearances = characters[charIdx].imgs || [];
            const selected = appearances[imgIdx];
            if (selected) {
                imgEl.src = `../img/foreverbox/characters/${selected.img}`;
                imgEl.alt = characters[charIdx].name + (selected.title ? ' - ' + selected.title : '');
            }

            const siblingBtns = slide.querySelectorAll('.appearance-btn');
            siblingBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    showSlide(0);

    grid.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') showSlide(currentIndex - 1);
        if (e.key === 'ArrowRight') showSlide(currentIndex + 1);
    });
}

function getCharacterGender(gender) {
    switch (gender) {
        case "M":
            return "Male";
        case "F":
            return "Female";
        default:
            return gender;
    }
}

function closeModal() {
    document.getElementById('downloadModal').style.display = 'none';
}

window.onclick = function (event) {
    const modal = document.getElementById('downloadModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

function closePreviewModal() {
    const modal = document.getElementById('previewModal');
    const iframe = document.getElementById('previewVideo');
    iframe.src = "";
    modal.style.display = "none";
}

window.addEventListener("click", (event) => {
    const modal = document.getElementById('previewModal');
    if (event.target === modal) {
        closePreviewModal();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    initForeverbox();
});

async function initForeverbox() {
    await fetchModList();

    const versionsToPreload = ["1", "2", "3", "4", "5", "6", "7", "8"];

    await Promise.all(
        versionsToPreload.map(async (v) => {
            try {
                const res = await fetch(`../data/foreverbox/v${v}.json`);
                if (!res.ok) return;

                const json = await res.json();
                versionCache[v] = json;

                const modioID = json.versionInfo?.meta?.modioID;
                if (modioID) {
                    try {
                        modApprovalCache[v] = await isApprovedMod(modioID);
                    } catch {
                        modApprovalCache[v] = false;
                    }
                }
            } catch (err) {
                console.log(`V${v} is not found`);
            }
        })
    );

    preloaded = true;
    handleRoute();
}

function handleRoute() {
    const v = getVersionParam();

    if (v && versionCache[v]) {
        renderVersion(versionCache[v]);

        document.querySelectorAll('.foreverbox-icons-row')
            .forEach(row => row.style.display = 'none');

        document.getElementById('version-dynamic-content').style.display = '';
        document.getElementById('characters-header').style.display = '';
        document.getElementById('characters-grid').style.display = '';
    } else {
        document.getElementById('version-dynamic-content').innerHTML = '';
        document.getElementById('version-dynamic-content').style.display = 'none';
        document.getElementById('characters-header').style.display = 'none';
        document.getElementById('characters-grid').style.display = 'none';

        document.querySelectorAll('.foreverbox-icons-row')
            .forEach(row => row.style.display = '');
    }
}

window.addEventListener("popstate", handleRoute);