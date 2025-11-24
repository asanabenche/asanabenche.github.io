// Audio Player Logic

// Playlist of songs
const playlist = [
    "audioFiles/BIRD MUSIC MP3s/01 Boxed Out.mp3",
    "audioFiles/BIRD MUSIC MP3s/03 Spy Balloon.mp3",
    "audioFiles/BIRD MUSIC MP3s/04 Tidal.mp3",
    "audioFiles/BIRD MUSIC MP3s/05 ROT.mp3",
    "audioFiles/BIRD MUSIC MP3s/06 Asana.mp3",
    "audioFiles/BIRD MUSIC MP3s/08 Benche.mp3",
    "audioFiles/BIRD MUSIC MP3s/09 Agravada Mermelada.mp3",
    "audioFiles/BIRD MUSIC MP3s/11 Toe Funkus.mp3",
    "audioFiles/BIRD MUSIC MP3s/12 Horse in a Field.mp3",
    "audioFiles/BIRD MUSIC MP3s/14 Outdoor Shower.mp3"
];

let currentIndex = 0;
let isPlaying = false;
const audio = new Audio(playlist[currentIndex]);

// Select buttons
const startStopBtn = document.querySelector('.start-stop-btn');
const skipBtn = document.querySelector('.skip-btn');

// Function to toggle play/pause
function togglePlay() {
    if (isPlaying) {
        audio.pause();
    } else {
        audio.play().catch(error => console.error("Playback failed:", error));
    }
    isPlaying = !isPlaying;
    // Optional: Update button visual state here if needed
}

// Function to play next song
function playNext() {
    currentIndex = (currentIndex + 1) % playlist.length; // Loop back to start
    audio.src = playlist[currentIndex];

    if (isPlaying) {
        audio.play().catch(error => console.error("Playback failed:", error));
    } else {
        // If it was paused, just load the next one but don't auto-play unless desired.
        // User request: "skip button to stop the current audio file and start the next"
        // Usually implies starting playback of the next one.
        audio.play().catch(error => console.error("Playback failed:", error));
        isPlaying = true;
    }
}

// Event Listeners
startStopBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    togglePlay();
});

skipBtn.addEventListener('click', (e) => {
    e.preventDefault();
    playNext();
});

// Auto-play next track when ended
audio.addEventListener('ended', () => {
    playNext();
});
