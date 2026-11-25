import { Route, Routes } from 'react-router';

import ApplicationPage from 'pages/application';
import NotFoundPage from 'pages/not-found';
import SignInPage from 'pages/sign-in';
import SignUpPage from 'pages/sign-up';

const App = () => (
   <Routes>
      <Route path="/" element={<ApplicationPage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="*" element={<NotFoundPage />} />
   </Routes>
);

export default App;
