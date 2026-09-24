import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icons from '../../components/ui/Icons';
import PreviewableImage from '../../components/ui/PreviewableImage';
import { useToast } from '../../context/ToastContext';
import { useGetOrderDetailsQuery, useUpdateOrderStatusMutation, useCreateDelhiveryShipmentMutation } from '../../store/api/orderApiSlice';
import { useLazyTrackWaybillQuery, useLazyGetShippingLabelQuery, useCancelShipmentMutation, useGetLiveRateMutation } from '../../store/api/shippingApiSlice';
import Select from '../../components/ui/Select';
import { useConfirm } from '../../context/ConfirmContext';

const AdminOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    // Fetch Details
    const { data: order, isLoading: loading, error, refetch } = useGetOrderDetailsQuery(id);

    // Update Status Mutation
    const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
    const [createShipment, { isLoading: isCreatingShipment }] = useCreateDelhiveryShipmentMutation();
    const [trackWaybill, { isLoading: isTracking }] = useLazyTrackWaybillQuery();
    const [getShippingLabel, { isLoading: isFetchingLabel }] = useLazyGetShippingLabelQuery();
    const [cancelShipment, { isLoading: isCancellingShipment }] = useCancelShipmentMutation();
    const [getLiveRate] = useGetLiveRateMutation();

    const [trackingData, setTrackingData] = useState(null);
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [delhiveryRateData, setDelhiveryRateData] = useState(null);
    const [rateLoading, setRateLoading] = useState(false);

    const fetchOrderDelhiveryRate = async () => {
        if (!order?.shippingAddress?.postalCode) return;
        setRateLoading(true);
        try {
            const res = await getLiveRate({
                destPincode: order.shippingAddress.postalCode,
                weightGrams: 500,
                paymentMode: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
                codAmount: order.paymentMethod === 'COD' ? order.totalPrice : 0
            }).unwrap();
            setDelhiveryRateData(res);
        } catch (err) {
            console.warn('Could not fetch live rate calculation:', err);
        } finally {
            setRateLoading(false);
        }
    };

    useEffect(() => {
        if (order?.shippingAddress?.postalCode) {
            fetchOrderDelhiveryRate();
        }
    }, [order?.shippingAddress?.postalCode, order?.paymentMethod, order?.totalPrice]);

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

    const handleCreateShipment = async () => {
        const confirmed = await confirm(
            'Create Delhivery Shipment',
            'Are you sure you want to generate a Delhivery shipment for this order? This will create an AWB tracking number with your registered warehouse pickup location.',
            { confirmText: 'Create Shipment', cancelText: 'Cancel' }
        );

        if (confirmed) {
            try {
                await createShipment(id).unwrap();
                showToast('Delhivery Shipment created successfully! AWB generated.', 'success');
                if (refetch) refetch();
            } catch (err) {
                console.error(err);
                showToast(err?.data?.message || 'Failed to create shipment', 'error');
            }
        }
    };

    const handleFetchTracking = async (waybill) => {
        try {
            const data = await trackWaybill(waybill).unwrap();
            setTrackingData(data);
            setShowTrackingModal(true);
        } catch (err) {
            showToast(err?.data?.message || 'Failed to fetch live tracking', 'error');
        }
    };

    const handleDownloadLabel = async (waybill) => {
        try {
            const res = await getShippingLabel(waybill).unwrap();
            if (res?.packages_found > 0 || res?.packages?.[0]?.pdf_download_link) {
                const pdfLink = res.packages?.[0]?.pdf_download_link || `https://track.delhivery.com/api/p/packing_slip?wbns=${waybill}&pdf=true`;
                window.open(pdfLink, '_blank');
            } else {
                window.open(`https://track.delhivery.com/api/p/packing_slip?wbns=${waybill}&pdf=true`, '_blank');
            }
            showToast('Opening shipping label...', 'success');
        } catch (err) {
            showToast(err?.data?.message || 'Failed to fetch label', 'error');
        }
    };

    const handleCancelShipment = async (waybill) => {
        const confirmed = await confirm(
            'Cancel Delhivery Shipment',
            `Are you sure you want to cancel the Delhivery shipment for AWB ${waybill}?`,
            { confirmText: 'Cancel Shipment', cancelText: 'Keep Active' }
        );

        if (confirmed) {
            try {
                await cancelShipment(waybill).unwrap();
                showToast('Delhivery shipment cancellation requested', 'success');
                if (refetch) refetch();
            } catch (err) {
                showToast(err?.data?.message || 'Failed to cancel shipment', 'error');
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
                            Order #{order.orderNumber ? String(order.orderNumber).padStart(6, '0') : order._id.substring(order._id.length - 6)}
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
                                <div className="space-y-2">
                                    <p className="text-sm text-light/80">Paid at: {order.paidAt ? new Date(order.paidAt).toLocaleDateString() : 'Not Paid'}</p>
                                    <p className="text-sm text-light/80">Payment Mode: <span className="font-medium text-light">{order.paymentMethod}</span></p>
                                    {order.paymentResult?.id && (
                                        <div className="text-sm text-light/80">
                                            <span className="text-xs text-light/40 block">Transaction ID:</span>
                                            <span className="font-mono text-xs text-light/90">{order.paymentResult.id}</span>
                                        </div>
                                    )}
                                </div>
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

                    {/* Shipping & Tracking */}
                    <div className="bg-dark-paper border border-white/10 rounded-lg overflow-hidden">
                        <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                            <h2 className="font-heading text-lg text-light">Shipping & Tracking</h2>
                            <span className="text-[10px] uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded font-bold">
                                Delhivery
                            </span>
                        </div>
                        <div className="p-4">
                            {order.shippingResult && order.shippingResult.waybill ? (
                                <div className="space-y-4">
                                    <div className="p-3 bg-white/5 border border-white/10 rounded">
                                        <span className="text-xs text-light/40 block uppercase tracking-wider">Waybill / AWB Number</span>
                                        <span className="font-mono text-xl font-bold text-primary tracking-wider">{order.shippingResult.waybill}</span>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                            <span className="text-xs text-light/80 font-medium">
                                                {order.shippingResult.status || 'Manifested'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => handleFetchTracking(order.shippingResult.waybill)}
                                            disabled={isTracking}
                                            className="w-full bg-primary/20 border border-primary/40 text-primary hover:bg-primary hover:text-dark font-medium text-xs uppercase tracking-wider py-2.5 rounded transition-all flex items-center justify-center gap-2"
                                        >
                                            {isTracking ? 'Fetching Status...' : '🔍 Live Delhivery Tracking'}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDownloadLabel(order.shippingResult.waybill)}
                                            disabled={isFetchingLabel}
                                            className="w-full bg-white/10 hover:bg-white hover:text-dark text-light border border-white/20 font-medium text-xs uppercase tracking-wider py-2.5 rounded transition-all flex items-center justify-center gap-2"
                                        >
                                            📄 Print Shipping Label / Packing Slip
                                        </button>

                                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                            <button
                                                type="button"
                                                onClick={() => handleCancelShipment(order.shippingResult.waybill)}
                                                disabled={isCancellingShipment}
                                                className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 text-xs py-2 rounded transition-all mt-1"
                                            >
                                                {isCancellingShipment ? 'Cancelling...' : 'Cancel Waybill'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-light/60">No Delhivery shipment generated yet.</p>
                                    <button
                                        onClick={handleCreateShipment}
                                        disabled={isCreatingShipment || order.status === 'Cancelled'}
                                        className="w-full bg-primary text-dark font-bold uppercase tracking-widest px-4 py-3 hover:bg-white transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isCreatingShipment ? 'Generating AWB...' : '⚡ Generate Delhivery AWB'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delhivery Live Courier Cost Breakdown */}
                    <div className="bg-dark-paper border border-white/10 rounded-lg overflow-hidden">
                        <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-base">💰</span>
                                <h2 className="font-heading text-lg text-light">Delhivery Cost Breakdown</h2>
                            </div>
                            <button
                                type="button"
                                onClick={fetchOrderDelhiveryRate}
                                disabled={rateLoading}
                                className="text-[11px] text-primary hover:text-white bg-primary/10 border border-primary/30 px-2 py-1 rounded transition-colors"
                            >
                                {rateLoading ? 'Calculating...' : '🔄 Live Calculate'}
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            {delhiveryRateData ? (
                                <div className="space-y-3">
                                    {/* Big Total Wallet Deduction */}
                                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-primary/80 block">
                                                Delhivery Wallet Deduction
                                            </span>
                                            <span className="text-2xl font-mono font-bold text-primary">
                                                ₹{delhiveryRateData.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] text-light/50 block">Payment Mode</span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${delhiveryRateData.paymentMode === 'COD' ? 'bg-amber-500/20 text-amber-300' : 'bg-green-500/20 text-green-300'}`}>
                                                {delhiveryRateData.paymentMode}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Itemized Table */}
                                    <div className="bg-white/5 rounded-lg p-3 space-y-2 text-xs">
                                        <div className="flex justify-between text-light/70">
                                            <span>Base Freight ({delhiveryRateData.chargedWeight}g):</span>
                                            <span className="font-mono text-light">₹{delhiveryRateData.freightCharge?.toFixed(2)}</span>
                                        </div>
                                        {delhiveryRateData.codCharge > 0 && (
                                            <div className="flex justify-between text-amber-300/90 font-medium">
                                                <span>COD Collection Fee ({delhiveryRateData.codAmount ? `on ₹${delhiveryRateData.codAmount}` : ''}):</span>
                                                <span className="font-mono">₹{delhiveryRateData.codCharge?.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {delhiveryRateData.surcharges > 0 && (
                                            <div className="flex justify-between text-light/70">
                                                <span>Surcharges (Fuel / Peak):</span>
                                                <span className="font-mono text-light">₹{delhiveryRateData.surcharges?.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-light/50 pt-1 border-t border-white/5">
                                            <span>Taxable Subtotal:</span>
                                            <span className="font-mono text-light/80">₹{delhiveryRateData.taxableSubtotal?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-light/70">
                                            <span>GST (18% CGST + SGST):</span>
                                            <span className="font-mono text-light">₹{delhiveryRateData.taxAmount?.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Route Info */}
                                    <div className="flex items-center justify-between text-[11px] text-light/50 px-1">
                                        <span>Route: {delhiveryRateData.originPin} ➔ {delhiveryRateData.destPin}</span>
                                        <span>Zone: <strong className="text-light">{delhiveryRateData.zone}</strong></span>
                                    </div>

                                    {order.paymentMethod === 'COD' && (
                                        <p className="text-[11px] text-light/50 bg-white/5 p-2 rounded leading-relaxed">
                                            💡 <strong className="text-light/70">COD Note:</strong> Delhivery charges ₹{delhiveryRateData.codCharge?.toFixed(2)} for handling cash. You can add an Extra COD Fee in Settings to collect this from buyers.
                                        </p>
                                    )}
                                </div>
                            ) : rateLoading ? (
                                <div className="text-center py-4 text-xs text-light/50 animate-pulse">
                                    Calculating live Delhivery courier charges...
                                </div>
                            ) : (
                                <div className="text-center py-3 text-xs text-light/40">
                                    Click "Live Calculate" to check Delhivery charges.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Live Tracking Modal */}
            {showTrackingModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-dark-paper border border-white/10 rounded-lg max-w-xl w-full p-6 space-y-6 max-h-[85vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <div>
                                <h3 className="font-heading text-lg text-light">Live Delhivery Tracking</h3>
                                <p className="text-xs text-light/50 font-mono mt-0.5">AWB: {trackingData?.waybill}</p>
                            </div>
                            <button
                                onClick={() => setShowTrackingModal(false)}
                                className="text-light/60 hover:text-light text-xl p-1"
                            >
                                ✕
                            </button>
                        </div>

                        {trackingData && (
                            <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded">
                                    <div>
                                        <span className="text-xs text-light/40 block">Current Status</span>
                                        <span className="font-bold text-primary">{trackingData.status}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-light/40 block">Expected Delivery</span>
                                        <span className="text-light">{trackingData.expectedDate || '3 - 5 business days'}</span>
                                    </div>
                                    {trackingData.statusLocation && (
                                        <div className="col-span-2">
                                            <span className="text-xs text-light/40 block">Latest Location</span>
                                            <span className="text-light">{trackingData.statusLocation}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-xs uppercase tracking-wider text-light/60 mb-3">Scan History</h4>
                                    {(!trackingData.scans || trackingData.scans.length === 0) ? (
                                        <p className="text-xs text-light/40 italic p-3 bg-white/5 rounded">Shipment is created and waiting for courier pickup.</p>
                                    ) : (
                                        <div className="space-y-3 border-l-2 border-primary/40 pl-4 ml-2">
                                            {trackingData.scans.map((scan, sIdx) => (
                                                <div key={sIdx} className="relative">
                                                    <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary"></span>
                                                    <p className="font-medium text-light text-xs">{scan.status}</p>
                                                    <p className="text-[11px] text-light/50">{scan.location} {scan.dateTime ? `• ${new Date(scan.dateTime).toLocaleString()}` : ''}</p>
                                                    {scan.instructions && <p className="text-[10px] text-light/40 italic">{scan.instructions}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrderDetails;
