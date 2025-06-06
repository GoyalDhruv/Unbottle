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

export const updateUserLocation = async (data) => {
    try {
        const response = await api.put(`${USER_API_END_POINT}/updateUserLocation`, data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    }
    catch (error) {
        console.error('Error in updating location:', error);
        throw error;
    }
}

export const getAllNearUsers = async () => {
    try {
        const response = await api.get(`${USER_API_END_POINT}/nearby`);
        return response.data;
    }
    catch (error) {
        console.error('Error in getting nearby users:', error);
        throw error;
    }
}

export const blockUser = async (id) => {
    try {
        const response = await api.post(`${USER_API_END_POINT}/block/${id}`);
        return response.data;
    }
    catch (error) {
        console.error('Error in blocking user:', error);
        throw error;
    }
}

export const unblockUser = async (id) => {
    try {
        const response = await api.post(`${USER_API_END_POINT}/unblock/${id}`);
        return response.data;
    }
    catch (error) {
        console.error('Error in unblocking user:', error);
        throw error;
    }
}

export const logoutUser = async () => {
    try {
        const response = await api.post(`${USER_API_END_POINT}/logout`);
        return response.data;
    }
    catch (error) {
        console.error('Error in logging out user:', error);
        throw error;
    }
}