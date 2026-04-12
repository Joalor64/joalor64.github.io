const panelData = [];
const locks = [false, false, false];

function toggleLock(index) {
    locks[index] = !locks[index];
    const btn = document.querySelectorAll('.comic-panel button')[index];
    btn.textContent = locks[index] ? "🔒" : "🔓";
}

function getCurrentComicId() {
    const images = Array.from(document.querySelectorAll('.comic-panel img'));
    return images.map((img, i) => {
        const match = img.src.match(/\/(\d+)\.png$/);
        return match ? match[1] : "1";
    }).join("-");
}

function setComicById(id) {
    const ids = id.split("-");
    for (let i = 0; i < 3; i++) {
        const panelNum = ids[i] || "1";
        if (panelData[i].includes(panelNum)) {
            const img = document.querySelector(`#panel${i + 1} img`);
            img.src = `img/comics/panel${i + 1}/${panelNum}.png`;
        }
    }
}

function showComicId() {
    const id = getCurrentComicId();
    document.getElementById("comicIdDisplay").textContent = "Comic ID: " + id;
}

function randomizeComic() {
    for (let i = 0; i < 3; i++) {
        if (!locks[i]) {
            const randIndex = Math.floor(Math.random() * panelData[i].length);
            const img = document.querySelector(`#panel${i + 1} img`);
            img.src = `../img/comics/panel${i + 1}/${panelData[i][randIndex]}.png`;
        }
    }
    showComicId();
}

function saveComic(withWatermark) {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    const images = Array.from(document.querySelectorAll('.comic-panel img'));
    const promises = images.map(img => new Promise(resolve => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => resolve(image);
        image.src = img.src;
    }));

    Promise.all(promises).then(imgs => {
        imgs.forEach((img, i) => ctx.drawImage(img, i * 400, 0, 400, 400));

        if (withWatermark) {
            ctx.font = "18px Comic Sans MS";
            ctx.fillStyle = "rgba(0, 0, 255)";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText("Created by Joalor64's Random Comic Generator™", 10, 10);
        }

        const link = document.createElement('a');
        link.download = "comic.png";
        link.href = canvas.toDataURL();
        link.click();
    });
}

for (let i = 0; i < 3; i++) {
    panelData[i] = [];
    for (let j = 1; j <= 9; j++) {
        panelData[i].push(j.toString());
    }
}

randomizeComic();