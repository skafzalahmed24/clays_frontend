import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetBlogsQuery, useDeleteBlogMutation } from '../../store/api/blogApiSlice';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import Icons from '../../components/ui/Icons';
import PageHeader from '../../components/admin/layout/PageHeader';
import PreviewableImage from '../../components/ui/PreviewableImage';

const AdminBlogs = () => {
    const [page, setPage] = useState(1);
    const limit = 10;
    const { data, isLoading: loading } = useGetBlogsQuery({ page, limit });
    const blogs = data?.blogs || [];
    const totalPages = data?.pages || 0;

    const [deleteBlog] = useDeleteBlogMutation();
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const navigate = useNavigate();

    const handleDelete = async (id) => {
        if (await confirm('Delete Article', 'Are you sure you want to delete this article? This action cannot be undone.', { isDangerous: true, confirmText: 'Delete' })) {
            deleteBlog(id)
                .unwrap()
                .then(() => showToast('Blog deleted successfully', 'success'))
                .catch(err => showToast(err?.data?.message || err.message, 'error'));
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
                <PageHeader
                    title="Journal"
                    subtitle="Manage your blog posts and articles"
                />
                <Link
                    to="/admin/blogs/new"
                    className="flex items-center gap-2 bg-primary text-dark px-4 py-2 rounded-sm font-medium hover:bg-light transition-colors"
                >
                    <Icons.Plus className="w-5 h-5" />
                    <span>Write New Article</span>
                </Link>
            </div>

            {/* Blogs Table */}
            <div className="bg-dark/50 border border-white/5 rounded-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-light/10 text-xs uppercase tracking-widest text-light/50">
                                    <th className="p-4 font-normal">Image</th>
                                    <th className="p-4 font-normal">Title</th>
                                    <th className="p-4 font-normal">Category</th>
                                    <th className="p-4 font-normal">Date</th>
                                    <th className="p-4 font-normal text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-light/80 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-light/40">Loading...</td>
                                    </tr>
                                ) : blogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-light/40">No articles found.</td>
                                    </tr>
                                ) : (
                                    blogs.map((blog) => (
                                        <tr key={blog._id} className="border-b border-light/5 hover:bg-white/5 transition-colors group">
                                            <td className="p-4 w-24">
                                                <div className="w-16 h-10 overflow-hidden rounded-sm bg-white/5">
                                                    {blog.image && (
                                                        <PreviewableImage 
                                                            src={blog.image} 
                                                            alt={blog.title} 
                                                            containerClassName="w-full h-full"
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium text-white">{blog.title}</td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 text-xs border border-white/10 rounded-full bg-white/5">
                                                    {blog.category}
                                                </span>
                                            </td>
                                            <td className="p-4 text-light/60 text-xs">
                                                {new Date(blog.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => navigate(`/admin/blogs/edit/${blog._id}`)}
                                                        className="p-1 hover:text-primary transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Icons.Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(blog._id)}
                                                        className="p-1 hover:text-red-500 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Icons.Trash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-4">
                    <p className="text-sm text-light/40">
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
    );
};

export default AdminBlogs;
