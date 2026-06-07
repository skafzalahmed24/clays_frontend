import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icons from '../ui/Icons';
import PreviewableImage from '../ui/PreviewableImage';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import { useGetAttributesQuery } from '../../store/api/attributeApiSlice';
import { useUploadImageMutation } from '../../store/api/contentApiSlice';
import { useToast } from '../../context/ToastContext';

const ProductForm = ({ initialData, onSubmit, title }) => {
    const navigate = useNavigate();
    const { data: attributesData } = useGetAttributesQuery();

    const attributes = attributesData || {
        categories: [],
        subCategories: [],
        colors: [],
        materials: [],
        occasions: [],
        collections: []
    };

    const [uploadImage] = useUploadImageMutation();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        subCategory: '',
        collection: '',
        price: '',
        originalPrice: '',
        description: '',
        img: '',
        images: [],
        stock: 0,
        inStock: true,
        isNewArrival: true,
        color: '',
        material: '',

        occasion: '',
        sku: '',
        tags: '',
        weight: '',
        dimensions: { length: '', width: '', height: '' },
        meta: { title: '', description: '' },
        ...initialData
    });

    const [errors, setErrors] = useState({});

    // Parse specific fields if initialData is provided
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || ''),
                dimensions: initialData.dimensions || { length: '', width: '', height: '' },
                meta: initialData.meta || { title: '', description: '' }
            }));
        }
    }, [initialData]);

    const [pendingUploads, setPendingUploads] = useState([]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + formData.images.length > 5) {
            showToast('You can only upload up to 5 images', 'error');
            return;
        }

        // Validate File Size (Max 5MB)
        const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
        if (invalidFiles.length > 0) {
            showToast('Each image must be less than 5MB', 'error');
            return;
        }

        const newPending = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        setPendingUploads(prev => [...prev, ...newPending]);

        setFormData(prev => {
            const newImageUrls = newPending.map(p => p.preview);
            const updatedImages = [...prev.images, ...newImageUrls];
            return {
                ...prev,
                images: updatedImages,
                img: prev.img || updatedImages[0] // Set main image if empty
            };
        });
    };

    const removeImage = (index) => {
        const imageToRemove = formData.images[index];

        setFormData(prev => {
            const newImages = prev.images.filter((_, i) => i !== index);
            return {
                ...prev,
                images: newImages,
                img: newImages.length > 0 ? newImages[0] : ''
            };
        });

        // If it was a pending upload, remove it from pending list as well to avoid memory leaks or confusion
        // (Though strict cleanup of ObjectURL is good practice, we rely on browser here for simplicity)
        if (imageToRemove.startsWith('blob:')) {
            setPendingUploads(prev => prev.filter(p => p.preview !== imageToRemove));
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        if (!formData.description?.trim()) newErrors.description = 'Description is required';

        if (!formData.price) {
            newErrors.price = 'Price is required';
        } else if (parseFloat(formData.price) <= 0) {
            newErrors.price = 'Price must be greater than 0';
        }

        // Compare price validation: Should be greater than selling price if set
        if (formData.originalPrice && parseFloat(formData.originalPrice) > 0) {
            if (parseFloat(formData.originalPrice) <= parseFloat(formData.price)) {
                newErrors.originalPrice = 'Compare price must be greater than regular price';
            }
        }

        if (!formData.category) newErrors.category = 'Category is required';
        // if (!formData.sku.trim()) newErrors.sku = 'SKU is required'; // Now Optional

        if (formData.inStock) {
            if (formData.stock === '' || formData.stock === null) {
                newErrors.stock = 'Stock count is required';
            } else if (parseInt(formData.stock) < 0) {
                newErrors.stock = 'Stock cannot be negative';
            }
        }

        // Dimensions & Weight Validation
        if (formData.weight && parseFloat(formData.weight) < 0) {
            showToast('Weight cannot be negative', 'error'); // Optional: show toast for non-critical or add to errors
            // Let's add to form block prevents submission
            // Since we don't have visual error field for weight in UI, we'll use Toast in handleSubmit or just block here
        }

        // Image validation
        const totalImages = formData.images.length + pendingUploads.length;
        if (totalImages === 0) newErrors.images = 'At least one image is required';

        setErrors(newErrors);

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = validate();

        if (Object.keys(formErrors).length > 0) {
            const firstErrorKey = Object.keys(formErrors)[0];
            const errorMessage = formErrors[firstErrorKey];

            showToast(`${errorMessage}`, 'error');

            // Scroll to the error
            const element = document.getElementById(firstErrorKey);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.focus();
            } else {
                // Fallback for elements that might not have direct ID match (like images container if not set)
                // Try finding by name attribute
                const elementByName = document.querySelector(`[name="${firstErrorKey}"]`);
                if (elementByName) {
                    elementByName.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    elementByName.focus();
                }
            }
            return;
        }

        setLoading(true);

        try {
            // Process images: upload pending ones and replace URLs
            const finalImages = [];
            for (const imgUrl of formData.images) {
                if (imgUrl.startsWith('blob:')) {
                    const pending = pendingUploads.find(p => p.preview === imgUrl);
                    if (pending) {
                        const uploadFormData = new FormData();
                        uploadFormData.append('file', pending.file);
                        const serverPath = await uploadImage(uploadFormData).unwrap();
                        finalImages.push(serverPath);
                    }
                } else {
                    finalImages.push(imgUrl);
                }
            }

            const finalData = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                images: finalImages,
                img: finalImages.length > 0 ? finalImages[0] : ''
            };

            await onSubmit(finalData);
        } catch (error) {
            console.error('Submission failed', error);
            let errMsg = error?.data?.message || error?.message || 'Failed to save product';

            // Handle Duplicate Key Error (MongoDB E11000)
            if (errMsg.includes('E11000') || errMsg.includes('duplicate key')) {
                if (errMsg.includes('sku')) {
                    errMsg = 'A product with this SKU already exists. Please use a unique SKU.';
                    setErrors(prev => ({ ...prev, sku: 'SKU already taken' }));
                }
            }

            showToast(errMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin/products')}
                    className="group p-2 bg-white/5 hover:bg-primary rounded-full text-light/60 hover:text-dark transition-all duration-300 hover:-translate-x-1"
                >
                    <span className="rotate-180 block transition-transform group-hover:scale-110">➜</span>
                </button>
                <h1 className="font-heading text-3xl text-light">{title}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-dark-paper border border-white/10 p-6 rounded-lg space-y-6">
                            <h2 className="text-lg font-heading text-light uppercase tracking-widest border-b border-light/10 pb-4">Basic Information</h2>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">
                                    Product Name <span className="text-red-500 ml-1">*</span>
                                </label>
                                <Input
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Diamond Solitaire Ring"
                                    error={errors.name}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">
                                        Price (₹) <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <Input
                                        type="number"
                                        name="price"
                                        required
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        error={errors.price}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Compare Price (₹)</label>
                                    <Input
                                        type="number"
                                        name="originalPrice"
                                        value={formData.originalPrice}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">
                                    SKU (Stock Keeping Unit) <span className="text-light/40 ml-1 text-[10px] lowercase tracking-wide"></span>
                                </label>
                                <Input
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    placeholder="e.g. RING-001"
                                    error={errors.sku}
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">
                                    Description <span className="text-red-500 ml-1">*</span>
                                </label>
                                <Textarea
                                    name="description"
                                    rows={5}
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Product description..."
                                    error={errors.description}
                                />
                            </div>
                        </div>

                        <div className="bg-dark-paper border border-white/10 p-6 rounded-lg space-y-6">
                            <h2 className="text-lg font-heading text-light uppercase tracking-widest border-b border-light/10 pb-4">Media (Max 5)</h2>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">
                                    Product Images <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div id="images" className={`border-2 border-dashed rounded-sm p-8 text-center hover:border-sidebar-gold/50 transition-colors relative ${errors.images ? 'border-red-500/50' : 'border-white/10'}`}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <Icons.Plus className="w-8 h-8 text-light/40 mx-auto mb-2" />
                                    <p className="text-sm text-light/60">Drag images or click to upload</p>
                                </div>
                                {errors.images && <p className="mt-1 text-xs text-red-400">{errors.images}</p>}

                                {formData.images.length > 0 && (
                                    <div className="grid grid-cols-5 gap-2 mt-4">
                                        {formData.images.map((img, idx) => (
                                            <div key={idx} className="relative aspect-square bg-white/5 rounded-sm overflow-hidden group border border-white/10">
                                                <PreviewableImage 
                                                    src={img} 
                                                    alt={`Product ${idx}`} 
                                                    containerClassName="w-full h-full"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Icons.Close className="w-3 h-3" />
                                                </button>
                                                {idx === 0 && (
                                                    <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-dark text-[10px] uppercase font-bold text-center py-0.5">Main</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-dark-paper border border-white/10 p-6 rounded-lg space-y-6">
                            <h2 className="text-lg font-heading text-light uppercase tracking-widest border-b border-light/10 pb-4">Settings</h2>

                            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                <div>
                                    <h3 className="text-sm font-medium text-light">In Stock</h3>
                                    <p className="text-xs text-light/50">Product is available for purchase</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="inStock"
                                        checked={formData.inStock}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            {formData.inStock && (
                                <div className="pb-4 border-b border-white/5">
                                    <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">
                                        Count In Stock <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <Input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        placeholder="0"
                                        min="0"
                                        error={errors.stock}
                                    />
                                </div>
                            )}

                            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                <div>
                                    <h3 className="text-sm font-medium text-light">New Arrival</h3>
                                    <p className="text-xs text-light/50">Mark as new arrival</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isNewArrival"
                                        checked={formData.isNewArrival}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-light">Featured Product</h3>
                                    <p className="text-xs text-light/50">Show in Featured Collection</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Organization */}
                    <div className="space-y-6">
                        <div className="bg-dark-paper border border-white/10 p-6 rounded-lg space-y-6">
                            <h2 className="text-lg font-heading text-light uppercase tracking-widest border-b border-light/10 pb-4">Organization</h2>

                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">
                                        Category <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        placeholder="Select Category"
                                        options={(attributes.categories && Array.isArray(attributes.categories) ? attributes.categories : []).map(cat => ({ value: cat.name, label: cat.name }))}
                                        error={errors.category}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/attributes', { state: { tab: 'categories' } })}
                                    className="p-3 bg-white/5 border border-white/10 rounded-sm hover:bg-primary hover:text-dark transition-colors text-light/60 mb-[1px]"
                                    title="Manage Categories"
                                >
                                    <Icons.Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Sub Category</label>
                                    <Select
                                        name="subCategory"
                                        value={formData.subCategory}
                                        onChange={handleChange}
                                        placeholder="Select Sub Category"
                                        options={(attributes.subCategories && Array.isArray(attributes.subCategories) ? attributes.subCategories : []).map(sub => ({ value: sub.name, label: sub.name }))}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/attributes', { state: { tab: 'subCategories' } })}
                                    className="p-3 bg-white/5 border border-white/10 rounded-sm hover:bg-primary hover:text-dark transition-colors text-light/60 mb-[1px]"
                                    title="Manage Sub Categories"
                                >
                                    <Icons.Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Collection</label>
                                    <Select
                                        name="collection"
                                        value={formData.collection}
                                        onChange={handleChange}
                                        placeholder="Select Collection"
                                        options={(attributes.collections && Array.isArray(attributes.collections) ? attributes.collections : []).map(col => ({ value: col.name, label: col.name }))}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/attributes', { state: { tab: 'collections' } })}
                                    className="p-3 bg-white/5 border border-white/10 rounded-sm hover:bg-primary hover:text-dark transition-colors text-light/60 mb-[1px]"
                                    title="Manage Collections"
                                >
                                    <Icons.Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Tags (Comma Separated)</label>
                                <Input
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="e.g. Summer, Gift, Sale"
                                />
                            </div>
                        </div>

                        <div className="bg-dark-paper border border-white/10 p-6 rounded-lg space-y-6">
                            <h2 className="text-lg font-heading text-light uppercase tracking-widest border-b border-light/10 pb-4">Attributes</h2>

                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Color</label>
                                    <Select
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        placeholder="Select Color"
                                        options={(attributes.colors && Array.isArray(attributes.colors) ? attributes.colors : []).map(col => ({ value: col.name, label: col.name }))}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/attributes', { state: { tab: 'colors' } })}
                                    className="p-3 bg-white/5 border border-white/10 rounded-sm hover:bg-primary hover:text-dark transition-colors text-light/60 mb-[1px]"
                                    title="Manage Colors"
                                >
                                    <Icons.Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Material</label>
                                    <Select
                                        name="material"
                                        value={formData.material}
                                        onChange={handleChange}
                                        placeholder="Select Material"
                                        options={(attributes.materials && Array.isArray(attributes.materials) ? attributes.materials : []).map(mat => ({ value: mat.name, label: mat.name }))}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/attributes', { state: { tab: 'materials' } })}
                                    className="p-3 bg-white/5 border border-white/10 rounded-sm hover:bg-primary hover:text-dark transition-colors text-light/60 mb-[1px]"
                                    title="Manage Materials"
                                >
                                    <Icons.Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Occasion</label>
                                    <Select
                                        name="occasion"
                                        value={formData.occasion}
                                        onChange={handleChange}
                                        placeholder="Select Occasion"
                                        options={(attributes.occasions && Array.isArray(attributes.occasions) ? attributes.occasions : []).map(occ => ({ value: occ.name, label: occ.name }))}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/attributes', { state: { tab: 'occasions' } })}
                                    className="p-3 bg-white/5 border border-white/10 rounded-sm hover:bg-primary hover:text-dark transition-colors text-light/60 mb-[1px]"
                                    title="Manage Occasions"
                                >
                                    <Icons.Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-dark-paper border border-white/10 p-6 rounded-lg space-y-6">
                            <h2 className="text-lg font-heading text-light uppercase tracking-widest border-b border-light/10 pb-4">Shipping & SEO</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Weight (g)</label>
                                    <Input
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        placeholder="0"
                                        step={"0.1"}
                                    />
                                </div>
                                <div className="grid gap-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Length</label>
                                        <Input
                                            type="number"
                                            value={formData.dimensions.length}
                                            onChange={(e) => setFormData(prev => ({ ...prev, dimensions: { ...prev.dimensions, length: e.target.value } }))}
                                            placeholder="Length"
                                            step={"0.1"}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Width</label>
                                        <Input
                                            type="number"
                                            value={formData.dimensions.width}
                                            onChange={(e) => setFormData(prev => ({ ...prev, dimensions: { ...prev.dimensions, width: e.target.value } }))}
                                            placeholder="Width"
                                            step={"0.1"}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Height</label>
                                        <Input
                                            type="number"
                                            value={formData.dimensions.height}
                                            onChange={(e) => setFormData(prev => ({ ...prev, dimensions: { ...prev.dimensions, height: e.target.value } }))}
                                            placeholder="Height"
                                            step={"0.1"}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Meta Title</label>
                                    <Input
                                        value={formData.meta.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, meta: { ...prev.meta, title: e.target.value } }))}
                                        placeholder="SEO Title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Meta Description</label>
                                    <Textarea
                                        rows={2}
                                        value={formData.meta.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, meta: { ...prev.meta, description: e.target.value } }))}
                                        placeholder="SEO Description"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-white/10">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="px-6 py-3 text-sm uppercase tracking-wider text-light/60 hover:text-light transition-colors mr-4"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-dark font-bold uppercase tracking-widest px-8 py-3 hover:bg-white transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <div className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></div>}
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </form >
        </div >
    );
};

export default ProductForm;
