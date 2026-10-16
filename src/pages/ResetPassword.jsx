import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useResetPasswordMutation } from '../store/api/authApiSlice';
import PageHeader from '../components/layout/PageHeader';
import SEO from '../components/common/SEO';
import Input from '../components/ui/Input';
import { REGEX } from '../utils/regex';

const ResetPassword = () => {
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [localError, setLocalError] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    const [resetPassword, { isLoading, error }] = useResetPasswordMutation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const phoneParam = params.get('phone');
        if (phoneParam) {
            setPhone(phoneParam);
        } else {
            setLocalError('Mobile number is missing. Please restart the forgot password process.');
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!phone) {
            setLocalError('Mobile number is required to reset password');
            return;
        }

        if (!otp || otp.length < 4) {
            setLocalError('Please enter a valid OTP code');
            return;
        }

        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setLocalError('Password must be at least 6 characters long');
            return;
        }

        if (REGEX?.PASSWORD_STRONG && !REGEX.PASSWORD_STRONG.test(password)) {
            setLocalError('Password must be at least 8 chars, include Upper, Lower, Number & Special char');
            return;
        }

        try {
            await resetPassword({
                phone,
                otp: otp.trim(),
                password
            }).unwrap();

            navigate('/login', { state: { message: 'Password reset successful! Please login with your new password.' } });
        } catch (err) {
            setLocalError(err?.data?.message || err?.message || 'Password reset failed');
        }
    };

    return (
        <div className="pt-0 min-h-screen bg-body">
            <SEO
                title="Reset Password"
                description="Create a new password using your mobile OTP."
            />
            <PageHeader
                title="Reset Password"
                subtitle={phone ? `Enter the verification code sent to ${phone} and your new password` : 'Enter verification code and your new password'}
            />

            <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-16 flex justify-center">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {phone && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-700 flex justify-between items-center">
                                <span>Resetting password for:</span>
                                <span className="font-semibold text-gray-900">{phone}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                6-Digit OTP Verification Code <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                value={otp}
                                onChange={(e) => {
                                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                                    if (localError) setLocalError('');
                                }}
                                className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 text-center text-xl tracking-[0.4em] font-mono focus:bg-white"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                New Password <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value.replace(/\s/g, ''));
                                    if (localError) setLocalError('');
                                }}
                                className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                Confirm New Password <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value.replace(/\s/g, ''));
                                    if (localError) setLocalError('');
                                }}
                                className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {(localError || error) && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                                {localError || error?.data?.message || 'Reset failed'}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-white font-heading font-medium py-3 rounded-lg shadow-md hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Resetting Password...' : 'Reset Password'}
                        </button>

                        <div className="text-center text-sm text-gray-600">
                            Back to{' '}
                            <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                                Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
