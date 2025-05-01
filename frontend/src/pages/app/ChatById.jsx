import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getMessageById } from '../../services/messageService';
import { formatTime, getDataFromLocalStorage, formatDateHeading } from '../../utils/helper';
import SendMessage from '../../components/Form/SendMessage';
import ChatLoader from '../../components/Loader/ChatLoader';
import ChatHeader from '../../components/Chat/ChatHeader';

function ChatById() {
    const { id } = useParams();
    const [messages, setMessages] = useState([]);
    const [blockedData, setBlockedData] = useState([]);
    const [users, setUsers] = useState([])
    const messageEndRef = useRef(null);
    const [loading, setLoading] = useState(true);

    const currentUser = getDataFromLocalStorage();

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
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-full text-white">
            {
                loading ?
                    <ChatLoader /> :
                    <>
                        {/* Header */}
                        <ChatHeader users={users} blockedData={blockedData} getChatById={getChatById} />

                        {/* Message Container */}
                        <div className='chat-messages-container'>
                            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 pb-16">
                                {messages?.decryptedMessages?.length === 0 ? (
                                    <p className="text-[#726fbb] text-center fixed top-[350px] left-[400px]">No messages yet.</p>
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
                                                        <p className="text-sm">{msg?.content}</p>
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


                        <div className="p-3 border-t border-gray-600 max-w-[500px] mx-auto fixed bottom-14 left-0 right-0 !rounded-lg text-center">
                            {blockedData?.blocked === true ?
                                <span className="bg-[#e4e4e7] text-black px-4 py-2 rounded-xl">
                                    {blockedData?.blockedUser === currentUser._id ? `You have been blocked` : `You have blocked ${users?.participants?.find(item => item?.username !== blockedData?.blockedByUsername)?.username}`}
                                </span> :
                                // Input Box
                                <div className='bg-[#726fbb] p-3 rounded-xl'>
                                    <SendMessage setMessages={setMessages} />
                                </div>
                            }
                        </div>
                    </>
            }
        </div>
    );
}

export default ChatById;
