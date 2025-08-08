import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'gradient'
  | 'success'
  | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  elevated?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth,
      children,
      disabled,
      type = 'button',
      variant = 'primary',
      size = 'md',
      pill = false,
      elevated = false,
      ...props
    },
    ref
  ) => {
    const roundedClasses = pill ? 'rounded-full' : 'rounded-xl';
    const elevationClasses = elevated ? 'shadow-sm hover:shadow-md' : '';
    const baseClasses = cn(
      'inline-flex items-center justify-center font-semibold whitespace-nowrap select-none',
      'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
      'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
      roundedClasses,
      elevationClasses,
    );

    const variantClasses: Record<ButtonVariant, string> = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-900 text-white hover:bg-gray-800',
      outline: 'border border-gray-300 text-gray-900 hover:bg-gray-50',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
      gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700',
      success: 'bg-emerald-600 text-white hover:bg-emerald-700',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
    };

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-5',
      lg: 'h-12 px-6 text-base',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], fullWidth && 'w-full', className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          <span className="inline-flex items-center justify-center mr-2">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !isLoading && (
          <span className="inline-flex items-center justify-center ml-2">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };