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
                <p>Raised in classical and choral traditions, Ninaad spent 15 years honing his skills on the piano and voice until beginning his studies at The Berklee College of Music. There, he developed an advanced understanding of music theory and composition as well as audio engineering through his double major in Film Scoring and Music Production/Engineering. During this time he picked up the Bass Guitar and developed a love for Funk and Jazz styles. He spent his life both as a student and teacher, mentoring younger students in his choir and developing piano and guitar skills in others around his community.</p>
                <p class="teacher-name" style="text-align:left;">Anderson Jno Baptiste</p>
                <img src="images/Lessons/Andy.png" alt="Anderson Headshot" style="width:150px;height:150px;float:left;margin-right:15px;margin-bottom:10px;">
                <p>Raised in classical and choral traditions, Ninaad spent 15 years honing his skills on the piano and voice until beginning his studies at The Berklee College of Music. There, he developed an advanced understanding of music theory and composition as well as audio engineering through his double major in Film Scoring and Music Production/Engineering. During this time he picked up the Bass Guitar and developed a love for Funk and Jazz styles. He spent his life both as a student and teacher, mentoring younger students in his choir and developing piano and guitar skills in others around his community.</p>
            </div>
            <div>
                <p class="teacher-name" style="text-align:right;">Jacob Winthrop</p>
                <img src="images/Lessons/Jacob.png" alt="Jacob Headshot" style="width:150px;height:150px;float:right;margin-left:15px;margin-bottom:10px;">
                <p>Raised in classical and choral traditions, Ninaad spent 15 years honing his skills on the piano and voice until beginning his studies at The Berklee College of Music. There, he developed an advanced understanding of music theory and composition as well as audio engineering through his double major in Film Scoring and Music Production/Engineering. During this time he picked up the Bass Guitar and developed a love for Funk and Jazz styles. He spent his life both as a student and teacher, mentoring younger students in his choir and developing piano and guitar skills in others around his community.</p>
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
            // Check if hovered for at least 4 seconds (4000ms)
            if (hoverStartTime > 0 && (Date.now() - hoverStartTime >= 4000)) {
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
                console.log("Another Egg");
            }
        });
    }
});

