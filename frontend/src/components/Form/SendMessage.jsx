import React, { useState } from 'react'
import { sendMessage } from '../../services/messageService';
import { Button } from '@chakra-ui/react';

function SendMessage({ id, setMessages }) {

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
                    className="bg-gradient-to-r from-[#6d67ff] to-[#f16186] text-white !rounded-lg"
                >
                    Send
                </Button>
            </div>
        </form>
    )
}

export default SendMessage