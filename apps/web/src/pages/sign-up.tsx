import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';

import AuthLayout from 'components/layouts/auth-layout';
import PasswordChecklist from 'components/password-checklist';
import Button from 'components/ui/button';
import Field from 'components/ui/field';
import FormAlert from 'components/ui/form-alert';
import Input from 'components/ui/input';
import PasswordInput from 'components/ui/password-input';
import { useSignUp } from 'hooks/use-session';
import { type SignUpValues, signUpSchema } from 'utils/auth-schemas';
import { applySubmitError } from 'utils/form-errors';

const SignUpPage = () => {
   const signUp = useSignUp();
   const {
      control,
      formState: { errors, isSubmitting },
      handleSubmit,
      register,
      setError,
   } = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema), defaultValues: { email: '', name: '', password: '' } });
   const password = useWatch({ control, name: 'password' });

   // On success the session changes and the route guard opens the application.
   const onSubmit = handleSubmit(async (values) => {
      try {
         await signUp.mutateAsync(values);
      } catch (error) {
         applySubmitError(error, ['email', 'name', 'password'], setError);
      }
   });

   return (
      <AuthLayout title="Create your account" alternative={{ text: 'Already have an account?', linkText: 'Sign in', to: '/sign-in' }}>
         <form noValidate onSubmit={onSubmit} className="grid gap-5">
            <FormAlert message={errors.root?.message} />
            <Field label="Email" error={errors.email?.message}>
               <Input type="email" autoComplete="email" {...register('email')} />
            </Field>
            <Field label="Name" error={errors.name?.message}>
               <Input autoComplete="name" {...register('name')} />
            </Field>
            <Field label="Password" error={errors.password?.message} hint={<PasswordChecklist password={password} />}>
               <PasswordInput autoComplete="new-password" {...register('password')} />
            </Field>
            <Button type="submit" loading={isSubmitting}>
               Sign up
            </Button>
         </form>
      </AuthLayout>
   );
};

export default SignUpPage;
