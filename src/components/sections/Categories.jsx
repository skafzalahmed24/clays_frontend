import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icons from '../ui/Icons';
import { useGetAttributesQuery } from '../../store/api/attributeApiSlice';
import { getMediaUrl } from '../../utils/apiConfig';

const Categories = ({ title = "Collection list", showViewAll = true }) => {
    const { data: attributes, isLoading } = useGetAttributesQuery();
    const categories = attributes?.categories || [];
    const navigate = useNavigate();
    
    const [currentIndex, setCurrentIndex] = useState(0);

    const itemsToShow = 4;
    const totalSlides = Math.max(0, categories.length - itemsToShow + 1);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev >= totalSlides - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev <= 0 ? totalSlides - 1 : prev - 1));
    };

    if (isLoading) {
        return (
            <section className="py-16 bg-[#FAF5EF] flex justify-center items-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </section>
        );
    }

    if (categories.length === 0) return null;

    return (
        <section className="py-16 bg-[#FAF5EF]">
            <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 relative">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif text-primary tracking-wide">{title}</h2>
                </div>
                
                <div className="relative group">
                    {/* Navigation Arrows */}
                    <button 
                        onClick={prevSlide}
                        className="absolute left-[-2rem] top-[40%] -translate-y-1/2 z-10 p-2 text-primary opacity-70 hover:opacity-100 transition-opacity hidden md:block"
                    >
                        <Icons.ChevronLeft className="w-10 h-10" />
                    </button>
                    
                    <button 
                        onClick={nextSlide}
                        className="absolute right-[-2rem] top-[40%] -translate-y-1/2 z-10 p-2 text-primary opacity-70 hover:opacity-100 transition-opacity hidden md:block"
                    >
                        <Icons.ChevronRight className="w-10 h-10" />
                    </button>

                    {/* Slider Container */}
                    <div className="overflow-hidden">
                        <div 
                            className="flex transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}
                        >
                            {categories.map((cat) => (
                                <div 
                                    key={cat.id} 
                                    className="w-full min-w-[100%] md:min-w-[50%] lg:min-w-[25%] px-4"
                                >
                                    <div 
                                        className="cursor-pointer group/card flex flex-col items-center"
                                        onClick={() => navigate(`/category/${cat.name.toLowerCase()}`)}
                                    >
                                        {/* Vintage Frame Design */}
                                        <div className="relative p-3 bg-[#e2ccb8] border-2 border-[#d3ba9f] shadow-md w-full aspect-[4/5] flex items-center justify-center">
                                            {/* Left Film Strip Effect */}
                                            <div className="absolute left-1 top-4 bottom-4 w-1 flex flex-col justify-between">
                                                {[...Array(15)].map((_, i) => (
                                                    <div key={i} className="w-full h-[2px] bg-black/60"></div>
                                                ))}
                                                {/* Triangles/Arrows */}
                                                <div className="absolute top-1/3 -left-1 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px] border-r-black/60"></div>
                                                <div className="absolute bottom-1/3 -left-1 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px] border-r-black/60"></div>
                                            </div>

                                            {/* Right Film Strip Effect */}
                                            <div className="absolute right-1 top-4 bottom-4 w-1 flex flex-col justify-between">
                                                {[...Array(15)].map((_, i) => (
                                                    <div key={i} className="w-full h-[2px] bg-black/60"></div>
                                                ))}
                                                <div className="absolute top-1/3 -right-1 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-black/60"></div>
                                                <div className="absolute bottom-1/3 -right-1 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-black/60"></div>
                                            </div>

                                            {/* Inner Image */}
                                            <div className="w-full h-full border border-black/80 overflow-hidden relative">
                                                <img
                                                    src={getMediaUrl(cat.img)}
                                                    alt={cat.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=No+Image'; }}
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* Category Title */}
                                        <h3 className="mt-6 text-2xl font-serif text-primary tracking-wide">
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
                                className={`h-[2px] transition-all duration-300 ${
                                    currentIndex === idx 
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
                    <div className="mt-16 text-center">
                        <Link 
                            to="/collections" 
                            className="inline-block px-10 py-3 border border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 font-heading uppercase tracking-widest text-sm"
                        >
                            View More Categories
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Categories;
