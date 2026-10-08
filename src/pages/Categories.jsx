import { Link } from 'react-router-dom';
import { useGetAttributesQuery } from '../store/api/attributeApiSlice';
import PageHeader from '../components/layout/PageHeader';
import Image from '../components/ui/Image';
import { useGetPageQuery } from '../store/api/contentApiSlice';
import SEO from '../components/common/SEO';

const Categories = () => {
    const { data: attributes } = useGetAttributesQuery();
    const categories = attributes?.categories || [];
    const { data: pageData } = useGetPageQuery('categories');

    const header = pageData?.modules?.header || {
        title: "Browse Categories",
        eyebrow: "Our Collections",
        subtitle: "Explore our collection of pure herbal oils, shampoos, and natural hair care formulations."
    };

    return (
        <div className="pt-0 min-h-screen bg-[#050505]">
            <SEO
                title={pageData?.seo?.title}
                description={pageData?.seo?.description}
            />
            <PageHeader
                title={header.title}
                eyebrow={header.eyebrow}
                subtitle={header.subtitle}
                backgroundImage={header.bannerImage}
            />

            {/* Categories Grid */}
            <div className="px-4 md:px-12 py-16 max-w-6xl mx-auto">
                <div className={`grid ${categories.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : categories.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : categories.length === 3 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto' : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-6 md:gap-8 justify-center`}>
                    {(categories && Array.isArray(categories) ? categories : []).map((category, index) => (
                        <Link
                            to={`/category/${encodeURIComponent(category.name.toLowerCase())}`} // Ensure URL consistency
                            key={category.id}
                            className="group relative overflow-hidden aspect-[3/4] block border border-white/10 bg-white/5 hover:border-primary transition-all duration-500 rounded-sm shadow-lg hover:shadow-primary/10"
                            style={{
                                animation: `fadeInUp 0.6s ease-out forwards ${index * 0.1}s`,
                                opacity: 0
                            }}
                        >
                            {/* Image */}
                            <div className="absolute inset-0 overflow-hidden">
                                <Image
                                    src={category.img}
                                    alt={category.name}
                                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                />
                            </div>

                            {/* Darker Overlay Gradient for better text visibility */}
                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 group-hover:opacity-100"></div>

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col justify-end p-6 text-center z-10">
                                <div className="transform transition-transform duration-500 ease-out group-hover:-translate-y-2">
                                    <h3 className="text-xl md:text-2xl font-serif text-white tracking-wider mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                        {category.name}
                                    </h3>

                                    <div className="opacity-0 transform translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 ease-out">
                                        <span className="inline-block px-5 py-2 border border-primary text-primary text-xs uppercase tracking-[0.2em] group-hover:bg-primary group-hover:text-dark transition-all duration-300 mt-2 bg-black/40 backdrop-blur-sm rounded-sm font-medium">
                                            View Products →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default Categories;
