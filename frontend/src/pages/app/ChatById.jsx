import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getMessageById } from '../../services/messageService';
import { formatTime, getDataFromLocalStorage, formatDateHeading, getParticipant } from '../../utils/helper';
import SendMessage from '../../components/Form/SendMessage';
import ChatLoader from '../../components/Loader/ChatLoader';
import ChatHeader from '../../components/Chat/ChatHeader';
import { useSocket } from '../../context/SocketContext';
import { MessageStatus } from '../../components/Chat/MessageStatus';

function ChatById() {
    const { id } = useParams();
    const [messages, setMessages] = useState([]);
    const [blockedData, setBlockedData] = useState([]);
    const [users, setUsers] = useState([])
    const messageEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const { current: socket } = useSocket();
    const [typingUsers, setTypingUsers] = useState([]);

    const currentUser = getDataFromLocalStorage();

    useEffect(() => {
        if (socket && id) {
            socket.emit("join_chat", id);
        }
    }, [socket, id]);

    useEffect(() => {
        if (!socket) return;

        const handleUserOnline = (userId) => {
            setUsers((prev) => ({
                ...prev,
                participants: prev?.participants?.map((user) =>
                    user._id === userId ? { ...user, isOnline: true } : user
                ),
            }));
        };

        const handleUserOffline = (userId) => {
            setUsers((prev) => ({
                ...prev,
                participants: prev?.participants?.map((user) =>
                    user._id === userId ? { ...user, isOnline: false } : user
                ),
            }));
        };

        socket.on('user_online', handleUserOnline);
        socket.on('user_offline', handleUserOffline);

        return () => {
            socket?.off('user_online', handleUserOnline);
            socket?.off('user_offline', handleUserOffline);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket) return;

        const handleIncomingMessage = (msg) => {
            setMessages((prev) => ({
                ...prev,
                decryptedMessages: [...prev.decryptedMessages, msg],
            }));
        };

        socket.on("message_received", handleIncomingMessage);

        return () => {
            socket.off("message_received", handleIncomingMessage);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket || !messages?.decryptedMessages) return;

        const unseenMessages = messages.decryptedMessages.filter(
            (msg) => msg?.sender?._id !== currentUser._id && !msg.isSeen
        );

        const unseenMessageIds = unseenMessages.map((msg) => msg._id);

        if (unseenMessageIds.length > 0) {
            socket.emit('messages_seen', {
                messageIds: unseenMessageIds,
                chatId: id,
            });
        }

        const handleCheckUpdateMsg = (msg) => {
            setMessages((prev) => ({
                ...prev,
                decryptedMessages: prev.decryptedMessages.map((message) =>
                    msg.find((newMessage) => newMessage._id === message._id) || message
                ),
            }));
        }

        socket.on("messages_seen_update", handleCheckUpdateMsg)
    }, [messages, socket, id, currentUser._id]);


    useEffect(() => {
        if (!socket) return;

        const handleTyping = ({ userId }) => {
            if (userId !== currentUser._id) {
                setTypingUsers((prev) => [...new Set([...prev, userId])]);
            }
        };

        const handleStopTyping = ({ userId }) => {
            setTypingUsers((prev) => prev.filter((id) => id !== userId));
        };

        socket.on("typing", handleTyping);
        socket.on("stop_typing", handleStopTyping);

        return () => {
            socket.off("typing", handleTyping);
            socket.off("stop_typing", handleStopTyping);
        };
    }, [socket]);

    const getChatById = async () => {
        try {
            const res = await getMessageById(id);
            setMessages(res?.messages || []);
            setBlockedData(res?.messages?.blockedDetails || []);
            setUsers(res?.messages?.users)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getChatById();
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!loading) {
            scrollToBottom();
        }
    }, [loading]);

    return (
        <div className="flex flex-col h-full text-white">
            {
                loading ?
                    <ChatLoader /> :
                    <>
                        {/* Header */}
                        <ChatHeader users={users} blockedData={blockedData} getChatById={getChatById} />

                        {/* Message Container */}
                        <div className='chat-messages-container' ref={messagesContainerRef}>
                            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 pb-16">
                                {messages?.decryptedMessages?.length === 0 ? (
                                    <p className="text-[#726fbb] text-center !pt-60">No Active Conversation.</p>
                                ) : (
                                    messages?.decryptedMessages?.map((msg, index) => {
                                        const currentMessageDate = new Date(msg?.createdAt).toDateString();
                                        const previousMessageDate =
                                            index > 0 ? new Date(messages?.decryptedMessages?.[index - 1]?.createdAt).toDateString() : null;
                                        const showDateHeader = currentMessageDate !== previousMessageDate;

                                        return (
                                            <React.Fragment key={msg._id}>
                                                {showDateHeader && (
                                                    <div className="text-center text-xs text-gray-400 my-4">
                                                        {formatDateHeading(msg?.createdAt)}
                                                    </div>
                                                )}
                                                <div
                                                    className={`flex ${msg?.sender._id === currentUser._id ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-xs md:max-w-md px-4 py-2 rounded-xl shadow ${msg?.sender._id === currentUser._id
                                                            ? 'bg-[#726fbb] text-white'
                                                            : 'bg-[#f8f8ff] text-black'
                                                            }`}
                                                    >
                                                        <p className="text-sm break-words">{msg?.content}</p>
                                                        <div className="flex items-center justify-end space-x-1 text-[10px] text-right mt-1 opacity-70">
                                                            <span>{formatTime(msg?.createdAt)}</span>
                                                            {msg?.sender._id === currentUser._id && (
                                                                <MessageStatus
                                                                    isSeen={msg?.isSeen}
                                                                    isOnline={getParticipant(users, currentUser)?.isOnline}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })
                                )}
                                <div ref={messageEndRef} />
                            </div>
                        </div>

                        <div className="p-3 border-t border-gray-600 max-w-[500px] mx-auto fixed bottom-14 left-0 right-0 !rounded-lg text-center">
                            {blockedData?.blocked === true ?
                                <span className="bg-[#e4e4e7] text-black px-4 py-2 rounded-xl">
                                    {blockedData?.blockedUser === currentUser._id ? `You have been blocked` : `You have blocked ${users?.participants?.find(item => item?.username !== blockedData?.blockedByUsername)?.username}`}
                                </span> :
                                // Input Box
                                <>
                                    {typingUsers.length > 0 && (
                                        <p className="text-sm text-[#726fbb] italic">
                                            {users?.participants?.find((u) => typingUsers.includes(u._id) && u._id !== currentUser._id)?.username} is typing...
                                        </p>
                                    )}

                                    <div className='bg-[#726fbb] p-3 rounded-xl'>
                                        <SendMessage />
                                    </div>
                                </>
                            }
                        </div>
                    </>
            }
        </div>
    );
}

export default ChatById;