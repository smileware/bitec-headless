'use client';
import { useEffect, useRef } from 'react';

export default function ScriptLoader({ scripts }) {
    const scriptRefs = useRef([]);
    const isLoading = useRef(false);
    const hasLoadedCounter = useRef(false);
    
    useEffect(() => {
        // Prevent double loading
        if (isLoading.current) return;
        
        // Cleanup existing scripts first
        scriptRefs.current.forEach(script => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        });
        scriptRefs.current = [];
        
        if (!scripts || scripts.length === 0) {
            return;
        }
        
        // Load scripts sequentially to ensure proper order
        async function loadScriptsSequentially() {
            isLoading.current = true;
            
            for (const src of scripts) {
                try {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = src;
                        script.onload = () => {
                            // Handle counters - show final values on return visits only
                            if (src.includes('counter')) {
                                const counterElements = document.querySelectorAll('.gs-counter');
                                counterElements.forEach(element => {
                                    // If counter script was loaded before, show final values
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
                            resolve();
                        };
                        script.onerror = reject;
                        document.body.appendChild(script);
                        scriptRefs.current.push(script);
                    });
                } catch (error) {
                    console.error('ScriptLoader: Failed to load script:', src, error);
                }
            }
            
            isLoading.current = false;
        }
        
        loadScriptsSequentially();
        
        return () => {
            scriptRefs.current.forEach(script => {
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