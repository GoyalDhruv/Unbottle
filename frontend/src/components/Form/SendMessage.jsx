import { useEffect, useRef, useState } from 'react';
import { Button, IconButton, Menu, MenuButton, MenuItem, MenuList, useDisclosure } from '@chakra-ui/react';
import { Image as ImageIcon, Link, Send } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { getDataFromLocalStorage } from '../../utils/helper';
import toast from 'react-hot-toast';
import MediaPreviewModal from '../Modal/MediaPreviewModal';

function SendMessage() {
    const { id } = useParams();
    const [newMessage, setNewMessage] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const { current: socket } = useSocket();
    const currentUser = getDataFromLocalStorage();
    const [typingTimeout, setTypingTimeout] = useState(null);

    const fileInputRef = useRef(null);

    const handleFileInputClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const MAX_FILE_SIZE = 25 * 1024 * 1024;
        const files = Array.from(event.target.files);

        const validFiles = files.filter(file => {
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`"${file.name}" exceeds 25MB limit.`);
                return false;
            }
            return true;
        });

        setSelectedFiles(prev => [...prev, ...validFiles]);
        onOpen();
    };

    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        if (selectedFiles.length === 0) {
            onClose();
        }
    }, [selectedFiles]);

    const handleTyping = () => {
        if (!socket) return;

        socket.emit('typing', { chatId: id, userId: currentUser._id });
        if (typingTimeout) clearTimeout(typingTimeout);

        const timeout = setTimeout(() => {
            socket.emit('stop_typing', { chatId: id, userId: currentUser._id });
        }, 1000);
        setTypingTimeout(timeout);
    };

    const handleSendMessage = (event) => {
        event.preventDefault();
        if (!newMessage.trim() && selectedFiles.length === 0) return;

        const msg = {
            chatId: id,
            senderId: currentUser._id,
            content: newMessage,
            type: 'text',
        };

        socket?.emit('send_message', msg);
        socket?.emit('stop_typing', { chatId: id, userId: currentUser._id });

        setNewMessage('');
        setSelectedFiles([]);
    };

    return (
        <form onSubmit={handleSendMessage}>

            {/* Chat Input and Controls */}
            <div className="flex items-center gap-2">
                <Menu placement="top-start">
                    <MenuButton
                        as={IconButton}
                        icon={<Link size={18} />}
                        variant="outline"
                        className="!text-white !bg-transparent !border-none"
                    />
                    <MenuList className="!p-0 !rounded-xl !w-[140px]">
                        <MenuItem
                            className="hover:!bg-[#726fbb] !py-3 !rounded-xl !text-end !bg-[#f8f8ff] !text-[#726fbb] hover:!text-white flex justify-between items-center"
                            onClick={handleFileInputClick}
                        >
                            Photos & Videos <span><ImageIcon /></span>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*,video/*"
                                multiple
                                onChange={handleFileChange}
                            />
                        </MenuItem>
                    </MenuList>
                </Menu>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                        handleTyping();
                        if (e.key === 'Enter') handleSendMessage(e);
                    }}
                    placeholder="Type your message..."
                    className="flex-1 p-2 !ps-5 rounded-md !text-white placeholder:!text-white !border-none outline-none"
                />
                <Button type="submit" size="sm" className="!bg-transparent">
                    <Send size={18} className="text-white" />
                </Button>
            </div>

            <MediaPreviewModal
                isOpen={isOpen}
                onClose={onClose}
                files={selectedFiles}
                setSelectedFiles={setSelectedFiles}
            />

        </form>
    );
}

export default SendMessage;
