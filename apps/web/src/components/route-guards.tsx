import { Navigate, Outlet } from 'react-router';

import SessionStatus from 'components/session-status';
import { useSession } from 'hooks/use-session';

type SessionGateProps = {
   /** Who may see the nested routes. */
   allow: 'user' | 'guest';
   redirectTo: string;
};

// These guards only choose which page to show. The API protects the data.
const SessionGate = ({ allow, redirectTo }: SessionGateProps) => {
   const { data: user, isError, isFetching, refetch } = useSession();

   // A failed background check keeps the last known state, so this is only for the first one.
   if (user === undefined) {
      return <SessionStatus isError={isError} isRetrying={isFetching} onRetry={() => void refetch()} />;
   }

   const isAllowed = allow === 'user' ? user !== null : user === null;
   return isAllowed ? <Outlet /> : <Navigate to={redirectTo} replace />;
};

export const RequireUser = () => <SessionGate allow="user" redirectTo="/sign-in" />;

export const RequireGuest = () => <SessionGate allow="guest" redirectTo="/" />;
