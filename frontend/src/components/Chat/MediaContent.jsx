import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import ReactPlayer from "react-player";

const MediaContent = ({ msg, openMediaModal }) => {
    const media = msg?.media || [];

    const renderMedia = (item) => {
        if (item.type === 'image') {
            return <Image src={item.url} alt="" objectFit="cover" w="100%" h="100%" />;
        } else {
            return <ReactPlayer url={item.url} controls width="100%" height="100%" />;
        }
    };

    const renderMediaItem = (item, idx) => {
        return (
            <Box
                className='relative w-full overflow-hidden rounded-md cursor-pointer'
                key={idx}
                aspectRatio={1}
                onClick={() => {
                    const filteredMedia = media.filter(i => i.url !== item.url);
                    openMediaModal([item, ...filteredMedia])
                }}
            >
                {renderMedia(item)}
                {idx === 3 && media.length > 4 && (
                    <Flex
                        className='absolute top-0 left-0 w-full h-full items-center justify-center text-white font-bold text-lg'
                        bg="blackAlpha.600"
                    >
                        +{media.length - 4} more
                    </Flex>
                )}
            </Box>
        );
    };

    if (media.length === 1) {
        const item = media[0];
        return (
            <Box mb={2} onClick={() => openMediaModal(media, 0)} className="cursor-pointer">
                {renderMedia(item)}
                {item.caption && <Text mt={1}>{item.caption}</Text>}
            </Box>
        );
    }

    const withCaption = media.filter(item => item.caption);
    const withoutCaption = media.filter(item => !item.caption);

    return (
        <>
            {/* Render media with captions */}
            {withCaption.map((item, idx) => (
                <Box key={`captioned-${idx}`} mt={3}
                    onClick={() => {
                        const filteredMedia = media.filter(i => i.url !== item.url);
                        openMediaModal([item, ...filteredMedia])
                    }}
                    className="cursor-pointer"
                >
                    {renderMedia(item)}
                    <Text mt={1}>{item.caption}</Text>
                </Box>
            ))}

            {/* Render media without captions in a grid */}
            {withoutCaption.length > 0 && (
                <Grid templateColumns="repeat(2, 1fr)" gap={2} mt={3}>
                    {withoutCaption.slice(0, 4).map((item, idx) => renderMediaItem(item, idx))}
                </Grid>
            )}
        </>
    );
};

export default MediaContent;
