import { useState } from 'react';
import { Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import LoginForm from '../components/Form/LoginForm';

export default function Login() {

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-bl from-[#e5e0ff] to-[#f7f4ff] p-6">
            <PageHeader
                title="Welcome Back"
                subtitle="Login to Unbottle and continue the conversation."
            />

            <LoginForm />

            <Text className="text-center text-sm  text-gray-700 !pt-10">
                New here?
                <Link to="/register">
                    <span className="text-[#6d67ff] font-semibold ms-1">
                        Create an account
                    </span>
                </Link>
            </Text>
        </div>
    );
}
