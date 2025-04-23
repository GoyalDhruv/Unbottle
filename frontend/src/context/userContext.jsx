import React, { createContext, useState, useContext } from 'react';

// Create a User Context
const UserContext = createContext();

// Custom hook to use the User Context
export const useUserContext = () => useContext(UserContext);

// User Context Provider component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};
