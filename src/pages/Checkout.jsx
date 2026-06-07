/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../store/slices/cartSlice';
import { createOrder, resetOrder } from '../store/slices/orderSlice';
import { useValidateCouponMutation } from '../store/api/couponApiSlice';
import { useGetAddressesQuery, useAddAddressMutation, useUpdateAddressMutation } from '../store/api/addressApiSlice';
import { useGetSettingsQuery } from '../store/api/contentApiSlice';
import PageHeader from '../components/common/PageHeader';
import Input from '../components/ui/Input';
import AddressSelector from '../components/checkout/AddressSelector';
import AddressForm from '../components/checkout/AddressForm';
import { useToast } from '../context/ToastContext';
import { getImageUrl } from '../utils/imageHelper';
import { REGEX } from '../utils/regex';
import { usePrice } from '../hooks/usePrice';

const Checkout = () => {
    const dispatch = useDispatch();
    const { items: cartItems } = useSelector(state => state.cart);
    const { user } = useSelector(state => state.auth);
    const { success, order } = useSelector(state => state.order);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { format, currency } = usePrice();

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const { data: addresses = [], isLoading: addressesLoading } = useGetAddressesQuery(undefined, { skip: !user });
    const [addAddress, { isLoading: isAddingAddress }] = useAddAddressMutation();
    const [updateAddress, { isLoading: isUpdatingAddress }] = useUpdateAddressMutation();

    const [step, setStep] = useState(1); // 1: Address/Information, 2: Payment
    const [loading, setLoading] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
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

    const [validateCoupon, { isLoading: isValidating }] = useValidateCouponMutation();
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discount, setDiscount] = useState(0);

    const [paymentData, setPaymentData] = useState({
        cardNumber: '',
        expiry: '',
        cvc: '',
        nameOnCard: ''
    });

    // Auto-select default address on load
    // eslint-disable-next-line
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            const defaultAddr = addresses.find(addr => addr.isDefault) || addresses[0];
            setSelectedAddressId(defaultAddr._id);
        }
    }, [addresses, selectedAddressId]);

    const { data: settings } = useGetSettingsQuery();

    const subtotal = cartItems.reduce((acc, item) => {
        const price = item.product?.price || item.price || 0;
        return acc + (price * item.qty);
    }, 0);

    // Tax Calculation
    const taxRate = settings?.taxRate ? Number(settings.taxRate) : 0;
    const taxPrice = Number((subtotal * (taxRate / 100)).toFixed(2));

    const shipping = 0; // Free shipping for now

    // Calculate total dynamically based on discount
    const total = subtotal + shipping + taxPrice - discount;

    // Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectAddress = (addressId) => {
        setSelectedAddressId(addressId);
    };

    const handleAddNewAddress = () => {
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

    const handleEditAddress = (address) => {
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

    const handleCancelAddressForm = () => {
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

    const handleAddressFormSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingAddress) {
                // Update existing address
                await updateAddress({
                    addressId: editingAddress._id,
                    ...formData
                }).unwrap();
                showToast('Address updated successfully', 'success');
            } else {
                // Add new address
                const result = await addAddress(formData).unwrap();
                showToast('Address saved successfully', 'success');
                // Auto-select the newly added address
                const newAddress = result[result.length - 1];
                setSelectedAddressId(newAddress._id);
            }
            handleCancelAddressForm();
        } catch (error) {
            showToast(error.data?.message || 'Failed to save address', 'error');
        }
    };

    const handleInfoSubmit = (e) => {
        e.preventDefault();

        // Validate that an address is selected or form is filled
        if (!showAddressForm && !selectedAddressId) {
            showToast('Please select or add a delivery address', 'error');
            return;
        }

        setStep(2);
        window.scrollTo(0, 0);
    };

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode) return;

        try {
            const res = await validateCoupon({ code: couponCode, cartTotal: subtotal }).unwrap();
            setAppliedCoupon(res);
            setDiscount(res.discountAmount);
            showToast(`Coupon applied! Saved ${format(res.discountAmount)}`, 'success');
        } catch (error) {
            setAppliedCoupon(null);
            setDiscount(0);
            showToast(error.data?.message || 'Invalid coupon', 'error');
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();

        // Comprehensive Validation
        const { cardNumber, expiry, cvc, nameOnCard } = paymentData;

        if (!cardNumber || !expiry || !cvc || !nameOnCard) {
            showToast('Please fill in all payment details', 'error');
            return;
        }

        // Validate Card Number (Simple length/digit check)
        const cleanCard = cardNumber.replace(/\s/g, '');
        if (!REGEX.CARD_NUMBER.test(cleanCard)) {
            showToast('Invalid card number. Please check digits.', 'error');
            return;
        }

        // Validate Expiry (MM/YY) and not expired
        if (!REGEX.EXPIRY_DATE.test(expiry)) {
            showToast('Invalid expiry date. Use MM/YY format.', 'error');
            return;
        }

        const [expMonth, expYear] = expiry.split('/').map(Number);
        const now = new Date();
        const currentYear = now.getFullYear() % 100; // Last 2 digits
        const currentMonth = now.getMonth() + 1;

        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
            showToast('Card has expired.', 'error');
            return;
        }

        // Validate CVC (3-4 digits)
        if (!REGEX.CVC.test(cvc)) {
            showToast('Invalid CVC code.', 'error');
            return;
        }

        setLoading(true);

        // Get selected address data
        const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);
        if (!selectedAddress) {
            showToast('Please select a delivery address', 'error');
            setLoading(false);
            setStep(1);
            return;
        }

        const orderData = {
            orderItems: cartItems.map(item => {
                // Normalize data structure for order creation
                const product = item.product || item;
                return {
                    product: product.id || product._id,
                    name: product.name,
                    image: product.img,
                    price: product.price,
                    qty: item.qty,
                    category: product.category // Optional, but good to have
                };
            }),
            shippingAddress: {
                address: selectedAddress.address,
                city: selectedAddress.city,
                postalCode: selectedAddress.postalCode,
                phone: selectedAddress.phone,
                country: 'India', // Default for now
            },
            paymentMethod: 'Credit Card', // Hardcoded for now
            itemsPrice: subtotal,
            taxPrice: taxPrice,
            shippingPrice: shipping,
            totalPrice: total,
            coupon: appliedCoupon ? {
                code: appliedCoupon.code,
                discount: discount
            } : null,
            // Payer info is usually from payment gateway, but we'll send email for reference
            paymentResult: {
                id: 'mock_payment_id',
                status: 'completed',
                update_time: new Date().toISOString(),
                email_address: selectedAddress.email
            }
        };

        try {
            await dispatch(createOrder(orderData)).unwrap();
            // Success navigation is handled by useEffect, so we keep loading true
        } catch (error) {
            showToast(error?.message || 'Payment failed. Please try again.', 'error');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (success && order) {
            navigate('/order-success', { state: { orderId: order._id } });
            dispatch(resetOrder());
            dispatch(clearCart());
        }
    }, [success, order, navigate, dispatch]);

    if (cartItems.length === 0) return null;

    const renderOrderSummary = (className = "") => (
        <div className={`bg-white/5 border border-light/10 p-6 md:p-8 rounded-sm ${className}`}>
            <h3 className="font-heading text-lg text-light uppercase tracking-widest mb-6 border-b border-light/10 pb-4">Order Summary</h3>

            {/* Items List */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6 custom-scrollbar pt-3">
                {cartItems.map((item) => {
                    const product = item.product || item;
                    const name = product.name || 'Unknown Product';
                    const img = product.img || null;
                    const price = product.price || 0;
                    const category = product.category || '';

                    return (
                        <div key={item.id || item._id} className="flex gap-4 items-center">
                            <div className="relative w-16 h-16 bg-black/40 rounded-sm flex-shrink-0 border border-light/10 overflow-visible">
                                <img src={getImageUrl(img)} alt={name} className="w-full h-full object-cover rounded-sm" />
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-dark text-xs font-bold rounded-full flex items-center justify-center border-2 border-stone-900">
                                    {item.qty}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-light truncate">{name}</h4>
                                <p className="text-xs text-light/50">{category}</p>
                            </div>
                            <div className="text-sm font-medium text-light">
                                {format(price * item.qty)}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pt-6 mb-6">
                <div className="flex gap-2">
                    <Input
                        placeholder="Promo Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault(); // Prevent outer form submission
                                handleApplyCoupon(e);
                            }
                        }}
                        className="bg-transparent border-light/20 text-sm py-2"
                    />
                    <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={!couponCode || isValidating}
                        className="bg-white/10 text-light px-4 py-2 rounded-sm text-sm font-medium hover:bg-white/20 disabled:opacity-50 transition-colors"
                    >
                        {isValidating ? '...' : 'Apply'}
                    </button>
                </div>
                {appliedCoupon && (
                    <div className="mt-2 text-xs text-green-400 flex justify-between">
                        <span>Code {appliedCoupon.code} applied</span>
                        <button onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponCode(''); }} className="text-red-400 hover:underline">Remove</button>
                    </div>
                )}
            </div>

            {/* Totals */}
            <div className="space-y-3 border-t border-light/10 pt-4 mb-6">
                <div className="flex justify-between text-sm text-light/70">
                    <span>Subtotal</span>
                    <span className="text-light">{format(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-light/70">
                    <span>Shipping</span>
                    <span className="text-light">{shipping === 0 ? 'Free' : format(shipping)}</span>
                </div>
                {taxPrice > 0 && (
                    <div className="flex justify-between text-sm text-light/70">
                        <span>Tax ({taxRate}%)</span>
                        <span className="text-light">{format(taxPrice)}</span>
                    </div>
                )}
                {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-400">
                        <span>Discount</span>
                        <span>-{format(discount)}</span>
                    </div>
                )}
            </div>
            <div className="flex justify-between items-center pt-6 mt-6 border-t border-light/10">
                <span className="text-lg font-heading text-light uppercase tracking-widest">Total</span>
                <div className="text-right">
                    <span className="text-xs text-light/50 block mb-1">{currency}</span>
                    <span className="text-2xl font-bold text-primary">{format(total)}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-body text-text-main font-body">
            <PageHeader title="Checkout" />

            <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">

                    {/* LEFT COLUMN: FORMS */}
                    <div className="flex-1">
                        {/* Breadcrumbs / Steps */}
                        <div className="flex items-center gap-2 text-sm mb-8 font-heading tracking-widest">
                            <span className={`${step === 1 ? 'text-primary' : 'text-light'} transition-colors`}>Information</span>
                            <span className="text-white/20">/</span>
                            <span className={`${step === 2 ? 'text-primary' : 'text-white/40'} transition-colors`}>Payment</span>
                            <span className="text-white/20">/</span>
                            <span className="text-white/40">Success</span>
                        </div>

                        {/* STEP 1: SHIPPING ADDRESS */}
                        {step === 1 && (
                            <form onSubmit={handleInfoSubmit} className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="space-y-6">
                                    <h2 className="text-lg font-heading text-light uppercase tracking-widest border-b border-light/10 pb-4">
                                        Shipping Address
                                    </h2>

                                    {addressesLoading ? (
                                        <div className="text-center text-light/60 py-8">Loading addresses...</div>
                                    ) : showAddressForm ? (
                                        <>
                                            <AddressForm
                                                formData={formData}
                                                onChange={handleInputChange}
                                                onSubmit={handleAddressFormSubmit}
                                                onCancel={addresses.length > 0 ? handleCancelAddressForm : null}
                                                isEditing={!!editingAddress}
                                                loading={isAddingAddress || isUpdatingAddress}
                                            />
                                        </>
                                    ) : addresses.length > 0 ? (
                                        <AddressSelector
                                            addresses={addresses}
                                            selectedAddressId={selectedAddressId}
                                            onSelectAddress={handleSelectAddress}
                                            onAddNew={handleAddNewAddress}
                                            onEdit={handleEditAddress}
                                        />
                                    ) : (
                                        <div className="text-center text-light/60 py-4">
                                            <p className="mb-4">You haven't added any delivery addresses yet.</p>
                                            <button
                                                type="button"
                                                onClick={handleAddNewAddress}
                                                className="text-primary hover:underline"
                                            >
                                                Add your first address
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {!showAddressForm && addresses.length > 0 && (
                                    <>
                                        {renderOrderSummary('lg:hidden mb-8')}
                                        <div className="flex justify-end pt-6">
                                            <button type="submit" className="bg-primary text-dark font-bold uppercase tracking-widest px-8 py-3 hover:bg-light transition-colors rounded-sm">
                                                Continue to Payment
                                            </button>
                                        </div>
                                    </>
                                )}
                            </form>
                        )}

                        {/* STEP 2: PAYMENT */}
                        {step === 2 && (
                            <form onSubmit={handlePaymentSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                {(() => {
                                    const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);
                                    return selectedAddress ? (
                                        <div className="bg-white/5 border border-light/10 p-4 rounded-sm space-y-2 text-sm">
                                            <div className="flex justify-between border-b border-light/5 pb-2">
                                                <span className="text-light/60">Contact</span>
                                                <span className="text-light">{selectedAddress.email}</span>
                                                <button type="button" onClick={() => setStep(1)} className="text-primary hover:underline text-xs">Change</button>
                                            </div>
                                            <div className="flex justify-between pt-2">
                                                <span className="text-light/60">Ship to</span>
                                                <span className="text-light">{selectedAddress.address}, {selectedAddress.city}</span>
                                                <button type="button" onClick={() => setStep(1)} className="text-primary hover:underline text-xs">Change</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-sm text-sm text-red-400">
                                            No address selected. Please go back and select an address.
                                        </div>
                                    );
                                })()}

                                <div className="space-y-6 pt-6">
                                    <h2 className="text-lg font-heading text-light uppercase tracking-widest border-b border-light/10 pb-4">Payment Method</h2>
                                    <p className="text-sm text-light/60">All transactions are secure and encrypted.</p>

                                    <div className="border border-light/20 rounded-sm overflow-hidden">
                                        <div className="p-4 bg-white/5 border-b border-light/10 flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full border-[5px] border-primary bg-white"></div>
                                            <span className="font-medium text-light">Credit Card</span>
                                        </div>
                                        <div className="p-6 bg-black/20 space-y-4">
                                            <Input
                                                type="text"
                                                placeholder="Card number *"
                                                className="bg-transparent border-light/20 focus:border-primary"
                                                value={paymentData.cardNumber}
                                                maxLength={19}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, ''); // Remove non-digits
                                                    setPaymentData({ ...paymentData, cardNumber: val });
                                                }}
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input
                                                    type="text"
                                                    placeholder="Expiration date (MM / YY) *"
                                                    className="bg-transparent border-light/20 focus:border-primary"
                                                    value={paymentData.expiry}
                                                    maxLength={5}
                                                    onChange={(e) => {
                                                        const clean = e.target.value.replace(/\D/g, '');
                                                        let formatted = clean;
                                                        if (clean.length >= 2) {
                                                            formatted = clean.substring(0, 2) + '/' + clean.substring(2, 4);
                                                        }
                                                        setPaymentData({ ...paymentData, expiry: formatted });
                                                    }}
                                                />
                                                <Input
                                                    type="text"
                                                    placeholder="Security code *"
                                                    className="bg-transparent border-light/20 focus:border-primary"
                                                    value={paymentData.cvc}
                                                    maxLength={4}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '');
                                                        setPaymentData({ ...paymentData, cvc: val });
                                                    }}
                                                />
                                            </div>
                                            <Input
                                                type="text"
                                                placeholder="Name on card *"
                                                className="bg-transparent border-light/20 focus:border-primary"
                                                value={paymentData.nameOnCard}
                                                onChange={(e) => setPaymentData({ ...paymentData, nameOnCard: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {renderOrderSummary('lg:hidden mb-8 mt-8')}

                                <div className="flex justify-between items-center pt-8">
                                    <button type="button" onClick={() => setStep(1)} className="text-light/60 hover:text-white transition-colors flex items-center gap-2 text-sm">
                                        <span className="rotate-180 text-xs">➜</span> Return to Information
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-primary text-dark font-bold uppercase tracking-widest px-8 py-3 hover:bg-light transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                                    >
                                        {loading ? "Processing..." : "Pay now"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* RIGHT COLUMN: ORDER SUMMARY (DESKTOP) */}
                    <div className="w-full lg:w-[400px] flex-shrink-0 hidden lg:block">
                        {renderOrderSummary()}
                    </div>

                </div>
            </div>
        </div >
    );
};

export default Checkout;
