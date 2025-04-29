import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getMessageById } from '../../services/messageService';
import { formatTime, getDataFromLocalStorage, formatDateHeading } from '../../utils/helper';
import { ArrowBackIcon } from '@chakra-ui/icons';
import SendMessage from '../../components/Form/SendMessage';
import ChatLoader from '../../components/Loader/ChatLoader';

function ChatById() {
    const { id } = useParams();
    const [messages, setMessages] = useState([]);
    const messageEndRef = useRef(null);
    const [loading, setLoading] = useState(true);

    const currentUser = getDataFromLocalStorage();

    const getChatById = async () => {
        try {
            const res = await getMessageById(id);
            setMessages(res?.messages || []);
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
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-full text-white">
            {/* Header */}
            <div className="sticky top-0 z-10 !mb-2">
                {/* back button */}
                <button
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                    onClick={() => window.history.back()}
                >
                    <ArrowBackIcon className="!w-6 !h-6 !text-[#b4b4b4]" />
                </button>
                <div className="text-3xl font-bold bg-gradient-to-r from-[#6d67ff] to-[#f16186] bg-clip-text text-transparent text-center">
                    Chat
                </div>
            </div>
            {
                loading ?
                    <ChatLoader /> :
                    <>
                        {/* Message Container */}
                        <div className='chat-messages-container'>
                            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 pb-16">
                                {messages.length === 0 ? (
                                    <p className="text-gray-400">No messages yet.</p>
                                ) : (
                                    messages.map((msg, index) => {
                                        const currentMessageDate = new Date(msg.createdAt).toDateString();
                                        const previousMessageDate =
                                            index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null;

                                        const showDateHeader = currentMessageDate !== previousMessageDate;

                                        return (
                                            <React.Fragment key={msg._id}>
                                                {showDateHeader && (
                                                    <div className="text-center text-xs text-gray-400 my-4">
                                                        {formatDateHeading(msg.createdAt)}
                                                    </div>
                                                )}
                                                <div
                                                    className={`flex ${msg.sender._id === currentUser._id ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-xs md:max-w-md px-4 py-2 rounded-xl shadow ${msg.sender._id === currentUser._id
                                                            ? 'bg-[#6d67ff] text-white'
                                                            : 'bg-[#e4e4e7] text-black'
                                                            }`}
                                                    >
                                                        <p className="text-sm">{msg.content}</p>
                                                        <p className="text-[10px] text-right mt-1 opacity-70">
                                                            {formatTime(msg?.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })
                                )}
                                <div ref={messageEndRef} />
                            </div>
                        </div>

                        {/* Input Box */}
                        <div className="p-3 bg-[#7970a5] border-t border-gray-600 max-w-[500px] mx-auto fixed bottom-14 left-0 right-0 !rounded-lg">
                            <SendMessage userId={id} setMessages={setMessages} />
                        </div>
                    </>
            }
        </div>
    );
}

export default ChatById;
