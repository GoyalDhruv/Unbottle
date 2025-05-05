export const MessageStatus = ({ isSeen, isOnline }) => {
    if (isSeen) {
        return (
            <span className="text-blue-500 ml-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.707 7.293a1 1 0 00-1.414 0L10 12.586 8.121 10.707a1 1 0 00-1.414 1.414l2.586 2.586a1 1 0 001.414 0l6-6a1 1 0 000-1.414z" />
                    <path d="M20.707 7.293a1 1 0 00-1.414 0L14 12.586l-1.879-1.879a1 1 0 00-1.414 1.414l2.586 2.586a1 1 0 001.414 0l6-6a1 1 0 000-1.414z" />
                </svg>
            </span>
        );
    }

    if (!isOnline) {
        return (
            <span className="text-gray-400 ml-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12 3.41 13.41 9 19l12-12-1.41-1.41z" />
                </svg>
            </span>
        );
    }

    return (
        <span className="text-gray-400 ml-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.707 7.293a1 1 0 00-1.414 0L10 12.586 8.121 10.707a1 1 0 00-1.414 1.414l2.586 2.586a1 1 0 001.414 0l6-6a1 1 0 000-1.414z" />
                <path d="M20.707 7.293a1 1 0 00-1.414 0L14 12.586l-1.879-1.879a1 1 0 00-1.414 1.414l2.586 2.586a1 1 0 001.414 0l6-6a1 1 0 000-1.414z" />
            </svg>
        </span>
    );
};
