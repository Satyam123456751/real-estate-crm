import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Reset default browser styles
const style = document.createElement('style');
style.innerHTML = `* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
