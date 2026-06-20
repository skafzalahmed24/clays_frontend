import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetBlogDetailsQuery, useCreateBlogMutation, useUpdateBlogMutation } from '../../store/api/blogApiSlice';
import { useUploadImageMutation } from '../../store/api/contentApiSlice';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/admin/layout/PageHeader';
import Icons from '../../components/ui/Icons';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { REGEX } from '../../utils/regex';

const BlogForm = () => {
    const { id } = useParams(); // If id exists, it's edit mode
    const isEditMode = !!id;
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Hooks
    const { data: blogDetails, isLoading: loadingDetails } = useGetBlogDetailsQuery(id, { skip: !isEditMode });
    const [createBlog, { isLoading: creating }] = useCreateBlogMutation();
    const [updateBlog, { isLoading: updating }] = useUpdateBlogMutation();
    const [uploadImage] = useUploadImageMutation();

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        excerpt: '',
        content: '',
        image: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        if (isEditMode && blogDetails) {
            // Function to decode HTML entities (e.g., &lt; to <)
            const decodeHtml = (html) => {
                const txt = document.createElement("textarea");
                txt.innerHTML = html;
                return txt.value;
            };

            setFormData({
                title: blogDetails.title || '',
                category: blogDetails.category || '',
                excerpt: blogDetails.excerpt || '',
                content: decodeHtml(blogDetails.content || ''),
                image: blogDetails.image || ''
            });
            setImagePreview(blogDetails.image || '');
        }
    }, [isEditMode, blogDetails]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadFile = async () => {
        const formData = new FormData();
        formData.append('file', imageFile);
        try {
            const result = await uploadImage(formData).unwrap();
            return result;
        } catch (error) {
            console.error('Image upload failed', error);
            showToast('Image upload failed', 'error');
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const strippedContent = formData.content.replace(REGEX.HTML_TAGS, '').trim();
        if (!strippedContent) {
            showToast('Blog content cannot be empty', 'error');
            return;
        }

        // Validate image is required for new posts
        if (!isEditMode && !imageFile) {
            showToast('Cover image is required', 'error');
            return;
        }

        let imgUrl = formData.image;
        if (imageFile) {
            const uploadedPath = await uploadFile();
            if (uploadedPath) {
                imgUrl = uploadedPath;
            } else {
                return;
            }
        }

        const blogData = {
            ...formData,
            image: imgUrl
        };

        try {
            if (isEditMode) {
                await updateBlog({ id, ...blogData }).unwrap();
                showToast('Blog updated successfully', 'success');
            } else {
                await createBlog(blogData).unwrap();
                showToast('Blog created successfully', 'success');
            }
            navigate('/admin/blogs');
        } catch (error) {
            console.error(error);
            showToast(`Failed to ${isEditMode ? 'update' : 'create'} blog`, 'error');
        }
    };

    const loading = loadingDetails || creating || updating;

    useEffect(() => {
        if (blogDetails) {
            console.log('Blog Details Fetched for Edit:', blogDetails);
            // Log structure for debugging
            console.log('Structure Check:', {
                hasTitle: 'title' in blogDetails,
                titleValue: blogDetails.title,
                hasCategory: 'category' in blogDetails,
                categoryValue: blogDetails.category
            });
        }
    }, [blogDetails]);

    return (
        <div className="space-y-8">
            <PageHeader
                title={isEditMode ? 'Edit Article' : 'New Article'}
                subtitle={isEditMode ? 'Update your blog post' : 'Create a new story for the journal'}
                backLink="/admin/blogs"
            />

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Main Info */}
                <div className="bg-dark/50 p-4 md:p-8 border border-white/5 rounded-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-light/60">Title</label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-light/60">Category</label>
                            <Input
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                placeholder="e.g. Styling, Education"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-light/60">Excerpt</label>
                        <Textarea
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            className="h-24 resize-none !bg-white !text-black placeholder:text-gray-500"
                            style={{ backgroundColor: '#ffffff', color: '#000000' }}
                            placeholder="Short summary for the listing page..."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-light/60">Cover Image</label>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                            <div className="w-32 h-20 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center overflow-hidden shrink-0">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Icons.Image className="w-6 h-6 text-light/20" />
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="text-sm text-light/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 w-full md:w-auto"
                            />
                        </div>
                    </div>
                </div>

                {/* Content Editor (Rich Text) */}
                <div className="bg-dark/50 p-4 md:p-8 border border-white/5 rounded-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-xs uppercase tracking-widest text-light/60">Content</label>
                    </div>

                    <style>{`
                        .quill-editor-container .quill { background-color: #ffffff !important; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1); overflow: hidden; }
                        .quill-editor-container .ql-toolbar { border-color: rgba(0,0,0,0.1) !important; background-color: #ffffff !important; color: #000000 !important; }
                        .quill-editor-container .ql-container { border-color: rgba(0,0,0,0.1) !important; background-color: #ffffff !important; color: #000000 !important; min-height: 200px; font-size: 16px; }
                        .quill-editor-container .ql-fill { fill: #000000 !important; }
                        .quill-editor-container .ql-stroke { stroke: #000000 !important; }
                        .quill-editor-container .ql-picker { color: #000000 !important; }
                        .quill-editor-container .ql-picker-options { background-color: #ffffff !important; border-color: rgba(0,0,0,0.1) !important; }
                        .admin-layout .bg-dark\\/50 .quill-editor-container .ql-editor,
                        .admin-layout .bg-dark\\/50 .quill-editor-container .ql-editor * { color: #000000 !important; background-color: #ffffff !important; }
                        .admin-layout .bg-dark\\/50 .quill-editor-container .ql-editor p, 
                        .admin-layout .bg-dark\\/50 .quill-editor-container .ql-editor h1, 
                        .admin-layout .bg-dark\\/50 .quill-editor-container .ql-editor h2, 
                        .admin-layout .bg-dark\\/50 .quill-editor-container .ql-editor h3, 
                        .admin-layout .bg-dark\\/50 .quill-editor-container .ql-editor h4, 
                        .admin-layout .bg-dark\\/50 .quill-editor-container .ql-editor h5, 
                        .admin-layout .bg-dark\\/50 .quill-editor-container .ql-editor h6, 
                        .admin-layout .bg-dark\\/50 .quill-editor-container .ql-editor span, 
                        .admin-layout .bg-dark\\/50 .quill-editor-container .ql-editor li { color: #000000 !important; }
                        .quill-editor-container .ql-editor.ql-blank::before { color: rgba(0,0,0,0.5) !important; font-style: italic; }
                    `}</style>

                    <div className="quill-editor-container">
                        <ReactQuill
                            theme="snow"
                            value={formData.content}
                            onChange={(value) => setFormData({ ...formData, content: value })}
                            modules={{
                                toolbar: [
                                    [{ 'header': [1, 2, 3, false] }],
                                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                    ['link', 'image'],
                                    ['clean']
                                ],
                            }}
                            className="text-black"
                            placeholder="Write your article content here..."
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/blogs')}
                        className="px-6 py-3 border border-white/10 text-light hover:bg-white/5 transition-colors uppercase tracking-widest text-xs font-medium rounded-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-primary text-dark hover:bg-light transition-colors uppercase tracking-widest text-xs font-bold rounded-sm disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : (isEditMode ? 'Update Article' : 'Publish Article')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BlogForm;
