import React, { useState } from 'react';
import {
    Box,
    Text,
    Flex,
    Grid,
    Image,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    useDisclosure,
    IconButton,
    useBreakpointValue,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, DownloadIcon } from '@chakra-ui/icons';
import ReactPlayer from 'react-player';
import { formatDateHeading, formatTime, getDataFromLocalStorage, getParticipant } from '../../utils/helper';
import { MessageStatus } from './MessageStatus';

function MessageContainer({ messageEndRef, messages, users }) {
    const currentUser = getDataFromLocalStorage();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedMedia, setSelectedMedia] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    const sliderSize = useBreakpointValue({ base: 'xs', md: 'md', lg: 'lg' });

    const openMediaModal = (media, index = 0) => {
        setSelectedMedia(media);
        setCurrentSlide(index);
        onOpen();
    };

    const goToPrev = () => {
        setCurrentSlide((prev) => (prev === 0 ? selectedMedia.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentSlide((prev) => (prev === selectedMedia.length - 1 ? 0 : prev + 1));
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = selectedMedia[currentSlide]?.url;
        link.download = `download-${Date.now()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Box className="chat-messages-container">
            <Box className="flex-1 overflow-y-auto px-4 py-2 space-y-2 pb-16">
                {messages?.decryptedMessages?.length === 0 ? (
                    <Text color="#726fbb" textAlign="center" pt="60">
                        No Active Conversation.
                    </Text>
                ) : (
                    messages?.decryptedMessages?.map((msg, index) => {
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
                                            (() => {
                                                const media = msg?.media || [];
                                                if (media.length === 1) {
                                                    const item = media[0];

                                                    return (
                                                        <Box mb={2} onClick={() => openMediaModal(media, 0)} className="cursor-pointer">
                                                            {item.type === 'image' ? (
                                                                <Image src={item.url} alt="" objectFit="cover" borderRadius="md" />
                                                            ) : (
                                                                <ReactPlayer url={item.url} controls width="100%" height="200px" />
                                                            )}
                                                            {item.caption && <Text mt={1}>{item.caption}</Text>}
                                                        </Box>
                                                    );
                                                }

                                                const withCaption = media.filter((item) => item.caption);
                                                const withoutCaption = media.filter((item) => !item.caption);

                                                return (
                                                    <>
                                                        {withCaption.map((item, idx) => (
                                                            <Box
                                                                key={`captioned-${idx}`}
                                                                mt={3}
                                                                onClick={() => openMediaModal(media, media.indexOf(item))}
                                                                className="cursor-pointer"
                                                            >
                                                                {item.type === 'image' ? (
                                                                    <Image src={item.url} alt="" objectFit="cover" borderRadius="md" />
                                                                ) : (
                                                                    <ReactPlayer url={item.url} controls width="100%" />
                                                                )}
                                                                <Text mt={1}>{item.caption}</Text>
                                                            </Box>
                                                        ))}

                                                        {withoutCaption.length > 0 && (
                                                            <Grid templateColumns="repeat(2, 1fr)" gap={2} mt={3}>
                                                                {withoutCaption.slice(0, 4).map((item, idx) => (
                                                                    <Box
                                                                        key={idx}
                                                                        position="relative"
                                                                        w="100%"
                                                                        aspectRatio={1}
                                                                        overflow="hidden"
                                                                        borderRadius="md"
                                                                        onClick={() => {
                                                                            if (idx === 3 && withoutCaption.length > 4) {
                                                                                openMediaModal(media, 0);
                                                                            } else {
                                                                                openMediaModal(media, media.indexOf(item));
                                                                            }
                                                                        }}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        {item.type === 'image' ? (
                                                                            <Image src={item.url} alt="" objectFit="cover" w="100%" h="100%" />
                                                                        ) : (
                                                                            <ReactPlayer url={item.url} controls width="100%" height="100%" />
                                                                        )}

                                                                        {idx === 3 && withoutCaption.length > 4 && (
                                                                            <Flex
                                                                                position="absolute"
                                                                                top="0"
                                                                                left="0"
                                                                                w="100%"
                                                                                h="100%"
                                                                                bg="blackAlpha.600"
                                                                                align="center"
                                                                                justify="center"
                                                                                color="white"
                                                                                fontWeight="bold"
                                                                                fontSize="lg"
                                                                            >
                                                                                +{withoutCaption.length - 4} more
                                                                            </Flex>
                                                                        )}
                                                                    </Box>
                                                                ))}
                                                            </Grid>
                                                        )}
                                                    </>
                                                );
                                            })()
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
                    })
                )}
                <div ref={messageEndRef} />
            </Box>

            {/* Media Modal with Carousel */}
            <Modal isOpen={isOpen} onClose={onClose} size="full" motionPreset="slideInBottom">
                <ModalOverlay bg="transparent" />
                <ModalContent maxH="90vh" margin="auto" boxShadow="none" className='!bg-[#000000c9] !max-w-[500px]'>
                    {/* <ModalCloseButton
                        bg="white"
                        borderRadius="full"
                        _hover={{ bg: "gray.100" }}
                        zIndex="1"
                    /> */}
                    <ModalBody p={0} className="relative flex items-center justify-center h-full">
                        <IconButton
                            aria-label="Close modal"
                            icon={<CloseIcon boxSize={4} />}
                            position="absolute"
                            right="4"
                            top="4"
                            onClick={onClose}
                            borderRadius="full"
                            bg="blackAlpha.600"
                            color="white"
                            _hover={{ bg: "blackAlpha.700" }}
                            zIndex="10"
                            size="sm"
                        />
                        <IconButton
                            aria-label="Download media"
                            icon={<DownloadIcon boxSize={4} />}
                            position="absolute"
                            left="4"
                            top="4"
                            onClick={handleDownload}
                            borderRadius="full"
                            bg="blackAlpha.600"
                            color="white"
                            _hover={{ bg: "blackAlpha.700" }}
                            zIndex="10"
                            size="sm"
                        />
                        {/* Carousel Container */}
                        <div className="relative w-full h-full">
                            {/* Media Content */}
                            <div className="flex items-center justify-center w-full h-full overflow-hidden">
                                {selectedMedia[currentSlide]?.type === 'image' ? (
                                    <Image
                                        src={selectedMedia[currentSlide]?.url}
                                        alt=""
                                        objectFit="contain"
                                        className="max-w-full max-h-full"
                                    />
                                ) : (
                                    <div className="w-full aspect-video">
                                        <ReactPlayer
                                            url={selectedMedia[currentSlide]?.url}
                                            width="100%"
                                            height="100%"
                                            controls
                                            playing
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Navigation Arrows */}
                            {selectedMedia.length > 1 && (
                                <>
                                    <IconButton
                                        aria-label="Previous media"
                                        icon={<ChevronLeftIcon boxSize={6} />}
                                        position="absolute"
                                        left={2}
                                        top="50%"
                                        transform="translateY(-50%)"
                                        onClick={goToPrev}
                                        borderRadius="full"
                                        bg="blackAlpha.600"
                                        color="white"
                                        _hover={{ bg: "blackAlpha.700" }}
                                    />
                                    <IconButton
                                        aria-label="Next media"
                                        icon={<ChevronRightIcon boxSize={6} />}
                                        position="absolute"
                                        right={2}
                                        top="50%"
                                        transform="translateY(-50%)"
                                        onClick={goToNext}
                                        borderRadius="full"
                                        bg="blackAlpha.600"
                                        color="white"
                                        _hover={{ bg: "blackAlpha.700" }}
                                    />
                                </>
                            )}

                            {/* Caption */}
                            {selectedMedia[currentSlide]?.caption && (
                                <Text
                                    mt={2}
                                    px={4}
                                    py={2}
                                    fontSize="sm"
                                    color="white"
                                    bg="blackAlpha.700"
                                    position="absolute"
                                    bottom="0"
                                    left="0"
                                    right="0"
                                    textAlign="center"
                                >
                                    {selectedMedia[currentSlide]?.caption}
                                </Text>
                            )}

                            {/* Slide Indicators */}
                            {selectedMedia.length > 1 && (
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                                    {selectedMedia.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentSlide(index)}
                                            className={`w-2 h-2 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-gray-400'}`}
                                            aria-label={`Go to slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
}

export default MessageContainer;