import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4 py-16">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="font-heading text-3xl text-gray-900 mb-2 tracking-wider uppercase font-bold">{title}</h2>
                    {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
                </div>
                <div className="bg-white border border-gray-100 p-8 shadow-xl shadow-gray-200/50 rounded-2xl">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
