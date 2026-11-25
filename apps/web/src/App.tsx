import { Route, Routes } from 'react-router';

import { GuestRoute, ProtectedRoute } from 'components/layouts/route-guards';
import HomePage from 'pages/home';
import NotFoundPage from 'pages/not-found';
import SignInPage from 'pages/sign-in';
import SignUpPage from 'pages/sign-up';

const App = () => (
   <Routes>
      <Route element={<ProtectedRoute />}>
         <Route path="/" element={<HomePage />} />
      </Route>
      <Route element={<GuestRoute />}>
         <Route path="/sign-in" element={<SignInPage />} />
         <Route path="/sign-up" element={<SignUpPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
   </Routes>
);

export default App;
