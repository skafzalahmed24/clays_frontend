import { Link } from 'react-router-dom';
import { useGetAttributesQuery } from '../store/api/attributeApiSlice';
import PageHeader from '../components/layout/PageHeader';
import Image from '../components/ui/Image';
import heroImg from '../assets/hero.png';
import { useGetPageQuery } from '../store/api/contentApiSlice';
import SEO from '../components/common/SEO';

const Categories = () => {
    const { data: attributes } = useGetAttributesQuery();
    const categories = attributes?.categories || [];
    const { data: pageData } = useGetPageQuery('categories');

    const header = pageData?.modules?.header || {
        title: "Browse Categories",
        eyebrow: "Discover Our Assets",
        subtitle: "Explore our exquisite collection of fine jewellery, crafted to perfection for every occasion.",
        bannerImage: heroImg
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
                backgroundImage={header.bannerImage || heroImg}
            />

            {/* Categories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 px-4 md:px-12 py-16 max-w-[1920px] mx-auto">
                {(categories && Array.isArray(categories) ? categories : []).map((category, index) => (
                    <Link
                        to={`/category/${encodeURIComponent(category.name.toLowerCase())}`} // Ensure URL consistency
                        key={category.id}
                        className="group relative overflow-hidden aspect-[3/4] block border border-white/5 bg-white/5 hover:border-accent/40 transition-colors duration-500 rounded-sm"
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
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 group-hover:opacity-100"></div>

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col justify-end p-6 text-center z-10">
                            <div className="transform transition-transform duration-500 ease-out group-hover:-translate-y-2">
                                {/* Text Shadow added for better legibility */}
                                <h3 className="text-xl md:text-2xl font-serif text-accent tracking-widest mb-1 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                                    {category.name}
                                </h3>

                                {/* Smooth Transition: Replaced height animation with opacity/translate */}
                                <div className="opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out absolute left-0 right-0 -bottom-8 group-hover:bottom-0 relative">
                                    <span className="inline-block px-6 py-2 border border-accent text-accent text-xs uppercase tracking-[0.2em] hover:bg-accent hover:text-dark transition-colors duration-300 mt-3 bg-black/20 backdrop-blur-sm">
                                        View Collection
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

        </div>
    );
};

export default Categories;
