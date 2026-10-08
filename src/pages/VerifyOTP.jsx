import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useVerifyOtpMutation, useResendOtpMutation } from '../store/api/authApiSlice';
import PageHeader from '../components/layout/PageHeader';
import SEO from '../components/common/SEO';
import Input from '../components/ui/Input';

import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { logoutAdmin } from '../store/slices/adminAuthSlice';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [verifyOtp, { isLoading, error }] = useVerifyOtpMutation();
    const [resendOtp, { isLoading: isResending, isSuccess: isResent }] = useResendOtpMutation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const emailParam = params.get('email');
        const phoneParam = params.get('phone');
        if (emailParam) setEmail(emailParam);
        if (phoneParam) setPhone(phoneParam);
    }, [location]);

    useEffect(() => {
        if (countdown > 0 && !canResend) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCanResend(true);
        }
    }, [countdown, canResend]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { otp };
            if (email) payload.email = email.toLowerCase();
            if (phone) payload.phone = phone;

            const userData = await verifyOtp(payload).unwrap();
            dispatch(logoutAdmin()); // Enforce single session locally

            // Broadcast to other tabs
            const channel = new BroadcastChannel('auth_sync_channel');
            channel.postMessage({ type: 'LOGIN_USER' });
            channel.close();

            dispatch(setCredentials({ user: userData, token: userData.token }));
            navigate('/account', { state: { message: 'Account verified! Welcome to Clarysays.' } });
        } catch (err) {
            console.error('Verification failed', err);
        }
    };

    const handleResend = async () => {
        try {
            const payload = {};
            if (email) payload.email = email.toLowerCase();
            if (phone) payload.phone = phone;

            await resendOtp(payload).unwrap();
            setCanResend(false);
            setCountdown(60);
        } catch (err) {
            console.error('Resend failed', err);
        }
    };

    const targetDestination = phone ? (email ? `${phone} / ${email}` : phone) : (email || 'your registered contact');

    return (
        <div className="pt-0 min-h-screen bg-body">
            <SEO
                title="Verify OTP"
                description="Verify your account OTP."
            />
            <PageHeader
                title="Verify OTP"
                subtitle={`Enter the code sent to ${targetDestination}`}
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
                            disabled={isResending || !canResend}
                            className="text-primary text-xs hover:text-dark transition-colors disabled:opacity-50"
                        >
                            {isResending ? 'Sending...' : (canResend ? 'Resend Code' : `Resend Code in ${countdown}s`)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
