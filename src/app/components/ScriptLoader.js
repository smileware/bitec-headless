'use client';
import { useEffect, useRef } from 'react';

// ── Global state (persists across navigations) ────────────────────────
const loadedScripts = new Set();

const persistentScriptPatterns = [/\/aoslight\.js/i, /\/aoslightclip\.js/i];
const persistentScripts = new Set();

const BASE_AOS_SELECTOR =
    '[data-aos]:not([data-aos="clip-down"]):not([data-aos="clip-up"]):not([data-aos="clip-left"]):not([data-aos="clip-right"]):not([data-aos="display-in"]):not([data-aos="display-in-slide"]):not([data-aos="display-in-zoom"]):not([data-aos="custom"]):not([data-aos="slide-left"]):not([data-aos="slide-right"]):not([data-aos="slide-top"]):not([data-aos="slide-bottom"])';
const BASE_CLIP_SELECTOR =
    '[data-aos="clip-down"], [data-aos="clip-up"], [data-aos="clip-left"], [data-aos="clip-right"], [data-aos="display-in"], [data-aos="display-in-slide"], [data-aos="display-in-zoom"], [data-aos="custom"], [data-aos="slide-left"], [data-aos="slide-right"], [data-aos="slide-top"], [data-aos="slide-bottom"]';

const aosObserverState = { observer: null };
const clipState = { elements: new Set(), handler: null, throttled: null };

// ── Helpers ────────────────────────────────────────────────────────────

function isPersistentScript(src = '') {
    return persistentScriptPatterns.some((p) => p.test(src));
}

function proxyUrl(src) {
    return `/api/gs-proxy?url=${encodeURIComponent(src)}`;
}

function loadScriptTag(src) {
    return new Promise((resolve, reject) => {
        const el = document.createElement('script');
        el.src = src;
        el.onload = resolve;
        el.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.body.appendChild(el);
    });
}

// ── GreenShift re-initialisation ───────────────────────────────────────

function reinitializeGreenShiftComponents() {
    if (typeof document === 'undefined') return;

    // Video: .gs-video-element divs → <video>
    document.querySelectorAll('.gs-video-element').forEach((el) => {
        if (el.querySelector('video')) return;
        const src = el.dataset.src;
        if (!src || el.dataset.provider !== 'video') return;

        const v = document.createElement('video');
        v.src = src;
        if (el.dataset.autoplay === 'true') v.autoplay = true;
        if (el.dataset.playsinline === 'true') v.playsInline = true;
        if (el.dataset.controls === 'true') v.controls = true;
        if (el.dataset.loop === 'true') v.loop = true;
        if (el.dataset.mute === 'true') v.muted = true;
        if (el.dataset.poster) v.poster = el.dataset.poster;
        v.style.cssText = 'width:100%;height:100%;object-fit:cover';
        el.appendChild(v);
        v.play().catch(() => {});
    });

    // Replay paused autoplay videos
    document.querySelectorAll('video[autoplay], .gs-video-element video').forEach((v) => {
        if (v.paused) {
            v.muted = true;
            v.play().catch(() => {});
        }
    });

    // Call any GreenShift global init hooks
    ['gspb_init', 'gspbInit', 'greenshiftInit'].forEach((fn) => {
        if (typeof window[fn] === 'function') window[fn]();
    });
}

// ── Counter handling ───────────────────────────────────────────────────

function handleCounters(guard) {
    if (typeof document === 'undefined' || guard.current) return;

    const els = document.querySelectorAll('.gs-counter');
    if (els.length === 0) {
        setTimeout(() => { if (!guard.current) handleCounters(guard); }, 300);
        return;
    }
    guard.current = true;
    els.forEach((el) => {
        const end = el.getAttribute('data-end');
        if (!end) return;
        if (!el.classList.contains('countfinished')) {
            if (window.gsCounterInit || window.greenshiftCounterInit) return;
            el.textContent = end;
            el.classList.add('countfinished');
        }
    });
}

// ── AOS / Clip animation refresh ───────────────────────────────────────

function refreshPersistentAnimations() {
    if (typeof window === 'undefined') return;
    refreshAOS();
    refreshClip();
}

function refreshAOS() {
    const obs = getAOSObserver();
    if (!obs) return;
    const sel = buildSelector(BASE_AOS_SELECTOR, window.animationClasses);
    document.querySelectorAll(sel).forEach((el) => obs.observe(el));
}

