import { Box, IconButton } from '@chakra-ui/react';
import { ChatIcon, SearchIcon, PhoneIcon } from '@chakra-ui/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: <ChatIcon />, path: '/app/chats' },
        { icon: <SearchIcon />, path: '/app/find' },
        { icon: <PhoneIcon />, path: '/app/calls' },
    ];

    return (
        <Box
            className="max-w-[500px] mx-auto fixed bottom-0 left-0 right-0 bg-white shadow-lg flex justify-around py-2"
            borderTopRadius="xl"
        >
            {navItems.map((item, id) => (
                <IconButton
                    key={id}
                    icon={item.icon}
                    onClick={() => navigate(item.path)}
                    variant="ghost"
                    colorScheme={location.pathname === item.path ? 'purple' : 'gray'}
                />
            ))}
        </Box>
    );
};

export default BottomNav;
