import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, updateProfile } from '../store/slices/authSlice';
import { fetchMyOrders, fetchOrderDetails, cancelOrder } from '../store/slices/orderSlice';
import { useGetMyOrdersQuery } from '../store/api/orderApiSlice';
import { useGetAddressesQuery, useAddAddressMutation, useUpdateAddressMutation, useDeleteAddressMutation, useSetDefaultAddressMutation } from '../store/api/addressApiSlice';
import { useCreateReviewMutation, useUpdateReviewMutation, useGetProductDetailsQuery } from '../store/api/productApiSlice';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
// import { useAuth } from '../context/AuthContext';
import Icons from '../components/ui/Icons';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { usePrice } from '../hooks/usePrice';
import { getMediaUrl } from '../utils/apiConfig';


// Sub-components moved outside to prevent re-creation on render

const DashboardView = ({ user, handleLogout }) => {
    const navigate = useNavigate();
    // Fetch latest orders for stats (page 1, limit 1 is enough if we just want total, but we show recent activity so maybe limit 5)
    // Actually we need 'total' which comes from the pagination response now.
    const { data: orderData } = useGetMyOrdersQuery({ page: 1, limit: 5 });
    const orders = orderData?.orders || [];
    const totalOrders = orderData?.total || 0;

    // We can't easily filter "Pending" from just a page of 5 orders if we have 100.
    // Ideally we need a separate stats endpoint, but for now we'll just show what we have
    // or we might need to fetch all for stats? No, that defeats the purpose of pagination.
    // Let's rely on the returned total for total orders.
    // Pending orders count is hard without a specific endpoint. 
    // I will simplify the "Pending Orders" stat to just show "Recent Pending" or remove it if inaccurate.
    // Or I'll keep it simple and just show Total Orders.
    // Let's just use the fetched orders for "Recent Activity" and Total from metadata.

    const { items: wishlistItems = [] } = useSelector(state => state.wishlist);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-light/5 to-transparent p-6 md:p-8 border border-dark/5 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <p className="text-sm text-dark/60 uppercase tracking-widest mb-1">Welcome Back</p>
                    <h2 className="font-heading text-3xl text-primary">{user?.name}</h2>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleLogout} className="px-4 py-2 border border-dark/10 text-xs font-heading uppercase tracking-widest hover:border-primary hover:text-primary transition-colors">Log Out</button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { label: 'Total Orders', value: totalOrders, icon: Icons.Box },
                    // { label: 'Pending Orders', value: orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length, icon: Icons.Dashboard }, // Removed as we can't calculate accurately with pagination
                    { label: 'Wishlist Items', value: wishlistItems.length, icon: Icons.Heart }
                ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-dark/5 p-6 border border-dark/5 rounded-lg flex items-center justify-between group hover:border-primary/30 transition-colors">
                            <div>
                                <p className="text-xs text-dark/60 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="font-heading text-2xl text-dark">{stat.value}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-dark/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-dark transition-colors">
                                <Icon className="w-5 h-5" />
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="bg-dark/5 border border-dark/5 p-6 rounded-lg">
                <h3 className="font-heading text-lg text-dark uppercase tracking-widest mb-4">Recent Activity</h3>
                {orders.length > 0 ? (
                    <div className="text-sm">
                        <p className="text-dark mb-2">Latest Order: <span className="text-primary">#{orders[0].orderNumber ? String(orders[0].orderNumber).padStart(6, '0') : orders[0]._id.substring(orders[0]._id.length - 6)}</span></p>
                        <p className="text-dark/60">Placed on {new Date(orders[0].createdAt).toLocaleDateString()}</p>
                    </div>
                ) : (
                    <div className="text-text-main/60 text-sm">No recent activity to show.</div>
                )}
            </div>
        </div>
    );
};

