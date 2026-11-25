import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from 'utils/api-client';
import { ApiError } from 'utils/api-error';
import type { SignInValues, SignUpValues } from 'utils/auth-schemas';

export type User = {
   id: string;
   email: string;
   name: string;
};

const SESSION_KEY = ['session'];

/** null means "not signed in". Other failures stay errors, so a failed background check keeps the last known user. */
const fetchSession = async (): Promise<User | null> => {
   try {
      return await apiRequest<User>('/users/me');
   } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
         return null;
      }
      throw error;
   }
};

export const useSession = () =>
   useQuery({
      queryKey: SESSION_KEY,
      queryFn: fetchSession,
      // Checked again whenever the tab gets focus, e.g. after logging out in another tab.
      refetchOnMount: false,
      refetchOnWindowFocus: 'always',
   });

const useSetSession = () => {
   const queryClient = useQueryClient();

   return async (user: User | null): Promise<void> => {
      // A check that started earlier must not overwrite the new state.
      await queryClient.cancelQueries({ queryKey: SESSION_KEY });
      queryClient.setQueryData(SESSION_KEY, user);
   };
};

export const useSignUp = () => {
   const setSession = useSetSession();
   return useMutation({
      mutationFn: (values: SignUpValues) => apiRequest<User>('/auth/signup', { method: 'POST', body: values, changesSession: true }),
      onSuccess: setSession,
   });
};

export const useSignIn = () => {
   const setSession = useSetSession();
   return useMutation({
      mutationFn: (values: SignInValues) => apiRequest<User>('/auth/signin', { method: 'POST', body: values, changesSession: true }),
      onSuccess: setSession,
   });
};

export const useLogout = () => {
   const setSession = useSetSession();
   return useMutation({
      mutationFn: () => apiRequest<void>('/auth/logout', { method: 'POST', changesSession: true }),
      onSuccess: () => setSession(null),
   });
};
