import api from "./api";
import { CHAT_API_END_POINT } from "./constants";

export const createChat = async (data) => {
    try {
        const response = await api.post(`${CHAT_API_END_POINT}`, data,
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
        return response.data;
    }
    catch (error) {
        console.error('Error in starting or accessing chat:', error);
        throw error;
    }
}

export const getChatsByUser = async () => {
    try {
        const response = await api.get(`${CHAT_API_END_POINT}`);
        return response.data;
    }
    catch (error) {
        console.error('Error in getting chats:', error);
        throw error;
    }
}
