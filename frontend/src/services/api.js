import axios from 'axios';
import toast from 'react-hot-toast';
import { getDataFromLocalStorage } from '../utils/helper';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = getDataFromLocalStorage()?.token;
        if (token && shouldIncludeToken(config)) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const shouldIncludeToken = (config) => {
    const noAuthPaths = ['/signup', '/login'];
    return !noAuthPaths.some((path) => config.url.includes(path));
};

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const currentPath = window.location.pathname;
            if (currentPath !== '/' && currentPath !== '/login' && currentPath !== '/register') {
                window.location.replace('/');
                localStorage.removeItem('authToken');
                toast.error("Unauthorized User");
            }
        }
        if ((error.response && error.response.status === 403) || (error.response && error.response.status === 500 && error.response.data.error.name === 'CastError')) {
            toast.error(error.response.data.message);
            setTimeout(() => {
                window.location.replace('/app/chats');
            }, 2000);
        }
        return Promise.reject(error);
    }
);

export default api;
