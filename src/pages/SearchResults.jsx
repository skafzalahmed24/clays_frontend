import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import FilterSidebar from '../components/common/FilterSidebar';
import { useGetPageQuery } from '../store/api/contentApiSlice';
import { useGetProductsQuery } from '../store/api/productApiSlice';
import ProductCard from '../components/ui/ProductCard';
import { MEGA_MENU_DATA } from '../utils/constants';
import SEO from '../components/common/SEO';
import { usePrice } from '../hooks/usePrice';

const SearchResults = () => {
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilters, setSelectedFilters] = useState({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { format } = usePrice();


    // API State - using RTK Query
    // Fetching all to handle complex client-side filtering (Name, Category, SubCategory) 
    // that backend text search doesn't fully support yet.
    const { data: productsData, isLoading: productsLoading } = useGetProductsQuery({});

    // Page Content Fetching (could be moved to contentSlice/RTK Query later)
    const { data: pageData } = useGetPageQuery('search');

    const header = pageData?.modules?.header || {
        title: searchQuery ? `Search Results for "${searchQuery}"` : 'Search Results',
        eyebrow: "Search",
        subtitle: "",
        bannerImage: MEGA_MENU_DATA["New Arrivals"]?.featured?.img
    };

    const dynamicTitle = pageData?.seo?.title || (searchQuery ? `Search: ${searchQuery}` : 'Search Results');

    const products = useMemo(() => {
        if (!productsData) return [];
        const list = Array.isArray(productsData) ? productsData : (productsData.products || []);
        return list.map(p => ({
            ...p,
            id: p._id,
            displayPrice: format(p.price)
        }));
    }, [productsData, format]);

    const loading = productsLoading;

    // Get Filtered Results based on Query AND Selected Filters
    const getFilteredResults = () => {
        const params = new URLSearchParams(location.search);
        const query = params.get('q') || '';
        const lowerQuery = query.toLowerCase();

        return products.filter(product => {
            // 1. Search Query Filter
            if (query) {
                const matchesSearch =
                    product.name.toLowerCase().includes(lowerQuery) ||
                    product.category.toLowerCase().includes(lowerQuery) ||
                    (product.subCategory && product.subCategory.toLowerCase().includes(lowerQuery));

                if (!matchesSearch) return false;
            }

            // 2. Sidebar Filters
            for (const [key, values] of Object.entries(selectedFilters)) {
                if (values && values.length > 0) {
                    // Handle Price Ranges
                    if (key === 'price') {
                        const priceMatch = values.some(range => {
                            if (range === 'Under ₹10,000') return product.price < 10000;
                            if (range === '₹10,000 - ₹20,000') return product.price >= 10000 && product.price <= 20000;
                            if (range === '₹20,000 - ₹50,000') return product.price > 20000 && product.price <= 50000;
                            if (range === 'Above ₹50,000') return product.price > 50000;
                            return false;
                        });
                        if (!priceMatch) return false;
                    }
                    // Handle exact matches (color, material, etc.)
                    else if (!product[key] || !values.includes(product[key])) {
                        return false;
                    }
                }
            }
            return true;
        });
    };

    const results = getFilteredResults();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setSearchQuery(params.get('q') || '');
        window.scrollTo(0, 0);
    }, [location.search]);

    const handleFilterChange = (filterId, newOptions) => {
        setSelectedFilters(prev => ({
            ...prev,
            [filterId]: newOptions
        }));
    };

    return (
        <div className="pt-0 min-h-screen bg-body text-text-main">
            <SEO
                title={dynamicTitle}
                description={pageData?.seo?.description}
            />
            <PageHeader
                title={header.title.includes('searchQuery') || header.title === 'Search Results' ? (searchQuery ? `Search Results for "${searchQuery}"` : 'Search Results') : header.title}
                eyebrow={header.eyebrow}
                subtitle={header.subtitle || `Found ${results.length} item${results.length === 1 ? '' : 's'}`}
                backgroundImage={header.bannerImage || MEGA_MENU_DATA["New Arrivals"]?.featured?.img}
            />

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden px-6 py-4 border-b border-light/10 sticky top-[64px] bg-body z-30">
                <button
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-dark text-white border border-dark/10 text-xs uppercase tracking-widest hover:bg-primary transition-colors rounded-md shadow-sm"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Filter Results
                </button>
            </div>

            <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-12 flex flex-col lg:flex-row gap-12">
                {/* Sidebar */}
                <aside className="flex-shrink-0">
                    <FilterSidebar
                        selectedFilters={selectedFilters}
                        onFilterChange={handleFilterChange}
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                </aside>

                <div className="flex-grow">
                    {loading ? (
                        <div className="text-center py-20 text-light/50">Loading products...</div>
                    ) : results.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-12 md:gap-y-16">
                            {results.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    searchQuery={searchQuery}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-light/50">
                            <p className="text-xl mb-4">
                                {Object.values(selectedFilters).some(v => v && v.length > 0)
                                    ? "No products found matching your search and filters."
                                    : `No products found for "${searchQuery}".`}
                            </p>
                            {Object.values(selectedFilters).some(v => v && v.length > 0) && (
                                <button
                                    onClick={() => setSelectedFilters({})}
                                    className="text-primary hover:underline"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default SearchResults;
