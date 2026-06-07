import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from '../../components/admin/ProductForm';
import { useToast } from '../../context/ToastContext';
import { useGetProductDetailsQuery, useUpdateProductMutation } from '../../store/api/productApiSlice';

const AdminEditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Fetch Product
    const { data: product, isLoading: loading, error, refetch } = useGetProductDetailsQuery(id);

    useEffect(() => {
        refetch();
    }, [refetch]);

    // Update Mutation
    const [updateProduct] = useUpdateProductMutation();

    useEffect(() => {
        if (error) {
            console.error("Failed to fetch product", error);
            showToast('Product not found or error loading', 'error');
            navigate('/admin/products');
        }
    }, [error, navigate, showToast]);

    const handleUpdate = async (formData) => {
        try {
            // formData can be FormData object or plain object depending on implementation
            // updateProduct expects { data, productId }
            await updateProduct({ data: formData, productId: id }).unwrap();
            showToast('Product updated successfully', 'success');
            navigate('/admin/products');
        } catch (error) {
            console.error("Update failed", error);
            showToast(error?.data?.message || 'Failed to update product', 'error');
        }
    };

    if (loading) return <div className="p-8 text-center text-light/50">Loading product...</div>;
    if (!product) return null;

    return (
        <ProductForm
            key={`${product._id}-${product.updatedAt}`}
            title="Edit Product"
            initialData={product}
            onSubmit={handleUpdate}
        />
    );
};

export default AdminEditProduct;
