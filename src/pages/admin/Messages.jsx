import React, { useState } from 'react';
import { useGetContactsQuery, useDeleteContactMutation } from '../../store/api/contactApiSlice';
import PageHeader from '../../components/admin/layout/PageHeader';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import Icons from '../../components/ui/Icons';

const Messages = () => {
    const [page, setPage] = useState(1);
    const limit = 10;
    const { data, isLoading, error } = useGetContactsQuery({ page, limit });
    const messages = data?.contacts || [];
    const totalPages = data?.pages || 0;

    const [deleteContact] = useDeleteContactMutation();
    const { confirm } = useConfirm();
    const { showToast } = useToast();

    const handleDelete = async (id) => {
        if (await confirm('Delete Message', 'Are you sure you want to delete this message? This action cannot be undone.')) {
            try {
                await deleteContact(id).unwrap();
                showToast('Message deleted successfully', 'success');
            } catch (err) {
                showToast(err?.data?.message || 'Failed to delete message', 'error');
            }
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader title="Messages" subtitle="View and manage customer inquiries" />

            <div className="bg-dark-paper border border-white/10 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-light/60">
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Name</th>
                                    <th className="px-6 py-4 font-medium">Email</th>
                                    <th className="px-6 py-4 font-medium">Subject</th>
                                    <th className="px-6 py-4 font-medium">Message</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-light/50">Loading messages...</td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-red-400">Error loading messages</td>
                                    </tr>
                                ) : messages?.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-light/50">No messages found.</td>
                                    </tr>
                                ) : (
                                    messages.map((msg) => (
                                        <tr key={msg._id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 text-sm text-light/60 whitespace-nowrap">
                                                {new Date(msg.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-light max-w-[150px] truncate" title={`${msg.firstName} ${msg.lastName}`}>
                                                {msg.firstName} {msg.lastName}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-light/80">
                                                <a href={`mailto:${msg.email}`} className="hover:text-primary transition-colors">{msg.email}</a>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-light/80">
                                                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs whitespace-nowrap inline-block">
                                                    {msg.subject}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-light/70 max-w-xs truncate" title={msg.message}>
                                                {msg.message}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <a
                                                        href={`/admin/messages/${msg._id}`}
                                                        className="p-2 text-light/40 hover:text-primary transition-colors rounded-full hover:bg-white/5"
                                                        title="View Details"
                                                    >
                                                        <Icons.Eye /> {/* Assuming Eye icon exists, or use generic view icon */}
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(msg._id)}
                                                        className="p-2 text-light/40 hover:text-red-400 transition-colors rounded-full hover:bg-white/5"
                                                        title="Delete"
                                                    >
                                                        <Icons.Trash />
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
                <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-4 p-4 bg-dark-paper border border-white/10 rounded-lg">
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

export default Messages;
