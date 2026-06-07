import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useResetPasswordMutation } from '../store/api/authApiSlice';
import PageHeader from '../components/layout/PageHeader';
import bannerImg from '../assets/hero.png';
import SEO from '../components/common/SEO';
import Input from '../components/ui/Input';

const ResetPassword = () => {
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    const [resetPassword, { isLoading, error }] = useResetPasswordMutation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const emailParam = params.get('email');
        if (emailParam) {
            setEmail(emailParam);
        } else {
            setMessage('Email is missing. Please restart the forgot password process.');
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        try {
            await resetPassword({ email, otp, password }).unwrap();
            navigate('/login', { state: { message: 'Password reset successful! Please login.' } });
        } catch (err) {
            console.error('Reset failed', err);
        }
    };

    return (
        <div className="pt-0 min-h-screen bg-body">
            <SEO
                title="Reset Password"
                description="Create a new password."
            />
            <PageHeader
                title="Reset Password"
                subtitle="Enter verification code and your new password"
                backgroundImage={bannerImg}
            />

            <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-16 flex justify-center">
                <div className="w-full max-w-md">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div>
                            <label className="text-xs text-light/50 mb-2 block">
                                Verification Code
                            </label>
                            <Input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="bg-light/5 border-light/10 text-light placeholder-light/20 text-center text-xl tracking-widest"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs text-light/50 mb-2 block">
                                New Password
                            </label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value.replace(/\s/g, ''))}
                                className="bg-light/5 border-light/10 text-light placeholder-light/20"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs text-light/50 mb-2 block">
                                Confirm New Password
                            </label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value.replace(/\s/g, ''))}
                                className="bg-light/5 border-light/10 text-light placeholder-light/20"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {message && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {message}
                            </div>
                        )}
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error?.data?.message || 'Reset failed'}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-primary text-dark py-4 px-8 text-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
