
// CRITICAL: Polyfills must be the first thing imported
import 'core-js/stable';
import 'regenerator-runtime/runtime';

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
    // Hide the loader immediately
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
                '<h1 style="font-weight:900; font-size: 24px;">INITIALIZATION CRASH</h1>',
                '<div style="margin-top:20px; padding: 20px; background: rgba(0,0,0,0.2); border-radius: 8px;">',
                    '<p style="color: #fca5a5; font-weight: bold; margin-bottom: 10px;">The React engine failed to boot:</p>',
                    '<pre style="font-size:11px; color:#fecaca; white-space: pre-wrap; word-break: break-all;">' + errStack + '</pre>',
                '</div>',
            '</div>'
        ].join('');
    }
}
