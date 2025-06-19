"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin-layout"
import {
    Calendar,
    Clock,
    DollarSign,
    Users,
    Eye,
    CheckCircle,
    TrendingUp,
    Filter,
    RefreshCw,
    Activity,
    User,
    UserCheck,
    MapPin,
    Settings,
    FileText,
    Gift,
    BarChart3,
    PieChart,
    LineChart,
    ArrowUpDown,
    Download,
    Printer
} from "lucide-react"
import axios from "axios"

interface DashboardStats {
    totalBookings: number
    todayBookings: number
    totalUsers: number
    totalRevenue: number
    adminUsers: number
    customerUsers: number
    recentUsers: number
    totalCourts: number
    activeCourts: number
    totalInvoices: number
    paidInvoices: number
    pendingInvoices: number
    avgInvoiceValue: number
    totalServices: number
    activeServices: number
    totalVouchers: number
    activeVouchers: number
}

interface RecentActivity {
    id: number
    type: string
    description: string
    timestamp: string
    user?: string
}

const API_URL = 'http://localhost:8080/api'

const getAuthHeader = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return {};
    
    const user = JSON.parse(userStr);
    return {
        headers: {
            'Authorization': `Bearer ${user.token}`
        }
    };
};

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalBookings: 0,
        todayBookings: 0,
        totalUsers: 0,
        totalRevenue: 0,
        adminUsers: 0,
        customerUsers: 0,
        recentUsers: 0,
        totalCourts: 0,
        activeCourts: 0,
        totalInvoices: 0,
        paidInvoices: 0,
        pendingInvoices: 0,
        avgInvoiceValue: 0,
        totalServices: 0,
        activeServices: 0,
        totalVouchers: 0,
        activeVouchers: 0
    })
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [dateRange, setDateRange] = useState("7days")

    useEffect(() => {
        // Kiểm tra xác thực và quyền admin
        const checkAuth = () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) {
                    window.location.href = '/login';
                    return;
                }

                const user = JSON.parse(userStr);
                if (!user.token || user.role !== 'admin') {
                    console.error('Bạn không có quyền truy cập trang này');
                    window.location.href = '/login';
                    return;
                }

                // Nếu xác thực thành công, tải dữ liệu
                fetchDashboardData();
            } catch (error) {
                console.error('Lỗi khi kiểm tra xác thực:', error);
                window.location.href = '/login';
            }
        };

        checkAuth();
    }, []);

    useEffect(() => {
        if (!loading) {
            fetchDashboardData();
        }
    }, [dateRange]);

    const fetchDashboardData = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const authHeader = getAuthHeader();

            // Fetch tất cả thống kê từ các API khác nhau
            const [
                bookingStatsResponse,
                userStatsResponse,
                courtStatsResponse,
                invoiceStatsResponse,
                serviceStatsResponse,
                voucherStatsResponse
            ] = await Promise.allSettled([
                axios.get(`${API_URL}/admin/bookings/stats`, authHeader),
                axios.get(`${API_URL}/users`, authHeader), // Lấy danh sách users để tính toán
                axios.get(`${API_URL}/courts`, authHeader), // Lấy danh sách courts để tính toán
                axios.get(`${API_URL}/admin/invoices`, authHeader), // Lấy danh sách invoices để tính toán
                axios.get(`${API_URL}/service/services`, authHeader), // Lấy danh sách services để tính toán
                axios.get(`${API_URL}/admin/vouchers`, authHeader) // Lấy danh sách vouchers để tính toán
            ]);

            // Xử lý kết quả từ các API
            let combinedStats: DashboardStats = {
                totalBookings: 0,
                todayBookings: 0,
                totalUsers: 0,
                totalRevenue: 0,
                adminUsers: 0,
                customerUsers: 0,
                recentUsers: 0,
                totalCourts: 0,
                activeCourts: 0,
                totalInvoices: 0,
                paidInvoices: 0,
                pendingInvoices: 0,
                avgInvoiceValue: 0,
                totalServices: 0,
                activeServices: 0,
                totalVouchers: 0,
                activeVouchers: 0
            };

            // Booking stats
            if (bookingStatsResponse.status === 'fulfilled' && bookingStatsResponse.value.data) {
                const bookingData = bookingStatsResponse.value.data;
                combinedStats.totalBookings = bookingData.totalBookings || 0;
                combinedStats.todayBookings = bookingData.todayBookings || 0;
                combinedStats.totalRevenue = bookingData.totalRevenue || 0;
            }

            // User stats - tính toán từ danh sách users
            if (userStatsResponse.status === 'fulfilled' && userStatsResponse.value.data) {
                const users = Array.isArray(userStatsResponse.value.data) ? userStatsResponse.value.data : [];
                combinedStats.totalUsers = users.length;
                combinedStats.adminUsers = users.filter((u: any) => u.role === 'admin').length;
                combinedStats.customerUsers = users.filter((u: any) => u.role === 'customer').length;
                
                // Tính users mới trong 30 ngày
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                combinedStats.recentUsers = users.filter((u: any) => {
                    try {
                        const createdDate = new Date(u.createdAt);
                        return createdDate > thirtyDaysAgo;
                    } catch {
                        return false;
                    }
                }).length;
            }

            // Court stats - tính toán từ danh sách courts
            if (courtStatsResponse.status === 'fulfilled' && courtStatsResponse.value.data) {
                const courts = Array.isArray(courtStatsResponse.value.data) ? courtStatsResponse.value.data : [];
                combinedStats.totalCourts = courts.length;
                combinedStats.activeCourts = courts.filter((c: any) => 
                    c.status && (c.status.id === 1 || c.status.name === 'Active')
                ).length;
            }

            // Invoice stats - tính toán từ danh sách invoices
            if (invoiceStatsResponse.status === 'fulfilled' && invoiceStatsResponse.value.data) {
                const invoices = Array.isArray(invoiceStatsResponse.value.data) ? invoiceStatsResponse.value.data : [];
                combinedStats.totalInvoices = invoices.length;
                combinedStats.paidInvoices = invoices.filter((i: any) => i.status === 'Paid').length;
                combinedStats.pendingInvoices = invoices.filter((i: any) => i.status === 'Pending').length;
                
                const totalRevenue = invoices
                    .filter((i: any) => i.status === 'Paid')
                    .reduce((sum: number, i: any) => sum + (i.finalAmount || 0), 0);
                combinedStats.avgInvoiceValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;
            }

            // Service stats - tính toán từ danh sách services
            if (serviceStatsResponse.status === 'fulfilled' && serviceStatsResponse.value.data) {
                const services = Array.isArray(serviceStatsResponse.value.data) ? serviceStatsResponse.value.data : [];
                combinedStats.totalServices = services.length;
                combinedStats.activeServices = services.filter((s: any) => s.isActive === true).length;
            }

            // Voucher stats - tính toán từ danh sách vouchers
            if (voucherStatsResponse.status === 'fulfilled' && voucherStatsResponse.value.data) {
                const vouchers = Array.isArray(voucherStatsResponse.value.data) ? voucherStatsResponse.value.data : [];
                combinedStats.totalVouchers = vouchers.length;
                combinedStats.activeVouchers = vouchers.filter((v: any) => v.status === 'active').length;
            }

            setStats(combinedStats);

            // Mock recent activities
            setRecentActivities([
                {
                    id: 1,
                    type: 'booking',
                    description: 'Đặt sân mới được tạo',
                    timestamp: new Date().toISOString(),
                    user: 'Nguyễn Văn A'
                },
                {
                    id: 2,
                    type: 'user',
                    description: 'Người dùng mới đăng ký',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    user: 'Trần Thị B'
                },
                {
                    id: 3,
                    type: 'payment',
                    description: 'Thanh toán được xử lý',
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    user: 'Lê Văn C'
                }
            ]);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const handleRefresh = () => {
        fetchDashboardData(true);
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    const StatCard = ({ title, value, icon: Icon, color, trend, description }: any) => (
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                            <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-600">{title}</p>
                            <p className="text-2xl font-bold text-slate-900">{value}</p>
                            {description && (
                                <p className="text-xs text-slate-500 mt-1">{description}</p>
                            )}
                        </div>
                    </div>
                    {trend && (
                        <div className="flex items-center text-green-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">{trend}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )

    if (loading) {
        return (
            <AdminLayout>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-slate-600">Đang tải dữ liệu thống kê...</p>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
                <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-600 bg-clip-text text-transparent mb-2">
                                Dashboard - Tổng Quan Hệ Thống
                            </h1>
                            <p className="text-slate-600 text-lg">
                                Thống kê tổng hợp và phân tích chi tiết về hoạt động hệ thống ShuttleSync
                            </p>
                        </div>
                        <div className="flex space-x-3 mt-4 sm:mt-0">
                            <Select value={dateRange} onValueChange={setDateRange}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7days">7 ngày qua</SelectItem>
                                    <SelectItem value="30days">30 ngày qua</SelectItem>
                                    <SelectItem value="90days">3 tháng qua</SelectItem>
                                    <SelectItem value="1year">1 năm qua</SelectItem>
                                </SelectContent>
                            </Select>
                        <Button
                            onClick={handleRefresh}
                            disabled={refreshing}
                                variant="outline"
                                className="border-slate-300 hover:border-slate-400"
                        >
                                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Đang tải...' : 'Làm mới'}
                        </Button>
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                <Download className="w-4 h-4 mr-2" />
                                Xuất báo cáo
                            </Button>
                        </div>
                    </div>

                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Tổng Đặt Sân"
                            value={stats.totalBookings.toLocaleString()}
                            icon={Calendar}
                            color="bg-blue-500 text-blue-600"
                            trend="+12%"
                            description="Tất cả thời gian"
                        />
                        <StatCard
                            title="Đặt Sân Hôm Nay"
                            value={stats.todayBookings.toLocaleString()}
                            icon={Clock}
                            color="bg-green-500 text-green-600"
                            trend="+8%"
                            description="Trong ngày"
                        />
                        <StatCard
                            title="Tổng Người Dùng"
                            value={stats.totalUsers.toLocaleString()}
                            icon={Users}
                            color="bg-purple-500 text-purple-600"
                            trend="+5%"
                            description={`${stats.adminUsers} admin, ${stats.customerUsers} khách hàng`}
                        />
                        <StatCard
                            title="Doanh Thu"
                            value={formatCurrency(stats.totalRevenue)}
                            icon={DollarSign}
                            color="bg-orange-500 text-orange-600"
                            trend="+15%"
                            description="Tổng thu nhập"
                        />
                    </div>

                    {/* Secondary Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Sân Hoạt Động"
                            value={`${stats.activeCourts}/${stats.totalCourts}`}
                            icon={MapPin}
                            color="bg-teal-500 text-teal-600"
                            description="Sân đang sử dụng"
                        />
                        <StatCard
                            title="Hóa Đơn"
                            value={`${stats.paidInvoices}/${stats.totalInvoices}`}
                            icon={FileText}
                            color="bg-indigo-500 text-indigo-600"
                            description={`${stats.pendingInvoices} chờ thanh toán`}
                        />
                        <StatCard
                            title="Dịch Vụ"
                            value={`${stats.activeServices}/${stats.totalServices}`}
                            icon={Settings}
                            color="bg-pink-500 text-pink-600"
                            description="Dịch vụ đang cung cấp"
                        />
                        <StatCard
                            title="Voucher"
                            value={`${stats.activeVouchers}/${stats.totalVouchers}`}
                            icon={Gift}
                            color="bg-amber-500 text-amber-600"
                            description="Mã giảm giá hiệu lực"
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                                    Biểu Đồ Doanh Thu
                                </CardTitle>
                                <CardDescription>Doanh thu 7 ngày gần nhất</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 flex items-center justify-center text-slate-500">
                                    <div className="text-center">
                                        <LineChart className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                                        <p>Biểu đồ sẽ được hiển thị tại đây</p>
                                        <p className="text-sm">Tích hợp với thư viện chart</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <PieChart className="h-5 w-5 mr-2 text-green-600" />
                                    Phân Bố Đặt Sân
                                </CardTitle>
                                <CardDescription>Theo trạng thái đặt sân</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 flex items-center justify-center text-slate-500">
                                    <div className="text-center">
                                        <PieChart className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                                        <p>Biểu đồ tròn sẽ được hiển thị tại đây</p>
                                        <p className="text-sm">Tích hợp với thư viện chart</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activities */}
                    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Activity className="h-5 w-5 mr-2 text-purple-600" />
                                Hoạt Động Gần Đây
                            </CardTitle>
                            <CardDescription>Các hoạt động mới nhất trong hệ thống</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentActivities.length > 0 ? (
                                <div className="space-y-4">
                                    {recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <Activity className="w-4 h-4 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900">
                                                    {activity.description}
                                                </p>
                                                {activity.user && (
                                                    <p className="text-xs text-slate-500">
                                                        bởi {activity.user}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex-shrink-0 text-xs text-slate-500">
                                                {format(new Date(activity.timestamp), 'HH:mm dd/MM', { locale: vi })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <Activity className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                    <p>Chưa có hoạt động nào được ghi nhận</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    )
}