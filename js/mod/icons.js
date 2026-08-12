document.addEventListener("DOMContentLoaded", () => {
    const mod = getCurrentMod();
    const config = getModConfig();

    document.querySelectorAll(".foreverbox-icon-col").forEach(col => {
        const version = col.dataset.icon;
        if (!version) return;

        const icon = col.querySelector(".foreverbox-icon");
        if (!icon) return;

        const isAvailable = config.availableVersions.includes(version);

        if (!isAvailable) {
            col.style.filter = 'grayscale(1.0)';
            col.addEventListener("click", () => {
                document.getElementById('blankIconModal').style.display = 'block';
            });
            return;
        }

        col.addEventListener("click", () => {
            switchVersion(version);
        });
    });

    setupHeader();
});

function setupHeader() {
    const params = new URLSearchParams(window.location.search);
    const hasVersion = params.has('v');
    const header = document.getElementById('header');

    if (!header) return;

    const newHeader = header.cloneNode(true);
    header.parentNode.replaceChild(newHeader, header);

    if (hasVersion) {
        newHeader.textContent = "Back to Main Page";
        newHeader.style.display = 'inline';
        newHeader.style.textDecoration = 'none';
        newHeader.style.cursor = 'pointer';

        newHeader.addEventListener('click', () => {
            switchVersion(null);
        });

        newHeader.addEventListener('mouseenter', () => {
            newHeader.style.textDecoration = 'underline';
            newHeader.style.cursor = 'pointer';
        });
        newHeader.addEventListener('mouseleave', () => {
            newHeader.style.textDecoration = 'none';
            newHeader.style.cursor = 'pointer';
        });
    } else {
        newHeader.textContent = "Select a Version";
        newHeader.style.display = 'inline';
        newHeader.style.textDecoration = 'none';
        newHeader.style.cursor = 'default';
    }
}

function switchVersion(version) {
    const mod = getCurrentMod();
    const config = getModConfig();
    const header = document.getElementById('header');
    const versionContent = document.getElementById('version-dynamic-content');
    const charHeader = document.getElementById('characters-header');
    const chars = document.getElementById('characters-grid');

    if (version && !config.availableVersions.includes(version)) {
        document.getElementById('blankIconModal').style.display = 'block';
        return;
    }

    let newUrl;
    if (isLocal) {
        newUrl = version ? `mod.html?mod=${mod}&v=${version}` : `mod.html?mod=${mod}`;
    } else {
        newUrl = version ? `../projects/mod?mod=${mod}&v=${version}` : `../projects/mod?mod=${mod}`;
    }

    history.pushState(null, "", newUrl);

    if (version) {
        document.querySelectorAll('.foreverbox-icons-row').forEach(row => row.style.display = 'none');

        if (versionContent) {
            versionContent.style.display = '';
            versionContent.innerHTML = '';
        }
        if (charHeader) charHeader.style.display = '';
        if (chars) chars.style.display = '';

        loadVersionData(mod, version).then(data => {
            if (data) renderVersion(data, config);
        });

        updateHeader("Back to Main Page", true);
    } else {
        if (versionContent) {
            versionContent.style.display = 'none';
            versionContent.innerHTML = '';
        }
        if (charHeader) charHeader.style.display = 'none';
        if (chars) chars.style.display = 'none';
        removeVersionHr();

        document.querySelectorAll('.foreverbox-icons-row').forEach(row => row.style.display = '');

        updateHeader("Select a Version", false);
    }
}

function updateHeader(text, isClickable) {
    const header = document.getElementById('header');
    if (!header) return;

    const newHeader = header.cloneNode(true);
    header.parentNode.replaceChild(newHeader, header);

    newHeader.textContent = text;
    newHeader.style.display = 'inline';
    newHeader.style.textDecoration = 'none';

    if (isClickable) {
        newHeader.style.cursor = 'pointer';

        newHeader.addEventListener('click', () => {
            switchVersion(null);
        });

        newHeader.addEventListener('mouseenter', () => {
            newHeader.style.textDecoration = 'underline';
            newHeader.style.cursor = 'pointer';
        });
        newHeader.addEventListener('mouseleave', () => {
            newHeader.style.textDecoration = 'none';
            newHeader.style.cursor = 'pointer';
        });
    } else {
        newHeader.style.cursor = 'default';
    }
}

function closeBlankModal() {
    document.getElementById('blankIconModal').style.display = 'none';
}

window.onclick = function (event) {
    const modal = document.getElementById('blankIconModal');
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const params = new URLSearchParams(window.location.search);
    const hasVersion = params.has('v');

    document.querySelectorAll('.foreverbox-icons-row').forEach(row => {
        row.style.display = hasVersion ? 'none' : '';
    });

    const versionContent = document.getElementById('version-dynamic-content');
    if (!hasVersion && versionContent) {
        versionContent.style.display = 'none';
    }

    const charHeader = document.getElementById('characters-header');
    if (!hasVersion && charHeader) {
        charHeader.style.display = 'none';
    }

    const chars = document.getElementById('characters-grid');
    if (!hasVersion && chars) {
        chars.style.display = 'none';
    }
});

window.addEventListener("popstate", () => {
    const mod = getCurrentMod();
    const config = getModConfig();
    const v = getVersionParam();

    if (v && config.availableVersions.includes(v)) {
        document.querySelectorAll('.foreverbox-icons-row').forEach(row => row.style.display = 'none');
        document.getElementById('version-dynamic-content').style.display = '';
        document.getElementById('characters-header').style.display = '';
        document.getElementById('characters-grid').style.display = '';

        loadVersionData(mod, v).then(data => {
            if (data) {
                renderVersion(data, config);
            }
        });

        updateHeader("Back to Main Page", true);
    } else {
        document.getElementById('version-dynamic-content').innerHTML = '';
        document.getElementById('version-dynamic-content').style.display = 'none';
        document.getElementById('characters-header').style.display = 'none';
        document.getElementById('characters-grid').style.display = 'none';

        document.querySelectorAll('.foreverbox-icons-row')
            .forEach(row => row.style.display = '');

        updateHeader("Select a Version", false);
        removeVersionHr();
    }
});