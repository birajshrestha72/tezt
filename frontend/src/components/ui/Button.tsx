import React from 'react';
import './Button.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  title?: string;
  form?: string;
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  type = 'button', 
  onClick, 
  disabled = false, 
  fullWidth = false, 
  title,
  form
}: ButtonProps) {
  return (
    <button 
      type={type} 
      title={title} 
      form={form}
      className={`wm-btn wm-btn--${variant} wm-btn--${size}${fullWidth ? ' wm-btn--fw' : ''}`} 
      onClick={onClick} 
      disabled={disabled}
    >
      {children}
    </button>
  );
}
