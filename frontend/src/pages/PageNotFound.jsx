import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { Button } from '@chakra-ui/react';

const NotFound = () => {
    return (
        <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-bl from-[#e5e0ff] to-[#f7f4ff] p-6'>
            <PageHeader title="404" subtitle="Page Not Found" />
            <Link to="/">
                <Button
                    size="lg"
                    className="primary-btn"
                >
                    Go Home
                </Button>
            </Link>
        </div>
    );
};

export default NotFound;
