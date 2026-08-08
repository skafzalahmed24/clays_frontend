/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetAttributesQuery } from '../store/api/attributeApiSlice';
import { useGetProductsQuery } from '../store/api/productApiSlice';
import FilterSidebar from '../components/common/FilterSidebar';
import PageHeader from '../components/layout/PageHeader';
import ProductCard from '../components/ui/ProductCard';
import Select from '../components/ui/Select';
import SEO from '../components/common/SEO';
import { usePrice } from '../hooks/usePrice';

const CategoryDetails = () => {
    const { categoryName, subCategoryName } = useParams();
    const decodedCategoryName = decodeURIComponent(categoryName);
    const decodedSubCategoryName = subCategoryName ? decodeURIComponent(subCategoryName) : null;
    const { format } = usePrice();

    const { data: attributes } = useGetAttributesQuery();
    const categories = attributes?.categories || [];

    // Find category from Redux/API Data to get correct casing
    const category = categories.find(c => c.name.toLowerCase() === decodedCategoryName.toLowerCase());

    const [selectedFilters, setSelectedFilters] = useState({
        category: category ? [category.name] : [decodedCategoryName],
        subCategory: decodedSubCategoryName ? [decodedSubCategoryName] : []
    });
    const [sortBy, setSortBy] = useState('featured');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Sync selectedFilters when categoryName or subCategoryName changes (navigation)
    useEffect(() => {
        setSelectedFilters({
            category: category ? [category.name] : [decodedCategoryName],
            subCategory: decodedSubCategoryName ? [decodedSubCategoryName] : []
        });
    }, [decodedCategoryName, decodedSubCategoryName, category]);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);

    // Reset page when filters change
    // eslint-disable-next-line
    useEffect(() => {
        setPage(1);
    }, [selectedFilters, sortBy, decodedCategoryName, decodedSubCategoryName]);

    const { data, isLoading } = useGetProductsQuery({
        // If user has modified category filters, use them. Otherwise default to the page's category.
        category: selectedFilters.category && selectedFilters.category.length > 0 ? selectedFilters.category : (category ? category.name : decodedCategoryName),
        // Pass filters directly (arrays)
        subCategory: selectedFilters.subCategory,
        color: selectedFilters.color,
        material: selectedFilters.material,
        occasion: selectedFilters.occasion,
        minPrice: selectedFilters.price?.length ?
            (selectedFilters.price.includes('Under ₹10,000') ? 0 :
                selectedFilters.price.includes('₹10,000 - ₹20,000') ? 10000 :
                    selectedFilters.price.includes('₹20,000 - ₹50,000') ? 20000 :
                        selectedFilters.price.includes('Above ₹50,000') ? 50000 : undefined) : undefined,
        maxPrice: selectedFilters.price?.length ?
            (selectedFilters.price.includes('Under ₹10,000') ? 10000 :
                selectedFilters.price.includes('₹10,000 - ₹20,000') ? 20000 :
                    selectedFilters.price.includes('₹20,000 - ₹50,000') ? 50000 : undefined) : undefined,
        sort: sortBy === 'price-low' ? 'price' : sortBy === 'price-high' ? '-price' : '-createdAt',
        limit: 12,
        pageNumber: page
    });

    const productsData = data?.products; // Avoid default [] to match fix in other files

    // Process products for display
    const filteredProducts = (productsData || []).map(p => ({
        ...p,
        id: p._id || p.id,
        displayPrice: format(p.price)
    }));

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [categoryName, subCategoryName]);

    const handleFilterChange = (filterId, newOptions) => {
        setSelectedFilters(prev => ({
            ...prev,
            [filterId]: newOptions
        }));
    };

    if (!category) {
        return (
            <div className="pt-32 pb-24 px-6 text-center min-h-[60vh] flex flex-col justify-center items-center bg-body">
                <h1 className="text-3xl font-serif text-white mb-4">Category Not Found</h1>
                <Link to="/categories" className="text-primary underline hover:text-white transition-colors">
                    Return to Categories
                </Link>
            </div>
        );
    }

    const pageTitle = decodedSubCategoryName || category.name;
    const pageSubtitle = decodedSubCategoryName 
        ? `Explore our curated collection of ${decodedSubCategoryName.toLowerCase()}, crafted for moments of elegance.`
        : `Explore our curated collection of ${category.name.toLowerCase()}, crafted for moments of elegance.`;

    return (
        <div className="pt-0 min-h-screen bg-body">
            <SEO
                title={pageTitle}
                description={pageSubtitle}
            />
            {/* Hero Section */}
            <PageHeader
                title={pageTitle}
                eyebrow={decodedSubCategoryName ? category.name : "Discover"}
                subtitle={pageSubtitle}
                backgroundImage={category.img}
            />

            {/* Breadcrumbs & Controls */}
            <div className="bg-body/95 backdrop-blur-md border-b border-light/5 sticky top-[64px] z-30 transition-shadow duration-300 shadow-2xl shadow-dark/50">
                <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center text-xs md:text-sm text-light/40 uppercase tracking-wider font-light">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="mx-3 text-light/20">/</span>
                        <Link to="/categories" className="hover:text-primary transition-colors">Categories</Link>
                        <span className="mx-3 text-light/20">/</span>
                        <Link to={`/category/${encodeURIComponent(category.name)}`} className="hover:text-primary transition-colors">{category.name}</Link>
                        {decodedSubCategoryName && (
                            <>
                                <span className="mx-3 text-light/20">/</span>
                                <span className="text-primary font-medium">{decodedSubCategoryName}</span>
                            </>
                        )}
                        <span className="ml-6 pl-6 border-l border-light/10 text-light/30 hidden md:inline">
                            {filteredProducts.length} items
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
                        hideCategories={true}
                    />
                </aside>

                {/* Products Grid */}
                <div className="flex-grow">
                    {isLoading ? (
                        <div className="text-center py-20 text-light/50">Loading products...</div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-12 md:gap-y-16">
                            {filteredProducts.map((product) => (
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
                    {data?.pages > 1 && (
                        <div className="flex justify-center mt-16 gap-2">
                            {[...Array(data.pages).keys()].map(x => (
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

export default CategoryDetails;
