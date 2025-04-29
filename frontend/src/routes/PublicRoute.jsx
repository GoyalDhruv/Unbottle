import { Navigate, Outlet } from 'react-router-dom';
import Loader from '../components/Loader/Loader';
import { useAuth } from '../context/AuthContext';

export default function PublicRoute() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    if (isAuthenticated) {
        return <Navigate to="/app/chats" replace />;
    }

    return <Outlet />;
}
