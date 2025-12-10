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
            <p class="teacher-name">Ninaad Raman</p>
            <img src="images/Lessons/Ninaad.png" alt="Ninaad Headshot" style="width:150px;height:150px;">
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
        <p class="teacher-name">Jacob Winthrop</p>
        <img src="images/Lessons/Jacob.png" alt="Jacob Headshot" style="width:150px;height:150px;">
        <ul style="text-align: left;">
            <li>fill in</li>
            <li>fill in</li>
            <li>fill in</li>
            <li>fill in</li>
        </ul>
    `,
    "Guitar": `
        <p class="teacher-name">Jacob Winthrop</p>
        <img src="images/Lessons/Jacob.png" alt="Jacob Headshot" style="width:150px;height:150px;">
        <ul style="text-align: left;">
            <li>fill in</li>
            <li>fill in</li>
            <li>fill in</li>
            <li>fill in</li>
        </ul>
    `,
    "Voice": `
        <p class="teacher-name">Ninaad Raman</p>
        <img src="images/Lessons/Ninaad.png" alt="Ninaad Headshot" style="width:150px;height:150px;">
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
                <p class="teacher-name">Anderson Jno Baptiste</p>
                <img src="images/Lessons/Andy.png" alt="Anderson Headshot" style="width:150px;height:150px;">
                <p>(Jazz Piano)</p>
                <ul style="text-align: left;">
                    <li>fill in</li>
                    <li>fill in</li>
                    <li>fill in</li>
                    <li>fill in</li>
                </ul>
            </div>
            <div>
                <p class="teacher-name">Ninaad Raman</p>
                <img src="images/Lessons/Ninaad.png" alt="Ninaad Headshot" style="width:150px;height:150px;">
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
                <p class="teacher-name">Al Nadel</p>
                <img src="images/Lessons/Al.png" alt="Al Headshot" style="width:150px;height:150px;">
                <p>(Blues Piano)</p>
                <ul style="text-align: left;">
                    <li>fill in</li>
                    <li>fill in</li>
                    <li>fill in</li>
                    <li>fill in</li>
                </ul>
            </div>
        </div>
        <img src="images/Lessons/inquire_base.png" alt="Inquire Base" style="width:30%;height:30%;">
    `,
    "Teachers": `
        <div class="two-column-layout">
            <div>
                <p class="teacher-name" style="text-align:left;">Ninaad Raman</p>
                <img src="images/Lessons/Ninaad.png" alt="Ninaad Headshot" style="width:150px;height:150px;float:left;margin-right:15px;margin-bottom:10px;">
                <p>Raised in classical and choral traditions, Ninaad spent 15 years honing his skills on the piano and voice until beginning his studies at The Berklee College of Music. There, he developed an advanced understanding of music theory and composition as well as audio engineering through his double major in Film Scoring and Music Production/Engineering. During this time he picked up the Bass Guitar and developed a love for Funk and Jazz styles. He spent his life both as a student and teacher, mentoring younger students in his choir and community with an emphasis on a fun and supportive learning environment.</p>
                <p class="teacher-name" style="text-align:left;">Anderson Jno Baptiste</p>
                <img src="images/Lessons/Andy.png" alt="Anderson Headshot" style="width:150px;height:150px;float:left;margin-right:15px;margin-bottom:10px;">
                <p>Raised in classical and choral traditions, Ninaad spent 15 years honing his skills on the piano and voice until beginning his studies at The Berklee College of Music. There, he developed an advanced understanding of music theory and composition as well as audio engineering through his double major in Film Scoring and Music Production/Engineering. During this time he picked up the Bass Guitar and developed a love for Funk and Jazz styles. He spent his life both as a student and teacher, mentoring younger students in his choir and developing piano and guitar skills in others around his community.</p>
            </div>
            <div>
                <p class="teacher-name" style="text-align:right;">Jacob Winthrop</p>
                <img src="images/Lessons/Jacob.png" alt="Jacob Headshot" style="width:150px;height:150px;float:right;margin-left:15px;margin-bottom:10px;">
                <p>Jacob is a guitar player and drummer who graduated with a degree in professional music from Berklee College of Music, and has played for 12 years. His guitar teaching experience ranges from local kids in Los Angeles to full classes of adults in Boston and now he wants to teach you! He knows that every student is different and therefore every lesson should be approached differently. He loves music theory and uses it to help teach you how to not only be a great guitar player or drummer, but also a musician capable of self-teaching. Above all he wants you to believe in yourself and have fun! Music is all about fun!</p>
                <p class="teacher-name" style="text-align:right;">Al Nadel</p>
                <img src="images/Lessons/Al.png" alt="Al Headshot" style="width:150px;height:150px;float:right;margin-left:15px;margin-bottom:10px;">
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

// Shake-on-click Logic
const shakeElements = document.querySelectorAll('.shake-on-click');

shakeElements.forEach(element => {
    element.addEventListener('click', () => {
        // Remove class if it already exists to restart animation
        element.classList.remove('shaking');

        // Force reflow to allow restarting animation
        void element.offsetWidth;

        element.classList.add('shaking');

        // Remove class after animation completes (1s)
        setTimeout(() => {
            element.classList.remove('shaking');
        }, 1000);
    });
});

