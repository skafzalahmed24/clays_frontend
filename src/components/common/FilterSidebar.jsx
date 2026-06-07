import React, { useState } from 'react';
import { useGetAttributesQuery } from '../../store/api/attributeApiSlice';

const FilterSidebar = ({ selectedFilters, onFilterChange, isOpen, onClose, hideCategories = false }) => {
    const { data: attributesData, isLoading } = useGetAttributesQuery();

    const attributes = attributesData || {
        categories: [],
        subCategories: [],
        colors: [],
        materials: [],
        occasions: [],
    };

    // Fallback or use categories from attributes if available, else empty
    const categories = attributes.categories || [];

    // Construct dynamic filter options from Context
    const filterOptions = [
        {
            id: 'category',
            label: 'Category',
            options: (categories && Array.isArray(categories) ? categories : []).map(c => c.name)
        },
        {
            id: 'subCategory',
            label: 'Sub Category',
            options: (attributes.subCategories || []).map(s => s.name)
        },
        {
            id: 'price',
            label: 'Price',
            options: ['Under ₹10,000', '₹10,000 - ₹20,000', '₹20,000 - ₹50,000', 'Above ₹50,000']
        },
        {
            id: 'color',
            label: 'Color',
            options: (attributes.colors || []).map(c => c.name)
        },
        {
            id: 'material',
            label: 'Material',
            options: (attributes.materials || []).map(m => m.name)
        },
        {
            id: 'occasion',
            label: 'Occasion',
            options: (attributes.occasions || []).map(o => o.name)
        }
    ].filter(filter => !hideCategories || filter.id !== 'category');

    // State to track expanded sections
    const [expandedSections, setExpandedSections] = useState({
        category: true,
        subCategory: false,
        price: true,
        color: false,
        material: false,
        occasion: false
    });

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const handleCheckboxChange = (filterId, option) => {
        const currentOptions = selectedFilters[filterId] || [];
        const isSelected = currentOptions.includes(option);

        let newOptions;
        if (filterId === 'price') {
            // Price: Single select behavior (toggle on/off, but mutual exclusive)
            newOptions = isSelected ? [] : [option];
        } else {
            // Other filters: Multi-select behavior
            if (isSelected) {
                newOptions = currentOptions.filter(item => item !== option);
            } else {
                newOptions = [...currentOptions, option];
            }
        }

        onFilterChange(filterId, newOptions);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar Container */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-80 bg-dark shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-y-auto border-r border-light/10
                lg:translate-x-0 lg:sticky lg:top-[128px] lg:bottom-auto lg:h-auto lg:z-20 lg:bg-transparent lg:shadow-none lg:w-64 lg:block lg:mr-12 lg:max-h-[calc(100vh-148px)] lg:border-none
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-8 lg:px-0 lg:py-6">
                    <div className="flex justify-between items-center lg:hidden mb-8">
                        <h2 className="text-2xl font-serif text-light">Filters</h2>
                        <button onClick={onClose} className="text-light/60 hover:text-primary transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-8">
                        {filterOptions.map((filter) => (
                            <div key={filter.id} className="">
                                <button
                                    className="flex justify-between items-center w-full text-left py-2 group"
                                    onClick={() => toggleSection(filter.id)}
                                >
                                    <span className="font-heading text-xs uppercase tracking-[0.2em] text-light/90 font-medium group-hover:text-primary transition-colors">
                                        {filter.label}
                                    </span>
                                    <span className={`transform transition-transform duration-300 ${expandedSections[filter.id] ? 'rotate-180' : ''}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-light/40 group-hover:text-primary" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                </button>

                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections[filter.id] ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                    {filter.id === 'color' ? (
                                        <div className="flex flex-wrap gap-3 p-1">
                                            {filter.options.map((option) => {
                                                const isSelected = selectedFilters[filter.id]?.includes(option);
                                                // Find color hex if available
                                                const colorObj = attributes.colors.find(c => c.name === option);
                                                const bgStyle = colorObj ? colorObj.hex : '#ccc';

                                                return (
                                                    <button
                                                        key={option}
                                                        onClick={() => handleCheckboxChange(filter.id, option)}
                                                        className={`w-8 h-8 rounded-full border transition-all duration-300 relative group ${isSelected ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-light/20 hover:border-light/50'}`}
                                                        style={{ backgroundColor: bgStyle }}
                                                        title={option}
                                                    // aria-label={`Select ${option}`}
                                                    >
                                                        {isSelected && (
                                                            <span className="absolute inset-0 flex items-center justify-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${option === 'White' || option === 'Silver' ? 'text-dark' : 'text-white'}`} viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </span>
                                                        )}
                                                        {/* Tooltip */}
                                                        {/* <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-dark/90 text-light text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 border border-light/10">
                                                            {option}
                                                        </span> */}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="space-y-3 pl-1">
                                            {filter.options.map((option) => (
                                                <label key={option} className="flex items-center cursor-pointer group">
                                                    <div className="relative flex items-center justify-center w-4 h-4 mr-3">
                                                        <input
                                                            type="checkbox"
                                                            className="peer appearance-none w-4 h-4 border border-light/20 rounded-sm checked:bg-primary checked:border-primary transition-all duration-200 cursor-pointer"
                                                            checked={selectedFilters[filter.id]?.includes(option) || false}
                                                            onChange={() => handleCheckboxChange(filter.id, option)}
                                                        />
                                                        <svg
                                                            className="absolute w-2.5 h-2.5 text-dark pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm text-light/60 group-hover:text-light transition-colors font-light tracking-wide">
                                                        {option}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default FilterSidebar;
