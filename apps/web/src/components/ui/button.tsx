import type * as React from 'react';

import { type VariantProps, cva } from 'class-variance-authority';

import Spinner from 'components/ui/spinner';
import cn from 'utils/lib/cn';

// Keyboard focus uses the global :focus-visible outline from index.css, so every control looks the same.
const buttonVariants = cva(
   'inline-flex items-center justify-center gap-2 rounded-md font-bold transition-colors disabled:pointer-events-none motion-reduce:transition-none',
   {
      variants: {
         variant: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 disabled:bg-border disabled:text-muted-foreground',
            secondary:
               'border-2 border-primary bg-background text-primary hover:bg-primary/10 active:bg-primary/20 disabled:border-border disabled:text-muted-foreground',
            tertiary: 'bg-transparent text-primary underline underline-offset-4 hover:text-primary/80 disabled:text-muted-foreground',
         },
         size: {
            default: 'h-12 px-6 text-sm',
            sm: 'h-9 px-3 text-xs',
            text: '',
         },
      },
      defaultVariants: {
         variant: 'default',
         size: 'default',
      },
   },
);

const spinnerVariants = cva('', {
   variants: {
      size: {
         default: 'size-5',
         sm: 'size-4',
         text: 'size-4',
      },
   },
   defaultVariants: {
      size: 'default',
   },
});

type ButtonProps = React.ComponentProps<'button'> &
   VariantProps<typeof buttonVariants> & {
      loading?: boolean;
   };

const Button = ({ className, variant, size, loading = false, disabled = false, type = 'button', children, onClick, ...props }: ButtonProps) => {
   return (
      // While loading the button is aria-disabled (not disabled) and ignores clicks: a disabled button loses keyboard focus,
      // which would drop the user to the page body right after pressing it.
      <button
         type={type}
         className={cn(buttonVariants({ variant, size, className }), loading && 'cursor-wait')}
         disabled={disabled}
         aria-disabled={loading || undefined}
         aria-busy={loading || undefined}
         {...props}
         onClick={(event) => {
            if (loading) {
               // Also stops a submit button from submitting its form again.
               event.preventDefault();
               return;
            }
            onClick?.(event);
         }}
      >
         {loading ? (
            <>
               <Spinner className={spinnerVariants({ size })} />
               {/* Keeps the accessible name while the spinner replaces the visible label. */}
               <span className="sr-only">{children}</span>
            </>
         ) : (
            children
         )}
      </button>
   );
};
Button.displayName = 'Button';

export default Button;
