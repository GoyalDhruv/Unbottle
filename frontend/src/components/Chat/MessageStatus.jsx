import BlueTick from '../../assets/icons/BlueTick.svg';
import SingleTick from '../../assets/icons/SingleTick.svg';
import DoubleTick from '../../assets/icons/DoubleTick.svg';

export const MessageStatus = ({ isSeen, isOnline }) => {

    const status = isSeen ? { src: BlueTick, alt: "blue tick", color: "text-blue-500" } :
        !isOnline ? { src: SingleTick, alt: "single tick", color: "text-gray-400" }
            : { src: DoubleTick, alt: "double tick", color: "text-gray-400" };

    return (
        <span className={`${status.color} ml-1`}>
            <img src={status.src} alt={status.alt} />
        </span>
    );
};