// --- Skater Interaction Logic (Watch Page) ---
document.addEventListener('DOMContentLoaded', () => {
    const skaterBtn = document.querySelector('.chair-skater-btn');
    const skaterBehind = document.querySelector('.skater-behind');
    let hoverStartTime = 0;
    let animationTriggered = false; // Prevent double clicks

    if (skaterBtn && skaterBehind) {
        // Track when hover starts
        skaterBtn.addEventListener('mouseenter', () => {
            hoverStartTime = Date.now();
        });

        // Reset on leave (optional, but good for logic)
        skaterBtn.addEventListener('mouseleave', () => {
            hoverStartTime = 0;
        });

        skaterBtn.addEventListener('click', () => {
            // Check if hovered for at least 4 seconds (4000ms) AND not already triggered
            if (!animationTriggered && hoverStartTime > 0 && (Date.now() - hoverStartTime >= 4000)) {
                animationTriggered = true;
                // Trigger falling animation
                skaterBehind.classList.add('falling');

                // Wait for fall to finish (0.5s), then remove
                setTimeout(() => {
                    if (skaterBehind.parentNode) {
                        skaterBehind.parentNode.removeChild(skaterBehind);
                    }
                    triggerSecretAnimation();
                }, 500);
            } else {
                const duration = hoverStartTime > 0 ? Date.now() - hoverStartTime : 0;
                console.log(`Click ignored. Hover duration: ${duration}ms (Required: 4000ms). Already Triggered: ${animationTriggered}`);
            }
        });
    }
});

function triggerSecretAnimation() {
    console.log("Radical");
    const skaterFlatDiv = document.querySelector('.skater-flat');
    const skaterImg = skaterFlatDiv ? skaterFlatDiv.querySelector('img') : null;

    if (skaterFlatDiv && skaterImg) {
        // Unlock Watch Egg (Set status variable)
        unlockEgg('watchEggStatus');

        // Preload images
        const imgUp = new Image(); imgUp.src = "images/Watch/skaterUp.png";
        const imgDown = new Image(); imgDown.src = "images/Watch/skaterDown.png";
        const imgFlat = new Image(); imgFlat.src = "images/Watch/skaterFlat.png";

        // Select existing police car element
        const policeCarDiv = document.querySelector('.police-car');

        // Play Audio (plays "sooner" by starting now while animation waits)
        const skaterAudio = new Audio('audioFiles/watchAudio/skaterAnimationAudio.wav');
        skaterAudio.play().catch(err => console.log('Skater audio blocked:', err));

        console.log("Animation Triggered: Starting Skater and Police Car sequence.");

        // Start movement for skater (Delayed 0.2s)
        setTimeout(() => {
            if (skaterFlatDiv) {
                console.log("Skater: Making visible and moving.");
                skaterFlatDiv.style.display = 'block';

                // FORCE REFLOW: Critical for Chrome/Edge to register the start position
                void skaterFlatDiv.offsetWidth;

                skaterFlatDiv.style.transform = "translate(-1400%, 0%)";
            } else {
                console.error("Skater div not found!");
            }
        }, 300);

        // Start movement for police car with a delay
        if (policeCarDiv) {
            console.log("Police Car: Found element, scheduling run.");
            setTimeout(() => {
                console.log("Police Car: Making visible and moving.");
                policeCarDiv.style.display = 'block';

                // FORCE REFLOW: Critical for Chrome/Edge
                void policeCarDiv.offsetWidth;

                policeCarDiv.style.transform = "translate(-1200%, 0%)";

                // Trigger wheelie animation
                const policeCarImg = policeCarDiv.querySelector('img');
                if (policeCarImg) {
                    policeCarImg.classList.add('wheelie-anim');
                }
            }, 1900); // 0.5s delay to follow
        } else {
            console.error("Police Car div not found!");
        }

        // Trick Sequence
        // 1. Launch (Upward) - Ease Out (Decelerate)
        setTimeout(() => {
            skaterImg.src = imgUp.src;

            // Instantaneously set start position (slightly higher)
            skaterImg.style.transition = "none";
            skaterImg.style.transform = "translate(0%, -10%)";

            // Force reflow
            void skaterImg.offsetWidth;

            // Start Animation
            skaterImg.style.transition = "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), width 0.5s ease"; // Ease Out
            skaterImg.style.width = "80%";
            skaterImg.style.transform = "translate(0%, -30%)";
        }, 1200);

        // 2. Apex (Downward) - Ease In (Accelerate)
        // Swaps to 'Down' image exactly at the peak
        setTimeout(() => {
            skaterImg.src = imgDown.src;
            skaterImg.style.transition = "transform 0.5s cubic-bezier(0.55, 0.085, 0.68, 0.53), width 0.5s ease"; // Ease In
            // skaterImg.style.width = "110%"; // Optional
            skaterImg.style.transform = "translate(0%, +10%)";
        }, 1700); // 1500 + 500ms duration

        // 3. Landing (Flat) - Recovery
        // Swaps to 'Flat' image exactly at the bottom
        setTimeout(() => {
            skaterImg.src = imgFlat.src;
            skaterImg.style.transition = "transform 0.3s ease, width 0.3s ease";
            skaterImg.style.width = "120%";
            skaterImg.style.transform = "translate(0%, -15%)";
        }, 2200); // 2000 + 500ms duration
    }
}
// --- PAGE TRANSITION LOGIC ---
window.addEventListener('load', () => {
    const transitionEl = document.querySelector('.page-transition');
    if (transitionEl) {
        setTimeout(() => {
            transitionEl.classList.add('hidden');
        }, 500); // Wait 0.5s before revealing to ensure rendering
    }
});

