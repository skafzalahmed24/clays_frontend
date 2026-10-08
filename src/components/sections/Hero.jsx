import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGetHeroSlidesQuery } from '../../store/api/contentApiSlice';
import { API_URL, BASE_URL, getMediaUrl } from '../../utils/apiConfig';
import { REGEX } from '../../utils/regex';

const Hero = () => {
    const { data: heroSlides, isLoading: loading } = useGetHeroSlidesQuery();
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => { // Updated line numbers might differ slightly in reality
        if (!heroSlides || heroSlides.length === 0) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroSlides]);

    if (loading) return (
        <div className="w-full aspect-[16/9] sm:aspect-[16/8.5] md:aspect-[16/7.5] lg:aspect-[1920/820] xl:aspect-[1920/800] bg-body flex items-center justify-center text-primary">
            Loading...
        </div>
    );

    if (!heroSlides || !Array.isArray(heroSlides) || heroSlides.length === 0) {
        return (
            <section className="relative w-full aspect-[16/9] sm:aspect-[16/8.5] md:aspect-[16/7.5] lg:aspect-[1920/820] xl:aspect-[1920/800] flex items-center justify-center overflow-hidden bg-body">
                <div className="text-center px-4">
                    <h1 className="text-2xl sm:text-4xl text-primary font-heading">Welcome to Clarysays</h1>
                </div>
            </section>
        );
    }

    const currentSlideData = heroSlides[currentSlide] || heroSlides[0];
    const hasTitle = Boolean(currentSlideData?.title && currentSlideData.title.trim() !== '');
    const hasSubtitle = Boolean(currentSlideData?.subtitle && currentSlideData.subtitle.trim() !== '');

    return (
        <section className="relative w-full aspect-[16/9] sm:aspect-[16/8.5] md:aspect-[16/7.5] lg:aspect-[1920/820] xl:aspect-[1920/800] flex items-center justify-center overflow-hidden bg-[#0d0d0d]">
            {heroSlides.map((slide, index) => (
                <div
                    key={slide._id || index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                >
                    {/* Full slide clickable link */}
                    <Link
                        to={slide.link || "/shop"}
                        className="absolute inset-0 z-10 block cursor-pointer"
                        aria-label={slide.title || 'Shop Collection'}
                    />

                    {/* Media element: Video or Responsive Picture */}
                    {REGEX.IS_VIDEO.test(slide.media) ? (
                        <video
                            src={getMediaUrl(slide.media)}
                            className="w-full h-full object-cover object-top"
                            autoPlay
                            muted
                            loop
                            playsInline
                        />
                    ) : (
                        <picture className="w-full h-full block">
                            {slide.mobileMedia && (
                                <source media="(max-width: 767px)" srcSet={getMediaUrl(slide.mobileMedia)} />
                            )}
                            <source media="(min-width: 768px)" srcSet={getMediaUrl(slide.media)} />
                            <img
                                src={getMediaUrl(slide.media)}
                                alt={slide.title || 'Hero Banner'}
                                className="w-full h-full object-cover object-top md:object-[center_top]"
                                loading={index === 0 ? "eager" : "lazy"}
                            />
                        </picture>
                    )}
                </div>
            ))}

            {/* Optional text overlay if title/subtitle are configured in admin */}
            {(hasTitle || hasSubtitle) && (
                <div className="relative z-20 w-full px-4 sm:px-8 md:px-14 lg:px-20 pointer-events-none">
                    <div className="max-w-xl lg:max-w-2xl">
                        <div className="flex flex-col justify-center">
                            {heroSlides.map((slide, index) => (
                                index === currentSlide && (
                                    <div key={slide._id || index} className="animate-fade-in-up">
                                        {hasTitle && (
                                            <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-primary mb-1.5 sm:mb-3 md:mb-5 leading-tight drop-shadow-lg">
                                                {slide.title}
                                            </h1>
                                        )}
                                        {hasSubtitle && (
                                            <p className="text-xs sm:text-base md:text-xl text-text-main/90 mb-3 sm:mb-6 max-w-lg font-light drop-shadow line-clamp-2 sm:line-clamp-none">
                                                {slide.subtitle}
                                            </p>
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Carousel Indicators (Dots) */}
            {heroSlides.length > 1 && (
                <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-1.5 sm:space-x-2.5 z-30 pointer-events-auto">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                                index === currentSlide
                                    ? 'bg-primary w-5 sm:w-8'
                                    : 'bg-primary/40 hover:bg-primary w-1.5 sm:w-2'
                            }`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default Hero;
