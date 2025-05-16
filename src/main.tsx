import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'bg-dark-800 text-white',
          style: {
            border: '1px solid #2e1065',
            padding: '16px',
            color: '#fff',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);