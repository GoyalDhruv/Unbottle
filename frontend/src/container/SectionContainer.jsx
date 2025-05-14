import { LogOut } from 'lucide-react';
import React, { useRef } from 'react';
import { logoutUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Button,
    useDisclosure,
} from '@chakra-ui/react';

const SectionContainer = ({ heading, subheading, children }) => {
    const { logout } = useAuth();
    const { current: socket } = useSocket();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef();

    const onLogout = async () => {
        try {
            if (!socket) return;

            socket.disconnect();
            await logoutUser();
            logout();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Logout failed');
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-start h-full text-white">
            <div className="sticky top-0 z-10 text-center w-full px-6">
                <div className="relative flex flex-col items-center">
                    {/* Logout Button */}
                    <button
                        onClick={onOpen}
                        className="absolute top-3 right-0 !p-1 text-sm font-medium text-white rounded"
                    >
                        <LogOut className="text-[#726fbb]" />
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

            {/* Logout Confirmation Modal */}
            <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
                <AlertDialogOverlay>
                    <AlertDialogContent className="bg-gradient-to-b from-[#dbd7f4] to-[#eeecf7] shadow-xl">
                        <AlertDialogHeader fontSize="3xl" fontWeight="bold" className="heading-color text-center">
                            Confirm Logout
                        </AlertDialogHeader>

                        <AlertDialogBody className="text-start">
                            Are you sure you want to log out?
                        </AlertDialogBody>

                        <AlertDialogFooter className="flex justify-center gap-4">
                            <Button ref={cancelRef} onClick={onClose} className="!rounded-full !text-[#6d67ff] !border-[#6d67ff] !border !bg-white !px-8">
                                Cancel
                            </Button>
                            <Button
                                className="!rounded-full !text-white !bg-[#6d67ff] !px-8"
                                onClick={() => {
                                    onLogout();
                                    onClose();
                                }}>
                                Logout
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </div>
    );
};

export default SectionContainer;
