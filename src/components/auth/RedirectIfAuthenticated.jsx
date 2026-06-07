import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RedirectIfAuthenticated = () => {
    const { user } = useSelector(state => state.auth);

    if (user) {
        return <Navigate to="/account" replace />;
    }

    return <Outlet />;
};

export default RedirectIfAuthenticated;