const OrdersList = () => {
    const [page, setPage] = useState(1);
    const { data, isLoading: orderLoading } = useGetMyOrdersQuery({ page, limit: 10 });
    const { format } = usePrice();

    const orders = data?.orders || [];
    const totalPages = data?.pages || 0;

    return (
        <div className="animate-in fade-in duration-500">
            <h3 className="font-heading text-xl text-primary mb-6 uppercase tracking-widest flex items-center gap-3">
                <Icons.Box className="w-6 h-6" /> Order History
            </h3>
            {orderLoading ? <div className="text-dark">Loading orders...</div> : orders.length === 0 ? (
                <EmptyState
                    icon={Icons.Box}
                    title="No Orders Yet"
                    message="You haven't placed any orders yet. Start shopping to discover our luxury catalog."
                    actionLabel="Shop Now"
                    actionLink="/shop"
                />
            ) : (
                <>
                    <div className="overflow-x-auto border border-dark/10 rounded-lg">
                        <table className="w-full text-left text-sm min-w-[800px]">
                            <thead className="bg-dark/5 text-dark font-heading uppercase tracking-wider">
                                <tr>
                                    <th className="py-4 px-6">Order</th>
                                    <th className="py-4 px-6">Date</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6">Total</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-text-main/80 divide-y divide-dark/5">
                                {orders.map((order, idx) => (
                                    <tr key={idx} className="hover:bg-dark/5 transition-colors group">
                                        <td className="py-4 px-6 font-medium text-dark">#{order.orderNumber ? String(order.orderNumber).padStart(6, '0') : order._id.substring(order._id.length - 6)}</td>
                                        <td className="py-4 px-6">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wide font-medium ${order.status === 'Delivered' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                order.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-medium text-dark">{format(order.totalPrice)}</td>
                                        <td className="py-4 px-6 text-right">
                                            <Link
                                                to={`${order._id}`}
                                                className="inline-flex items-center gap-2 text-primary hover:text-dark transition-colors uppercase text-xs tracking-widest font-heading"
                                            >
                                                View Details <span className="text-lg leading-none">&rarr;</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6 gap-2">
                            <button
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                                className="px-4 py-2 text-xs font-heading uppercase tracking-widest border border-dark/10 text-dark hover:bg-dark/5 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="flex items-center px-4 text-xs font-heading text-dark/60">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={page === totalPages}
                                className="px-4 py-2 text-xs font-heading uppercase tracking-widest border border-dark/10 text-dark hover:bg-dark/5 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const OrderDetails = () => {
    const { orderId } = useParams();
    const dispatch = useDispatch();
    const { order: orderDetails, loading: orderLoading } = useSelector(state => state.order);
    const { user } = useSelector(state => state.auth);
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const { format } = usePrice();

    // API Hooks for Review
    const [createReview, { isLoading: isCreatingReview }] = useCreateReviewMutation();
    const [updateReview, { isLoading: isUpdatingReview }] = useUpdateReviewMutation();

    // We need to fetch product details to check for existing reviews when opening the modal
    // Since we open modal for one product at a time, we can fetch on demand or simplistic check if backend included it in order items (it doesn't).
    // We'll trust the process: When opening modal, we might need to know if it's an update.
    // Challenge: Order items don't have review data.
    // Solution: Fetch product details when opening modal OR try to find review in product list if we had it.
    // Better: Allow user to write. If they already reviewed, backend error "Product already reviewed" will trigger.
    // But requirement is "Update Review".
    // We'll fetch the specific product details when the modal opens to get the `userReview`.

    const [selectedProductForReview, setSelectedProductForReview] = useState(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    // Fetch details for selected product to check existing review
    const { data: productDetails, refetch: refetchProduct } = useGetProductDetailsQuery(selectedProductForReview?.product, {
        skip: !selectedProductForReview,
    });

    useEffect(() => {
        if (orderId) {
            dispatch(fetchOrderDetails(orderId));
        }
    }, [orderId, dispatch]);

    // Populate form when product details are loaded and modal is open
    useEffect(() => {
        if (reviewModalOpen && productDetails) {
            if (productDetails.userReview) {
                setRating(productDetails.userReview.rating);
                setReviewComment(productDetails.userReview.comment);
                setIsEditMode(true);
            } else {
                setRating(5);
                setReviewComment('');
                setIsEditMode(false);
            }
        }
    }, [productDetails, reviewModalOpen]);

    const handleCancelOrder = async () => {
        const confirmed = await confirm(
            'Cancel Order',
            'Are you sure you want to cancel this order? This action cannot be undone.',
            {
                confirmText: 'Cancel Order',
                cancelText: 'Keep Order',
                isDangerous: true
            }
        );

        if (confirmed) {
            try {
                await dispatch(cancelOrder(orderId)).unwrap();
                showToast('Order cancelled successfully', 'success');
            } catch (error) {
                showToast(error || 'Failed to cancel order', 'error');
            }
        }
    };

    const openReview = (item) => {
        setSelectedProductForReview(item);
        // Reset state initially, useEffect will populate if existing review found
        setRating(5);
        setReviewComment('');
        setIsEditMode(false);
        setReviewModalOpen(true);
    };

    const submitReview = async () => {
        if (!rating || !reviewComment) {
            showToast('Please provide a rating and comment', 'error');
            return;
        }

        try {
            if (isEditMode) {
                await updateReview({
                    productId: selectedProductForReview.product,
                    rating,
                    comment: reviewComment,
                }).unwrap();
                showToast('Review updated successfully', 'success');
            } else {
                await createReview({
                    productId: selectedProductForReview.product,
                    rating,
                    comment: reviewComment,
                }).unwrap();
                showToast('Review submitted successfully', 'success');
            }
            setReviewModalOpen(false);
            refetchProduct(); // Refresh product data to ensure latest review is shown if reopened
        } catch (error) {
            showToast(error?.data?.message || 'Failed to submit review', 'error');
        }
    };

    if (orderLoading) return <div className="text-dark text-center py-12">Loading order details...</div>;

    if (!orderDetails) {
        return (
            <div className="text-center py-12">
                <p className="text-dark/60">Order not found.</p>
                <Link to="/account/orders" className="text-primary hover:underline mt-4 inline-block">Back to Orders</Link>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <Link to="/account/orders" className="flex items-center gap-2 text-sm text-dark/60 hover:text-primary transition-colors mb-6">
                <span>&larr;</span> Back to Orders
            </Link>
            <div className="bg-dark/5 border border-dark/5 p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8 border-b border-dark/10 pb-6">
                    <div>
                        <h3 className="font-heading text-xl text-primary uppercase tracking-widest mb-1">Order #{orderDetails.orderNumber ? String(orderDetails.orderNumber).padStart(6, '0') : orderDetails._id.substring(orderDetails._id.length - 6)}</h3>
                        <p className="text-sm text-dark/60">Placed on {new Date(orderDetails.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded text-xs uppercase tracking-wide ${orderDetails.status === 'Delivered' ? 'bg-green-500/10 text-green-500' :
                            orderDetails.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
                                'bg-yellow-500/10 text-yellow-500'
                            }`}>
                            {orderDetails.status}
                        </span>
                        <span className="font-heading text-lg text-dark">{format(orderDetails.totalPrice)}</span>
                    </div>
                </div>

                {/* Cancel Order Button - Only show for cancellable statuses */}
                {['Pending', 'Processing', 'Confirmed'].includes(orderDetails.status) && (
                    <div className="mb-6">
                        <button
                            onClick={handleCancelOrder}
                            className="w-full md:w-auto px-6 py-3 border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors text-xs font-heading uppercase tracking-widest rounded-sm"
                        >
                            Cancel Order
                        </button>
                    </div>
                )}

                <div className="space-y-6 mb-8">
                    {orderDetails.orderItems.map((item, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-dark/5 p-4 rounded-sm border border-dark/5">
                            <div className="flex-1 flex gap-4 items-center w-full">
                                <Link to={`/product/${item.product}`} className="w-16 h-20 bg-black/20 overflow-hidden shrink-0 block hover:opacity-80 transition-opacity">
                                    <img src={getMediaUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                </Link>
                                <div className="flex-1">
                                    <Link to={`/product/${item.product}`} className="font-heading text-sm text-dark tracking-wide hover:text-primary transition-colors block">
                                        {item.name}
                                    </Link>
                                    <p className="text-xs text-dark/60">Qty: {item.qty}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-heading text-sm text-primary">{format(item.price)}</p>
                                    {orderDetails.taxPrice > 0 && orderDetails.itemsPrice > 0 && (
                                        <p className="text-[10px] text-dark/50">
                                            + {format((item.price * item.qty / orderDetails.itemsPrice) * orderDetails.taxPrice)} ({Math.round((orderDetails.taxPrice / orderDetails.itemsPrice) * 100)}% Tax)
                                        </p>
                                    )}
                                </div>
                            </div>
                            {orderDetails.status === 'Delivered' && (
                                <button
                                    onClick={() => openReview(item)}
                                    className="w-full md:w-auto px-4 py-2 border border-dark/20 text-xs font-heading uppercase tracking-widest hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
                                >
                                    Write / Edit Review
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-dark/10">
                    <div>
                        <h4 className="font-heading text-xs text-dark/60 uppercase tracking-widest mb-2">Shipping Address</h4>
                        <div className="text-sm text-text-main/80 space-y-0.5">
                            <p className="text-dark font-medium">{orderDetails.user?.name}</p>
                            <p>{orderDetails.shippingAddress.address}</p>
                            <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.postalCode}</p>
                            <p>{orderDetails.shippingAddress.country}</p>
                            <p className="text-dark/60 pt-1">{orderDetails.user?.email}</p>
                            {orderDetails.shippingAddress.phone && <p className="text-dark/60">{orderDetails.shippingAddress.phone}</p>}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-heading text-xs text-dark/60 uppercase tracking-widest mb-2">Payment Summary</h4>
                        <div className="space-y-2 text-sm text-text-main/80">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{format(orderDetails.itemsPrice)}</span>
                            </div>
                            {orderDetails.taxPrice > 0 && (
                                <div className="flex justify-between">
                                    <span>Tax ({Math.round((orderDetails.taxPrice / orderDetails.itemsPrice) * 100)}%)</span>
                                    <span>{format(orderDetails.taxPrice)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>{orderDetails.shippingPrice === 0 ? 'Free' : format(orderDetails.shippingPrice)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-dark pt-2 border-t border-dark/5">
                                <span>Total</span>
                                <span className="text-primary">{format(orderDetails.totalPrice)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Modal */}
            {reviewModalOpen && selectedProductForReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm" onClick={() => setReviewModalOpen(false)}></div>
                    <div className="relative bg-[#1A1A1A] border border-dark/10 p-8 max-w-lg w-full rounded-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setReviewModalOpen(false)}
                            className="absolute top-4 right-4 text-primary hover:scale-110 transition-transform"
                        >
                            <Icons.Close className="w-6 h-6" />
                        </button>

                        <h3 className="font-serif text-2xl text-primary mb-2">
                            {isEditMode ? 'Update Your Review' : 'Write a Review'}
                        </h3>
                        <p className="text-sm text-primary mb-6 font-body">Share your experience with {selectedProductForReview.name}</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-heading tracking-widest text-primary mb-3">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`text-2xl transition-colors hover:scale-110 duration-200 ${star <= rating ? 'text-primary' : 'text-dark/20 hover:text-primary/50'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-heading tracking-widest text-primary mb-3">Your Review</label>
                                <Textarea
                                    rows={4}
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="Tell us what you liked or didn't like..."
                                    className="bg-black/50 border-primary/20 text-light focus:border-primary resize-none placeholder:text-light/30"
                                />
                            </div>

                            <button
                                onClick={submitReview}
                                disabled={!rating || isCreatingReview || isUpdatingReview}
                                className="w-full bg-primary text-dark font-heading font-bold uppercase tracking-widest py-4 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreatingReview || isUpdatingReview ? 'Submitting...' : (isEditMode ? 'Update Review' : 'Submit Review')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AddressesView = () => {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const { user } = useSelector(state => state.auth);

    const { data: addresses = [], isLoading: addressesLoading } = useGetAddressesQuery();
    const [addAddress, { isLoading: isAddingAddress }] = useAddAddressMutation();
    const [updateAddress, { isLoading: isUpdatingAddress }] = useUpdateAddressMutation();
    const [deleteAddress] = useDeleteAddressMutation();
    const [setDefaultAddress] = useSetDefaultAddressMutation();

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        email: user?.email || '',
        firstName: '',
        lastName: '',
        address: '',
        apartment: '',
        city: '',
        postalCode: '',
        phone: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddNew = () => {
        setEditingAddress(null);
        setFormData({
            email: user?.email || '',
            firstName: '',
            lastName: '',
            address: '',
            apartment: '',
            city: '',
            postalCode: '',
            phone: ''
        });
        setShowAddressForm(true);
    };

    const handleEdit = (address) => {
        setEditingAddress(address);
        setFormData({
            email: address.email,
            firstName: address.firstName,
            lastName: address.lastName,
            address: address.address,
            apartment: address.apartment || '',
            city: address.city,
            postalCode: address.postalCode,
            phone: address.phone
        });
        setShowAddressForm(true);
    };

    const handleCancel = () => {
        setShowAddressForm(false);
        setEditingAddress(null);
        setFormData({
            email: user?.email || '',
            firstName: '',
            lastName: '',
            address: '',
            apartment: '',
            city: '',
            postalCode: '',
            phone: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Manual validation to ensure required fields are present
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(formData.email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        if (!/^\d{10}$/.test(formData.phone)) {
            showToast('Please enter a valid 10-digit mobile number', 'error');
            return;
        }

        try {
            if (editingAddress) {
                await updateAddress({
                    addressId: editingAddress._id,
                    ...formData
                }).unwrap();
                showToast('Address updated successfully', 'success');
            } else {
                await addAddress(formData).unwrap();
                showToast('Address added successfully', 'success');
            }
            handleCancel();
        } catch (error) {
            showToast(error.data?.message || 'Failed to save address', 'error');
        }
    };

    const handleDelete = async (addressId) => {
        const confirmed = await confirm(
            'Delete Address',
            'Are you sure you want to delete this address? This action cannot be undone.',
            {
                confirmText: 'Delete',
                cancelText: 'Cancel',
                isDangerous: true
            }
        );

        if (confirmed) {
            try {
                await deleteAddress(addressId).unwrap();
                showToast('Address deleted successfully', 'success');
            } catch (error) {
                showToast(error.data?.message || 'Failed to delete address', 'error');
            }
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            await setDefaultAddress(addressId).unwrap();
            showToast('Default address updated', 'success');
        } catch (error) {
            showToast(error.data?.message || 'Failed to update default address', 'error');
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h3 className="font-heading text-xl text-primary uppercase tracking-widest flex items-center gap-3">
                    <Icons.MapPin className="w-6 h-6" /> Addresses
                </h3>
                {!showAddressForm && addresses.length > 0 && (
                    <button
                        onClick={handleAddNew}
                        className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-dark transition-colors text-xs font-heading uppercase tracking-widest rounded-sm"
                    >
                        + Add New Address
                    </button>
                )}
            </div>

            {addressesLoading ? (
                <div className="text-center text-dark/60 py-12">Loading addresses...</div>
            ) : showAddressForm ? (
                <div className="bg-dark/5 border border-dark/10 p-8 rounded-lg">
                    <h4 className="font-heading text-lg text-dark uppercase tracking-widest mb-6">
                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h4>
                    <div className="space-y-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    type="text"
                                    name="firstName"
                                    required
                                    placeholder="First name *"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="bg-transparent border-dark/20 focus:border-primary"
                                />
                                <Input
                                    type="text"
                                    name="lastName"
                                    required
                                    placeholder="Last name *"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="bg-transparent border-dark/20 focus:border-primary"
                                />
                            </div>
                            <Input
                                type="email"
                                name="email"
                                required
                                placeholder="Email *"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="bg-transparent border-dark/20 focus:border-primary mt-4"
                            />
                            <Input
                                type="tel"
                                name="phone"
                                required
                                placeholder="Phone *"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="bg-transparent border-dark/20 focus:border-primary mt-4"
                            />
                            <Input
                                type="text"
                                name="address"
                                required
                                placeholder="Address *"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="bg-transparent border-dark/20 focus:border-primary mt-4"
                            />
                            <Input
                                type="text"
                                name="apartment"
                                placeholder="Apartment, suite, etc. (optional)"
                                value={formData.apartment}
                                onChange={handleInputChange}
                                className="bg-transparent border-dark/20 focus:border-primary mt-4"
                            />
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <Input
                                    type="text"
                                    name="city"
                                    required
                                    placeholder="City *"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="bg-transparent border-dark/20 focus:border-primary"
                                />
                                <Input
                                    type="text"
                                    name="postalCode"
                                    required
                                    placeholder="Postal code *"
                                    value={formData.postalCode}
                                    onChange={handleInputChange}
                                    className="bg-transparent border-dark/20 focus:border-primary"
                                />
                            </div>
                            <div className="flex flex-col md:flex-row gap-4 pt-4 mt-2">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 border border-dark/20 text-dark px-4 py-3 hover:bg-dark/5 transition-colors rounded-sm flex items-center justify-center h-auto min-h-[48px]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAddingAddress || isUpdatingAddress}
                                    className="flex-1 bg-primary text-dark font-bold uppercase tracking-widest px-4 py-3 hover:bg-light transition-colors rounded-sm disabled:opacity-50 flex items-center justify-center text-center h-auto min-h-[48px]"
                                >
                                    {isAddingAddress || isUpdatingAddress ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                        <div
                            key={address._id}
                            className="bg-dark/5 p-6 border border-dark/10 rounded-lg relative group hover:border-primary/30 transition-all"
                        >
                            {address.isDefault && (
                                <div className="absolute top-4 right-4">
                                    <span className="text-xs px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full uppercase tracking-wider">
                                        Default
                                    </span>
                                </div>
                            )}
                            <div className="space-y-3">
                                <h4 className="font-heading text-lg text-dark">
                                    {address.firstName} {address.lastName}
                                </h4>
                                <div className="text-sm text-text-main/70 space-y-1">
                                    <p>{address.address}</p>
                                    {address.apartment && <p>{address.apartment}</p>}
                                    <p>{address.city}, {address.postalCode}</p>
                                    <p className="pt-2 text-dark/60">Phone: {address.phone}</p>
                                    <p className="text-dark/60">Email: {address.email}</p>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-dark/10 flex gap-3">
                                <button
                                    onClick={() => handleEdit(address)}
                                    className="text-xs font-heading uppercase tracking-widest text-primary hover:text-dark transition-colors"
                                >
                                    Edit
                                </button>
                                {!address.isDefault && (
                                    <>
                                        <span className="text-dark/20">|</span>
                                        <button
                                            onClick={() => handleSetDefault(address._id)}
                                            className="text-xs font-heading uppercase tracking-widest text-dark/60 hover:text-primary transition-colors"
                                        >
                                            Set as Default
                                        </button>
                                    </>
                                )}
                                <span className="text-dark/20">|</span>
                                <button
                                    onClick={() => handleDelete(address._id)}
                                    className="text-xs font-heading uppercase tracking-widest text-red-400/60 hover:text-red-400 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-dark/5 border border-dark/10 rounded-lg">
                    <Icons.MapPin className="block w-16 h-16 mx-auto text-dark/20 mb-4" />
                    <p className="text-dark/60 mb-6">You haven't added any addresses yet.</p>
                    <button
                        onClick={handleAddNew}
                        className="px-6 py-3 bg-primary text-dark font-heading uppercase tracking-widest hover:bg-light transition-colors rounded-sm"
                    >
                        Add Your First Address
                    </button>
                </div>
            )}
        </div>
    );
};

const AccountDetailsView = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { showToast } = useToast();

    // Initialize state only once
    const [name, setName] = useState(user?.name || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);

    // Update name when user data loads if it was empty
    useEffect(() => {
        if (user?.name) {
            setName(user.name);
        }
    }, [user?.name]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password && password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        // This dispatch updates the user state, potentially causing re-renders
        const resultAction = await dispatch(updateProfile({ name, password }));

        if (updateProfile.fulfilled.match(resultAction)) {
            setMessage('Profile updated successfully');
            setPassword('');
            setConfirmPassword('');
            showToast('Profile updated', 'success');
        } else {
            setMessage(resultAction.payload || 'Update failed');
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            <h3 className="font-heading text-xl text-primary mb-8 uppercase tracking-widest flex items-center gap-3">
                <Icons.Settings className="w-6 h-6" /> Account Details
            </h3>
            {message && (
                <div className={`p-4 mb-4 rounded border ${message.includes('success') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {message}
                </div>
            )}
            <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="bg-dark/5 p-8 border border-dark/10 rounded-lg space-y-6">
                    <h4 className="font-heading text-sm text-dark/60 uppercase tracking-widest border-b border-dark/10 pb-4">Personal Information</h4>
                    <div>
                        <Input
                            label="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <Input
                            label="Email Address"
                            type="email"
                            defaultValue={user?.email}
                            disabled
                        />
                    </div>
                </div>

                <div className="bg-dark/5 p-8 border border-dark/10 rounded-lg space-y-6">
                    <h4 className="font-heading text-sm text-dark/60 uppercase tracking-widest border-b border-dark/10 pb-4">Change Password</h4>
                    <div className="space-y-6">
                        <div>
                            <Input
                                label="New Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Leave blank to keep current"
                            />
                        </div>
                        <div>
                            <Input
                                label="Confirm New Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mb-12">
                    <button type="submit" className="bg-primary text-dark font-heading py-3 px-8 uppercase tracking-widest hover:bg-light transition-colors rounded-sm">Save Changes</button>
                </div>
            </form>
        </div>
    );
};

const Account = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user, loading } = useSelector(state => state.auth);

    React.useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
        if (user) {
            dispatch(fetchMyOrders());
        }
    }, [user, loading, navigate, dispatch]);

    const { confirm } = useConfirm();

    const handleLogout = async () => {
        if (await confirm('Logout', 'Are you sure you want to log out?')) {
            dispatch(logoutUser());
            navigate('/login');
        }
    };

    if (loading && !user) return <div className="min-h-screen pt-32 text-center text-dark">Loading...</div>;
    if (!user) return null;

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', path: '/account', icon: Icons.Dashboard, exact: true },
        { id: 'orders', label: 'Orders', path: '/account/orders', icon: Icons.Box },
        { id: 'addresses', label: 'Addresses', path: '/account/addresses', icon: Icons.MapPin },
        { id: 'account', label: 'Account Details', path: '/account/details', icon: Icons.Settings },
        { id: 'wishlist', label: 'Wishlist', path: '/wishlist', icon: Icons.Heart, external: true },
        { id: 'logout', label: 'Logout', action: handleLogout, icon: Icons.LogOut },
    ];

    const isActive = (path, exact) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-body">
            <PageHeader title="My Account" />
            <div className="w-full px-6 md:px-12 mt-12 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
                    {/* Sidebar */}
                    <aside className="md:col-span-1">
                        <nav className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-col gap-2 bg-dark/5 backdrop-blur-sm border border-dark/10 p-3 md:p-4 rounded-lg">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                const baseClasses = "w-full flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-3 px-2 py-3 md:px-4 text-[10px] sm:text-xs md:text-sm font-heading tracking-widest uppercase transition-all duration-300 rounded-md group text-center md:text-left";
                                const isTabActive = tab.path && isActive(tab.path, tab.exact);
                                const activeClasses = "text-primary bg-dark/5 shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.1)] border border-primary/20";
                                const inactiveClasses = "text-text-main/60 hover:text-primary hover:bg-dark/5 border border-transparent";

                                if (tab.action) {
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={tab.action}
                                            className={`${baseClasses} ${inactiveClasses}`}
                                        >
                                            <Icon className="w-5 h-5 md:w-4 md:h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                                            <span className="break-words whitespace-normal">{tab.label}</span>
                                        </button>
                                    );
                                }

                                return (
                                    <Link
                                        key={tab.id}
                                        to={tab.path}
                                        className={`${baseClasses} ${isTabActive ? activeClasses : inactiveClasses}`}
                                    >
                                        <Icon className={`w-5 h-5 md:w-4 md:h-4 transition-opacity ${isTabActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
                                        <span className="break-words whitespace-normal">{tab.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Content */}
                    <main className="md:col-span-3 min-h-[500px]">
                        <Routes>
                            <Route index element={<DashboardView user={user} handleLogout={handleLogout} />} />
                            <Route path="orders" element={<OrdersList />} />
                            <Route path="orders/:orderId" element={<OrderDetails />} />
                            <Route path="addresses" element={<AddressesView />} />
                            <Route path="details" element={<AccountDetailsView />} />
                            <Route path="*" element={<Navigate to="/account" replace />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </div>
    );
};



export default Account;
