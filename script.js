// ==========================================
// SPA ARCHITECTURE & GLOBAL INITIALIZATION
// ==========================================

const GlobalAudioPlayer = {
    audioUnlocked: false,
    playlist: [
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
    ],
    currentIndex: 0,
    defaultVolume: 0.55,
    isPlaying: false,
    audio: new Audio(),
    ctx: null,
    source: null,
    gainNode: null,
    sfxBuffers: new Map(), // Cache for decoded audio

    init() {
        this.audio.preload = 'none';
        this.audio.src = this.playlist[this.currentIndex];
        this.audio.volume = 1.0;

        // Auto-play next track
        this.audio.addEventListener('ended', () => {
            this.playNext();
        });

        // Global Unlock & Web Audio Init
        const unlock = () => {
            // Ensure context exists
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext && !this.ctx) {
                this.ctx = new AudioContext();
                this.gainNode = this.ctx.createGain();
                this.gainNode.gain.setValueAtTime(this.defaultVolume, this.ctx.currentTime);
                this.gainNode.connect(this.ctx.destination);

                // Main Music Source
                this.source = this.ctx.createMediaElementSource(this.audio);
                this.source.connect(this.gainNode);
            }

            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }

            this.audioUnlocked = true;
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('keydown', unlock);
        };
        document.addEventListener('click', unlock);
        document.addEventListener('touchstart', unlock);
        document.addEventListener('keydown', unlock);
    },

    // --- SFX SYSTEM ---
    async preloadSfx(urls) {
        if (!window.AudioContext && !window.webkitAudioContext) return;

        // Ensure ctx is ready (silent init if needed logic could go here, 
        // but typically we wait for user interaction. Preloading can happen before interaction if we don't need to decode immediately?
        // Actually decodeAudioData needs a context. If we don't have one, we can't decode.
        // We'll create a temporary context or just wait. 
        // Better: Create the context immediately but suspended? 
        // Browsers allow creating context before gesture, just not playing.

        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
                this.gainNode = this.ctx.createGain();
                this.gainNode.gain.setValueAtTime(this.defaultVolume, this.ctx.currentTime);
                this.gainNode.connect(this.ctx.destination);

                this.source = this.ctx.createMediaElementSource(this.audio);
                this.source.connect(this.gainNode);
            }
        }
        if (!this.ctx) return;

        await Promise.all(urls.map(async url => {
            if (this.sfxBuffers.has(url)) return;
            try {
                const res = await fetch(url);
                const ab = await res.arrayBuffer();
                const buffer = await this.ctx.decodeAudioData(ab);
                this.sfxBuffers.set(url, buffer);
            } catch (e) {
                console.error("Failed to preload SFX:", url, e);
            }
        }));
    },

    playSfx(url) {
        if (!this.ctx) this.init(); // Try init
        if (!this.ctx) return null;

        if (this.ctx.state === 'suspended') this.ctx.resume();

        const buffer = this.sfxBuffers.get(url);
        if (!buffer) {
            console.warn("SFX not preloaded, playing via legacy (or fetching now):", url);
            // Fallback: Fetch and play immediately (async)
            this.preloadSfx([url]).then(() => {
                const b = this.sfxBuffers.get(url);
                if (b) this.playBuffer(b);
            });
            return null; // Return null as we can't return control immediately
        }

        return this.playBuffer(buffer);
    },

    playBuffer(buffer) {
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.value = 1.0;

        source.connect(gain);
        gain.connect(this.ctx.destination);

        source.start(0);

        // Wrapper to mimic legacy Audio element for fading/stopping
        return {
            source,
            gain,
            stop: () => {
                try { source.stop(); } catch (e) { }
            },
            fadeTo: (vol, ms) => {
                const now = this.ctx.currentTime;
                gain.gain.cancelScheduledValues(now);
                gain.gain.setValueAtTime(gain.gain.value, now);
                gain.gain.linearRampToValueAtTime(vol, now + (ms / 1000));
            },
            // Mock onended for compatibility? 
            // The browser fires 'ended' on source. We can expose it.
            set onended(cb) { source.onended = cb; }
        };
    },


    togglePlay() {
        if (this.isPlaying) {
            // Fade out then pause to prevent clicks
            const FADE_MS = 150;
            const EPSILON = 0.0001;

            this.isPlaying = false;
            this.updateUI();

            if (this.ctx && this.gainNode) {
                const now = this.ctx.currentTime;
                this.gainNode.gain.cancelScheduledValues(now);
                this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
                this.gainNode.gain.exponentialRampToValueAtTime(EPSILON, now + (FADE_MS / 1000));

                setTimeout(() => {
                    this.audio.pause();
                    // Leave gain at EPSILON - will restore when playing
                }, FADE_MS + 50);
            } else {
                this.audio.pause();
            }
        } else {
            // EXCLUSIVITY: Stop Lessons Mixer
            if (typeof GlobalMixer !== 'undefined' && GlobalMixer.isActive()) {
                GlobalMixer.stopAll();
            }
            // Ensure context is running
            if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();

            // Restore gain (pause leaves it at EPSILON)
            if (this.ctx && this.gainNode) {
                this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
                this.gainNode.gain.setValueAtTime(this.defaultVolume, this.ctx.currentTime);
            }

            this.audio.play()
                .then(() => {
                    this.isPlaying = true;
                    this.updateUI();
                })
                .catch(e => {
                    console.error("Playback failed:", e);
                });
        }
    },

    stop() {
        if (!this.isPlaying) return;

        const FADE_MS = 150;
        const EPSILON = 0.0001;

        this.isPlaying = false;
        this.updateUI();

        if (this.ctx && this.gainNode) {
            const now = this.ctx.currentTime;
            this.gainNode.gain.cancelScheduledValues(now);
            this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
            this.gainNode.gain.exponentialRampToValueAtTime(EPSILON, now + (FADE_MS / 1000));

            setTimeout(() => {
                this.audio.pause();
                // Leave gain at EPSILON - will restore when playing
            }, FADE_MS + 50);
        } else {
            this.audio.pause();
        }
    },

    setVolume(vol) {
        if (this.ctx && this.gainNode) {
            this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
            this.gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
        } else {
            // Fallback if not initialized
            this.audio.volume = vol;
        }
    },

    playNext(manualSkip = false) {
        // If auto-play (not manual) and at end, stop.
        if (!manualSkip && this.currentIndex === this.playlist.length - 1) {
            this.stop();
            this.currentIndex = 0; // Reset to start
            this.audio.src = this.playlist[0];
            return;
        }

        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        this.audio.src = this.playlist[this.currentIndex];

        if (this.isPlaying) {
            // Ensure context is running
            if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
            this.audio.play().catch(e => console.error("Playback failed:", e));
        } else {
            // If we skip while paused, start playing
            if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
            this.audio.play().catch(e => console.error("Playback failed:", e));
            this.isPlaying = true;
        }
        this.updateUI();
    },

    fadeTo(targetVol, durationMs = 2000) {
        if (this.ctx && this.gainNode) {
            const now = this.ctx.currentTime;
            this.gainNode.gain.cancelScheduledValues(now);
            this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
            this.gainNode.gain.linearRampToValueAtTime(targetVol, now + (durationMs / 1000));
        } else {
            // Fallback (rare)
            this.audio.volume = targetVol;
        }
    },

    updateUI() {
        // Update any visuals currently in the DOM (Listen Page)
        const startStopBtn = document.querySelector('.start-stop-btn');
        const anims = document.querySelectorAll('.music-anim');

        if (startStopBtn) {
            if (this.isPlaying) {
                startStopBtn.classList.add('active-instrument');
            } else {
                startStopBtn.classList.remove('active-instrument');
            }
        }

        anims.forEach(anim => {
            if (this.isPlaying) {
                anim.classList.add('visible');
            } else {
                anim.classList.remove('visible');
            }
        });

        // Sync Home Indicators if on Home Page
        if (typeof PageManager !== 'undefined' && PageManager.syncHomeIndicators) {
            PageManager.syncHomeIndicators();
        }
    }

};

