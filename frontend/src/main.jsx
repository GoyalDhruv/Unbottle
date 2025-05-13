import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { toasterConfig } from './utils/toastConfig';
import { SocketProvider } from './context/SocketContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ChakraProvider>
    <Router>
      <AuthProvider>
        <SocketProvider>
          <>
            <App />
            <Toaster {...toasterConfig} />
          </>
        </SocketProvider>
      </AuthProvider>
    </Router>
  </ChakraProvider>
);
