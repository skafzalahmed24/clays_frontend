import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux'; // Removed
import Icons from '../../components/ui/Icons';
import PreviewableImage from '../../components/ui/PreviewableImage';
import { useToast } from '../../context/ToastContext';
import { useGetOrderDetailsQuery, useUpdateOrderStatusMutation } from '../../store/api/orderApiSlice';
import Select from '../../components/ui/Select';
import { useConfirm } from '../../context/ConfirmContext';

const AdminOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    // Fetch Details
    const { data: order, isLoading: loading, error } = useGetOrderDetailsQuery(id);

    // Update Status Mutation
    const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

    useEffect(() => {
        if (error) {
            showToast(error?.data?.message || 'Failed to load order', 'error');
            navigate('/admin/orders');
        }
    }, [error, showToast, navigate]);

    const handleStatusChange = async (newStatus) => {
        const confirmed = await confirm(
            'Update Order Status',
            `Are you sure you want to change the order status to "${newStatus}"?`,
            { confirmText: 'Update', cancelText: 'Cancel' }
        );

        if (confirmed) {
            try {
                await updateStatus({ id, status: newStatus }).unwrap();
                showToast(`Order status updated to ${newStatus}`, 'success');
            } catch (err) {
                console.error(err);
                showToast('Failed to update status', 'error');
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-light/50">Loading order...</div>;
    if (!order) return <div className="p-8 text-center text-light/50">Order not found</div>;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'Processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Confirmed': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
            case 'Shipped': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'Delivered': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'Cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-white/5 text-light/60 border-white/10';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="group p-2 bg-white/5 hover:bg-primary rounded-full text-light/60 hover:text-dark transition-all duration-300 hover:-translate-x-1"
                    >
                        <span className="rotate-180 block transition-transform group-hover:scale-110">➜</span>
                    </button>
                    <div>
                        <h1 className="font-heading text-3xl text-light flex items-center gap-4">
                            Order #{order._id.substring(order._id.length - 6)}
                            <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(order.status)} font-sans font-bold uppercase tracking-wider`}>
                                {order.status}
                            </span>
                        </h1>
                        <p className="text-light/50 text-sm mt-1">{new Date(order.createdAt).toLocaleDateString()} • {order.orderItems?.length || 0} Items</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Select
                        value={order.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        options={isUpdating ? [{ value: order.status, label: 'Updating...' }] : [
                            { value: "Pending", label: "Pending" },
                            { value: "Processing", label: "Processing" },
                            { value: "Confirmed", label: "Confirmed" },
                            { value: "Shipped", label: "Shipped" },
                            { value: "Delivered", label: "Delivered" },
                            { value: "Cancelled", label: "Cancelled" }
                        ]}
                        className={`min-w-[150px] ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
                        disabled={order.status === 'Delivered' || order.status === 'Cancelled' || isUpdating}
                    />
                    {(order.status === 'Delivered' || order.status === 'Cancelled') && (
                        <span className="text-xs text-light/40 flex items-center uppercase tracking-wider">
                            Final Status
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-dark-paper border border-white/10 rounded-lg overflow-hidden">
                        <div className="p-4 bg-white/5 border-b border-white/10">
                            <h2 className="font-heading text-lg text-light">Order Items</h2>
                        </div>
                        <div className="divide-y divide-white/5">
                            {order.orderItems.map((item, idx) => (
                                <div key={idx} className="p-4 flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-sm border border-white/10 overflow-hidden flex-shrink-0">
                                        <PreviewableImage 
                                            src={item.image} 
                                            alt={item.name} 
                                            containerClassName="w-full h-full"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-light font-medium truncate">{item.name}</h3>
                                        {/* Category not stored in OrderItem, omitting */}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-light font-medium">₹{item.price.toLocaleString()}</p>
                                        <p className="text-sm text-light/50">Qty: {item.qty}</p>
                                        {order.taxPrice > 0 && order.itemsPrice > 0 && (
                                            <p className="text-[10px] text-light/40 mt-1">
                                                + ₹{((item.price * item.qty / order.itemsPrice) * order.taxPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })} ({Math.round((order.taxPrice / order.itemsPrice) * 100)}% Tax)
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-white/5 border-t border-white/10 space-y-2">
                            <div className="flex justify-between text-sm text-light/70">
                                <span>Subtotal</span>
                                <span>₹{order.itemsPrice?.toLocaleString()}</span>
                            </div>
                            {order.taxPrice > 0 && (
                                <div className="flex justify-between text-sm text-light/70">
                                    <span>Tax ({Math.round((order.taxPrice / order.itemsPrice) * 100)}%)</span>
                                    <span>₹{order.taxPrice.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-light/70">
                                <span>Shipping</span>
                                <span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t border-white/5">
                                <span>Total</span>
                                <span>₹{order.totalPrice?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer & Address */}
                <div className="space-y-6">
                    <div className="bg-dark-paper border border-white/10 rounded-lg overflow-hidden">
                        <div className="p-4 bg-white/5 border-b border-white/10">
                            <h2 className="font-heading text-lg text-light">Customer</h2>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                                    {(order.user?.name || 'G')[0]}
                                </div>
                                <div>
                                    <p className="text-light font-medium">{order.user?.name || 'Guest User'}</p>
                                    <p className="text-sm text-light/50">{order.user?.email || order.paymentResult?.email_address}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <h3 className="text-xs uppercase tracking-wider text-light/40 mb-2">Details</h3>
                                <p className="text-sm text-light/80">Paid at: {order.paidAt ? new Date(order.paidAt).toLocaleDateString() : 'Not Paid'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-dark-paper border border-white/10 rounded-lg overflow-hidden">
                        <div className="p-4 bg-white/5 border-b border-white/10">
                            <h2 className="font-heading text-lg text-light">Shipping Address</h2>
                        </div>
                        <div className="p-4 text-sm text-light/80 leading-relaxed">
                            <p>{order.shippingAddress?.address}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                            <p>{order.shippingAddress?.country}</p>

                            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                                {/* Try to find matching address for phone, or fallback */}
                                {(() => {
                                    const matchingAddr = order.user?.addresses?.find(a =>
                                        a.postalCode === order.shippingAddress?.postalCode &&
                                        a.city === order.shippingAddress?.city
                                    );
                                    const phone = matchingAddr?.phone || order.user?.addresses?.[0]?.phone || 'N/A';

                                    return (
                                        <>
                                            <p className="flex justify-between">
                                                <span className="text-light/50 text-xs uppercase tracking-wider">Mobile</span>
                                                <span>{phone}</span>
                                            </p>
                                            <p className="flex justify-between">
                                                <span className="text-light/50 text-xs uppercase tracking-wider">Email</span>
                                                <span>{order.user?.email || order.paymentResult?.email_address}</span>
                                            </p>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetails;
