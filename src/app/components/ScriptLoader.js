'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function ScriptLoader({ scripts }) {
    const pathname = usePathname();
    const scriptRefs = useRef([]);
    const isLoading = useRef(false);
    
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
                        script.onload = resolve;
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
    }, [scripts, pathname]);
    
    return null;
}