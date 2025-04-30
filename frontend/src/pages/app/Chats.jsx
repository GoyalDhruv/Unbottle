import { useEffect, useState } from "react";
import { getChatsByUser } from "../../services/chatService";
import { useNavigate } from "react-router-dom";
import { User2Icon } from "lucide-react";
import { formatDateHeading, formatTime } from '../../utils/helper';
import { getDataFromLocalStorage } from '../../utils/helper';
import ChatLoader from "../../components/Loader/ChatLoader";

const Chats = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    return (
        <div className="flex flex-col items-center justify-start h-full text-white px-4 py-8">
            <div className="text-3xl font-bold pb-3 bg-gradient-to-r from-[#6d67ff] to-[#f16186] bg-clip-text text-transparent">
                Chats
            </div>
            <p className="text-sm !mb-6">Your recent conversations will appear here.</p>

            {loading ? (
                <ChatLoader />
            ) : chats.length === 0 ? (
                <p className="text-gray-400">No chats found.</p>
            ) : (
                <ul className="w-full max-w-xl space-y-4 text-[#7970a5]">
                    {chats?.map((chat) => {
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
                                        <p className="font-semibold text-lg">{otherUser?.username || "User"}</p>
                                        <p className="text-sm text-gray-500 truncate max-w-[200px]">
                                            {chat?.lastMessage
                                                ? `${lastMessageSenderIsCurrentUser ? "You: " : `${otherUser?.username || "User"}: `}${chat.lastMessage.content}`
                                                : "No messages yet."}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 space-x-1">
                                    <span>{formatDateHeading(chat?.updatedAt)} {formatTime(chat?.updatedAt)}</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default Chats;