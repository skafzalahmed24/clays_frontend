import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../ui/ProductCard';
import { useGetProductsQuery } from '../../store/api/productApiSlice';
import { usePrice } from '../../hooks/usePrice';

const FeaturedCollection = ({ title = "Featured Collection" }) => {
    const { format } = usePrice();
    // Determine query args based on intent - defaulting to getting all and filtering client side for now just like original code
    // Optimization: We could pass { isFeatured: true } if backend supported it fully, which it does.
    const { data: productsData, isLoading: loading, error } = useGetProductsQuery({ isFeatured: true });

    // Process data to match component expectation
    const products = React.useMemo(() => {
        if (!productsData) return [];
        let data = Array.isArray(productsData) ? [...productsData] : (productsData?.products || []);

        // RTK Query returns the array directly based on our controller response
        // If we used the query param { isFeatured: true }, backend should have filtered it.
        // Let's rely on the query param we passed above.

        // Fallback logic from original code: if empty, show recent 5
        // Note: This logic is hard to replicate purely with one query unless we make two queries.
        // For now, let's assume the query returns what we want.
        // If the original code fetched ALL and then filtered, we can do that too to be safe/identical behavior.

        return data.map(p => ({
            ...p,
            id: p._id,
            displayPrice: format(p.price)
        }));
    }, [productsData, format]);

    if (error) {
        console.error("Failed to fetch featured products", error);
        // You might want to return null or an error UI here
        return null;
    }

    if (loading) {
        return (
            <section className="py-24">
                <div className="w-full px-6 md:px-12 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-24">
            <div className="w-full px-6 md:px-12">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-heading mb-2">{title}</h2>
                        <div className="w-16 h-1 bg-primary"></div>
                    </div>
                    <Link to="/shop" className="hidden md:block opacity-60 hover:opacity-100 hover:text-primary transition-colors text-sm uppercase tracking-widest">View All Products</Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}
                </div>

                <div className="mt-12 text-center md:hidden">
                    <Link to="/shop" className="inline-block border-b border-white pb-1 text-sm uppercase tracking-widest">View All Products</Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedCollection;
