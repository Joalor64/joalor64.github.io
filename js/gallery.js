(function () {
    const wall = document.getElementById('gallery-wall');
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxShare = document.getElementById('lightbox-share');
    const lightboxCounter = document.getElementById('lightbox-counter');

    let items = [];
    let currentIndex = 0;

    function normalizeItem(item) {
        return {
            name: item.name || 'Untitled',
            img: item.img ? siteUrl(item.img) : '',
            desc: item.desc || item.description || '',
            date: item.date || '',
            link: item.link || ''
        };
    }

    function formatDate(dateString) {
        if (!dateString) return '';

        const date = new Date(`${dateString}T12:00:00`);
        if (Number.isNaN(date.getTime())) return dateString;

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    }

    function getShareLabel(url) {
        if (!url) return 'Original post';

        try {
            const hostname = new URL(url).hostname.replace(/^www\./, '');
            if (hostname.includes('bsky.app')) return 'Bluesky';
            if (hostname.includes('youtube.com')) return 'YouTube';
            return hostname;
        } catch (error) {
            return 'Original post';
        }
    }

    async function init() {
        try {
            const [data] = await Promise.all([fetchJSON('/data/gallery.json'), imageSizesReady]);
            items = Array.isArray(data.gallery)
                ? data.gallery
                    .map(normalizeItem)
                    .filter((item) => item.img)
                : [];
        } catch (error) {
            console.warn('Gallery data could not be loaded:', error);
            items = [];
        }

        render();
        setupLightbox();
    }

    function render() {
        wall.innerHTML = '';

        if (!items.length) {
            wall.innerHTML = '<div class="gallery-empty">No gallery items available.</div>';
            return;
        }

        items.forEach((item, index) => {
            const frame = document.createElement('button');
            frame.type = 'button';
            frame.className = 'gallery-frame';
            frame.setAttribute('data-index', index);
            frame.setAttribute('aria-label', `View ${item.name}`);

            const dateText = item.date ? `<span class="frame-date">${formatDate(item.date)}</span>` : '';
            frame.innerHTML = `
                ${previewImg(item.img, item.name)}
                <span class="frame-overlay">${ICONS.zoom}</span>
                <span class="frame-caption">
                    <span class="frame-title">${item.name}</span>
                    ${dateText}
                </span>
            `;
            frame.addEventListener('click', () => openLightbox(index));
            wall.appendChild(frame);
        });
    }

    let lastFocused = null;

    function openLightbox(index) {
        if (!items.length) return;

        lastFocused = document.activeElement;
        currentIndex = index;
        updateLightbox();
        lightbox.hidden = false;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        lightbox.querySelector('.lightbox-close').focus();
    }

    function closeLightbox() {
        if (lightbox.hidden) return;
        lightbox.classList.remove('active');
        lightbox.hidden = true;
        document.body.style.overflow = '';
        if (lastFocused) lastFocused.focus();
    }

    function updateLightbox() {
        if (!items.length) return;

        const item = items[currentIndex];
        const dateText = formatDate(item.date);

        lightboxImg.src = item.img;
        lightboxImg.alt = item.name;

        lightboxCaption.innerHTML = `
            <div class="lightbox-title">${item.name}</div>
            ${dateText ? `<div class="lightbox-date">${dateText}</div>` : ''}
            ${item.desc ? `<div class="lightbox-desc">${item.desc}</div>` : ''}
        `;

        const shareButtons = [
            `<button class="lightbox-share-btn" type="button" data-share="direct">Direct</button>`
        ];

        if (item.link) {
            shareButtons.push(`<button class="lightbox-share-btn" type="button" data-share="custom">${getShareLabel(item.link)}</button>`);
        }

        lightboxShare.innerHTML = 'Share: ' + shareButtons.join('');
        lightboxShare.querySelectorAll('button').forEach((button) => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                const action = button.getAttribute('data-share');

                if (action === 'direct') {
                    window.open(item.img, '_blank', 'noopener,noreferrer');
                    return;
                }

                if (action === 'custom' && item.link) {
                    window.open(item.link, '_blank', 'noopener,noreferrer');
                }
            });
        });

        lightboxCounter.textContent = `${currentIndex + 1} / ${items.length}`;
    }

    function next() {
        if (!items.length) return;
        currentIndex = (currentIndex + 1) % items.length;
        updateLightbox();
    }

    function prev() {
        if (!items.length) return;
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateLightbox();
    }

    function setupLightbox() {
        document.querySelector('.lightbox-prev').innerHTML = ICONS.chevronLeft;
        document.querySelector('.lightbox-next').innerHTML = ICONS.chevronRight;
        document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
        document.querySelector('.lightbox-next').addEventListener('click', (event) => {
            event.stopPropagation();
            next();
        });
        document.querySelector('.lightbox-prev').addEventListener('click', (event) => {
            event.stopPropagation();
            prev();
        });

        lightbox.addEventListener('click', (event) => {
            if (event.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (event) => {
            if (lightbox.hidden) return;
            if (event.key === 'Escape') closeLightbox();
            if (event.key === 'ArrowRight') next();
            if (event.key === 'ArrowLeft') prev();
        });
    }

    init();
})();