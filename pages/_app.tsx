// 🚀 Main App Component with AuthProvider - AUTH_MODULE
// pages/_app.tsx

import type { AppProps } from 'next/app';
import { AuthProvider } from '../modules/auth/hooks/useAuth';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
