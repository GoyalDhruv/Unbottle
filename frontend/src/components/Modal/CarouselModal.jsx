import { Text, Image, Modal, ModalOverlay, ModalContent, ModalBody, IconButton } from '@chakra-ui/react';
import ReactPlayer from 'react-player';
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';

function CarouselModal({ selectedMedia, currentSlide, setCurrentSlide, onClose, isOpen }) {

    const goToPrev = () => {
        setCurrentSlide((prev) => (prev === 0 ? selectedMedia.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentSlide((prev) => (prev === selectedMedia.length - 1 ? 0 : prev + 1));
    };

    const handleDownload = () => {
        const media = selectedMedia[currentSlide];
        if (!media || !media.url) {
            console.error('No media available to open in a new tab');
            return;
        }

        window.open(media.url, '_blank');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="full" motionPreset="slideInBottom">
            <ModalOverlay bg="transparent" />
            <ModalContent maxH="90vh" margin="auto" boxShadow="none" className='!bg-[#000000c9] !max-w-[500px]'>
                <ModalBody p={0} className="relative flex items-center justify-center h-full">
                    <IconButton
                        className='!absolute top-4 right-4 z-10 !rounded-full !text-white'
                        icon={<X size={22} />}
                        onClick={onClose}
                        bg="blackAlpha.600"
                        _hover={{ bg: "blackAlpha.700" }}
                    />
                    <IconButton
                        className='!absolute top-4 left-4 z-10 !rounded-full !text-white'
                        icon={<Download size={22} />}
                        onClick={handleDownload}
                        bg="blackAlpha.600"
                        _hover={{ bg: "blackAlpha.700" }}
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
                                    className='!absolute top-1/2 left-2 transform -translate-y-1/2 z-10 !rounded-full !text-white'
                                    icon={<ChevronLeft size={22} />}
                                    onClick={goToPrev}
                                    bg="blackAlpha.600"
                                    _hover={{ bg: "blackAlpha.700" }}
                                />
                                <IconButton
                                    className='!absolute top-1/2 right-2 transform -translate-y-1/2 z-10 !rounded-full !text-white'
                                    icon={<ChevronRight size={22} />}
                                    onClick={goToNext}
                                    bg="blackAlpha.600"
                                    _hover={{ bg: "blackAlpha.700" }}
                                />
                            </>
                        )}

                        {/* Caption */}
                        {selectedMedia[currentSlide]?.caption && (
                            <Text
                                className='mt-2 px-4 py-2 text-sm text-white !absolute bottom-0 left-0 right-0 text-center'
                                bg="blackAlpha.700"
                            >
                                {selectedMedia[currentSlide]?.caption}
                            </Text>
                        )}
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default CarouselModal