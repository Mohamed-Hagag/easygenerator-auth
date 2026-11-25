import { Navigate, Outlet } from 'react-router';

import PageSpinner from 'components/ui/page-spinner';
import { useSession } from 'hooks/use-session';

// These guards only choose which page to show. The API protects the data.

export const ProtectedRoute = () => {
   const { data: user, isFetched } = useSession();

   if (!isFetched) return <PageSpinner />;
   return user ? <Outlet /> : <Navigate to="/sign-in" replace />;
};

export const GuestRoute = () => {
   const { data: user, isFetched } = useSession();

   if (!isFetched) return <PageSpinner />;
   return user ? <Navigate to="/" replace /> : <Outlet />;
};
