import React, { useState } from 'react'
import { useLocationGranted } from '../../hooks/useLocationPermission';
import toast from 'react-hot-toast';
import { InputField } from '../InputField';
import { Button } from '@chakra-ui/react';

function LoginForm() {

    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [submitted, setSubmitted] = useState(false);

    const locationGranted = useLocationGranted();

    const handleLogin = (e) => {
        e.preventDefault();
        setSubmitted(true);
        const { username, password } = credentials;
        if (!username || !password) return;

        if (!locationGranted) {
            toast.error('Please allow location access to proceed with login.');
            return;
        }

        console.log('Logging in:', credentials);
        toast.success('Login successful!');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-[#fafaff] p-8 rounded-xl shadow-md space-y-6" >
            <InputField
                isRequired={true}
                name="username"
                type="text"
                label="Username"
                placeholder="Enter username"
                value={credentials.username}
                onChange={handleChange}
                error={credentials.username === '' ? 'Username is required' : null}
                submitted={submitted}
            />

            <InputField
                isRequired={true}
                name="password"
                type="password"
                label="Password"
                placeholder="Enter password"
                value={credentials.password}
                onChange={handleChange}
                error={credentials.password === '' ? 'Password is required' : null}
                submitted={submitted}
            />

            <Button type="submit" size="lg" className="primary-btn">
                Login
            </Button>
        </form>
    )
}

export default LoginForm