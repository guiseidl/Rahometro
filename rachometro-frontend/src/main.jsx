// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx'; // Importe seu componente App que contém o roteador

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);