import api from "./api";
import { USER_API_END_POINT } from "./constants";

export const registerUser = async (data) => {
    try {
        const response = await api.post(`${USER_API_END_POINT}/signup`, data,
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
        return response.data;
    }
    catch (error) {
        console.error('Error in sign-up:', error);
        throw error;
    }
}

export const loginUser = async (data) => {
    try {
        const response = await api.post(`${USER_API_END_POINT}/login`, data,
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
        return response.data;
    }
    catch (error) {
        console.error('Error in sign-in:', error);
        throw error;
    }
}
