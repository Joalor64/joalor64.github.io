const audioPlayer = document.getElementById('audio-player');
const trackTitle = document.getElementById('track-title');
const volumeSlider = document.getElementById('volume-slider');

const prevBtn = document.getElementById('prev-btn');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const nextBtn = document.getElementById('next-btn');

const progressBarEl = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationTimeEl = document.getElementById('duration-time');

const songs = [
    { url: './music/ascending_the_mountains.mp3', title: 'Ascending the Mountains' },
    { url: './music/ascension.mp3', title: 'Ascension' },
    { url: './music/basically_professionally_musically.mp3', title: 'Basically Professionally Musically' },
    { url: './music/hypnosis.mp3', title: 'Hypnosis' },
    { url: './music/late_nite.mp3', title: 'Late Nite' },
    { url: './music/marble_machine_joalor64_mix.mp3', title: 'Marble Machine (Joalor64 Mix)' },
    { url: './music/new_era.mp3', title: 'New Era' },
    { url: './music/sunlight_shore.mp3', title: 'Sunlight Shore' },
    { url: './music/to_unionize.mp3', title: 'To Unionize' }
];

let currentSongIndex = 0;
let isPlaying = false;

function loadSong(index) {
    if (!songs[index]) return;
    currentSongIndex = index;
    audioPlayer.src = songs[index].url;
    trackTitle.textContent = `Now Playing: ${songs[index].title} 🎶`;
    audioPlayer.title = songs[index].title;
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
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    playAudio();
}

function previousSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    playAudio();
}

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function setProgressPercent(pct) {
    progressBarEl.style.setProperty('--progress-pct', pct + '%');
    progressBarEl.style.setProperty('--fill-width', pct + '%');
    progressBarEl.style.setProperty('background-image', `linear-gradient(90deg, rgba(0,0,0,0.12) ${pct}%, transparent ${pct}%)`);
}

playBtn.addEventListener('click', playAudio);
pauseBtn.addEventListener('click', pauseAudio);
nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', previousSong);
volumeSlider.addEventListener('input', (e) => setVolume(e.target.value));

audioPlayer.addEventListener('ended', nextSong);

audioPlayer.addEventListener('loadedmetadata', () => {
    durationTimeEl.textContent = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener('timeupdate', () => {
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    if (audioPlayer.duration) {
        const pct = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBarEl.style.setProperty('--fill-width', pct + '%');
        progressBarEl.style.setProperty('background-image', `linear-gradient(90deg, #1976d2 ${pct}%, rgba(0,0,0,0.12) ${pct}%)`);
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
    if (e.key === 'ArrowLeft') {
        audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5);
    } else if (e.key === 'ArrowRight') {
        audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 5);
    }
});

audioPlayer.addEventListener('play', () => updatePlayUI(true));
audioPlayer.addEventListener('pause', () => updatePlayUI(false));

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        isPlaying ? pauseAudio() : playAudio();
    }
});

loadSong(currentSongIndex);
setVolume(volumeSlider.value);