import api from "./api";
import { UPLOAD_API_END_POINT } from "./constants";

export const uploadFiles = async (data) => {
    try {
        const response = await api.post(`${UPLOAD_API_END_POINT}/uploadFiles`, data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
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