
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Android 5.0 WebView might have issues with strict mode or specific React 19 features
// Ensuring we mount safely
const rootElement = document.getElementById('root');

if (!rootElement) {
  alert("FATAL: Root element missing.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (e) {
    console.error("Mount failed", e);
    // Emergency fallback for very old browsers where createRoot might fail
    (rootElement as any).innerHTML = '<div style="padding:40px; color:black;"><h1>Update Required</h1><p>The system is initializing but the browser engine is too old.</p></div>';
  }
}
