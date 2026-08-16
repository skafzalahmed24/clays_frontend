import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icons from '../../components/ui/Icons';
import { useGetOrdersQuery, useDeliverOrderMutation, useUpdateOrderStatusMutation } from '../../store/api/orderApiSlice';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import TextHighlight from '../../components/ui/TextHighlight';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const AdminOrders = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;

    const { showToast } = useToast();
    const { confirm } = useConfirm();

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to page 1 when search changes
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset to page 1 when status filter changes - Moved to handler below

    // Fetch orders with dynamic params
    const { data, isLoading: loading, error } = useGetOrdersQuery({
        search: debouncedSearch,
        status: filterStatus,
        page: currentPage,
        limit
    });

    const orders = data?.orders || [];
    const totalPages = data?.pages || 0;
    const total = data?.total || 0;

    // Mutations
    const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

    if (error) {
        console.error("Order fetch error:", error);
    }

    // Get next status options based on current status
    const getNextStatuses = (currentStatus) => {
        const statusProgression = {
            'Pending': ['Processing', 'Confirmed', 'Cancelled'],
            'Processing': ['Confirmed', 'Shipped', 'Cancelled'],
            'Confirmed': ['Shipped', 'Delivered', 'Cancelled'],
            'Shipped': ['Delivered', 'Cancelled'],
            'Delivered': [],
            'Cancelled': []
        };
        return statusProgression[currentStatus] || [];
    };

    // Update order status
    const handleStatusChange = async (orderId, newStatus) => {
        const confirmed = await confirm(
            'Update Order Status',
            `Are you sure you want to change this order status to "${newStatus}"?`,
            { confirmText: 'Update', cancelText: 'Cancel' }
        );

        if (confirmed) {
            try {
                await updateStatus({ id: orderId, status: newStatus }).unwrap();
                showToast(`Order status updated to ${newStatus}`, "success");
            } catch (error) {
                console.error("Failed to update order status", error);
                showToast(error?.data?.message || "Failed to update order status", "error");
            }
        }
    };

    // Status options
    const statuses = ['All', 'Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'Processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Confirmed': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
            case 'Shipped': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'Delivered': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'Cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-white/5 text-light/60 border-white/10';
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8">
                <div>
                    <h1 className="font-heading text-3xl text-light">Orders</h1>
                    <p className="text-sm text-light/60 mt-1">
                        Showing {orders.length} of {total} orders
                    </p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-dark-paper border border-white/10 rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Input
                        icon={Icons.Search}
                        type="text"
                        placeholder="Search by Order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {loading && debouncedSearch !== searchTerm && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group">
                        <div className="flex items-center gap-2 text-light/60 bg-body border border-white/10 rounded-md hover:border-primary/30 transition-colors cursor-pointer">
                            <Select
                                icon={Icons.Filter}
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                options={statuses.map(status => ({ value: status, label: status }))}
                                className="border-none bg-transparent pl-10 pr-8"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-dark-paper border border-white/10 rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-light/40">Loading orders...</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <div className="min-w-[800px]">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5 text-light/60 text-xs uppercase tracking-wider">
                                            <th className="p-4 font-medium">Order ID</th>
                                            <th className="p-4 font-medium">Date</th>
                                            <th className="p-4 font-medium">Customer</th>
                                            <th className="p-4 font-medium">Items</th>
                                            <th className="p-4 font-medium">Total</th>
                                            <th className="p-4 font-medium">Status</th>
                                            <th className="p-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {orders.map(order => (
                                            <tr key={order._id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4">
                                                    <span className="font-mono text-primary">
                                                        #<TextHighlight text={order.orderNumber ? String(order.orderNumber).padStart(6, '0') : order._id.substring(order._id.length - 6)} query={searchTerm} />
                                                    </span>
                                                </td>
                                                <td className="p-4 text-light/70 text-sm">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-light">
                                                    {order.user?.name || 'Guest'}
                                                </td>
                                                <td className="p-4 text-light/70 text-sm">
                                                    {order.orderItems?.length || 0} items
                                                </td>
                                                <td className="p-4 text-light font-medium">
                                                    ₹{order.totalPrice?.toLocaleString()}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs border font-medium ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            to={`/admin/orders/${order._id}`}
                                                            className="text-xs border border-white/20 text-light/70 hover:text-primary hover:border-primary/50 px-3 py-1 rounded transition-colors uppercase tracking-wider"
                                                        >
                                                            View Details
                                                        </Link>
                                                        {getNextStatuses(order.status).length > 0 ? (
                                                            <select
                                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                                value=""
                                                                disabled={isUpdating}
                                                                className="text-xs border border-primary/50 bg-dark-paper text-primary px-3 py-1 rounded hover:bg-primary/10 transition-colors uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <option value="" disabled>Update Status</option>
                                                                {getNextStatuses(order.status).map(status => (
                                                                    <option key={status} value={status} className="bg-dark-paper">
                                                                        {status}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <span className="text-xs text-light/40 uppercase tracking-wider">
                                                                {order.status === 'Delivered' ? 'Completed' : 'No Actions'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {orders.length === 0 && (
                            <div className="p-12 text-center text-light/40">
                                No orders found matching your search.
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="border-t border-white/10 p-4 flex items-center justify-between">
                                <p className="text-sm text-light/60">
                                    Page {currentPage} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 text-xs font-heading uppercase tracking-widest border border-white/10 text-light hover:bg-white/5 rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 text-xs font-heading uppercase tracking-widest border border-white/10 text-light hover:bg-white/5 rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
