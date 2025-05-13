import { Box, IconButton } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Phone, UserSearch } from 'lucide-react';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: <MessageCircle size={20} />, path: '/app/chats' },
        { icon: <UserSearch size={20} />, path: '/app/find' },
        { icon: <Phone />, path: '/app/calls' },
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
