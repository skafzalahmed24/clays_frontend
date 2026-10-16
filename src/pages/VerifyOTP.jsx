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
    const [phone, setPhone] = useState('');
    const [localError, setLocalError] = useState('');
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [verifyOtp, { isLoading, error }] = useVerifyOtpMutation();
    const [resendOtp, { isLoading: isResending, isSuccess: isResent }] = useResendOtpMutation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const phoneParam = params.get('phone');
        if (phoneParam) {
            setPhone(phoneParam);
        } else {
            setLocalError('Mobile number is missing. Please restart the verification process.');
        }
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

        if (!phone) {
            setLocalError('Mobile number is missing.');
            return;
        }

        if (!otp || otp.length < 4) {
            setLocalError('Please enter a valid 6-digit OTP');
            return;
        }

        try {
            const userData = await verifyOtp({
                phone,
                otp: otp.trim()
            }).unwrap();

            dispatch(logoutAdmin()); // Enforce single session locally

            // Broadcast to other tabs
            const channel = new BroadcastChannel('auth_sync_channel');
            channel.postMessage({ type: 'LOGIN_USER' });
            channel.close();

            dispatch(setCredentials({ user: userData.data || userData, token: userData.data?.token || userData.token }));
            navigate('/account', { state: { message: 'Account verified successfully! Welcome to Clarysays.' } });
        } catch (err) {
            setLocalError(err?.data?.message || err?.message || 'Verification failed');
        }
    };

    const handleResend = async () => {
        if (!phone) return;
        try {
            await resendOtp({ phone }).unwrap();
            setCanResend(false);
            setCountdown(60);
            setLocalError('');
        } catch (err) {
            setLocalError(err?.data?.message || err?.message || 'Failed to resend OTP');
        }
    };

    const targetDestination = phone || 'your registered mobile number';

    return (
        <div className="pt-0 min-h-screen bg-body">
            <SEO
                title="Verify OTP"
                description="Verify your Indian mobile OTP."
            />
            <PageHeader
                title="Verify Mobile OTP"
                subtitle={`Enter the 6-digit code sent to ${targetDestination}`}
            />

            <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-16 flex justify-center">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {phone && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700 flex justify-between items-center">
                                <span>Mobile number:</span>
                                <span className="font-semibold text-gray-900">{phone}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                6-Digit Authentication Code <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                value={otp}
                                onChange={(e) => {
                                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                                    if (localError) setLocalError('');
                                }}
                                className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 text-center text-2xl tracking-[0.4em] font-mono focus:bg-white"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                        </div>

                        {(localError || error) && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                                {localError || error?.data?.message || 'Verification failed'}
                            </div>
                        )}

                        {isResent && (
                            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center">
                                New OTP code sent to your mobile number!
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-white font-heading font-medium py-3 rounded-lg shadow-md hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Verifying...' : 'Verify & Continue'}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-gray-100 pt-6">
                        <p className="text-gray-500 text-xs mb-2">Didn't receive the SMS OTP?</p>
                        <button
                            onClick={handleResend}
                            disabled={isResending || !canResend}
                            className="text-primary text-sm font-medium hover:underline disabled:opacity-50 disabled:no-underline"
                        >
                            {isResending ? 'Sending...' : (canResend ? 'Resend OTP' : `Resend OTP in ${countdown}s`)}
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <Link to="/login" className="text-xs text-gray-500 hover:text-gray-700">
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
