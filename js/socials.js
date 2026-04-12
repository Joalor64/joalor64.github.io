document.querySelectorAll('.card').forEach(card => {
    const url = card.dataset.href;
    if (!url || url === '#') {
        card.style.cursor = "default";
        return;
    }
    card.addEventListener('click', () => window.open(url, '_blank'));
});

const observer = new MutationObserver(() => adjustGrids());

function adjustGrids() {
    observer.disconnect();

    document.querySelectorAll('.section').forEach(section => {

        const twoBottomGrids = section.querySelectorAll('.grid.two-bottom');
        if (twoBottomGrids.length > 1) {
            for (let i = 1; i < twoBottomGrids.length; i++) {
                twoBottomGrids[i].remove();
            }
        }

        const grids = Array.from(section.querySelectorAll('.grid'));
        if (grids.length === 0) return;

        const mainGrid = grids[0];
        for (let i = 1; i < grids.length; i++) {
            const cards = Array.from(grids[i].querySelectorAll('.card'));
            cards.forEach(card => mainGrid.appendChild(card));
            grids[i].remove();
        }

        let cards = Array.from(mainGrid.querySelectorAll('.card'));
        if (cards.length > 3 && cards.length % 3 !== 0) {
            let currentGrid = mainGrid;
            let remainingCards = cards.slice();

            while (remainingCards.length > 3) {
                const newGrid = document.createElement('div');
                newGrid.className = 'grid';

                const moveCards = remainingCards.slice(3);
                if (moveCards.length === 0) break;

                moveCards.forEach(card => newGrid.appendChild(card));
                currentGrid.parentNode.insertBefore(newGrid, currentGrid.nextSibling);

                currentGrid = newGrid;
                remainingCards = Array.from(currentGrid.querySelectorAll('.card'));
            }
        }
    });

    document.querySelectorAll('.section .grid').forEach(grid => {
        const count = grid.querySelectorAll('.card').length;
        if (count <= 2) grid.classList.add('two-bottom');
        else grid.classList.remove('two-bottom');
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

document.addEventListener("DOMContentLoaded", adjustGrids);

observer.observe(document.body, { childList: true, subtree: true });

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.card').forEach(card => {
        const url = card.dataset.href;
        if (!url || url.trim() === "" || url === "#") {
            card.removeAttribute('data-href');
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const socialRedirect = {
        "bluesky": "https://bsky.app/profile/joalor64.bsky.social",
        "youtube": "https://www.youtube.com/@joalor64ytofficial",
        "discord": "https://discordapp.com/users/584516163296559117/",
        "tiktok": "https://www.tiktok.com/@joalor64",
        "bilibili": "https://space.bilibili.com/3546728714209872",
        "steam": "https://steamcommunity.com/profiles/76561199148819551",
        "roblox": "https://www.roblox.com/users/431005833/profile",
        "roblox-alt": "https://www.roblox.com/users/7631341417/profile",
        "github": "https://github.com/Joalor64GH",
        "itch": "https://joalor64.itch.io/",
        "modio": "https://mod.io/g/incredibox/u/joalor64",
        "gamebanana": "https://gamebanana.com/members/1987843",
        "scratch": "https://scratch.mit.edu/users/Joalor64Scratch/",
        "bandlab": "https://www.bandlab.com/joalor64bl",
        "tumblr": "https://joalor64tumb.tumblr.com/"
    };

    document.querySelectorAll('.card').forEach(card => {
        const brandClass = [...card.classList].find(cls => cls.startsWith('brand-'));
        if (!brandClass) return;

        const brandName = brandClass.replace('brand-', '');

        const url = socialRedirect[brandName];

        if (!url) {
            card.style.cursor = "default";
            return;
        }

        card.style.cursor = "pointer";
        card.addEventListener('click', () => window.open(url, '_blank'));
    });
});

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.card').forEach(card => {
        const brandClass = [...card.classList].find(cls => cls.startsWith('brand-'));
        if (!brandClass) return;

        let brandName = brandClass.replace('brand-', '');
        if (brandName === "roblox-alt") brandName = "roblox";

        const imgDiv = card.querySelector('.img');
        if (!imgDiv) return;

        imgDiv.style.backgroundImage = `url(img/buttons/socials/${brandName}.png)`;
    });
});
