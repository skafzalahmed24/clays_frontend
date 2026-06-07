import React, { useState } from 'react';
import Icons from '../../components/ui/Icons';
import PreviewableImage from '../../components/ui/PreviewableImage';
import { useToast } from '../../context/ToastContext';
// import client from '../../api/client'; // Removed
import { useGetRequestsQuery, useUpdateRequestMutation, useDeleteRequestMutation } from '../../store/api/requestApiSlice';
import { useConfirm } from '../../context/ConfirmContext';

const AdminRequests = () => {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [filter, setFilter] = useState('All'); // All, Pending, Notified
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading, error } = useGetRequestsQuery({ page, limit });
    const requests = data?.requests || [];
    const totalPages = data?.pages || 0;

    const [updateRequest, { isLoading: isUpdating }] = useUpdateRequestMutation();
    const [deleteRequest, { isLoading: isDeleting }] = useDeleteRequestMutation();

    // Handlers
    const handleNotify = async (id) => {
        const confirmed = await confirm(
            'Send Notification',
            'Are you sure you want to notify this user? This will mark the request as notified.',
            { confirmText: 'Notify', cancelText: 'Cancel' }
        );

        if (confirmed) {
            try {
                await updateRequest({ id, status: 'Notified' }).unwrap();
                showToast('Notification email sent to user!', 'success');
            } catch (error) {
                showToast('Failed to update request status', 'error');
            }
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm(
            'Delete Request',
            'Are you sure you want to delete this stock request?',
            { isDangerous: true, confirmText: 'Delete' }
        );

        if (confirmed) {
            try {
                await deleteRequest(id).unwrap();
                showToast('Request deleted', 'info');
            } catch (error) {
                showToast('Failed to delete request', 'error');
            }
        }
    };

    const filteredRequests = filter === 'All'
        ? (Array.isArray(requests) ? requests : [])
        : (Array.isArray(requests) ? requests : []).filter(req => req.status === filter);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
                <h1 className="font-heading text-3xl text-light">Stock Requests</h1>
                <div className="flex gap-2">
                    {['All', 'Pending', 'Notified'].map(f => (
                        <button
                            key={f}
                            onClick={() => {
                                setFilter(f);
                                setPage(1);
                            }}
                            className={`px-4 py-2 text-sm rounded-sm transition-colors ${filter === f ? 'bg-primary text-dark font-bold' : 'bg-white/5 text-light/60 hover:bg-white/10'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="bg-dark-paper border border-white/10 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        <div className="grid grid-cols-12 bg-white/5 p-4 text-xs uppercase tracking-wider text-light/40 font-medium border-b border-white/5">
                            <div className="col-span-4">Product</div>
                            <div className="col-span-3">User Email</div>
                            <div className="col-span-2">Date</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        <div className="divide-y divide-white/5">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((request) => (
                                    <div key={request._id} className="grid grid-cols-12 p-4 items-center hover:bg-white/5 transition-colors text-sm">
                                        <div className="col-span-4 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/5 rounded-sm overflow-hidden flex-shrink-0">
                                                {/* Fallback img if broken link or mock */}
                                                <PreviewableImage 
                                                    src={request.productImg} 
                                                    alt={request.productName} 
                                                    containerClassName="w-full h-full"
                                                />
                                            </div>
                                            <div className="truncate pr-4">
                                                <div className="text-light font-medium truncate" title={request.productName}>{request.productName}</div>
                                                <div className="text-xs text-light/40">ID: {request.productId}</div>
                                            </div>
                                        </div>
                                        <div className="col-span-3 text-light/80 truncate pr-2" title={request.userEmail}>
                                            {request.userEmail}
                                        </div>
                                        <div className="col-span-2 text-light/60 text-xs">
                                            {request.createdAt
                                                ? new Date(request.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                : '—'}
                                        </div>
                                        <div className="col-span-1">
                                            <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-sm ${request.status === 'Pending'
                                                ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                                                : 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                }`}>
                                                {request.status}
                                            </span>
                                        </div>
                                        <div className="col-span-2 flex justify-end gap-2">
                                            {request.status === 'Pending' && (
                                                <button
                                                    onClick={() => handleNotify(request._id)}
                                                    disabled={isUpdating}
                                                    className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-dark transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Notify User"
                                                >
                                                    {isUpdating ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div> : <Icons.Email className="w-4 h-4" />}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(request._id)}
                                                disabled={isDeleting}
                                                className="p-2 text-light/20 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Delete"
                                            >
                                                <Icons.Trash className="w-4 h-4" /> {/* Assuming Trash icon exists or use X */}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-light/40 italic">
                                    No requests found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-4 p-4">
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
        </div>
    );
};

export default AdminRequests;
