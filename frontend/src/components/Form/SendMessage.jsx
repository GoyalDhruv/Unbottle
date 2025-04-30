import React, { useState } from 'react'
import { sendMessage } from '../../services/messageService';
import { Button } from '@chakra-ui/react';
import { Send } from 'lucide-react';
import { useParams } from 'react-router-dom';

function SendMessage({ setMessages }) {
    const { id } = useParams();

    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = async (event) => {
        event.preventDefault();

        if (!newMessage.trim()) return;

        try {
            const payload = {
                chatId: id,
                content: newMessage,
            };
            const res = await sendMessage(payload);
            setMessages((prev) => [...prev, res?.message]);
            setNewMessage('');
        } catch (error) {
            console.error('Message send failed:', error);
        }
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