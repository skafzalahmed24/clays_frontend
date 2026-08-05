import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getImageUrl } from '../../utils/imageHelper';
import Icons from './Icons';
import TextHighlight from './TextHighlight';
import { addToCart, removeFromCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { useToast } from '../../context/ToastContext';

const ProductCard = ({ product, onNavigate, searchQuery }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // For redirecting to login
    const { showToast } = useToast();
    const [localLoading, setLocalLoading] = useState(false);

    // Selectors
    const { items: cartItems } = useSelector(state => state.cart);
    const { items: wishlistItems } = useSelector(state => state.wishlist);
    const { user } = useSelector(state => state.auth);

    const productId = product.id || product._id;

    const isInCart = Array.isArray(cartItems) && cartItems.some(item => {
        const itemId = item.product?._id || item.product?.id || item.id || item._id;
        return itemId === productId;
    });
    const isInWishlist = Array.isArray(wishlistItems) && wishlistItems.some(item => (item.id || item._id) === productId);

    // Safeguard against invalid data types rendering
    if (typeof product.name === 'object' || typeof product.displayPrice === 'object') {
        console.error("ProductCard received invalid data type:", product);
        return <div className="p-4 border border-red-500/50 text-red-400 text-xs">Invalid Product Data</div>;
    }

    return (
        <div className="group cursor-pointer">
            <div className="relative aspect-[4/5] overflow-hidden bg-light/5 mb-6 rounded-sm border border-light/5 group-hover:border-primary/30 transition-colors duration-500">
                <Link to={`/product/${productId}`} className="block w-full h-full" onClick={onNavigate}>
                    <img
                        src={getImageUrl(product.img)}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Link>

                {/* Floating Action Button */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-10 space-x-2">
                    <button
                        onClick={async (e) => {
                            e.preventDefault();
                            if (!user) {
                                showToast('Please login to add items to cart', 'error');
                                navigate('/login');
                                return;
                            }
                            setLocalLoading(true);
                            try {
                                if (isInCart) {
                                    await dispatch(removeFromCart({ id: productId, isGuest: !user })).unwrap();
                                    showToast(`${product.name} removed from cart`, 'info');
                                } else {
                                    await dispatch(addToCart({ product: { ...product, id: productId }, qty: 1, isGuest: !user })).unwrap();
                                    showToast(`${product.name} added to cart`, 'success');
                                }
                            } catch (error) {
                                const errorMessage = error?.data?.message || error?.message || (typeof error === 'string' ? error : 'Action failed');
                                showToast(errorMessage, 'error');
                            } finally {
                                setLocalLoading(false);
                            }
                        }}
                        disabled={localLoading}
                        className={`px-6 py-2.5 text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)] font-bold ${isInCart ? 'bg-light text-dark hover:bg-light/90' : 'bg-primary text-dark hover:bg-light'}`}
                    >
                        {localLoading ? '...' : (isInCart ? 'Remove' : 'Add to Cart')}
                    </button>
                </div>

                {/* New Badge */}
                {product.isNewArrival && (
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-primary text-dark text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                            New
                        </span>
                    </div>
                )}


                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <button
                        onClick={async (e) => {
                            e.preventDefault();
                            if (!user) {
                                showToast('Please login to use wishlist', 'error');
                                navigate('/login');
                                return;
                            }
                            try {
                                if (isInWishlist) {
                                    await dispatch(removeFromWishlist(productId)).unwrap();
                                    showToast(`${product.name} removed from wishlist`, 'info');
                                } else {
                                    await dispatch(addToWishlist({ ...product, id: productId })).unwrap();
                                    showToast(`${product.name} added to wishlist`, 'success');
                                }
                            } catch (error) {
                                const errorMessage = error?.data?.message || error?.message || (typeof error === 'string' ? error : 'Action failed');
                                showToast(errorMessage, 'error');
                            }
                        }}
                        className={`w-9 h-9 flex items-center justify-center backdrop-blur-sm rounded-full transition-all border shadow-[0_0_15px_rgba(0,0,0,0.3)] ${isInWishlist ? 'bg-primary text-dark border-primary shadow-primary/30' : 'bg-dark/40 text-light/70 border-light/10 hover:text-primary hover:bg-dark/60'}`}
                    >
                        {isInWishlist ? <Icons.HeartFilled className="w-5 h-5 drop-shadow-sm" /> : <Icons.HeartFilled className="w-5 h-5 drop-shadow-sm" />}
                    </button>
                </div>
            </div>

            <div className="text-center space-y-2 px-2">
                <Link to={`/product/${productId}`} onClick={onNavigate}>
                    <h3 className="text-lg font-serif text-light/90 group-hover:text-primary transition-colors duration-300 tracking-wide">
                        <TextHighlight text={product.name} query={searchQuery} />
                    </h3>
                </Link>
                <div className="flex justify-center items-baseline gap-3">
                    <span className="text-primary font-medium tracking-wide">{product.displayPrice}</span>
                    {product.originalPrice && typeof product.originalPrice !== 'object' && (
                        <span className="text-light/30 text-xs line-through font-light">{product.originalPrice}</span>
                    )}
                </div>
                {/* Colors */}
                {Array.isArray(product.colors) && product.colors.length > 0 && (
                    <div className="flex justify-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {product.colors.filter(c => typeof c === 'string').map(c => (
                            <div key={c} className="w-2 h-2 rounded-full ring-1 ring-light/20" style={{ backgroundColor: c }}></div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
