import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../store/api/authApiSlice';
import PageHeader from '../components/layout/PageHeader';
import SEO from '../components/common/SEO';

const ForgotPassword = () => {
    const [phone, setPhone] = useState('');
    const [localError, setLocalError] = useState('');
    const navigate = useNavigate();

    const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();

    const handlePhoneChange = (e) => {
        let val = e.target.value;
        if (val.startsWith('+91')) {
            val = val.slice(3);
        } else if (val.startsWith('+')) {
            setLocalError('Only Indian (+91) mobile numbers are accepted');
            return;
        }
        let digitsOnly = val.replace(/\D/g, '');
        if (digitsOnly.startsWith('91') && digitsOnly.length > 10) {
            digitsOnly = digitsOnly.slice(2);
        } else if (digitsOnly.startsWith('0') && digitsOnly.length > 10) {
            digitsOnly = digitsOnly.slice(1);
        }
        digitsOnly = digitsOnly.slice(0, 10);
        setPhone(digitsOnly);
        if (localError) setLocalError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cleanDigits = phone.replace(/\D/g, '');
        if (!cleanDigits) {
            setLocalError('Please enter your mobile number');
            return;
        }

        if (cleanDigits.length !== 10 || !/^[6-9]\d{9}$/.test(cleanDigits)) {
            setLocalError('Please enter a valid 10-digit Indian mobile number (+91) starting with 6, 7, 8, or 9');
            return;
        }

        const fullPhone = `+91${cleanDigits}`;

        try {
            await forgotPassword({ phone: fullPhone }).unwrap();
            navigate(`/reset-password?phone=${encodeURIComponent(fullPhone)}`);
        } catch (err) {
            setLocalError(err?.data?.message || err?.message || 'Failed to send reset code');
        }
    };

    return (
        <div className="pt-0 min-h-screen bg-body">
            <SEO
                title="Forgot Password"
                description="Reset your password via Indian mobile OTP."
            />
            <PageHeader
                title="Forgot Password"
                subtitle="Enter your Indian mobile number (+91) to receive a reset OTP"
            />

            <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-16 flex justify-center">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div>
                            <label htmlFor="forgot-phone" className="block text-xs font-medium text-gray-700 mb-1.5">
                                Mobile Number (India +91) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative flex rounded-lg shadow-sm">
                                <div className="inline-flex items-center px-3.5 rounded-l-lg border border-r-0 border-gray-200 bg-gray-100 text-gray-700 text-sm font-medium select-none space-x-1.5">
                                    <span role="img" aria-label="India Flag">🇮🇳</span>
                                    <span>+91</span>
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    id="forgot-phone"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    placeholder="98765 43210"
                                    maxLength={10}
                                    required
                                    className="block w-full px-4 py-3 border border-gray-200 rounded-r-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-gray-300 transition-all duration-300 focus:outline-none text-base"
                                />
                            </div>
                            <p className="mt-1.5 text-[11px] text-gray-500">
                                We'll send a 6-digit verification OTP to this mobile number.
                            </p>
                        </div>

                        {(localError || error) && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                                {localError || error?.data?.message || 'Failed to send reset code'}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-white font-heading font-medium py-3 rounded-lg shadow-md hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Sending OTP...' : 'Send Reset OTP'}
                        </button>

                        <div className="text-center text-sm text-gray-600">
                            Remember your password?{' '}
                            <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                                Login Here
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
