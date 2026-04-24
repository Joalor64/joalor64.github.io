document.addEventListener("DOMContentLoaded", function () {
    const controls = document.getElementById('categoryControls');
    if (!controls) return;

    const buttons = controls.querySelectorAll('.category-btn');
    const items = document.querySelectorAll('#creationsGallery .game-gallery-item');

    function setActive(btn) {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    function filter(cat) {
        let visibleCount = 0;

        items.forEach(i => {
            const cats = (i.getAttribute('data-category') || '')
                .split(',')
                .map(s => s.trim());

            if (cat === 'all' || cats.indexOf(cat) !== -1) {
                i.style.display = '';
                visibleCount++;
            } else {
                i.style.display = 'none';
            }
        });

        adjustFooter(visibleCount);
    }

    function adjustFooter(count) {
        const footer = document.querySelector("footer");
        if (!footer) return;

        footer.style.marginTop = (count <= 5) ? "200px" : "0px";
    }

    controls.addEventListener('click', function (e) {
        const btn = e.target.closest('.category-btn');
        if (!btn) return;

        const cat = btn.getAttribute('data-cat');
        setActive(btn);
        filter(cat);
    });

    filter('all');
});

const thumbnails = {
    "JTA": "img/thumbnails/JTA_logo.png",
    "rhythmo": "img/thumbnails/rhythmo.png",
    "math-game": "img/thumbnails/math-game.png",
    "2048-clicker": "img/thumbnails/2048-clicker.png",
    "eternyx": "img/thumbnails/eternyx.png",
    "percush": "img/thumbnails/percush.png",
    "foreverbox": "img/thumbnails/foreverbox.png",
    "yagsr": "img/thumbnails/yagsr.png",
    "VSRobReboot": "img/thumbnails/vs-rob-rebooted.png",
    "VSJoalor64": "img/thumbnails/vs-joalor64.png",
    "ChocolateEngine": "img/wallpapers/CE.png",
    "Joalor64Engine": "img/wallpapers/J64EREgitcover1.png",
    "Joalor64EngineLegacy": "img/wallpapers/J64EL.png",
    "SynapseEngine": "img/thumbnails/synapse-engine.png",
    "modbox": "img/thumbnails/modbox.png",
    "alura": "img/thumbnails/alura.png",
    "visionsphere": "img/thumbnails/visionsphere.png",
    "processCreations": "img/thumbnails/processing-creations.png",
    "FlashCreations": "img/thumbnails/flash-creations.png",
};

document.querySelectorAll(".game-gallery-item").forEach(item => {
    const thumb = item.querySelector(".game-thumbnail .img");
    if (!thumb) return;

    const id = item.id;
    if (thumbnails[id]) {
        thumb.style.backgroundImage = `url(${thumbnails[id]})`;
        thumb.style.backgroundSize = "contain";
        thumb.style.backgroundPosition = "center";
    }
});

const links = {
    "JTA": {
        github: "https://github.com/JoaTH-Team/JTA/"
    },
    "rhythmo": {
        itch: "https://joalor64.itch.io/rhythmo",
        github: "https://github.com/JoaTH-Team/Rhythmo"
    },
    "2DHorror": {
        github: "https://github.com/Joalor64/Simple2DHorror"
    },
    "math-game": {
        github: "https://github.com/Joalor64/SimpleMathGame"
    },
    "2048-clicker": {
        github: "https://github.com/Joalor64/2048-Clicker"
    },
    percush: {
        modio: "https://mod.io/g/incredibox/m/percush",
        windows: "https://www.mediafire.com/file/r6mntviyazlgla4/Percush+PC.zip/file",
        android: "https://www.mediafire.com/file/5oepi4i0hkkc2mp/Percush_signed.apk/file"
    },
    eternyx: {
        windows: "https://www.mediafire.com/file/x1wa8mc049fjpbx/Eternyx_Demo_%2528PC%2529.zip/file",
        android: "https://www.mediafire.com/file/qphuang1b4iedjt/Eternyx-Demo_signed.apk/file"
    },
    yagsr: {
        modio: "https://mod.io/g/incredibox/m/yet-another-generic-sprunki-remake",
        windows: "https://www.mediafire.com/file/vps924lwi8vtu3r/Incredibox_-_YAGSR_%2528PC%2529.zip/file",
        android: "https://www.mediafire.com/file/ndmpjlv4wo80jq4/Incredibox_-_YAGSR_%2528Android%2529.apk/file"
    },
    foreverbox: {
        modio: "https://mod.io/g/incredibox/c/foreverbox",
        itch: "https://joalor64.itch.io/foreverbox"
    },
    "VSRobReboot": {
        itch: "https://joalor64.itch.io/vs-rob-rebooted-demo",
        github: "https://github.com/Joalor64/VS-Rob-Rebooted/",
        gamebanana: "https://gamebanana.com/mods/602704"
    },
    "Joalor64Engine": {
        itch: "https://joalor64.itch.io/joalor64-engine-rewritten",
        github: "https://github.com/Joalor64/Joalor64-Engine-Rewrite",
        gamebanana: "https://gamebanana.com/tools/17185"
    },
    "VSJoalor64": {
        itch: "https://joalor64.itch.io/vs-joalor64",
        github: "https://github.com/Joalor64/VSJoalor64-SourceCode",
        gamebanana: "https://gamebanana.com/mods/417238"
    },
    "ChocolateEngine": {
        itch: "https://joalor64.itch.io/chocolate-engine",
        github: "https://github.com/Joalor64/Chocolate-Engine",
        gamebanana: "https://gamebanana.com/tools/10774",
        mega: "https://mega.nz/folder/CXwCSbzI#Wzro2ssEjDNsw0-KBy0gSQ"
    },
    "Joalor64EngineLegacy": {
        itch: "https://joalor64.itch.io/joalor64-engine",
        github: "https://github.com/Joalor64/Joalor64-Engine"
    },
    "SynapseEngine": {
        gamebanana: "https://gamebanana.com/tools/22532",
        github: "https://github.com/Joalor64/FNF-SynapseEngine"
    },
    "HaxeTemplate": {
        github: "https://github.com/Joalor64/Haxe-Template"
    },
    "SimpleLocalization": {
        github: "https://github.com/Joalor64/SimpleLocalization"
    },
    "modbox": {
        website: "https://joalor64.github.io/Modbox",
        github: "https://github.com/Joalor64/Modbox"
    },
    "alura": {
        github: "https://github.com/Joalor64/alura"
    },
    "visionsphere": {
        github: "https://github.com/Joalor64/VisionSphere"
    },
    "processCreations": {
        github: "https://github.com/Joalor64/Processing-Creations"
    },
    "BandlabRadioPlayer": {
        github: "https://github.com/Joalor64/BandLab-Radio-Player"
    },
    "FlashCreations": {
        website: "https://joalor64.github.io/FlashCreationsWebsite",
        github: "https://github.com/Joalor64/Flash-Creations"
    },
    "BandlabOSTPlayer": {
        github: "https://github.com/Joalor64/BandLabOST-Player"
    }
};

const projectPages = {
    "foreverbox": "projects/foreverbox"
};

document.querySelectorAll(".game-gallery-item").forEach(item => {
    const id = item.id;
    if (projectPages[id]) {
        item.classList.add("has-page");
        item.addEventListener("click", function (e) {
            if (e.target.closest(".link-icon")) {
                return;
            }
            window.location.href = projectPages[id];
        });
    }
});

document.querySelectorAll(".link-icon").forEach(el => {
    el.addEventListener("click", function () {
        const project = this.closest(".game-gallery-item")?.id;
        const type = this.id;

        if (!project || !type) return;

        const url = links[project]?.[type];
        if (!url) return;

        window.open(url, "_blank");
    });
});
