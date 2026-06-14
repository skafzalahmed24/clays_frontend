import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginAdmin, clearAdminError } from '../../store/slices/adminAuthSlice';
import { logoutUser, logOutLocal } from '../../store/slices/authSlice';
import { useToast } from '../../context/ToastContext';
import { BRAND_CONFIG } from '../../utils/config';
import client from '../../api/client';
import Input from '../../components/ui/Input';
import Icons from '../../components/ui/Icons';

const AdminLogin = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error: authError, adminInfo } = useSelector(state => state.adminAuth);
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [localError, setLocalError] = useState('');

    // Forgot Password State
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP & NewPass
    const [resetEmail, setResetEmail] = useState('');
    const [resetOtp, setResetOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetLocalError, setResetLocalError] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');

    // Clear errors on mount
    useEffect(() => {
        dispatch(clearAdminError());
    }, [dispatch]);

    // Check if already logged in
    useEffect(() => {
        if (adminInfo) {
            navigate('/admin');
        }
    }, [adminInfo, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Disallow spaces
        const newValue = (name === 'email' || name === 'password') ? value.replace(/\s/g, '') : value;

        setFormData({ ...formData, [name]: newValue });
        if (localError) setLocalError('');
        if (authError) dispatch(clearAdminError());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setLocalError('Please fill in all fields');
            return;
        }

        try {
            // Clear User session before attempting Admin login
            dispatch(logOutLocal());

            const resultAction = await dispatch(loginAdmin({ email: formData.email.toLowerCase(), password: formData.password }));

            if (loginAdmin.fulfilled.match(resultAction)) {
                // Broadcast to other tabs
                const channel = new BroadcastChannel('auth_sync_channel');
                channel.postMessage({ type: 'LOGIN_ADMIN' });
                channel.close();

                showToast(`Welcome Admin`, 'success');
                navigate('/admin');
            } else {
                setLocalError(resultAction.payload || 'Login failed');
            }
        } catch (err) {
            setLocalError('An unexpected error occurred.');
            console.error(err);
        }
    };

    // Forgot Password Handlers
    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setResetLocalError('');
        setResetSuccess('');

        try {
            await client.post('/admin/forgot-password', { email: resetEmail });
            setResetSuccess('OTP Sent! Please check your email.');
            setResetStep(2);
        } catch (err) {
            setResetLocalError(err.response?.data?.message || 'Failed to send OTP');
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setResetLocalError('');

        // Basic validation
        if (newPassword.includes(' ')) {
            setResetLocalError('Password cannot contain spaces');
            return;
        }

        try {
            await client.post('/admin/reset-password', {
                email: resetEmail,
                otp: resetOtp,
                newPassword
            });
            showToast('Password reset successful. Please login.', 'success');
            setShowForgotModal(false);
            setFormData({ email: resetEmail, password: '' });
            setResetStep(1);
        } catch (err) {
            setResetLocalError(err.response?.data?.message || 'Failed to reset password');
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden admin-layout">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-sm p-8 md:p-12 relative z-10 shadow-2xl">
                <div className="text-center mb-10">
                    <p className="text-primary text-xs uppercase tracking-[0.3em] mb-4">Internal Access</p>
                    <h1 className="text-3xl font-serif text-white mb-2">{BRAND_CONFIG.brandName}</h1>
                    <p className="text-white/40 font-light text-sm">Dashboard Admin Login</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        icon={Icons.Email}
                        required
                        className="bg-black/20 border-white/10 focus:border-primary/50 text-white"
                        labelClassName="text-white/60"
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="bg-black/20 border-white/10 focus:border-primary/50 text-white"
                        labelClassName="text-white/60"
                    />

                    {/* Error Message */}
                    {localError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center rounded-sm">
                            {localError}
                        </div>
                    )}
                    {authError && !localError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center rounded-sm">
                            {authError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-dark font-heading py-3 uppercase tracking-widest hover:brightness-110 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Authenticating...' : 'Access Dashboard'}
                    </button>

                    <div className="text-center pt-4">
                        <a href="/" className="text-xs text-white/30 hover:text-white transition-colors border-b border-transparent hover:border-white/30 pb-0.5">
                            Return to Store
                        </a>
                    </div>

                    <div className="text-center">
                        <button type="button" onClick={() => setShowForgotModal(true)} className="text-xs text-primary/80 hover:text-primary transition-colors">
                            Forgot Password?
                        </button>
                    </div>
                </form>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-dark-paper border border-white/10 p-8 rounded-lg max-w-sm w-full space-y-6 relative animate-in fade-in zoom-in-95 duration-300">
                        <button
                            onClick={() => { setShowForgotModal(false); setResetStep(1); }}
                            className="absolute top-4 right-4 text-light/50 hover:text-light transition-colors"
                        >
                            <Icons.Close />
                        </button>

                        <h2 className="text-xl font-heading text-light mb-2">
                            {resetStep === 1 ? 'Reset Password' : 'New Password'}
                        </h2>

                        {resetLocalError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center rounded-sm">
                                {resetLocalError}
                            </div>
                        )}
                        {resetSuccess && (
                            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs text-center rounded-sm">
                                {resetSuccess}
                            </div>
                        )}

                        {resetStep === 1 ? (
                            // Step 1: Email Request
                            <form onSubmit={handleForgotSubmit} className="space-y-4">
                                <p className="text-sm text-light/60">Enter your admin email address to receive a One-Time Password (OTP).</p>
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    required
                                    className="bg-black/20 border-white/10 text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-dark font-bold py-2 hover:bg-white transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Send OTP'}
                                </button>
                            </form>
                        ) : (
                            // Step 2: Verify OTP & New Password
                            <form onSubmit={handleResetSubmit} className="space-y-4">
                                <p className="text-sm text-light/60">Enter the OTP sent to your email and your new password.</p>
                                <Input
                                    label="Enter OTP"
                                    value={resetOtp}
                                    onChange={(e) => setResetOtp(e.target.value)}
                                    required
                                    className="bg-black/20 border-white/10 text-white"
                                />
                                <Input
                                    label="New Password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="bg-black/20 border-white/10 text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-dark font-bold py-2 hover:bg-white transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Resetting...' : 'Update Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLogin;
