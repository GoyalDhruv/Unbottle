import { createContext, useContext, useEffect, useState } from 'react';
import { getDataFromLocalStorage } from '../utils/helper';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = getDataFromLocalStorage()?.token;
        setIsAuthenticated(!!token);
        setLoading(false);
    }, [isAuthenticated]);

    const login = (token) => {
        localStorage.setItem('unbottle', token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        navigate('/')
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
