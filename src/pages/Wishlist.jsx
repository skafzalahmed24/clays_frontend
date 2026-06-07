import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import Icons from '../components/ui/Icons';
import ProductCard from '../components/ui/ProductCard';
import EmptyState from '../components/ui/EmptyState';
import { useSelector } from 'react-redux';
import client from '../api/client';
import SEO from '../components/common/SEO';

const Wishlist = () => {
    const { items: wishlistItems } = useSelector(state => state.wishlist);
    const [pageData, setPageData] = useState(null);

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                const { data } = await client.get('/content/pages/wishlist');
                setPageData(data.data);
            } catch (error) {
                console.error("Failed to fetch wishlist page data", error);
            }
        };
        fetchPageData();
    }, []);

    const header = pageData?.modules?.header || {
        title: "My Wishlist",
        eyebrow: "Favorite Items",
        subtitle: "Items you've saved for later."
    };

    return (
        <div className="bg-body min-h-screen text-text-main">
            <SEO
                title={pageData?.seo?.title || "My Wishlist"}
                description={pageData?.seo?.description}
            />
            <PageHeader
                title={header.title}
                eyebrow={header.eyebrow}
                subtitle={header.subtitle}
                backgroundImage={header.bannerImage}
            />

            <div className="w-full px-6 md:px-12 py-16">
                {(Array.isArray(wishlistItems) ? wishlistItems : []).length === 0 ? (
                    <EmptyState
                        icon={Icons.Heart}
                        title="Your wishlist is empty"
                        message="Your personal collection of favorites is waiting to be started."
                        actionLabel="Discover Collection"
                        actionLink="/shop"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
                        {(() => {
                            // Extract format hook inside the component function scope if possible, 
                            // or we can map them directly here since we usually have format logic
                            const formatPrice = (price) => {
                                return new Intl.NumberFormat('en-IN', {
                                    style: 'currency',
                                    currency: 'INR',
                                    maximumFractionDigits: 0,
                                }).format(price);
                            };
                            return (Array.isArray(wishlistItems) ? wishlistItems : []).map((product) => {
                                const formattedProduct = {
                                    ...product,
                                    displayPrice: formatPrice(product.price),
                                    originalPrice: product.originalPrice ? formatPrice(product.originalPrice) : null
                                };
                                return (
                                    <ProductCard
                                        key={product._id || product.id}
                                        product={formattedProduct}
                                    />
                                );
                            });
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
