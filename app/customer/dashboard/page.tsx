"use client"

import React, { useState, useEffect } from 'react';
import { CustomerLayout } from '../../../components/customer-layout';
import { dashboardApi, formatCurrency, formatDate } from '@/lib/api-client';
import './animations.css';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    Trophy, 
    Activity, 
    CreditCard,
    Star,
    ArrowRight,
    Play,
    CheckCircle,
    AlertCircle,
    Users,
    TrendingUp,
    Zap,
    Target,
    Award,
    BookOpen,
    Bell,
    Settings,
    User,
    Search,
    Filter,
    ChevronRight,
    Heart,
    Share2,
    Plus,
    Calendar as CalendarIcon,
    Timer,
    BarChart3,
    Sparkles
} from 'lucide-react';
import { useRouter } from "next/navigation"

const CustomerDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        stats: null as any,
        recentBookings: [] as any[],
        availableCourts: [] as any[],
        userProfile: null as any,
        notifications: [] as any[]
    });
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        // Kiểm tra authentication
        const userData = localStorage.getItem("user");
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            } catch (error) {
                console.error("Error parsing user data:", error);
                router.push("/login");
                return;
            }
        } else {
            router.push("/login");
            return;
        }

        const loadDashboardData = async () => {
            try {
                setIsLoading(true);
                const [stats, recentBookings, availableCourts, userProfile, notifications] = await Promise.all([
                    dashboardApi.getStats(),
                    dashboardApi.getRecentBookings(3),
                    dashboardApi.getAvailableCourts(),
                    dashboardApi.getUserProfile(),
                    dashboardApi.getNotifications(5)
                ]);

                setDashboardData({
                    stats,
                    recentBookings,
                    availableCourts: availableCourts.slice(0, 3),
                    userProfile,
                    notifications
                });
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, [router]);

    const getStatusBadge = (status: string) => {
        const statusConfig: {[key: string]: {color: string, icon: any, text: string}} = {
            "Đã xác nhận": { 
                color: "bg-green-100 text-green-800 border-green-200", 
                icon: CheckCircle, 
                text: "Đã xác nhận" 
            },
            "Chờ xác nhận": { 
                color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
                icon: AlertCircle, 
                text: "Chờ xác nhận" 
            },
            "Đã hủy": { 
                color: "bg-red-100 text-red-800 border-red-200", 
                icon: AlertCircle, 
                text: "Đã hủy" 
            },
            "Đã hoàn thành": { 
                color: "bg-blue-100 text-blue-800 border-blue-200", 
                icon: CheckCircle, 
                text: "Đã hoàn thành" 
            }
        };
        const config = statusConfig[status] || statusConfig["Chờ xác nhận"];
        const IconComponent = config.icon;
        
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                <IconComponent className="w-3 h-3 mr-1" />
                {config.text}
            </span>
        );
    };

    const StatCard = ({ title, value, icon: Icon, color, trend, description, delay = 0 }: any) => (
        <div className={`group animate-fadeInUp`} style={{ animationDelay: `${delay}ms` }}>
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer`}>
                <div className="absolute -top-4 -right-4 opacity-10">
                    <Icon size={80} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Icon className="text-white" size={20} />
                        </div>
                        {trend && (
                            <span className="flex items-center text-white/90 text-sm font-medium bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">
                                <TrendingUp size={12} className="mr-1" />
                                {trend}
                            </span>
                        )}
                    </div>
                    <h3 className="text-white text-3xl font-bold mb-1 leading-tight">{value}</h3>
                    <p className="text-white/90 text-sm font-medium">{title}</p>
                    {description && (
                        <p className="text-white/70 text-xs mt-2">{description}</p>
                    )}
                </div>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>
        </div>
    );

    const BookingCard = ({ booking, index }: any) => (
        <div className={`group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 animate-slideInUp`} style={{ animationDelay: `${index * 100}ms` }}>
            <div className="relative h-48 overflow-hidden">
                <img 
                    src="/images/court-placeholder.jpg" 
                    alt={booking.courtName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=250&fit=crop";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute top-4 right-4">
                    {getStatusBadge(booking.status)}
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-bold text-lg drop-shadow-sm">{booking.courtName}</h3>
                </div>
                <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                        <Heart size={16} className="text-white" />
                    </button>
                </div>
            </div>
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-gray-600 text-sm">
                        <CalendarIcon size={16} className="mr-2 text-blue-500" />
                        {formatDate(booking.bookingDate)}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                        <Timer size={16} className="mr-2 text-green-500" />
                        {booking.startTime} - {booking.endTime}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {formatCurrency(booking.amount)}
                    </span>
                    <button 
                        onClick={() => router.push(`/customer/history?bookingId=${booking.bookingId}`)}
                        className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-all duration-200 hover:bg-blue-50 px-3 py-1 rounded-lg"
                    >
                        Chi tiết
                        <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );

    const CourtCard = ({ court, index }: any) => (
        <div className={`group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 animate-slideInUp`} style={{ animationDelay: `${index * 150}ms` }}>
            <div className="relative h-48 overflow-hidden">
                <img 
                    src={court.image} 
                    alt={court.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg">
                        <Heart size={16} className="text-gray-600" />
                    </button>
                    <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg">
                        <Share2 size={16} className="text-gray-600" />
                    </button>
                </div>
                <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                        court.availableSlots > 0
                            ? 'bg-green-100/90 text-green-800 border border-green-200' 
                            : 'bg-red-100/90 text-red-800 border border-red-200'
                    }`}>
                        {court.availableSlots > 0 ? `${court.availableSlots} slots` : 'Hết slot'}
                    </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                    <button 
                        onClick={() => router.push(`/customer/booking?courtId=${court.id}`)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 shadow-lg backdrop-blur-sm"
                    >
                        Đặt ngay
                    </button>
                </div>
            </div>
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-800">{court.name}</h3>
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                        <Star className="text-yellow-400 fill-current" size={16} />
                        <span className="ml-1 text-sm font-medium text-yellow-700">{court.rating}</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                    {court.amenities?.map((feature: any, index: number) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                            {feature}
                        </span>
                    ))}
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {court.priceRange}
                    </span>
                    <button 
                        onClick={() => router.push(`/customer/booking?courtId=${court.id}`)}
                        className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-all duration-200 hover:bg-blue-50 px-3 py-1 rounded-lg"
                    >
                        Xem thêm
                        <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <CustomerLayout>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
                    <div className="text-center">
                        <div className="relative w-24 h-24 mb-8 mx-auto">
                            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                            <Activity className="absolute inset-0 m-auto text-blue-600 animate-bounce" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-pulse">Đang tải dashboard...</h2>
                        <p className="text-gray-600 animate-pulse">Chuẩn bị thông tin cá nhân của bạn</p>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <div className="p-6 space-y-8">
                {/* Welcome Section */}
                <div className="mb-8 animate-fadeInDown">
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.1%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-4">
                                        <Sparkles className="text-yellow-300 mr-2" size={28} />
                                        <h2 className="text-3xl font-bold">
                                            Chào mừng trở lại, {user?.fullName || "Khách hàng"}! 👋
                                        </h2>
                                    </div>
                                    <p className="text-white/90 text-lg mb-6">
                                        Hôm nay là ngày tuyệt vời để chơi cầu lông. Bạn đã sẵn sàng?
                                    </p>
                                    <button 
                                        onClick={() => router.push('/customer/booking')}
                                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center"
                                    >
                                        <Plus size={20} className="mr-2" />
                                        Đặt sân ngay
                                    </button>
                                </div>
                                <div className="hidden md:block">
                                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center">
                                        <Trophy className="text-yellow-300 mb-3 mx-auto" size={40} />
                                        <p className="text-sm font-medium mb-1">Thành viên {dashboardData.stats?.membershipLevel || "Bronze"}</p>
                                        <p className="text-xs text-white/80">Điểm tích lũy</p>
                                        <div className="mt-3 text-2xl font-bold">{dashboardData.stats?.loyaltyPoints || 0}</div>
                                        <p className="text-xs text-white/80">Loyalty Points</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Tổng đặt sân"
                        value={dashboardData.stats?.totalBookings || 0}
                        icon={CalendarIcon}
                        color="from-blue-500 to-blue-600"
                        trend="+12%"
                        description="Tháng này"
                        delay={0}
                    />
                    <StatCard
                        title="Sân yêu thích"
                        value={dashboardData.stats?.favoriteCourtName || "N/A"}
                        icon={Heart}
                        color="from-pink-500 to-rose-600"
                        description="Được đặt nhiều nhất"
                        delay={100}
                    />
                    <StatCard
                        title="Tổng chi tiêu"
                        value={dashboardData.stats ? formatCurrency(dashboardData.stats.totalSpent) : "0 VNĐ"}
                        icon={CreditCard}
                        color="from-yellow-500 to-orange-600"
                        trend="+5%"
                        description="Tổng cộng"
                        delay={200}
                    />
                    <StatCard
                        title="Đã hoàn thành"
                        value={dashboardData.stats?.completedBookings || 0}
                        icon={CheckCircle}
                        color="from-green-500 to-emerald-600"
                        trend="+8%"
                        description="Booking"
                        delay={300}
                    />
                </div>

                {/* Quick Actions */}
                <div className="mb-8 animate-fadeInUp">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <Zap className="mr-2 text-yellow-500" size={24} />
                        Thao tác nhanh
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: CalendarIcon, label: "Đặt sân mới", color: "bg-blue-500", gradient: "from-blue-500 to-blue-600", action: () => router.push('/customer/booking') },
                            { icon: BookOpen, label: "Lịch sử", color: "bg-green-500", gradient: "from-green-500 to-green-600", action: () => router.push('/customer/history') },
                            { icon: User, label: "Hồ sơ", color: "bg-purple-500", gradient: "from-purple-500 to-purple-600", action: () => router.push('/customer/profile') },
                            { icon: CreditCard, label: "Thanh toán", color: "bg-orange-500", gradient: "from-orange-500 to-orange-600", action: () => router.push('/customer/payment') }
                        ].map((item, index) => (
                            <button
                                key={index}
                                onClick={item.action}
                                className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 animate-slideInUp"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className={`w-12 h-12 bg-gradient-to-r ${item.gradient} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <item.icon className="text-white" size={24} />
                                </div>
                                <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center">
                            <BarChart3 className="mr-2 text-blue-500" size={24} />
                            Đặt sân gần đây
                        </h3>
                        <button 
                            onClick={() => router.push('/customer/history')}
                            className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:bg-blue-50 px-4 py-2 rounded-lg"
                        >
                            Xem tất cả
                            <ArrowRight size={16} className="ml-1" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dashboardData.recentBookings.map((booking, index) => (
                            <BookingCard key={booking.bookingId} booking={booking} index={index} />
                        ))}
                    </div>
                </div>

                {/* Available Courts */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center">
                            <Target className="mr-2 text-green-500" size={24} />
                            Sân có sẵn
                        </h3>
                        <div className="flex items-center space-x-3">
                            <button className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 bg-white rounded-xl border border-gray-200 hover:border-blue-200 transition-all duration-200 shadow-sm hover:shadow-md">
                                <Filter size={16} className="mr-2" />
                                Bộ lọc
                            </button>
                            <button 
                                onClick={() => router.push('/customer/booking')}
                                className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 hover:bg-blue-50 px-4 py-2 rounded-lg"
                            >
                                Xem tất cả
                                <ArrowRight size={16} className="ml-1" />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dashboardData.availableCourts.map((court, index) => (
                            <CourtCard key={court.id} court={court} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
};

export default CustomerDashboard;