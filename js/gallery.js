(function () {
    const wall = document.getElementById('gallery-wall');
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCounter = document.getElementById('lightbox-counter');

    let items = [];
    let currentIndex = 0;

    const defaultData = [
        {
            name: "Sun Monk",
            img: "img/gallery/sun-monk.png"
        },
        {
            name: "Saro",
            img: "img/gallery/saro.png"
        },
        {
            name: "Memphis (New)",
            img: "img/gallery/ayyitsMEE.png"
        },
        {
            name: "Bouba and Kiki",
            img: "img/gallery/boubaandkiki.png"
        },
        {
            name: "Cyrus, Nekoro, Yurei, and Jiro",
            img: "img/gallery/myfellas.png"
        },
        {
            name: "Michael and Fang (Wonderland)",
            img: "img/gallery/wonderland.png"
        },
        {
            name: "Kodon's Haven",
            img: "img/gallery/kodon.png"
        },
        {
            name: "Neosurf",
            img: "img/gallery/neosurf.png"
        },
        {
            name: "Ho-Ho (2 Much 2mfoolery)",
            img: "img/gallery/hoho.png"
        },
        {
            name: "Cyrus, God of Lightning",
            img: "img/gallery/cyrus.png"
        },
        {
            name: "Piter and Zotta",
            img: "img/gallery/piter-and-zotta.png"
        },
        {
            name: "Kino's Harvest",
            img: "img/gallery/kino.png"
        },
        {
            name: "Lyrian",
            img: "img/gallery/the-fallen.png"
        },
        {
            name: "Reggie, Mozaika, and Aayam",
            img: "img/gallery/mygang.png"
        },
        {
            name: "Voyager (JTA)",
            img: "img/gallery/voyager.png"
        },
        {
            name: "Shpongle",
            img: "img/gallery/shpongleyay.png"
        },
        {
            name: "Uike",
            img: "img/gallery/uike.png"
        },
        {
            name: "Full Body Attempt",
            img: "img/gallery/vic.png"
        },
        {
            name: "Elemonsters Logo",
            img: "img/gallery/elemonsters_logo.png"
        },
        {
            name: "Mendil Cutlogs",
            img: "img/gallery/mendil.png"
        },
        {
            name: "BANAN",
            img: "img/gallery/banan.png"
        },
        {
            name: "he",
            img: "img/gallery/he.png"
        },
        {
            name: "Memphis (2023-2026)",
            img: "img/gallery/memphis-2023.png"
        },
        {
            name: "Memphis Redesign Concept (2023)",
            img: "img/gallery/concept.png"
        },
        {
            name: "Memphis (2022-2023)",
            img: "img/gallery/memphis-2022.png"
        }
    ];

    async function init() {
        try {
            const res = await fetch('data/gallery.json');
            const data = await res.json();
            items = (data.gallery && data.gallery.length) ? data.gallery : defaultData;
        } catch (e) {
            items = defaultData;
        }
        render();
        setupLightbox();
    }

    function render() {
        wall.innerHTML = '';
        items.forEach((item, index) => {
            const frame = document.createElement('div');
            frame.className = 'gallery-frame';
            frame.setAttribute('data-index', index);
            frame.innerHTML = `
                <img src="${item.img}" alt="${item.name}" loading="lazy">
                <div class="frame-overlay"><i class="fa fa-search-plus"></i></div>
                <div class="frame-caption">${item.name}</div>
            `;
            frame.addEventListener('click', () => openLightbox(index));
            wall.appendChild(frame);
        });
    }

    function openLightbox(index) {
        currentIndex = index;
        updateLightbox();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function updateLightbox() {
        const item = items[currentIndex];
        lightboxImg.src = item.img;
        lightboxImg.alt = item.name;
        lightboxCaption.textContent = item.name;
        lightboxCounter.textContent = `${currentIndex + 1} / ${items.length}`;
    }

    function next() {
        currentIndex = (currentIndex + 1) % items.length;
        updateLightbox();
    }

    function prev() {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateLightbox();
    }

    function setupLightbox() {
        document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
        document.querySelector('.lightbox-next').addEventListener('click', (e) => { e.stopPropagation(); next(); });
        document.querySelector('.lightbox-prev').addEventListener('click', (e) => { e.stopPropagation(); prev(); });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
        });
    }

    init();
})();