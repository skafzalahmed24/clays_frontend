import React from 'react';
import { useGetSettingsQuery } from '../store/api/contentApiSlice';
import { logoutAdmin } from '../store/slices/adminAuthSlice';
import LoginForm from '../components/auth/LoginForm';
import AuthLayout from '../components/auth/AuthLayout';

const Login = () => {
    const { data: settings } = useGetSettingsQuery();

    const labels = settings?.uiLabels?.auth || {};

    return (
        <AuthLayout
            title={labels.loginTitle || "Welcome Back"}
            subtitle={labels.loginSubtitle || "Login to access your personalized shopping experience"}
        >
            <LoginForm />
        </AuthLayout>
    );
};

export default Login;