// Fix for Back-Forward Cache (bfcache)
window.addEventListener('pageshow', (event) => {
    // If the page is restored from the bfcache
    if (event.persisted) {
        const transitionEl = document.querySelector('.page-transition');
        if (transitionEl) {
            // Re-run the fade-in logic
            setTimeout(() => {
                transitionEl.classList.add('hidden');
            }, 500); // Maintain same timing as load
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Prevent dragging images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });
    });

    const links = document.querySelectorAll('a');
    const transitionEl = document.querySelector('.page-transition');

    if (transitionEl) {
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                // Only intercept internal links that are not hash links or javascript:
                if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !link.target) {
                    e.preventDefault();
                    transitionEl.classList.remove('hidden');

                    setTimeout(() => {
                        window.location.href = href;
                    }, 300); // 0.3s match CSS transition
                }
            });
        });
    }

    // --- GENERIC AUDIO ON HOVER ---
    // Selects any element with a 'data-audio' attribute and plays it on hover.
    const audioElements = document.querySelectorAll('[data-audio]');

    audioElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            const audioSrc = el.getAttribute('data-audio');
            if (audioSrc) {
                const audio = new Audio(audioSrc);
                audio.play().catch(err => {
                    // Benign error: Audio play was prevented (e.g., no user interaction yet)
                    console.log('Audio playback prevented:', err);
                });
            }
        });
    });

    // --- FLOWER INTERACTION (Shop Page) ---
    // Shop Egg Logic: Hover 4 -> 3 -> 2 -> 1 within 2 seconds
    const flowers = [
        document.querySelector('.flower-1'),
        document.querySelector('.flower-2'),
        document.querySelector('.flower-3'),
        document.querySelector('.flower-4')
    ];

    if (flowers[0] && flowers[1] && flowers[2] && flowers[3]) {
        let hoverSequence = [];

        flowers.forEach((flower, index) => {
            const flowerId = index + 1; // 1, 2, 3, 4
            flower.addEventListener('mouseenter', () => {
                const now = Date.now();
                hoverSequence.push({ id: flowerId, time: now });

                // Keep only last 4
                if (hoverSequence.length > 4) {
                    hoverSequence.shift();
                }

                // Check for 4 -> 3 -> 2 -> 1
                if (hoverSequence.length === 4) {
                    const ids = hoverSequence.map(item => item.id);
                    // Expected: [4, 3, 2, 1]
                    if (ids[0] === 4 && ids[1] === 3 && ids[2] === 2 && ids[3] === 1) {
                        const startTime = hoverSequence[0].time;
                        const endTime = hoverSequence[3].time;
                        const duration = endTime - startTime;

                        if (duration < 2000) { // Under 2 seconds
                            // Unlock Shop Egg
                            unlockEgg('shopEggStatus');
                            console.log("Shop Egg Status: TRUE (Speed: " + duration + "ms)");
                        }
                    }
                }
            });
        });
    }

    // --- CONTACT PAGE INTERACTION ---
    const holaBtn = document.querySelector('.hola-btn');
    const cardinalHead = document.querySelector('.cardinal-head-contact');

    if (holaBtn && cardinalHead) {
        // Configuration: Sequential Playback 1-11
        const spanishFiles = [];
        for (let i = 1; i <= 11; i++) {
            spanishFiles.push(`audioFiles/contactAudio/spanishAudio${i}.wav`);
        }

        let currentAudioIndex = 0;
        let isHolaPlaying = false;

        holaBtn.addEventListener('click', () => {
            // Prevent multiple clicks while playing
            if (isHolaPlaying) return;

            // Check if we reached the end
            if (currentAudioIndex >= spanishFiles.length) {
                // Should be removed already, but safe guard
                if (cardinalHead.parentNode) {
                    cardinalHead.parentNode.removeChild(cardinalHead);
                }
                return;
            }

            // 1. Play Next Audio
            const nextFile = spanishFiles[currentAudioIndex];
            const audio = new Audio(nextFile);

            // Set Playing State
            isHolaPlaying = true;
            holaBtn.style.cursor = 'default'; // Visual feedback
            // audio.play() is inside verify logic below, wait, I need to check where audio.play() is.
            // Ah, I need to wrap or modify the existing play block.

            audio.play().catch(err => {
                console.log('Audio missing or blocked:', err);
                // Reset if failed
                isHolaPlaying = false;
                holaBtn.style.cursor = 'pointer';
                alert('Audio Error: ' + err.message + '\nFile: ' + nextFile);
            });

            // 2. Animate Head (Talk)
            cardinalHead.classList.add('talking');

            // Advance Index
            currentAudioIndex++;

            // Stop animation when audio ends
            audio.onended = () => {
                cardinalHead.classList.remove('talking');

                // Reset State
                isHolaPlaying = false;
                holaBtn.style.cursor = 'pointer';

                // If that was the last file, remove the element
                if (currentAudioIndex >= spanishFiles.length) {
                    // Unlock Contact Egg
                    unlockEgg('contactEggStatus');
                    console.log("Contact Egg Status: TRUE");

                    // Wait for the return transition (0.5s) to finish before removing
                    setTimeout(() => {
                        if (cardinalHead.parentNode) {
                            cardinalHead.parentNode.removeChild(cardinalHead);
                        }
                    }, 550); // 500ms transition + 50ms buffer
                }
            };

            // Fallback safety removal for animation (in case audio fails or is super long)
            // But we don't want to remove the ELEMENT on timeout, just stop talking.
            // USER REQUEST UPDATE: Remove timer, rely on audio end.
            // Keeping a very long safety just directly in case of error, or logic can remain.
            // Actually user said explicitly "not on a timer".
            // We will trust onended.
        });
    }

    // --- PHYSICS APPLE (Home Page) ---
    const apple = document.querySelector('.physics-apple');
    const appleTree = document.querySelector('.apple-tree');

    if (apple && appleTree) {
        let appleClicks = 0;

        appleTree.addEventListener('click', () => {
            appleClicks++;
            if (appleClicks === 3) {
                startApplePhysics();
            }
        });

        function startApplePhysics() {
            apple.style.display = 'block';

            // Physics State
            let state = {
                x: window.innerWidth / 2 + window.scrollX,
                y: window.innerHeight / 2 + window.scrollY,
                vx: 0,
                vy: 0,
                angle: 0,
                angularVelocity: 0,
                isDragging: false,
                lastMouseX: 0,
                lastMouseY: 0,
                lastTime: 0,
                velocityTracker: [],
                thrownFromLeft: false
            };

            // Recovery Click Handler
            const basketBtn = document.querySelector('.basket-bottom');
            if (basketBtn) {
                basketBtn.addEventListener('click', (e) => {
                    if (basketBtn.classList.contains('basket-recoverable')) {
                        e.stopPropagation(); // prevent other clicks
                        state.vy = -20; // Pop Up
                        state.vx = (Math.random() - 0.5) * 20; // Random Side
                        state.y -= 20; // Lift up
                        state.angularVelocity = (Math.random() - 0.5) * 0.5;

                        basketBtn.classList.remove('basket-recoverable');
                        console.log("Recovered Apple");
                    }
                });
            }

            // Constants
            const GRAVITY = 0.5;
            const BOUNCE = 0.7; // Energy retained after bounce
            const FRICTION = 0.99; // Air resistance
            const THROW_FORCE = 15; // Multiplier for throw velocity (tuned for time-based calc)
            const ROTATION_SENSITIVITY = 1.5; // How much it spins when thrown
            const ANGULAR_FRICTION = 0.98; // Spin slows down over time

            // Drag Handlers
            apple.addEventListener('mousedown', (e) => {
                state.isDragging = true;
                state.vx = 0;
                state.vy = 0;
                state.angularVelocity = 0;
                state.lastMouseX = e.pageX;
                state.lastMouseY = e.pageY;
                state.lastTime = performance.now();
                state.velocityTracker = [{ x: e.pageX, y: e.pageY, time: performance.now() }];
                e.preventDefault(); // Prevent text selection
            });

            window.addEventListener('mousemove', (e) => {
                if (state.isDragging) {
                    const now = performance.now();
                    const dt = now - state.lastTime;

                    // Move apple directly (Absolute Position)
                    state.x = e.pageX - (apple.offsetWidth / 2);
                    state.y = e.pageY - (apple.offsetHeight / 2);

                    // Track position for throw calculation
                    state.velocityTracker.push({
                        x: e.pageX,
                        y: e.pageY,
                        time: now
                    });

                    // Keep only last 100ms
                    state.velocityTracker = state.velocityTracker.filter(p => now - p.time < 100);

                    // Calculate throw velocity based on mouse movement speed (Instantaneous for rotation)
                    if (dt > 0) {
                        const dx = e.pageX - state.lastMouseX;
                        // Spin based on horizontal movement
                        state.angularVelocity = dx * ROTATION_SENSITIVITY;
                    }

                    state.lastMouseX = e.pageX;
                    state.lastMouseY = e.pageY;
                    state.lastTime = now;
                }
            });

            window.addEventListener('mouseup', () => {
                if (state.isDragging) {
                    state.isDragging = false;

                    // Check Throw Origin (Left Half)
                    state.thrownFromLeft = (state.lastMouseX < (window.innerWidth / 2));

                    // Calculate final release velocity from tracker
                    const now = performance.now();
                    // Filter again to be sure
                    const recentPoints = state.velocityTracker.filter(p => now - p.time < 100);

                    if (recentPoints.length > 1) {
                        const first = recentPoints[0];
                        const last = recentPoints[recentPoints.length - 1];
                        const dt = last.time - first.time;

                        if (dt > 0) {
                            state.vx = ((last.x - first.x) / dt) * THROW_FORCE;
                            state.vy = ((last.y - first.y) / dt) * THROW_FORCE;
                        } else {
                            state.vx = 0;
                            state.vy = 0;
                        }
                    } else {
                        // Not enough data (stationary hold)
                        state.vx = 0;
                        state.vy = 0;
                    }
                }
            });

            // Loop
            function updatePhysics() {
                if (!state.isDragging) {
                    // Apply Forces
                    state.vy += GRAVITY;

                    // Check for Basket Success (Debug)
                    const basketBottom = document.querySelector('.basket-bottom');
                    const eggCount = parseInt(sessionStorage.getItem('eggUnlockCounter') || '0');

                    if (basketBottom) {
                        const appleRect = apple.getBoundingClientRect();
                        const basketRect = basketBottom.getBoundingClientRect();

                        // Simple AABB Intersection
                        if (appleRect.left < basketRect.right &&
                            appleRect.right > basketRect.left &&
                            appleRect.top < basketRect.bottom &&
                            appleRect.bottom > basketRect.top) {

                            // Check if apple is "behind" (visually covered)
                            if (!apple.dataset.basketEnterTime) {
                                // Start Timer
                                apple.dataset.basketEnterTime = Date.now();
                            } else {
                                // Check Elapsed Time
                                const elapsed = Date.now() - parseInt(apple.dataset.basketEnterTime);
                                if (elapsed > 3000) {
                                    // Success! (Must be thrown from left AND 5 eggs collected)
                                    if (!apple.dataset.successTriggered && state.thrownFromLeft && eggCount >= 5) {
                                        alert("Success! (Debug)");
                                        apple.dataset.successTriggered = "true";
                                    }
                                }
                            }

                            // Enable Recovery Mode (Visual)
                            if (!basketBottom.classList.contains('basket-recoverable')) {
                                basketBottom.classList.add('basket-recoverable');
                            }
                        } else {
                            // Reset Timer if leaves area
                            delete apple.dataset.basketEnterTime;

                            // Disable Recovery Mode
                            basketBottom.classList.remove('basket-recoverable');
                        }
                    } else {
                        // Reset if basket closes
                        delete apple.dataset.basketEnterTime;
                        apple.dataset.successTriggered = "";
                        // Disable Recovery Mode
                        if (basketBottom) basketBottom.classList.remove('basket-recoverable');
                    }
                    state.vx *= FRICTION;
                    state.vy *= FRICTION;

                    // Apply Rotation
                    state.angle += state.angularVelocity;
                    state.angularVelocity *= ANGULAR_FRICTION;

                    state.x += state.vx;
                    state.y += state.vy;


                    // Layer Switching: If apple falls below the tree, bring it to front (z=15)
                    // We check if the apple's Y (absolute) is below the tree's bottom
                    const treeBounds = appleTree.getBoundingClientRect();
                    const treeBottomAbsolute = treeBounds.bottom + window.scrollY;

                    if (state.y > (treeBottomAbsolute - 50)) {
                        apple.style.zIndex = "15"; // Between Tree (10) and Basket (20)
                    }

                    // Collisions with Document Bounds (Absolute)
                    const docWidth = document.documentElement.scrollWidth;
                    const docHeight = document.documentElement.scrollHeight;

                    const bounds = {
                        left: 0,
                        right: docWidth - apple.offsetWidth,
                        top: 0,
                        bottom: docHeight - apple.offsetHeight
                    };

                    if (state.y > bounds.bottom) {
                        state.y = bounds.bottom;
                        state.vy *= -BOUNCE;
                        if (Math.abs(state.vy) < GRAVITY * 2) state.vy = 0;

                        // Rolling Friction (Influence Rotation)
                        // Moving Right (+Vx) -> Spin Clockwise (+Angular)
                        // Moving Left (-Vx) -> Spin Counter-Clockwise (-Angular)
                        state.angularVelocity += state.vx * 0.1;
                    }
                    if (state.y < bounds.top) {
                        state.y = bounds.top;
                        state.vy *= -BOUNCE;
                    }
                    if (state.x > bounds.right) {
                        state.x = bounds.right;
                        state.vx *= -BOUNCE;
                    }
                    if (state.x < bounds.left) {
                        state.x = bounds.left;
                        state.vx *= -BOUNCE;
                    }

                    // Collisions with Solid Objects (OBB - Oriented Bounding Box)
                    const solidObjects = document.querySelectorAll('.solid-object');

                    // Treat apple as a circle for smoother collision against corners
                    const appleRadius = apple.offsetWidth / 2;
                    const appleCenterX = state.x + appleRadius;
                    const appleCenterY = state.y + appleRadius;

                    solidObjects.forEach(obj => {
                        const rect = obj.getBoundingClientRect();

                        // NOTE: getBoundingClientRect gives the *axis-aligned* box of the rotated element.
                        // We need the center, size, and rotation to reconstruct the OBB.
                        // However, finding the exact center of the OBB from the AABB is tricky if we don't know the unrotated size.
                        // A better approach is to rely on the CSS width/height and manual offset calculation, 
                        // OR (simpler for this case) assume the center of the AABB is the center of the OBB (true for center-rotated elements)

                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;

                        // Parse Rotation
                        const style = window.getComputedStyle(obj);
                        let angle = 0;

                        // Try 'rotate' property first (modern)
                        const rotateProp = style.rotate;
                        if (rotateProp && rotateProp !== 'none') {
                            // simplistic parse: assumes "15deg" or similar 
                            angle = parseFloat(rotateProp) * (Math.PI / 180);
                        } else {
                            // Fallback to transform matrix
                            const transform = style.transform;
                            if (transform && transform !== 'none') {
                                const values = transform.split('(')[1].split(')')[0].split(',');
                                const a = parseFloat(values[0]);
                                const b = parseFloat(values[1]);
                                angle = Math.atan2(b, a);
                            }
                        }

                        // Dimensions (Unrotated)
                        // We assume the offsetWidth/Height are the unrotated dimensions
                        const halfW = obj.offsetWidth / 2;
                        const halfH = obj.offsetHeight / 2;

                        // 1. Transform Apple Center Phase -> Object Local Space
                        // Translate
                        let dx = appleCenterX - centerX;
                        let dy = appleCenterY - centerY;

                        // Rotate (Counter-rotate by object angle)
                        // x' = x*cos(-a) - y*sin(-a)
                        // y' = x*sin(-a) + y*cos(-a)
                        // cos(-a) = cos(a), sin(-a) = -sin(a)
                        const cos = Math.cos(angle);
                        const sin = Math.sin(angle);

                        const localX = dx * cos + dy * sin;
                        const localY = -dx * sin + dy * cos;

                        // 2. Find Closest Point in Local Space (AABB clamping)
                        // Clamp localX between -halfW and halfW
                        const closestX = Math.max(-halfW, Math.min(localX, halfW));
                        const closestY = Math.max(-halfH, Math.min(localY, halfH));

                        // 3. Distance Check
                        const distX = localX - closestX;
                        const distY = localY - closestY;
                        const distanceSquared = (distX * distX) + (distY * distY);

                        if (distanceSquared < (appleRadius * appleRadius)) {
                            // COLLISION DETECTED

                            const distance = Math.sqrt(distanceSquared);

                            // Normal in Local Space
                            let normalX, normalY;

                            if (distance > 0) {
                                normalX = distX / distance;
                                normalY = distY / distance;
                            } else {
                                // Center is inside the rect exactly (rare, deep penetration)
                                // Push out to nearest edge
                                // (Simplification: just push up localY)
                                normalX = 0;
                                normalY = -1;
                            }

                            // 4. Transform Normal & Correction back to World Space
                            // Rotate normal by +angle
                            const worldNormalX = normalX * cos - normalY * sin;
                            const worldNormalY = normalX * sin + normalY * cos;

                            // Resolve Position (Push out)
                            const overlap = appleRadius - distance;
                            state.x += worldNormalX * overlap;
                            state.y += worldNormalY * overlap;

                            // Update velocity (Reflect)
                            // v' = v - 2 * (v . n) * n
                            const dotProd = state.vx * worldNormalX + state.vy * worldNormalY;

                            // Only bounce if moving INTO the wall
                            if (dotProd < 0) {
                                const oldVx = state.vx;

                                state.vx = (state.vx - 2 * dotProd * worldNormalX) * BOUNCE;
                                state.vy = (state.vy - 2 * dotProd * worldNormalY) * BOUNCE;

                                // Add Rotation based on horizontal impact
                                // Rule: Bouncing Left (Negative Impulse) -> Counter-Clockwise Spin (Negative Angle change)
                                //       Bouncing Right (Positive Impulse) -> Clockwise Spin (Positive Angle change)
                                const deltaVx = state.vx - oldVx;
                                state.angularVelocity += deltaVx * 1.5;
                            }
                        }
                    });
                }


                apple.style.left = `${state.x}px`;
                apple.style.top = `${state.y}px`;

                // Calculate Distance Scaling
                const distToOrigin = Math.sqrt(state.x * state.x + state.y * state.y);
                const maxDist = window.innerWidth * 0.8;
                let scale = distToOrigin / maxDist;
                scale = Math.max(0.5, Math.min(1.0, scale));

                apple.style.transform = `rotate(${state.angle}deg) scale(${scale})`;

                requestAnimationFrame(updatePhysics);
            }

            // Init
            const treeRect = appleTree.getBoundingClientRect();
            // Start centered in the tree, slightly up
            state.x = treeRect.left + (treeRect.width / 2) - (apple.offsetWidth / 2);
            state.y = treeRect.top + (treeRect.height / 3);

            // Set initial state behind tree
            apple.style.zIndex = "1";
            apple.style.display = 'block'; // Make visible (but behind)

            updatePhysics();
        }
    }
});

