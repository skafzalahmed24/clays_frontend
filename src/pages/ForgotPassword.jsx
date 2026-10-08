import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForgotPasswordMutation } from '../store/api/authApiSlice';
import PageHeader from '../components/layout/PageHeader';
import SEO from '../components/common/SEO';
import Input from '../components/ui/Input';

const ForgotPassword = () => {
    const [identifier, setIdentifier] = useState('');
    const navigate = useNavigate();

    const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const isEmail = identifier.includes('@');
            const payload = isEmail ? { email: identifier.trim().toLowerCase() } : { phone: identifier.trim() };
            
            await forgotPassword(payload).unwrap();
            
            // Redirect to Reset Password page passing identifier
            const queryParam = isEmail ? `email=${encodeURIComponent(identifier.trim().toLowerCase())}` : `phone=${encodeURIComponent(identifier.trim())}`;
            navigate(`/reset-password?${queryParam}`);
        } catch (err) {
            console.error('Failed to send reset code', err);
        }
    };

    return (
        <div className="pt-0 min-h-screen bg-body">
            <SEO
                title="Forgot Password"
                description="Reset your password."
            />
            <PageHeader
                title="Forgot Password"
                subtitle="Enter your email or Indian mobile (+91) to receive a reset OTP"
            />

            <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-16 flex justify-center">
                <div className="w-full max-w-md">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div>
                            <label className="text-xs text-light/50 mb-2 block">
                                Email Address or Mobile (+91)
                            </label>
                            <Input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="bg-light/5 border-light/10 text-light placeholder-light/20"
                                placeholder="name@example.com or +91 98765 43210"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error?.data?.message || 'Failed to send reset code'}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-primary text-dark py-4 px-8 text-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
