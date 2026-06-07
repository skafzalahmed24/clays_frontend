import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminSidebar from './Sidebar';

const AdminLayout = () => {
    const { adminInfo } = useSelector(state => state.adminAuth);
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    // Debugging/Safety check
    if (!adminInfo) {
        return <Navigate to="/admin/login" replace />;
    }

    // Role check redundant since loginAdmin only allows admins, but good for safety
    if (adminInfo.role !== 'admin') {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="min-h-screen bg-body text-text-main flex font-body">
            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 animate-in fade-in duration-500 transition-all duration-300 w-full">
                <div className="">
                    {/* Top Bar / Header */}
                    <div className="sticky top-0 z-30 mb-8 flex justify-between items-center bg-body/95 backdrop-blur-md p-4 md:px-8 md:py-4 border-b border-white/5 -mx-4 -mt-4 md:-mx-8 md:-mt-8 shadow-lg md:shadow-none">
                        <div className="flex items-center gap-4">
                            {/* Hamburger Menu for Mobile */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            {/* Breadcrumbs or Title could go here */}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-light text-sm font-medium">{adminInfo.name}</p>
                                <p className="text-white/40 text-xs capitalize">{adminInfo.role}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/50">
                                {adminInfo.name?.charAt(0) || 'A'}
                            </div>
                        </div>
                    </div>

                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
