import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGetProductsQuery } from '../../store/api/productApiSlice';
import ProductCard from '../ui/ProductCard';
import Icons from '../ui/Icons';
import { usePrice } from '../../hooks/usePrice';

const NewArrivals = () => {
    const { data, isLoading } = useGetProductsQuery({ isNewArrival: true, limit: 10 });
    const { format } = usePrice();
    const scrollContainerRef = useRef(null);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    if (isLoading) return null;
    
    const products = data?.products || [];
    if (products.length === 0) return null;

    const formattedProducts = products.map(p => ({
        ...p,
        displayPrice: format(p.price),
        originalPrice: p.originalPrice ? format(p.originalPrice) : null
    }));

    return (
        <section className="py-6 md:py-8 bg-body relative overflow-hidden">
            <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4 border-b border-black/10 pb-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-heading text-dark font-bold tracking-widest uppercase">New Arrivals</h2>
                        <div className="w-12 h-1 bg-primary mt-2"></div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <button onClick={scrollLeft} className="p-1 border border-black/10 text-black/30 hover:text-primary hover:border-primary/50 transition-colors rounded-sm" aria-label="Previous">
                                <Icons.ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={scrollRight} className="p-1 border border-black/10 text-black/30 hover:text-primary hover:border-primary/50 transition-colors rounded-sm" aria-label="Next">
                                <Icons.ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <Link 
                            to="/shop?new=true" 
                            className="text-[10px] font-bold uppercase tracking-[0.2em] border border-primary px-4 py-2 hover:bg-primary hover:text-dark transition-colors inline-block"
                        >
                            View All
                        </Link>
                    </div>
                </div>

                <div 
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-6 px-6 md:mx-0 md:px-0" 
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <style dangerouslySetInnerHTML={{__html: `
                        .hide-scrollbar::-webkit-scrollbar { display: none; }
                        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `}} />
                    <div className="flex gap-4 w-max hide-scrollbar">
                        {formattedProducts.map(product => (
                            <div key={product._id || product.id} className="snap-start flex-none w-[70vw] sm:w-[40vw] md:w-[25vw] lg:w-[18vw] max-w-[280px]">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewArrivals;
