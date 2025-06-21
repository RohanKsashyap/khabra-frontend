import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth,
    children,
    disabled,
    type = 'button',
    ...props
  }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn('button button-item', fullWidth && 'w-full', className)}
        disabled={disabled || isLoading}
        {...props}
      >
        <span className="button-bg">
          <span className="button-bg-layers">
            <span className="button-bg-layer button-bg-layer-1 -purple"></span>
            <span className="button-bg-layer button-bg-layer-2 -turquoise"></span>
            <span className="button-bg-layer button-bg-layer-3 -yellow"></span>
          </span>
        </span>
        <span className="button-inner">
          <span className="button-inner-static flex items-center justify-center w-full">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : leftIcon ? (
              <span className="inline-flex items-center justify-center">{leftIcon}</span>
            ) : null}
            {children}
            {rightIcon && !isLoading && <span className="inline-flex items-center justify-center">{rightIcon}</span>}
          </span>
          <span className="button-inner-hover flex items-center justify-center w-full">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : leftIcon ? (
              <span className="inline-flex items-center justify-center">{leftIcon}</span>
            ) : null}
            {children}
            {rightIcon && !isLoading && <span className="inline-flex items-center justify-center">{rightIcon}</span>}
          </span>
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };