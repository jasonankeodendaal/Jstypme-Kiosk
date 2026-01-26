// Relaxed Driver Check for Legacy Engines
setTimeout(function() {
    var requirements = {
        'Promise': typeof Promise !== 'undefined',
        'Map': typeof Map !== 'undefined',
        'Set': typeof Set !== 'undefined'
    };
    var missing = [];
    for (var key in requirements) {
        if (!requirements[key]) { missing.push(key); }
    }
    if (missing.length > 0) {
        if (!window.appStarted) {
            var loader = document.getElementById('system-loader');
            if (loader) loader.style.display = 'none';
            document.getElementById('root').innerHTML = '<div style="padding:40px; color:#ef4444; background:#0f172a; height:100vh; font-family:sans-serif;">' +
                '<h1 style="font-weight:900; font-size:24px;">HARDWARE INCOMPATIBLE</h1>' +
                '<p style="color:white; margin-top:10px;">This device is missing internal drivers: <b>' + missing.join(', ') + '</b></p>' +
                '<p style="color:#64748b; font-size:12px; margin-top:20px;">The Android 5.0 WebView is too old to support modern apps without manual driver injection.</p></div>';
        }
    }
}, 5000);