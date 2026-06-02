import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './styles/globals.css';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false, // Disable retry - use demo data on failure
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Only start MSW if explicitly enabled or if no real API URL is set in dev
const shouldEnableMSW = import.meta.env.VITE_ENABLE_MSW === 'true'
  || (!import.meta.env.VITE_API_URL && import.meta.env.DEV);

async function startApp() {
  if (shouldEnableMSW) {
    try {
      const { worker } = await import('./mocks/browser');
      await worker.start({ onUnhandledRequest: 'bypass' });
    } catch {
      // MSW failed to start, continue without it
    }
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </React.StrictMode>
  );
}

startApp();
