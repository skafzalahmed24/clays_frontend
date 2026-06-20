/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Icons from '../../components/ui/Icons';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import PreviewableImage from '../../components/ui/PreviewableImage';
import { useGetAttributesQuery, useAddAttributeMutation, useUpdateAttributeMutation, useDeleteAttributeMutation } from '../../store/api/attributeApiSlice';
import { useUploadImageMutation } from '../../store/api/contentApiSlice';
// import { API_URL } from '../../utils/apiConfig';

import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const AdminAttributes = () => {
    const dispatch = useDispatch();
    const { data: attributesData, isLoading } = useGetAttributesQuery();
    const [addAttribute, { isLoading: isAdding }] = useAddAttributeMutation();
    const [updateAttribute, { isLoading: isUpdating }] = useUpdateAttributeMutation();
    const [deleteAttribute] = useDeleteAttributeMutation();
    const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

    // Context replacement: safe merge with defaults to prevent undefined access
    const attributes = {
        categories: [],
        subCategories: [],
        colors: [],
        materials: [],
        occasions: [],
        ...(attributesData || {})
    };

    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'categories');


    // Form State
    const [newItem, setNewItem] = useState('');
    const [newColorCode, setNewColorCode] = useState('#000000');
    const [newDescription, setNewDescription] = useState('');
    const [newImage, setNewImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [newParentCategory, setNewParentCategory] = useState('');

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editItem, setEditItem] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setNewItem('');
        setNewColorCode('#000000');
        setNewDescription('');
        setNewImage(null);
        setImagePreview('');
        setNewParentCategory('');
        setIsEditing(false);
        setEditItem(null);
        if (document.getElementById('fileInput')) {
            document.getElementById('fileInput').value = '';
        }
    };

    // Sync tab if navigation state changes
    // eslint-disable-next-line
    useEffect(() => {
        if (location.state?.tab && location.state.tab !== activeTab) {
            setActiveTab(location.state.tab);
            resetForm();
        }
    }, [location.state?.tab]);

    const handleEditClick = (item) => {
        setIsEditing(true);
        setEditItem(item);

        if (activeTab === 'colors') {
            setNewItem(item.name);
            setNewColorCode(item.hex);
        } else if (activeTab === 'categories') {
            setNewItem(item.name);
            setImagePreview(item.img); // Use existing URL
        } else if (activeTab === 'subCategories') {
            setNewItem(item.name);
            setNewParentCategory(item.value || '');
        } else {
            // For others (materials, occasions), item is now an object {id, name, value}
            // We just edit the name
            setNewItem(item.name);
        }
    };

    const uploadFileHandler = async () => {
        if (!newImage) return null;
        const formData = new FormData();
        formData.append('file', newImage);
        try {
            const result = await uploadImage(formData).unwrap();
            return result;
        } catch (error) {
            console.error(error);
            showToast('Image upload failed', 'error');
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // VALDATION
        if (!newItem.trim()) {
            showToast('Name is required', 'error');
            return;
        }

        // Image validation for Categories
        if ((activeTab === 'categories') && !imagePreview && !newImage) {
            showToast('Image is required', 'error');
            return;
        }

        let imgUrl = imagePreview;
        // If there's a new file selected, upload it
        if (newImage) {
            const uploadedPath = await uploadFileHandler();
            if (uploadedPath) {
                imgUrl = uploadedPath;
            } else {
                return; // Upload failed
            }
        }

        const commonPayload = {
            type: activeTab,
            name: newItem,
            value: newItem // Default value
        };

        if (activeTab === 'colors') {
            commonPayload.value = newColorCode;
        } else if (activeTab === 'subCategories') {
            if (!newParentCategory) {
                showToast('Parent Category is required', 'error');
                return;
            }
            commonPayload.value = newParentCategory;
        } else if (activeTab === 'categories') {
            commonPayload.img = imgUrl || 'https://via.placeholder.com/150';
            // Categories don't need 'value' field usually but backend schema might stick it
        }

        try {
            if (isEditing) {
                await updateAttribute({ id: editItem.id, ...commonPayload }).unwrap();
                showToast(`${activeTab.slice(0, -1)} updated`, 'success');
            } else {
                await addAttribute(commonPayload).unwrap();
                showToast(`${newItem} added to ${activeTab}`, 'success');
            }


            resetForm();
        } catch (error) {
            console.error('Operation failed', error);
            showToast('Failed to save attribute', 'error');
        }
    };

    const handleDelete = async (item) => {
        // Items are now always objects with IDs
        if (await confirm(`Delete ${item.name}`, `Are you sure you want to delete ${item.name}?`, { isDangerous: true, confirmText: 'Delete' })) {
            try {
                await deleteAttribute(item.id).unwrap();
                showToast('Item deleted', 'success');

            } catch (error) {
                showToast('Failed to delete item', 'error');
            }
        }
    };

    const tabs = [
        { id: 'categories', label: 'Categories' },
        { id: 'subCategories', label: 'Sub Categories' },
        { id: 'colors', label: 'Colors' },
        { id: 'materials', label: 'Materials' },
        { id: 'occasions', label: 'Occasions' }
    ];

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8">
                <h1 className="font-heading text-3xl text-light">Attributes</h1>
            </div>

            {/* Tabs */}
            <div className="flex flex-nowrap gap-2 border-b border-light/10 mb-8 overflow-x-auto pb-px scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); resetForm(); }}
                        className={`px-6 py-3 text-sm uppercase tracking-wider font-medium transition-colors relative whitespace-nowrap shrink-0 ${activeTab === tab.id ? 'text-primary' : 'text-light/60 hover:text-light'
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-dark-paper border border-white/10 rounded-lg p-6">
                <form onSubmit={handleSubmit} className="mb-8 p-4 bg-white/5 rounded-sm border border-white/5">
                    <h3 className="text-sm font-bold uppercase text-light/80 mb-4">{isEditing ? 'Edit Item' : 'Add New Item'}</h3>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-start">
                            {/* Inputs based on type */}
                            <div className="flex-1 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-light/60 block">Name *</label>
                                    <Input
                                        value={newItem}
                                        onChange={(e) => setNewItem(e.target.value)}
                                        placeholder="Name *"
                                        required
                                    />
                                </div>

                                {activeTab === 'subCategories' && (
                                    <div className="space-y-1">
                                        <label className="text-xs text-light/60 block">Parent Category *</label>
                                        <select
                                            value={newParentCategory}
                                            onChange={(e) => setNewParentCategory(e.target.value)}
                                            className="w-full bg-transparent border-b border-white/20 pb-2 text-light placeholder-light/30 focus:outline-none focus:border-primary transition-colors disabled:opacity-50 appearance-none rounded-none"
                                            required
                                        >
                                            <option value="" className="bg-dark text-light/50">Select Parent Category</option>
                                            {(attributes.categories || []).map(cat => (
                                                <option key={cat.id} value={cat.name} className="bg-dark text-light">{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {activeTab === 'categories' && (
                                    <div className="space-y-2">
                                        <label className="text-xs text-light/60 block">Image *</label>
                                        <div className="flex gap-4 items-center">
                                            <input
                                                id="fileInput"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="text-sm text-light/60"
                                            />
                                            {imagePreview && (
                                                <div className="w-16 h-16 rounded-sm overflow-hidden border border-white/10 shrink-0">
                                                    <PreviewableImage
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        containerClassName="w-full h-full"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {activeTab === 'colors' && (
                                <div className="space-y-1">
                                    <label className="text-xs text-light/60 block">Color</label>
                                    <input
                                        type="color"
                                        value={newColorCode}
                                        onChange={(e) => setNewColorCode(e.target.value)}
                                        className="w-12 h-11 p-1 bg-white/5 border border-white/20 rounded-sm cursor-pointer"
                                        title="Choose Color"
                                    />
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <div className="space-y-1">
                                    <label className="text-xs text-transparent block select-none">Action</label>
                                    <button
                                        type="submit"
                                        disabled={!newItem.trim() || isAdding || isUpdating || isUploading}
                                        className="bg-primary text-dark font-bold uppercase tracking-widest px-6 py-3 hover:bg-white transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {isAdding || isUpdating || isUploading ? 'Saving...' : (isEditing ? 'Update' : 'Add')}
                                    </button>
                                </div>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="text-xs text-light/50 hover:text-light underline"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>

                <h3 className="text-sm font-bold uppercase text-light/80 mb-4">Previously Added Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {attributes[activeTab].map((item, idx) => {
                        // All items are now objects
                        const name = item.name;
                        const hex = (activeTab === 'colors') ? item.hex : null;
                        const img = (activeTab === 'categories') ? item.img : null;
                        const parent = (activeTab === 'subCategories') ? item.value : null;

                        return (
                            <div
                                key={item.id || idx}
                                className={`flex items-center justify-between p-3 bg-white/5 border rounded-sm group transition-all ${isEditing && editItem.id === item.id ? 'border-primary' : 'border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {hex && (
                                        <div
                                            className="w-10 h-10 rounded-sm border border-white/20 shrink-0 shadow-inner"
                                            style={{ backgroundColor: hex }}
                                        ></div>
                                    )}
                                    {img && (
                                        <div className="w-10 h-10 rounded-sm overflow-hidden border border-white/10 shrink-0">
                                            <PreviewableImage
                                                src={img}
                                                alt={name}
                                                containerClassName="w-full h-full"
                                            />
                                        </div>
                                    )}
                                    <div className="overflow-hidden">
                                        <div className="flex flex-col">
                                            <span className="text-light font-medium truncate">{name}</span>
                                            {hex && <span className="text-light/40 text-[10px] font-mono uppercase leading-tight">{hex}</span>}
                                        </div>
                                        {parent && <span className="text-primary text-xs block truncate mt-1 border border-primary/30 rounded px-1.5 py-0.5 inline-block">Parent: {parent}</span>}
                                    </div>
                                </div>

                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEditClick(item)}
                                        className="p-2 hover:bg-white/5 rounded-md"
                                        style={{ color: 'var(--color-primary)' }}
                                        title="Edit"
                                        type="button"
                                    >
                                        <Icons.Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item)}
                                        className="p-2 hover:bg-red-500/10 rounded-md"
                                        style={{ color: '#f87171' }}
                                        title="Delete"
                                        type="button"
                                    >
                                        <Icons.Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {attributes[activeTab].length === 0 && (
                        <div className="col-span-full text-center py-8 text-light/30 italic">
                            No items found. Add some above!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAttributes;
