import type * as React from 'react';

import { LoaderCircle } from 'lucide-react';

import cn from 'utils/lib/cn';

// Decorative: the element using the spinner is responsible for announcing the busy state (e.g. aria-busy).
// With reduced motion it keeps turning, slowly, because it signals that work is still in progress.
const Spinner = ({ className, ...props }: React.ComponentProps<typeof LoaderCircle>) => (
   <LoaderCircle aria-hidden="true" className={cn('size-5 animate-spin motion-reduce:animate-[spin_3s_linear_infinite]', className)} {...props} />
);
Spinner.displayName = 'Spinner';

export default Spinner;
