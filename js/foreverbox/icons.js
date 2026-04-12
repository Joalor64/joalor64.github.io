document.addEventListener("DOMContentLoaded", () => {
    const iconPath = "../img/foreverbox/icons/";

    document.querySelectorAll(".foreverbox-icon-col").forEach(col => {
        const version = col.dataset.icon;
        if (!version) return;

        const icon = col.querySelector(".foreverbox-icon");
        if (!icon) return;

        icon.style.backgroundImage = `url(${iconPath}v${version}.png)`;

        col.addEventListener("click", () => {
            switchVersion(version);
        });
    });
});

const availableVersions = ["1", "2", "3", "4", "5"];

function switchVersion(version) {
    const header = document.getElementById('header');
    const versionContent = document.getElementById('version-dynamic-content');
    const charHeader = document.getElementById('characters-header');
    const chars = document.getElementById('characters-grid');

    if (version && !availableVersions.includes(version)) {
        document.getElementById('blankIconModal').style.display = 'block';
        return;
    }

    history.pushState(null, "", version ? `foreverbox.html?v=${version}` : `foreverbox.html`);

    if (version) {
        document.querySelectorAll('.foreverbox-icons-row').forEach(row => row.style.display = 'none');

        if (versionContent) versionContent.style.display = '';
        if (charHeader) charHeader.style.display = '';
        if (chars) chars.style.display = '';

        if (versionCache[version]) renderVersion(versionCache[version]);

        if (header) {
            header.textContent = "Back to Main Page";
            header.style.display = 'inline';
            header.style.cursor = 'pointer';
            header.style.textDecoration = 'none';

            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);

            newHeader.addEventListener('click', () => switchVersion(null));
            newHeader.addEventListener('mouseenter', () => {
                newHeader.style.textDecoration = 'underline';
                newHeader.style.cursor = 'pointer';
            });
            newHeader.addEventListener('mouseleave', () => {
                newHeader.style.textDecoration = 'none';
                newHeader.style.cursor = 'pointer';
            });
        }

    } else {
        if (versionContent) versionContent.style.display = 'none';
        if (charHeader) charHeader.style.display = 'none';
        if (chars) chars.style.display = 'none';

        removeVersionHr();

        document.querySelectorAll('.foreverbox-icons-row').forEach(row => row.style.display = '');

        if (header) {
            header.textContent = "Select a Version";
            header.style.cursor = 'default';
            header.style.textDecoration = 'none';

            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);
        }
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

    const header = document.getElementById('header');
    if (hasVersion && header) {
        header.innerHTML = "Back to Main Page";
        header.style.display = 'inline';
        header.style.textDecoration = 'none';
        header.style.cursor = 'default';

        header.addEventListener('click', () => {
            switchVersion(null);
        });

        header.addEventListener('mouseenter', () => {
            header.style.textDecoration = 'underline';
            header.style.cursor = 'pointer';
        });
        header.addEventListener('mouseleave', () => {
            header.style.textDecoration = 'none';
            header.style.cursor = 'default';
        });
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
    const v = getVersionParam();

    if (v && versionCache[v]) {
        renderVersion(versionCache[v]);
    } else {
        document.getElementById('version-dynamic-content').innerHTML = '';
        document.getElementById('version-dynamic-content').style.display = 'none';
        document.getElementById('characters-header').style.display = 'none';
        document.getElementById('characters-grid').style.display = 'none';

        document.querySelectorAll('.foreverbox-icons-row')
            .forEach(row => row.style.display = '');
    }
});

function addVersionHr() {
    const versionContent = document.getElementById('version-dynamic-content');
    if (versionContent && versionContent.parentNode) {
        const oldHr = document.getElementById('version-hr');
        const oldBr = document.getElementById('version-br');
        if (oldHr) oldHr.remove();
        if (oldBr) oldBr.remove();

        const hr = document.createElement('hr');
        hr.id = 'version-hr';
        const br = document.createElement('br');
        br.id = 'version-br';

        versionContent.parentNode.insertBefore(hr, versionContent);
        versionContent.parentNode.insertBefore(br, versionContent);
    }
}

function removeVersionHr() {
    const oldHr = document.getElementById('version-hr');
    const oldBr = document.getElementById('version-br');
    if (oldHr) oldHr.remove();
    if (oldBr) oldBr.remove();
}
