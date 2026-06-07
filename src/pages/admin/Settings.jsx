import React, { useState, useEffect } from 'react';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../store/api/contentApiSlice';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Icons from '../../components/ui/Icons';
import { REGEX } from '../../utils/regex';
import { useConfirm } from '../../context/ConfirmContext';

const AdminSettings = () => {
    const { data: remoteSettings, isLoading: loading } = useGetSettingsQuery();
    const [updateSettings, { isLoading: saving }] = useUpdateSettingsMutation();
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [activeTab, setActiveTab] = useState('general');

    // Form State
    const [formData, setFormData] = useState({
        storeName: 'Mershai',
        supportEmail: '',
        contactPhone: '',
        addresses: [],
        socialLinks: {
            instagram: '',
            facebook: '',
            youtube: ''
        },

        taxRate: '18',
        enableReviews: true,
        // Migrated from Content.jsx
        openingHours: [],
        footerLinks: [],
        contactSubjects: [],
        announcement: { text: '', link: '' },
        productPolicies: { shipping: '', care: '' },

        uiLabels: {
            search: { placeholder: '', popularTerms: [], noResults: '' },
            cart: { emptyMessage: '', startShoppingBtn: '', disclaimer: '' },
            auth: { loginTitle: '', loginSubtitle: '', registerTitle: '', registerSubtitle: '' },
            product: { relatedTitle: '', reviewsTitle: '' }
        }
    });

    useEffect(() => {
        if (remoteSettings) {
            setFormData(prev => {
                // Initialize if storeName is still default or some other indicator
                // We use a simple check to prevent overwriting user edits after first load
                if (prev.supportEmail === '') {
                    return {
                        ...prev,
                        ...remoteSettings,
                        taxRate: remoteSettings.taxRate || '18',
                        addresses: remoteSettings.addresses || [],
                        socialLinks: { ...prev.socialLinks, ...(remoteSettings.socialLinks || {}) },
                        announcement: remoteSettings.announcement || { text: '', link: '' },
                        productPolicies: remoteSettings.productPolicies || { shipping: '', care: '' },
                        uiLabels: remoteSettings.uiLabels || {
                            search: { placeholder: '', popularTerms: [], noResults: '' },
                            cart: { emptyMessage: '', startShoppingBtn: '', disclaimer: '' },
                            auth: { loginTitle: '', loginSubtitle: '', registerTitle: '', registerSubtitle: '' },
                            product: { relatedTitle: '', reviewsTitle: '' }
                        },
                        openingHours: remoteSettings.openingHours || [],
                        footerLinks: remoteSettings.footerLinks || [],
                        contactSubjects: remoteSettings.contactSubjects || []
                    };
                }
                return prev;
            });
        }
    }, [remoteSettings]);

    const handleSave = async () => {

        // Validation

        // 1. Required Fields & Email Format
        if (!formData.storeName.trim() || !formData.supportEmail.trim()) {
            showToast('Store Name and Support Email are required', 'error');
            return;
        }
        if (!REGEX.EMAIL.test(formData.supportEmail)) {
            showToast('Invalid Support Email format', 'error');
            return;
        }

        // 2. Opening Hours (Empty check)
        if (formData.openingHours && formData.openingHours.some(h => !h.label.trim() || !h.value.trim())) {
            showToast('Please fill in all opening hours fields (Day and Time)', 'error');
            return;
        }

        // 3. Contact Subjects (Empty check)
        if (formData.contactSubjects && formData.contactSubjects.some(s => !s.trim())) {
            showToast('Please fill in all contact subjects', 'error');
            return;
        }

        // 4. URLs (Social & Maps)
        const socialKeys = ['instagram', 'facebook', 'youtube'];
        for (const key of socialKeys) {
            const val = formData.socialLinks?.[key];
            if (val && val !== '#' && !REGEX.URL.test(val)) {
                showToast(`Invalid URL for ${key.charAt(0).toUpperCase() + key.slice(1)} (must start with http:// or https://)`, 'error');
                return;
            }
        }

        // 5. Locations Validation (Pincode & Maps)
        if (formData.addresses && formData.addresses.length > 0) {
            for (let i = 0; i < formData.addresses.length; i++) {
                const addr = formData.addresses[i];
                if (addr.googleMapsUrl && !REGEX.URL.test(addr.googleMapsUrl)) {
                    showToast(`Invalid Google Maps URL for Location #${i + 1} (must start with http:// or https://)`, 'error');
                    return;
                }
                if (addr.pincode && !REGEX.DIGITS.test(addr.pincode)) {
                    showToast(`Pincode must be a valid number for Location #${i + 1}`, 'error');
                    return;
                }
            }
        }

        // 6. Numeric Fields (Tax)
        if (formData.taxRate && (isNaN(formData.taxRate) || Number(formData.taxRate) < 0)) {
            showToast('Tax Rate must be a non-negative number', 'error');
            return;
        }
        try {
            await updateSettings(formData).unwrap();
            showToast('Settings saved successfully', 'success');
        } catch (error) {
            showToast(error?.data?.message || 'Failed to save settings', 'error');
        }
    };
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Handle nested properties (address.city, socialLinks.instagram)
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => {
                // Special handling for deeply nested updates if needed, but 2-level is common
                // Handle nested deep objects like uiLabels.search.placeholder
                if (parent === 'uiLabels') {
                    // This simple split only handles 2 levels. For deeply nested 'uiLabels.search.placeholder', we need recursive update or direct object manipulation
                    // Given the structure, let's use a more robust update for specific known deep fields if generic Handler fails, 
                    // OR stick to the specialized handlers for UI Labels if we create them.
                    // For now, let's assuming generic handler primarily for flat or 1-level deep. 
                    // We will implement specific handlers for UI labels below or inline.
                    return prev;
                }

                return {
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value
                    }
                };
            });
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    // --- Footer Helpers ---
    // Footer link helpers below were noted as unused 
    /*
    const handleAddFooterSection = () => {
        setFormData(prev => ({
            ...prev,
            footerLinks: [...prev.footerLinks, { title: 'New Section', links: [] }]
        }));
    };

    const handleRemoveFooterSection = async (index) => {
        if (await confirm('Remove Footer Section', 'Are you sure you want to remove this footer section?')) {
            const updated = [...formData.footerLinks];
            updated.splice(index, 1);
            setFormData(prev => ({ ...prev, footerLinks: updated }));
        }
    };

    const handleFooterSectionTitleChange = (index, value) => {
        const updated = [...formData.footerLinks];
        updated[index] = { ...updated[index], title: value };
        setFormData(prev => ({ ...prev, footerLinks: updated }));
    };

    const handleAddFooterLink = (sectionIndex) => {
        const updated = [...formData.footerLinks];
        updated[sectionIndex] = { ...updated[sectionIndex], links: [...updated[sectionIndex].links, { label: 'New Link', url: '/' }] };
        setFormData(prev => ({ ...prev, footerLinks: updated }));
    };

    const handleRemoveFooterLink = (sectionIndex, linkIndex) => {
        const updated = [...formData.footerLinks];
        updated[sectionIndex].links.splice(linkIndex, 1);
        setFormData(prev => ({ ...prev, footerLinks: updated }));
    };

    const handleFooterLinkChange = (sectionIndex, linkIndex, field, value) => {
        const updated = [...formData.footerLinks];
        const updatedLinks = [...updated[sectionIndex].links];
        updatedLinks[linkIndex] = { ...updatedLinks[linkIndex], [field]: value };
        updated[sectionIndex] = { ...updated[sectionIndex], links: updatedLinks };
        setFormData(prev => ({ ...prev, footerLinks: updated }));
    };
    */

    // --- Contact Helpers ---
    const handleAddOpeningHours = () => {
        setFormData(prev => ({
            ...prev,
            openingHours: [...prev.openingHours, { label: '', value: '' }]
        }));
    };

    const handleRemoveOpeningHours = (index) => {
        const updated = [...formData.openingHours];
        updated.splice(index, 1);
        setFormData(prev => ({ ...prev, openingHours: updated }));
    };

    const handleOpeningHoursChange = (index, field, value) => {
        const updated = [...formData.openingHours];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, openingHours: updated }));
    };

    const handleAddSubject = () => {
        setFormData(prev => ({
            ...prev,
            contactSubjects: [...prev.contactSubjects, '']
        }));
    };

    const handleRemoveSubject = (index) => {
        const updated = [...formData.contactSubjects];
        updated.splice(index, 1);
        setFormData(prev => ({ ...prev, contactSubjects: updated }));
    };

    const handleSubjectChange = (index, value) => {
        const updated = [...formData.contactSubjects];
        updated[index] = value;
        setFormData(prev => ({ ...prev, contactSubjects: updated }));
    };

    // --- Location Helpers ---
    const handleAddAddress = () => {
        setFormData(prev => ({
            ...prev,
            addresses: [...prev.addresses, { line1: '', line2: '', city: '', pincode: '', country: 'India', googleMapsUrl: '' }]
        }));
    };

    const handleRemoveAddress = async (index) => {
        if (await confirm('Remove Boutique Location', 'Are you sure you want to remove this boutique location?')) {
            const updated = [...formData.addresses];
            updated.splice(index, 1);
            setFormData(prev => ({ ...prev, addresses: updated }));
        }
    };

    const handleAddressChange = (index, field, value) => {
        const updated = [...formData.addresses];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, addresses: updated }));
    };

    if (loading && !remoteSettings) {
        return <div className="p-8 text-center">Loading settings...</div>;
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8">
                <h1 className="font-heading text-3xl text-light">Settings</h1>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 mb-8 overflow-x-auto pb-1 gap-2">
                {['General', 'Location', 'Social', 'Payment', 'Interface', 'Policies', 'Preferences'].map((tab) => (
                    <button
                        key={tab}
                        className={`px-4 py-3 font-medium text-sm transition-all relative whitespace-nowrap rounded-t-md ${activeTab === tab.toLowerCase()
                            ? 'text-primary bg-white/5 border-b-2 border-primary'
                            : 'text-light/60 hover:text-light hover:bg-white/5'
                            }`}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-dark-paper border border-white/10 rounded-lg p-8 min-h-[400px]">
                {activeTab === 'general' && (
                    <div className="space-y-8 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Store Name</label>
                                <Input
                                    name="storeName"
                                    value={formData.storeName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Support Email</label>
                                <Input
                                    type="email"
                                    name="supportEmail"
                                    value={formData.supportEmail}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Contact Phone</label>
                                <Input
                                    name="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Opening Hours */}
                        <div className="p-4 border border-white/5 rounded bg-body/30">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-light/80 uppercase">Opening Hours</h4>
                                <button type="button" onClick={handleAddOpeningHours} className="text-xs text-primary border border-primary px-2 py-1 rounded hover:bg-primary hover:text-dark transition-colors">+ Add</button>
                            </div>
                            <div className="space-y-3">
                                {(!formData.openingHours || formData.openingHours.length === 0) && (
                                    <p className="text-xs text-light/40 italic">No opening hours added.</p>
                                )}
                                {(formData.openingHours || []).map((hour, index) => (
                                    <div key={index} className="flex gap-3 items-center">
                                        <div className="w-1/3">
                                            <Input
                                                type="text"
                                                placeholder="Day (e.g. Mon - Sat)"
                                                value={hour.label}
                                                onChange={(e) => handleOpeningHoursChange(index, 'label', e.target.value)}
                                            />
                                        </div>
                                        <div className="w-1/2">
                                            <Input
                                                type="text"
                                                placeholder="Time (7 AM - 9 PM)"
                                                value={hour.value}
                                                onChange={(e) => handleOpeningHoursChange(index, 'value', e.target.value)}
                                            />
                                        </div>
                                        <button type="button" onClick={() => handleRemoveOpeningHours(index)} className="text-red-500 hover:text-red-400 p-2">
                                            <Icons.Trash size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Form Subjects */}
                        <div className="p-4 border border-white/5 rounded bg-body/30">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-bold text-light/80 uppercase">Contact Form Subjects</h4>
                                <button type="button" onClick={handleAddSubject} className="text-xs text-primary border border-primary px-2 py-1 rounded hover:bg-primary hover:text-dark transition-colors">+ Add</button>
                            </div>
                            <div className="space-y-3">
                                {(!formData.contactSubjects || formData.contactSubjects.length === 0) && (
                                    <p className="text-xs text-light/40 italic">No subjects added.</p>
                                )}
                                {(formData.contactSubjects || []).map((subject, index) => (
                                    <div key={index} className="flex gap-3 items-center">
                                        <div className="flex-1">
                                            <Input
                                                type="text"
                                                value={subject}
                                                onChange={(e) => handleSubjectChange(index, e.target.value)}
                                                placeholder="Subject (e.g. Order Inquiry)"
                                            />
                                        </div>
                                        <button type="button" onClick={() => handleRemoveSubject(index)} className="text-red-500 hover:text-red-400 p-2">
                                            <Icons.Trash size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}



                {activeTab === 'location' && (
                    <div className="space-y-8 animate-in fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg text-primary uppercase tracking-widest">Boutique Locations</h3>
                            <button
                                type="button"
                                onClick={handleAddAddress}
                                className="px-4 py-2 border border-primary text-primary text-xs uppercase tracking-widest hover:bg-primary hover:text-dark transition-all duration-300"
                            >
                                + Add Location
                            </button>
                        </div>

                        {(!formData.addresses || formData.addresses.length === 0) && (
                            <div className="text-center py-12 border border-dashed border-white/10 rounded">
                                <p className="text-light/40 italic">No boutique locations added yet.</p>
                            </div>
                        )}

                        <div className="space-y-12">
                            {(formData.addresses || []).map((addr, index) => (
                                <div key={index} className="p-6 border border-white/5 bg-body/30 rounded relative group">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAddress(index)}
                                            className="text-red-500 hover:text-red-400 p-2"
                                            title="Remove Location"
                                        >
                                            <Icons.Trash size={18} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Address Line 1 (Street/Building)</label>
                                            <Input
                                                value={addr.line1}
                                                onChange={(e) => handleAddressChange(index, 'line1', e.target.value)}
                                                placeholder="e.g. 123 Jewelry Lane"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Address Line 2 (Area/Landmark)</label>
                                            <Input
                                                value={addr.line2}
                                                onChange={(e) => handleAddressChange(index, 'line2', e.target.value)}
                                                placeholder="e.g. Near Fashion Center"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">City</label>
                                            <Input
                                                value={addr.city}
                                                onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                                                placeholder="Mumbai"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Pincode / Zip Code</label>
                                            <Input
                                                value={addr.pincode}
                                                onChange={(e) => handleAddressChange(index, 'pincode', e.target.value)}
                                                placeholder="400001"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Country</label>
                                            <Input
                                                value={addr.country}
                                                onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                                                placeholder="India"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Google Maps URL</label>
                                            <Input
                                                value={addr.googleMapsUrl}
                                                onChange={(e) => handleAddressChange(index, 'googleMapsUrl', e.target.value)}
                                                placeholder="https://maps.google.com/..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'social' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Instagram URL</label>
                            <Input
                                name="socialLinks.instagram"
                                value={formData.socialLinks.instagram}
                                onChange={handleChange}
                                placeholder="https://instagram.com/..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Facebook URL</label>
                            <Input
                                name="socialLinks.facebook"
                                value={formData.socialLinks.facebook}
                                onChange={handleChange}
                                placeholder="https://facebook.com/..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">YouTube URL</label>
                            <Input
                                name="socialLinks.youtube"
                                value={formData.socialLinks.youtube}
                                onChange={handleChange}
                                placeholder="https://youtube.com/..."
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'payment' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Tax Rate (%)</label>
                            <Input
                                type="number"
                                name="taxRate"
                                value={formData.taxRate}
                                onChange={handleChange}
                            />
                            <p className="text-xs text-light/40 mt-1">This tax rate is used for calculating tax on orders (e.g. 18 for 18% GST).</p>
                        </div>
                    </div>
                )}



                {activeTab === 'interface' && (
                    <div className="space-y-8 animate-in fade-in">


                        {/* Announcement Bar */}
                        <div className="p-4 border border-white/5 rounded">
                            <h3 className="text-lg text-primary mb-3">Header Announcement Bar</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-light/70 uppercase">Announcement Text</label>
                                    <Input
                                        type="text"
                                        value={formData.announcement?.text || ''}
                                        onChange={(e) => setFormData({ ...formData, announcement: { ...formData.announcement, text: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-light/70 uppercase">Link URL</label>
                                    <Input
                                        type="text"
                                        value={formData.announcement?.link || ''}
                                        onChange={(e) => setFormData({ ...formData, announcement: { ...formData.announcement, link: e.target.value } })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Interface Text Labels */}
                        <div className="p-4 border border-white/5 rounded">
                            <h3 className="text-lg text-primary mb-3">UI & Text Labels</h3>
                            <div className="space-y-6">
                                {/* Search UI */}
                                <div className="space-y-3 border-b border-light/5 pb-4">
                                    <div className="mb-2">
                                        <h4 className="text-sm font-bold text-light/80">Search Overlay</h4>
                                        <p className="text-xs text-light/50">Customize text shown in the global search bar and results overlay.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-light/60 text-xs mb-1">Placeholder Text</label>
                                            <Input
                                                type="text"
                                                value={formData.uiLabels?.search?.placeholder || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, uiLabels: { ...prev.uiLabels, search: { ...prev.uiLabels.search, placeholder: e.target.value } } }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-light/60 text-xs mb-1">No Results Message</label>
                                            <Input
                                                type="text"
                                                value={formData.uiLabels?.search?.noResults || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, uiLabels: { ...prev.uiLabels, search: { ...prev.uiLabels.search, noResults: e.target.value } } }))}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-light/60 text-xs mb-1">Popular Search Terms (comma separated)</label>
                                            <Input
                                                type="text"
                                                value={formData.uiLabels?.search?.popularTerms?.join(', ') || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, uiLabels: { ...prev.uiLabels, search: { ...prev.uiLabels.search, popularTerms: e.target.value.split(',').map(s => s.trim()) } } }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Cart UI */}
                                <div className="space-y-3 border-b border-light/5 pb-4">
                                    <div className="mb-2">
                                        <h4 className="text-sm font-bold text-light/80">Shopping Cart</h4>
                                        <p className="text-xs text-light/50">Text displayed in the slide-out cart drawer.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-light/60 text-xs mb-1">Empty Message</label>
                                            <Input
                                                type="text"
                                                value={formData.uiLabels?.cart?.emptyMessage || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, uiLabels: { ...prev.uiLabels, cart: { ...prev.uiLabels.cart, emptyMessage: e.target.value } } }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-light/60 text-xs mb-1">Start Shopping Button</label>
                                            <Input
                                                type="text"
                                                value={formData.uiLabels?.cart?.startShoppingBtn || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, uiLabels: { ...prev.uiLabels, cart: { ...prev.uiLabels.cart, startShoppingBtn: e.target.value } } }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-light/60 text-xs mb-1">Checkout Disclaimer</label>
                                            <Input
                                                type="text"
                                                value={formData.uiLabels?.cart?.disclaimer || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, uiLabels: { ...prev.uiLabels, cart: { ...prev.uiLabels.cart, disclaimer: e.target.value } } }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Auth UI */}
                                <div className="space-y-3 border-b border-light/5 pb-4">
                                    <div className="mb-2">
                                        <h4 className="text-sm font-bold text-light/80">Authentication</h4>
                                        <p className="text-xs text-light/50">Headings and subtitles for Login and Register screens.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-light/60 text-xs mb-1">Login Title</label>
                                            <Input
                                                type="text"
                                                value={formData.uiLabels?.auth?.loginTitle || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, uiLabels: { ...prev.uiLabels, auth: { ...prev.uiLabels.auth, loginTitle: e.target.value } } }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-light/60 text-xs mb-1">Register Title</label>
                                            <Input
                                                type="text"
                                                value={formData.uiLabels?.auth?.registerTitle || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, uiLabels: { ...prev.uiLabels, auth: { ...prev.uiLabels.auth, registerTitle: e.target.value } } }))}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-light/60 text-xs mb-1">Login Subtitle</label>
                                            <Input
                                                type="text"
                                                value={formData.uiLabels?.auth?.loginSubtitle || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, uiLabels: { ...prev.uiLabels, auth: { ...prev.uiLabels.auth, loginSubtitle: e.target.value } } }))}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-light/60 text-xs mb-1">Register Subtitle</label>
                                            <Input
                                                type="text"
                                                value={formData.uiLabels?.auth?.registerSubtitle || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, uiLabels: { ...prev.uiLabels, auth: { ...prev.uiLabels.auth, registerSubtitle: e.target.value } } }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Product UI */}
                                <div className="space-y-3">
                                    <div className="mb-2">
                                        <h4 className="text-sm font-bold text-light/80">Product Page</h4>
                                        <p className="text-xs text-light/50">Section titles on the detailed product view.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-light/60 text-xs mb-1">Related Products Title</label>
                                            <Input
                                                type="text"
                                                value={formData.uiLabels?.product?.relatedTitle || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, uiLabels: { ...prev.uiLabels, product: { ...prev.uiLabels.product, relatedTitle: e.target.value } } }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-light/60 text-xs mb-1">Reviews Title</label>
                                            <Input
                                                type="text"
                                                value={formData.uiLabels?.product?.reviewsTitle || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, uiLabels: { ...prev.uiLabels, product: { ...prev.uiLabels.product, reviewsTitle: e.target.value } } }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'policies' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs text-light/70 uppercase">Shipping & Returns Text</label>
                                <Textarea
                                    rows="4"
                                    value={formData.productPolicies?.shipping || ''}
                                    onChange={(e) => setFormData({ ...formData, productPolicies: { ...formData.productPolicies, shipping: e.target.value } })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-light/70 uppercase">Care Instructions (Default)</label>
                                <Textarea
                                    rows="4"
                                    value={formData.productPolicies?.care || ''}
                                    onChange={(e) => setFormData({ ...formData, productPolicies: { ...formData.productPolicies, care: e.target.value } })}
                                />
                            </div>
                        </div>
                    </div>
                )}



                {activeTab === 'preferences' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-md">
                            <div>
                                <h3 className="text-light font-medium">Enable Product Reviews</h3>
                                <p className="text-xs text-light/50">Allow customers to leave reviews on products.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="enableReviews"
                                    checked={formData.enableReviews}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Save Button Action Bar */}
            <div className="flex justify-end pt-6 border-t border-white/10 mt-6">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary text-dark font-bold uppercase tracking-widest px-8 py-3 hover:bg-white transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {saving && <div className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></div>}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div >
    );
};

export default AdminSettings;
