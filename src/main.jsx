import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';
// tiiny.host mode: HashRouter (URLs like /#/blog) so refresh/direct links never 404
const hash = import.meta.env.VITE_HASH === '1';
const Router = hash ? HashRouter : BrowserRouter;
const props = hash ? {} : { basename: import.meta.env.BASE_URL.replace(/\/$/, '') };
createRoot(document.getElementById('root')).render(<Router {...props}><App /></Router>);
