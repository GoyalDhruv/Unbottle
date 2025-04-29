import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {

        if (error.response && error.response.status === 401) {
            const currentPath = window.location.pathname;
            console.log(currentPath)
            if (currentPath !== '/' && currentPath !== '/login' && currentPath !== '/register') {
                window.location.replace('/');
                toast.error("Unauthorized User");
            }
        }
        return Promise.reject(error);
    }
);

export default api;
