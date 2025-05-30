import { useEffect, useState } from 'react';
import { useLocationGranted } from '../../hooks/useLocationPermission';
import { getAllNearUsers, updateUserLocation } from '../../services/authService';
import { User2Icon, MapPinIcon } from 'lucide-react';
import ChatLoader from '../../components/Loader/ChatLoader';
import { createChat } from '../../services/chatService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import SectionContainer from '../../container/SectionContainer';
import { useSocket } from '../../context/SocketContext';

const FindUsers = () => {
    const { locationCoordinates } = useLocationGranted();
    const [nearbyUsers, setNearbyUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { current: socket } = useSocket();

    const updateLocation = async () => {
        try {
            const data = {
                lat: locationCoordinates.latitude,
                lng: locationCoordinates.longitude
            };
            await updateUserLocation(data);
        } catch (error) {
            console.error(error);
            setError('Failed to update location.');
        }
    };

    const getNearbyUsers = async () => {
        try {
            const response = await getAllNearUsers();
            setNearbyUsers(response.data);
        } catch (error) {
            console.error(error);
            setError('Failed to fetch nearby users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (locationCoordinates) {
            updateLocation();
            getNearbyUsers();
        }
    }, [locationCoordinates]);

    useEffect(() => {
        if (!socket) return;

        const handleUserOnline = (userId) => {
            setNearbyUsers((prev) =>
                prev.map((user) =>
                    user._id === userId ? { ...user, isOnline: true } : user
                )
            );
        };

        const handleUserOffline = (userId) => {
            setNearbyUsers((prev) =>
                prev.map((user) =>
                    user._id === userId ? { ...user, isOnline: false } : user
                )
            );
        };

        socket.on('user_online', handleUserOnline);
        socket.on('user_offline', handleUserOffline);

        return () => {
            socket?.off('user_online', handleUserOnline);
            socket?.off('user_offline', handleUserOffline);
        };
    }, [socket]);

    const handleChat = async (user) => {
        try {
            const data = {
                userId: user?._id
            }
            const response = await createChat(data);
            navigate(`/app/chat/${response?.chat?._id}`)
        } catch (error) {
            if (error?.response?.status === 403) {
                toast.error(error?.response?.data?.message);
            }
        }
    };

    return (
        <SectionContainer
            heading="Nearby Users"
            subheading="Connect with people around you"
        >
            {loading ? (
                <ChatLoader />
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : nearbyUsers.length === 0 ? (
                <p className="text-[#726fbb] text-center !pt-60">No nearby users found.</p>
            ) : (
                <ul className="w-full max-w-xl space-y-4 text-[#7970a5]">
                    {nearbyUsers?.map((user) => (
                        <li
                            key={user._id}
                            className="bg-[#fafaff] hover:bg-[#f0efff] p-4 rounded-xl shadow-lg flex items-center justify-between cursor-pointer"
                            onClick={() => handleChat(user)}
                        >
                            <div className="flex items-center space-x-4">
                                <User2Icon className="w-8 h-8" />
                                <div>
                                    <p className="text-lg font-semibold">{user.username}</p>
                                    <p className={`text-sm ${user.isOnline ? 'text-green-300' : 'text-gray-300'}`}>
                                        {user.isOnline ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1 text-sm">
                                <MapPinIcon className="w-4 h-4" />
                                <span>{user.distance.toFixed(2)} km</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </SectionContainer>
    );
};

export default FindUsers;
