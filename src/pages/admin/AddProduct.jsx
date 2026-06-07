import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../components/admin/ProductForm';
import { useToast } from '../../context/ToastContext';
import { useCreateProductMutation } from '../../store/api/productApiSlice';

const AdminAddProduct = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [createProduct] = useCreateProductMutation();

    const handleCreate = async (data) => {
        try {
            await createProduct(data).unwrap();
            showToast('Product created successfully', 'success');
            navigate('/admin/products');
        } catch (error) {
            console.error('Create product failed', error);
            showToast(error?.data?.message || 'Failed to create product', 'error');
        }
    };

    return (
        <ProductForm
            title="Add New Product"
            onSubmit={handleCreate}
        />
    );
};

export default AdminAddProduct;
