import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{ 
            duration: 4000, 
            style: { 
              borderRadius: '8px', 
              fontSize: '13px', 
              maxWidth: '360px',
              background: '#333',
              color: '#fff'
            } 
          }} 
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
