
/**
 * Polyfills are handled by index.html for legacy compatibility.
 * Redundant imports removed to improve boot speed.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Signal to index.html watchdog that we have arrived
(window as any).appStarted = true;

var rootElement = document.getElementById('root');
var loader = document.getElementById('system-loader');

var hideLoader = function() {
    if (loader) {
        loader.style.display = 'none';
    }
};

if (rootElement) {
    hideLoader();

    try {
        var root = ReactDOM.createRoot(rootElement);
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    } catch (e) {
        var errStack = "No stack trace available";
        if (e && typeof e === 'object') {
            errStack = (e as any).stack || (e as any).message || String(e);
        }

        rootElement.innerHTML = [
            '<div style="padding:40px; color:white; background:#7f1d1d; height:100vh; font-family: monospace; overflow: auto;">',
                '<h1 style="font-weight:900; font-size: 24px;">KERNEL INITIALIZATION CRASH</h1>',
                '<div style="margin-top:20px; padding: 20px; background: rgba(0,0,0,0.2); border-radius: 8px;">',
                    '<p style="color: #fca5a5; font-weight: bold; margin-bottom: 10px;">React failed to boot on this engine:</p>',
                    '<pre style="font-size:11px; color:#fecaca; white-space: pre-wrap; word-break: break-all;">' + errStack + '</pre>',
                '</div>',
                '<p style="margin-top:20px; font-size:12px; opacity:0.6;">Check for missing polyfills or syntax errors in legacy chunks.</p>',
            '</div>'
        ].join('');
    }
}
