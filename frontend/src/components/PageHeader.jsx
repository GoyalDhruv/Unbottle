import { Heading, Text } from '@chakra-ui/react';

const PageHeader = ({ title, subtitle, subtitleSize = "lg", marginTop = "12", marginBottom = "10", maxWidth = null }) => {
    return (
        <div className={`text-center mt-${marginTop} mb-${marginBottom}`}>
            <Heading size="3xl" className="heading-color">
                {title}
            </Heading>
            <Text
                className={`!pt-2 text-gray-700 ${maxWidth ? `max-w-[${maxWidth}] mx-auto` : ""}`}
                fontSize={subtitleSize}
            >
                {subtitle}
            </Text>
        </div>
    );
};

export default PageHeader;
