import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './app';
import theme from './theme';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element. Ensure index.html has a <div id="root"></div>');
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);