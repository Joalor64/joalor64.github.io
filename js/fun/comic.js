const panelData = [];
const panelCount = 30;
const locks = [false, false, false];

const SPRITE_SHEET = {
    'panel1': {
        path: '../img/comics/panel1.png',
        width: 2400,
        height: 2000,
        tileSize: 400,
        cols: Math.floor(2400 / 400),
        rows: Math.floor(2000 / 400)
    },
    'panel2': {
        path: '../img/comics/panel2.png',
        width: 2400,
        height: 2000,
        tileSize: 400,
        cols: Math.floor(2400 / 400),
        rows: Math.floor(2000 / 400)
    },
    'panel3': {
        path: '../img/comics/panel3.png',
        width: 2400,
        height: 2000,
        tileSize: 400,
        cols: Math.floor(2400 / 400),
        rows: Math.floor(2000 / 400)
    }
};

const spriteCache = {};

function toggleLock(index) {
    locks[index] = !locks[index];
    const btn = document.querySelectorAll('.comic-panel button')[index];
    btn.textContent = locks[index] ? "🔒" : "🔓";
}

function getCurrentComicId() {
    const images = Array.from(document.querySelectorAll('.comic-panel img'));
    return images.map((img, i) => {
        return img.dataset.panelNumber || "1";
    }).join("-");
}

function setComicById(id) {
    const ids = id.split("-");
    for (let i = 0; i < 3; i++) {
        const panelNum = ids[i] || "1";
        if (panelData[i].includes(panelNum)) {
            updatePanelImage(i, panelNum);
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
            updatePanelImage(i, panelData[i][randIndex]);
        }
    }
    showComicId();
}

function updatePanelImage(panelIndex, panelNumber) {
    const img = document.querySelector(`#panel${panelIndex + 1} img`);
    const panelKey = `panel${panelIndex + 1}`;

    img.dataset.panelNumber = panelNumber;
    loadPanelFromSprite(panelKey, panelNumber, img);
}

function loadPanelFromSprite(panelKey, panelNumber, imgElement) {
    const config = SPRITE_SHEET[panelKey];
    if (!config) {
        console.error(`No sprite sheet config for ${panelKey}`);
        return;
    }

    if (spriteCache[panelKey]) {
        renderPanelFromSprite(spriteCache[panelKey], panelNumber, imgElement, config);
        return;
    }

    const spriteImage = new Image();
    spriteImage.crossOrigin = "anonymous";
    spriteImage.onload = function () {
        spriteCache[panelKey] = this;
        renderPanelFromSprite(this, panelNumber, imgElement, config);
    };
    spriteImage.onerror = function () {
        console.error(`Failed to load sprite sheet: ${config.path}`);
        imgElement.src = `https://dummyimage.com/400x400/000/fff.png&text=Error!`;
    };
    spriteImage.src = config.path;
}

function renderPanelFromSprite(spriteImage, panelNumber, imgElement, config) {
    const tileSize = config.tileSize;
    const cols = config.cols;

    const index = parseInt(panelNumber) - 1;

    const row = Math.floor(index / cols);
    const col = index % cols;

    const x = col * tileSize;
    const y = row * tileSize;

    console.log(`Panel ${panelNumber}: row=${row}, col=${col}, x=${x}, y=${y}`);

    if (x + tileSize > config.width || y + tileSize > config.height) {
        console.warn(`Panel ${panelNumber} is outside sprite sheet bounds!`);
        imgElement.src = `https://dummyimage.com/400x400/ff0000/fff.png&text=Missing!`;
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = tileSize;
    canvas.height = tileSize;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(spriteImage, x, y, tileSize, tileSize, 0, 0, tileSize, tileSize);

    imgElement.src = canvas.toDataURL('image/png');
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
            const text = "https://joalor64.github.io/fun/comic";
            const fontSize = 18;
            const padding = 12;
            const x = 10;
            const y = 10;

            ctx.font = `${fontSize}px Poppins, sans-serif`;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";

            const metrics = ctx.measureText(text);
            const textWidth = metrics.width;
            const textHeight = fontSize;

            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            const radius = 8;
            const rectX = x - padding;
            const rectY = y - padding;
            const rectWidth = textWidth + (padding * 2);
            const rectHeight = textHeight + (padding * 2);

            ctx.beginPath();
            ctx.moveTo(rectX + radius, rectY);
            ctx.lineTo(rectX + rectWidth - radius, rectY);
            ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + radius);
            ctx.lineTo(rectX + rectWidth, rectY + rectHeight - radius);
            ctx.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - radius, rectY + rectHeight);
            ctx.lineTo(rectX + radius, rectY + rectHeight);
            ctx.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - radius);
            ctx.lineTo(rectX, rectY + radius);
            ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
            ctx.closePath();
            ctx.fill();

            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            ctx.fillStyle = "black";
            ctx.fillText(text, x, y);
        }

        const link = document.createElement('a');
        link.download = "comic.png";
        link.href = canvas.toDataURL();
        link.click();
    });
}

for (let i = 0; i < 3; i++) {
    panelData[i] = [];
    for (let j = 1; j <= 30; j++) {
        panelData[i].push(j.toString());
    }
}

randomizeComic();