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
                {/* Header with Title and View All side-by-side */}
                <div className="flex justify-between items-end mb-6 gap-4 border-b border-black/10 pb-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-heading text-dark font-bold tracking-widest uppercase">New Arrivals</h2>
                        <div className="w-12 h-1 bg-primary mt-2"></div>
                    </div>
                    <Link 
                        to="/shop?new=true" 
                        className="text-[10px] font-bold uppercase tracking-[0.2em] border border-primary px-3 sm:px-4 py-2 hover:bg-primary hover:text-dark transition-colors inline-block whitespace-nowrap"
                    >
                        View All
                    </Link>
                </div>

                <style dangerouslySetInnerHTML={{__html: `
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}} />
                <div 
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-6 md:mx-0 hide-scrollbar" 
                >
                    <div className="w-2 md:hidden flex-shrink-0"></div>
                    {formattedProducts.map(product => (
                        <div key={product._id || product.id} className="snap-start flex-none w-[60vw] sm:w-[40vw] md:w-[25vw] lg:w-[18vw] max-w-[280px]">
                            <ProductCard product={product} />
                        </div>
                    ))}
                    <div className="w-2 md:hidden flex-shrink-0"></div>
                </div>

                {/* Navigation Arrows below products */}
                <div className="flex justify-center items-center gap-3 mt-4 md:mt-6">
                    <button 
                        onClick={scrollLeft} 
                        className="p-2 border border-black/15 text-dark hover:text-primary hover:border-primary transition-all rounded-full bg-white shadow-sm hover:shadow-md" 
                        aria-label="Previous"
                    >
                        <Icons.ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={scrollRight} 
                        className="p-2 border border-black/15 text-dark hover:text-primary hover:border-primary transition-all rounded-full bg-white shadow-sm hover:shadow-md" 
                        aria-label="Next"
                    >
                        <Icons.ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default NewArrivals;
