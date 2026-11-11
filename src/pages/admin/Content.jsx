import React, { useState, useEffect, useRef } from 'react';
import { useGetAttributesQuery } from '../../store/api/attributeApiSlice';
import {
    useGetHeroSlidesQuery, useAddHeroSlideMutation, useUpdateHeroSlideMutation, useDeleteHeroSlideMutation,
    useGetTestimonialsQuery, useAddTestimonialMutation, useDeleteTestimonialMutation,
    useGetSocialFeedQuery, useAddSocialPostMutation, useDeleteSocialPostMutation,
    useGetHeritageQuery, useUpdateHeritageMutation,
    useGetGoldStandardQuery, useUpdateGoldStandardMutation,
    useGetOurVisionQuery, useUpdateOurVisionMutation,
    useGetDiscoverSectionQuery, useUpdateDiscoverSectionMutation,
    useGetTrustBadgesQuery, useAddTrustBadgeMutation, useDeleteTrustBadgeMutation,
    useGetFAQsQuery, useAddFAQMutation, useDeleteFAQMutation,
    useGetSettingsQuery, useUpdateSettingsMutation,

    useGetPageQuery, useUpdatePageMutation,
    // useGetMegaMenuListQuery, useGetMegaMenuQuery, useUpdateMegaMenuMutation,
    useUploadImageMutation
} from '../../store/api/contentApiSlice';
import { useToast } from '../../context/ToastContext';
import { getMediaUrl } from '../../utils/apiConfig';
// Removed: import client from '../../api/client';
// Removed: import axios from 'axios';
import { useConfirm } from '../../context/ConfirmContext';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import PreviewableImage from '../../components/ui/PreviewableImage';
import { REGEX } from '../../utils/regex';
import Icons from '../../components/ui/Icons';
import { PRIVACY_POLICY_FALLBACK, TERMS_CONDITIONS_FALLBACK, SHIPPING_RETURNS_FALLBACK, CARE_GUIDE_FALLBACK } from '../../utils/defaultContent';

