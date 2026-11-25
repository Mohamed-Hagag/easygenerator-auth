import { CircleAlert } from 'lucide-react';

type FormAlertProps = {
   message?: string;
};

// The container is always rendered, so screen readers announce a message that appears later.
// While empty it is taken out of the layout, so it adds no gap.
const FormAlert = ({ message }: FormAlertProps) => (
   <div role="alert" className="empty:absolute">
      {message ? (
         <p className="flex items-start gap-2 rounded-md border border-danger p-3 text-sm text-danger">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {message}
         </p>
      ) : null}
   </div>
);

export default FormAlert;