function getAOSObserver() {
    if (typeof window === 'undefined') return null;
    if (aosObserverState.observer) return aosObserverState.observer;
    aosObserverState.observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const t = entry.target;
                const once = t.getAttribute('data-aos-once');
                if (entry.isIntersecting) {
                    setTimeout(() => t.classList.add('aos-animate'), 10);
                    if (once) aosObserverState.observer?.unobserve(t);
                } else if (!once && t.classList.contains('aos-animate') && !t.classList.contains('aos-init')) {
                    t.classList.remove('aos-animate');
                }
            });
        },
        { threshold: 0, rootMargin: '0px 0px -5% 0px' }
    );
    return aosObserverState.observer;
}

function refreshClip() {
    if (typeof window === 'undefined') return;
    const sel = buildSelector(BASE_CLIP_SELECTOR, window.clipClasses);
    document.querySelectorAll(sel).forEach((el) => clipState.elements.add(el));
    ensureClipHandler();
    clipState.handler?.();
}

function ensureClipHandler() {
    if (typeof window === 'undefined' || clipState.handler) return;
    const handler = () => {
        clipState.elements.forEach((el) => {
            if (!el.isConnected) { clipState.elements.delete(el); return; }
            const once = el.getAttribute('data-aos-once');
            const rect = el.getBoundingClientRect();
            const inView = rect.top <= (window.innerHeight || document.documentElement.clientHeight) && rect.bottom >= 0;
            if (inView) {
                setTimeout(() => el.classList.add('aos-animate'), 10);
            } else if (!once && el.classList.contains('aos-animate') && !el.classList.contains('aos-init')) {
                el.classList.remove('aos-animate');
            }
        });
    };
    clipState.handler = handler;
    clipState.throttled = throttle(handler, 100);
    window.addEventListener('scroll', clipState.throttled);
    window.addEventListener('resize', clipState.throttled);
}

function buildSelector(base, extraArr) {
    const extra = Array.isArray(extraArr) ? extraArr : [];
    if (!extra.length) return base;
    return `${base}, ${extra.map((c) => `.${c}`).join(', ')}`;
}

function throttle(fn, limit) {
    let waiting = false;
    return (...args) => {
        if (!waiting) {
            fn(...args);
            waiting = true;
            setTimeout(() => { waiting = false; }, limit);
        }
    };
}

// ── Component ──────────────────────────────────────────────────────────

export default function ScriptLoader({ scripts }) {
    const isLoading = useRef(false);
    const hasLoadedCounter = useRef(false);

    useEffect(() => {
        if (isLoading.current) return;
        if (!scripts || scripts.length === 0) {
            refreshPersistentAnimations();
            setTimeout(reinitializeGreenShiftComponents, 150);
            return;
        }

        let cancelled = false;

        (async () => {
            isLoading.current = true;

            for (const src of scripts) {
                if (!src || cancelled) continue;

                // Persistent AOS scripts: load once, never re-execute
                if (isPersistentScript(src)) {
                    if (persistentScripts.has(src)) continue;
                    try {
                        await loadScriptTag(src);
                        persistentScripts.add(src);
                        loadedScripts.add(src);
                    } catch (e) {
                        console.warn('[ScriptLoader] persistent script failed:', src, e);
                    }
                    continue;
                }

                // First visit: load normally via <script> tag
                if (!loadedScripts.has(src)) {
                    try {
                        await loadScriptTag(src);
                        loadedScripts.add(src);
                        if (src.includes('counter')) {
                            setTimeout(() => handleCounters(hasLoadedCounter), 200);
                        }
                    } catch (e) {
                        console.warn('[ScriptLoader] script failed:', src, e);
                    }
                    continue;
                }

                // Re-navigation: load IIFE-wrapped version via proxy
                try {
                    await loadScriptTag(proxyUrl(src));
                    if (src.includes('counter')) {
                        setTimeout(() => handleCounters(hasLoadedCounter), 200);
                    }
                } catch (e) {
                    console.warn('[ScriptLoader] proxy re-exec failed:', src, e);
                }
            }

            isLoading.current = false;
            if (!cancelled) {
                refreshPersistentAnimations();
                setTimeout(reinitializeGreenShiftComponents, 150);
            }
        })();

        return () => { cancelled = true; isLoading.current = false; };
    }, [scripts]);

    return null;
}
