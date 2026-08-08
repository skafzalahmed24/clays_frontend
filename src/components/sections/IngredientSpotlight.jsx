import React from 'react';

const IngredientSpotlight = () => {
    return (
        <section className="py-8 md:py-12 bg-body relative overflow-hidden">
            <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                    {/* Image Side */}
                    <div className="flex justify-center md:justify-end w-full">
                        <div className="relative aspect-[4/3] w-full overflow-hidden shadow-2xl">
                            <img
                                src="/assets/gold_standard.png"
                                alt="Premium Beauty Serum"
                                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent"></div>
                            <div className="absolute bottom-8 left-8 md:bottom-10 md:left-10 text-white">
                            </div>
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className="flex flex-col justify-center px-4 md:px-12">
                        <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-widest uppercase mb-6 text-dark">The Gold Standard</h2>
                        <div className="w-16 h-1 bg-primary mb-8"></div>
                        <p className="text-dark/70 text-lg font-light leading-relaxed mb-6">
                            Experience the pinnacle of luxury skincare. Our signature serum is infused with pure 24k gold flakes, known since ancient times for its powerful anti-aging and illuminating properties.
                        </p>
                        <p className="text-dark/70 text-lg font-light leading-relaxed mb-10">
                            Combined with ultra-hydrating hyaluronic acid and rare botanical extracts, it penetrates deep to restore your skin's natural elasticity, leaving you with an unmistakable, radiant glow.
                        </p>
                        <button className="bg-transparent border border-primary text-dark hover:bg-primary hover:text-white font-heading font-bold uppercase tracking-widest py-4 px-10 transition-all duration-300 w-full md:w-fit text-center">
                            Discover The Formula
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default IngredientSpotlight;
