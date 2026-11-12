(function () {
    const TILE = 400;
    const SHEETS = [
        { path: '/img/comics/panel1.png', width: 2400, height: 2000 },
        { path: '/img/comics/panel2.png', width: 2400, height: 2000 },
        { path: '/img/comics/panel3.png', width: 2400, height: 2000 }
    ].map((sheet) => ({ ...sheet, cols: sheet.width / TILE, count: (sheet.width / TILE) * (sheet.height / TILE) }));

    const locks = [false, false, false];
    const current = [1, 1, 1];
    const sheetImages = SHEETS.map((sheet) => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => {
            if (img.src.endsWith('.webp')) { img.src = sheet.path; return; }
            reject(new Error(`Failed to load ${sheet.path}`));
        };
        img.src = previewSrc(sheet.path);
    }));

    const panelImgs = [1, 2, 3].map((n) => document.querySelector(`#panel${n} img`));
    const idDisplay = document.getElementById('comicIdDisplay');
    const idInput = document.getElementById('comicIdInput');
    const idError = document.getElementById('comicIdError');

    async function drawPanel(slot, number) {
        const sheet = SHEETS[slot];
        current[slot] = number;
        panelImgs[slot].dataset.panelNumber = number;
        try {
            const sprite = await sheetImages[slot];
            if (current[slot] !== number) return;
            const index = number - 1;
            const canvas = document.createElement('canvas');
            canvas.width = TILE;
            canvas.height = TILE;
            canvas.getContext('2d').drawImage(sprite,
                (index % sheet.cols) * TILE, Math.floor(index / sheet.cols) * TILE, TILE, TILE,
                0, 0, TILE, TILE);
            panelImgs[slot].src = canvas.toDataURL('image/png');
            panelImgs[slot].alt = `Comic panel ${slot + 1} (#${number})`;
        } catch (error) {
            console.error(error);
            panelImgs[slot].alt = 'This panel failed to load.';
        }
    }

    function showComicId() {
        idDisplay.textContent = 'Comic ID: ' + current.join('-');
    }

    function randomizeComic() {
        SHEETS.forEach((sheet, slot) => {
            if (!locks[slot]) drawPanel(slot, 1 + Math.floor(Math.random() * sheet.count));
        });
        showComicId();
    }

    function setComicById(id) {
        const numbers = id.trim().split('-').map(Number);
        const valid = numbers.length === 3 &&
            numbers.every((n, slot) => Number.isInteger(n) && n >= 1 && n <= SHEETS[slot].count);
        if (!valid) {
            idError.textContent = `That isn't a valid comic ID. Use three numbers from 1 to ${SHEETS[0].count}, like 4-1-5.`;
            return;
        }
        idError.textContent = '';
        numbers.forEach((n, slot) => drawPanel(slot, n));
        showComicId();
    }

    document.querySelectorAll('.lock-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const slot = Number(btn.dataset.panel);
            locks[slot] = !locks[slot];
            btn.textContent = locks[slot] ? '🔒' : '🔓';
            btn.setAttribute('aria-pressed', String(locks[slot]));
            btn.setAttribute('aria-label', `${locks[slot] ? 'Unlock' : 'Lock'} panel ${slot + 1}`);
        });
    });

    document.getElementById('randomizeButton').addEventListener('click', randomizeComic);
    document.getElementById('saveButton').addEventListener('click', () => saveComic(false));
    document.getElementById('saveWatermarkButton').addEventListener('click', () => saveComic(true));
    document.getElementById('comicIdForm').addEventListener('submit', (e) => {
        e.preventDefault();
        setComicById(idInput.value);
    });

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
            image.onerror = () => resolve(null);
            image.src = img.src;
        }));

        Promise.all(promises).then(imgs => {
            imgs.forEach((img, i) => { if (img) ctx.drawImage(img, i * 400, 0, 400, 400); });

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

    randomizeComic();
})();
