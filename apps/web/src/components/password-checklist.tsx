import { Check, Circle } from 'lucide-react';

import { PASSWORD_RULES } from 'utils/auth-schemas';
import cn from 'utils/lib/cn';

type PasswordChecklistProps = {
   password: string;
};

const PasswordChecklist = ({ password }: PasswordChecklistProps) => (
   <ul className="grid gap-1">
      {PASSWORD_RULES.map(({ label, test }) => {
         const isMet = test(password);
         const Icon = isMet ? Check : Circle;

         return (
            <li key={label} className={cn('flex items-center gap-2', isMet && 'text-success')}>
               <Icon aria-hidden="true" className="size-4 shrink-0" />
               {label}
               <span className="sr-only">{isMet ? ' (met)' : ' (not met)'}</span>
            </li>
         );
      })}
   </ul>
);

export default PasswordChecklist;
