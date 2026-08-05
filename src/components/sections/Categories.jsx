import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icons from '../ui/Icons';
import { useGetAttributesQuery } from '../../store/api/attributeApiSlice';
import { getMediaUrl } from '../../utils/apiConfig';

const Categories = ({ title = "Shop By Categories", showViewAll = true }) => {
    const { data: attributes, isLoading } = useGetAttributesQuery();
    const categories = attributes?.categories || [];
    const navigate = useNavigate();

    const [currentIndex, setCurrentIndex] = useState(0);

    // Make it more compact by showing more items on large screens
    const itemsToShow = 6;
    const totalSlides = Math.max(0, categories.length - itemsToShow + 1);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev >= totalSlides - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev <= 0 ? totalSlides - 1 : prev - 1));
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
        <section className="py-6 md:py-8 bg-body">
            <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 relative">
                <div className="flex flex-col items-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark tracking-widest uppercase mb-4">{title}</h2>
                    <div className="w-16 h-1 bg-primary"></div>
                </div>

                <div className="relative group">
                    {/* Navigation Arrows */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-[-1rem] md:left-[-2rem] top-[40%] -translate-y-1/2 z-10 p-2 bg-white/50 text-dark rounded-full shadow-md opacity-70 hover:opacity-100 hover:bg-white transition-all hidden md:block"
                    >
                        <Icons.ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={nextSlide}
                        className="absolute right-[-1rem] md:right-[-2rem] top-[40%] -translate-y-1/2 z-10 p-2 bg-white/50 text-dark rounded-full shadow-md opacity-70 hover:opacity-100 hover:bg-white transition-all hidden md:block"
                    >
                        <Icons.ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Slider Container */}
                    <div className="overflow-hidden py-4">
                        <div
                            className="flex transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}
                        >
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="w-full min-w-[50%] md:min-w-[33.333%] lg:min-w-[16.666%] px-2 md:px-4"
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
                        </div>
                    </div>
                </div>

                {/* Pagination Dashes */}
                {totalSlides > 1 && (
                    <div className="flex justify-center mt-10 gap-2">
                        {[...Array(totalSlides)].map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-[2px] transition-all duration-300 ${currentIndex === idx
                                        ? 'w-8 bg-primary'
                                        : 'w-4 bg-primary/40 hover:bg-primary/80'
                                    }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}

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
