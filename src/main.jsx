import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from './router.jsx';
import App from './App.jsx';
import './styles.css';
import { loadConfig } from './lib.js';
loadConfig().then(() => createRoot(document.getElementById('root')).render(<HashRouter><App /></HashRouter>));
