
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Legacy Feature Detection using ES5-safe syntax
var checkCompatibility = function() {
    try {
        var requirements = {
            'Promise': typeof Promise !== 'undefined',
            'Fetch': typeof fetch !== 'undefined',
            'Symbols': typeof Symbol !== 'undefined',
            'Assign': typeof Object.assign !== 'undefined',
            'Map': typeof Map !== 'undefined'
        };
        var missing = [];
        for (var key in requirements) {
            if (!requirements[key]) {
                missing.push(key);
            }
        }
        return missing;
    } catch (e) {
        return ['Feature Detection Failed'];
    }
};

var rootElement = document.getElementById('root');
var loader = document.getElementById('system-loader');

var hideLoader = function() {
    if (loader) {
        loader.style.display = 'none';
    }
};

if (!rootElement) {
    console.error("FATAL: Root element missing.");
} else {
    var missingFeatures = checkCompatibility();
    
    if (missingFeatures.length > 0) {
        hideLoader();
        rootElement.innerHTML = [
            '<div style="padding:40px; color:#ef4444; background:#0f172a; height:100vh; font-family: sans-serif;">',
                '<h1 style="font-weight:900; margin-bottom:10px;">SYSTEM INCOMPATIBLE</h1>',
                '<p>Missing requirements: <b>' + missingFeatures.join(', ') + '</b></p>',
                '<p style="margin-top:20px; font-size:12px; color:#64748b;">',
                    'Chrome 37 detected. Please ensure all polyfills in index.html are loaded.',
                '</p>',
            '</div>'
        ].join('');
    } else {
        try {
            // Chrome 37 is extremely sensitive to React 19's background rendering.
            // We mount normally but wrap in a global catch.
            var root = ReactDOM.createRoot(rootElement);
            root.render(
                <React.StrictMode>
                    <App />
                </React.StrictMode>
            );
            
            // Successfully mounted
            hideLoader();
        } catch (e) {
            hideLoader();
            console.error("React Mount Failed", e);
            rootElement.innerHTML = [
                '<div style="padding:40px; color:white; background:#7f1d1d; height:100vh;">',
                    '<h1 style="font-weight:900;">INITIALIZATION CRASH</h1>',
                    '<pre style="font-size:11px; margin-top:20px; color:#fecaca;">' + ((e as Error).stack || (e as Error).message) + '</pre>',
                '</div>'
            ].join('');
        }
    }
}