// --- AUDIO MIXER (Lessons Page) ---
document.addEventListener('DOMContentLoaded', () => {
    // Map classes to audio files
    const mixerConfig = [
        { selector: '.djembe-img', file: 'audioFiles/lessonsAudio/lessonsPerc.wav', name: 'Perc' },
        { selector: '.piano-img', file: 'audioFiles/lessonsAudio/lessonsPiano.wav', name: 'Piano' },
        { selector: '.bass-img', file: 'audioFiles/lessonsAudio/lessonsBass.wav', name: 'Bass' },
        { selector: '.guitar-img', file: 'audioFiles/lessonsAudio/lessonsGuitar.wav', name: 'Guitar' },
        { selector: '.microphone-img', file: 'audioFiles/lessonsAudio/lessonsVoice.wav', name: 'Voice' }
    ];

    // Check if we are on the lessons page
    const firstInstrument = document.querySelector(mixerConfig[0].selector);

    if (firstInstrument) {
        let audioContext = null;
        let globalStartTime = 0;
        let isPlaying = false;
        let loopDuration = 0;
        const tracks = []; // Stores { buffer, source, gainNode, config }

        // Lessons Egg State
        let activeSequence = [];
        let lessonsEggTimer = null;
        const correctSequence = ['Perc', 'Bass', 'Piano', 'Guitar', 'Voice'];

        // Setup Audio Context (Must happen on user gesture)
        const initAudio = async () => {
            if (audioContext) return;
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();

            // Load all buffers
            await Promise.all(mixerConfig.map(async (cfg) => {
                try {
                    const response = await fetch(cfg.file);
                    const arrayBuffer = await response.arrayBuffer();
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                    tracks.push({
                        config: cfg,
                        buffer: audioBuffer,
                        source: null,
                        gainNode: null,
                        active: false,
                        element: document.querySelector(cfg.selector)
                    });

                    // Set loop duration based on the first track (assumed equal)
                    if (cfg.name === 'Perc') {
                        loopDuration = audioBuffer.duration;
                    }
                } catch (err) {
                    console.error("Failed to load audio: " + cfg.name, err);
                }
            }));
        };

        // Playback Engine
        const startPlayback = () => {
            // Create nodes
            const now = audioContext.currentTime;
            // Add a small delay to ensure all start exactly together
            globalStartTime = now + 0.1;

            tracks.forEach(track => {
                track.source = audioContext.createBufferSource();
                track.source.buffer = track.buffer;
                track.source.loop = true;

                track.gainNode = audioContext.createGain();
                // Start muted (gain 0) unless it's the one we just clicked (handled in toggle)
                track.gainNode.gain.setValueAtTime(0, now);

                track.source.connect(track.gainNode);
                track.gainNode.connect(audioContext.destination);

                track.source.start(globalStartTime);
            });

            isPlaying = true;
        };

        const toggleTrack = async (targetSelector) => {
            // Initialize if first click
            if (!audioContext) {
                await initAudio();
                startPlayback();
            } else if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            const track = tracks.find(t => t.config.selector === targetSelector);
            if (!track) return;

            const now = audioContext.currentTime;

            if (track.active) {
                // TURN OFF
                // Instant mute (with tiny fade to avoid click)
                track.gainNode.gain.cancelScheduledValues(now);
                track.gainNode.gain.setTargetAtTime(0, now, 0.05); // Rapid decay

                track.active = false;
                track.element.classList.remove('active-instrument');

                // --- Egg Logic (OFF) ---
                activeSequence = activeSequence.filter(name => name !== track.config.name);
                if (lessonsEggTimer) {
                    clearTimeout(lessonsEggTimer);
                    lessonsEggTimer = null;
                    console.log("Lessons Egg Timer: Cancelled (Instrument removed)");
                }

            } else {
                // TURN ON
                track.active = true;

                // --- Egg Logic (ON) ---
                activeSequence.push(track.config.name);

                // Check Sequence
                // We want exact match of the correctSequence in activeSequence
                const isCorrectOrder = activeSequence.length === correctSequence.length &&
                    activeSequence.every((val, index) => val === correctSequence[index]);

                if (isCorrectOrder) {
                    console.log("Lessons Egg Timer: Started (4s)...");
                    lessonsEggTimer = setTimeout(() => {
                        unlockEgg('lessonsEggStatus');
                        console.log("Lessons Egg Status: TRUE");
                    }, 4000);
                } else if (activeSequence.length > correctSequence.length) {
                    // Should be impossible if max is 5, but safe guard
                    if (lessonsEggTimer) {
                        clearTimeout(lessonsEggTimer);
                        lessonsEggTimer = null;
                    }
                } else {
                    // Not complete yet or wrong order, ensure timer is clear if it was somehow running
                    if (lessonsEggTimer) {
                        clearTimeout(lessonsEggTimer);
                        lessonsEggTimer = null;
                    }
                }

                // Sync Logic
                // Next loop time = Start + (Duration * ceil((Now - Start) / Duration))
                const elapsedTime = now - globalStartTime;
                const currentLoopIndex = Math.floor(elapsedTime / loopDuration);
                const nextLoopStart = globalStartTime + ((currentLoopIndex + 1) * loopDuration);

                // If we are very close to start (e.g. first click), just start now?
                // Actually, for the very first click (initializing system), we want immediate sound.
                // We can detect this by checking if elapsedTime is negative or very small.

                if (elapsedTime < 0.2) {
                    // Immediate start
                    track.gainNode.gain.setTargetAtTime(1, now, 0.05);
                    track.element.classList.add('active-instrument');
                } else {
                    // Delayed Unmute
                    track.gainNode.gain.cancelScheduledValues(now);
                    track.gainNode.gain.setValueAtTime(0, now); // ensuring
                    track.gainNode.gain.setValueAtTime(1, nextLoopStart);

                    // Visual Sync
                    const delayMs = (nextLoopStart - now) * 1000;
                    setTimeout(() => {
                        if (track.active) { // Check if user didn't cancel
                            track.element.classList.add('active-instrument');
                        }
                    }, delayMs);
                }
            }
        };

        // Attach Listeners
        mixerConfig.forEach(cfg => {
            const el = document.querySelector(cfg.selector);
            if (el) {
                el.style.cursor = 'pointer';
                el.addEventListener('click', () => toggleTrack(cfg.selector));
            }
        });
    }
});


