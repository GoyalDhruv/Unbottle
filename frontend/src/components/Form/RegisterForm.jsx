import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { useLocationGranted } from '../../hooks/useLocationPermission';
import { InputField } from '../InputField';
import { Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

function RegisterForm() {

    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate()
    const { login } = useAuth();


    const { locationGranted, locationCoordinates } = useLocationGranted();

    const handleRegister = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        const { username, password } = credentials;

        if (!username || !password) return;

        if (!locationGranted) {
            toast.error('Please allow location access to proceed with registration.');
            return;
        }
        if (!locationGranted) {
            toast.error('Please allow location access to proceed with login.');
            return;
        }
        try {
            const data = {
                username: credentials.username,
                password: credentials.password,
                lat: locationCoordinates.latitude,
                lng: locationCoordinates.longitude
            }

            const response = await registerUser(data);

            login(JSON.stringify(response));

            navigate('/app/chats')
            setSubmitted(false);
            setCredentials({ username: '', password: '' });

            toast.success('Login successful!');

        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <form onSubmit={handleRegister} className="w-full max-w-sm bg-[#fafaff] p-8 rounded-xl shadow-md space-y-6">
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
                Register
            </Button>
        </form>
    )
}

export default RegisterForm