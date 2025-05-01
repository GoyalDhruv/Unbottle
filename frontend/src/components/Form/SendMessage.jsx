import React, { useState } from 'react'
import { Button } from '@chakra-ui/react';
import { Send } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { getDataFromLocalStorage } from '../../utils/helper';

function SendMessage() {
    const { id } = useParams();

    const [newMessage, setNewMessage] = useState('');
    const { current: socket } = useSocket();

    const currentUser = getDataFromLocalStorage();

    const handleSendMessage = (event) => {
        event.preventDefault();

        if (!newMessage.trim()) return;

        const msg = {
            chatId: id,
            senderId: currentUser._id,
            content: newMessage,
        };

        if (socket) {
            socket.emit('send_message', msg);
        }

        setNewMessage('');
    };

    return (
        <form onSubmit={handleSendMessage}>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
                    placeholder="Type your message..."
                    className="flex-1 p-2 !ps-5 rounded-md !text-white placeholder:!text-white !border-none outline-none"
                />
                <Button
                    type="submit"
                    size="sm"
                    className="!bg-transparent"
                >
                    <Send size={18} className='text-white' />
                </Button>
            </div>
        </form>
    )
}

export default SendMessage