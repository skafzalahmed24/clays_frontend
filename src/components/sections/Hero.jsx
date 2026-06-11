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

    if (loading) return <div className="h-[380px] md:h-[500px] bg-body flex items-center justify-center text-primary">Loading...</div>;

    if (!heroSlides || !Array.isArray(heroSlides) || heroSlides.length === 0) {
        return (
            <section className="relative h-[380px] md:h-[500px] flex items-center justify-center overflow-hidden bg-body">
                <div className="text-center">
                    <h1 className="text-4xl text-primary font-heading">Welcome to Clarysays</h1>
                </div>
            </section>
        )
    }

    return (
        <section className="relative h-[380px] md:h-[500px] flex items-center justify-center overflow-hidden bg-body">
            {heroSlides.map((slide, index) => (
                <div
                    key={slide._id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                >
                    {/* Updated to support video slides */}
                    {REGEX.IS_VIDEO.test(slide.media) ? (
                        <video
                            src={getMediaUrl(slide.media)}
                            className="w-full h-full object-cover opacity-60"
                            autoPlay
                            muted
                            loop
                            playsInline
                        />
                    ) : (
                        <img src={getMediaUrl(slide.media)} alt={slide.title} className="w-full h-full object-cover opacity-60" />
                    )}
                    <div className="absolute inset-0 hero-gradient-overlay"></div>
                </div>
            ))}

            {/* Content */}
            <div className="relative z-10 w-full px-6 md:px-12 mt-8">
                <div className="lg:w-2/3">
                    <div className="min-h-[180px] flex flex-col justify-center">
                        {heroSlides.map((slide, index) => (
                            index === currentSlide && (
                                <div key={slide._id} className="animate-fade-in-up">
                                    <h1 className="text-5xl md:text-7xl font-heading font-bold text-primary mb-6 leading-tight drop-shadow-lg">
                                        {slide.title}
                                    </h1>
                                    <p className="text-xl md:text-2xl text-text-main/80 mb-10 max-w-lg font-light drop-shadow-md">
                                        {slide.subtitle}
                                    </p>
                                    <Link to={slide.link || "/shop"}>
                                        <button className="bg-primary w-fit hover:bg-light text-dark font-heading font-bold py-4 px-12 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)]">
                                            Explore Collection
                                        </button>
                                    </Link>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>

            {/* Carousel Indicators */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
                {heroSlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-primary w-8' : 'bg-primary/30 hover:bg-primary'}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default Hero;
