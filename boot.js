(function() {
  window.appStarted = false;
  
  // --- KIOSK ANTI-FREEZE WATCHDOG ---
  var lastHeartbeat = Date.now();
  window.signalAppHeartbeat = function() {
      lastHeartbeat = Date.now();
  };

  // Separate monitoring interval (simulating a worker thread logic)
  // If main thread freezes for more than 60s, force refresh.
  // GATED: Admin mode ignores this to prevent unintended reloads during editing.
  // UPDATE: Increased to 60s to allow slower tablets to hydrate the React bundle.
  var watchdogTimer = setInterval(function() {
      var now = Date.now();
      var isAdmin = window.location.pathname.indexOf('/admin') !== -1;
      
      if (!isAdmin && (now - lastHeartbeat > 60000)) {
          console.error("CRITICAL: Application freeze detected. Rebooting Kiosk Firmware...");
          window.location.reload();
      }
  }, 5000);

  // Daily Maintenance: Hard refresh at 3AM to clear browser heap
  // Only for Kiosks, not for Admins.
  setInterval(function() {
      var now = new Date();
      var isAdmin = window.location.pathname.indexOf('/admin') !== -1;
      if (!isAdmin && now.getHours() === 3 && now.getMinutes() === 0) {
          window.location.reload();
      }
  }, 60000);

  // --- CRITICAL KIOSK DIAGNOSTIC: SYSTEM CLOCK CHECK ---
  var currentYear = new Date().getFullYear();
  if (currentYear < 2024) {
      window.onload = function() {
          var loader = document.getElementById('system-loader');
          if (loader) loader.style.display = 'none';
          document.body.innerHTML = [
              '<div style="padding:40px; color:white; background:#7f1d1d; height:100vh; font-family: sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">',
                  '<div style="font-size:60px; margin-bottom:20px;">⏰</div>',
                  '<h1 style="font-weight:900; font-size: 28px; margin-bottom:10px;">SYSTEM CLOCK EXPIRED</h1>',
                  '<p style="max-width:400px; line-height:1.5; opacity:0.8;">The tablet clock is set to <b>' + currentYear + '</b>. This prevents a secure connection (SSL/HSTS) to the cloud server.</p>',
                  '<div style="margin-top:30px; padding:20px; border: 2px dashed rgba(255,255,255,0.3); border-radius:15px;">',
                      '<p style="font-weight:bold; margin-bottom:10px; color:#fca5a5;">REQUIRED ACTION:</p>',
                      '<p style="font-size:14px;">Go to Android Settings &rarr; Date & Time &rarr; Set to <b>Automatic</b> or current date.</p>',
                  '</div>',
                  '<button onclick="window.location.reload()" style="margin-top:30px; padding:15px 30px; background:white; color:#7f1d1d; border:none; border-radius:10px; font-weight:900; text-transform:uppercase; letter-spacing:1px;">Retry Connection</button>',
              '</div>'
          ].join('');
      };
      return; 
  }

  if (typeof window.globalThis === 'undefined') { window.globalThis = window; }
  if (typeof window.global === 'undefined') { window.global = window; }
  window.process = { env: { NODE_ENV: 'production' } };
  
  // --- GLOBAL ERROR SUPPRESSION (SYNC) ---
  window.onerror = function(msg, url, lineNo, columnNo, error) {
      // IGNORE MESSAGE CHANNEL & LEGACY ENGINE ERRORS
      // These are internal worker communication failures on legacy WebViews (Chrome 37-55)
      // when handling PDFs or large blobs. They do not necessarily crash the React UI.
      var strMsg = String(msg).toLowerCase();
      if (
          strMsg.indexOf('message channel') !== -1 || 
          strMsg.indexOf('channel closed') !== -1 ||
          strMsg.indexOf('resizeobserver') !== -1 ||
          strMsg.indexOf('extension') !== -1 ||
          strMsg.indexOf('script error') !== -1
      ) {
          console.warn("Suppressing Engine Error: " + msg);
          return true; // Prevents default handler
      }

      var loaderText = document.getElementById('loader-text');
      if (loaderText) {
          loaderText.style.color = '#ef4444';
          loaderText.innerHTML = "BOOT ERROR: " + msg;
      }
      return false;
  };

  // --- GLOBAL PROMISE REJECTION SUPPRESSION (ASYNC) ---
  // Handles "Uncaught (in promise) Error: A listener indicated an asynchronous response..."
  window.onunhandledrejection = function(event) {
      var msg = event.reason ? (event.reason.message || String(event.reason)) : 'Unknown Promise Error';
      var strMsg = String(msg).toLowerCase();
      
      if (
          strMsg.indexOf('message channel') !== -1 || 
          strMsg.indexOf('channel closed') !== -1 ||
          strMsg.indexOf('resizeobserver') !== -1 ||
          strMsg.indexOf('asynchronous response') !== -1
      ) {
          // Prevent the error from hitting the console as "Uncaught"
          event.preventDefault(); 
          console.warn("Suppressing Async Engine Error: " + msg);
          return;
      }
  };

  window.onload = function() {
      setTimeout(function() {
          if (!window.appStarted) {
              var text = document.getElementById('loader-text');
              if (text) {
                  text.style.color = '#f59e0b';
                  text.innerHTML = "SYSTEM HANG DETECTED...<br><span style='font-size:8px; opacity:0.6'>Performing automatic driver reset.</span>";
                  setTimeout(function() { 
                      var isAdmin = window.location.pathname.indexOf('/admin') !== -1;
                      if (!isAdmin) window.location.reload(); 
                  }, 2000);
              }
          }
      }, 12000);
  };
})();