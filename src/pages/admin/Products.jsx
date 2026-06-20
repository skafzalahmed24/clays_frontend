import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Icons from '../../components/ui/Icons';
import PreviewableImage from '../../components/ui/PreviewableImage';
import { useGetProductsQuery, useDeleteProductMutation } from '../../store/api/productApiSlice';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import TextHighlight from '../../components/ui/TextHighlight';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const AdminProducts = () => {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [deleteProduct] = useDeleteProductMutation();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [page, setPage] = useState(1);
    const limit = 10; // Items per page

    // RTK Query with pagination
    // Note: We're clearing searchTerm/filterCategory from query here to let frontend filter for now? 
    // No, standard is backend filtering for pagination. 
    // However, existing code does FRONTEND filtering (lines 50-54).
    // If I paginate on backend, frontend filtering won't work on all data.
    // I should migrate filtering to backend too, matching Shop.jsx pattern.

    // For now, let's keep it simple: Backend Pagination + Basic Backend Filtering or Frontend Filtering?
    // User asked for pagination. If I just change limit to 10 and page to 1, I only get 10 items.
    // Client-side filtering on 10 items is wrong.
    // So I MUST implement backend filtering (search & category) here too.

    const { data: productsData, isLoading: productsLoading } = useGetProductsQuery({
        pageNumber: page,
        limit,
        keyword: searchTerm,
        category: filterCategory === 'All' ? undefined : filterCategory
    });

    // Fetch all products without filters once to build the stable category list
    const { data: allProductsData } = useGetProductsQuery({ pageNumber: 1, limit: 9999 });

    // Derived State
    const products = useMemo(() => {
        if (!productsData) return [];
        return Array.isArray(productsData) ? productsData : (productsData.products || []);
    }, [productsData]);

    const totalPages = useMemo(() => {
        return productsData?.pages || 1;
    }, [productsData]);

    // Build stable category list from the full unfiltered product set
    const allCategories = useMemo(() => {
        if (!allProductsData) return ['All'];
        const allList = Array.isArray(allProductsData) ? allProductsData : (allProductsData.products || []);
        return ['All', ...new Set(allList.map(p => p.category).filter(Boolean))];
    }, [allProductsData]);

    // Reset page when filters change - Moved to handlers below

    // Combined Loading
    const loading = productsLoading;



    // Delete Handler
    const handleDelete = async (id) => {
        if (await confirm('Delete Product', 'Are you sure you want to delete this product? This action cannot be undone.', { isDangerous: true, confirmText: 'Delete' })) {
            try {
                await deleteProduct(id).unwrap(); // Unwrap to handle promise rejection/success
                // No need to manually update state, tag invalidation handles it
                showToast('Product deleted successfully', 'success');
            } catch (error) {
                console.error("Failed to delete product", error);
                showToast("Failed to delete product", "error");
            }
        }
    };

    if (loading) {
        return <div className="p-12 text-center text-light/40">Loading products...</div>;
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8">
                <h1 className="font-heading text-3xl text-light">Products</h1>
                <Link to="/admin/products/new" className="flex items-center gap-2 bg-primary text-dark px-6 py-2 rounded-sm font-medium no-hover-effect">
                    <Icons.Plus />
                    <span>Add Product</span>
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="bg-dark-paper border border-white/10 rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Input
                        icon={Icons.Search}
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group">
                        <div className="flex items-center gap-2 text-light/60 bg-body border border-white/10 rounded-md hover:border-primary/30 transition-colors cursor-pointer">
                            <Select
                                icon={Icons.Filter}
                                value={filterCategory}
                                onChange={(e) => {
                                    setFilterCategory(e.target.value);
                                    setPage(1);
                                }}
                                options={allCategories.map(cat => ({ value: cat, label: cat }))}
                                className="border-none bg-transparent pl-10 pr-8"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-dark-paper border border-white/10 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 text-light/60 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-medium">Product</th>
                                    <th className="p-4 font-medium">Category</th>
                                    <th className="p-4 font-medium">Price</th>
                                    <th className="p-4 font-medium">Stock</th>
                                    <th className="p-4 font-medium">Rating</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {products.map(product => (
                                    <tr key={product._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-md overflow-hidden bg-white/5 border border-white/10">
                                                    <PreviewableImage 
                                                        src={product.img} 
                                                        alt={product.name} 
                                                        containerClassName="w-full h-full"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-light font-medium">
                                                        <TextHighlight text={product.name} query={searchTerm} />
                                                    </p>
                                                    <p className="text-xs text-light/40">ID: {product._id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-full text-xs bg-white/5 text-light/70 border border-white/10 border-solid">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-light">
                                            ₹{product.price.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-light/80">
                                            <span className={`font-medium ${product.stock <= 5 ? 'text-orange-400' : 'text-light/80'}`}>
                                                {product.stock || 0}
                                            </span>
                                        </td>
                                        <td className="p-4 text-light/80 text-sm">
                                            <div className="flex items-center gap-1">
                                                <span className="text-primary">★</span>
                                                <span>{product.rating || 0}</span>
                                                <span className="text-light/30 text-xs">({product.numReviews || 0})</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`flex items-center gap-2 text-xs font-medium ${product.inStock && product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${product.inStock && product.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                                {product.inStock && product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                                                <Link
                                                    to={`/admin/products/edit/${product._id}`}
                                                    className="admin-product-action p-2 rounded-md transition-colors"
                                                    title="Edit"
                                                >
                                                    <Icons.Edit />
                                                </Link>
                                                <button
                                                    className="admin-product-action p-2 rounded-md transition-colors"
                                                    title="Delete"
                                                    onClick={() => handleDelete(product._id)}
                                                >
                                                    <Icons.Trash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {products.length === 0 && (
                        <div className="p-12 text-center text-light/40">
                            No products found matching your search.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-white/10 p-4 flex items-center justify-between">
                        <p className="text-sm text-light/60">
                            Page {page} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                                className="px-4 py-2 text-xs font-heading uppercase tracking-widest border border-white/10 text-light hover:bg-white/5 rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={page === totalPages}
                                className="px-4 py-2 text-xs font-heading uppercase tracking-widest border border-white/10 text-light hover:bg-white/5 rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProducts;
