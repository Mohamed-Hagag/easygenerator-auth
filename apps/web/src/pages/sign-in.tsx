import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import AuthLayout from 'components/auth-layout';
import FormAlert from 'components/form-alert';
import PasswordInput from 'components/password-input';
import Button from 'components/ui/button';
import Field from 'components/ui/field';
import Input from 'components/ui/input';
import { useSignIn } from 'hooks/use-session';
import { type SignInValues, signInSchema } from 'utils/auth-schemas';
import { applySubmitError } from 'utils/form-errors';

const SignInPage = () => {
   const signIn = useSignIn();
   const {
      formState: { errors, isSubmitting },
      handleSubmit,
      register,
      setError,
   } = useForm<SignInValues>({ resolver: zodResolver(signInSchema), defaultValues: { email: '', password: '' } });

   // On success the session changes and the route guard opens the application.
   const onSubmit = handleSubmit(async (values) => {
      try {
         await signIn.mutateAsync(values);
      } catch (error) {
         applySubmitError(error, ['email', 'password'], setError);
      }
   });

   return (
      <AuthLayout title="Sign in" alternative={{ text: 'No account yet?', linkText: 'Sign up', to: '/sign-up' }}>
         <form noValidate onSubmit={onSubmit} className="grid gap-5">
            <FormAlert message={errors.root?.message} />
            <Field label="Email" required error={errors.email?.message}>
               <Input type="email" autoComplete="email" {...register('email')} />
            </Field>
            <Field label="Password" required error={errors.password?.message}>
               <PasswordInput autoComplete="current-password" {...register('password')} />
            </Field>
            <Button type="submit" loading={isSubmitting}>
               Sign in
            </Button>
         </form>
      </AuthLayout>
   );
};

export default SignInPage;
