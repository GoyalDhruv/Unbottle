import React, { useState } from 'react';
import { Box, Text, Flex, useDisclosure } from '@chakra-ui/react';
import { formatDateHeading, formatTime, getDataFromLocalStorage, getParticipant } from '../../utils/helper';
import { MessageStatus } from './MessageStatus';
import CarouselModal from '../Modal/CarouselModal';
import MediaContent from './MediaContent';

function MessageContainer({ messageEndRef, messages, users }) {
    const currentUser = getDataFromLocalStorage();
    const { onOpen, isOpen, onClose } = useDisclosure();
    const [selectedMedia, setSelectedMedia] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    const openMediaModal = (media, index = 0) => {
        setSelectedMedia(media);
        setCurrentSlide(index);
        onOpen();
    };

    const renderMessage = (msg, index) => {
        const currentMessageDate = new Date(msg?.createdAt).toDateString();
        const previousMessageDate =
            index > 0 ? new Date(messages?.decryptedMessages?.[index - 1]?.createdAt).toDateString() : null;
        const showDateHeader = currentMessageDate !== previousMessageDate;

        return (
            <React.Fragment key={msg._id}>
                {showDateHeader && (
                    <Text textAlign="center" fontSize="xs" color="gray.400" my={4}>
                        {formatDateHeading(msg?.createdAt)}
                    </Text>
                )}

                <Flex justify={msg?.sender._id === currentUser._id ? 'flex-end' : 'flex-start'}>
                    <Box
                        maxW={{ base: 'xs' }}
                        px={4}
                        py={2}
                        rounded="xl"
                        shadow="md"
                        bg={msg?.sender._id === currentUser._id ? '#726fbb' : '#f8f8ff'}
                        color={msg?.sender._id === currentUser._id ? 'white' : 'black'}
                    >
                        {msg?.type === 'text' ? (
                            <Text fontSize="sm" wordBreak="break-word">
                                {msg?.content}
                            </Text>
                        ) : (
                            <MediaContent msg={msg} openMediaModal={openMediaModal} />
                        )}

                        <Flex justify="flex-end" align="center" gap={1} fontSize="10px" opacity={0.7}>
                            <Text>{formatTime(msg?.createdAt)}</Text>
                            {msg?.sender._id === currentUser._id && (
                                <MessageStatus
                                    isSeen={msg?.isSeen}
                                    isOnline={getParticipant(users, currentUser)?.isOnline}
                                />
                            )}
                        </Flex>
                    </Box>
                </Flex>
            </React.Fragment>
        );
    };

    return (
        <Box className="chat-messages-container">
            <Box className="flex-1 overflow-y-auto px-4 py-2 space-y-2 pb-16">
                {messages?.decryptedMessages?.length === 0 ? (
                    <Text color="#726fbb" textAlign="center" pt="60">
                        No Active Conversation.
                    </Text>
                ) : (
                    messages?.decryptedMessages?.map((msg, index) => renderMessage(msg, index))
                )}
                <div ref={messageEndRef} />
            </Box>

            {/* Media Modal with Carousel */}
            <CarouselModal
                selectedMedia={selectedMedia}
                currentSlide={currentSlide}
                setCurrentSlide={setCurrentSlide}
                isOpen={isOpen}
                onClose={onClose}
            />
        </Box>
    );
}

export default MessageContainer;