const AdminContent = () => {
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    const [activeTab, setActiveTab] = useState('hero');
    const [activeLegalPage, setActiveLegalPage] = useState('privacy-policy');
    const [activeSystemPage, setActiveSystemPage] = useState('shop');
    const [activeMenuId, setActiveMenuId] = useState('');

    // --- RTK Query Hooks ---
    const { data: heroSlides, isLoading: loadingHero } = useGetHeroSlidesQuery();
    const { data: testimonials } = useGetTestimonialsQuery();
    const { data: socialFeed } = useGetSocialFeedQuery();
    const { data: heritage } = useGetHeritageQuery();
    const { data: goldStandard } = useGetGoldStandardQuery();
    const { data: ourVision } = useGetOurVisionQuery();
    const { data: discoverData } = useGetDiscoverSectionQuery();
    const { data: trustBadges } = useGetTrustBadgesQuery();
    const { data: remoteSettings } = useGetSettingsQuery();


    // Use attributes for categories (as per user workflow)
    const { data: attributesData } = useGetAttributesQuery();
    // const categories = attributesData?.categories || [];

    // Conditional fetching for other tabs
    const { data: faqs } = useGetFAQsQuery(undefined, { skip: activeTab !== 'faq' });

    // const { data: megaMenuList } = useGetMegaMenuListQuery(undefined, { skip: activeTab !== 'megamenu' }); // Deprecated in favor of categories
    const { data: aboutPageData } = useGetPageQuery('about', { skip: activeTab !== 'about' });
    // Hooks for Legal and MegaMenu
    const { data: activeLegalPageData } = useGetPageQuery(activeLegalPage, { skip: activeTab !== 'legalpages' });
    // const { data: activeMegaMenu } = useGetMegaMenuQuery(activeMenuId, { skip: !activeMenuId || activeTab !== 'megamenu' });
    const { data: systemPageData } = useGetPageQuery(activeSystemPage, { skip: activeTab !== 'systempages' });
    // Note: 'settings' data is already fetched by useGetSettingsQuery defined above.

    // Mutations
    const [addHeroSlide, { isLoading: isAddingHero }] = useAddHeroSlideMutation();
    const [updateHeroSlide, { isLoading: isUpdatingHero }] = useUpdateHeroSlideMutation();
    const [deleteHeroSlide] = useDeleteHeroSlideMutation();
    const [addTestimonial, { isLoading: isAddingTestimonial }] = useAddTestimonialMutation();
    const [deleteTestimonial] = useDeleteTestimonialMutation();
    const [addSocialPost, { isLoading: isAddingSocial }] = useAddSocialPostMutation();
    const [deleteSocialPost] = useDeleteSocialPostMutation();
    const [updateHeritage, { isLoading: isUpdatingHeritage }] = useUpdateHeritageMutation();
    const [updateGoldStandard, { isLoading: isUpdatingGoldStandard }] = useUpdateGoldStandardMutation();
    const [updateOurVision, { isLoading: isUpdatingOurVision }] = useUpdateOurVisionMutation();
    const [updateDiscoverSection, { isLoading: isUpdatingDiscover }] = useUpdateDiscoverSectionMutation();
    const [addTrustBadge, { isLoading: isAddingTrustBadge }] = useAddTrustBadgeMutation();
    const [deleteTrustBadge] = useDeleteTrustBadgeMutation();
    const [addFAQ, { isLoading: isAddingFAQ }] = useAddFAQMutation();
    const [deleteFAQ] = useDeleteFAQMutation();

    const [updatePage, { isLoading: isUpdatingPage }] = useUpdatePageMutation();
    const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateSettingsMutation();
    // const [updateMegaMenu] = useUpdateMegaMenuMutation();
    const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

    // Loading state aggregation (simplified)
    // const loading = loadingHero;


    // --- Content Refs for Scrolling ---
    const heroListRef = useRef(null);
    const testimonialListRef = useRef(null);
    const socialListRef = useRef(null);
    const heritageFormRef = useRef(null);
    const goldStandardFormRef = useRef(null);
    const ourVisionFormRef = useRef(null);
    const discoverFormRef = useRef(null);
    const trustBadgeListRef = useRef(null);
    const faqListRef = useRef(null);
    const aboutFormRef = useRef(null);

    const [newHero, setNewHero] = useState({ title: '', subtitle: '', media: '', mobileMedia: '', link: '', order: 0, showButton: true });
    const [heroImageFile, setHeroImageFile] = useState(null);
    const [heroMobileImageFile, setHeroMobileImageFile] = useState(null);
    const [editingHero, setEditingHero] = useState(null);

    // --- Testimonial State ---
    const [newTestimonial, setNewTestimonial] = useState({ text: '', author: '', role: '' });

    // --- Social Post State ---
    const [newSocial, setNewSocial] = useState({ media: '', platform: 'Instagram', link: '' });
    const [socialImageFile, setSocialImageFile] = useState(null);

    // --- Heritage State ---
    const [heritageForm, setHeritageForm] = useState({
        title: '', subtitle: '', description: '', description2: '', image: '', link: '', linkText: ''
    });
    const [heritageImageFile, setHeritageImageFile] = useState(null);

    useEffect(() => {
        if (heritage) {
            setHeritageForm(prev => {
                // Only update if current data is empty/initial to avoid cascading
                if (prev.title === '' && prev.subtitle === '') {
                    return {
                        title: heritage.title || '',
                        subtitle: heritage.subtitle || '',
                        description: heritage.description || '',
                        description2: heritage.description2 || '',
                        image: heritage.image || '',
                        link: heritage.link || '',
                        linkText: heritage.linkText || ''
                    };
                }
                return prev;
            });
        }
    }, [heritage]);

    // --- The Gold Standard State ---
    const [goldStandardForm, setGoldStandardForm] = useState({
        title: '', subtitle: '', description: '', description2: '', image: '', link: '', linkText: ''
    });
    const [goldStandardImageFile, setGoldStandardImageFile] = useState(null);

    useEffect(() => {
        if (goldStandard) {
            setGoldStandardForm(prev => {
                if (prev.title === '' && prev.subtitle === '') {
                    return {
                        title: goldStandard.title || '',
                        subtitle: goldStandard.subtitle || '',
                        description: goldStandard.description || '',
                        description2: goldStandard.description2 || '',
                        image: goldStandard.image || '',
                        link: goldStandard.link || '',
                        linkText: goldStandard.linkText || ''
                    };
                }
                return prev;
            });
        }
    }, [goldStandard]);

    // --- Our Vision State ---
    const [ourVisionForm, setOurVisionForm] = useState({
        title: '',
        description: '',
        item1Title: '',
        item1Description: '',
        item1Icon: 'sparkles',
        item2Title: '',
        item2Description: '',
        item2Icon: 'heart',
        item3Title: '',
        item3Description: '',
        item3Icon: 'shield'
    });

    useEffect(() => {
        if (ourVision) {
            setOurVisionForm(prev => {
                if (prev.title === '' && prev.description === '') {
                    return {
                        title: ourVision.title || '',
                        description: ourVision.description || '',
                        item1Title: ourVision.item1Title || '',
                        item1Description: ourVision.item1Description || '',
                        item1Icon: ourVision.item1Icon || 'sparkles',
                        item2Title: ourVision.item2Title || '',
                        item2Description: ourVision.item2Description || '',
                        item2Icon: ourVision.item2Icon || 'heart',
                        item3Title: ourVision.item3Title || '',
                        item3Description: ourVision.item3Description || '',
                        item3Icon: ourVision.item3Icon || 'shield',
                    };
                }
                return prev;
            });
        }
    }, [ourVision]);

    // --- Discover Section State ---
    const [discoverForm, setDiscoverForm] = useState({
        badge: '',
        title: '',
        highlightText: '',
        description: '',
        link: '',
        linkText: ''
    });

    useEffect(() => {
        if (discoverData) {
            setDiscoverForm(prev => {
                if (prev.title === '' && prev.highlightText === '') {
                    return {
                        badge: discoverData.badge || '',
                        title: discoverData.title || '',
                        highlightText: discoverData.highlightText || '',
                        description: discoverData.description || '',
                        link: discoverData.link || '',
                        linkText: discoverData.linkText || ''
                    };
                }
                return prev;
            });
        }
    }, [discoverData]);



    // --- Trust Badge State ---
    const [newTrustBadge, setNewTrustBadge] = useState({ text: '', order: 0 });

    // --- Social Links State (Moved from Settings) ---
    const [socialLinksForm, setSocialLinksForm] = useState({
        instagram: '',
        facebook: '',
        youtube: ''
    });

    // --- Interface State (Moved from Settings) ---
    const [interfaceForm, setInterfaceForm] = useState({
        announcement: { text: '', link: '' },
        uiLabels: {
            search: { placeholder: '', noResults: '', popularTerms: [] },
            cart: { emptyMessage: '', startShoppingBtn: '', disclaimer: '' },
            auth: { loginTitle: '', registerTitle: '', loginSubtitle: '', registerSubtitle: '' },
            product: { relatedTitle: '', reviewsTitle: '' }
        }
    });

    // --- Policies State (Moved from Settings) ---
    const [policiesForm, setPoliciesForm] = useState({
        shipping: '',
        care: ''
    });

    useEffect(() => {
        if (remoteSettings) {
            if (remoteSettings.socialLinks) {
                setSocialLinksForm({
                    instagram: remoteSettings.socialLinks.instagram || '',
                    facebook: remoteSettings.socialLinks.facebook || '',
                    youtube: remoteSettings.socialLinks.youtube || ''
                });
            }
            if (remoteSettings.announcement || remoteSettings.uiLabels) {
                setInterfaceForm({
                    announcement: {
                        text: remoteSettings.announcement?.text || '',
                        link: remoteSettings.announcement?.link || ''
                    },
                    uiLabels: {
                        search: {
                            placeholder: remoteSettings.uiLabels?.search?.placeholder || '',
                            noResults: remoteSettings.uiLabels?.search?.noResults || '',
                            popularTerms: remoteSettings.uiLabels?.search?.popularTerms || []
                        },
                        cart: {
                            emptyMessage: remoteSettings.uiLabels?.cart?.emptyMessage || '',
                            startShoppingBtn: remoteSettings.uiLabels?.cart?.startShoppingBtn || '',
                            disclaimer: remoteSettings.uiLabels?.cart?.disclaimer || ''
                        },
                        auth: {
                            loginTitle: remoteSettings.uiLabels?.auth?.loginTitle || '',
                            registerTitle: remoteSettings.uiLabels?.auth?.registerTitle || '',
                            loginSubtitle: remoteSettings.uiLabels?.auth?.loginSubtitle || '',
                            registerSubtitle: remoteSettings.uiLabels?.auth?.registerSubtitle || ''
                        },
                        product: {
                            relatedTitle: remoteSettings.uiLabels?.product?.relatedTitle || '',
                            reviewsTitle: remoteSettings.uiLabels?.product?.reviewsTitle || ''
                        }
                    }
                });
            }
            if (remoteSettings.productPolicies) {
                setPoliciesForm({
                    shipping: remoteSettings.productPolicies.shipping || '',
                    care: remoteSettings.productPolicies.care || ''
                });
            }
        }
    }, [remoteSettings]);

    // --- Handlers ---
    // Helper to check for video extension
    const isVideo = (url) => REGEX.IS_VIDEO.test(url);

    const handleFileUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            console.log('Uploading file:', file.name);
            const result = await uploadImage(formData).unwrap();
            console.log('Upload result:', result);
            // apiSlice automatically unwraps { status: 1, data: ... } -> returns data
            // So result IS the image path string
            return result;
        } catch (error) {
            console.error('File upload failed', error);
            showToast('File upload failed', 'error');
            return null;
        }
    };

    const scrollToList = (ref) => {
        if (ref && ref.current) {
            setTimeout(() => {
                ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    const handleSaveHero = async (e) => {
        e.preventDefault();

        // VALIDATION
        // VALIDATION
        
        // Media is required if NOT editing, or if editing but no existing media (rare)
        if (!editingHero && !newHero.media && !heroImageFile) {
            showToast('Hero Image/Video is required', 'error');
            return;
        }

        const form = e.target;
        let mediaUrl = newHero.media;
        let mobileMediaUrl = newHero.mobileMedia;

        if (heroImageFile) {
            mediaUrl = await handleFileUpload(heroImageFile);
            if (!mediaUrl) return; // Upload failed
        }

        if (heroMobileImageFile) {
            mobileMediaUrl = await handleFileUpload(heroMobileImageFile);
            if (!mobileMediaUrl) return; // Upload failed
        }

        const heroData = { ...newHero, media: mediaUrl, mobileMedia: mobileMediaUrl };

        if (editingHero) {
            updateHeroSlide({ id: editingHero._id, ...heroData })
                .unwrap()
                .then(() => {
                    showToast('Hero Slide updated', 'success');
                    handleCancelEdit();
                    setHeroMobileImageFile(null);
                    form.reset();
                    scrollToList(heroListRef);
                })
                .catch(err => showToast(err?.data?.message || err.message, 'error'));
        } else {
            addHeroSlide(heroData)
                .unwrap()
                .then(() => {
                    showToast('Hero Slide added', 'success');
                    setNewHero({ title: '', subtitle: '', media: '', mobileMedia: '', link: '', order: 0, showButton: true });
                    setHeroImageFile(null);
                    setHeroMobileImageFile(null);
                    form.reset();
                    scrollToList(heroListRef);
                })
                .catch(err => showToast(err?.data?.message || err.message, 'error'));
        }
    };

    const handleEditHero = (slide) => {
        setEditingHero(slide);
        setNewHero({
            title: slide.title,
            subtitle: slide.subtitle,
            media: slide.media,
            mobileMedia: slide.mobileMedia || '',
            link: slide.link || '',
            order: slide.order || 0,
            showButton: slide.showButton !== undefined ? slide.showButton : true
        });
        setHeroImageFile(null);
        setHeroMobileImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingHero(null);
        setNewHero({ title: '', subtitle: '', media: '', mobileMedia: '', link: '', order: 0, showButton: true });
        setHeroImageFile(null);
        setHeroMobileImageFile(null);
    };

    const handleDeleteHero = async (id) => {
        if (await confirm('Delete Hero Slide', 'Are you sure you want to delete this hero slide?')) {
            deleteHeroSlide(id)
                .unwrap()
                .then(() => showToast('Hero Slide deleted', 'success'))
                .catch(err => showToast(err?.data?.message || err.message, 'error'));
        }
    };

    const handleAddTestimonial = async (e) => {
        e.preventDefault();

        // VALIDATION
        if (!newTestimonial.text.trim() || !newTestimonial.author.trim()) {
            showToast('Testimonial Text and Author are required', 'error');
            return;
        }

        const form = e.target;
        addTestimonial(newTestimonial)
            .unwrap()
            .then(() => {
                showToast('Testimonial added', 'success');
                setNewTestimonial({ text: '', author: '', role: '' });
                form.reset();
                scrollToList(testimonialListRef);
            })
            .catch(err => showToast(err?.data?.message || err.message, 'error'));
    };

    const handleDeleteTestimonial = async (id) => {
        if (await confirm('Delete Testimonial', 'Are you sure you want to delete this testimonial?')) {
            deleteTestimonial(id)
                .unwrap()
                .then(() => showToast('Testimonial deleted', 'success'))
                .catch(err => showToast(err?.data?.message || err.message, 'error'));
        }
    };

    const handleAddSocial = async (e) => {
        e.preventDefault();

        // VALIDATION
        if (!newSocial.media && !socialImageFile) {
            showToast('Social Post Image/Video is required', 'error');
            return;
        }

        const form = e.target;
        let mediaUrl = newSocial.media;
        if (socialImageFile) {
            mediaUrl = await handleFileUpload(socialImageFile);
        }
        if (!mediaUrl && socialImageFile) return;

        addSocialPost({ ...newSocial, media: mediaUrl })
            .unwrap()
            .then(() => {
                showToast('Social Post added', 'success');
                setNewSocial({ media: '', platform: 'Instagram', link: '' });
                setSocialImageFile(null);
                form.reset();
                scrollToList(socialListRef);
            })
            .catch(err => showToast(err?.data?.message || err.message, 'error'));
    };

    const handleDeleteSocial = async (id) => {
        if (await confirm('Delete Social Post', 'Are you sure you want to delete this social post?')) {
            deleteSocialPost(id)
                .unwrap()
                .then(() => showToast('Social Post deleted', 'success'))
                .catch(err => showToast(err?.data?.message || err.message, 'error'));
        }
    };

    const handleUpdateHeritage = async (e) => {
        e.preventDefault();

        // VALIDATION
        if (!heritageForm.title.trim()) {
            showToast('Title is required', 'error');
            return;
        }

        let imageUrl = heritageForm.image;
        if (heritageImageFile) {
            imageUrl = await handleFileUpload(heritageImageFile);
        }

        updateHeritage({ ...heritageForm, image: imageUrl || '' })
            .unwrap()
            .then((data) => {
                showToast('Heritage section updated', 'success');
                setHeritageImageFile(null);
                scrollToList(heritageFormRef);
                // Optimistic update
                setHeritageForm(prev => ({
                    ...prev,
                    image: data.image || prev.image
                }));
            })
            .catch(err => showToast(err?.data?.message || err.message, 'error'));
    };

    const handleUpdateGoldStandard = async (e) => {
        e.preventDefault();

        // VALIDATION
        if (!goldStandardForm.title.trim()) {
            showToast('Title is required', 'error');
            return;
        }

        let imageUrl = goldStandardForm.image;
        if (goldStandardImageFile) {
            imageUrl = await handleFileUpload(goldStandardImageFile);
        }

        updateGoldStandard({ ...goldStandardForm, image: imageUrl || '' })
            .unwrap()
            .then((data) => {
                showToast('The Gold Standard section updated', 'success');
                setGoldStandardImageFile(null);
                scrollToList(goldStandardFormRef);
                // Optimistic update
                setGoldStandardForm(prev => ({
                    ...prev,
                    image: data.image || prev.image
                }));
            })
            .catch(err => showToast(err?.data?.message || err.message, 'error'));
    };

    const handleUpdateOurVision = async (e) => {
        e.preventDefault();

        if (!ourVisionForm.title.trim()) {
            showToast('Title is required', 'error');
            return;
        }

        updateOurVision(ourVisionForm)
            .unwrap()
            .then(() => {
                showToast('Our Vision section updated', 'success');
                scrollToList(ourVisionFormRef);
            })
            .catch(err => showToast(err?.data?.message || err.message, 'error'));
    };

    const handleUpdateDiscover = async (e) => {
        e.preventDefault();

        if (!discoverForm.title.trim() && !discoverForm.highlightText.trim()) {
            showToast('Title or Highlight Text is required', 'error');
            return;
        }

        updateDiscoverSection(discoverForm)
            .unwrap()
            .then(() => {
                showToast('Discover section updated', 'success');
                scrollToList(discoverFormRef);
            })
            .catch(err => showToast(err?.data?.message || err.message, 'error'));
    };

    const handleAddTrustBadge = (e) => {
        e.preventDefault();

        // VALIDATION
        if (!newTrustBadge.text.trim()) {
            showToast('Badge text is required', 'error');
            return;
        }

        const form = e.target;
        addTrustBadge({ text: newTrustBadge.text, icon: '✦', order: newTrustBadge.order || 0 })
            .unwrap()
            .then(() => {
                showToast('Trust Badge added', 'success');
                setNewTrustBadge({ text: '', order: 0 });
                form.reset();
                scrollToList(trustBadgeListRef);
            })
            .catch(err => showToast(err?.data?.message || err.message, 'error'));
    };

    const handleSaveSocialLinks = async (e) => {
        e.preventDefault();
        updateSettings({ socialLinks: socialLinksForm })
            .unwrap()
            .then(() => showToast('Social Links saved successfully', 'success'))
            .catch(err => showToast(err?.data?.message || err.message, 'error'));
    };

    const handleSaveInterface = async (e) => {
        e.preventDefault();
        updateSettings({
            announcement: interfaceForm.announcement,
            uiLabels: interfaceForm.uiLabels
        })
            .unwrap()
            .then(() => showToast('Interface settings saved successfully', 'success'))
            .catch(err => showToast(err?.data?.message || err.message, 'error'));
    };

    const handleSavePolicies = async (e) => {
        e.preventDefault();
        updateSettings({ productPolicies: policiesForm })
            .unwrap()
            .then(() => showToast('Product policies saved successfully', 'success'))
            .catch(err => showToast(err?.data?.message || err.message, 'error'));
    };

    const handleDeleteTrustBadge = async (id) => {
        if (await confirm('Delete Trust Badge', 'Are you sure you want to delete this trust badge?')) {
            deleteTrustBadge(id)
                .unwrap()
                .then(() => showToast('Trust Badge deleted', 'success'))
                .catch(err => showToast(err?.data?.message || err.message, 'error'));
        }
    };

    // --- FAQ State ---
    const [newFAQ, setNewFAQ] = useState({ question: '', answer: '' });

    // Removed useEffect for FAQs as it is handled by the hook


    const handleAddFAQ = (e) => {
        e.preventDefault();

        // VALIDATION
        if (!newFAQ.question.trim() || !newFAQ.answer.trim()) {
            showToast('Question and Answer are required', 'error');
            return;
        }

        const form = e.target;
        addFAQ(newFAQ)
            .unwrap()
            .then(() => {
                showToast('FAQ added', 'success');
                setNewFAQ({ question: '', answer: '' });
                form.reset();
                scrollToList(faqListRef);
            })
            .catch(err => showToast(err?.data?.message || err.message, 'error'));
    };

    const handleDeleteFAQ = async (id) => {
        if (await confirm('Delete FAQ', 'Are you sure you want to delete this FAQ?')) {
            deleteFAQ(id)
                .unwrap()
                .then(() => showToast('FAQ deleted', 'success'))
                .catch(err => showToast(err?.data?.message || err.message, 'error'));
        }
    };

    // --- About Page State ---
    const [aboutForm, setAboutForm] = useState({
        storyTitle: '',
        storyContent: '',
        founderQuote: '',
        values1Title: '', values1Desc: '',
        values2Title: '', values2Desc: '',
        values3Title: '', values3Desc: ''
    });
    const [storyImageFile, setStoryImageFile] = useState(null);

    // Removed manual fetch useEffect


    useEffect(() => {
        if (aboutPageData?.modules) {
            const m = aboutPageData.modules;
            setAboutForm(prev => {
                // Only update if storyTitle is empty to avoid overwriting user edits or cascading
                if (prev.storyTitle === '') {
                    return {
                        storyTitle: m.story?.title || '',
                        storyContent: m.story?.content || '',
                        storyImage: m.story?.image || '',
                        founderQuote: m.founder?.quote || '',
                        values1Title: m.values?.[0]?.title || '',
                        values1Desc: m.values?.[0]?.description || '',
                        values2Title: m.values?.[1]?.title || '',
                        values2Desc: m.values?.[1]?.description || '',
                        values3Title: m.values?.[2]?.title || '',
                        values3Desc: m.values?.[2]?.description || '',
                    };
                }
                return prev;
            });
        }
    }, [aboutPageData]);

    const handleUpdateAbout = async (e) => {
        e.preventDefault();

        // Handle image upload if new file selected
        let imageUrl = aboutPageData?.modules?.story?.image;

        // BETTER LOGIC: Use local state fallback if no new file
        if (storyImageFile) {
            const uploadResult = await handleFileUpload(storyImageFile); // Returns string path directly now
            imageUrl = uploadResult;
        } else if (aboutForm.storyImage) {
            imageUrl = aboutForm.storyImage;
        }

        const modules = {
            ...(aboutPageData?.modules || {}), // Preserve existing modules like header/seo set by System Pages
            story: {
                title: aboutForm.storyTitle,
                content: aboutForm.storyContent,
                image: imageUrl || '' // Ensure not undefined
            },
            founder: {
                quote: aboutForm.founderQuote
            },
            values: [
                { title: aboutForm.values1Title, description: aboutForm.values1Desc },
                { title: aboutForm.values2Title, description: aboutForm.values2Desc },
                { title: aboutForm.values3Title, description: aboutForm.values3Desc },
            ]
        };

        updatePage({ slug: 'about', modules })
            .unwrap()
            .then((data) => {
                showToast('About page updated', 'success');
                setStoryImageFile(null);
                scrollToList(aboutFormRef);

                // Optimistic update
                const m = data?.modules || {};
                setAboutForm(prev => ({
                    ...prev,
                    storyTitle: m.story?.title || prev.storyTitle,
                    storyContent: m.story?.content || prev.storyContent,
                    storyImage: m.story?.image || prev.storyImage,
                    founderQuote: m.founder?.quote || prev.founderQuote
                }));
            })
            .catch(err => showToast(err?.data?.message || err.message, 'error'));
    };



    // --- Legal Pages State ---
    const [legalSections, setLegalSections] = useState([]);

    useEffect(() => {
        if (activeLegalPageData?.modules?.sections && activeLegalPageData.modules.sections.length > 0) {
            setLegalSections(activeLegalPageData.modules.sections);
        } else {
            if (activeLegalPage === 'privacy-policy') {
                setLegalSections(PRIVACY_POLICY_FALLBACK);
            } else if (activeLegalPage === 'terms-conditions') {
                setLegalSections(TERMS_CONDITIONS_FALLBACK);
            } else if (activeLegalPage === 'shipping-returns') {
                setLegalSections(SHIPPING_RETURNS_FALLBACK);
            } else {
                setLegalSections([]);
            }
        }
    }, [activeLegalPageData, activeLegalPage]);

    const handleUpdateLegalPage = () => {
        const modules = {
            sections: legalSections,
            lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        };
        updatePage({ slug: activeLegalPage, modules })
            .unwrap()
            .then(() => {
                showToast(`${activeLegalPage.replace('-', ' ')} updated`, 'success');
            })
            .catch(err => showToast(err?.data?.message || err.message, 'error'));
    };

    const handleSectionChange = (index, field, value) => {
        const updated = [...legalSections];
        updated[index] = { ...updated[index], [field]: value };
        setLegalSections(updated);
    };

    const handleAddSection = () => {
        setLegalSections([...legalSections, { title: 'New Section', content: '' }]);
    };

    const handleDeleteSection = async (index) => {
        if (await confirm('Remove Section', 'Are you sure you want to remove this section?')) {
            const updated = [...legalSections];
            updated.splice(index, 1);
            setLegalSections(updated);
        }
    };

    // --- Mega Menu State ---
    // Removed megaMenus selector

    const [menuForm, setMenuForm] = useState({ categories: [], featured: { title: '', link: '', img: '' } });
    // const [featuredImageFile, setFeaturedImageFile] = useState(null);
    // const [setFeaturedImageFile] = useState(null); // Satisfy linter if needed

    // Removed manual fetch useEffects

    // Removed: Auto-set activeMenuId to prevent overriding reset action
    // useEffect(() => {
    //     if (!activeMenuId && categories && categories.length > 0) {
    //         setActiveMenuId(categories[0].name);
    //     }
    // }, [categories, activeMenuId]);

    /*
    useEffect(() => {
        // Prefer dynamic data, fallback to empty defaults for fresh categories
        if (activeMegaMenu) {
            setMenuForm({
                categories: activeMegaMenu.categories || [],
                featured: activeMegaMenu.featured || { title: '', link: '', img: '' }
            });
        } else {
            // No data found for this category (fresh), reset form
            setMenuForm({
                categories: [],
                featured: { title: '', link: '', img: '' }
            });
        }
    }, [activeMegaMenu, activeMenuId]); // Added activeMenuId dep to ensure reset on switch
    */

    /*
    const handleUpdateMegaMenu = async (e) => {
        e.preventDefault();
        let imageUrl = menuForm.featured?.img;
        if (featuredImageFile) {
            imageUrl = await handleFileUpload(featuredImageFile);
        }

        updateMegaMenu({
            menuId: activeMenuId,
            categories: menuForm.categories,
            featured: { ...menuForm.featured, img: imageUrl }
        })
            .unwrap()
            .then(() => {
                showToast('Mega Menu updated', 'success');
                setFeaturedImageFile(null);
                // Reset form and selection as requested by user
                setActiveMenuId('');
                setMenuForm({
                    categories: [],
                    featured: { title: '', link: '', img: '' }
                });
            })
            .catch(err => showToast(err?.data?.message || err.message, 'error'));
    };
    */

    // handlers below were noted as unused in lint output
    /*
    const handleCategoryChange = (catIndex, field, value) => {
        const updatedCats = [...menuForm.categories]; 
        updatedCats[catIndex] = { ...updatedCats[catIndex], [field]: value };
        setMenuForm({ ...menuForm, categories: updatedCats });
    };

    const handleAddCategory = () => {
        setMenuForm({
            ...menuForm,
            categories: [...menuForm.categories, { title: 'New Category', items: ['Link 1'] }]
        });
    };

    const handleRemoveCategory = async (index) => {
        if (await confirm('Remove Category Column', 'Are you sure you want to remove this category column?')) {
            const updated = [...menuForm.categories];
            updated.splice(index, 1);
            setMenuForm({ ...menuForm, categories: updated });
        }
    };
    // ... similarly for item handlers if unused
    */

    // --- System Pages State ---
    const [systemPagesForm, setSystemPagesForm] = useState({
        title: '',
        eyebrow: '',
        subtitle: '',
        bannerImage: '',
        seoTitle: '',
        seoDescription: '',
        socialTitle: '',
        socialLink: ''
    });
    const [systemBannerFile, setSystemBannerFile] = useState(null);

    const systemPageSlugs = ['home', 'about', 'shop', 'collections', 'journal', 'care-guide', 'new-arrivals', 'offers', 'categories', 'search', 'wishlist', 'faq', 'track-order', 'privacy-policy', 'terms-conditions', 'shipping-returns'];

    useEffect(() => {
        if (activeTab === 'systempages' && systemPageData) {
            const data = systemPageData;
            const header = data?.modules?.header || {};
            const seo = data?.seo || {};

            setSystemPagesForm(prev => {
                // Optimization: skip if we've already loaded this page's content 
                // We use title as a proxy for 'loaded' or just compare some fields.
                // For a robust check, compare with some unique ID if available.
                if (prev.title === '' || prev.lastLoadedSlug !== activeSystemPage) {
                    return {
                        title: header.title || '',
                        eyebrow: header.eyebrow || '',
                        subtitle: header.subtitle || '',
                        bannerImage: header.bannerImage || '',
                        seoTitle: seo.title || '',
                        seoDescription: seo.description || '',
                        // Home sections
                        categoriesTitle: data?.modules?.categories?.title || 'Shop by Category',
                        featuredTitle: data?.modules?.featured?.title || 'Featured Collection',
                        testimonialsTitle: data?.modules?.testimonials?.title || 'Voices of Elegance',
                        socialTitle: data?.modules?.social?.title || '',
                        socialLink: data?.modules?.social?.link || '',
                        lastLoadedSlug: activeSystemPage
                    };
                }
                return prev;
            });
        }
    }, [systemPageData, activeTab, activeSystemPage]);

    const handleUpdateSystemPage = async () => {
        // Handle Banner Image Upload
        let bannerUrl = systemPagesForm.bannerImage;
        if (systemBannerFile) {
            bannerUrl = await handleFileUpload(systemBannerFile);
        }

        // Use existing image from form state if no new file uploaded
        // This prevents overwriting with empty string if state was correctly populated
        if (!bannerUrl && systemPagesForm.bannerImage) {
            bannerUrl = systemPagesForm.bannerImage;
        }

        // Prepare header data
        const headerData = {
            title: systemPagesForm.title || '',
            eyebrow: systemPagesForm.eyebrow || '',
            subtitle: systemPagesForm.subtitle || '',
            bannerImage: bannerUrl || '' // Ensure at least empty string is sent, not undefined
        };
        // Reuse existing modules from fetched data
        const existingModules = systemPageData?.modules || {};

        const payload = {
            modules: {
                ...existingModules,
                header: headerData
            },
            seo: {
                title: systemPagesForm.seoTitle,
                description: systemPagesForm.seoDescription
            }
        };

        // Inject home sections if applicable
        if (activeSystemPage === 'home') {
            payload.modules.categories = { ...payload.modules.categories, title: systemPagesForm.categoriesTitle };
            payload.modules.featured = { ...payload.modules.featured, title: systemPagesForm.featuredTitle };
            payload.modules.testimonials = { ...payload.modules.testimonials, title: systemPagesForm.testimonialsTitle };
            payload.modules.social = { ...payload.modules.social, title: systemPagesForm.socialTitle, link: systemPagesForm.socialLink };
        }

        updatePage({ slug: activeSystemPage, ...payload })
            .unwrap()
            .then((data) => {
                showToast('Page content and SEO updated successfully', 'success');
                setSystemBannerFile(null);

                // Optimistically update local state to prevent "erasing" effect while refetch happens
                const header = data?.modules?.header || {};
                const seo = data?.seo || {};

                setSystemPagesForm(prev => ({
                    ...prev,
                    title: header.title || prev.title,
                    eyebrow: header.eyebrow || prev.eyebrow,
                    subtitle: header.subtitle || prev.subtitle,
                    bannerImage: header.bannerImage || prev.bannerImage,
                    seoTitle: seo.title || prev.seoTitle,
                    seoDescription: seo.description || prev.seoDescription
                }));
            })
            .catch(err => showToast(err?.data?.message || err.message || 'Failed to update page', 'error'));
    };

    const handleSystemPageChange = (field, value) => {
        setSystemPagesForm(prev => ({ ...prev, [field]: value }));
    };

    // Care Guide Sections State (within 'care-guide' slug)
    const [careSections, setCareSections] = useState([]);

    useEffect(() => {
        if (activeSystemPage === 'care-guide' && systemPageData) {
            const data = systemPageData;
            if (data?.modules?.sections && data.modules.sections.length > 0) {
                setCareSections(data.modules.sections);
            } else {
                setCareSections(CARE_GUIDE_FALLBACK);
            }
        }
    }, [systemPageData, activeSystemPage]);

    const handleSaveCareGuide = async () => {
        const existingModules = systemPageData?.modules || {};

        updatePage({
            slug: 'care-guide',
            modules: {
                ...existingModules,
                sections: careSections
            }
        })
            .unwrap()
            .then(() => showToast('Care Guide content saved', 'success'))
            .catch(err => showToast(err?.data?.message || err.message, 'error'));
    };

    const handleAddCareSection = () => {
        setCareSections([...careSections, { title: '', content: '', points: [] }]);
    };

    const handleRemoveCareSection = (index) => {
        setCareSections(careSections.filter((_, i) => i !== index));
    };

    const handleCareSectionChange = (index, field, value) => {
        const updated = [...careSections];
        updated[index] = { ...updated[index], [field]: value };
        setCareSections(updated);
    };

    const handleAddCarePoint = (secIndex) => {
        const updated = [...careSections];
        updated[secIndex].points = [...(updated[secIndex].points || []), ''];
        setCareSections(updated);
    };

    const handleCarePointChange = (secIndex, ptIndex, value) => {
        const updated = [...careSections];
        updated[secIndex].points[ptIndex] = value;
        setCareSections(updated);
    };

    const handleRemoveCarePoint = (secIndex, ptIndex) => {
        const updated = [...careSections];
        updated[secIndex].points = updated[secIndex].points.filter((_, i) => i !== ptIndex);
        setCareSections(updated);
    };

    return (
        <div className="">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8">
                <h1 className="font-heading text-3xl text-light">Content Management</h1>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 mb-8 overflow-x-auto whitespace-nowrap no-scrollbar pb-1">
                {['Hero', 'Testimonials', 'Social Feed', 'Home Content', 'Social Links', 'Interface', 'Policies', 'FAQ', 'About', 'Legal Pages', 'System Pages'].map((tab) => {
                    const tabKey = tab.toLowerCase().replace(' ', '');
                    const isActive = activeTab === tabKey || 
                        (tabKey === 'homecontent' && (activeTab === 'heritage' || activeTab === 'trustbadges')) ||
                        (tabKey === 'sociallinks' && activeTab === 'social');
                    return (
                        <button
                            key={tab}
                            className={`px-6 py-3 font-medium text-sm transition-all relative shrink-0 ${isActive
                                ? 'text-primary'
                                : 'text-light/60 hover:text-light'
                                }`}
                            onClick={() => setActiveTab(tabKey)}
                        >
                            {tab}
                            {isActive && (
                                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"></span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="space-y-8">
                {activeTab === 'hero' && (
                    <>
                        <div className="bg-dark-paper border border-white/10 rounded-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-heading text-light">{editingHero ? 'Edit Slide' : 'Add New Slide'}</h2>
                                {editingHero && (
                                    <button onClick={handleCancelEdit} className="text-primary hover:underline text-sm font-medium">
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                            <form onSubmit={handleSaveHero} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2 bg-primary/5 border border-primary/20 rounded-sm p-4 mb-2 flex items-start gap-4 animate-fade-in">
                                    <div className="bg-primary/20 p-2 rounded-full hidden sm:block">
                                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="text-xs space-y-1 text-light/70">
                                        <p className="font-bold text-primary uppercase tracking-widest text-[10px] mb-1">Recommended Media Specs</p>
                                        <p>• <span className="text-light">Aspect Ratio:</span> 16:9 (Landscape) for full screen fit.</p>
                                        <p>• <span className="text-light">Resolution:</span> 1920x1080px (HD) or 2560x1440px (2K) for best quality.</p>
                                        <p>• <span className="text-light">Safe Zone:</span> Keep main subjects in the center to avoid cropping on mobile screens.</p>
                                        <p>• <span className="text-light">Size:</span> Images &lt; 500KB (WebP/JPG) | Videos &lt; 10MB (MP4/H.264).</p>
                                    </div>
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Title (Optional)"
                                    value={newHero.title}
                                    onChange={e => setNewHero({ ...newHero, title: e.target.value })}
                                />
                                <Input
                                    type="text"
                                    placeholder="Subtitle (Optional)"
                                    value={newHero.subtitle}
                                    onChange={e => setNewHero({ ...newHero, subtitle: e.target.value })}
                                />
                                <div className="space-y-1">
                                    <label className="block text-[10px] text-light/60 uppercase tracking-wider mb-1">Desktop Banner *</label>
                                    <input
                                        type="file"
                                        className="bg-body border border-white/10 rounded p-2 text-light w-full"
                                        onChange={e => setHeroImageFile(e.target.files[0])}
                                        required={!editingHero}
                                        accept="image/*,video/*"
                                    />
                                    {editingHero && !heroImageFile && <p className="text-[10px] text-light/40 ml-1">Leave empty to keep current media</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] text-light/60 uppercase tracking-wider mb-1">Mobile Banner (Optional)</label>
                                    <input
                                        type="file"
                                        className="bg-body border border-white/10 rounded p-2 text-light w-full"
                                        onChange={e => setHeroMobileImageFile(e.target.files[0])}
                                        accept="image/*,video/*"
                                    />
                                    {editingHero && !heroMobileImageFile && <p className="text-[10px] text-light/40 ml-1">Leave empty to keep current mobile media</p>}
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Link (e.g., /shop)"
                                    value={newHero.link}
                                    onChange={e => setNewHero({ ...newHero, link: e.target.value })}
                                />
                                {/* <Input
                                    type="number"
                                    placeholder="Order"
                                    value={newHero.order}
                                    onChange={e => setNewHero({ ...newHero, order: e.target.value })}
                                /> */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="showButton"
                                        checked={newHero.showButton}
                                        onChange={e => setNewHero({ ...newHero, showButton: e.target.checked })}
                                        className="w-4 h-4 text-primary bg-body border-white/20 rounded focus:ring-primary focus:ring-2"
                                    />
                                    <label htmlFor="showButton" className="text-sm text-light">Show Button on Banner</label>
                                </div>
                                <div className="md:col-span-2 flex gap-3 mt-2">
                                    <button type="submit" disabled={isAddingHero || isUpdatingHero || isUploading} className="flex-1 bg-primary text-dark font-bold rounded p-3 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isAddingHero || isUpdatingHero || isUploading ? 'Processing...' : (editingHero ? 'Update Slide' : 'Add Slide')}
                                    </button>
                                    {editingHero && (
                                        <button type="button" onClick={handleCancelEdit} className="px-6 border border-white/10 text-light rounded font-bold hover:bg-white/5">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        <h3 ref={heroListRef} className="text-sm font-bold uppercase text-light/80 mb-4">Previously Added Items</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {(heroSlides && Array.isArray(heroSlides) ? heroSlides : []).map(slide => (
                                <div key={slide._id} className="relative group overflow-hidden rounded-lg border border-white/10">
                                    {isVideo(slide.media) ? (
                                        <video src={getMediaUrl(slide.media)} className="w-full h-48 object-cover" controls muted />
                                    ) : (
                                        <PreviewableImage 
                                            src={getMediaUrl(slide.media)} 
                                            alt={slide.title} 
                                            containerClassName="w-full h-48"
                                        />
                                    )}
                                    <div className="p-4 bg-dark-paper">
                                        <h3 className="font-bold text-light truncate">{slide.title}</h3>
                                        <p className="text-sm text-light/60 truncate">{slide.subtitle}</p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <button
                                                onClick={() => handleEditHero(slide)}
                                                className="text-primary text-xs uppercase tracking-wider hover:underline"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteHero(slide._id)}
                                                className="text-red-500 text-xs uppercase tracking-wider hover:text-red-400"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'testimonials' && (
                    <>
                        <div className="bg-dark-paper border border-white/10 rounded-lg p-6">
                            <h2 className="text-xl font-heading text-light mb-4">Add Testimonial</h2>
                            <form onSubmit={handleAddTestimonial} className="grid grid-cols-1 gap-4">
                                <Textarea
                                    placeholder="Testimonial Text *"
                                    rows="3"
                                    value={newTestimonial.text}
                                    onChange={e => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                                    required
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        type="text"
                                        placeholder="Author Name *"
                                        value={newTestimonial.author}
                                        onChange={e => setNewTestimonial({ ...newTestimonial, author: e.target.value })}
                                        required
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Role (Optional)"
                                        value={newTestimonial.role}
                                        onChange={e => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                                    />
                                </div>
                                <button type="submit" disabled={isAddingTestimonial} className="bg-primary text-dark font-bold rounded p-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isAddingTestimonial ? 'Adding Testimonial...' : 'Add Testimonial'}
                                </button>
                            </form>
                        </div>

                        <h3 ref={testimonialListRef} className="text-sm font-bold uppercase text-light/80 mb-4">Previously Added Items</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(testimonials && Array.isArray(testimonials) ? testimonials : []).map(t => (
                                <div key={t._id} className="bg-dark-paper border border-white/10 rounded-lg p-6 relative">
                                    <p className="italic text-light/80 mb-4">"{t.text}"</p>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-primary">{t.author}</p>
                                            <p className="text-xs text-light/50">{t.role}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteTestimonial(t._id)}
                                            className="text-red-500 text-xs uppercase hover:text-red-400"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'socialfeed' && (
                    <>
                        <div className="bg-dark-paper border border-white/10 rounded-lg p-6">
                            <h2 className="text-xl font-heading text-light mb-4">Add Social Post</h2>
                            <form onSubmit={handleAddSocial} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="file"
                                    className="bg-body border border-white/10 rounded p-2 text-light"
                                    onChange={e => setSocialImageFile(e.target.files[0])}
                                    required
                                />
                                <Select
                                    value={newSocial.platform}
                                    onChange={e => setNewSocial({ ...newSocial, platform: e.target.value })}
                                    options={[
                                        { value: 'Instagram', label: 'Instagram' },
                                        { value: 'Facebook', label: 'Facebook' },
                                        // { value: 'Pinterest', label: 'Pinterest' }
                                    ]}
                                />
                                <div className="md:col-span-2">
                                    <Input
                                        type="text"
                                        placeholder="Post Link (Optional)"
                                        value={newSocial.link}
                                        onChange={e => setNewSocial({ ...newSocial, link: e.target.value })}
                                    />
                                </div>
                                <button type="submit" disabled={isAddingSocial || isUploading} className="bg-primary text-dark font-bold rounded p-2 md:col-span-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isAddingSocial || isUploading ? 'Adding Post...' : 'Add Post'}
                                </button>
                            </form>
                        </div>

                        <h3 ref={socialListRef} className="text-sm font-bold uppercase text-light/80 mb-4">Previously Added Items</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {(socialFeed && Array.isArray(socialFeed) ? socialFeed : []).map(post => (
                                <div key={post._id} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10">
                                    {isVideo(post.media) ? (
                                        <video src={getMediaUrl(post.media)} className="w-full h-full object-cover" controls muted />
                                    ) : (
                                        <PreviewableImage 
                                            src={getMediaUrl(post.media)} 
                                            alt={post.platform} 
                                            containerClassName="w-full h-full"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                        <p className="text-primary font-bold mb-2">{post.platform}</p>
                                        <button
                                            onClick={() => handleDeleteSocial(post._id)}
                                            className="bg-red-500/20 text-red-500 border border-red-500 px-3 py-1 rounded text-xs hover:bg-red-500 hover:text-white transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {(activeTab === 'homecontent' || activeTab === 'heritage' || activeTab === 'trustbadges') && (
                    <div className="space-y-8">
                        {/* The Gold Standard Section */}
                        <div ref={goldStandardFormRef} className="bg-dark-paper border border-white/10 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-heading text-light">Edit The Gold Standard Section</h2>
                                <span className="text-xs uppercase tracking-wider text-primary font-mono bg-primary/10 px-2.5 py-1 rounded">Spotlight</span>
                            </div>
                            <form onSubmit={handleUpdateGoldStandard} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Title *</label>
                                        <Input
                                            type="text"
                                            value={goldStandardForm.title}
                                            onChange={e => setGoldStandardForm({ ...goldStandardForm, title: e.target.value })}
                                            placeholder="The Gold Standard"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Subtitle</label>
                                        <Input
                                            type="text"
                                            value={goldStandardForm.subtitle}
                                            onChange={e => setGoldStandardForm({ ...goldStandardForm, subtitle: e.target.value })}
                                            placeholder="Excellence in Material"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Button Text</label>
                                        <Input
                                            type="text"
                                            value={goldStandardForm.linkText}
                                            onChange={e => setGoldStandardForm({ ...goldStandardForm, linkText: e.target.value })}
                                            placeholder="Discover Our Craft"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Button Link</label>
                                        <Input
                                            type="text"
                                            value={goldStandardForm.link}
                                            onChange={e => setGoldStandardForm({ ...goldStandardForm, link: e.target.value })}
                                            placeholder="/collections"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Description (Paragraph 1)</label>
                                        <Textarea
                                            rows="3"
                                            value={goldStandardForm.description}
                                            onChange={e => setGoldStandardForm({ ...goldStandardForm, description: e.target.value })}
                                            placeholder="At Clays, gold isn't just a medium..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Description (Paragraph 2)</label>
                                        <Textarea
                                            rows="3"
                                            value={goldStandardForm.description2}
                                            onChange={e => setGoldStandardForm({ ...goldStandardForm, description2: e.target.value })}
                                            placeholder="Each piece is hand-poured, forged..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Current Image</label>
                                        {goldStandardForm.image && (
                                            <PreviewableImage 
                                                src={getMediaUrl(goldStandardForm.image)} 
                                                alt="The Gold Standard" 
                                                containerClassName="h-20"
                                                className="h-full object-cover rounded mb-2"
                                            />
                                        )}
                                        <input
                                            type="file"
                                            className="bg-body border border-white/10 rounded p-2 text-light w-full"
                                            onChange={e => setGoldStandardImageFile(e.target.files[0])}
                                        />
                                    </div>
                                </div>
                                <button type="submit" disabled={isUpdatingGoldStandard || isUploading} className="bg-primary text-dark font-bold rounded p-3 md:col-span-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all">
                                    {isUpdatingGoldStandard || isUploading ? 'Updating...' : 'Update The Gold Standard Section'}
                                </button>
                            </form>
                        </div>

                        {/* Heritage Section (Mastery in Every Cut) */}
                        <div ref={heritageFormRef} className="bg-dark-paper border border-white/10 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-heading text-light">Edit Heritage Section</h2>
                                <span className="text-xs uppercase tracking-wider text-primary font-mono bg-primary/10 px-2.5 py-1 rounded">Mastery in Every Cut</span>
                            </div>
                            <form onSubmit={handleUpdateHeritage} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Title *</label>
                                        <Input
                                            type="text"
                                            value={heritageForm.title}
                                            onChange={e => setHeritageForm({ ...heritageForm, title: e.target.value })}
                                            placeholder="Mastery in Every Cut"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Subtitle (Since Year)</label>
                                        <Input
                                            type="text"
                                            value={heritageForm.subtitle}
                                            onChange={e => setHeritageForm({ ...heritageForm, subtitle: e.target.value })}
                                            placeholder="Since 1985"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Button Text</label>
                                        <Input
                                            type="text"
                                            value={heritageForm.linkText}
                                            onChange={e => setHeritageForm({ ...heritageForm, linkText: e.target.value })}
                                            placeholder="Read Our Story"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Button Link</label>
                                        <Input
                                            type="text"
                                            value={heritageForm.link}
                                            onChange={e => setHeritageForm({ ...heritageForm, link: e.target.value })}
                                            placeholder="/about"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Description (Paragraph 1)</label>
                                        <Textarea
                                            rows="3"
                                            value={heritageForm.description}
                                            onChange={e => setHeritageForm({ ...heritageForm, description: e.target.value })}
                                            placeholder="Our heritage is built on a foundation..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Description (Paragraph 2)</label>
                                        <Textarea
                                            rows="3"
                                            value={heritageForm.description2}
                                            onChange={e => setHeritageForm({ ...heritageForm, description2: e.target.value })}
                                            placeholder="Every gem is hand-selected, cut with mathematical precision..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Current Image</label>
                                        {heritageForm.image && (
                                            <PreviewableImage 
                                                src={getMediaUrl(heritageForm.image)} 
                                                alt="Heritage" 
                                                containerClassName="h-20"
                                                className="h-full object-cover rounded mb-2"
                                            />
                                        )}
                                        <input
                                            type="file"
                                            className="bg-body border border-white/10 rounded p-2 text-light w-full"
                                            onChange={e => setHeritageImageFile(e.target.files[0])}
                                        />
                                    </div>
                                </div>
                                <button type="submit" disabled={isUpdatingHeritage || isUploading} className="bg-primary text-dark font-bold rounded p-3 md:col-span-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all">
                                    {isUpdatingHeritage || isUploading ? 'Updating...' : 'Update Heritage Section'}
                                </button>
                            </form>
                        </div>

                        {/* Our Vision Section */}
                        <div ref={ourVisionFormRef} className="bg-dark-paper border border-white/10 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-heading text-light">Edit Our Vision Section</h2>
                                <span className="text-xs uppercase tracking-wider text-primary font-mono bg-primary/10 px-2.5 py-1 rounded">Philosophy</span>
                            </div>
                            <form onSubmit={handleUpdateOurVision} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Section Title *</label>
                                        <Input
                                            type="text"
                                            value={ourVisionForm.title}
                                            onChange={e => setOurVisionForm({ ...ourVisionForm, title: e.target.value })}
                                            placeholder="Our Vision"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Section Description</label>
                                        <Textarea
                                            rows="2"
                                            value={ourVisionForm.description}
                                            onChange={e => setOurVisionForm({ ...ourVisionForm, description: e.target.value })}
                                            placeholder="Crafted with intention. We believe true luxury lies in the purity of ingredients..."
                                        />
                                    </div>
                                </div>

                                {/* Pillars / 3 Cards */}
                                <div className="border-t border-white/10 pt-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4">Vision Pillars / Feature Cards (3 Pillars)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Pillar 1 */}
                                        <div className="bg-dark border border-white/10 rounded-lg p-4 space-y-3">
                                            <span className="text-xs text-primary font-mono uppercase tracking-wider">Pillar 1</span>
                                            <div>
                                                <label className="block text-light/60 text-xs mb-1">Title</label>
                                                <Input
                                                    type="text"
                                                    value={ourVisionForm.item1Title}
                                                    onChange={e => setOurVisionForm({ ...ourVisionForm, item1Title: e.target.value })}
                                                    placeholder="Clean Ingredients"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-light/60 text-xs mb-1">Icon (e.g. sparkles, star, leaf)</label>
                                                <Input
                                                    type="text"
                                                    value={ourVisionForm.item1Icon}
                                                    onChange={e => setOurVisionForm({ ...ourVisionForm, item1Icon: e.target.value })}
                                                    placeholder="sparkles"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-light/60 text-xs mb-1">Description</label>
                                                <Textarea
                                                    rows="3"
                                                    value={ourVisionForm.item1Description}
                                                    onChange={e => setOurVisionForm({ ...ourVisionForm, item1Description: e.target.value })}
                                                    placeholder="Formulated without harmful toxins, sulfates, or parabens..."
                                                />
                                            </div>
                                        </div>

                                        {/* Pillar 2 */}
                                        <div className="bg-dark border border-white/10 rounded-lg p-4 space-y-3">
                                            <span className="text-xs text-primary font-mono uppercase tracking-wider">Pillar 2</span>
                                            <div>
                                                <label className="block text-light/60 text-xs mb-1">Title</label>
                                                <Input
                                                    type="text"
                                                    value={ourVisionForm.item2Title}
                                                    onChange={e => setOurVisionForm({ ...ourVisionForm, item2Title: e.target.value })}
                                                    placeholder="Cruelty-Free"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-light/60 text-xs mb-1">Icon (e.g. heart, eco, nature)</label>
                                                <Input
                                                    type="text"
                                                    value={ourVisionForm.item2Icon}
                                                    onChange={e => setOurVisionForm({ ...ourVisionForm, item2Icon: e.target.value })}
                                                    placeholder="heart"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-light/60 text-xs mb-1">Description</label>
                                                <Textarea
                                                    rows="3"
                                                    value={ourVisionForm.item2Description}
                                                    onChange={e => setOurVisionForm({ ...ourVisionForm, item2Description: e.target.value })}
                                                    placeholder="Never tested on animals. We are committed to ethical beauty..."
                                                />
                                            </div>
                                        </div>

                                        {/* Pillar 3 */}
                                        <div className="bg-dark border border-white/10 rounded-lg p-4 space-y-3">
                                            <span className="text-xs text-primary font-mono uppercase tracking-wider">Pillar 3</span>
                                            <div>
                                                <label className="block text-light/60 text-xs mb-1">Title</label>
                                                <Input
                                                    type="text"
                                                    value={ourVisionForm.item3Title}
                                                    onChange={e => setOurVisionForm({ ...ourVisionForm, item3Title: e.target.value })}
                                                    placeholder="Dermatologist Tested"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-light/60 text-xs mb-1">Icon (e.g. shield, check, award)</label>
                                                <Input
                                                    type="text"
                                                    value={ourVisionForm.item3Icon}
                                                    onChange={e => setOurVisionForm({ ...ourVisionForm, item3Icon: e.target.value })}
                                                    placeholder="shield"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-light/60 text-xs mb-1">Description</label>
                                                <Textarea
                                                    rows="3"
                                                    value={ourVisionForm.item3Description}
                                                    onChange={e => setOurVisionForm({ ...ourVisionForm, item3Description: e.target.value })}
                                                    placeholder="Rigorously tested to ensure optimal safety and performance..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isUpdatingOurVision}
                                    className="bg-primary text-dark font-bold rounded p-3 w-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
                                >
                                    {isUpdatingOurVision ? 'Updating...' : 'Update Our Vision Section'}
                                </button>
                            </form>
                        </div>

                        {/* Discover Section (Ritual / Glow) */}
                        <div ref={discoverFormRef} className="bg-dark-paper border border-white/10 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-heading text-light">Edit Discover Section</h2>
                                <span className="text-xs uppercase tracking-wider text-primary font-mono bg-primary/10 px-2.5 py-1 rounded">Routine / Ritual</span>
                            </div>
                            <form onSubmit={handleUpdateDiscover} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Badge / Eyebrow Text</label>
                                        <Input
                                            type="text"
                                            value={discoverForm.badge}
                                            onChange={e => setDiscoverForm({ ...discoverForm, badge: e.target.value })}
                                            placeholder="Elevate Your Ritual"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Main Title *</label>
                                        <Input
                                            type="text"
                                            value={discoverForm.title}
                                            onChange={e => setDiscoverForm({ ...discoverForm, title: e.target.value })}
                                            placeholder="Discover Your"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Highlighted (Italic) Title</label>
                                        <Input
                                            type="text"
                                            value={discoverForm.highlightText}
                                            onChange={e => setDiscoverForm({ ...discoverForm, highlightText: e.target.value })}
                                            placeholder="Ultimate Glow"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Button Text</label>
                                        <Input
                                            type="text"
                                            value={discoverForm.linkText}
                                            onChange={e => setDiscoverForm({ ...discoverForm, linkText: e.target.value })}
                                            placeholder="Shop The Ritual"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Button Link</label>
                                        <Input
                                            type="text"
                                            value={discoverForm.link}
                                            onChange={e => setDiscoverForm({ ...discoverForm, link: e.target.value })}
                                            placeholder="/shop"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Description</label>
                                        <Textarea
                                            rows="5"
                                            value={discoverForm.description}
                                            onChange={e => setDiscoverForm({ ...discoverForm, description: e.target.value })}
                                            placeholder="Curate a bespoke skincare routine tailored to your unique needs..."
                                        />
                                    </div>
                                    {/* Text Preview Box */}
                                    <div className="bg-dark border border-white/10 rounded-lg p-5 text-center">
                                        <span className="text-[10px] text-light/40 uppercase tracking-widest block mb-2">Live Text Preview</span>
                                        <span className="inline-block py-0.5 px-3 border border-primary/40 rounded-full text-primary text-[10px] uppercase tracking-widest font-bold mb-2">
                                            {discoverForm.badge || "Elevate Your Ritual"}
                                        </span>
                                        <h3 className="text-xl font-heading font-bold text-light mb-2">
                                            {discoverForm.title || "Discover Your"} <span className="text-primary italic">{discoverForm.highlightText || "Ultimate Glow"}</span>
                                        </h3>
                                        <p className="text-xs text-light/70 max-w-sm mx-auto mb-3">
                                            {discoverForm.description || "Curate a bespoke skincare routine tailored to your unique needs..."}
                                        </p>
                                        <span className="text-[11px] font-heading font-bold uppercase tracking-widest border border-primary text-primary px-4 py-1 rounded inline-block">
                                            {discoverForm.linkText || "Shop The Ritual"}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isUpdatingDiscover}
                                    className="bg-primary text-dark font-bold rounded p-3 md:col-span-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
                                >
                                    {isUpdatingDiscover ? 'Updating...' : 'Update Discover Section'}
                                </button>
                            </form>
                        </div>

                        {/* Trust Badges Section */}
                        <div ref={trustBadgeListRef} className="bg-dark-paper border border-white/10 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-heading text-light">Trust Badges</h2>
                                <span className="text-xs uppercase tracking-wider text-primary font-mono bg-primary/10 px-2.5 py-1 rounded">
                                    {trustBadges?.length || 0} Badges
                                </span>
                            </div>
                            <p className="text-sm text-light/60 mb-6">
                                Add, manage, and scroll through the trust badges displayed in the ribbon across the homepage. The ✦ symbol is automatically prefixed.
                            </p>

                            {/* Add Form */}
                            <form onSubmit={handleAddTrustBadge} className="flex flex-col sm:flex-row gap-4 mb-6">
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Badge Text * (e.g. Lifetime Warranty)"
                                        value={newTrustBadge.text}
                                        onChange={e => setNewTrustBadge({ ...newTrustBadge, text: e.target.value })}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isAddingTrustBadge}
                                    className="bg-primary text-dark font-bold rounded px-6 py-2.5 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                >
                                    {isAddingTrustBadge ? 'Adding Badge...' : '+ Add Trust Badge'}
                                </button>
                            </form>

                            {/* Horizontal Scrollable Ribbon Preview */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-light/70">
                                        Scroll Trust Badges (Live Ribbon Preview)
                                    </span>
                                    <span className="text-xs text-light/40">Scroll horizontally →</span>
                                </div>
                                <div className="overflow-x-auto pb-3 pt-1 hide-scrollbar border border-white/10 rounded-lg bg-black/40 p-3">
                                    <div className="flex items-center gap-4 w-max">
                                        {(trustBadges && Array.isArray(trustBadges) && trustBadges.length > 0 ? trustBadges : [
                                            { text: "Ethically Sourced" },
                                            { text: "Handcrafted Excellence" },
                                            { text: "Lifetime Warranty" },
                                            { text: "Secure Shipping" }
                                        ]).map((badge, idx) => (
                                            <div key={badge._id || idx} className="flex items-center gap-2 px-4 py-2 bg-black border border-white/20 rounded-full !text-white flex-shrink-0">
                                                <span className="text-primary text-base">✦</span>
                                                <span className="font-heading text-xs tracking-wider uppercase !text-white font-medium">{badge.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Existing Badges List with Delete Buttons */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-light/80 mb-3">
                                    Existing Badges ({trustBadges?.length || 0})
                                </h3>
                                {trustBadges && trustBadges.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        {trustBadges.map((badge) => (
                                            <div key={badge._id} className="bg-black border border-white/20 rounded-lg p-3.5 flex items-center justify-between group hover:border-primary/40 transition-colors">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <span className="text-primary text-lg flex-shrink-0">✦</span>
                                                    <div className="min-w-0">
                                                        <p className="font-heading text-sm !text-white font-medium truncate">{badge.text}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteTrustBadge(badge._id)}
                                                    className="text-red-500/70 hover:text-red-400 p-1.5 transition-colors flex-shrink-0"
                                                    title="Delete badge"
                                                >
                                                    <Icons.Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-light/40 italic">No custom trust badges added yet. Default badges are currently displayed on the homepage.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {(activeTab === 'sociallinks' || activeTab === 'social') && (
                    <div className="bg-dark-paper border border-white/10 rounded-lg p-6 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h2 className="text-xl font-heading text-light">Social Media Links</h2>
                                <p className="text-sm text-light/60">Configure public social profile links shown in footer and header.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveSocialLinks} className="space-y-6 max-w-2xl">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Instagram URL</label>
                                <Input
                                    type="text"
                                    value={socialLinksForm.instagram}
                                    onChange={(e) => setSocialLinksForm({ ...socialLinksForm, instagram: e.target.value })}
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">Facebook URL</label>
                                <Input
                                    type="text"
                                    value={socialLinksForm.facebook}
                                    onChange={(e) => setSocialLinksForm({ ...socialLinksForm, facebook: e.target.value })}
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-light/60 mb-2">YouTube URL</label>
                                <Input
                                    type="text"
                                    value={socialLinksForm.youtube}
                                    onChange={(e) => setSocialLinksForm({ ...socialLinksForm, youtube: e.target.value })}
                                    placeholder="https://youtube.com/..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdatingSettings}
                                className="bg-primary text-dark font-bold rounded px-6 py-2.5 hover:bg-primary/90 transition-all disabled:opacity-50"
                            >
                                {isUpdatingSettings ? 'Saving...' : 'Save Social Links'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'interface' && (
                    <div className="bg-dark-paper border border-white/10 rounded-lg p-6 space-y-8">
                        <div>
                            <h2 className="text-xl font-heading text-light">Interface & Labels</h2>
                            <p className="text-sm text-light/60">Manage announcement bar and UI text labels across the store.</p>
                        </div>

                        <form onSubmit={handleSaveInterface} className="space-y-8">
                            {/* Announcement Bar */}
                            <div className="p-4 border border-white/5 rounded-lg bg-black/20">
                                <h3 className="text-lg font-heading text-primary mb-3">Header Announcement Bar</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-light/70 uppercase">Announcement Text</label>
                                        <Input
                                            type="text"
                                            value={interfaceForm.announcement?.text || ''}
                                            onChange={(e) => setInterfaceForm({
                                                ...interfaceForm,
                                                announcement: { ...interfaceForm.announcement, text: e.target.value }
                                            })}
                                            placeholder="e.g. Complimentary Shipping on all Orders"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-light/70 uppercase">Link URL</label>
                                        <Input
                                            type="text"
                                            value={interfaceForm.announcement?.link || ''}
                                            onChange={(e) => setInterfaceForm({
                                                ...interfaceForm,
                                                announcement: { ...interfaceForm.announcement, link: e.target.value }
                                            })}
                                            placeholder="/shop or https://..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Interface Text Labels */}
                            <div className="p-4 border border-white/5 rounded-lg bg-black/20">
                                <h3 className="text-lg font-heading text-primary mb-3">UI & Text Labels</h3>
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
                                                    value={interfaceForm.uiLabels?.search?.placeholder || ''}
                                                    onChange={(e) => setInterfaceForm(prev => ({
                                                        ...prev,
                                                        uiLabels: {
                                                            ...prev.uiLabels,
                                                            search: { ...prev.uiLabels.search, placeholder: e.target.value }
                                                        }
                                                    }))}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-light/60 text-xs mb-1">No Results Message</label>
                                                <Input
                                                    type="text"
                                                    value={interfaceForm.uiLabels?.search?.noResults || ''}
                                                    onChange={(e) => setInterfaceForm(prev => ({
                                                        ...prev,
                                                        uiLabels: {
                                                            ...prev.uiLabels,
                                                            search: { ...prev.uiLabels.search, noResults: e.target.value }
                                                        }
                                                    }))}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-light/60 text-xs mb-1">Popular Search Terms (comma separated)</label>
                                                <Input
                                                    type="text"
                                                    value={interfaceForm.uiLabels?.search?.popularTerms?.join(', ') || ''}
                                                    onChange={(e) => setInterfaceForm(prev => ({
                                                        ...prev,
                                                        uiLabels: {
                                                            ...prev.uiLabels,
                                                            search: {
                                                                ...prev.uiLabels.search,
                                                                popularTerms: e.target.value.split(',').map(s => s.trim())
                                                            }
                                                        }
                                                    }))}
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
                                                    value={interfaceForm.uiLabels?.cart?.emptyMessage || ''}
                                                    onChange={(e) => setInterfaceForm(prev => ({
                                                        ...prev,
                                                        uiLabels: {
                                                            ...prev.uiLabels,
                                                            cart: { ...prev.uiLabels.cart, emptyMessage: e.target.value }
                                                        }
                                                    }))}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-light/60 text-xs mb-1">Start Shopping Button</label>
                                                <Input
                                                    type="text"
                                                    value={interfaceForm.uiLabels?.cart?.startShoppingBtn || ''}
                                                    onChange={(e) => setInterfaceForm(prev => ({
                                                        ...prev,
                                                        uiLabels: {
                                                            ...prev.uiLabels,
                                                            cart: { ...prev.uiLabels.cart, startShoppingBtn: e.target.value }
                                                        }
                                                    }))}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-light/60 text-xs mb-1">Checkout Disclaimer</label>
                                                <Input
                                                    type="text"
                                                    value={interfaceForm.uiLabels?.cart?.disclaimer || ''}
                                                    onChange={(e) => setInterfaceForm(prev => ({
                                                        ...prev,
                                                        uiLabels: {
                                                            ...prev.uiLabels,
                                                            cart: { ...prev.uiLabels.cart, disclaimer: e.target.value }
                                                        }
                                                    }))}
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
                                                    value={interfaceForm.uiLabels?.auth?.loginTitle || ''}
                                                    onChange={(e) => setInterfaceForm(prev => ({
                                                        ...prev,
                                                        uiLabels: {
                                                            ...prev.uiLabels,
                                                            auth: { ...prev.uiLabels.auth, loginTitle: e.target.value }
                                                        }
                                                    }))}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-light/60 text-xs mb-1">Register Title</label>
                                                <Input
                                                    type="text"
                                                    value={interfaceForm.uiLabels?.auth?.registerTitle || ''}
                                                    onChange={(e) => setInterfaceForm(prev => ({
                                                        ...prev,
                                                        uiLabels: {
                                                            ...prev.uiLabels,
                                                            auth: { ...prev.uiLabels.auth, registerTitle: e.target.value }
                                                        }
                                                    }))}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-light/60 text-xs mb-1">Login Subtitle</label>
                                                <Input
                                                    type="text"
                                                    value={interfaceForm.uiLabels?.auth?.loginSubtitle || ''}
                                                    onChange={(e) => setInterfaceForm(prev => ({
                                                        ...prev,
                                                        uiLabels: {
                                                            ...prev.uiLabels,
                                                            auth: { ...prev.uiLabels.auth, loginSubtitle: e.target.value }
                                                        }
                                                    }))}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-light/60 text-xs mb-1">Register Subtitle</label>
                                                <Input
                                                    type="text"
                                                    value={interfaceForm.uiLabels?.auth?.registerSubtitle || ''}
                                                    onChange={(e) => setInterfaceForm(prev => ({
                                                        ...prev,
                                                        uiLabels: {
                                                            ...prev.uiLabels,
                                                            auth: { ...prev.uiLabels.auth, registerSubtitle: e.target.value }
                                                        }
                                                    }))}
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
                                                    value={interfaceForm.uiLabels?.product?.relatedTitle || ''}
                                                    onChange={(e) => setInterfaceForm(prev => ({
                                                        ...prev,
                                                        uiLabels: {
                                                            ...prev.uiLabels,
                                                            product: { ...prev.uiLabels.product, relatedTitle: e.target.value }
                                                        }
                                                    }))}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-light/60 text-xs mb-1">Reviews Title</label>
                                                <Input
                                                    type="text"
                                                    value={interfaceForm.uiLabels?.product?.reviewsTitle || ''}
                                                    onChange={(e) => setInterfaceForm(prev => ({
                                                        ...prev,
                                                        uiLabels: {
                                                            ...prev.uiLabels,
                                                            product: { ...prev.uiLabels.product, reviewsTitle: e.target.value }
                                                        }
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdatingSettings}
                                className="bg-primary text-dark font-bold rounded px-6 py-2.5 hover:bg-primary/90 transition-all disabled:opacity-50"
                            >
                                {isUpdatingSettings ? 'Saving...' : 'Save Interface Settings'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'policies' && (
                    <div className="bg-dark-paper border border-white/10 rounded-lg p-6 space-y-6">
                        <div>
                            <h2 className="text-xl font-heading text-light">Product Policies</h2>
                            <p className="text-sm text-light/60">Configure standard shipping, returns, and care guidelines shown on product pages.</p>
                        </div>

                        <form onSubmit={handleSavePolicies} className="space-y-6 max-w-3xl">
                            <div className="space-y-2">
                                <label className="text-xs text-light/70 uppercase">Shipping & Returns Text</label>
                                <Textarea
                                    rows="5"
                                    value={policiesForm.shipping || ''}
                                    onChange={(e) => setPoliciesForm({ ...policiesForm, shipping: e.target.value })}
                                    placeholder="Enter standard shipping terms and return policy (supports bullet points on each line)..."
                                />
                                <p className="text-[11px] text-light/40">Tip: Enter each point on a new line (e.g. starting with • or -) to show as formatted bullet points on product pages.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-light/70 uppercase">Care Instructions (Default)</label>
                                <Textarea
                                    rows="5"
                                    value={policiesForm.care || ''}
                                    onChange={(e) => setPoliciesForm({ ...policiesForm, care: e.target.value })}
                                    placeholder="Enter general jewelry care instructions (supports bullet points on each line)..."
                                />
                                <p className="text-[11px] text-light/40">Tip: Enter each point on a new line (e.g. starting with • or -) to show as formatted bullet points on product pages.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdatingSettings}
                                className="bg-primary text-dark font-bold rounded px-6 py-2.5 hover:bg-primary/90 transition-all disabled:opacity-50"
                            >
                                {isUpdatingSettings ? 'Saving...' : 'Save Product Policies'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'faq' && (
                    <>
                        <div className="bg-dark-paper border border-white/10 rounded-lg p-6">
                            <h2 className="text-xl font-heading text-light mb-4">Add FAQ</h2>
                            <form onSubmit={handleAddFAQ} className="grid grid-cols-1 gap-4">
                                <Input
                                    type="text"
                                    placeholder="Question *"
                                    value={newFAQ.question}
                                    onChange={e => setNewFAQ({ ...newFAQ, question: e.target.value })}
                                    required
                                />
                                <Textarea
                                    placeholder="Answer *"
                                    rows="3"
                                    value={newFAQ.answer}
                                    onChange={e => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                                    required
                                />
                                <div className="flex justify-end">
                                    <button type="submit" disabled={isAddingFAQ} className="bg-primary text-dark font-bold rounded px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isAddingFAQ ? 'Adding Question...' : 'Add Question'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <h3 ref={faqListRef} className="text-sm font-bold uppercase text-light/80 mb-4">Previously Added Items</h3>
                        <div className="space-y-4">
                            {(faqs && Array.isArray(faqs) ? faqs : []).map(faq => (
                                <div key={faq._id} className="bg-dark-paper border border-white/10 rounded-lg p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-light mb-2">{faq.question}</h3>
                                            <p className="text-light/70 text-sm whitespace-pre-wrap">{faq.answer}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteFAQ(faq._id)}
                                            className="text-red-500 hover:text-red-400 ml-4"
                                            title="Delete FAQ"
                                        >
                                            <Icons.Trash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'about' && (
                    <div ref={aboutFormRef} className="bg-dark-paper border border-white/10 rounded-lg p-6">
                        <h2 className="text-xl font-heading text-light mb-4">Edit About Page</h2>
                        <form onSubmit={handleUpdateAbout} className="space-y-6">

                            <div className="p-4 border border-white/5 rounded">
                                <h3 className="text-lg text-primary mb-3">Our Story</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <Input
                                        type="text"
                                        placeholder="Story Title (e.g. Weaving dreams...)"
                                        value={aboutForm.storyTitle}
                                        onChange={e => setAboutForm({ ...aboutForm, storyTitle: e.target.value })}
                                    />
                                    <Textarea
                                        placeholder="Story Content..."
                                        rows="4"
                                        value={aboutForm.storyContent}
                                        onChange={e => setAboutForm({ ...aboutForm, storyContent: e.target.value })}
                                    />
                                    <div>
                                        <label className="block text-light/60 text-sm mb-1">Story Image</label>
                                        {(aboutForm.storyImage || storyImageFile) && (
                                            <div className="h-32 bg-body rounded overflow-hidden relative mb-2 w-full md:w-1/2">
                                                <PreviewableImage
                                                    src={storyImageFile ? URL.createObjectURL(storyImageFile) : getMediaUrl(aboutForm.storyImage)}
                                                    alt="Story Preview"
                                                    containerClassName="w-full h-full"
                                                />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            className="bg-body border border-white/10 rounded p-2 text-light w-full"
                                            onChange={e => setStoryImageFile(e.target.files[0])}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border border-white/5 rounded">
                                <h3 className="text-lg text-primary mb-3">Core Values</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Input
                                            type="text"
                                            placeholder="Value 1 Title"
                                            value={aboutForm.values1Title}
                                            onChange={e => setAboutForm({ ...aboutForm, values1Title: e.target.value })}
                                        />
                                        <Textarea
                                            placeholder="Value 1 Description"
                                            rows="3"
                                            value={aboutForm.values1Desc}
                                            onChange={e => setAboutForm({ ...aboutForm, values1Desc: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            type="text"
                                            placeholder="Value 2 Title"
                                            value={aboutForm.values2Title}
                                            onChange={e => setAboutForm({ ...aboutForm, values2Title: e.target.value })}
                                        />
                                        <Textarea
                                            placeholder="Value 2 Description"
                                            rows="3"
                                            value={aboutForm.values2Desc}
                                            onChange={e => setAboutForm({ ...aboutForm, values2Desc: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            type="text"
                                            placeholder="Value 3 Title"
                                            value={aboutForm.values3Title}
                                            onChange={e => setAboutForm({ ...aboutForm, values3Title: e.target.value })}
                                        />
                                        <Textarea
                                            placeholder="Value 3 Description"
                                            rows="3"
                                            value={aboutForm.values3Desc}
                                            onChange={e => setAboutForm({ ...aboutForm, values3Desc: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border border-white/5 rounded">
                                <h3 className="text-lg text-primary mb-3">Founder's Note</h3>
                                <Textarea
                                    placeholder="Founder's Quote..."
                                    rows="2"
                                    value={aboutForm.founderQuote}
                                    onChange={e => setAboutForm({ ...aboutForm, founderQuote: e.target.value })}
                                />
                            </div>

                            <button type="submit" disabled={isUpdatingPage || isUploading} className="bg-primary text-dark font-bold rounded px-6 py-3 w-full disabled:opacity-50 disabled:cursor-not-allowed">
                                {isUpdatingPage || isUploading ? 'Updating About Page...' : 'Update About Page'}
                            </button>
                        </form>
                    </div>
                )}








                {
                    activeTab === 'legalpages' && (
                        <div className="space-y-6">
                            {/* Page Selector */}
                            <div className="flex gap-4 mb-6">
                                <div className="w-64">
                                    <Select
                                        value={activeLegalPage}
                                        onChange={(e) => setActiveLegalPage(e.target.value)}
                                        options={[
                                            { value: 'privacy-policy', label: 'Privacy Policy' },
                                            { value: 'terms-conditions', label: 'Terms & Conditions' },
                                            { value: 'shipping-returns', label: 'Shipping & Returns' }
                                        ]}
                                        className="bg-dark-paper border border-white/10 rounded px-4 py-3 text-light"
                                    />
                                </div>
                                <button
                                    onClick={handleUpdateLegalPage}
                                    disabled={isUpdatingPage}
                                    className="bg-primary text-dark font-bold rounded px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUpdatingPage ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>

                            {/* Sections Editor */}
                            <div className="bg-dark-paper border border-white/10 rounded-lg p-6 space-y-6">
                                {legalSections.map((section, index) => (
                                    <div key={index} className="p-4 border border-white/5 rounded relative group">
                                        <div className="space-y-4">
                                            <Input
                                                type="text"
                                                placeholder="Section Title *"
                                                value={section.title}
                                                onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                                            />
                                            <Textarea
                                                placeholder="Section Content"
                                                rows="5"
                                                value={section.content}
                                                onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleDeleteSection(index)}
                                            className="absolute top-2 right-2 text-red-500 opacity-50 hover:opacity-100"
                                        >
                                            <Icons.Trash />
                                        </button>
                                    </div>
                                ))}

                                <button
                                    onClick={handleAddSection}
                                    className="w-full py-4 border-2 border-dashed border-white/10 text-light/50 hover:bg-white/5 hover:text-primary transition-colors rounded"
                                >
                                    + Add New Section
                                </button>
                            </div>
                        </div>
                    )
                }

                {/* Mega Menu Section - DISABLED */}
                {/* Mega Menu Section - DISABLED */}
                {/* 
                {
                    activeTab === 'megamenu' && (
                        <div className="space-y-8">
                           
                            <div className="bg-dark-paper border border-white/10 rounded-lg p-6 flex items-center justify-between">
                                <h2 className="text-xl font-heading text-light">Edit Mega Menu:</h2>
                                <div className="flex items-center gap-4">
                                    <Select
                                        className="min-w-[200px]"
                                        value={activeMenuId}
                                        onChange={(e) => setActiveMenuId(e.target.value)}
                                        options={[
                                            { value: "", label: "Select Category to Edit" },
                                            ...(categories && categories.length > 0 ? categories.map(cat => ({ value: cat.name, label: cat.name })) : [])
                                        ]}
                                    />
                                </div>
                            </div>
                            
                            <form onSubmit={handleUpdateMegaMenu} className="space-y-8">
                                <div className="bg-dark-paper border border-white/10 rounded-lg p-6">
                                    <h3 className="text-lg text-primary mb-4 font-bold border-b border-white/5 pb-2">Featured Section</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <Input
                                                type="text"
                                                placeholder="Featured Title"
                                                value={menuForm.featured.title}
                                                onChange={e => setMenuForm({ ...menuForm, featured: { ...menuForm.featured, title: e.target.value } })}
                                            />
                                            <Input
                                                type="text"
                                                placeholder="Link Text"
                                                value={menuForm.featured.link}
                                                onChange={e => setMenuForm({ ...menuForm, featured: { ...menuForm.featured, link: e.target.value } })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-light/60 text-sm">Featured Image</label>
                                            {(menuForm.featured.img || featuredImageFile) && (
                                                <div className="h-32 w-24 bg-body rounded overflow-hidden relative">
                                                    <img
                                                        src={featuredImageFile ? URL.createObjectURL(featuredImageFile) : getMediaUrl(menuForm.featured.img)}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                className="bg-body border border-white/10 rounded p-2 text-light w-full"
                                                onChange={e => setFeaturedImageFile(e.target.files[0])}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {menuForm.categories.map((cat, catIndex) => (
                                        <div key={catIndex} className="bg-dark-paper border border-white/10 rounded-lg p-4 relative group">
                                            <button
                                                type="button"
                                                className="absolute top-2 right-2 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleRemoveCategory(catIndex)}
                                            >
                                                <Icons.Close />
                                            </button>

                                            <div className="mb-4">
                                                <Input
                                                    type="text"
                                                    className="bg-transparent border-b border-light/20 text-accent font-heading text-sm uppercase tracking-widest w-full focus:border-primary focus:outline-none"
                                                    value={cat.title}
                                                    onChange={(e) => handleCategoryChange(catIndex, 'title', e.target.value)}
                                                    placeholder="Category Title"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                {cat.items.map((item, itemIndex) => (
                                                    <div key={itemIndex} className="flex items-center gap-2">
                                                        <Input
                                                            type="text"
                                                            className="text-xs text-light/70 py-1"
                                                            value={item}
                                                            onChange={(e) => handleItemChange(catIndex, itemIndex, e.target.value)}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="text-red-500/50 hover:text-red-500"
                                                            onClick={() => handleRemoveItem(catIndex, itemIndex)}
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    className="text-primary text-xs hover:underline mt-2 flex items-center gap-1"
                                                    onClick={() => handleAddItem(catIndex)}
                                                >
                                                    <Icons.Plus className="w-3 h-3" /> Add Link
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={handleAddCategory}
                                        className="border border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center p-6 text-light/40 hover:text-primary hover:border-primary transition-colors min-h-[300px]"
                                    >
                                        <Icons.Plus className="w-8 h-8 mb-2" />
                                        <span>Add Column</span>
                                    </button>
                                </div>

                                <div className="flex justify-end pt-8">
                                    <button
                                        type="submit"
                                        className="bg-primary text-dark font-bold text-lg px-8 py-3 rounded hover:bg-light transition-colors shadow-lg shadow-primary/20"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )
                } 
                */}
                {
                    activeTab === 'systempages' && (
                        <div className="space-y-8">
                            <div className="bg-dark-paper border border-white/10 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-heading text-light">System Pages Configuration</h2>
                                    <p className="text-light/50 text-sm">Manage header content and SEO for standard site pages.</p>
                                </div>
                                <div className="flex gap-4">
                                    <Select
                                        className="min-w-[200px]"
                                        value={activeSystemPage}
                                        onChange={(e) => setActiveSystemPage(e.target.value)}
                                        options={systemPageSlugs.map(slug => ({
                                            value: slug,
                                            label: slug.replace('-', ' ').toUpperCase()
                                        }))}
                                    />
                                    <button
                                        onClick={handleUpdateSystemPage}
                                        disabled={isUpdatingPage}
                                        className="bg-primary text-dark font-bold px-6 py-3 rounded hover:bg-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {isUpdatingPage ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>

                            {activeSystemPage !== 'home' && (
                                <div className="bg-dark-paper border border-white/10 rounded-lg p-6">
                                    <h3 className="text-lg text-primary mb-4 font-bold border-b border-white/5 pb-2">Header Content: {activeSystemPage.toUpperCase()}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs text-light/70 uppercase">Eyebrow</label>
                                            <Input
                                                type="text"
                                                placeholder="e.g. New Arrivals"
                                                value={systemPagesForm.eyebrow}
                                                onChange={(e) => handleSystemPageChange('eyebrow', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-light/70 uppercase">Title</label>
                                            <Input
                                                type="text"
                                                placeholder="e.g. Shop Our Collection"
                                                value={systemPagesForm.title}
                                                onChange={(e) => handleSystemPageChange('title', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-light/70 uppercase">Subtitle</label>
                                            <Textarea
                                                rows="3"
                                                placeholder="e.g. Explore the finest jewelry..."
                                                value={systemPagesForm.subtitle}
                                                onChange={(e) => handleSystemPageChange('subtitle', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs text-light/70 uppercase">Banner Image</label>
                                            <div className="flex gap-2">
                                                {/* Allow manual URL entry if needed, or just file upload. Let's provide both or just file upload as requested. User asked 'give image upload'. */}
                                                <input
                                                    type="file"
                                                    className="bg-body border border-white/10 rounded p-2 text-light w-full"
                                                    onChange={e => setSystemBannerFile(e.target.files[0])}
                                                />
                                            </div>
                                            <p className="text-xs text-light/40 mt-1">Upload a new banner image or keep current.</p>
                                        </div>
                                        {(systemPagesForm.bannerImage || systemBannerFile) && (
                                            <div className="aspect-video bg-body rounded overflow-hidden border border-white/10 relative group">
                                                <PreviewableImage
                                                    src={systemBannerFile ? URL.createObjectURL(systemBannerFile) : getMediaUrl(systemPagesForm.bannerImage)}
                                                    alt="Header Preview"
                                                    containerClassName="w-full h-full"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            )}

                                {activeSystemPage === 'home' && (
                                    <div className="mt-8 pt-8 border-t border-white/5">
                                        <h3 className="text-lg text-primary mb-4 font-bold">Homepage Section Titles</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <label className="text-xs text-light/70 uppercase">Categories Section Title</label>
                                                <Input
                                                    type="text"
                                                    value={systemPagesForm.categoriesTitle}
                                                    onChange={(e) => handleSystemPageChange('categoriesTitle', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-light/70 uppercase">Featured Collection Title</label>
                                                <Input
                                                    type="text"
                                                    value={systemPagesForm.featuredTitle}
                                                    onChange={(e) => handleSystemPageChange('featuredTitle', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-light/70 uppercase">Testimonials Section Title</label>
                                                <Input
                                                    type="text"
                                                    value={systemPagesForm.testimonialsTitle}
                                                    onChange={(e) => handleSystemPageChange('testimonialsTitle', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-light/70 uppercase">Social Feed Title (Username/Handle)</label>
                                                <Input
                                                    type="text"
                                                    value={systemPagesForm.socialTitle}
                                                    onChange={(e) => handleSystemPageChange('socialTitle', e.target.value)}
                                                    placeholder="@BRANDNAME"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-light/70 uppercase">Social Feed Follow Link</label>
                                                <Input
                                                    type="text"
                                                    value={systemPagesForm.socialLink}
                                                    onChange={(e) => handleSystemPageChange('socialLink', e.target.value)}
                                                    placeholder="https://instagram.com/..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                            <div className="bg-dark-paper border border-white/10 rounded-lg p-6">
                                <h3 className="text-lg text-primary mb-4 font-bold border-b border-white/5 pb-2">Search Engine Optimization (SEO)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs text-light/70 uppercase">Meta Title</label>
                                            <Input
                                                type="text"
                                                placeholder="Page Title | Brand Name"
                                                value={systemPagesForm.seoTitle}
                                                onChange={(e) => handleSystemPageChange('seoTitle', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs text-light/70 uppercase">Meta Description</label>
                                            <Textarea
                                                rows="2"
                                                placeholder="Brief description of the page content for search engines..."
                                                value={systemPagesForm.seoDescription}
                                                onChange={(e) => handleSystemPageChange('seoDescription', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {activeSystemPage === 'care-guide' && (
                                <div className="bg-dark-paper border border-white/10 rounded-lg p-6">
                                    <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-2">
                                        <h3 className="text-lg text-primary font-bold">Care Guide Sections</h3>
                                        <div className="flex gap-4">
                                            <button onClick={handleAddCareSection} className="text-xs text-primary border border-primary px-3 py-1 rounded hover:bg-primary hover:text-dark transition-colors">Add Section</button>
                                            <button onClick={handleSaveCareGuide} disabled={isUpdatingPage} className="bg-primary text-dark font-bold text-xs px-4 py-1 rounded hover:bg-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                                {isUpdatingPage ? 'Saving...' : 'Save Content'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        {careSections.map((section, sIndex) => (
                                            <div key={sIndex} className="p-6 border border-white/5 bg-body/30 rounded relative group">
                                                <button
                                                    onClick={() => handleRemoveCareSection(sIndex)}
                                                    className="absolute top-4 right-4 text-red-500 opacity-50 hover:opacity-100"
                                                >
                                                    <Icons.Trash />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <Input
                                                            type="text"
                                                            placeholder="Section Title (e.g., Gold Jewellery)"
                                                            className="font-serif text-xl"
                                                            value={section.title}
                                                            onChange={(e) => handleCareSectionChange(sIndex, 'title', e.target.value)}
                                                        />
                                                        <Textarea
                                                            placeholder="Intro Content"
                                                            rows="4"
                                                            className="text-sm"
                                                            value={section.content}
                                                            onChange={(e) => handleCareSectionChange(sIndex, 'content', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-4 bg-body/20 p-4 rounded">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="text-xs text-light/50 uppercase tracking-widest">Care Points</h4>
                                                            <button onClick={() => handleAddCarePoint(sIndex)} className="text-[10px] text-primary hover:underline">+ Add Point</button>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {section.points?.map((point, pIndex) => (
                                                                <div key={pIndex} className="flex gap-2">
                                                                    <Input
                                                                        type="text"
                                                                        className="text-xs"
                                                                        value={point}
                                                                        onChange={(e) => handleCarePointChange(sIndex, pIndex, e.target.value)}
                                                                    />
                                                                    <button onClick={() => handleRemoveCarePoint(sIndex, pIndex)} className="text-red-500/50 hover:text-red-500">&times;</button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }
            </div >
        </div >
    );
};

export default AdminContent;