// Listen Page Interaction
document.addEventListener('DOMContentLoaded', () => {
    const duckGrapes = document.querySelector('.duck-grapes-img'); // Wrapper div
    const popupContainer = document.querySelector('.dynamic-popup'); // Wrapper div
    const popupImage = document.getElementById('popupImage');

    if (duckGrapes && popupContainer && popupImage) {
        duckGrapes.style.cursor = 'pointer';
        // Ensure clicks register if overlays interfere
        duckGrapes.style.pointerEvents = 'auto';

        duckGrapes.addEventListener('click', () => {
            // Prevent spamming if already animating
            if (popupContainer.classList.contains('popup-animate')) return;

            const rand = Math.random();
            let imageSrc = '';

            // Grapes: 45% (0 - 0.45)
            // Glue: 35% (0.45 - 0.80)
            // Lemonade: 20% (0.80 - 1.00)

            if (rand < 0.45) {
                imageSrc = 'images/Listen/grapes.png';
                console.log("Rolled: Grapes");
            } else if (rand < 0.80) {
                imageSrc = 'images/Listen/glue.png';
                console.log("Rolled: Glue");
            } else {
                imageSrc = 'images/Listen/lemonade.png';
                console.log("Rolled: Lemonade (Egg Unlocked)");

                // Unlock Listen Egg
                unlockEgg('listenEggStatus');
            }

            // Play Animation on CONTAINER
            popupImage.src = imageSrc;
            popupContainer.classList.add('popup-animate');

            // Reset after animation (2.0s)
            setTimeout(() => {
                popupContainer.classList.remove('popup-animate');
                popupImage.src = '';
            }, 2000);
        });
    }
});


