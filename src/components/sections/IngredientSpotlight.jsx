import React from 'react';
import { useGetGoldStandardQuery } from '../../store/api/contentApiSlice';
import { getMediaUrl } from '../../utils/apiConfig';
import { Link } from 'react-router-dom';

const IngredientSpotlight = () => {
    const { data: goldStandard } = useGetGoldStandardQuery();

    const content = goldStandard || {
        title: "The Gold Standard",
        subtitle: "",
        description: "Experience the pinnacle of luxury skincare. Our signature serum is infused with pure 24k gold flakes, known since ancient times for its powerful anti-aging and illuminating properties.",
        description2: "Combined with ultra-hydrating hyaluronic acid and rare botanical extracts, it penetrates deep to restore your skin's natural elasticity, leaving you with an unmistakable, radiant glow.",
        image: "/assets/gold_standard.png",
        link: "/shop",
        linkText: "Discover The Formula"
    };

    const imageUrl = content.image ? getMediaUrl(content.image) : "/assets/gold_standard.png";

    return (
        <section className="py-8 md:py-12 bg-body relative overflow-hidden">
            <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                    {/* Image Side */}
                    <div className="flex justify-center md:justify-end w-full">
                        <div className="relative aspect-[4/3] w-full overflow-hidden shadow-2xl">
                            <img
                                src={imageUrl}
                                alt={content.title || "The Gold Standard"}
                                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent"></div>
                            <div className="absolute bottom-8 left-8 md:bottom-10 md:left-10 text-white">
                            </div>
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left px-4 md:px-12">
                        {content.subtitle && (
                            <span className="text-primary text-sm uppercase tracking-[0.3em] font-bold mb-4">{content.subtitle}</span>
                        )}
                        <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-widest uppercase mb-6 text-dark">{content.title}</h2>
                        <div className="w-16 h-1 bg-primary mb-8 mx-auto md:mx-0"></div>
                        {content.description && (
                            <p className="text-dark/70 text-lg font-light leading-relaxed mb-6 whitespace-pre-line">
                                {content.description}
                            </p>
                        )}
                        {content.description2 && (
                            <p className="text-dark/70 text-lg font-light leading-relaxed mb-10 whitespace-pre-line">
                                {content.description2}
                            </p>
                        )}
                        <Link
                            to={content.link || '/shop'}
                            className="bg-transparent border border-primary text-dark hover:bg-primary hover:text-white font-heading font-bold uppercase tracking-widest py-4 px-10 transition-all duration-300 w-full md:w-fit text-center block"
                        >
                            {content.linkText || 'Discover The Formula'}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default IngredientSpotlight;
