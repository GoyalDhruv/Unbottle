import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = JSON.parse(localStorage.getItem('unbottle'));
        setIsAuthenticated(!!token);
        setLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem('unbottle', token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('unbottle');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
