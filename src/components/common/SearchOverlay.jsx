import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetSettingsQuery } from '../../store/api/contentApiSlice';
import { useGetProductsQuery } from '../../store/api/productApiSlice';
import Icons from '../ui/Icons';
import ProductCard from '../ui/ProductCard';
import { usePrice } from '../../hooks/usePrice';

const SearchOverlay = ({ isOpen, onClose }) => {
    const { data: settings } = useGetSettingsQuery();
    // Fetch all products for client-side search (using limit=1000 equivalent logic or just standard query)
    const { data: productsData } = useGetProductsQuery({ limit: 1000 });
    const { format } = usePrice();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [products, setProducts] = useState([]);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (productsData) {
            const productsArray = Array.isArray(productsData) ? productsData : (productsData.products || []);
            const mapped = productsArray.map(p => ({
                ...p,
                id: p._id,
                displayPrice: `₹ ${p.price.toLocaleString()}`
            }));
            setProducts(mapped);
        }
    }, [productsData]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 100);
        }
    }, [isOpen]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle search (real-time filtering for overlay)
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(lowerQuery) ||
            product.category.toLowerCase().includes(lowerQuery) ||
            (product.subCategory && product.subCategory.toLowerCase().includes(lowerQuery))
        );
        setResults(filtered);
    }, [query, products]);

    // Handle Search Submit
    const handleSearch = () => {
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const labels = settings?.uiLabels?.search || {};
    const popularTerms = labels.popularTerms?.length > 0 ? labels.popularTerms : ['Rings', 'Gold Necklaces', 'Diamond Earrings', 'Bridal Sets', 'Bracelets'];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-dark/95 backdrop-blur-xl animate-in fade-in duration-300">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-light/50 hover:text-primary transition-colors"
            >
                <Icons.Close className="w-8 h-8" />
            </button>

            <div className="max-w-4xl mx-auto px-6 pt-32 h-full flex flex-col">
                {/* Search Input */}
                <div className="flex items-center border-b-2 border-light/10 focus-within:border-primary transition-colors mb-12">
                    <div className="w-full">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder={labels.placeholder || "Search for jewellery..."}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent py-4 text-3xl md:text-5xl font-serif text-light placeholder-light/20 focus:outline-none border-none focus:ring-0"
                        />
                    </div>
                    <button onClick={handleSearch} className="focus:outline-none">
                        <Icons.Search className="w-8 h-8 text-light/20 flex-shrink-0 ml-4 hover:text-primary transition-colors" />
                    </button>
                </div>

                {/* Results Area */}
                <div className="flex-grow overflow-y-auto pb-20 custom-scrollbar">
                    {query && results.length === 0 ? (
                        <div className="text-center py-20 text-light/40">
                            <p className="text-lg">{labels.noResults || `No results found for "${query}"`}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {results.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onNavigate={onClose}
                                    searchQuery={query}
                                />
                            ))}
                        </div>
                    )}

                    {!query && (
                        <div className="py-10">
                            <h4 className="text-xs uppercase tracking-widest text-light/40 mb-6">Popular Searches</h4>
                            <div className="flex flex-wrap gap-3">
                                {popularTerms.map(term => (
                                    <button
                                        key={term}
                                        onClick={() => setQuery(term)}
                                        className="px-4 py-2 bg-light/5 hover:bg-light/10 border border-light/5 rounded-full text-sm text-light/70 transition-colors"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchOverlay;
