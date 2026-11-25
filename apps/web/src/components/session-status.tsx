import Button from 'components/ui/button';
import Spinner from 'components/ui/spinner';

type SessionStatusProps = {
   isError: boolean;
   isRetrying: boolean;
   onRetry: () => void;
};

/** Shown while it is not yet known whether the user is signed in. */
const SessionStatus = ({ isError, isRetrying, onRetry }: SessionStatusProps) => (
   <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <title>Easy Auth</title>
      {isError ? (
         <>
            <p role="alert">We could not check your session. Please try again.</p>
            <Button onClick={onRetry} loading={isRetrying}>
               Retry
            </Button>
         </>
      ) : (
         <div role="status">
            <Spinner className="size-8 text-primary" />
            <span className="sr-only">Loading</span>
         </div>
      )}
   </main>
);

export default SessionStatus;
