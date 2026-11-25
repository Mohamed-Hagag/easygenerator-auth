import type * as React from 'react';

import { Link } from 'react-router';

type AuthLayoutProps = {
   title: string;
   /** Link to the other form. */
   alternative: { text: string; linkText: string; to: string };
   children: React.ReactNode;
};

const AuthLayout = ({ title, alternative, children }: AuthLayoutProps) => (
   <main className="flex min-h-dvh items-center justify-center px-4 py-8">
      <title>{`${title} | Easy Auth`}</title>
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-sm sm:p-8">
         <h1 className="mb-6 text-2xl font-bold">{title}</h1>
         {children}
         <p className="mt-6 text-center text-sm text-muted-foreground">
            {alternative.text}{' '}
            <Link to={alternative.to} className="font-bold text-primary underline underline-offset-4">
               {alternative.linkText}
            </Link>
         </p>
      </div>
   </main>
);

export default AuthLayout;
