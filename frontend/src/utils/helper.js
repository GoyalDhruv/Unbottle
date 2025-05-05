export const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const getDataFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem("unbottle"))
}

export const formatDateHeading = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export const getParticipant = (users,currentUser) => {
    return users?.participants?.find(item => item?._id !== currentUser?._id)
}