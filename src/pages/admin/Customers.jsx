import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icons from '../../components/ui/Icons';

// import client from '../../api/client'; // Removed
import { useGetUsersQuery } from '../../store/api/userApiSlice';
import Input from '../../components/ui/Input';
import TextHighlight from '../../components/ui/TextHighlight';

const AdminCustomers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading: loading } = useGetUsersQuery({
        page,
        limit,
        search: debouncedSearch
    });

    const customers = data?.users || [];
    const totalPages = data?.pages || 0;

    // Derived State - Backend now handles filtering
    // const filteredCustomers = ... (removed)

    // Use 'customers' directly instead of 'filteredCustomers'

    if (loading) {
        return <div className="p-12 text-center text-light/40">Loading customers...</div>;
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8">
                <h1 className="font-heading text-3xl text-light">Customers</h1>
            </div>

            {/* Search */}
            <div className="bg-dark-paper border border-white/10 rounded-lg p-4 mb-6">
                <div className="relative w-full md:w-96">
                    <Input
                        icon={Icons.Search}
                        type="text"
                        placeholder="Search by Name, Email or Mobile..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-dark-paper border border-white/10 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 text-light/60 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-medium">Customer</th>
                                    <th className="p-4 font-medium">Orders</th>
                                    <th className="p-4 font-medium">Total Spent</th>
                                    <th className="p-4 font-medium">Join Date</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {customers.map(customer => (
                                    <tr key={customer._id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-light font-medium">
                                                        <TextHighlight text={customer.name} query={searchTerm} />
                                                    </p>
                                                    <p className="text-xs text-light/40">
                                                        <TextHighlight text={customer.email} query={searchTerm} />
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-light/80">
                                            {customer.totalOrders || 0}
                                        </td>
                                        <td className="p-4 text-light font-medium">
                                            ₹{(customer.totalSpent || 0).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-light/60 text-sm">
                                            {new Date(customer.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link
                                                to={`/admin/customers/${customer._id}`}
                                                className="text-primary hover:underline text-sm opacity-100 transition-opacity"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {customers.length === 0 && (
                        <div className="p-12 text-center text-light/40">
                            {loading ? 'Loading...' : 'No customers found.'}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-white/10 p-4 flex items-center justify-between mt-4">
                        <p className="text-sm text-light/60">
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

export default AdminCustomers;
