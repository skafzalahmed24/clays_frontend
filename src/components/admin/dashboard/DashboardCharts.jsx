import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';

const DashboardCharts = ({ salesData }) => {
    // If no data, show a placeholder or empty state
    if (!salesData || salesData.length === 0) {
        return (
            <div className="bg-dark-paper p-6 rounded-lg shadow-sm border border-white/10 text-center text-light/50 py-12">
                No sales data available for charts yet.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Trend Chart */}
            <div className="bg-dark-paper p-6 rounded-lg shadow-sm border border-white/10">
                <h3 className="text-lg font-heading text-light mb-6">Sales Trend (Last 7 Days)</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={salesData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="_id" stroke="#888" fontSize={12} tick={{ fill: '#aaa' }} />
                            <YAxis stroke="#888" fontSize={12} tick={{ fill: '#aaa' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F1F1F', border: '1px solid #333', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#888' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="sales"
                                stroke="#D4AF37" // Gold/Primary color theme
                                strokeWidth={2}
                                activeDot={{ r: 8, fill: '#D4AF37' }}
                                name="Revenue (₹)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Orders Count Chart */}
            <div className="bg-dark-paper p-6 rounded-lg shadow-sm border border-white/10">
                <h3 className="text-lg font-heading text-light mb-6">Daily Orders</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={salesData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="_id" stroke="#888" fontSize={12} tick={{ fill: '#aaa' }} />
                            <YAxis stroke="#888" fontSize={12} allowDecimals={false} tick={{ fill: '#aaa' }} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#1F1F1F', border: '1px solid #333', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#888' }}
                            />
                            <Bar dataKey="orders" fill="#D4AF37" barSize={30} radius={[4, 4, 0, 0]} name="Orders" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
