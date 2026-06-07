import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useVerifyOtpMutation, useResendOtpMutation } from '../store/api/authApiSlice';
import PageHeader from '../components/layout/PageHeader';
import bannerImg from '../assets/hero.png';
import SEO from '../components/common/SEO';
import Input from '../components/ui/Input';

import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { logoutAdmin } from '../store/slices/adminAuthSlice';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [verifyOtp, { isLoading, error }] = useVerifyOtpMutation();
    const [resendOtp, { isLoading: isResending, isSuccess: isResent }] = useResendOtpMutation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const emailParam = params.get('email');
        if (emailParam) {
            setEmail(emailParam);
        } else {
            // Fallback or redirect if no email
            // navigate('/login');
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = await verifyOtp({ email: email.toLowerCase(), otp }).unwrap();
            dispatch(logoutAdmin()); // Enforce single session locally

            // Broadcast to other tabs
            const channel = new BroadcastChannel('auth_sync_channel');
            channel.postMessage({ type: 'LOGIN_USER' });
            channel.close();

            dispatch(setCredentials({ user: userData, token: userData.token }));
            navigate('/account', { state: { message: 'Email verified! Welcome to Mershai.' } });
        } catch (err) {
            console.error('Verification failed', err);
        }
    };

    const handleResend = async () => {
        try {
            await resendOtp({ email: email.toLowerCase() }).unwrap();
            // Show toast or message
        } catch (err) {
            console.error('Resend failed', err);
        }
    };

    return (
        <div className="pt-0 min-h-screen bg-body">
            <SEO
                title="Verify Email"
                description="Verify your email address."
            />
            <PageHeader
                title="Verify Email"
                subtitle="Enter the code sent to your email"
                backgroundImage={bannerImg}
            />

            <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-16 flex justify-center">
                <div className="w-full max-w-md">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div>
                            <label className="text-xs text-light/50 mb-2 block">
                                Authentication Code
                            </label>
                            <Input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\s/g, ''))}
                                className="text-center text-2xl tracking-[0.5em]"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error?.data?.message || 'Verification failed'}
                            </div>
                        )}
                        {isResent && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                                Code resent successfully!
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-primary text-dark py-4 px-8 text-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Verifying...' : 'Verify'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-light/50 text-sm mb-4">Didn't receive the code?</p>
                        <button
                            onClick={handleResend}
                            disabled={isResending}
                            className="text-primary text-xs hover:text-white transition-colors disabled:opacity-50"
                        >
                            {isResending ? 'Sending...' : 'Resend Code'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