const GlobalMixer = {
    ctx: null,
    tracks: [],
    configs: [
        { s: '.djembe-img', f: 'audioFiles/lessonsAudio/lessonsPerc.wav', n: 'Perc' },
        { s: '.piano-img', f: 'audioFiles/lessonsAudio/lessonsPiano.wav', n: 'Piano' },
        { s: '.bass-img', f: 'audioFiles/lessonsAudio/lessonsBass.wav', n: 'Bass' },
        { s: '.guitar-img', f: 'audioFiles/lessonsAudio/lessonsGuitar.wav', n: 'Guitar' },
        { s: '.microphone-img', f: 'audioFiles/lessonsAudio/lessonsVoice.wav', n: 'Voice' }
    ],
    startT: 0,
    dur: 0,
    seq: [],
    timer: null,
    isInitialized: false,

    masterGain: null,

    fadeTo(targetVol, durationMs = 2000) {
        if (this.masterGain && this.ctx) {
            const now = this.ctx.currentTime;
            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
            this.masterGain.gain.linearRampToValueAtTime(targetVol, now + (durationMs / 1000));
        }
    },

    async init() {
        if (this.isInitialized) return;

        // Shared Context with GlobalAudioPlayer
        if (typeof GlobalAudioPlayer !== 'undefined' && GlobalAudioPlayer.ctx) {
            this.ctx = GlobalAudioPlayer.ctx;
        } else {
            // Fallback if accessed before GlobalAudioPlayer init (should be rare)
            const AC = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AC();
        }

        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);

        await Promise.all(this.configs.map(async c => {
            try {
                const r = await fetch(c.f);
                const b = await r.arrayBuffer();
                const ab = await this.ctx.decodeAudioData(b);
                this.tracks.push({
                    c,
                    b: ab,
                    s: null,
                    g: null,
                    a: false,
                    el: null
                });
                if (c.n === 'Perc') this.dur = ab.duration;
            } catch (e) {
                console.error("Failed to load mixer track", c.n, e);
            }
        }));

        this.isInitialized = true;
    },

    startP() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this.startT = now + 0.1;

        this.tracks.forEach(t => {
            t.s = this.ctx.createBufferSource();
            t.s.buffer = t.b;
            t.s.loop = true;
            t.g = this.ctx.createGain();
            t.g.gain.setValueAtTime(0, now);
            t.s.connect(t.g);
            t.g.connect(this.masterGain); // Connect to masterGain
            t.s.start(this.startT);
        });
    },

    stopAll() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        this.tracks.forEach(t => {
            if (t.a) {
                t.g.gain.setValueAtTime(0, now);
                t.a = false;
                if (t.el) t.el.classList.remove('active-instrument');
            }
        });
        this.seq = [];
        if (this.timer) { clearTimeout(this.timer); this.timer = null; }

        // Sync Home Indicators
        if (typeof PageManager !== 'undefined' && PageManager.syncHomeIndicators) {
            PageManager.syncHomeIndicators();
        }
    },


    isActive() {
        return this.tracks.some(t => t.a);
    },

    setMasterVolume(vol) {
        if (this.masterGain && this.ctx) {
            const now = this.ctx.currentTime;
            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
            this.masterGain.gain.linearRampToValueAtTime(vol, now + 0.1);
        }
    },

    async toggle(sel, unlockEggCallback) {
        if (!this.isInitialized) {
            await this.init();
            this.startP();
        } else if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        // EXCLUSIVITY: Stop Listen Audio if starting first instrument
        if (!this.isActive() && typeof GlobalAudioPlayer !== 'undefined' && GlobalAudioPlayer.isPlaying) {
            GlobalAudioPlayer.stop();
        }

        const t = this.tracks.find(x => x.c.s === sel);
        if (!t) return;
        const now = this.ctx.currentTime;

        // Find current DOM element if not updated (safety)
        if (!t.el || !document.contains(t.el)) {
            t.el = document.querySelector(t.c.s);
        }

        if (t.a) {
            // MUTE
            t.g.gain.setTargetAtTime(0, now, 0.05);
            t.a = false;
            if (t.el) t.el.classList.remove('active-instrument');

            this.seq = this.seq.filter(n => n !== t.c.n);
            if (this.timer) { clearTimeout(this.timer); this.timer = null; }
        } else {
            // UNMUTE
            t.a = true;
            this.seq.push(t.c.n);

            // Check Egg
            const cor = ['Perc', 'Bass', 'Piano', 'Guitar', 'Voice'];
            if (this.seq.length === cor.length && this.seq.every((v, i) => v === cor[i])) {
                this.timer = setTimeout(() => {
                    if (unlockEggCallback) unlockEggCallback('lessonsEggStatus');
                }, 4000);
            } else if (this.timer) { clearTimeout(this.timer); this.timer = null; }

            // Sync Logic
            const el = now - this.startT;
            const loops = Math.floor(el / this.dur);
            const next = this.startT + ((loops + 1) * this.dur);

            if (el < 0.2) {
                t.g.gain.setTargetAtTime(1, now, 0.05);
                if (t.el) t.el.classList.add('active-instrument');
            } else {
                t.g.gain.cancelScheduledValues(now);
                t.g.gain.setValueAtTime(0, now);
                t.g.gain.setValueAtTime(1, next);

                // Visual Delay
                setTimeout(() => {
                    if (t.a && t.el && document.body.contains(t.el)) {
                        t.el.classList.add('active-instrument');
                    }
                }, (next - now) * 1000);
            }
        }

        // Sync Home Indicators
        if (typeof PageManager !== 'undefined' && PageManager.syncHomeIndicators) {
            PageManager.syncHomeIndicators();
        }
    },


    // Bind UI elements on new page load
    bindUI(unlockEggCallback) {
        this.configs.forEach(c => {
            const el = document.querySelector(c.s);
            if (el) {
                el.style.cursor = 'pointer';
                el.onclick = () => this.toggle(c.s, unlockEggCallback);

                // Restore State
                const t = this.tracks.find(x => x.c.s === c.s);
                if (t) {
                    t.el = el; // Update ref
                    if (t.a) el.classList.add('active-instrument');
                    else el.classList.remove('active-instrument');
                }
            }
        });
    }
};

const SpaRouter = {
    init() {
        // Intercept internal links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link) {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !link.target && !href.startsWith('http')) {
                    e.preventDefault();
                    this.navigate(href);
                }
            }
        });

        // Handle Back/Forward
        window.addEventListener('popstate', () => {
            this.loadContent(window.location.href, false);
        });
    },

    navigate(url) {
        // Show Preloader Transition (fade to black)
        const transitionEl = document.querySelector('.page-transition');
        const loadingEggs = document.querySelector('.loading-eggs');
        if (transitionEl) transitionEl.classList.remove('hidden');

        // Reset eggs state and show them immediately (they start at opacity 0 via CSS)
        if (loadingEggs) {
            loadingEggs.classList.remove('fading-out', 'visible');
            loadingEggs.style.display = '';
        }

        // Start cleanup immediately
        PageManager.cleanup();

        // Start fetching content IMMEDIATELY (parallel with fade-out)
        const contentPromise = this.fetchContent(url);

        // Wait for fade-to-black to complete (0.3s CSS transition + buffer)
        const FADE_OUT_MS = 350;
        // Minimum time eggs should be visible (ensures animation is seen)
        const MIN_EGGS_DISPLAY_MS = 800;

        const eggsShownAt = Date.now();

        setTimeout(() => {
            // After fade-to-black, fade in the eggs
            if (loadingEggs) {
                requestAnimationFrame(() => {
                    loadingEggs.classList.add('visible');
                });
            }

            // Wait for content to be ready
            contentPromise.then(data => {
                // Calculate how long eggs have been visible
                const eggsVisibleTime = Date.now() - eggsShownAt - FADE_OUT_MS;
                const remainingTime = Math.max(0, MIN_EGGS_DISPLAY_MS - eggsVisibleTime);

                // Wait for minimum display time, then fade out eggs
                setTimeout(() => {
                    // Start eggs fading out
                    if (loadingEggs) {
                        loadingEggs.classList.remove('visible');
                        loadingEggs.classList.add('fading-out');
                    }

                    // Wait for eggs to fade out (0.6s), then swap content
                    setTimeout(() => {
                        this.swapContent(data, url, true);
                    }, 650);
                }, remainingTime);
            }).catch(err => {
                console.error("Navigation failed:", err);
                window.location.href = url;
            });
        }, FADE_OUT_MS);
    },

    async fetchContent(url) {
        const response = await fetch(url);
        const html = await response.text();

        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        return {
            body: doc.body,
            title: doc.title
        };
    },

    async swapContent(contentData, url, pushState = true) {
        const { body: newBody, title: newTitle } = contentData;

        // Preserve the current transition element (keeps eggs animating)
        // MUST detach it BEFORE innerHTML replacement or it gets destroyed
        const oldTransition = document.querySelector('.page-transition');
        if (oldTransition) oldTransition.remove();

        document.title = newTitle;
        document.body.innerHTML = newBody.innerHTML;

        // Remove the new page's transition (we're using the old one)
        const newTransition = document.querySelector('.page-transition');
        if (newTransition) newTransition.remove();

        // Re-add the old transition (with eggs still fading)
        if (oldTransition) {
            document.body.insertBefore(oldTransition, document.body.firstChild);
        }

        if (pushState) {
            window.history.pushState({}, '', url);
        }

        // Re-Initialize Page Logic (this will add .hidden via double RAF for smooth fade)
        await PageManager.init();
    },

    async loadContent(url, pushState = true) {
        // Used for popstate (back/forward) - keep sequential behavior for simplicity
        try {
            PageManager.cleanup();
            const contentData = await this.fetchContent(url);
            await this.swapContent(contentData, url, pushState);
        } catch (err) {
            console.error("Navigation failed:", err);
            window.location.href = url; // Fallback to hard reload
        }
    }
};

