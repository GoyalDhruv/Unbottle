import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
    ModalBody, Box, Button, Textarea, Image,
    Input
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { uploadFiles } from '../../services/uploadService';
import { Plus, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactPlayer from 'react-player';
import { useParams } from 'react-router-dom';
import { getDataFromLocalStorage } from '../../utils/helper';
import { useSocket } from '../../context/SocketContext';

const MediaPreviewModal = ({ isOpen, onClose, files, setSelectedFiles }) => {
    const { id } = useParams();
    const { current: socket } = useSocket();
    const currentUser = getDataFromLocalStorage();


    const [uploading, setUploading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [captions, setCaptions] = useState({});
    const [objectURLs, setObjectURLs] = useState([]);

    useEffect(() => {
        const urls = files.map(file => ({
            url: URL.createObjectURL(file),
            type: file.type.includes('video') ? 'video' : 'image',
            name: file.name,
        }));

        setObjectURLs(urls);

        return () => {
            urls.forEach(obj => URL.revokeObjectURL(obj.url));
        };
    }, [files]);

    const handleSendAll = async () => {
        try {
            setUploading(true);
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));

            const uploaded = await uploadFiles(formData);
            const mediaWithCaptions = uploaded?.files?.map((file, index) => {
                const isVideo = file.url.includes('/video/upload/');
                return {
                    url: file.url,
                    type: isVideo ? 'video' : 'image',
                    caption: captions[index] || '',
                };
            });

            toast.success('Files uploaded successfully');

            const msg = {
                chatId: id,
                senderId: currentUser._id,
                media: mediaWithCaptions,
                type: 'media',
            };

            socket?.emit('send_message', msg);

        } catch (error) {
            console.error('Error uploading files:', error);
            toast.error(error.message);
        } finally {
            setUploading(false);
            onClose();
            setSelectedFiles([]);
            setCaptions({});
            setCurrentIndex(0);
        }
    };

    const handleFileInputChange = (event) => {
        if (uploading) return;

        const MAX_FILE_SIZE = 25 * 1024 * 1024;
        const newFiles = Array.from(event.target.files);

        const validFiles = newFiles.filter(file => {
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`"${file.name}" exceeds 25MB limit.`);
                return false;
            }
            return true;
        });

        setSelectedFiles(prev => [...prev, ...validFiles]);
    };

    const handleCaptionChange = (e) => {
        setCaptions({ ...captions, [currentIndex]: e.target.value });
    };

    const handlePrev = () => {
        setCurrentIndex(prev => (prev === 0 ? files.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex(prev => (prev === files.length - 1 ? 0 : prev + 1));
    };

    const currentMedia = objectURLs?.[currentIndex];

    return (
        <Modal isOpen={isOpen} onClose={() => {
            if (!uploading) {
                onClose();
                setSelectedFiles([]);
                setCaptions({});
                setCurrentIndex(0);
            }
        }} motionPreset="slideInBottom" isCentered>
            <ModalOverlay />
            <ModalContent
                minH="60vh"
                bgGradient="linear(to-b, #dbd7f4, #eeecf7)"
                borderRadius="2xl"
                px={4}
                pt={6}
                className="!max-w-[500px]"
            >
                <ModalHeader className="text-xl bg-gradient-to-r from-[#6d67ff] to-[#f16186] bg-clip-text text-transparent text-center">
                    Media Preview <span className='tracking-tight'>({currentIndex + 1}/{files.length})</span>
                </ModalHeader>
                <ModalCloseButton isDisabled={uploading} />
                <ModalBody>

                    <Box className="relative flex justify-center items-center h-[300px] rounded-lg overflow-hidden">
                        {files.length > 1 && (
                            <>
                                <Button onClick={handlePrev} size="sm" position="absolute" left={2} top="48%" transform="translateY(-50%)" rounded="full" zIndex="2" isDisabled={uploading} bg="whiteAlpha.700">
                                    <ChevronLeft size={20} />
                                </Button>
                                <Button onClick={handleNext} size="sm" position="absolute" right={2} top="48%" transform="translateY(-50%)" rounded="full" zIndex="2" isDisabled={uploading} bg="whiteAlpha.700">
                                    <ChevronRight size={20} />
                                </Button>
                            </>
                        )}

                        {currentMedia ? (
                            currentMedia.type === 'video' ? (
                                <ReactPlayer
                                    url={objectURLs[currentIndex].url}
                                    controls
                                    className="!h-[280px] w-full object-cover"
                                />
                            ) : (
                                <Image
                                    src={objectURLs[currentIndex].url}
                                    className="!h-[280px] !rounded-2xl object-cover"
                                />
                            )
                        ) : (
                            <Box className="text-center text-gray-500">No file selected</Box>
                        )}
                    </Box>

                    <Textarea
                        placeholder="Add a caption..."
                        value={captions[currentIndex] || ''}
                        onChange={handleCaptionChange}
                        mt={3}
                        resize="none"
                        isDisabled={uploading}
                        minH="40px"
                        borderRadius="md"
                        bg="white"
                        className='!rounded-full'
                    />

                    <Box className="flex items-center justify-center my-2 mt-4 gap-3" >
                        <Input
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            hidden
                            id="file-upload"
                            onChange={handleFileInputChange}
                            disabled={uploading}
                        />

                        <label htmlFor="file-upload" className='cursor-pointer'>
                            <Button
                                colorScheme="purple"
                                rounded="full"
                                size="sm"
                                isDisabled={uploading}
                                className="!bg-[#6d67ff]"
                                as="span"
                            >
                                <Plus size={16} />
                            </Button>
                        </label>


                        <Button
                            leftIcon={<Send size={16} />}
                            size="sm"
                            rounded="full"
                            onClick={handleSendAll}
                            isLoading={uploading}
                            loadingText="Uploading"
                            className='!bg-[#6d67ff] !text-white'
                        >
                            Send All
                        </Button>
                    </Box>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default MediaPreviewModal;
