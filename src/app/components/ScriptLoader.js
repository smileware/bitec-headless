'use client';
import { useEffect, useRef } from 'react';

const persistentScriptPatterns = [/\/aoslight\.js/i, /\/aoslightclip\.js/i];
const persistentScripts = new Set();

const BASE_AOS_SELECTOR = '[data-aos]:not([data-aos="clip-down"]):not([data-aos="clip-up"]):not([data-aos="clip-left"]):not([data-aos="clip-right"]):not([data-aos="display-in"]):not([data-aos="display-in-slide"]):not([data-aos="display-in-zoom"]):not([data-aos="custom"]):not([data-aos="slide-left"]):not([data-aos="slide-right"]):not([data-aos="slide-top"]):not([data-aos="slide-bottom"])';
const BASE_CLIP_SELECTOR = '[data-aos="clip-down"], [data-aos="clip-up"], [data-aos="clip-left"], [data-aos="clip-right"], [data-aos="display-in"], [data-aos="display-in-slide"], [data-aos="display-in-zoom"], [data-aos="custom"], [data-aos="slide-left"], [data-aos="slide-right"], [data-aos="slide-top"], [data-aos="slide-bottom"]';

const aosObserverState = { observer: null };
const clipState = { elements: new Set(), handler: null, throttled: null };

function isPersistentScript(src = '') {
    return persistentScriptPatterns.some((pattern) => pattern.test(src));
}

function handleCounters(hasLoadedCounter) {
    if (typeof document === 'undefined') {
        return;
    }
    const counterElements = document.querySelectorAll('.gs-counter');
    counterElements.forEach((element) => {
        if (hasLoadedCounter.current) {
            const endValue = element.getAttribute('data-end');
            if (endValue) {
                element.textContent = endValue;
                element.classList.add('countfinished');
            }
        }
    });
    hasLoadedCounter.current = true;
}

function refreshPersistentAnimations(scope) {
    if (typeof window === 'undefined' || !scope) {
        return;
    }
    refreshAOSAnimations(scope);
    refreshClipAnimations(scope);
}

function refreshAOSAnimations(scope) {
    const observer = getAOSObserver();
    if (!observer || !scope.querySelectorAll) {
        return;
    }
    const selector = buildAOSSelector();
    const elements = scope.querySelectorAll(selector);
    elements.forEach((element) => {
        observer.observe(element);
    });
}

function getAOSObserver() {
    if (typeof window === 'undefined') {
        return null;
    }
    if (aosObserverState.observer) {
        return aosObserverState.observer;
    }
    aosObserverState.observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const target = entry.target;
                const once = target.getAttribute('data-aos-once');
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        target.classList.add('aos-animate');
                    }, 10);
                    if (once) {
                        aosObserverState.observer?.unobserve(target);
                    }
                } else if (
                    !once &&
                    target.classList.contains('aos-animate') &&
                    !target.classList.contains('aos-init')
                ) {
                    target.classList.remove('aos-animate');
                }
            });
        },
        { threshold: 0, rootMargin: '0px 0px -5% 0px' }
    );
    return aosObserverState.observer;
}

function buildAOSSelector() {
    if (typeof window === 'undefined') {
        return BASE_AOS_SELECTOR;
    }
    const extra = Array.isArray(window.animationClasses) ? window.animationClasses : [];
    if (!extra.length) {
        return BASE_AOS_SELECTOR;
    }
    const extraSelector = extra.map((cls) => `.${cls}`).join(', ');
    return `${BASE_AOS_SELECTOR}, ${extraSelector}`;
}

function refreshClipAnimations(scope) {
    if (typeof window === 'undefined' || !scope.querySelectorAll) {
        return;
    }
    const selector = buildClipSelector();
    const elements = scope.querySelectorAll(selector);
    elements.forEach((element) => {
        clipState.elements.add(element);
    });
    ensureClipHandler();
    runClipUpdate();
}

function ensureClipHandler() {
    if (typeof window === 'undefined') {
        return;
    }
    if (clipState.handler) {
        return;
    }
    const handler = () => {
        clipState.elements.forEach((element) => {
            if (!element.isConnected) {
                clipState.elements.delete(element);
                return;
            }
            const once = element.getAttribute('data-aos-once');
            if (isElementInViewport(element)) {
                setTimeout(() => {
                    element.classList.add('aos-animate');
                }, 10);
            } else if (
                !once &&
                element.classList.contains('aos-animate') &&
                !element.classList.contains('aos-init')
            ) {
                element.classList.remove('aos-animate');
            }
        });
    };
    clipState.handler = handler;
    clipState.throttled = throttle(handler, 100);
    window.addEventListener('scroll', clipState.throttled);
    window.addEventListener('resize', clipState.throttled);
}

function runClipUpdate() {
    if (clipState.handler) {
        clipState.handler();
    }
}

function buildClipSelector() {
    if (typeof window === 'undefined') {
        return BASE_CLIP_SELECTOR;
    }
    const extra = Array.isArray(window.clipClasses) ? window.clipClasses : [];
    if (!extra.length) {
        return BASE_CLIP_SELECTOR;
    }
    const extraSelector = extra.map((cls) => `.${cls}`).join(', ');
    return `${BASE_CLIP_SELECTOR}, ${extraSelector}`;
}

function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top <= viewportHeight && rect.bottom >= 0;
}

function throttle(fn, limit) {
    let waiting = false;
    return (...args) => {
        if (!waiting) {
            fn(...args);
            waiting = true;
            setTimeout(() => {
                waiting = false;
            }, limit);
        }
    };
}

export default function ScriptLoader({ scripts }) {
    const scriptRefs = useRef([]);
    const isLoading = useRef(false);
    const hasLoadedCounter = useRef(false);

    useEffect(() => {
        if (isLoading.current) return;

        scriptRefs.current.forEach((script) => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        });
        scriptRefs.current = [];

        const scope = typeof document !== 'undefined' ? document : null;

        if (!scripts || scripts.length === 0) {
            refreshPersistentAnimations(scope);
            return;
        }

        let cancelled = false;

        async function loadScriptsSequentially() {
            isLoading.current = true;

            for (const src of scripts) {
                if (!src || cancelled) {
                    continue;
                }

                const persistent = isPersistentScript(src);
                if (persistent && persistentScripts.has(src)) {
                    continue;
                }

                try {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = src;
                        script.onload = () => {
                            if (persistent) {
                                persistentScripts.add(src);
                            }
                            if (src.includes('counter')) {
                                handleCounters(hasLoadedCounter);
                            }
                            resolve();
                        };
                        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
                        document.body.appendChild(script);
                        scriptRefs.current.push(script);
                    });
                } catch (error) {
                    console.error('ScriptLoader: Failed to load script:', src, error);
                }
            }

            isLoading.current = false;
            if (!cancelled) {
                refreshPersistentAnimations(scope);
            }
        }

        loadScriptsSequentially();

        return () => {
            cancelled = true;
            scriptRefs.current.forEach((script) => {
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            });
            scriptRefs.current = [];
            isLoading.current = false;
        };
    }, [scripts]);

    return null;
}
