import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-body px-4 py-16">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="font-heading text-3xl text-light mb-2 tracking-wider uppercase">{title}</h2>
                    {subtitle && <p className="text-text-main/60 text-sm">{subtitle}</p>}
                </div>
                <div className="bg-dark border border-white/5 p-8 shadow-2xl backdrop-blur-sm">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
