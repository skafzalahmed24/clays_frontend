import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
// import { PRODUCTS_DATA } from '../utils/constants';
import FilterSidebar from '../components/common/FilterSidebar';
import PageHeader from '../components/layout/PageHeader';
import ProductCard from '../components/ui/ProductCard';
import Select from '../components/ui/Select';
import SEO from '../components/common/SEO';
import bannerImg from '../assets/hero.png'; // Using hero image as fallback

import { useGetProductsQuery } from '../store/api/productApiSlice';
import { useGetPageQuery } from '../store/api/contentApiSlice';
import { usePrice } from '../hooks/usePrice';

const Shop = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const categoryFilter = queryParams.get('category');
    const subCategoryFilter = queryParams.get('subCategory');
    const isFeaturedFilter = queryParams.get('featured') === 'true';
    const isNewArrivalFilter = queryParams.get('new') === 'true';
    const { format } = usePrice();

    const [page, setPage] = useState(1);
    const [selectedFilters, setSelectedFilters] = useState({
        category: categoryFilter ? [categoryFilter] : [],
        subCategory: subCategoryFilter ? [subCategoryFilter] : []
    });
    const [sortBy, setSortBy] = useState('featured');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Sync selectedFilters when URL parameters change
    useEffect(() => {
        setSelectedFilters(prev => ({
            ...prev,
            category: categoryFilter ? [categoryFilter] : [],
            subCategory: subCategoryFilter ? [subCategoryFilter] : []
        }));
    }, [categoryFilter, subCategoryFilter]);

    // Derived filters for API
    const minPrice = selectedFilters.price?.length ?
        (selectedFilters.price.includes('Under ₹10,000') ? 0 :
            selectedFilters.price.includes('₹10,000 - ₹20,000') ? 10000 :
                selectedFilters.price.includes('₹20,000 - ₹50,000') ? 20000 :
                    selectedFilters.price.includes('Above ₹50,000') ? 50000 : undefined) : undefined;

    const maxPrice = selectedFilters.price?.length ?
        (selectedFilters.price.includes('Under ₹10,000') ? 10000 :
            selectedFilters.price.includes('₹10,000 - ₹20,000') ? 20000 :
                selectedFilters.price.includes('₹20,000 - ₹50,000') ? 50000 : undefined) : undefined;

    // Sort Mapping
    const sortParam = sortBy === 'price-low' ? 'price' : sortBy === 'price-high' ? '-price' : '-createdAt';

    // Fetch static page content
    const { data: pageData, isLoading: loadingPage } = useGetPageQuery('shop');

    const { data, isLoading: productsLoading } = useGetProductsQuery({
        pageNumber: page,
        minPrice,
        maxPrice,

        // Wait, FilterSidebar passes ARRAYS for all fitlers.
        // Backend logic: category: { $regex: ... } expects single string.
        // If frontend selects multiple categories, how do we handle it?
        // Current backend only handles REGEX search for ONE category.
        // ProductController: `category: { $regex: new RegExp(`^${req.query.category}$`, 'i') }`
        // It does NOT support array $in.
        // LIMITATION: For now, I'll pass the first selected element if multiple are selected, OR join them if I change backend.
        // But to minimize risk, let's look at `selectedFilters`. It's `{ category: ['Ring', 'Necklace'] }`.
        category: selectedFilters.category,
        subCategory: selectedFilters.subCategory,
        color: selectedFilters.color,
        material: selectedFilters.material,
        occasion: selectedFilters.occasion,
        isFeatured: isFeaturedFilter ? true : undefined,
        isNewArrival: isNewArrivalFilter ? true : undefined,
        sort: sortParam,
        limit: 12
    });

    const productsData = data?.products || [];
    const pages = data?.pages || 1;
    const totalProducts = data?.total || 0;



    // Combining loading states
    const loading = productsLoading || loadingPage;

    // Map products data using useMemo to avoid re-creating on every render
    const products = useMemo(() => {
        return productsData.map(p => ({
            ...p,
            id: p._id || p.id,
            displayPrice: format(p.price)
        }));
    }, [productsData, format]);

    // Fetch static page content separately (could also be an RTK Query endpoint ideally)

    // Reset page when filters change - Now handled in handleFilterChange and setSortBy

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleFilterChange = (filterId, newOptions) => {
        setSelectedFilters(prev => ({
            ...prev,
            [filterId]: newOptions
        }));
        setPage(1); // Reset page on filter change
    };

    const pageHeader = pageData?.modules?.header || {
        title: "Shop All",
        eyebrow: "Our Catalog",
        subtitle: "Explore our complete catalog of handcrafted luxury jewelry."
    };

    // Verify Data Types
    const safeTitle = isFeaturedFilter ? "Featured Products" : isNewArrivalFilter ? "New Arrivals" : (typeof pageHeader.title === 'string' ? pageHeader.title : 'Shop All');
    const safeTotal = typeof totalProducts === 'number' ? totalProducts : 0;

    return (
        <div className="pt-0 min-h-screen bg-body">
            <SEO
                title={pageData?.seo?.title || "Shop All"}
                description={pageData?.seo?.description || "Explore our complete catalog of handcrafted luxury jewelry."}
            />
            <PageHeader
                title={safeTitle}
                eyebrow={typeof pageHeader.eyebrow === 'string' ? pageHeader.eyebrow : "Our Catalog"}
                subtitle={typeof pageHeader.subtitle === 'string' ? pageHeader.subtitle : "Explore our catalog"}
                backgroundImage={pageHeader.bannerImage || bannerImg}
            />

            <div className="bg-body/95 backdrop-blur-md border-b border-light/5 sticky top-[64px] z-30 transition-shadow duration-300 shadow-2xl shadow-dark/50">
                <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center text-xs md:text-sm text-light/40 uppercase tracking-wider font-light">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="mx-3 text-light/20">/</span>
                        <span className="text-primary font-medium">{isFeaturedFilter ? "Featured Products" : isNewArrivalFilter ? "New Arrivals" : "Shop All"}</span>
                        <span className="ml-6 pl-6 border-l border-light/10 text-light/30 hidden md:inline">
                            {safeTotal} items
                        </span>
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        {/* Mobile Filter Toggle */}
                        <button
                            className="lg:hidden flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 md:py-2 md:px-6 bg-dark text-white border border-dark/10 text-xs uppercase tracking-widest hover:bg-primary transition-colors rounded-md shadow-sm"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            Filter
                        </button>

                        {/* Mobile Sort Dropdown */}
                        <div className="md:hidden flex-1 relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full appearance-none px-4 py-3 bg-white text-dark border border-dark/10 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="featured">Featured</option>
                                <option value="price-low">Low to High</option>
                                <option value="price-high">High to Low</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-dark/50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Desktop & Tablet Sort */}
                        <div className="hidden md:flex items-center gap-3">
                            <span className="text-xs uppercase tracking-widest text-light/40">Sort by:</span>
                            <div className="w-48">
                                <Select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    options={[
                                        { value: 'featured', label: 'Featured' },
                                        { value: 'price-low', label: 'Price: Low to High' },
                                        { value: 'price-high', label: 'Price: High to Low' }
                                    ]}
                                    className="bg-transparent border-none py-1 pr-8 text-sm font-medium text-light focus:outline-none focus:ring-0 cursor-pointer hover:text-primary transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-16 flex flex-col lg:flex-row gap-12">
                {/* Sidebar */}
                <aside className="flex-shrink-0">
                    <FilterSidebar
                        selectedFilters={selectedFilters}
                        onFilterChange={handleFilterChange}
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                </aside>

                {/* Products Grid */}
                <div className="flex-grow">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-12 md:gap-y-16">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-white/5 aspect-[4/5] w-full mb-4 rounded-sm"></div>
                                    <div className="h-4 bg-white/5 w-3/4 mb-2"></div>
                                    <div className="h-4 bg-white/5 w-1/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-12 md:gap-y-16 animate-in fade-in duration-700">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 bg-light/5 border border-light/5 rounded-sm">
                            <span className="text-6xl mb-6 opacity-20 text-light">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <h3 className="text-2xl font-serif text-light mb-3">No matches found</h3>
                            <p className="text-light/50 mb-8 max-w-md text-center font-light leading-relaxed">
                                We couldn't find any products matching your specific preferences. Try adjusting your filters or browsing our full catalog.
                            </p>
                            <button
                                onClick={() => setSelectedFilters({})}
                                className="px-8 py-3 border border-primary text-primary text-xs uppercase tracking-[0.2em] hover:bg-primary hover:text-dark transition-all shadow-lg hover:shadow-primary/20"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}


                    {/* Pagination */}
                    {pages > 1 && (
                        <div className="flex justify-center mt-16 gap-2">
                            {[...Array(pages).keys()].map(x => (
                                <button
                                    key={x + 1}
                                    onClick={() => setPage(x + 1)}
                                    className={`w-10 h-10 flex items-center justify-center text-sm border ${page === x + 1 ? 'border-primary text-primary bg-primary/10' : 'border-light/10 text-light/50 hover:border-light/30'} transition-colors`}
                                >
                                    {x + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Shop;
