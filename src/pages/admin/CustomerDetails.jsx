import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetUserDetailsQuery } from '../../store/api/userApiSlice';
import Icons from '../../components/ui/Icons';
import PageHeader from '../../components/common/PageHeader'; // Assuming we want a header or just custom div

const AdminCustomerDetails = () => {
    const { id } = useParams();
    const { data: customer, isLoading, error } = useGetUserDetailsQuery(id);
    const [page, setPage] = useState(1);
    const limit = 5;

    // Derived state for pagination
    const orders = customer?.orders || [];
    const totalPages = Math.ceil(orders.length / limit);
    const paginatedOrders = orders.slice((page - 1) * limit, page * limit);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (isLoading) {
        return <div className="p-12 text-center text-light/40">Loading customer details...</div>;
    }

    if (error) {
        return <div className="p-12 text-center text-red-400">Error loading customer.</div>;
    }

    if (!customer) {
        return <div className="p-12 text-center text-light/40">Customer not found.</div>;
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    to="/admin/customers"
                    className="group w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-light/60 hover:text-dark hover:bg-primary transition-all duration-300 hover:-translate-x-1"
                >
                    <span className="rotate-180 text-lg block transition-transform group-hover:scale-110">➜</span>
                </Link>
                <div>
                    <h1 className="font-heading text-3xl text-light">{customer.name}</h1>
                    <p className="text-sm text-light/60">Customer ID: {customer._id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Customer Info Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-dark-paper border border-white/10 rounded-lg p-6">
                        <h2 className="font-heading text-lg text-light mb-6 border-b border-white/5 pb-4">Profile</h2>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                                    {customer.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-light font-medium">{customer.name}</p>
                                    <p className="text-xs text-light/40">{customer.email}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-light/60">Joined</span>
                                    <span className="text-light">{new Date(customer.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-light/60">Total Spent</span>
                                    <span className="text-primary font-bold">₹{(customer.totalSpent || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-light/60">Total Orders</span>
                                    <span className="text-light font-medium">{customer.totalOrders || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="bg-dark-paper border border-white/10 rounded-lg p-6">
                        <h2 className="font-heading text-lg text-light mb-6 border-b border-white/5 pb-4">Addresses</h2>
                        {customer.addresses && customer.addresses.length > 0 ? (
                            <div className="space-y-4">
                                {customer.addresses.map((addr) => (
                                    <div key={addr._id} className="p-4 bg-white/5 rounded border border-white/5">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-bold text-light">{addr.firstName} {addr.lastName}</span>
                                            {addr.isDefault && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded">Default</span>}
                                        </div>
                                        <p className="text-xs text-light/60">{addr.address}</p>
                                        <p className="text-xs text-light/60">{addr.city}, {addr.postalCode}</p>
                                        <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                                            <p className="text-xs text-light/60 flex items-center justify-between">
                                                <span>Mobile:</span> <span className="text-light">{addr.phone}</span>
                                            </p>
                                            <p className="text-xs text-light/60 flex items-center justify-between">
                                                <span>Email:</span> <span className="text-light">{addr.email}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-light/40 italic">No addresses saved.</p>
                        )}
                    </div>
                </div>

                {/* Orders History */}
                <div className="lg:col-span-2">
                    <div className="bg-dark-paper border border-white/10 rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-white/10">
                            <h2 className="font-heading text-lg text-light">Order History</h2>
                        </div>

                        {customer.orders && customer.orders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5 text-light/60 text-xs uppercase tracking-wider">
                                            <th className="p-4 font-medium">Order ID</th>
                                            <th className="p-4 font-medium">Date</th>
                                            <th className="p-4 font-medium">Status</th>
                                            <th className="p-4 font-medium">Total</th>
                                            <th className="p-4 font-medium text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {paginatedOrders.map(order => (
                                            <tr key={order._id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 text-primary font-mono text-sm">#{order._id.slice(-6).toUpperCase()}</td>
                                                <td className="p-4 text-light/60 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] tracking-wider uppercase font-bold
                                                        ${order.status === 'Delivered' ? 'bg-green-500/10 text-green-400' :
                                                            order.status === 'Processing' ? 'bg-blue-500/10 text-blue-400' :
                                                                order.status === 'Cancelled' ? 'bg-red-500/10 text-red-400' :
                                                                    'bg-yellow-500/10 text-yellow-400'
                                                        }
                                                    `}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-light font-medium">₹{order.totalPrice?.toLocaleString()}</td>
                                                <td className="p-4 text-right">
                                                    <Link to={`/admin/orders/${order._id}`} className="text-primary hover:text-white text-sm transition-colors">
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center text-light/40 italic">
                                No orders found for this customer.
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="border-t border-white/10 p-4 flex items-center justify-between">
                                <p className="text-sm text-light/60">
                                    Page {page} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                        disabled={page === 1}
                                        className="px-3 py-1 text-xs font-heading uppercase tracking-widest border border-white/10 text-light hover:bg-white/5 rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={page === totalPages}
                                        className="px-3 py-1 text-xs font-heading uppercase tracking-widest border border-white/10 text-light hover:bg-white/5 rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCustomerDetails;
