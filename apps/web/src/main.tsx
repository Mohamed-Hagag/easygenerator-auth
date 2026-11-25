import { StrictMode } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import App from './App';
import './index.css';
import { queryClient } from 'utils/query-client';

const root = document.getElementById('root');
if (!root) {
   throw new Error('Missing #root element');
}

createRoot(root).render(
   <StrictMode>
      <QueryClientProvider client={queryClient}>
         <BrowserRouter>
            <App />
         </BrowserRouter>
      </QueryClientProvider>
   </StrictMode>,
);
