import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icons from '../ui/Icons';
import { useGetAttributesQuery } from '../../store/api/attributeApiSlice';
import { getMediaUrl } from '../../utils/apiConfig';

const Categories = ({ title = "Shop By Categories", showViewAll = true }) => {
    const { data: attributes, isLoading } = useGetAttributesQuery();
    const categories = attributes?.categories || [];
    const navigate = useNavigate();
    const scrollContainerRef = useRef(null);

    const isFewItems = categories.length <= 4;

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
    };

    if (isLoading) {
        return (
            <section className="py-8 md:py-12 bg-body flex justify-center items-center min-h-[220px]">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </section>
        );
    }

    if (categories.length === 0) return null;

    return (
        <section className="py-8 md:py-12 bg-body relative overflow-hidden">
            <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 relative z-10">
                {/* Header with Title and Optional Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-black/10 pb-4">
                    <div>
                        <span className="text-primary text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium block mb-1">
                            Curated Collections
                        </span>
                        <h2 className="text-xl md:text-3xl font-serif text-dark font-normal tracking-wide uppercase">
                            {title}
                        </h2>
                        <div className="w-12 h-0.5 bg-primary mt-2"></div>
                    </div>

                    {!isFewItems && (
                        <div className="flex items-center gap-2 self-end md:self-auto">
                            <button
                                onClick={scrollLeft}
                                className="p-2 border border-black/15 text-dark hover:text-primary hover:border-primary transition-all rounded-full bg-white shadow-sm"
                                aria-label="Previous category"
                            >
                                <Icons.ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={scrollRight}
                                className="p-2 border border-black/15 text-dark hover:text-primary hover:border-primary transition-all rounded-full bg-white shadow-sm"
                                aria-label="Next category"
                            >
                                <Icons.ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                <style dangerouslySetInnerHTML={{__html: `
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}} />

                {/* Categories Layout: Centered & Balanced for 1-4 items, Smooth Carousel for >4 items */}
                {isFewItems ? (
                    <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 md:gap-16 lg:gap-20 py-4 max-w-5xl mx-auto">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className="cursor-pointer group flex flex-col items-center"
                                onClick={() => navigate(`/category/${encodeURIComponent(cat.name.toLowerCase())}`)}
                            >
                                {/* Premium Circular Card Frame with Gold Glow Accent */}
                                <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-56 lg:h-56 rounded-full p-1.5 border-2 border-primary/25 group-hover:border-primary transition-all duration-500 shadow-md group-hover:shadow-[0_10px_35px_rgba(212,175,55,0.25)] bg-white">
                                    <div className="w-full h-full rounded-full overflow-hidden relative bg-black/5">
                                        <img
                                            src={getMediaUrl(cat.img)}
                                            alt={cat.name}
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=No+Image'; }}
                                        />
                                        {/* Soft hover veil */}
                                        <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/15 transition-colors duration-300"></div>
                                    </div>
                                </div>

                                {/* Category Title */}
                                <h3 className="mt-4 text-xs sm:text-sm md:text-base font-heading font-bold text-dark tracking-[0.2em] uppercase transition-colors duration-300 group-hover:text-primary text-center">
                                    {cat.name}
                                </h3>
                                <span className="text-[10px] md:text-xs text-primary uppercase tracking-[0.25em] font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-1 group-hover:translate-y-0 mt-1">
                                    Explore Range →
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div 
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 -mx-6 md:mx-0 py-4 hide-scrollbar justify-start md:justify-center"
                    >
                        <div className="w-2 md:hidden flex-shrink-0"></div>
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className="snap-start flex-none w-[42vw] sm:w-[28vw] md:w-[22vw] lg:w-[16vw] max-w-[220px]"
                            >
                                <div
                                    className="cursor-pointer group flex flex-col items-center"
                                    onClick={() => navigate(`/category/${encodeURIComponent(cat.name.toLowerCase())}`)}
                                >
                                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full p-1.5 border-2 border-primary/25 group-hover:border-primary transition-all duration-500 shadow-md group-hover:shadow-[0_8px_30px_rgba(212,175,55,0.22)] bg-white">
                                        <div className="w-full h-full rounded-full overflow-hidden relative bg-black/5">
                                            <img
                                                src={getMediaUrl(cat.img)}
                                                alt={cat.name}
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=No+Image'; }}
                                            />
                                            <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/15 transition-colors duration-300"></div>
                                        </div>
                                    </div>

                                    <h3 className="mt-3 text-xs md:text-sm font-heading font-bold text-dark tracking-[0.18em] uppercase transition-colors duration-300 group-hover:text-primary text-center">
                                        {cat.name}
                                    </h3>
                                    <span className="text-[10px] text-primary uppercase tracking-[0.2em] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-0.5">
                                        View →
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div className="w-2 md:hidden flex-shrink-0"></div>
                    </div>
                )}

                {/* View More Button */}
                {showViewAll && (
                    <div className="mt-8 md:mt-10 text-center">
                        <Link
                            to="/categories"
                            className="inline-block px-8 md:px-12 py-3 bg-transparent border border-primary text-dark hover:bg-primary hover:text-white transition-all duration-300 font-heading font-semibold tracking-[0.2em] text-xs uppercase rounded-sm shadow-sm"
                        >
                            View All Categories
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Categories;
