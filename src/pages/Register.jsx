import React from 'react';
import { useGetSettingsQuery } from '../store/api/contentApiSlice';
import RegisterForm from '../components/auth/RegisterForm';
import AuthLayout from '../components/auth/AuthLayout';

const Register = () => {
    const { data: settings } = useGetSettingsQuery();

    const labels = settings?.uiLabels?.auth || {};

    return (
        <AuthLayout
            title={labels.registerTitle || "Join the Club"}
            subtitle={labels.registerSubtitle || "Create an account to unlock exclusive benefits"}
        >
            <RegisterForm />
        </AuthLayout>
    );
};

export default Register;
