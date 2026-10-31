(function () {
    const audioPlayer = document.getElementById('audio-player');
    const trackTitle = document.getElementById('track-title');
    const volumeSlider = document.getElementById('volume-slider');
    const playlistSelect = document.getElementById('playlist-select');
    const songSelect = document.getElementById('song-select');

    const prevBtn = document.getElementById('prev-btn');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const nextBtn = document.getElementById('next-btn');

    const progressBarEl = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationTimeEl = document.getElementById('duration-time');

    const songs = {
        default: [
            // i'll make new tracks soon i promise
            { url: '/music/ascending_the_mountains.mp3', title: 'Ascending the Mountains', bpm: 135 },
            // { url: '/music/guiding_star.mp3', title: 'Guiding Star', bpm: 100 },
            { url: '/music/hypnosis.mp3', title: 'Hypnosis', bpm: 120 },
            { url: '/music/late_nite.mp3', title: 'Late Nite', bpm: 140 },
            { url: '/music/marble_machine_joalor64_mix.mp3', title: 'Marble Machine (Joalor64 Mix)', bpm: 140 },
            // { url: '/music/sea_breeze.mp3', title: 'Sea Breeze', bpm: 110 },
            // { url: '/music/solar_odyssey.mp3', title: 'Solar Odyssey', bpm: 120 },
            { url: '/music/sunlight_shore.mp3', title: 'Sunlight Shore', bpm: 90 },
            { url: '/music/to_unionize.mp3', title: 'To Unionize', bpm: 95 }
            // { url: '/music/vhsakura.mp3', title: 'VHSakura', bpm: 120 },
        ],
        legacy: [
            { url: '/music/legacy/ascension.mp3', title: 'Ascension', bpm: 110 },
            { url: '/music/legacy/basically_professionally_musically.mp3', title: 'Basically Professionally Musically', bpm: 120 },
            { url: '/music/legacy/cold_anthem.mp3', title: 'Cold Anthem', bpm: 120 },
            { url: '/music/legacy/forever_confusing.mp3', title: 'Forever Confusing', bpm: 110 },
            { url: '/music/legacy/harmony_of_no_tomorrow.mp3', title: 'Harmony of No Tomorrow', bpm: 110 },
            { url: '/music/legacy/hexes_and_frostbite.mp3', title: 'Hexes and Frostbite', bpm: 120 },
            { url: '/music/legacy/new_era.mp3', title: 'New Era', bpm: 125 },
            { url: '/music/legacy/oceanic_utopia.mp3', title: 'Oceanic Utopia', bpm: 140 }
        ]
    };

    let currentSongIndex = 0;
    let currentPlaylist = 'default';
    let isPlaying = false;

    function getCurrentPlaylist() {
        return songs[currentPlaylist];
    }

    function updateSongOptions() {
        const playlist = getCurrentPlaylist();
        songSelect.replaceChildren();

        playlist.forEach((song, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = song.title;
            songSelect.appendChild(option);
        });
    }

    function loadSong(index) {
        const playlist = getCurrentPlaylist();
        if (!playlist[index]) return;
        currentSongIndex = index;
        audioPlayer.src = playlist[index].url;
        trackTitle.textContent = `Now Playing: ${playlist[index].title} 🎶`;
        audioPlayer.title = playlist[index].title;
        songSelect.value = String(index);
        currentTimeEl.textContent = '0:00';
        durationTimeEl.textContent = '0:00';
        setProgressPercent(0);
    }

    function updatePlayUI(playing) {
        isPlaying = !!playing;
        playBtn.hidden = isPlaying;
        pauseBtn.hidden = !isPlaying;
        playBtn.setAttribute('aria-pressed', String(isPlaying));
    }

    async function playAudio() {
        try {
            await audioPlayer.play();
            updatePlayUI(true);
        } catch (err) {
            console.warn('Playback failed:', err);
            updatePlayUI(false);
        }
    }

    function pauseAudio() {
        audioPlayer.pause();
        updatePlayUI(false);
    }

    function setVolume(value) {
        const v = parseFloat(value);
        if (!Number.isFinite(v)) return;
        audioPlayer.volume = Math.max(0, Math.min(1, v));
    }

    function nextSong() {
        currentSongIndex = (currentSongIndex + 1) % getCurrentPlaylist().length;
        loadSong(currentSongIndex);
        playAudio();
    }

    function previousSong() {
        currentSongIndex = (currentSongIndex - 1 + getCurrentPlaylist().length) % getCurrentPlaylist().length;
        loadSong(currentSongIndex);
        playAudio();
    }

    function changePlaylist(playlistName) {
        if (!songs[playlistName]) return;
        const wasPlaying = !audioPlayer.paused;
        audioPlayer.pause();
        currentPlaylist = playlistName;
        currentSongIndex = 0;
        updateSongOptions();
        loadSong(currentSongIndex);
        updatePlayUI(false);
        if (wasPlaying) playAudio();
    }

    function formatTime(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function setProgressPercent(pct) {
        progressBarEl.style.backgroundImage = `linear-gradient(90deg, #1976d2 ${pct}%, transparent ${pct}%)`;
        progressBarEl.setAttribute('aria-valuenow', String(Math.round(pct)));
        progressBarEl.setAttribute('aria-valuetext',
            `${formatTime(audioPlayer.currentTime)} of ${formatTime(audioPlayer.duration)}`);
    }

    playBtn.addEventListener('click', playAudio);
    pauseBtn.addEventListener('click', pauseAudio);
    nextBtn.addEventListener('click', nextSong);
    prevBtn.addEventListener('click', previousSong);
    playlistSelect.addEventListener('change', (e) => changePlaylist(e.target.value));
    songSelect.addEventListener('change', (e) => {
        const wasPlaying = !audioPlayer.paused;
        loadSong(Number(e.target.value));
        if (wasPlaying) playAudio();
    });
    volumeSlider.addEventListener('input', (e) => setVolume(e.target.value));

    audioPlayer.addEventListener('ended', nextSong);

    audioPlayer.addEventListener('loadedmetadata', () => {
        durationTimeEl.textContent = formatTime(audioPlayer.duration);
    });

    audioPlayer.addEventListener('timeupdate', () => {
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
        if (audioPlayer.duration) {
            setProgressPercent((audioPlayer.currentTime / audioPlayer.duration) * 100);
        }
    });

    progressBarEl.addEventListener('click', (e) => {
        const rect = progressBarEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, x / rect.width));
        if (audioPlayer.duration) {
            audioPlayer.currentTime = pct * audioPlayer.duration;
        }
    });

    progressBarEl.addEventListener('keydown', (e) => {
        if (!audioPlayer.duration) return;
        const seekKeys = {
            ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5,
            PageDown: -30, PageUp: 30, Home: -Infinity, End: Infinity
        };
        if (!(e.key in seekKeys)) return;
        e.preventDefault();
        audioPlayer.currentTime = Math.max(0, Math.min(audioPlayer.duration, audioPlayer.currentTime + seekKeys[e.key]));
    });

    audioPlayer.addEventListener('play', () => updatePlayUI(true));
    audioPlayer.addEventListener('pause', () => updatePlayUI(false));

    document.addEventListener('keydown', (e) => {
        if (e.code !== 'Space' || e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.target.closest('button, a, input, select, textarea, [role="slider"], [contenteditable]')) return;
        e.preventDefault();
        isPlaying ? pauseAudio() : playAudio();
    });

    updateSongOptions();
    loadSong(currentSongIndex);
    setVolume(volumeSlider.value);
})();
