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

    if (isLoading) {
        return (
            <section className="py-6 md:py-8 bg-body flex justify-center items-center min-h-[200px]">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </section>
        );
    }

    if (categories.length === 0) return null;

    return (
        <section className="py-6 md:py-8 bg-body relative overflow-hidden">
            <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4 border-b border-black/10 pb-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-heading text-dark font-bold tracking-widest uppercase">{title}</h2>
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
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{__html: `
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}} />
                <div 
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-6 md:mx-0 py-4 hide-scrollbar"
                >
                    <div className="w-2 md:hidden flex-shrink-0"></div>
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className="snap-start flex-none w-[45vw] sm:w-[30vw] md:w-[22vw] lg:w-[15vw] max-w-[200px]"
                        >
                            <div
                                className="cursor-pointer group flex flex-col items-center"
                                onClick={() => navigate(`/category/${cat.name.toLowerCase()}`)}
                            >
                                {/* Premium Compact Circle Design */}
                                <div className="w-32 h-32 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-full overflow-hidden mb-6 shadow-md border-2 border-transparent group-hover:border-primary transition-all duration-300 relative">
                                    <img
                                        src={getMediaUrl(cat.img)}
                                        alt={cat.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=No+Image'; }}
                                    />
                                    {/* Soft dark overlay on hover */}
                                    <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/10 transition-colors duration-300"></div>
                                </div>

                                {/* Category Title */}
                                <h3 className="text-xs md:text-sm font-heading font-bold text-dark tracking-widest uppercase transition-colors duration-300 group-hover:text-primary text-center">
                                    {cat.name}
                                </h3>
                            </div>
                        </div>
                    ))}
                    <div className="w-2 md:hidden flex-shrink-0"></div>
                </div>

                {/* View More Button */}
                {showViewAll && (
                    <div className="mt-12 text-center">
                        <Link
                            to="/collections"
                            className="inline-block px-10 py-3 bg-transparent border border-primary text-dark hover:bg-primary hover:text-white transition-all duration-300 font-heading font-medium tracking-widest text-xs uppercase"
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
