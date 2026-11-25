import type * as React from 'react';

import cn from 'utils/lib/cn';

const fieldControlClasses =
   'w-full rounded-md border border-input bg-background px-3 text-base text-foreground transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground aria-invalid:border-danger aria-invalid:ring-1 aria-invalid:ring-danger motion-reduce:transition-none';

const Input = ({ className, type = 'text', ...props }: React.ComponentProps<'input'>) => (
   <input type={type} className={cn(fieldControlClasses, 'h-12', className)} {...props} />
);
Input.displayName = 'Input';

export default Input;
