import type * as React from 'react';

import * as LabelPrimitive from '@radix-ui/react-label';

import cn from 'utils/lib/cn';

const Label = ({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) => (
   <LabelPrimitive.Root className={cn('text-sm font-bold text-foreground', className)} {...props} />
);
Label.displayName = LabelPrimitive.Root.displayName;

export default Label;
