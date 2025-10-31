import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { makeServer } from './mocks/server.js';

if (import.meta.env.MODE !== 'production') {
  makeServer();
}

createRoot(document.getElementById('root')).render(
  <App />
);
