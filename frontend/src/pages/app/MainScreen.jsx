import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import { Box } from '@chakra-ui/react';
import { useEffect } from 'react';

const MainScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.pathname === '/app') {
            navigate('/app/chats');
        }
    }, [location, navigate]);

    return (
        <Box className="min-h-screen bg-gradient-to-b from-[#dbd7f4] to-[#eeecf7]">
            <Box className="pb-20 px-4 pt-4">
                <Outlet />
            </Box>
            <BottomNav />
        </Box>
    );
};

export default MainScreen;
