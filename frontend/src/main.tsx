import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import App from './App';
import { ThemeProvider } from './components/ThemeContext';
import { setAuthTokenGetter } from './api/apiClient';
import './index.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Component to bind Clerk auth token to apiClient
function ClerkAuthBridge({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    });
  }, [getToken]);

  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      {clerkPubKey && clerkPubKey.startsWith('pk_test_') ? (
        <ClerkProvider publishableKey={clerkPubKey}>
          <ClerkAuthBridge>
            <App />
          </ClerkAuthBridge>
        </ClerkProvider>
      ) : (
        <App />
      )}
    </ThemeProvider>
  </React.StrictMode>
);
