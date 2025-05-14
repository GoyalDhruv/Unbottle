import { useEffect, useState } from "react";
import { getChatsByUser } from "../../services/chatService";
import { useNavigate } from "react-router-dom";
import { Image, User2Icon, VideoIcon } from "lucide-react";
import { formatDateHeading, formatTime } from '../../utils/helper';
import { getDataFromLocalStorage } from '../../utils/helper';
import ChatLoader from "../../components/Loader/ChatLoader";
import SectionContainer from "../../container/SectionContainer";
import { Badge } from "@chakra-ui/react";
import { useSocket } from "../../context/SocketContext";

const Chats = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { current: socket } = useSocket();
    const currentUserId = getDataFromLocalStorage()?._id;

    const getAllChats = async () => {
        try {
            const res = await getChatsByUser();
            setChats(res?.chats || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllChats();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = ({ newMessage, chatId }) => {
            if (chatId !== newMessage.chat) return;
            setChats(prevChats => {
                const updatedChats = prevChats.map(chat => {
                    if (chat._id === newMessage.chat) {
                        const isCurrentUserSender = newMessage.sender._id === currentUserId;
                        const unSeenCount = !isCurrentUserSender
                            ? (chat.unSeenCount || 0) + 1
                            : chat.unSeenCount || 0;

                        return {
                            ...chat,
                            lastMessage: newMessage,
                            unSeenCount,
                            updatedAt: new Date()
                        };
                    }
                    return chat;
                });

                return [
                    updatedChats.find(chat => chat._id === newMessage.chat),
                    ...updatedChats.filter(chat => chat._id !== newMessage.chat)
                ].filter(Boolean);
            });
        };

        const handleMessagesSeen = (seenMessages) => {
            if (!seenMessages.length) return;

            const chatId = seenMessages[0].chat;
            setChats(prevChats =>
                prevChats.map(chat =>
                    chat._id === chatId
                        ? { ...chat, unSeenCount: 0 }
                        : chat
                )
            );
        };

        const joinChatRooms = () => {
            if (chats.length > 0) {
                chats.forEach(chat => {
                    socket.emit('join_chat', chat._id);
                });
            }
        };

        socket.on('message_received', handleNewMessage);
        socket.on('messages_seen_update', handleMessagesSeen);

        const joinTimeout = setTimeout(joinChatRooms, 500);

        return () => {
            socket.off('message_received', handleNewMessage);
            socket.off('messages_seen_update', handleMessagesSeen);
            clearTimeout(joinTimeout);
        };
    }, [socket, chats, currentUserId]);

    return (
        <SectionContainer
            heading="Chats"
            subheading="Your recent conversations will appear here."
        >
            {loading ? (
                <ChatLoader />
            ) : chats.length === 0 ? (
                <p className="text-[#726fbb] text-center !pt-60">No chats found.</p>
            ) : (
                <ul className="w-full max-w-xl space-y-4 text-[#7970a5]">
                    {chats.map((chat) => {
                        const otherUser = chat?.participants?.find((p) => p?._id !== currentUserId);
                        const lastMessageSenderIsCurrentUser = chat?.lastMessage?.sender === currentUserId;

                        return (
                            <li
                                key={chat?._id}
                                onClick={() => navigate(`/app/chat/${chat._id}`)}
                                className="bg-[#fafaff] hover:bg-[#f0efff] p-4 rounded-xl shadow-lg flex items-center justify-between cursor-pointer"
                            >
                                <div className="flex items-center space-x-4">
                                    <User2Icon className="w-8 h-8" />
                                    <div>
                                        <p className="font-semibold text-lg">{otherUser?.username || 'User'}</p>
                                        <p className={`text-sm text-gray-500 truncate max-w-[200px] flex items-center gap-1 ${chat?.unSeenCount > 0 ? 'font-bold ' : ''}`}>
                                            {chat?.lastMessage ? (
                                                <>
                                                    <span>
                                                        {lastMessageSenderIsCurrentUser ? 'You: ' : `${otherUser?.username}: `}
                                                    </span>
                                                    <span>
                                                        {chat.lastMessage?.type === 'text' ? (
                                                            chat.lastMessage.content
                                                        ) : (
                                                            chat?.lastMessage?.content ?
                                                                <Image size={16} />
                                                                :
                                                                <VideoIcon size={16} />
                                                        )}
                                                    </span>
                                                </>
                                            ) : (
                                                'No Active Conversation.'
                                            )}
                                        </p>

                                    </div>
                                </div>
                                <div className="text-gray-500 flex-column items-center">
                                    <div className="text-xs">
                                        {formatDateHeading(chat?.updatedAt) === 'Today' ? '' : formatDateHeading(chat?.updatedAt)} {formatDateHeading(chat?.updatedAt) === 'Today' ? formatTime(chat?.updatedAt) : ''}
                                    </div>
                                    <div className="text-end">
                                        <Badge
                                            colorScheme="red"
                                            className={`!p-2 !py-1 !rounded-full !text-xs ${chat?.unSeenCount > 0 ? "" : "!invisible"}`}
                                        >
                                            {chat?.unSeenCount > 0 && (
                                                chat.unSeenCount
                                            )}
                                        </Badge>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </SectionContainer>
    );
};

export default Chats;