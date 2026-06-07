import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetAttributesQuery } from '../../store/api/attributeApiSlice';
import { getMediaUrl } from '../../utils/apiConfig';
import Image from '../ui/Image';

const Categories = ({ title = "Shop by Category", limit = 5, showViewAll = true }) => {
    const { data: attributes } = useGetAttributesQuery();
    const categories = attributes?.categories || [];
    const navigate = useNavigate();
    return (
        <section className="py-24">
            <div className="w-full px-6 md:px-12">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-heading mb-4">{title}</h2>
                    <div className="w-24 h-1 bg-primary mx-auto"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {(categories && Array.isArray(categories) ? categories : []).slice(0, limit).map((cat) => (
                        <div key={cat.id} onClick={() => navigate(`/category/${cat.name.toLowerCase()}`)} className="relative group cursor-pointer overflow-hidden aspect-[3/4]">
                            <Image
                                src={getMediaUrl(cat.img)}
                                alt={cat.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                                <h3 className="text-xl font-heading text-white mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{cat.name}</h3>
                                <span className="text-primary text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">Shop</span>
                            </div>
                        </div>
                    ))}
                </div>
                {showViewAll && (
                    <div className="mt-12 text-center">
                        <Link to="/collections" className="inline-block px-8 py-3 bg-transparent border border-accent text-accent hover:bg-primary hover:text-dark hover:border-primary transition-all duration-300 font-heading uppercase tracking-widest text-sm">
                            View More Categories
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Categories;
