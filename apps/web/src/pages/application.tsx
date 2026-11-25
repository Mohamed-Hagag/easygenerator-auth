import FormAlert from 'components/form-alert';
import Button from 'components/ui/button';
import { useLogout, useSession } from 'hooks/use-session';

const ApplicationPage = () => {
   const { data: user } = useSession();
   const logout = useLogout();

   return (
      <main className="flex min-h-dvh items-center justify-center px-4 py-8">
         <title>Easy Auth</title>
         <div className="grid w-full max-w-md gap-6 rounded-xl border border-border bg-background p-6 text-center shadow-sm sm:p-8">
            <h1 className="text-2xl font-bold">Welcome to the application.</h1>
            <p className="wrap-anywhere text-muted-foreground">Signed in as {user?.name}</p>
            <FormAlert message={logout.isError ? 'You are still signed in because logging out failed. Please try again.' : undefined} />
            <Button variant="secondary" loading={logout.isPending} onClick={() => logout.mutate()}>
               Log out
            </Button>
         </div>
      </main>
   );
};

export default ApplicationPage;
