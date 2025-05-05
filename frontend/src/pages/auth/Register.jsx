import { useState } from 'react';
import { Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import RegisterForm from '../../components/Form/RegisterForm';

export default function Register() {

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-bl from-[#e5e0ff] to-[#f7f4ff] p-6">
            <PageHeader
                title="Create Account"
                subtitle="Join Unbottle and start chatting anonymously."
            />

            <RegisterForm />

            <Text className="text-center text-sm text-gray-700 !pt-10">
                Already have an account?
                <Link to="/login">
                    <span className="text-[#6d67ff] font-semibold ms-1">
                        Login
                    </span>
                </Link>
            </Text>
        </div>
    );
}