function triggerSecretAnimation() {
    console.log("Radical");
    const skaterFlatDiv = document.querySelector('.skater-flat');
    const skaterImg = skaterFlatDiv ? skaterFlatDiv.querySelector('img') : null;

    if (skaterFlatDiv && skaterImg) {
        // Preload images
        const imgUp = new Image(); imgUp.src = "images/Watch/skaterUp.png";
        const imgDown = new Image(); imgDown.src = "images/Watch/skaterDown.png";
        const imgFlat = new Image(); imgFlat.src = "images/Watch/skaterFlat.png";

        // Select existing police car element
        const policeCarDiv = document.querySelector('.police-car');

        // Start movement for skater
        skaterFlatDiv.style.transform = "translate(-1400%, 0%)";

        // Start movement for police car with a delay
        if (policeCarDiv) {
            setTimeout(() => {
                policeCarDiv.style.transform = "translate(-1200%, 0%)";

                // Trigger wheelie animation
                const policeCarImg = policeCarDiv.querySelector('img');
                if (policeCarImg) {
                    policeCarImg.classList.add('wheelie-anim');
                }
            }, 2000); // 0.5s delay to follow
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

document.addEventListener('DOMContentLoaded', () => {
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
    // Simple CSS hover effects are handled in styles.css
    // No complex JS required for this feature as per user request.

    // --- CONTACT PAGE INTERACTION ---
    const holaBtn = document.querySelector('.hola-btn');
    const cardinalHead = document.querySelector('.cardinal-head-contact');

    if (holaBtn && cardinalHead) {
        // Configuration: Add your file names here as you drop them in the folder
        const spanishFiles = [
            'audioFiles/audioSpanish/pluribusCabron.wav'
        ];

        holaBtn.addEventListener('click', () => {
            // 1. Play Random Audio
            const randomFile = spanishFiles[Math.floor(Math.random() * spanishFiles.length)];
            // DEBUG: Alert user what file is being tried
            // alert('Trying to play: ' + randomFile); 

            const audio = new Audio(randomFile);

            audio.play().catch(err => {
                console.log('Audio missing or blocked:', err);
                alert('Audio Error: ' + err.message + '\nFile: ' + randomFile);
            });

            // 2. Animate Head (Talk)
            cardinalHead.classList.add('talking');

            // Stop animation after a set time (e.g., 2 seconds) or when audio ends
            // Ideally we use audio.onended but if file fails we need a fallback
            audio.onended = () => {
                cardinalHead.classList.remove('talking');
            };

            // Fallback safety removal
            setTimeout(() => {
                cardinalHead.classList.remove('talking');
            }, 3000); // 3 seconds max talk time
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
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                vx: 0,
                vy: 0,
                angle: 0,
                angularVelocity: 0,
                isDragging: false,
                lastMouseX: 0,
                lastMouseY: 0,
                lastTime: 0,
                velocityTracker: []
            };

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
                state.lastMouseX = e.clientX;
                state.lastMouseY = e.clientY;
                state.lastTime = performance.now();
                state.velocityTracker = [{ x: e.clientX, y: e.clientY, time: performance.now() }];
                e.preventDefault(); // Prevent text selection
            });

            window.addEventListener('mousemove', (e) => {
                if (state.isDragging) {
                    const now = performance.now();
                    const dt = now - state.lastTime;

                    // Move apple directly
                    state.x = e.clientX - (apple.offsetWidth / 2);
                    state.y = e.clientY - (apple.offsetHeight / 2);

                    // Track position for throw calculation
                    state.velocityTracker.push({
                        x: e.clientX,
                        y: e.clientY,
                        time: now
                    });

                    // Keep only last 100ms
                    state.velocityTracker = state.velocityTracker.filter(p => now - p.time < 100);

                    // Calculate throw velocity based on mouse movement speed (Instantaneous for rotation)
                    if (dt > 0) {
                        const dx = e.clientX - state.lastMouseX;
                        // Spin based on horizontal movement
                        state.angularVelocity = dx * ROTATION_SENSITIVITY;
                    }

                    state.lastMouseX = e.clientX;
                    state.lastMouseY = e.clientY;
                    state.lastTime = now;
                }
            });

            window.addEventListener('mouseup', () => {
                if (state.isDragging) {
                    state.isDragging = false;

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
                    state.vx *= FRICTION;
                    state.vy *= FRICTION;

                    // Apply Rotation
                    state.angle += state.angularVelocity;
                    state.angularVelocity *= ANGULAR_FRICTION;

                    state.x += state.vx;
                    state.y += state.vy;


                    // Layer Switching: If apple falls below the tree, bring it to front
                    // We check if the apple's top is below the tree's bottom (with some buffer)
                    // The tree is static, so we can check bounds again or cache them.
                    const treeBounds = appleTree.getBoundingClientRect();
                    if (state.y > (treeBounds.bottom - 50)) {
                        apple.style.zIndex = "1000";
                    }

                    // Collisions with Window Bounds
                    const bounds = {
                        left: 0,
                        right: window.innerWidth - apple.offsetWidth,
                        top: 0,
                        bottom: window.innerHeight - apple.offsetHeight
                    };

                    if (state.y > bounds.bottom) {
                        state.y = bounds.bottom;
                        state.vy *= -BOUNCE;
                        if (Math.abs(state.vy) < GRAVITY * 2) state.vy = 0;
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
                                state.vx = (state.vx - 2 * dotProd * worldNormalX) * BOUNCE;
                                state.vy = (state.vy - 2 * dotProd * worldNormalY) * BOUNCE;
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

