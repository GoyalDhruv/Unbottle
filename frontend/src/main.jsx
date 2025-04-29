import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './context/userContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { toasterConfig } from './utils/toastConfig';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ChakraProvider>
    <Router>
      <UserProvider>
        <AuthProvider>
          <>
            <App />
            <Toaster {...toasterConfig} />
          </>
        </AuthProvider>
      </UserProvider>
    </Router>
  </ChakraProvider>
);
