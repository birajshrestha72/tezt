import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './css/variables.css';
import './css/reset.css';
import './css/layout.css';
import './css/components.css';
import './css/table.css';
import './css/forms.css';
import './css/modal.css';
import './css/skeleton.css';
import './css/auth.css';
import './css/pages.css';
import './css/toast.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
