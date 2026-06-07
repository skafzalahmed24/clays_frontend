import React, { useState } from 'react';
import Icons from '../../components/ui/Icons';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { REGEX } from '../../utils/regex';
import { useToast } from '../../context/ToastContext';
import { useGetCouponsQuery, useCreateCouponMutation, useDeleteCouponMutation } from '../../store/api/couponApiSlice';

import { useConfirm } from '../../context/ConfirmContext';

const Coupons = () => {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [page, setPage] = useState(1);
    const limit = 6; // Grid of 2x3 or 3x2, let's use 6 or 8
    const { data, isLoading } = useGetCouponsQuery({ page, limit });
    const coupons = data?.coupons || [];
    const totalPages = data?.pages || 0;

    const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
    const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage',
        value: '',
        minOrderAmount: '',
        expiryDate: '',
        usageLimit: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // VALIDATION
        if (!formData.code.trim()) {
            showToast('Coupon code is required', 'error');
            return;
        }

        // Code Format: Alphanumeric and underscores only
        if (!REGEX.COUPON_CODE.test(formData.code)) {
            showToast('Coupon code can only contain letters, numbers, and underscores', 'error');
            return;
        }

        const value = Number(formData.value);
        if (value <= 0) {
            showToast('Discount value must be greater than 0', 'error');
            return;
        }
        if (formData.type === 'percentage' && value > 100) {
            showToast('Percentage discount cannot exceed 100%', 'error');
            return;
        }

        if (Number(formData.minOrderAmount) < 0) {
            showToast('Minimum order amount cannot be negative', 'error');
            return;
        }

        if (formData.usageLimit && Number(formData.usageLimit) <= 0) {
            showToast('Usage limit must be a positive number', 'error');
            return;
        }

        // Expiry Date check (optional warning, but let's enforce future date for new coupons)
        if (new Date(formData.expiryDate) < new Date().setHours(0, 0, 0, 0)) {
            showToast('Expiry date cannot be in the past', 'error');
            return;
        }

        try {
            await createCoupon({
                ...formData,
                value: value,
                minOrderAmount: Number(formData.minOrderAmount) || 0,
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null
            }).unwrap();

            showToast('Coupon created successfully', 'success');
            setFormData({
                code: '',
                type: 'percentage',
                value: '',
                minOrderAmount: '',
                expiryDate: '',
                usageLimit: ''
            });
        } catch (error) {
            showToast(error.data?.message || 'Failed to create coupon', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (await confirm('Delete Coupon', 'Are you sure you want to delete this coupon? This action cannot be undone.', { isDangerous: true, confirmText: 'Delete' })) {
            try {
                await deleteCoupon(id).unwrap();
                showToast('Coupon deleted', 'success');
            } catch (error) {
                showToast(error.data?.message || 'Failed to delete coupon', 'error');
            }
        }
    };

    if (isLoading) return <div className="p-8 text-light/50">Loading coupons...</div>;

    return (
        <div className="px-6 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8">
                <h1 className="font-heading text-3xl text-light">Discount Codes</h1>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                {/* Create Form */}
                <div className="xl:col-span-4 h-fit xl:sticky xl:top-24">
                    <div className="bg-dark-paper p-8 rounded-sm border border-light/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors duration-500"></div>

                        <h2 className="text-2xl font-heading text-light mb-8 flex items-center gap-3 whitespace-nowrap">
                            <Icons.Tag className="w-5 h-5 text-primary" />
                            Create New Coupon
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-body/30 p-4 border border-light/5 rounded-sm mb-6">
                                <label className="block text-xs uppercase tracking-widest text-light/40 mb-2 font-medium">Coupon Code Preview</label>
                                <div className="text-2xl font-bold text-primary tracking-[0.2em] font-mono border-b border-dashed border-primary/30 pb-1">
                                    {formData.code || 'CODE'}
                                </div>
                            </div>

                            <Input
                                label="Coupon Code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="E.G. SUMMER25"
                                required
                                className="font-mono tracking-wider uppercase"
                            />

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <Select
                                        label="Discount Type"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        options={[
                                            { value: 'percentage', label: 'Percentage (%)' },
                                            { value: 'fixed', label: 'Fixed Amount (₹)' }
                                        ]}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="Discount Value"
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        required
                                        placeholder="0"
                                    />
                                    <p className="text-[10px] text-light/40 mt-1 uppercase tracking-wider">
                                        {formData.type === 'percentage' ? 'Percent off (e.g. 20 for 20%)' : 'Amount off in Rupees'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <Input
                                        label="Min Order Amount (₹)"
                                        type="number"
                                        value={formData.minOrderAmount}
                                        onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                                        placeholder="0"
                                    />
                                    <p className="text-[10px] text-light/40 mt-1 uppercase tracking-wider">Minimum cart subtotal required to apply</p>
                                </div>
                                <div>
                                    <Input
                                        label="Total Usage Limit"
                                        type="number"
                                        placeholder="Unlimited"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    />
                                    <p className="text-[10px] text-light/40 mt-1 uppercase tracking-wider">Max total uses allowed (leave blank for unlimited)</p>
                                </div>
                            </div>

                            <Input
                                label="Expiry Date"
                                type="date"
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />

                            <button
                                type="submit"
                                disabled={isCreating}
                                className="w-full bg-primary text-dark font-bold uppercase tracking-[0.2em] py-4 hover:bg-light transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] mt-4"
                            >
                                {isCreating ? 'Creating...' : 'Create Coupon'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="xl:col-span-8 space-y-6">
                    <div className="flex justify-between items-end mb-6">
                        <h3 className="text-lg font-light text-light/60 uppercase tracking-widest">Active Coupons</h3>
                        <span className="text-xs text-light/30 bg-white/5 px-3 py-1 rounded-full">{data?.total || 0} Total</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {coupons.map(coupon => (
                            <div key={coupon._id} className="bg-dark-paper p-6 relative group overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-500 hover:-translate-y-1">
                                {/* Gradient Background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                                <div className="relative z-10 flex justify-between items-start">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-xs uppercase tracking-widest text-light/40 mb-1">Code</div>
                                            <div className="text-2xl font-bold text-primary tracking-wider font-mono">{coupon.code}</div>
                                        </div>

                                        <div className="flex gap-4 text-sm">
                                            <div>
                                                <div className="text-xs text-light/30 uppercase tracking-wide">Discount</div>
                                                <div className="text-light">{coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}</div>
                                            </div>
                                            <div className="w-px bg-white/10"></div>
                                            <div>
                                                <div className="text-xs text-light/30 uppercase tracking-wide">Min Order</div>
                                                <div className="text-light">₹{coupon.minOrderAmount}</div>
                                            </div>
                                        </div>

                                        <div className={`inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-xs border border-white/5 ${new Date(coupon.expiryDate) < new Date() ? 'text-red-400 border-red-500/20' : 'text-green-400 border-green-500/20'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${new Date(coupon.expiryDate) < new Date() ? 'bg-red-400' : 'bg-green-400'}`}></div>
                                            Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(coupon._id)}
                                        disabled={isDeleting}
                                        className="p-3 text-light/20 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all duration-300 transform group-hover:scale-100 scale-90"
                                        title="Delete Coupon"
                                    >
                                        <Icons.Trash className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-4">
                            <p className="text-sm text-light/40">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 text-xs font-heading uppercase tracking-widest border border-white/10 text-light hover:bg-white/5 rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 text-xs font-heading uppercase tracking-widest border border-white/10 text-light hover:bg-white/5 rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {coupons?.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 bg-dark-paper border border-dashed border-white/10 rounded-sm">
                            <Icons.Tag className="w-16 h-16 text-light/10 mb-6" />
                            <h3 className="text-xl text-light/40 font-heading mb-2">No Active Coupons</h3>
                            <p className="text-light/30 text-sm max-w-sm text-center">Create your first discount code to start running promotions for your customers.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Coupons;
