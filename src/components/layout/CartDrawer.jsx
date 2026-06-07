import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useGetSettingsQuery } from '../../store/api/contentApiSlice'; // Import RTK Query hook
import Icons from '../ui/Icons';
import { setCartOpen, removeFromCart } from '../../store/slices/cartSlice';
import { usePrice } from '../../hooks/usePrice';
import { getMediaUrl } from '../../utils/apiConfig';

const CartDrawer = () => {
    const { format } = usePrice();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: cartItems, cartOpen } = useSelector(state => state.cart);
    const { user } = useSelector(state => state.auth);
    const { data: settings } = useGetSettingsQuery();

    const cartTotal = Array.isArray(cartItems) ? cartItems.reduce((acc, item) => {
        const price = item.product?.price || item.price || 0;
        return acc + (price * item.qty);
    }, 0) : 0;
    const labels = settings?.uiLabels?.cart || {};

    const handleCheckout = () => {
        if (!user) {
            navigate('/login'); // Enforce login for checkout per user goal
            dispatch(setCartOpen(false));
            return;
        }
        dispatch(setCartOpen(false));
        navigate('/checkout');
    };

    return (
        <div
            className={`fixed inset-0 z-[60] flex justify-end transition-opacity duration-300 ${cartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCartOpen(false)}></div>

            {/* Drawer */}
            <div className={`relative w-full max-w-md bg-stone-900 h-full shadow-2xl transform transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-heading text-primary">Your Shopping Bag ({(Array.isArray(cartItems) ? cartItems : []).reduce((a, c) => a + c.qty, 0)})</h2>
                    <button onClick={() => dispatch(setCartOpen(false))} className="text-gray-400 hover:text-white"><Icons.Close /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {(!Array.isArray(cartItems) || cartItems.length === 0) ? (
                        <div className="text-center text-gray-400 mt-10">
                            <p className="mb-4">{labels.emptyMessage || 'Your bag is empty.'}</p>
                            <button onClick={() => dispatch(setCartOpen(false))} className="text-primary underline hover:text-white">{labels.startShoppingBtn || 'Start Shopping'}</button>
                        </div>
                    ) : (
                        cartItems.map((item) => {
                            // Normalize data structure: Backend returns { product: {...}, qty } vs Guest { ...product, qty }
                            const product = item.product || item;
                            const name = product.name || 'Unknown Product';
                            const img = product.img || null;
                            const price = product.price || 0;
                            // Guest cart has displayPrice string, backend has raw price number
                            const displayPrice = typeof product.displayPrice === 'string'
                                ? product.displayPrice
                                : format(price);

                            return (
                                <div key={item.id || item._id} className="flex gap-4">
                                    <div className="w-20 h-20 bg-white/5 rounded-none overflow-hidden flex-shrink-0">
                                        <img
                                            src={getMediaUrl(img)}
                                            alt={name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-heading text-sm text-white">
                                            {name}
                                        </h3>
                                        <p className="text-xs text-gray-400 mb-2">
                                            {product.category || ''}
                                        </p>
                                        <p className="text-primary text-sm">
                                            {displayPrice} x {item.qty}
                                        </p>
                                    </div>
                                    <div className="flex flex-col justify-between items-end">
                                        <button
                                            onClick={() => dispatch(removeFromCart({ id: product.id || product._id, isGuest: !user }))}
                                            className="text-gray-500 hover:text-red-400"
                                        >
                                            <Icons.Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );

                        })
                    )}
                </div>

                {(Array.isArray(cartItems) && cartItems.length > 0) && (
                    <div className="p-6 border-t border-white/10 bg-black/20">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-300">Subtotal</span>
                            <span className="text-xl font-heading text-primary">{format(cartTotal)}</span>
                        </div>
                        <p className="text-xs text-center text-gray-500 mb-4">{labels.disclaimer || 'Shipping and taxes calculated at checkout.'}</p>
                        <button onClick={handleCheckout} className="w-full bg-primary text-dark font-heading font-bold py-3 hover:bg-white transition-colors">
                            Checkout Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
