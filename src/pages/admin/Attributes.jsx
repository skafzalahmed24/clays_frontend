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
        ...(attributesData || {})
    };

    const tabs = [
        { id: 'categories', label: 'Categories' },
        { id: 'subCategories', label: 'Sub Categories' }
    ];

    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(
        tabs.some(t => t.id === location.state?.tab) ? location.state.tab : 'categories'
    );

    // Form State
    const [newItem, setNewItem] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newImage, setNewImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [newBannerImage, setNewBannerImage] = useState(null);
    const [bannerPreview, setBannerPreview] = useState('');
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

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewBannerImage(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setNewItem('');
        setNewDescription('');
        setNewImage(null);
        setImagePreview('');
        setNewBannerImage(null);
        setBannerPreview('');
        setNewParentCategory('');
        setIsEditing(false);
        setEditItem(null);
        if (document.getElementById('fileInput')) {
            document.getElementById('fileInput').value = '';
        }
        if (document.getElementById('bannerFileInput')) {
            document.getElementById('bannerFileInput').value = '';
        }
    };

    // Sync tab if navigation state changes
    // eslint-disable-next-line
    useEffect(() => {
        if (location.state?.tab && tabs.some(t => t.id === location.state.tab) && location.state.tab !== activeTab) {
            setActiveTab(location.state.tab);
            resetForm();
        }
    }, [location.state?.tab]);

    const handleEditClick = (item) => {
        setIsEditing(true);
        setEditItem(item);

        if (activeTab === 'categories') {
            setNewItem(item.name);
            setImagePreview(item.img || '');
            setBannerPreview(item.bannerImage || '');
        } else if (activeTab === 'subCategories') {
            setNewItem(item.name);
            setNewParentCategory(item.value || '');
        } else {
            setNewItem(item.name);
        }
    };

    const uploadSingleFile = async (file) => {
        if (!file) return null;
        const formData = new FormData();
        formData.append('file', file);
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

        // VALIDATION
        if (!newItem.trim()) {
            showToast('Name is required', 'error');
            return;
        }

        // Image validation for Categories
        if (activeTab === 'categories' && !imagePreview && !newImage) {
            showToast('Category Thumbnail Image is required', 'error');
            return;
        }

        let imgUrl = imagePreview;
        if (newImage) {
            const uploadedPath = await uploadSingleFile(newImage);
            if (uploadedPath) {
                imgUrl = uploadedPath;
            } else {
                return; // Upload failed
            }
        }

        let bannerUrl = bannerPreview;
        if (newBannerImage) {
            const uploadedBanner = await uploadSingleFile(newBannerImage);
            if (uploadedBanner) {
                bannerUrl = uploadedBanner;
            } else {
                return; // Upload failed
            }
        }

        const commonPayload = {
            type: activeTab,
            name: newItem,
            value: newItem // Default value
        };

        if (activeTab === 'subCategories') {
            if (!newParentCategory) {
                showToast('Parent Category is required', 'error');
                return;
            }
            commonPayload.value = newParentCategory;
        } else if (activeTab === 'categories') {
            commonPayload.img = imgUrl || '';
            commonPayload.bannerImage = bannerUrl || '';
        }

        try {
            if (isEditing) {
                await updateAttribute({ id: editItem.id, ...commonPayload }).unwrap();
                showToast(`${activeTab.slice(0, -1)} updated successfully`, 'success');
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
        if (await confirm(`Delete ${item.name}`, `Are you sure you want to delete ${item.name}?`, { isDangerous: true, confirmText: 'Delete' })) {
            try {
                await deleteAttribute(item.id).unwrap();
                showToast('Item deleted', 'success');
            } catch (error) {
                showToast('Failed to delete item', 'error');
            }
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8">
                <div>
                    <h1 className="font-heading text-3xl text-light">Attributes</h1>
                    <p className="text-light/50 text-xs mt-1">Manage categories and sub-categories</p>
                </div>
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
                <form onSubmit={handleSubmit} className="mb-8 p-5 bg-white/5 rounded-sm border border-white/5">
                    <h3 className="text-sm font-bold uppercase text-light/80 mb-4">{isEditing ? `Edit ${activeTab.slice(0, -1)}` : `Add New ${activeTab.slice(0, -1)}`}</h3>

                    <div className="flex flex-col gap-6">
                        <div className="space-y-4">
                            {/* Name Input */}
                            <div className="space-y-1">
                                <label className="text-xs text-light/60 block font-medium">Name *</label>
                                <Input
                                    value={newItem}
                                    onChange={(e) => setNewItem(e.target.value)}
                                    placeholder={activeTab === 'categories' ? "e.g. Hair Care, Skin Care" : "Name *"}
                                    required
                                    className="bg-black/40 border-white/10 text-light focus:border-primary"
                                />
                            </div>

                            {/* SubCategory Parent Selection */}
                            {activeTab === 'subCategories' && (
                                <div className="space-y-1">
                                    <label className="text-xs text-light/60 block font-medium">Parent Category *</label>
                                    <select
                                        value={newParentCategory}
                                        onChange={(e) => setNewParentCategory(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 p-3 rounded text-light focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                                        required
                                    >
                                        <option value="" className="bg-dark text-light/50">Select Parent Category</option>
                                        {(attributes.categories || []).map(cat => (
                                            <option key={cat.id} value={cat.name} className="bg-dark text-light">{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Category Images (Thumbnail + Banner) */}
                            {activeTab === 'categories' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                    {/* 1. Category Circle / Icon Thumbnail */}
                                    <div className="p-4 bg-black/30 border border-white/10 rounded-sm space-y-3">
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-wider text-light block">
                                                Category Thumbnail (Icon/Circle) *
                                            </label>
                                            <p className="text-[11px] text-light/40 mt-0.5">
                                                Displayed in homepage round category circles and shop grids.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <input
                                                id="fileInput"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="text-xs text-light/70 file:mr-3 file:py-2 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-bold file:bg-primary file:text-dark hover:file:bg-white file:cursor-pointer cursor-pointer"
                                            />
                                            {imagePreview && (
                                                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/50 shrink-0 bg-black/40">
                                                    <PreviewableImage
                                                        src={imagePreview}
                                                        alt="Thumbnail Preview"
                                                        containerClassName="w-full h-full"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 2. Category Header Banner Image */}
                                    <div className="p-4 bg-black/30 border border-white/10 rounded-sm space-y-3">
                                        <div>
                                            <label className="text-xs font-bold uppercase tracking-wider text-light block flex items-center justify-between">
                                                <span>Category Page Banner (Header)</span>
                                                <span className="text-[10px] text-primary lowercase tracking-normal font-normal">Optional</span>
                                            </label>
                                            <p className="text-[11px] text-light/40 mt-0.5">
                                                Full-width top header banner on category product listing.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <input
                                                id="bannerFileInput"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleBannerChange}
                                                className="text-xs text-light/70 file:mr-3 file:py-2 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-bold file:bg-white/20 file:text-white hover:file:bg-primary hover:file:text-dark file:cursor-pointer cursor-pointer"
                                            />
                                            {bannerPreview ? (
                                                <div className="relative w-24 h-12 rounded-sm overflow-hidden border border-white/20 shrink-0 bg-black/40">
                                                    <PreviewableImage
                                                        src={bannerPreview}
                                                        alt="Banner Preview"
                                                        containerClassName="w-full h-full"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-light/30 italic">No banner (uses dark style)</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Submit Actions */}
                        <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                            <button
                                type="submit"
                                disabled={!newItem.trim() || isAdding || isUpdating || isUploading}
                                className="bg-primary text-dark font-bold uppercase tracking-widest px-8 py-3 hover:bg-white transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            >
                                {isAdding || isUpdating || isUploading ? 'Saving...' : (isEditing ? 'Update Item' : 'Add Item')}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 text-xs text-light/60 hover:text-white uppercase tracking-wider transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                <h3 className="text-sm font-bold uppercase text-light/80 mb-4">Previously Added Items ({(attributes[activeTab] || []).length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(attributes[activeTab] || []).map((item, idx) => {
                        const name = item.name;
                        const img = (activeTab === 'categories') ? item.img : null;
                        const bannerImg = (activeTab === 'categories') ? item.bannerImage : null;
                        const parent = (activeTab === 'subCategories') ? item.value : null;

                        return (
                            <div
                                key={item.id || idx}
                                className={`flex items-center justify-between p-3.5 bg-white/5 border rounded-sm group transition-all ${isEditing && editItem.id === item.id ? 'border-primary shadow-lg shadow-primary/10' : 'border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                                    {img && (
                                        <div className="w-11 h-11 rounded-full overflow-hidden border border-white/20 shrink-0 bg-black/50">
                                            <PreviewableImage
                                                src={img}
                                                alt={name}
                                                containerClassName="w-full h-full"
                                            />
                                        </div>
                                    )}
                                    <div className="overflow-hidden min-w-0">
                                        <div className="flex flex-col">
                                            <span className="text-light font-medium truncate text-sm">{name}</span>
                                        </div>
                                        {parent && <span className="text-primary text-xs block truncate mt-1 border border-primary/30 rounded px-1.5 py-0.5 inline-block">Parent: {parent}</span>}
                                        {activeTab === 'categories' && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-light/40 bg-white/5 px-1.5 py-0.5 rounded">Icon: Yes</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${bannerImg ? 'text-primary bg-primary/10' : 'text-light/30 bg-white/5'}`}>
                                                    {bannerImg ? 'Banner: Custom' : 'Banner: Dark (Default)'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-1 shrink-0 ml-2">
                                    <button
                                        onClick={() => handleEditClick(item)}
                                        className="p-2 hover:bg-white/5 rounded-md transition-colors"
                                        style={{ color: 'var(--color-primary)' }}
                                        title="Edit"
                                        type="button"
                                    >
                                        <Icons.Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item)}
                                        className="p-2 hover:bg-red-500/10 rounded-md transition-colors"
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

                    {(!attributes[activeTab] || attributes[activeTab].length === 0) && (
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
