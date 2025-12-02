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

// Only initialize audio player if buttons exist (Listening Room)
if (startStopBtn && skipBtn) {
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
}

// Modal Logic (Lessons Page)
const modal = document.getElementById("lessonModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const closeBtn = document.querySelector(".close-btn");
const instrumentBtns = document.querySelectorAll(".overlay-link[data-instrument]");

// Specific Content for each lesson
const lessonContent = {
    "Bass": `
    <div class="two-column-layout">
        <div>
            <p>Ninaad Raman</p>
            <img src="images/Ninaad.png" alt="Ninaad Headshot" style="width:150px;height:150px;">
            <ul style="text-align: left;">
                <li>Performing Bassist for Asanabenche</li>
                <li>Proficient in Jazz and Funk styles</li>
                <li>Experience teaching children and adults</li>
            <li>Wholistic approach to music education</li>
        </ul>
        </div>
    </div>
    `,
    "Drums": `
        <p>Jacob Winthrop</p>
        <img src="images/Jacob.png" alt="Jacob Headshot" style="width:150px;height:150px;">
        <ul style="text-align: left;">
            <li>fill in</li>
            <li>fill in</li>
            <li>fill in</li>
            <li>fill in</li>
        </ul>
    `,
    "Guitar": `
        <p>Jacob Winthrop</p>
        <img src="images/Jacob.png" alt="Jacob Headshot" style="width:150px;height:150px;">
        <ul style="text-align: left;">
            <li>fill in</li>
            <li>fill in</li>
            <li>fill in</li>
            <li>fill in</li>
        </ul>
    `,
    "Voice": `
        <p>Ninaad Raman</p>
        <img src="images/Ninaad.png" alt="Ninaad Headshot" style="width:150px;height:150px;">
        <ul style="text-align: left;">
            <li>20+ years of vocal performance experience</li>
            <li>Vocal Principle at Berklee College of Music</li>
            <li>10 years in Cantabile Youth Singers as a vocalist and conductor</li>
            <li>Group and Private direction experience for children and adults</li>
            <li>Wholistic approach to music education</li>
        </ul>
    `,
    "Piano": `
        <div class="three-column-layout">
            <div>
                <p>Anderson Jno Baptiste</p>
                <img src="images/Andy.png" alt="Anderson Headshot" style="width:150px;height:150px;">
                <p>(Jazz Piano)</p>
                <ul style="text-align: left;">
                    <li>fill in</li>
                    <li>fill in</li>
                    <li>fill in</li>
                    <li>fill in</li>
                </ul>
            </div>
            <div>
                <p>Ninaad Raman</p>
                <img src="images/Ninaad.png" alt="Ninaad Headshot" style="width:150px;height:150px;">
                <p>(Classical Piano)</p>
                <ul style="text-align: left;">
                    <li>15+ years of classical piano experience</li>
                    <li>Familiar with the Suzuki method</li>
                    <li>Teaches all ages</li>
                    <li>Teaches all skill levels</li>
                    <li>Wholistic approach to music education</li>
                </ul>
            </div>
            <div>
                <p>Al Nadel</p>
                <img src="images/Al.png" alt="Al Headshot" style="width:150px;height:150px;">
                <p>(Blues Piano)</p>
                <ul style="text-align: left;">
                    <li>fill in</li>
                    <li>fill in</li>
                    <li>fill in</li>
                    <li>fill in</li>
                </ul>
            </div>
        </div>
    `,
    "Teachers": `
        <div class="two-column-layout">
            <div>
                <p style="text-align:left;">Ninaad Raman</p>
                <img src="images/Ninaad.png" alt="Ninaad Headshot" style="width:150px;height:150px;float:left;margin-right:15px;margin-bottom:10px;">
                <p>Raised in classical and choral traditions, Ninaad spent 15 years honing his skills on the piano and voice until beginning his studies at The Berklee College of Music. There, he developed an advanced understanding of music theory and composition as well as audio engineering through his double major in Film Scoring and Music Production/Engineering. During this time he picked up the Bass Guitar and developed a love for Funk and Jazz styles. He spent his life both as a student and teacher, mentoring younger students in his choir and developing piano and guitar skills in others around his community.</p>
                <p style="text-align:left;">Anderson Jno Baptiste</p>
                <img src="images/Andy.png" alt="Anderson Headshot" style="width:150px;height:150px;float:left;margin-right:15px;margin-bottom:10px;">
                <p>Raised in classical and choral traditions, Ninaad spent 15 years honing his skills on the piano and voice until beginning his studies at The Berklee College of Music. There, he developed an advanced understanding of music theory and composition as well as audio engineering through his double major in Film Scoring and Music Production/Engineering. During this time he picked up the Bass Guitar and developed a love for Funk and Jazz styles. He spent his life both as a student and teacher, mentoring younger students in his choir and developing piano and guitar skills in others around his community.</p>
            </div>
            <div>
                <p style="text-align:right;">Jacob Winthrop</p>
                <img src="images/Jacob.png" alt="Jacob Headshot" style="width:150px;height:150px;float:right;margin-left:15px;margin-bottom:10px;">
                <p>Raised in classical and choral traditions, Ninaad spent 15 years honing his skills on the piano and voice until beginning his studies at The Berklee College of Music. There, he developed an advanced understanding of music theory and composition as well as audio engineering through his double major in Film Scoring and Music Production/Engineering. During this time he picked up the Bass Guitar and developed a love for Funk and Jazz styles. He spent his life both as a student and teacher, mentoring younger students in his choir and developing piano and guitar skills in others around his community.</p>
                <p style="text-align:right;">Al Nadel</p>
                <img src="images/Al.png" alt="Al Headshot" style="width:150px;height:150px;float:right;margin-left:15px;margin-bottom:10px;">
                <p>Raised in classical and choral traditions, Ninaad spent 15 years honing his skills on the piano and voice until beginning his studies at The Berklee College of Music. There, he developed an advanced understanding of music theory and composition as well as audio engineering through his double major in Film Scoring and Music Production/Engineering. During this time he picked up the Bass Guitar and developed a love for Funk and Jazz styles. He spent his life both as a student and teacher, mentoring younger students in his choir and developing piano and guitar skills in others around his community.</p>
            </div>
        </div>
    `
};

if (modal && closeBtn && instrumentBtns.length > 0) {
    // Open Modal
    instrumentBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const instrument = btn.getAttribute("data-instrument");

            // Set Title
            if (instrument == "Teachers") {
                modalTitle.textContent = "Teachers";
            } else {
                modalTitle.textContent = instrument + " Teachers";
            }

            // Set Body Content (using innerHTML for HTML tags)
            const content = lessonContent[instrument] || "<p>Content coming soon...</p>";
            modalBody.innerHTML = content;

            modal.style.display = "block";
        });
    });

    // Close Modal
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Close when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target == modal) {
            modal.style.display = "none";
        }
    });
}
