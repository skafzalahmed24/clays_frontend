import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RedirectIfAuthenticated = () => {
    const { user, token } = useSelector(state => state.auth);

    // Only redirect if user is fully verified and authenticated with an active session token
    if (user && user.isVerified && token) {
        return <Navigate to="/account" replace />;
    }

    return <Outlet />;
};

export default RedirectIfAuthenticated;
