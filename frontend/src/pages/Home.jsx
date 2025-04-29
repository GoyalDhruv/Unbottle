import { Button } from '@chakra-ui/react';
import ChatImg from '../assets/Chat.svg'
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {

    const { isAuthenticated } = useAuth();


    return (
        <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-bl from-[#e5e0ff] to-[#f7f4ff] p-6">
            {/* Top Heading */}
            <div className="py-10">
                <PageHeader
                    title="Unbottle"
                    subtitle="Talk to strangers anonymously & freely."
                    subtitleSize="2xl"
                    marginTop="12"
                    maxWidth="350px"
                />
            </div>

            {/* Center Illustration */}
            <div>
                <img
                    src={ChatImg}
                    alt="Chat Illustration"
                    className="w-[300px] h-[300px]"
                />
            </div>

            {/* Start Button */}
            <div className="mb-10">
                <Link to={isAuthenticated ? `/app/chats` : `/register`}>
                    <Button
                        size="lg"
                        className="primary-btn"
                    >
                        Get Started
                    </Button>
                </Link>
            </div>
        </div>
    );
}
