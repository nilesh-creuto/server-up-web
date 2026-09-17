import React, { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--text-primary)',
    color: 'var(--bg-base)',
    border: '1px solid var(--text-primary)',
    boxShadow: '0 0 12px rgba(255, 255, 255, 0.1)',
  },
  secondary: {
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-default)',
    boxShadow: 'var(--shadow-sm)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid transparent',
  },
  danger: {
    background: '#1A0B0B',
    color: 'var(--status-failed)',
    border: '1px solid rgba(248, 113, 113, 0.2)',
  },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: '4px 10px', fontSize: 12, borderRadius: 6 },
  md: { padding: '7px 16px', fontSize: 13, borderRadius: 7 },
  lg: { padding: '10px 22px', fontSize: 14, borderRadius: 8 },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  loading = false,
  children,
  disabled,
  style,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'inherit',
        fontWeight: 500,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s, background 0.15s',
        outline: 'none',
        letterSpacing: '-0.01em',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
    >
      {loading && (
        <span
          style={{
            width: 12,
            height: 12,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </button>
  );
};