const PageManager = {
    activeTimeouts: [],
    activeSfx: [],
    tacoAnimationPlaying: false,
    physicsCleanup: null,

    async init() {
        // Universal Inits
        await this.initCommon();
        if (typeof GlobalAudioPlayer !== 'undefined') GlobalAudioPlayer.updateUI(); // Sync UI if Listen Page loaded

        // Page Specifics
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';

        if (page === 'index.html' || page === '') await this.initHome();
        else if (page.includes('shop')) this.initShop();
        else if (page.includes('watch')) this.initWatch();
        else if (page.includes('listening')) this.initListen();
        else if (page.includes('lessons')) this.initLessons();
        else if (page.includes('contact')) this.initContact();

        // BF Cache Fix
        document.body.classList.remove('loading');
        const transitionEl = document.querySelector('.page-transition');

        // Double RAF for smooth visual
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (transitionEl) transitionEl.classList.add('hidden');
            });
        });
    },

    cleanup() {
        console.log("Cleaning up active tasks with fades...");

        // 1. Clear all active timeouts immediately to stop animation logic
        this.activeTimeouts.forEach(id => clearTimeout(id));
        this.activeTimeouts = [];

        // 2. Fade out all playing SFX
        this.activeSfx.forEach(aud => {
            this.fadeSfxOut(aud, 1000); // 1s fade out
        });
        this.activeSfx = [];

        // 3. Fade back in persistent audio if it was ducked
        if (typeof GlobalAudioPlayer !== 'undefined') GlobalAudioPlayer.fadeTo(GlobalAudioPlayer.defaultVolume, 1500);
        if (typeof GlobalMixer !== 'undefined') GlobalMixer.fadeTo(1.0, 1500);

        // 4. Clean up physics event listeners to prevent memory leaks
        if (this.physicsCleanup) {
            this.physicsCleanup();
            this.physicsCleanup = null;
        }
    },

    registerTimeout(callback, ms) {
        const id = setTimeout(callback, ms);
        this.activeTimeouts.push(id);
        return id;
    },

    playSfx(file) {
        if (typeof GlobalAudioPlayer !== 'undefined' && GlobalAudioPlayer.playSfx) {
            const sfx = GlobalAudioPlayer.playSfx(file);
            if (sfx) {
                this.activeSfx.push(sfx);
                // Auto-cleanup from active list on end
                sfx.onended = () => {
                    this.activeSfx = this.activeSfx.filter(s => s !== sfx);
                };
                return sfx;
            }
        }
        // Fallback for safety (though GlobalAudioPlayer should exist)
        const aud = new Audio(file);
        this.activeSfx.push(aud);
        aud.play().catch(e => console.log("SFX play failed (legacy)", e));
        return aud;
    },

    fadeSfxOut(aud, durationMs) {
        if (aud.fadeTo) {
            // BufferSource wrapper
            aud.fadeTo(0, durationMs);
            setTimeout(() => aud.stop(), durationMs);
        } else {
            // Legacy HTML Audio
            const startVol = aud.volume;
            const steps = 20;
            const stepTime = durationMs / steps;
            const volStep = startVol / steps;
            const fade = setInterval(() => {
                if (aud.volume > 0.05) {
                    aud.volume -= volStep;
                } else {
                    aud.volume = 0;
                    aud.pause();
                    clearInterval(fade);
                }
            }, stepTime);
        }
    },

    wait(ms) {
        return new Promise(resolve => {
            const id = setTimeout(resolve, ms);
            this.activeTimeouts.push(id);
        });
    },

    async initCommon() {
        // --- PRELOADER & TRANSITION ---
        const assets = this.determinePageAssets();
        if (assets.length > 0) {
            await this.preloadImages(assets);
        }

        // DOUBLE CHECK: Ensure the ACTUAL background in DOM is decoded
        const bgImg = document.querySelector('.background-img') || document.querySelector('.home-bg');
        if (bgImg) {
            // Timeout wrapper to prevent infinite stall
            const decodeWithTimeout = (img, timeoutMs = 5000) => {
                return Promise.race([
                    img.decode().catch(() => { }), // silently resolve on error
                    new Promise(resolve => setTimeout(resolve, timeoutMs)) // timeout fallback
                ]);
            };

            // Wait for browser to actually paint after decode
            // Uses double RAF + timing buffer for iPad
            const waitForPaint = () => {
                return new Promise(resolve => {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            // Extra timing buffer for iPad GPU compositing
                            setTimeout(resolve, 50);
                        });
                    });
                });
            };

            try {
                if (bgImg.complete && bgImg.naturalWidth > 0) {
                    await decodeWithTimeout(bgImg);
                } else {
                    await new Promise((resolve) => {
                        const timeout = setTimeout(resolve, 5000); // 5s max wait
                        bgImg.onload = () => {
                            clearTimeout(timeout);
                            decodeWithTimeout(bgImg).then(resolve);
                        };
                        bgImg.onerror = () => {
                            clearTimeout(timeout);
                            resolve();
                        };
                    });
                }

                // IPAD FIX: Wait for browser to paint the decoded image
                await waitForPaint();

            } catch (e) {
                console.log("BG Decode Warning:", e);
            }
        }

        // --- PREVENT DRAG ---
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('dragstart', (e) => e.preventDefault());
        });

        // --- GENERIC AUDIO [data-audio] ---
        const audioElements = document.querySelectorAll('[data-audio]');
        audioElements.forEach(el => {
            let isPlayingLocal = false;
            const playSound = () => {
                if (isPlayingLocal) return;
                const src = el.getAttribute('data-audio');
                if (src) {
                    this.playSfx(src);
                    isPlayingLocal = true;
                    this.registerTimeout(() => isPlayingLocal = false, 100);
                }
            };
            el.addEventListener('mouseenter', playSound);
            el.addEventListener('touchstart', (e) => { playSound(); }, { passive: true });
            el.addEventListener('click', playSound);
        });

        // --- SHAKE ON CLICK (Generic) ---
        // (Wait, initHome has specialized shake for tree with sound. Logic below is generic from original lines 281)
        const shakeElements = document.querySelectorAll('.shake-on-click');
        shakeElements.forEach(element => {
            // Check if it is the apple tree, if so, skip generic listener if it interferes?
            // The original code applied BOTH generic (lines 281) and specific (initHome) to apple tree?
            // Actually, in original code:
            // Line 71: <div class="shake-on-click apple-tree">
            // Lines 281-299: Adds generic class toggle 'shaking'.
            // Lines 938: Adds 'click' -> appleClicks++.
            // They coexist.

            element.addEventListener('click', () => {
                element.classList.remove('shaking');
                void element.offsetWidth;
                element.classList.add('shaking');
                this.registerTimeout(() => element.classList.remove('shaking'), 1000);
            });
        });

        // --- GLOBAL AUDIO INDICATOR (Subpages) ---
        const globalIndicator = document.getElementById('globalAudioIndicator');
        if (globalIndicator) {
            globalIndicator.onclick = () => {
                // Stop both audio sources (same as home indicator)
                if (typeof GlobalAudioPlayer !== 'undefined' && GlobalAudioPlayer.isPlaying) {
                    GlobalAudioPlayer.stop();
                }
                if (typeof GlobalMixer !== 'undefined' && GlobalMixer.isActive()) {
                    GlobalMixer.stopAll();
                }
            };
            // Sync visibility on page load
            this.syncHomeIndicators();
        }
    },

    determinePageAssets() {
        const title = document.title;
        const map = {
            'Home': [
                'images/Home/homeBG.png',
                'images/Home/appleTree.png',
                'images/Home/asanabencheTitle.png',
                'images/Home/cardinalHead.png',
                'images/Home/listenSign.png',
                'images/Home/shopSign.png',
                'images/Home/contactSign.png',
                'images/Home/lessonSign.png',
                'images/Home/watchSign.png'
            ],
            'Shop': [
                'images/Shop/shopBG.png',
                'images/Shop/shopKeep.png',
                'images/Shop/door.png',
                'images/Shop/greenFront.png',
                'images/Shop/pinkBack.png'
            ],
            'Watch': [
                'images/Watch/theaterBG.png',
                'images/Watch/curtainLeft.png',
                'images/Watch/curtainRight.png',
                'images/Watch/chairSkater.png'
            ],
            'Listening Room': [
                'images/Listen/listenBG.png',
                'images/Listen/recordPlayer.png',
                'images/Listen/duckGrapes.png',
                'images/Listen/skipSign.png'
            ],
            'Contact': [
                'images/Contact/contactBG.png',
                'images/Contact/contactDesk.png',
                'images/Contact/cardinalHeadContact.png',
                'images/Contact/hola.png'
            ],
            'Lessons': [
                'images/Lessons/lessonsBG.jpeg',
                'images/Lessons/meetTheTeachers.png'
            ]
        };
        return map[title] || [];
    },

    preloadImages(urls) {
        if (!urls || urls.length === 0) return Promise.resolve();
        const promises = urls.map(url => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = resolve; // Fail soft
                img.src = url;
            });
        });
        return Promise.all(promises);
    },

    async initHome() {
        // --- TACO SEQUENCE PRELOAD & HELPERS ---
        // Preload Taco Assets Loop
        const interval = setInterval(() => {
            const truck = document.querySelector('.taco-truck-driving');
            if (truck) {
                clearInterval(interval);
                new Image().src = "images/Home/tacoSpeaking.gif";
                new Image().src = "images/Home/scrollHandoff.png";
                new Image().src = "images/Home/tacoLaser1.png";
                new Image().src = "images/Home/tacoLaser2.png";
                new Image().src = "images/Home/tacoLaser3.png";

                // Preload Taco Audio
                if (typeof GlobalAudioPlayer !== 'undefined') {
                    GlobalAudioPlayer.preloadSfx([
                        'audioFiles/homeAudio/truckAudio.wav',
                        'audioFiles/homeAudio/speaking1.wav',
                        'audioFiles/homeAudio/speaking2.wav',
                        'audioFiles/homeAudio/trickshot1.wav',
                        'audioFiles/homeAudio/trickshot2.wav',
                        'audioFiles/homeAudio/seemsOff.wav',
                        'audioFiles/homeAudio/truckWub.wav',
                        'audioFiles/homeAudio/laserSound.wav',
                        'audioFiles/homeAudio/popSound.wav',
                        'audioFiles/homeAudio/truckOut.wav'
                    ]);
                }
            }
        }, 500);

        // Home Indicator Click Listener
        const homeIndicator = document.getElementById('homeAudioIndicator');
        if (homeIndicator) {
            homeIndicator.onclick = () => {
                // Determine what to stop
                if (typeof GlobalAudioPlayer !== 'undefined' && GlobalAudioPlayer.isPlaying) {
                    GlobalAudioPlayer.stop();
                }
                if (typeof GlobalMixer !== 'undefined' && GlobalMixer.isActive()) {
                    GlobalMixer.stopAll();
                }
            };
        }
        this.syncHomeIndicators();

        // Check Eggs/Scroll/Totem Status on Load - AWAIT to ensure eggs render before transition
        await this.checkHomeState();


        // --- APPLE PHYSICS ---
        const apple = document.querySelector('.physics-apple');
        const appleTree = document.querySelector('.apple-tree');

        if (apple && appleTree) {
            // Reset state visuals if reloading home
            apple.style.display = 'none'; // Initially hidden until dropped

            let appleClicks = 0;
            // Ensure Apple Tree has the correct styles/handlers
            apple.style.zIndex = '1'; // Start behind

            appleTree.addEventListener('click', () => {
                appleClicks++;
                // Sound for tree shake? Original: Line 400ish of *previous* version had it, 
                // but the "Reset" version (lines 931+) did NOT have explicit tree shake sound in the click handler.
                // The User asked to RESTORE things "What you got right last time".
                // Last time I added tree shake sound. I will add it back.

                // Generic shake is handled by initCommon .shake-on-click

                // Sound
                this.playSfx('audioFiles/homeAudio/treeShake.wav');

                if (appleClicks === 3) {
                    this.startApplePhysics(apple, appleTree);
                }
            });
        }

        // Recipe Popup
        const recipeModal = document.getElementById('tacoRecipeModal');
        const closeRecipeBtn = document.querySelector('.close-recipe');
        if (recipeModal && closeRecipeBtn) {
            closeRecipeBtn.addEventListener('click', () => {
                const content = recipeModal.querySelector('.recipe-content');
                if (content) {
                    content.classList.remove('scale-in');
                    content.classList.add('scale-out');
                    this.registerTimeout(() => recipeModal.style.display = 'none', 500);
                }
            });
            recipeModal.addEventListener('click', (e) => {
                if (e.target === recipeModal) closeRecipeBtn.click();
            });
        }

        // --- MOBILE BIRD SPINNING ---
        this.initMobileBirdSpin();
    },

    // Mobile Bird Y-Axis Spin Physics
    initMobileBirdSpin() {
        const bird = document.querySelector('.mobile-bird');
        if (!bird) return;

        let state = {
            rotation: 0,           // Current Y rotation in degrees
            velocity: 0,           // Angular velocity
            isDragging: false,
            startX: 0,
            lastX: 0,
            lastTime: 0,
            animationId: null
        };

        const FRICTION = 0.96;          // Deceleration factor (used while spinning fast)
        const SWIPE_SENSITIVITY = 0.8;  // How much swipe distance translates to rotation
        const SPRING_STRENGTH = 0.03;   // How strongly it pulls back toward 0
        const SPRING_DAMPING = 0.92;    // Damping for spring oscillation
        const RPS_THRESHOLD = 6.0;      // Revolutions per second needed to trigger image swap (requires fast spin)
        const SPRING_ENGAGE_VELOCITY = 1.5;  // Spring only engages when velocity drops below this (lowered for later engagement)
        const SPRING_RAMP_FRAMES = 15;  // Number of frames to fully ramp up spring force
        let springEngageProgress = 0;   // 0 = no spring, 1 = full spring (gradual ramp-up)

        // Bird image array - add more birds here as needed
        const BIRD_IMAGES = [
            'images/Home/bird1.png',
            'images/Home/bird2.png'
            // Add more: 'images/Home/bird3.png', 'images/Home/bird4.png', etc.
        ];
        let currentBirdIndex = 0;
        let canSwap = true;  // Prevents rapid swapping, resets when velocity drops

        // Preload all bird images
        BIRD_IMAGES.forEach(src => {
            const img = new Image();
            img.src = src;
        });

        const updateTransform = () => {
            bird.style.transform = `translateX(-50%) perspective(800px) rotateY(${state.rotation}deg)`;
        };

        const checkAndSwapImage = () => {
            // Calculate revolutions per second from velocity
            // velocity is degrees per frame (~16.67ms at 60fps)
            // RPS = (velocity * 60) / 360
            const rps = Math.abs(state.velocity * 60) / 360;

            if (rps >= RPS_THRESHOLD && canSwap) {
                // Cycle to next bird, loop back to 0 after last
                currentBirdIndex = (currentBirdIndex + 1) % BIRD_IMAGES.length;
                bird.src = BIRD_IMAGES[currentBirdIndex];
                canSwap = false;  // Prevent immediate re-swap
            }

            // Reset swap ability when velocity drops below threshold
            if (rps < RPS_THRESHOLD * 0.5) {
                canSwap = true;
            }
        };

        const animate = () => {
            if (state.isDragging) {
                state.animationId = requestAnimationFrame(animate);
                return;
            }

            // Stepwise spring engagement - gradually ramp up/down spring influence
            if (Math.abs(state.velocity) < SPRING_ENGAGE_VELOCITY) {
                // Below threshold: gradually increase spring engagement
                springEngageProgress = Math.min(1, springEngageProgress + (1 / SPRING_RAMP_FRAMES));
            } else {
                // Above threshold: gradually decrease spring engagement (or reset)
                springEngageProgress = Math.max(0, springEngageProgress - (1 / SPRING_RAMP_FRAMES));
            }

            // Blend between friction-only and spring physics based on engagement progress
            if (springEngageProgress > 0) {
                // Normalize rotation to -180 to 180 range for shortest path to 0
                while (state.rotation > 180) state.rotation -= 360;
                while (state.rotation < -180) state.rotation += 360;

                // Apply spring force scaled by engagement progress (stepwise augmentation)
                const springForce = -state.rotation * SPRING_STRENGTH * springEngageProgress;
                state.velocity += springForce;

                // Blend damping: mix between friction and spring damping based on progress
                const blendedDamping = FRICTION + (SPRING_DAMPING - FRICTION) * springEngageProgress;
                state.velocity *= blendedDamping;
            } else {
                // While spinning fast with no spring engagement, just apply friction
                state.velocity *= FRICTION;
            }

            // Apply velocity to rotation
            state.rotation += state.velocity;

            // Check if spinning fast enough to swap image
            checkAndSwapImage();

            updateTransform();

            // Continue animation if still moving or not settled
            if (Math.abs(state.velocity) > 0.01 || Math.abs(state.rotation) > 0.1) {
                state.animationId = requestAnimationFrame(animate);
            } else {
                // Fully settled
                state.rotation = 0;
                state.velocity = 0;
                updateTransform();
                state.animationId = null;
            }
        };

        const startInteraction = (x) => {
            state.isDragging = true;
            state.startX = x;
            state.lastX = x;
            state.lastTime = performance.now();
            state.velocity = 0; // Stop any ongoing spin
            springEngageProgress = 0; // Reset spring ramp-up for fresh swipe

            // Start animation loop if not running
            if (!state.animationId) {
                state.animationId = requestAnimationFrame(animate);
            }
        };

        const moveInteraction = (x) => {
            if (!state.isDragging) return;

            const now = performance.now();
            const dx = x - state.lastX;
            const dt = now - state.lastTime;

            // Direct rotation while dragging
            state.rotation += dx * SWIPE_SENSITIVITY;

            // Track velocity for release
            if (dt > 0) {
                state.velocity = (dx / dt) * 15; // Scale for good feel
            }

            state.lastX = x;
            state.lastTime = now;
            updateTransform();
        };

        const endInteraction = () => {
            if (!state.isDragging) return;
            state.isDragging = false;
            // Animation continues from the animate() loop
        };

        // Touch Events
        bird.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startInteraction(e.touches[0].clientX);
        }, { passive: false });

        bird.addEventListener('touchmove', (e) => {
            if (state.isDragging) {
                e.preventDefault();
                moveInteraction(e.touches[0].clientX);
            }
        }, { passive: false });

        bird.addEventListener('touchend', endInteraction);
        bird.addEventListener('touchcancel', endInteraction);

        // Mouse Events (for desktop testing)
        bird.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startInteraction(e.clientX);
        });

        const onMouseMove = (e) => moveInteraction(e.clientX);
        const onMouseUp = () => {
            endInteraction();
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        bird.addEventListener('mousedown', () => {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });
    },

    // --- HELPER: HOME STATE --
    async checkHomeState() {
        // Timeout wrapper to prevent Safari hang on cached/lazy images
        const decodeWithTimeout = (img, timeoutMs = 2000) => {
            return Promise.race([
                img.decode().catch(() => { }),
                new Promise(resolve => setTimeout(resolve, timeoutMs))
            ]);
        };

        const eggs = [
            { key: 'shopEggStatus', element: document.querySelector('.shop-egg') },
            { key: 'lessonsEggStatus', element: document.querySelector('.lessons-egg') },
            { key: 'contactEggStatus', element: document.querySelector('.contact-egg') },
            { key: 'listenEggStatus', element: document.querySelector('.listen-egg') },
            { key: 'watchEggStatus', element: document.querySelector('.watch-egg') }
        ];

        const unlockedEggs = eggs.filter(egg => {
            const val = sessionStorage.getItem(egg.key);
            if (val) {
                egg.order = parseInt(val);
                return true;
            }
            return false;
        });
        unlockedEggs.sort((a, b) => a.order - b.order);

        // Show eggs and wait for their images to decode
        const decodePromises = [];
        unlockedEggs.forEach((egg, index) => {
            if (egg.element) {
                egg.element.style.display = 'block';
                egg.element.classList.add(`egg-slot-${index + 1}`);

                // Get the img inside and decode it with timeout protection
                const img = egg.element.querySelector('img');
                if (img) {
                    decodePromises.push(decodeWithTimeout(img));
                }
            }
        });

        // Wait for all egg images to be decoded before continuing
        if (decodePromises.length > 0) {
            await Promise.all(decodePromises);
        }

        // Basket State (Log only)
        const count = parseInt(sessionStorage.getItem('eggUnlockCounter') || '0');
        if (count >= 5) console.log("All 5 Eggs Collected!");

        // Scroll
        const savedScroll = sessionStorage.getItem('scrollUnlocked');
        const scrollItem = document.querySelector('.scroll-item');
        if (savedScroll && scrollItem) {
            scrollItem.style.display = 'block';
            scrollItem.classList.add('landed');
            scrollItem.onclick = () => {
                const recipeModal = document.getElementById('tacoRecipeModal');
                const content = recipeModal?.querySelector('.recipe-content');
                if (recipeModal && content) {
                    recipeModal.style.display = 'flex';
                    void recipeModal.offsetWidth;
                    content.classList.remove('scale-out');
                    content.classList.add('scale-in');
                }
            };
        }

        // Totem
        const isTotem = sessionStorage.getItem('isTotem') === 'true';
        const titleDiv = document.querySelector('.home-title');
        const titleImg = titleDiv ? titleDiv.querySelector('img') : null;
        if (isTotem && titleDiv && titleImg) {
            titleDiv.classList.add('is-totem');
            titleImg.src = "images/Home/asanabencheTotem.png";
        }
    },

    syncHomeIndicators() {
        const homeIndicator = document.getElementById('homeAudioIndicator');
        const globalIndicator = document.getElementById('globalAudioIndicator');

        const isPlaying = typeof GlobalAudioPlayer !== 'undefined' && GlobalAudioPlayer.isPlaying;
        const isLessonsActive = typeof GlobalMixer !== 'undefined' && GlobalMixer.isActive();
        const hasAudio = isPlaying || isLessonsActive;

        // Home Page Indicator (positioned based on audio source)
        if (homeIndicator) {
            if (isPlaying) {
                homeIndicator.classList.remove('pos-lessons');
                homeIndicator.classList.add('pos-listen', 'visible');
            } else if (isLessonsActive) {
                homeIndicator.classList.remove('pos-listen');
                homeIndicator.classList.add('pos-lessons', 'visible');
            } else {
                homeIndicator.classList.remove('visible');
            }
        }

        // Global Indicator (Subpages - simple show/hide)
        if (globalIndicator) {
            if (hasAudio) {
                globalIndicator.classList.add('visible');
            } else {
                globalIndicator.classList.remove('visible');
            }
        }
    },



    // --- APPLE PHYSICS (Ported & Fixed) ---
    startApplePhysics(apple, appleTree) {
        apple.style.display = 'block';
        apple.style.zIndex = '1';
        this.registerTimeout(() => apple.style.zIndex = '35', 1000);

        let state = {
            x: window.innerWidth / 2 + window.scrollX,
            y: window.innerHeight / 2 + window.scrollY,
            vx: 0, vy: 0, angle: 0, angularVelocity: 0,
            isDragging: false, lastMouseX: 0, lastMouseY: 0, lastTime: 0,
            velocityTracker: [], thrownFromLeft: false
        };

        // Recovery (Basket Bottom Click)
        const basketBtn = document.querySelector('.basket-bottom');
        if (basketBtn) {
            basketBtn.addEventListener('click', (e) => {
                if (basketBtn.classList.contains('basket-recoverable')) {
                    e.stopPropagation();
                    state.vy = -20;
                    state.vx = (Math.random() - 0.5) * 20;
                    state.y -= 20;
                    state.angularVelocity = (Math.random() - 0.5) * 0.5;
                    basketBtn.classList.remove('basket-recoverable');
                }
            });
        }

        const GRAVITY = 0.5;
        const BOUNCE = 0.7;
        const FRICTION = 0.99;
        const THROW_FORCE = 15;
        const ROTATION_SENSITIVITY = 1.5;
        const ANGULAR_FRICTION = 0.99;
        const MIN_THROW_RADIUS = 250;
        const DROP_ZONE_WIDTH = 150;

        // Debug Elements (Visuals)
        const debugRadiusEl = document.querySelector('.debug-throw-radius');
        const debugShowsRadiusEl = document.querySelector('.debug-radius-shows');
        const debugDropZoneEl = document.querySelector('.debug-drop-zone');

        let basketCenter = { x: 0, y: 0, top: 0 };
        let showsCenter = { x: 0, y: 0 };
        const showsBtn = document.querySelector('.shows-btn');

        if (basketBtn) {
            const rect = basketBtn.getBoundingClientRect();
            basketCenter.x = rect.left + rect.width / 2 + window.scrollX;
            basketCenter.y = rect.top + rect.height / 2 + window.scrollY;
            basketCenter.top = rect.top + window.scrollY;
            if (debugRadiusEl) {
                debugRadiusEl.style.width = `${MIN_THROW_RADIUS * 2}px`;
                debugRadiusEl.style.height = `${MIN_THROW_RADIUS * 2}px`;
                debugRadiusEl.style.left = `${basketCenter.x}px`;
                debugRadiusEl.style.top = `${basketCenter.y}px`;
            }
            if (debugDropZoneEl) {
                debugDropZoneEl.style.width = `${DROP_ZONE_WIDTH}px`;
                debugDropZoneEl.style.height = `${basketCenter.top}px`;
                debugDropZoneEl.style.left = `${basketCenter.x}px`;
                debugDropZoneEl.style.top = `0px`;
                debugDropZoneEl.style.transform = `translateX(-50%)`;
            }
        }
        if (showsBtn) {
            const rect = showsBtn.getBoundingClientRect();
            showsCenter.x = rect.left + rect.width / 2 + window.scrollX;
            showsCenter.y = (rect.top + rect.height / 2 + window.scrollY) - 60;
            if (debugShowsRadiusEl) {
                debugShowsRadiusEl.style.width = `${MIN_THROW_RADIUS * 2}px`;
                debugShowsRadiusEl.style.height = `${MIN_THROW_RADIUS * 2}px`;
                debugShowsRadiusEl.style.left = `${showsCenter.x}px`;
                debugShowsRadiusEl.style.top = `${showsCenter.y}px`;
            }
        }

        // Drag Handlers
        const startDrag = (x, y) => {
            state.isDragging = true;
            state.vx = 0; state.vy = 0; state.angularVelocity = 0;
            state.lastMouseX = x; state.lastMouseY = y;
            state.lastTime = performance.now();
            state.velocityTracker = [{ x, y, time: performance.now() }];

            // Allow re-triggering only if picked up actively
            if (apple.dataset.successTriggered) {
                delete apple.dataset.successTriggered;
            }
        };
        const moveDrag = (x, y) => {
            if (!state.isDragging) return;
            const now = performance.now();
            const dt = now - state.lastTime;

            state.x = x - (apple.offsetWidth / 2);
            state.y = y - (apple.offsetHeight / 2);

            state.velocityTracker.push({ x, y, time: now });
            state.velocityTracker = state.velocityTracker.filter(p => now - p.time < 100);

            if (dt > 0) {
                const dx = x - state.lastMouseX;
                state.angularVelocity = dx * ROTATION_SENSITIVITY;
            }
            state.lastMouseX = x; state.lastMouseY = y; state.lastTime = now;
        };
        const endDrag = () => {
            if (!state.isDragging) return;
            state.isDragging = false;

            // Check Conditions
            const checkRadius = (x, y, center) => {
                if (!center.x) return true; // Pass if no center
                return Math.sqrt(Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2)) > MIN_THROW_RADIUS;
            };
            const checkDrop = (x, y) => {
                if (!basketBtn) return false;
                const dx = Math.abs(x - basketCenter.x);
                return (dx < DROP_ZONE_WIDTH / 2) && (y < basketCenter.y);
            };

            state.isOutsideRadius = checkRadius(state.lastMouseX, state.lastMouseY, basketCenter);
            state.isOutsideShowsRadius = !showsBtn || checkRadius(state.lastMouseX, state.lastMouseY, showsCenter);
            state.isInDropZone = checkDrop(state.lastMouseX, state.lastMouseY);

            state.releasePoint = { x: state.lastMouseX, y: state.lastMouseY };
            state.pathLength = 0; state.wallBounceCount = 0;
            state.prevPos = { x: state.x, y: state.y };

            // Calc Velocity
            const now = performance.now();
            const recent = state.velocityTracker.filter(p => now - p.time < 100);
            if (recent.length > 1) {
                const first = recent[0]; const last = recent[recent.length - 1];
                const dt = last.time - first.time;
                if (dt > 0) {
                    state.vx = ((last.x - first.x) / dt) * THROW_FORCE;
                    state.vy = ((last.y - first.y) / dt) * THROW_FORCE;
                    // Add throw-based rotation (increased for more spin)
                    state.angularVelocity = state.vx * 0.15;
                }
            }
        };

        // Attach Listeners with addEventListener
        const onMouseDown = (e) => { e.preventDefault(); startDrag(e.pageX, e.pageY); };
        const onTouchStart = (e) => { e.preventDefault(); startDrag(e.touches[0].pageX, e.touches[0].pageY); };

        apple.addEventListener('mousedown', onMouseDown);
        apple.addEventListener('touchstart', onTouchStart, { passive: false });

        const onMouseMove = (e) => moveDrag(e.pageX, e.pageY);
        const onTouchMove = (e) => {
            if (state.isDragging) { e.preventDefault(); moveDrag(e.touches[0].pageX, e.touches[0].pageY); }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove, { passive: false });

        const onMouseUp = endDrag;
        const onTouchEnd = endDrag;

        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('touchend', onTouchEnd);

        // Register cleanup function to remove listeners on navigation
        this.physicsCleanup = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchend', onTouchEnd);
            apple.removeEventListener('mousedown', onMouseDown);
            apple.removeEventListener('touchstart', onTouchStart);
        };

        // --- UPDATE LOOP ---
        const updatePhysics = () => {
            if (apple.style.display === 'none' || !document.contains(apple)) return; // Stop if hidden (navigated away)

            if (!state.isDragging) {
                if (state.prevPos) {
                    state.pathLength = (state.pathLength || 0) + Math.sqrt(Math.pow(state.x - state.prevPos.x, 2) + Math.pow(state.y - state.prevPos.y, 2));
                }
                state.prevPos = { x: state.x, y: state.y };

                state.vy += GRAVITY;

                // Basket Logic (Success Check)
                const basket = document.querySelector('.basket-bottom');
                if (basket) {
                    const aRect = apple.getBoundingClientRect();
                    const bRect = basket.getBoundingClientRect();
                    if (aRect.left < bRect.right && aRect.right > bRect.left && aRect.top < bRect.bottom && aRect.bottom > bRect.top) {
                        if (!apple.dataset.basketEnterTime) apple.dataset.basketEnterTime = Date.now();
                        else if (Date.now() - parseInt(apple.dataset.basketEnterTime) > 3000) {
                            // Trick Shot Logic
                            let isTrickShot = false;
                            if (state.releasePoint) {
                                const straightDist = Math.sqrt(Math.pow(state.x - state.releasePoint.x, 2) + Math.pow(state.y - state.releasePoint.y, 2));
                                const mult = 2.0 + (1500 / (straightDist + 10));
                                if (state.pathLength > straightDist * mult || state.wallBounceCount >= 2) isTrickShot = true;
                            }

                            const isValidStart = state.isOutsideRadius && state.isOutsideShowsRadius && !state.isInDropZone;
                            const eggs = [
                                'shopEggStatus', 'lessonsEggStatus', 'contactEggStatus', 'listenEggStatus', 'watchEggStatus'
                            ];
                            const allEggsUnlocked = eggs.every(key => sessionStorage.getItem(key) !== null);

                            if (!apple.dataset.successTriggered && (isValidStart || isTrickShot) && allEggsUnlocked && !this.tacoAnimationPlaying) {
                                this.runTacoSequence(isTrickShot);
                                apple.dataset.successTriggered = "true";
                                if (debugRadiusEl) debugRadiusEl.style.display = 'none';
                                if (debugShowsRadiusEl) debugShowsRadiusEl.style.display = 'none';
                                if (debugDropZoneEl) debugDropZoneEl.style.display = 'none';
                            }
                        }
                        if (!basket.classList.contains('basket-recoverable')) basket.classList.add('basket-recoverable');
                    } else {
                        delete apple.dataset.basketEnterTime;
                        // Removed automatic reset of successTriggered here
                        basket.classList.remove('basket-recoverable');
                    }
                }

                // Apply Physics
                state.vx *= FRICTION; state.vy *= FRICTION;
                state.angle += state.angularVelocity;
                state.angularVelocity *= ANGULAR_FRICTION;
                state.x += state.vx; state.y += state.vy;

                // Layering Logic (Removed in favor of timeout in startApplePhysics)
                // if (state.y > ...)

                // Doc Bounds
                const docW = document.documentElement.scrollWidth;
                const docH = document.documentElement.scrollHeight;

                if (state.y > docH - apple.offsetHeight) {
                    state.y = docH - apple.offsetHeight;
                    state.vy *= -BOUNCE;
                    if (Math.abs(state.vy) < GRAVITY * 2) state.vy = 0;
                    if (Math.abs(state.vy) > 1) state.wallBounceCount++;
                    state.angularVelocity += state.vx * 0.1;
                }
                if (state.x < 0) {
                    state.x = 0;
                    state.vx *= -BOUNCE;
                    if (Math.abs(state.vx) > 1) state.wallBounceCount++;
                }
                if (state.x > docW - apple.offsetWidth) {
                    state.x = docW - apple.offsetWidth;
                    state.vx *= -BOUNCE;
                    if (Math.abs(state.vx) > 1) state.wallBounceCount++;
                }

                // Ceiling Bounce
                if (state.y < 0) {
                    state.y = 0;
                    state.vy *= -BOUNCE;
                    if (Math.abs(state.vy) > 1) state.wallBounceCount++;
                }

                // Solid Collision (OBB)
                const solids = document.querySelectorAll('.solid-object');
                const appleR = apple.offsetWidth / 2;
                const acX = state.x + appleR; const acY = state.y + appleR;

                solids.forEach(obj => {
                    const rect = obj.getBoundingClientRect();
                    const cx = rect.left + rect.width / 2 + window.scrollX; // Corrected for scroll
                    const cy = rect.top + rect.height / 2 + window.scrollY;
                    const halfW = obj.offsetWidth / 2;
                    const halfH = obj.offsetHeight / 2;

                    // Parse Angle
                    const st = window.getComputedStyle(obj);
                    let ang = 0;
                    if (st.rotate && st.rotate !== 'none') ang = parseFloat(st.rotate) * (Math.PI / 180);
                    else if (st.transform && st.transform !== 'none') {
                        const v = st.transform.split('(')[1].split(')')[0].split(',');
                        ang = Math.atan2(parseFloat(v[1]), parseFloat(v[0]));
                    }

                    const cos = Math.cos(ang); const sin = Math.sin(ang);
                    const dx = acX - cx; const dy = acY - cy;

                    const lx = dx * cos + dy * sin;
                    const ly = -dx * sin + dy * cos;

                    const cx_l = Math.max(-halfW, Math.min(lx, halfW));
                    const cy_l = Math.max(-halfH, Math.min(ly, halfH));

                    const distSq = Math.pow(lx - cx_l, 2) + Math.pow(ly - cy_l, 2);

                    if (distSq < appleR * appleR) {
                        const dist = Math.sqrt(distSq);
                        let nx, ny;
                        if (dist > 0) { nx = (lx - cx_l) / dist; ny = (ly - cy_l) / dist; }
                        else { nx = 0; ny = -1; }

                        const wnx = nx * cos - ny * sin;
                        const wny = nx * sin + ny * cos;

                        const overlap = appleR - dist;
                        state.x += wnx * overlap;
                        state.y += wny * overlap;

                        const dp = state.vx * wnx + state.vy * wny;
                        if (dp < 0) {
                            const oldVx = state.vx;
                            state.vx = (state.vx - 2 * dp * wnx) * BOUNCE;
                            state.vy = (state.vy - 2 * dp * wny) * BOUNCE;

                            const deltaVx = state.vx - oldVx;
                            state.angularVelocity += deltaVx * 1.5;

                            // FIX: Resting Threshold
                            if (wny < -0.8 && Math.abs(state.vy) < 2.0 && Math.abs(state.vx) < 2.0) {
                                state.vy = 0;
                                state.vx *= 0.5; // Friction
                                state.angularVelocity *= 0.5;
                            }
                        }
                    }
                });

            }


            // Always render current state
            apple.style.left = `${state.x}px`;
            apple.style.top = `${state.y}px`;

            const distO = Math.sqrt(state.x * state.x + state.y * state.y);
            // Re-calculate scale or use state? Original logic recalculated scale cleanly every frame
            const scale = Math.max(0.5, Math.min(1.0, distO / (window.innerWidth * 0.8)));
            apple.style.transform = `rotate(${state.angle}deg) scale(${scale})`;

            requestAnimationFrame(updatePhysics);
        };

        // Init Pos
        const tR = appleTree.getBoundingClientRect();
        state.x = tR.left + tR.width / 2 - apple.offsetWidth / 2 + window.scrollX;
        state.y = tR.top + tR.height / 3 + window.scrollY;

        // Ensure visible and behind tree initially
        apple.style.zIndex = "1";
        apple.style.display = 'block';

        requestAnimationFrame(updatePhysics);
    },

    // --- TACO SEQUENCE (VERBATIM) ---
    async runTacoSequence(isTrickShot = false) {
        const truck = document.querySelector('.taco-truck-driving');
        const truckImg = document.getElementById('tacoTruckGif');
        const scroll = document.querySelector('.scroll-item');

        if (!truck || !truckImg || !scroll) {
            console.error("Taco Truck elements missing!");
            return;
        }

        console.log("Starting Taco Sequence...");

        this.tacoAnimationPlaying = true;

        // DUCK AUDIO (Fade)
        if (typeof GlobalAudioPlayer !== 'undefined') GlobalAudioPlayer.fadeTo(0.1, 800);
        if (typeof GlobalMixer !== 'undefined') GlobalMixer.fadeTo(0.1, 800);

        // 1. DRIVE IN
        truckImg.src = "images/Home/tacoDriving.gif" + '?t=' + new Date().getTime();
        truck.style.display = 'block';

        const scrollUnlocked = sessionStorage.getItem('scrollUnlocked') === 'true';

        if (!scrollUnlocked) {
            scroll.style.display = 'none';
            scroll.classList.remove('fly-to-spot');
            scroll.classList.remove('landed');
        }

        truck.className = 'taco-truck-driving'; // Strip toggle classes
        void truck.offsetWidth; // Force Reflow
        truck.classList.add('drive-in');
        this.playSfx('audioFiles/homeAudio/truckAudio.wav');
        await this.wait(4000);

        // 2. SPEAKING (4s)
        console.log("Taco: Speaking");
        truckImg.src = "images/Home/tacoSpeaking.gif";
        if (!scrollUnlocked) {
            const audioFile = isTrickShot ? 'audioFiles/homeAudio/trickshot1.wav' : 'audioFiles/homeAudio/speaking1.wav';
            this.playSfx(audioFile);
        } else {
            const audioFile = isTrickShot ? 'audioFiles/homeAudio/trickshot2.wav' : 'audioFiles/homeAudio/speaking2.wav';
            this.playSfx(audioFile);
        }
        await this.wait(4000);

        // 3. SCROLL HANDOFF (3s)
        if (!scrollUnlocked) {
            console.log("Taco: Handoff");
            truckImg.src = "images/Home/scrollHandoff.png";
            scroll.style.display = 'block';
            await this.wait(2100);
        }

        // 4. REPOSITION (2s move)
        console.log("Taco: Repositioning");
        this.playSfx('audioFiles/homeAudio/seemsOff.wav');
        this.playSfx('audioFiles/homeAudio/truckWub.wav');

        if (!scrollUnlocked) {
            scroll.classList.add('fly-to-spot');
            this.registerTimeout(() => {
                if (scroll) {
                    scroll.classList.add('landed');
                    scroll.style.pointerEvents = 'none';
                    scroll.onclick = () => {
                        const recipeModal = document.getElementById('tacoRecipeModal');
                        const recipeContent = recipeModal.querySelector('.recipe-content');
                        if (recipeModal && recipeContent) {
                            recipeModal.style.display = 'flex';
                            void recipeModal.offsetWidth;
                            recipeContent.classList.remove('scale-out');
                            recipeContent.classList.add('scale-in');
                        }
                    };
                    sessionStorage.setItem('scrollUnlocked', 'true');
                }
            }, 3000);
        }

        truckImg.src = "images/Home/tacoDriving.gif";

        truck.classList.add('drive-reposition');
        await this.wait(2000);

        // 5. LASER SEQUENCE
        console.log("Taco: Laser 1");
        truckImg.src = "images/Home/tacoLaser1.png";
        await this.wait(1000);
        console.log("Taco: Laser 2");
        truckImg.src = "images/Home/tacoLaser2.png";
        await this.wait(1000);
        console.log("Taco: Laser 3");
        this.playSfx('audioFiles/homeAudio/laserSound.wav');
        truckImg.src = "images/Home/tacoLaser3.png";

        const titleDiv = document.querySelector('.home-title');
        const titleImg = titleDiv ? titleDiv.querySelector('img') : null;
        const currentIsTotem = sessionStorage.getItem('isTotem') === 'true';

        if (titleDiv) {
            titleDiv.classList.add('title-shake');
        }
        await this.wait(1500);

        if (titleDiv && titleImg) {
            titleDiv.classList.remove('title-shake');
            this.playSfx('audioFiles/homeAudio/popSound.wav');

            if (currentIsTotem) {
                console.log("Switching to Title");
                titleImg.src = "images/Home/asanabencheTitle.png";
                try { await titleImg.decode(); } catch (e) { }
                titleDiv.classList.remove('is-totem');
                sessionStorage.setItem('isTotem', 'false');
            } else {
                console.log("Switching to Totem");
                titleImg.src = "images/Home/asanabencheTotem.png";
                try { await titleImg.decode(); } catch (e) { }
                titleDiv.classList.add('is-totem');
                sessionStorage.setItem('isTotem', 'true');
            }
        }

        // 6. EXIT
        console.log("Taco: Exit");
        this.playSfx('audioFiles/homeAudio/truckOut.wav');
        truckImg.src = "images/Home/tacoDriving.gif";
        truck.classList.add('drive-exit');
        await this.wait(2000);

        if (scroll) {
            scroll.style.pointerEvents = 'auto';
            console.log("Scroll unlocked for interaction.");
        }

        // RESTORE AUDIO (End of Sequence)
        if (typeof GlobalAudioPlayer !== 'undefined') GlobalAudioPlayer.fadeTo(GlobalAudioPlayer.defaultVolume, 2000);
        if (typeof GlobalMixer !== 'undefined') GlobalMixer.fadeTo(1.0, 2000);

        this.tacoAnimationPlaying = false;
    },

    // --- OTHER PAGE INITS ---
    initShop() {
        // Preload flower audio for iOS swipe support
        if (typeof GlobalAudioPlayer !== 'undefined') {
            GlobalAudioPlayer.preloadSfx([
                'audioFiles/shopAudio/Flower01.wav',
                'audioFiles/shopAudio/Flower02.wav',
                'audioFiles/shopAudio/Flower03.wav',
                'audioFiles/shopAudio/Flower04.wav'
            ]);
        }

        // Flowers
        let hoverSequence = [];
        const correctSequence = [4, 3, 2, 1];
        let sequenceTimer = null;

        // Store flower data for swipe detection
        const flowerData = [];

        for (let i = 1; i <= 4; i++) {
            const f = document.querySelector(`.flower-${i}`);
            const s = document.querySelector(`.flower-${i}-static`);
            const a = document.querySelector(`.flower-${i}-anim`);
            if (!f || !s || !a) continue;

            const triggerFlower = (flowerIndex) => {
                const fd = flowerData.find(d => d.index === flowerIndex);
                if (!fd) return;

                const animSrc = `images/Shop/Flower${flowerIndex}_Anim.gif`;
                fd.anim.src = '';
                void fd.anim.offsetWidth; // Force Reflow to restart GIF
                fd.anim.src = animSrc;
                fd.anim.style.display = 'block';
                // Delay hiding static image to bridge the gap (prevent flicker)
                this.registerTimeout(() => fd.static.style.visibility = 'hidden', 50);
                this.registerTimeout(() => { fd.static.style.visibility = 'visible'; fd.anim.style.display = 'none'; }, 700);

                // Play audio for this flower
                const audioSrc = fd.element.getAttribute('data-audio');
                if (audioSrc) {
                    this.playSfx(audioSrc);
                }

                // Sequence Logic
                clearTimeout(sequenceTimer);
                hoverSequence.push(flowerIndex);

                if (hoverSequence.length > 4) hoverSequence.shift();

                if (hoverSequence.length === 4 && hoverSequence.every((val, index) => val === correctSequence[index])) {
                    console.log("Shop Egg Unlocked!");
                    this.unlockEggHelper('shopEggStatus');
                    hoverSequence = [];
                }

                // Reset logic if too slow (Legacy behavior)
                sequenceTimer = this.registerTimeout(() => {
                    hoverSequence = [];
                }, 500);
            };

            flowerData.push({ index: i, element: f, static: s, anim: a, trigger: triggerFlower });

            // Mouse hover (desktop)
            f.addEventListener('mouseenter', () => triggerFlower(i));

            // Touch start (tap on single flower)
            f.addEventListener('touchstart', () => triggerFlower(i), { passive: true });
        }

        // --- SWIPE DETECTION FOR IPAD ---
        // Track which flowers have been triggered during the current swipe
        let swipeTriggeredFlowers = new Set();

        const handleTouchMove = (e) => {
            if (e.touches.length === 0) return;
            const touch = e.touches[0];
            const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);

            if (!elementUnderTouch) return;

            // Check if the element is a flower or inside a flower
            for (const fd of flowerData) {
                if (fd.element.contains(elementUnderTouch) && !swipeTriggeredFlowers.has(fd.index)) {
                    swipeTriggeredFlowers.add(fd.index);
                    fd.trigger(fd.index);
                    break;
                }
            }
        };

        const handleTouchEnd = () => {
            swipeTriggeredFlowers.clear();
        };

        // iOS Safari workaround: unlock audio context on touchstart (valid gesture)
        // so audio can play during subsequent touchmove (not a valid gesture for audio unlock)
        const handleTouchStart = () => {
            if (typeof GlobalAudioPlayer !== 'undefined' && GlobalAudioPlayer.ctx) {
                const ctx = GlobalAudioPlayer.ctx;
                if (ctx.state === 'suspended') {
                    ctx.resume();
                }

                // iOS fix: Play a silent oscillator to fully unlock audio playback
                // This is more reliable than just resume() on some iOS versions
                try {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    gain.gain.value = 0; // Silent
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(0);
                    osc.stop(ctx.currentTime + 0.001);
                } catch (e) {
                    // Ignore errors, this is just an unlock attempt
                }
            }
        };

        // Attach to flower-cluster zone (covers all flowers)
        const flowerCluster = document.querySelector('.flower-cluster');
        if (flowerCluster) {
            flowerCluster.addEventListener('touchstart', handleTouchStart, { passive: true });
            flowerCluster.addEventListener('touchmove', handleTouchMove, { passive: true });
            flowerCluster.addEventListener('touchend', handleTouchEnd, { passive: true });
        }

        // Also attach to each flower directly for robustness
        for (const fd of flowerData) {
            fd.element.addEventListener('touchstart', handleTouchStart, { passive: true });
            fd.element.addEventListener('touchmove', handleTouchMove, { passive: true });
            fd.element.addEventListener('touchend', handleTouchEnd, { passive: true });
        }
    },

    initWatch() {
        const btn = document.querySelector('.chair-skater-btn');
        const active = document.querySelector('.skater-behind');

        // Preload Watch Audio
        if (typeof GlobalAudioPlayer !== 'undefined') {
            GlobalAudioPlayer.preloadSfx([
                'audioFiles/watchAudio/skaterStart.wav',
                'audioFiles/watchAudio/claps.wav',
                'audioFiles/watchAudio/policeStart.wav',
                'audioFiles/watchAudio/policeTire.wav',
                'audioFiles/watchAudio/skaterJump.wav',
                'audioFiles/watchAudio/skaterLand.wav',
                'audioFiles/watchAudio/skaterEnd.wav'
            ]);
        }

        let ready = false, triggered = false;
        if (btn && active) {
            btn.onmouseenter = () => { if (!triggered) { active.classList.remove('falling'); active.classList.add('rising'); active.style.cssText = ''; } };
            btn.onmouseleave = () => { if (!triggered) { active.classList.remove('rising'); ready = false; } };
            active.ontransitionend = (e) => { if (e.propertyName === 'transform' && active.classList.contains('rising')) ready = true; };
            btn.onclick = () => {
                if (!triggered && ready) {
                    triggered = true;
                    const cs = window.getComputedStyle(active);
                    const tr = cs.transform;
                    active.style.transition = 'none'; active.style.transform = tr;
                    active.classList.remove('rising'); active.classList.add('falling');
                    void active.offsetWidth;
                    active.style.transition = 'transform 0.2s ease-in';
                    active.style.transform = 'translate(0,0)';
                    this.registerTimeout(() => { if (active.parentNode) active.parentNode.removeChild(active); }, 500);
                    this.runSkaterSequence();
                }
            };
        }
    },

    runSkaterSequence() {
        const flat = document.querySelector('.skater-flat');
        const img = flat ? flat.querySelector('img') : null;
        if (flat && img) {
            // DUCK AUDIO (Fade)
            if (typeof GlobalAudioPlayer !== 'undefined') GlobalAudioPlayer.fadeTo(0.1, 800);
            if (typeof GlobalMixer !== 'undefined') GlobalMixer.fadeTo(0.1, 800);

            if (!sessionStorage.getItem('watchEggStatus')) this.unlockEggHelper('watchEggStatus');

            const iU = new Image(); iU.src = "images/Watch/skaterUp.png";
            const iD = new Image(); iD.src = "images/Watch/skaterDown.png";
            const iF = new Image(); iF.src = "images/Watch/skaterFlat.png";

            const cop = document.querySelector('.police-car');

            this.registerTimeout(() => {
                this.playSfx('audioFiles/watchAudio/skaterStart.wav');
                flat.style.display = 'block';
                void flat.offsetWidth;
                flat.style.transform = "translate(-1400%, 0%)";
                const end = () => {
                    this.playSfx('audioFiles/watchAudio/claps.wav');

                    // Delay restore to cover applause
                    this.registerTimeout(() => {
                        // RESTORE AUDIO
                        if (typeof GlobalAudioPlayer !== 'undefined') GlobalAudioPlayer.fadeTo(GlobalAudioPlayer.defaultVolume, 2000);
                        if (typeof GlobalMixer !== 'undefined') GlobalMixer.fadeTo(1.0, 2000);
                    }, 2000);

                    flat.removeEventListener('transitionend', end);
                };
                flat.addEventListener('transitionend', end);
            }, 300);

            if (cop) this.registerTimeout(() => {
                this.playSfx('audioFiles/watchAudio/policeStart.wav');
                cop.style.display = 'block'; void cop.offsetWidth;
                cop.style.transform = "translate(-1200%, 0%)";
                const cImg = cop.querySelector('img'); if (cImg) cImg.classList.add('wheelie-anim');
                this.registerTimeout(() => this.playSfx('audioFiles/watchAudio/policeTire.wav'), 600);
            }, 1900);

            this.registerTimeout(() => { img.src = iU.src; this.playSfx('audioFiles/watchAudio/skaterJump.wav'); img.style.transition = 'none'; img.style.transform = "translate(0%, -10%)"; void img.offsetWidth; img.style.transition = "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), width 0.5s ease"; img.style.width = "80%"; img.style.transform = "translate(0%, -30%)"; }, 1200);
            this.registerTimeout(() => { img.src = iD.src; img.style.transition = "transform 0.5s cubic-bezier(0.55, 0.085, 0.68, 0.53), width 0.5s ease"; img.style.width = "100%"; img.style.transform = "translate(0%, 10%)"; }, 1700);
            this.registerTimeout(() => {
                img.src = iF.src; this.playSfx('audioFiles/watchAudio/skaterLand.wav'); this.playSfx('audioFiles/watchAudio/skaterEnd.wav'); img.style.transition = "transform 0.3s ease, width 0.3s ease"; img.style.width = "120%"; img.style.transform = "translate(0%, -15%)";
            }, 2200);
        }
    },

    unlockEggHelper(key) {
        if (sessionStorage.getItem(key)) return; // Already unlocked

        let c = parseInt(sessionStorage.getItem('eggUnlockCounter') || '0') + 1;
        sessionStorage.setItem('eggUnlockCounter', c);
        sessionStorage.setItem(key, c);
        console.log(`${key} Unlocked! Order: ${c}`);
    },

    initListen() {
        const d = document.querySelector('.duck-grapes-img');
        const pc = document.querySelector('.dynamic-popup');
        const pi = document.getElementById('popupImage');
        if (d && pc && pi) {
            const startStopBtn = document.querySelector('.start-stop-btn');
            const skipBtn = document.querySelector('.skip-btn');
            if (startStopBtn) startStopBtn.onclick = (e) => { e.preventDefault(); GlobalAudioPlayer.togglePlay(); };
            if (skipBtn) skipBtn.onclick = (e) => { e.preventDefault(); GlobalAudioPlayer.playNext(true); };

            d.style.cursor = 'pointer'; d.style.pointerEvents = 'auto';
            d.onclick = () => {
                if (pc.classList.contains('popup-animate')) return;
                const r = Math.random();
                let src = '';
                if (r < 0.45) src = 'images/Listen/grapes.png';
                else if (r < 0.80) src = 'images/Listen/glue.png';
                else { src = 'images/Listen/lemonade.png'; this.unlockEggHelper('listenEggStatus'); }

                pi.src = src; pc.classList.add('popup-animate');
                this.registerTimeout(() => { pc.classList.remove('popup-animate'); pi.src = ''; }, 2000);
            }
        }
    },

    initContact() {
        const btn = document.querySelector('.hola-btn');
        const head = document.querySelector('.cardinal-head-contact');
        if (btn && head) {
            let files = []; for (let i = 1; i <= 11; i++) files.push(`audioFiles/contactAudio/spanishAudio${i}.wav`);

            // Preload Contact Audio
            if (typeof GlobalAudioPlayer !== 'undefined') {
                GlobalAudioPlayer.preloadSfx(files);
            }

            let idx = 0; let active = false;
            btn.onclick = () => {
                if (active) return;
                if (idx >= files.length) { if (head.parentNode) head.parentNode.removeChild(head); return; }
                const aud = this.playSfx(files[idx]);
                active = true; btn.style.cursor = 'default';

                // DUCK AUDIO (Fade)
                if (typeof GlobalAudioPlayer !== 'undefined') GlobalAudioPlayer.fadeTo(0.1, 400);
                if (typeof GlobalMixer !== 'undefined') GlobalMixer.fadeTo(0.1, 400);

                head.classList.add('talking');
                idx++;
                aud.onended = () => {
                    // RESTORE AUDIO
                    if (typeof GlobalAudioPlayer !== 'undefined') GlobalAudioPlayer.fadeTo(GlobalAudioPlayer.defaultVolume, 2000);
                    if (typeof GlobalMixer !== 'undefined') GlobalMixer.fadeTo(1.0, 2000);

                    head.classList.remove('talking'); active = false; btn.style.cursor = 'pointer';
                    if (idx >= files.length) {
                        this.unlockEggHelper('contactEggStatus');
                        this.registerTimeout(() => { if (head.parentNode) head.parentNode.removeChild(head); }, 550);
                    }
                };
            };
        }
    },

    initLessons() {
        const m = document.getElementById("lessonModal");
        const mT = document.getElementById("modalTitle");
        const mB = document.getElementById("modalBody");
        const cB = document.querySelector(".close-btn");
        const btns = document.querySelectorAll(".overlay-link[data-instrument]");

        const content = {
            "Bass": `<div class="single-column-layout"><div><p class="teacher-name">Ninaad Raman</p><img src="images/Lessons/Ninaad.png" style="width:150px;height:150px;"><ul style="text-align: left;"><li>Performing Bassist for Asanabenche</li><li>Proficient in Jazz and Funk styles</li><li>Experience teaching children and adults</li><li>Wholistic approach to music education</li></ul></div></div><a href="contact.html"><img src="images/Lessons/inquire_base.png" style="width:100px;height:auto;" onmouseover="this.src='images/Lessons/inquire_hover.png'" onmouseout="this.src='images/Lessons/inquire_base.png'"></a>`,
            "Drums": `<div class="single-column-layout"><p class="teacher-name">Jacob Winthrop</p><img src="images/Lessons/Jacob.png" style="width:150px;height:150px;"><ul style="text-align: left;"><li>fill in</li><li>fill in</li><li>fill in</li><li>fill in</li></ul></div><a href="contact.html"><img src="images/Lessons/inquire_base.png" style="width:100px;height:auto;" onmouseover="this.src='images/Lessons/inquire_hover.png'" onmouseout="this.src='images/Lessons/inquire_base.png'"></a>`,
            "Guitar": `<div class="single-column-layout"><p class="teacher-name">Jacob Winthrop</p><img src="images/Lessons/Jacob.png" style="width:150px;height:150px;"><ul style="text-align: left;"><li>fill in</li><li>fill in</li><li>fill in</li><li>fill in</li></ul></div><a href="contact.html"><img src="images/Lessons/inquire_base.png" style="width:100px;height:auto;" onmouseover="this.src='images/Lessons/inquire_hover.png'" onmouseout="this.src='images/Lessons/inquire_base.png'"></a>`,
            "Voice": `<div class="single-column-layout"><p class="teacher-name">Ninaad Raman</p><img src="images/Lessons/Ninaad.png" style="width:150px;height:150px;"><ul style="text-align: left;"><li>20+ years of vocal performance experience</li><li>Vocal Principle at Berklee College of Music</li><li>10 years in Cantabile Youth Singers as a vocalist and conductor</li><li>Group and Private direction experience for children and adults</li><li>Wholistic approach to music education</li></ul></div><a href="contact.html"><img src="images/Lessons/inquire_base.png" style="width:100px;height:auto;" onmouseover="this.src='images/Lessons/inquire_hover.png'" onmouseout="this.src='images/Lessons/inquire_base.png'"></a>`,
            "Piano": `<div class="three-column-layout"><div><p class="teacher-name">Anderson Jno Baptiste</p><img src="images/Lessons/Andy.png" style="width:150px;height:150px;"><p>(Jazz Piano)</p><ul style="text-align: left;"><li>fill in</li><li>fill in</li><li>fill in</li><li>fill in</li></ul></div><div><p class="teacher-name">Ninaad Raman</p><img src="images/Lessons/Ninaad.png" style="width:150px;height:150px;"><p>(Classical Piano)</p><ul style="text-align: left;"><li>15+ years of classical piano experience</li><li>Familiar with the Suzuki method</li><li>Teaches all ages</li><li>Teaches all skill levels</li><li>Wholistic approach to music education</li></ul></div><div><p class="teacher-name">Al Nadel</p><img src="images/Lessons/Al.png" style="width:150px;height:150px;"><p>(Blues Piano)</p><ul style="text-align: left;"><li>fill in</li><li>fill in</li><li>fill in</li><li>fill in</li></ul></div></div><a href="contact.html"><img src="images/Lessons/inquire_base.png" style="width:100px;height:auto;" onmouseover="this.src='images/Lessons/inquire_hover.png'" onmouseout="this.src='images/Lessons/inquire_base.png'"></a>`,
            "Teachers": `<div class="two-column-layout"><div><p class="teacher-name" style="text-align:left;">Ninaad Raman</p><img src="images/Lessons/Ninaad.png" style="width:150px;height:150px;float:left;margin-right:15px;margin-bottom:10px;"><p>Raised in classical and choral traditions, Ninaad spent 15 years honing his skills on the piano and voice until beginning his studies at The Berklee College of Music. There, he developed an advanced understanding of music theory and composition as well as audio engineering through his double major in Film Scoring and Music Production/Engineering. During this time he picked up the Bass Guitar and developed a love for Funk and Jazz styles. He spent his life both as a student and teacher, mentoring younger students in his choir and community with an emphasis on a fun and supportive learning environment.</p><p class="teacher-name" style="text-align:left;">Anderson Jno Baptiste</p><img src="images/Lessons/Andy.png" style="width:150px;height:150px;float:left;margin-right:15px;margin-bottom:10px;"><p>Raised in classical and choral traditions, Ninaad spent 15 years honing his skills on the piano and voice until beginning his studies at The Berklee College of Music. There, he developed an advanced understanding of music theory and composition as well as audio engineering through his double major in Film Scoring and Music Production/Engineering. During this time he picked up the Bass Guitar and developed a love for Funk and Jazz styles. He spent his life both as a student and teacher, mentoring younger students in his choir and developing piano and guitar skills in others around his community.</p></div><div><p class="teacher-name" style="text-align:right;">Jacob Winthrop</p><img src="images/Lessons/Jacob.png" style="width:150px;height:150px;float:right;margin-left:15px;margin-bottom:10px;"><p>Jacob is a guitar player and drummer who graduated with a degree in professional music from Berklee College of Music, and has played for 12 years. His guitar teaching experience ranges from local kids in Los Angeles to full classes of adults in Boston and now he wants to teach you! He knows that every student is different and therefore every lesson should be approached differently. He loves music theory and uses it to help teach you how to not only be a great guitar player or drummer, but also a musician capable of self-teaching. Above all he wants you to believe in yourself and have fun! Music is all about fun!</p><p class="teacher-name" style="text-align:right;">Al Nadel</p><img src="images/Lessons/Al.png" style="width:150px;height:150px;float:right;margin-left:15px;margin-bottom:10px;"><p>Raised in classical and choral traditions, Ninaad spent 15 years honing his skills on the piano and voice until beginning his studies at The Berklee College of Music. There, he developed an advanced understanding of music theory and composition as well as audio engineering through his double major in Film Scoring and Music Production/Engineering. During this time he picked up the Bass Guitar and developed a love for Funk and Jazz styles. He spent his life both as a student and teacher, mentoring younger students in his choir and developing piano and guitar skills in others around his community.</p></div></div><a href="contact.html"><img src="images/Lessons/inquire_base.png" style="width:120px;height:auto;" onmouseover="this.src='images/Lessons/inquire_hover.png'" onmouseout="this.src='images/Lessons/inquire_base.png'"></a>`
        };

        if (m && cB && btns.length > 0) {
            btns.forEach(b => b.onclick = (e) => { e.preventDefault(); const t = b.getAttribute("data-instrument"); mT.textContent = t === "Teachers" ? "Teachers" : t + " Teachers"; mB.innerHTML = content[t] || "Coming soon..."; m.style.display = "block"; });
            cB.onclick = () => m.style.display = "none";
            window.onclick = (e) => { if (e.target == m) m.style.display = "none"; };
        }

        // MIXER
        // Check if mixer elements are present
        const djembe = document.querySelector('.djembe-img');
        if (djembe) {
            GlobalMixer.bindUI(this.unlockEggHelper.bind(this));
        }
    }
};

// ==========================================
// STARTUP
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    GlobalAudioPlayer.init();
    SpaRouter.init();

    // Initial page load: show loading eggs if init takes longer than 500ms
    const loadingEggs = document.querySelector('.loading-eggs');
    let initComplete = false;

    const loadingTimeout = setTimeout(() => {
        if (!initComplete && loadingEggs) {
            loadingEggs.classList.add('visible');
        }
    }, 500);

    PageManager.init().then(() => {
        initComplete = true;
        clearTimeout(loadingTimeout);
        // Hide loading eggs when page is ready
        if (loadingEggs) loadingEggs.classList.remove('visible');
    }).catch(() => {
        initComplete = true;
        clearTimeout(loadingTimeout);
        if (loadingEggs) loadingEggs.classList.remove('visible');
    });
});
