import Spinner from 'components/ui/spinner';

const PageSpinner = () => (
   <main className="flex min-h-dvh items-center justify-center">
      <div role="status">
         <Spinner className="size-8 text-primary" />
         <span className="sr-only">Loading</span>
      </div>
   </main>
);

export default PageSpinner;
