import * as React from 'react';

import { Eye, EyeOff } from 'lucide-react';

import Input from 'components/ui/input';

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, 'type' | 'className'>;

const PasswordInput = (props: PasswordInputProps) => {
   const [isVisible, setIsVisible] = React.useState(false);
   const Icon = isVisible ? EyeOff : Eye;

   return (
      <div className="relative">
         <Input {...props} type={isVisible ? 'text' : 'password'} autoCapitalize="none" spellCheck={false} className="pr-12" />
         <button
            type="button"
            aria-label="Show password"
            aria-pressed={isVisible}
            onClick={() => setIsVisible((current) => !current)}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
         >
            <Icon aria-hidden="true" className="size-5" />
         </button>
      </div>
   );
};

export default PasswordInput;
