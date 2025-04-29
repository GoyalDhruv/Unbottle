import api from "./api";
import { MESSAGE_API_END_POINT } from "./constants";

export const getMessageById = async (chatId) => {
    try {
        const response = await api.get(`${MESSAGE_API_END_POINT}/${chatId}`);
        return response.data;
    }
    catch (error) {
        console.error('Error in getting nearby users:', error);
        throw error;
    }
}

export const sendMessage = async (data) => {
    try {
        const response = await api.post(`${MESSAGE_API_END_POINT}`, data,
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