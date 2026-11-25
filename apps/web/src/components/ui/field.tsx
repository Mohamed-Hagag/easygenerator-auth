import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { CircleAlert } from 'lucide-react';

import Label from 'components/ui/label';

type FieldProps = {
   label: React.ReactNode;
   /** Help shown under the control, e.g. the expected format or a list of rules. */
   hint?: React.ReactNode;
   error?: string;
   /** Exactly one control (Input, Textarea, Select trigger, ...). Field adds id and aria-* props to it via Slot. */
   children: React.ReactElement;
};

// Every field in this app is required.
const Field = ({ label, hint, error, children }: FieldProps) => {
   const id = React.useId();
   const hintId = `${id}-hint`;
   const errorId = `${id}-error`;

   // Error first, so screen readers read the problem before the general hint.
   const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

   return (
      <div className="flex flex-col gap-1.5">
         <Label htmlFor={id}>{label}</Label>

         <Slot id={id} aria-describedby={describedBy} aria-invalid={error ? true : undefined} aria-required>
            {children}
         </Slot>

         {hint ? (
            <div id={hintId} className="text-sm text-muted-foreground">
               {hint}
            </div>
         ) : null}

         {error ? (
            <p id={errorId} className="flex items-start gap-1.5 text-sm text-danger">
               <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
               {error}
            </p>
         ) : null}
      </div>
   );
};
Field.displayName = 'Field';

export default Field;
