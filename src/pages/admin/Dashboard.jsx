import React from 'react';
import { useGetDashboardStatsQuery, useGetSalesDataQuery } from '../../store/api/analyticsApiSlice';
import DashboardCharts from '../../components/admin/dashboard/DashboardCharts';
import Loading from '../../components/common/Loading';
import Icons from '../../components/ui/Icons';
import { usePrice } from '../../hooks/usePrice';

const AdminDashboard = () => {
    const { format } = usePrice();

    const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery();
    const { data: salesData, isLoading: salesLoading } = useGetSalesDataQuery();

    if (statsLoading || salesLoading) return <Loading />;

    const cards = [
        {
            title: 'Total Revenue',
            value: format(stats?.totalSales),
            icon: Icons.Dollar, // Adjusted to match Icons.jsx
            change: 'Lifetime',
            positive: true
        },
        {
            title: 'Total Orders',
            value: stats?.totalOrders || 0,
            icon: Icons.Bag, // Adjusted to match Icons.jsx
            change: 'Lifetime',
            positive: true
        },
        {
            title: 'Total Customers',
            value: stats?.totalUsers || 0,
            icon: Icons.User, // Adjusted to match Icons.jsx
            change: 'Lifetime',
            positive: true
        },
        {
            title: 'Pending Orders',
            value: stats?.pendingOrders || 0,
            icon: Icons.Dashboard, // Fallback for Pending Orders as Clock is missing
            change: 'Action Needed',
            positive: false
        }
    ];

    return (
        <div>
            <h1 className="font-heading text-3xl text-light mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {cards.map((card, index) => (
                    <div key={index} className="bg-dark-paper border border-white/10 p-6 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-light/70 text-sm mb-1">{card.title}</p>
                                <h3 className="text-2xl font-bold text-light">{card.value}</h3>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-full text-primary">
                                <card.icon size={24} />
                            </div>
                        </div>
                        <p className={`text-sm ${card.positive ? 'text-green-400' : 'text-orange-400'}`}>
                            {card.change}
                        </p>
                    </div>
                ))}
            </div>

            <DashboardCharts salesData={salesData} />

            {/* We can re-add the Recent Orders table here later if needed, fetching from orders API */}
        </div>
    );
};

export default AdminDashboard;
