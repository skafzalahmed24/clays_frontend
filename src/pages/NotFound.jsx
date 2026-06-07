import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <>
            <Helmet>
                <title>404 - Page Not Found | Mershai</title>
            </Helmet>
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-9xl font-heading text-primary/20 select-none">404</h1>
                <h2 className="text-3xl md:text-4xl font-heading text-light -mt-12 mb-6 relative z-10">Page Not Found</h2>
                <p className="text-light/60 max-w-md mx-auto mb-10 font-sans">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link
                    to="/"
                    className="inline-block bg-primary text-dark font-bold uppercase tracking-widest px-8 py-4 hover:bg-light transition-colors duration-300"
                >
                    Back to Home
                </Link>
            </div>
        </>
    );
};

export default NotFound;
