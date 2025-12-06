import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { validateEnvironment } from './lib/env';

try {
  validateEnvironment();
} catch (error) {
  console.error('Error de configuración:', error);
  document.body.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px;">
      <div style="background: white; border-radius: 16px; padding: 40px; max-width: 500px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
        <h1 style="color: #e53e3e; margin-bottom: 16px; font-size: 24px;">Error de Configuración</h1>
        <p style="color: #4a5568; margin-bottom: 24px; line-height: 1.6;">${error instanceof Error ? error.message : 'Error desconocido'}</p>
        <p style="color: #718096; font-size: 14px;">Por favor, contacta al administrador del sistema.</p>
      </div>
    </div>
  `;
  throw error;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
