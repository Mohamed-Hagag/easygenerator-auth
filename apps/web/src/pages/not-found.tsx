import { Link } from 'react-router';

const NotFoundPage = () => (
   <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <title>Page not found | Easy Auth</title>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <Link to="/" className="font-bold text-primary underline underline-offset-4">
         Go to the home page
      </Link>
   </main>
);

export default NotFoundPage;