// Check Watch Egg Status on Load
// Check Egg Status on Load and Assign Slots
document.addEventListener('DOMContentLoaded', () => {
    const eggs = [
        { key: 'shopEggStatus', element: document.querySelector('.shop-egg') },
        { key: 'lessonsEggStatus', element: document.querySelector('.lessons-egg') },
        { key: 'contactEggStatus', element: document.querySelector('.contact-egg') },
        { key: 'listenEggStatus', element: document.querySelector('.listen-egg') },
        { key: 'watchEggStatus', element: document.querySelector('.watch-egg') }
    ];

    // Filter unlocked eggs and get their order
    const unlockedEggs = eggs.filter(egg => {
        const val = sessionStorage.getItem(egg.key);
        if (val) {
            egg.order = parseInt(val);
            return true;
        }
        return false;
    });

    // Sort by order (1, 2, 3...)
    unlockedEggs.sort((a, b) => a.order - b.order);

    // Assign Slots
    unlockedEggs.forEach((egg, index) => {
        if (egg.element) {
            const slotFn = index + 1; // 1-based slot
            egg.element.style.display = 'block';
            egg.element.classList.add(`egg-slot-${slotFn}`);
            // console.log(`Assigned ${egg.key} (Order ${egg.order}) to Slot ${slotFn}`);
        }
    });
    // Check for Basket Update (5 Eggs)
    updateBasketState();
});

// Helper to Unlock Eggs
function unlockEgg(key) {
    if (!sessionStorage.getItem(key)) {
        let count = parseInt(sessionStorage.getItem('eggUnlockCounter') || '0') + 1;
        sessionStorage.setItem('eggUnlockCounter', count);
        sessionStorage.setItem(key, count);
        console.log(`${key} Unlocked! Order: ${count}`);

        // Check if we hit 5
        updateBasketState();
    }
}

// Function to check egg count and update basket z-index
function updateBasketState() {
    const count = parseInt(sessionStorage.getItem('eggUnlockCounter') || '0');
    if (count >= 5) {
        console.log("All 5 Eggs Collected! (Ready for Success Trigger)");
    }
}
