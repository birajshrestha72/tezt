import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

const TOAST_OPTS = {
  style: {
    background: 'var(--bg-card-high)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    fontFamily: 'var(--font)',
    fontSize: '13px',
  },
  success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--bg-card-high)' } },
  error:   { iconTheme: { primary: 'var(--danger)',  secondary: 'var(--bg-card-high)' } },
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster toastOptions={TOAST_OPTS} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
