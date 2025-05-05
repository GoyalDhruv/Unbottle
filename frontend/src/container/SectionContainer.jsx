import { LogOut } from 'lucide-react';
import React from 'react';
import { logoutUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const SectionContainer = ({ heading, subheading, children }) => {

    const { logout } = useAuth();
    const { current: socket } = useSocket();

    const onLogout = async () => {
        try {
            if (!socket) return;

            socket?.disconnect();
            await logoutUser();
            logout();

        } catch (error) {
            toast.error(error?.response?.data?.message);
            console.error(error);
        }
    }

    return (
        <div className="flex flex-col items-center justify-start h-full text-white">
            <div className="sticky top-0 z-10 text-center w-full px-6">
                <div className="relative flex flex-col items-center">
                    {/* Logout Button */}
                    <button
                        onClick={onLogout}
                        className="absolute top-3 right-0 !p-1 text-sm font-medium text-white rounded"
                    >
                        <LogOut className='text-[#726fbb]' />
                    </button>

                    {/* Heading and Subheading */}
                    <div className="text-3xl font-bold pb-3 bg-gradient-to-r from-[#6d67ff] to-[#f16186] bg-clip-text text-transparent">
                        {heading}
                        <p className="text-sm mt-2">
                            {subheading}
                        </p>
                    </div>
                </div>
            </div>

            <div className="home-container w-[420px]">
                {children}
            </div>
        </div>
    );
};

export default SectionContainer;
