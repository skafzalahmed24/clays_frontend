import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../context/ToastContext';
import { addToCart, removeFromCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { useGetSettingsQuery } from '../store/api/contentApiSlice';
import { useGetProductsQuery, useGetProductDetailsQuery, useCreateReviewMutation, useUpdateReviewMutation } from '../store/api/productApiSlice';
import { useCreateRequestMutation } from '../store/api/requestApiSlice';
import { getImageUrl } from '../utils/imageHelper';
import { usePrice } from '../hooks/usePrice';
import SEO from '../components/common/SEO';
import Icons from '../components/ui/Icons';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import PageHeader from '../components/layout/PageHeader';
import ProductCard from '../components/ui/ProductCard';
import Skeleton from '../components/ui/Skeleton';

const ProductDetails = () => {
    const { id: productId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { showToast } = useToast();
    const { format } = usePrice();

    // Redux State
    const { user } = useSelector(state => state.auth);
    const { cartItems } = useSelector(state => state.cart);
    const { items: wishlist } = useSelector(state => state.wishlist);

    // RTK Query
    // Fetch product details
    const { data: product, isLoading, refetch } = useGetProductDetailsQuery(productId);

    // Fetch related products (skip if product not loaded yet)
    const { data: relatedData } = useGetProductsQuery(
        product ? { category: product.category, limit: 5 } : { skip: true }, // Request 5 to filter out self and keep 4
        { skip: !product }
    );

    const { data: settings } = useGetSettingsQuery();
    const [createReview, { isLoading: loadingProductReview }] = useCreateReviewMutation();
    const [updateReview, { isLoading: loadingUpdateReview }] = useUpdateReviewMutation();
    const [createRequest, { isLoading: loadingRequest }] = useCreateRequestMutation();

    // Local State
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState('');
    const [activeTab, setActiveTab] = useState('Product Details');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isEditingReview, setIsEditingReview] = useState(false);

    // Request Modal State
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestEmail, setRequestEmail] = useState('');

    // Effect: Set initial image, email, and review data
    useEffect(() => {
        if (product) {
            setSelectedImage(getImageUrl(product.img));
            if (user) {
                setRequestEmail(user.email);
            }
            if (product.userReview) {
                setRating(product.userReview.rating);
                setComment(product.userReview.comment);
            }
        }
    }, [product, user]);

    // Effect: Process Related Products
    const relatedProducts = useMemo(() => {
        if (relatedData && product) {
            const productsList = Array.isArray(relatedData) ? relatedData : (relatedData.products || []);
            return productsList
                .filter(p => p._id !== product._id)
                .slice(0, 4)
                .map(p => ({
                    ...p,
                    id: p._id,
                    displayPrice: format(p.price)
                }));
        }
        return [];
    }, [relatedData, product, format]);

    // Handlers
    const isInWishlist = useMemo(() => {
        return wishlist?.some(item => item.id === productId || item.product === productId || item._id === productId);
    }, [wishlist, productId]);

    const isInCart = useMemo(() => {
        return cartItems
            ? cartItems.some(item => item.id === productId || item.product === productId || item._id === productId || (item.product && item.product._id === productId))
            : (typeof product?.isInCart === 'boolean' ? product.isInCart : false);
    }, [cartItems, productId, product]);

    const [isCartActionLoading, setIsCartActionLoading] = useState(false);

    const handleCartAction = async () => {
        if (!user) {
            showToast('Please login to add items to cart', 'error');
            navigate('/login');
            return;
        }
        setIsCartActionLoading(true);
        try {
            if (isInCart) {
                await dispatch(removeFromCart({ id: product._id, isGuest: !user })).unwrap();
                showToast(`${product.name} removed from cart`, 'info');
            } else {
                await dispatch(addToCart({ product, qty: quantity, isGuest: !user })).unwrap();
                showToast(`${product.name} added to cart`, 'success');
            }
            // Refetch product details to get updated isInCart/cartQty from server (double check)
            refetch();
        } catch (error) {
            showToast(error || 'Action failed', 'error');
        } finally {
            setIsCartActionLoading(false);
        }
    };

    const toggleWishlist = async () => {
        if (!user) {
            showToast('Please login to use wishlist', 'error');
            navigate('/login');
            return;
        }
        try {
            if (isInWishlist) {
                await dispatch(removeFromWishlist(product._id)).unwrap();
                showToast(`${product.name} removed from wishlist`, 'info');
            } else {
                await dispatch(addToWishlist(product)).unwrap();
                showToast(`${product.name} added to wishlist`, 'success');
            }
            refetch();
        } catch (error) {
            const errorMessage = error?.data?.message || error?.message || (typeof error === 'string' ? error : 'Action failed');
            showToast(errorMessage, 'error');
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!rating || !comment) {
            showToast('Please provide a rating and comment', 'error');
            return;
        }

        try {
            if (isEditingReview) {
                await updateReview({
                    productId,
                    rating,
                    comment,
                }).unwrap();
                showToast('Review updated successfully', 'success');
                setIsEditingReview(false);
            } else {
                await createReview({
                    productId,
                    rating,
                    comment,
                }).unwrap();
                showToast('Review submitted successfully', 'success');
            }
            // Refetch to update list and userReview state
            refetch();
        } catch (error) {
            showToast(error?.data?.message || 'Failed to submit review', 'error');
        }
    };

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        try {
            await createRequest({
                productId: product._id,
                productName: product.name,
                productImg: product.img,
                userEmail: requestEmail
            }).unwrap();
            showToast('Request submitted successfully!', 'success');
            setIsRequestModalOpen(false);
        } catch (err) {
            showToast(err?.data?.message || 'Failed to submit request', 'error');
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-body pt-32 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                    <Skeleton className="w-full h-[600px]" />
                </div>
                <div className="space-y-8">
                    <Skeleton className="w-3/4 h-12" />
                    <Skeleton className="w-1/4 h-8" />
                    <Skeleton className="w-full h-32" />
                </div>
            </div>
        </div>
    );

    if (!product) return <div className="min-h-screen pt-32 text-center text-light">Product not found</div>;

    const productImages = product.images && product.images.length > 0
        ? product.images.map(getImageUrl)
        : [getImageUrl(product.img)];

    return (
        <div className="min-h-screen bg-body text-text-main pt-[80px]">
            <SEO
                title={product.name}
                description={product.description ? product.description.substring(0, 150) : 'Luxury Jewelry from Clarysays'}
                image={getImageUrl(product.img)}
                url={window.location.href}
            />

            <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-12">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
                    {/* Left: Image Gallery */}
                    <div className="lg:w-1/2 space-y-6">
                        <div className="aspect-[4/5] bg-light/5 w-full relative overflow-hidden rounded-sm group">
                            <img
                                src={selectedImage || getImageUrl(product.img)}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                        {/* Thumbnails */}
                        {productImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {productImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`w-24 h-24 flex-shrink-0 border ${selectedImage === img ? 'border-primary' : 'border-light/10'} hover:border-light/30 transition-colors`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="lg:w-1/2 flex flex-col">
                        <div className="flex justify-between items-start">
                            <span className="text-primary text-sm tracking-widest uppercase mb-4">{product.category} / {product.subCategory}</span>
                            {product.isNewArrival && (
                                <span className="bg-primary text-dark text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                                    New Arrival
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif text-black mb-6 leading-tight">{product.name}</h1>

                        <div className="flex items-center gap-4 mb-8">
                            <span className="text-3xl font-light text-primary">{format(product.price)}</span>
                            {product.originalPrice && (
                                <span className="text-xl text-light/30 line-through font-light">{format(product.originalPrice)}</span>
                            )}
                        </div>

                        {/* Rating Summary */}
                        <div className="flex items-center gap-2 mb-8">
                            <div className="flex text-primary text-sm">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < Math.round(product.rating || 0) ? "text-primary" : "text-light/20"}>★</span>
                                ))}
                            </div>
                            <span className="text-light/40 text-sm">({product.rating || 0}/5 based on {product.numReviews || 0} reviews)</span>
                        </div>

                        <p className="text-light/70 leading-relaxed mb-8 max-w-xl">
                            {product.description || `Experience the epitome of luxury with our ${product.name}. Meticulously crafted to perfection.`}
                        </p>

                        <div className="h-px bg-light/10 w-full mb-8"></div>

                        {/* Actions */}
                        <div className="space-y-6 mb-12">
                            {product.stock > 0 ? (
                                <div className="flex items-center gap-3 md:gap-6">
                                    <div className="flex items-center border border-light/20 h-12">
                                        <button
                                            className="w-10 h-full flex items-center justify-center text-light/50 hover:text-light transition-colors"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={isInCart}
                                        >-</button>
                                        <span className="w-10 text-center font-medium">{isInCart ? ((cartItems || []).find(i => i.id === product._id || i.product === product._id || (i.product && i.product._id === productId))?.qty || (typeof product.cartQty === 'number' ? product.cartQty : quantity)) : quantity}</span>
                                        <button
                                            className="w-10 h-full flex items-center justify-center text-light/50 hover:text-light transition-colors"
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            disabled={isInCart}
                                        >+</button>
                                    </div>
                                    <button
                                        onClick={handleCartAction}
                                        className={`flex-1 h-12 flex items-center justify-center uppercase tracking-[0.2em] text-sm font-bold transition-colors whitespace-nowrap ${isInCart ? 'bg-light text-dark hover:bg-light/90' : 'bg-primary text-dark hover:bg-light'}`}
                                        disabled={isCartActionLoading}
                                    >
                                        {isCartActionLoading ? 'Processing...' : (isInCart ? 'Remove' : 'Add to Cart')}
                                    </button>
                                    <button
                                        onClick={toggleWishlist}
                                        className={`w-12 h-12 flex-shrink-0 flex items-center justify-center border transition-colors ${isInWishlist ? 'border-primary bg-primary/10 text-primary' : 'border-light/20 text-light/50 hover:text-primary hover:border-primary'}`}
                                    >
                                        <Icons.HeartFilled className="w-5 h-5 drop-shadow-sm" />
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-sm text-red-200 text-sm flex items-center gap-2">
                                        <Icons.Close className="w-4 h-4 text-red-400" />
                                        Out of Stock
                                    </div>
                                    <div className="flex items-center gap-3 md:gap-6">
                                        <button
                                            onClick={() => setIsRequestModalOpen(true)}
                                            className="flex-1 h-12 flex items-center justify-center uppercase tracking-[0.2em] text-sm font-bold bg-white/10 text-light hover:bg-white/20 transition-colors border border-white/10 whitespace-nowrap"
                                        >
                                            Request Stock
                                        </button>
                                        <button
                                            onClick={toggleWishlist}
                                            className={`w-12 h-12 flex-shrink-0 flex items-center justify-center border transition-colors ${isInWishlist ? 'border-primary bg-primary/10 text-primary' : 'border-light/20 text-light/50 hover:text-primary hover:border-primary'}`}
                                        >
                                            <Icons.HeartFilled className="w-5 h-5 drop-shadow-sm" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Accordions */}
                        <div className="space-y-0 border-t border-light/10">
                            {['Product Details', 'Shipping & Returns', 'Care Instructions'].map((section) => (
                                <div key={section} className="border-b border-light/10">
                                    <button
                                        className="w-full flex justify-between items-center py-5 group"
                                        onClick={() => setActiveTab(activeTab === section ? null : section)}
                                    >
                                        <span className="text-sm uppercase tracking-widest text-light/80 group-hover:text-primary transition-colors">{section}</span>
                                        <span className="text-light/50">{activeTab === section ? '−' : '+'}</span>
                                    </button>
                                    <div className={`overflow-hidden transition-all duration-300 ${activeTab === section ? 'max-h-96 pb-6' : 'max-h-0'}`}>
                                        <div className="text-light/60 text-sm leading-loose">
                                            {section === 'Product Details' && (
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {/* <li>SKU: {product.sku || 'N/A'}</li> */}
                                                    <li>Collection: {product.collection || 'Luxury'}</li>
                                                    <li>Material: {product.attributes?.material || product.material || 'N/A'}</li>
                                                    <li>Color: {product.attributes?.color || product.color || 'N/A'}</li>
                                                    {product.attributes?.gemType && <li>Gem Type: {product.attributes.gemType}</li>}
                                                    {product.attributes?.size && <li>Size: {product.attributes.size}</li>}
                                                    {product.weight && <li>Weight: {product.weight}g</li>}
                                                    {product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height) && (
                                                        <li>Dimensions: {product.dimensions.length || 0}x{product.dimensions.width || 0}x{product.dimensions.height || 0} mm</li>
                                                    )}
                                                </ul>
                                            )}
                                            {section === 'Shipping & Returns' && (settings?.productPolicies?.shipping || `Free shipping on orders above ${format(50000)}. Easy 7-day returns for unworn items with original tags.`)}
                                            {section === 'Care Instructions' && (settings?.productPolicies?.care || "Keep away from perfumes and sprays. Store in the provided luxury box when not in use.")}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="py-24 border-t border-light/10 mt-24">
                    <h2 className="text-3xl font-serif text-black mb-12 text-center">{settings?.uiLabels?.product?.reviewsTitle || 'Customer Reviews'}</h2>

                    <div className="max-w-4xl mx-auto">
                        {/* Review List */}
                        {product.reviews.length === 0 && <div className="text-center text-light/50 mb-8">No reviews yet</div>}
                        <div className="grid md:grid-cols-2 gap-8 mb-12">
                            {product.reviews.map(review => (
                                <div key={review._id} className="bg-light/5 p-8 border border-light/5">
                                    <div className="flex justify-between mb-4">
                                        <div className="flex text-primary text-xs">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={i < review.rating ? "text-primary" : "text-light/20"}>★</span>
                                            ))}
                                        </div>
                                        <span className="text-xs text-light/30">{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    <h4 className="font-serif text-lg mb-2 text-light/90">{review.comment}</h4>
                                    <p className="text-sm font-medium text-light/50 mt-4">— {review.name}</p>
                                </div>
                            ))}
                        </div>

                        {/* Leave/Edit a Review */}
                        <div className="bg-dark-paper border border-white/5 p-8 max-w-xl mx-auto rounded-sm">
                            <h3 className="text-xl font-heading text-light mb-6">
                                {product.userReview && !isEditingReview ? 'Your Review' :
                                    product.userReview && isEditingReview ? 'Update Your Review' :
                                        'Write a Customer Review'}
                            </h3>

                            {!user ? (
                                <div className="text-center py-4 bg-white/5 text-light/70 text-sm">
                                    Please <Link to="/login" className="text-primary hover:underline">sign in</Link> to write a review.
                                </div>
                            ) : !product.hasPurchased && !product.userReview ? (
                                <div className="text-center py-4 bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                                    You must purchase and receive this item to leave a review.
                                </div>
                            ) : product.userReview && !isEditingReview ? (
                                // Display Existing Review (Read-Only)
                                <div className="bg-white/5 p-6 rounded-sm border border-white/10 relative group">
                                    <button
                                        onClick={() => setIsEditingReview(true)}
                                        className="absolute top-4 right-4 text-light/40 hover:text-primary transition-colors"
                                        title="Edit Review"
                                    >
                                        <Icons.Edit className="w-5 h-5" />
                                    </button>
                                    <div className="flex text-primary text-sm mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={i < product.userReview.rating ? "text-primary" : "text-light/20"}>★</span>
                                        ))}
                                    </div>
                                    <p className="text-light/80 italic">"{product.userReview.comment}"</p>
                                </div>
                            ) : (
                                // Review Form (Create or Edit)
                                <form onSubmit={handleReviewSubmit}>
                                    <div className="mb-4">
                                        <label className="block text-xs uppercase tracking-wider text-light/50 mb-2">Rating</label>
                                        <Select
                                            value={rating}
                                            onChange={(e) => setRating(parseInt(e.target.value))}
                                            options={[
                                                { value: '1', label: '1 - Poor' },
                                                { value: '2', label: '2 - Fair' },
                                                { value: '3', label: '3 - Good' },
                                                { value: '4', label: '4 - Very Good' },
                                                { value: '5', label: '5 - Excellent' }
                                            ]}
                                            placeholder="Select..."
                                            className="w-full bg-body border border-light/10 p-3 text-light focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-xs uppercase tracking-wider text-light/50 mb-2">Comment</label>
                                        <Textarea
                                            rows="3"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            className="w-full bg-body border border-light/10 p-3 text-light focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        {isEditingReview && (
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingReview(false)}
                                                className="flex-1 py-3 border border-light/20 text-light font-bold uppercase tracking-wider text-sm hover:bg-white/5 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={loadingProductReview || loadingUpdateReview}
                                            className="flex-1 py-3 bg-primary text-dark font-bold uppercase tracking-wider text-sm hover:bg-white transition-colors"
                                        >
                                            {loadingProductReview || loadingUpdateReview ? 'Submitting...' : (isEditingReview ? 'Update Review' : 'Submit Review')}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="py-12 border-t border-light/10">
                        <div className="flex justify-between items-end mb-12">
                            <h2 className="text-3xl font-serif text-light">{settings?.uiLabels?.product?.relatedTitle || 'You May Also Like'}</h2>
                            <Link to="/shop" className="text-primary text-sm uppercase tracking-widest hover:text-light transition-colors">View All</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedProducts.map(p => (
                                <ProductCard
                                    key={p.id}
                                    product={p}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Request Stock Modal */}
            {isRequestModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsRequestModalOpen(false)}></div>
                    <div className="bg-dark-paper border border-light/10 p-8 w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-300 rounded-sm">
                        <button
                            onClick={() => setIsRequestModalOpen(false)}
                            className="absolute top-4 right-4 text-light/50 hover:text-light"
                        >
                            ✕
                        </button>
                        <h3 className="text-2xl font-serif text-light mb-2">Request Stock</h3>
                        <p className="text-light/60 text-sm mb-6">
                            We'll notify you when this item is back in stock.
                        </p>
                        <form onSubmit={handleRequestSubmit}>
                            <div className="mb-6">
                                <label className="block text-xs uppercase tracking-wider text-light/50 mb-2">Email Address</label>
                                <Input
                                    type="email"
                                    value={requestEmail}
                                    onChange={(e) => setRequestEmail(e.target.value)}
                                    required
                                    className="bg-body"
                                    placeholder="Enter your email"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loadingRequest}
                                className="w-full py-3 bg-primary text-dark font-bold uppercase tracking-wider text-sm hover:bg-white transition-colors"
                            >
                                {loadingRequest ? 'Submitting...' : 'Notify Me'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
