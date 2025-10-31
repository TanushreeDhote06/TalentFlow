import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { makeServer } from './mocks/server.js';

// Start MirageJS server in development
// Commented out to allow the app to work as a fully offline demo without a backend
// if (import.meta.env.MODE !== 'production') { 
//   makeServer();
// }

makeServer();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
