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
    Activity
} from "lucide-react"

interface Booking {
    id: number
    userName: string
    courtName: string
    bookingDate: string
    startTime: string
    endTime: string
    status: string
}

interface DashboardStats {
    totalBookings: number
    todayBookings: number
    totalUsers: number
    totalRevenue: number
}

export default function AdminDashboard() {
    const [dateFilter, setDateFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [bookings, setBookings] = useState<Booking[]>([])
    const [stats, setStats] = useState<DashboardStats>({
        totalBookings: 0,
        todayBookings: 0,
        totalUsers: 0,
        totalRevenue: 0
    })
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

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

                // Nếu xác thực thành công, tải dữ liệu dashboard
                fetchDashboardData();
            } catch (error) {
                console.error('Lỗi khi kiểm tra xác thực:', error);
                window.location.href = '/login';
            }
        };

        checkAuth();
    }, []);

    useEffect(() => {
        if (dateFilter !== "all" || statusFilter !== "all") {
            fetchDashboardData();
        }
    }, [dateFilter, statusFilter]);

    const fetchDashboardData = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            }

            // Lấy token từ localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const token = user.token;

            if (!token) {
                console.error('Không tìm thấy token, vui lòng đăng nhập lại');
                window.location.href = '/login';
                return;
            }

            const authHeader = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            if (!isRefresh) {
                setLoading(true);
            }

            // Fetch bookings
            console.log("Đang gọi API bookings...");
            const bookingsResponse = await fetch('http://localhost:8080/api/admin/bookings/recent', {
                headers: authHeader
            });
            console.log("Status API bookings:", bookingsResponse.status);

            if (!bookingsResponse.ok) {
                console.error('API bookings trả về lỗi:', bookingsResponse.status, bookingsResponse.statusText);
                if (bookingsResponse.status === 401 || bookingsResponse.status === 403) {
                    window.location.href = '/login';
                }
                return;
            }

            const bookingsData = await bookingsResponse.json();
            console.log("Dữ liệu bookings:", bookingsData);
            setBookings(bookingsData);

            // Fetch stats
            try {
                console.log("Đang gọi API admin/stats...");
                const statsResponse = await fetch('http://localhost:8080/api/admin/bookings/stats', {
                    headers: authHeader
                });
                console.log("Status API stats:", statsResponse.status);

                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    console.log("Dữ liệu stats:", statsData);
                    setStats(statsData);
                } else {
                    console.error('API stats trả về lỗi:', statsResponse.status, statsResponse.statusText);
                    if (statsResponse.status === 401 || statsResponse.status === 403) {
                        window.location.href = '/login';
                    }
                }
            } catch (statsError) {
                console.error('Lỗi khi gọi API stats:', statsError);
            }

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

    // Lọc đặt sân dựa trên bộ lọc đã chọn
    const filteredBookings = bookings.filter((booking) => {
        if (dateFilter !== "all") {
            const today = new Date()
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)

            if (dateFilter === "today" && format(new Date(booking.bookingDate), "yyyy-MM-dd") !== format(today, "yyyy-MM-dd")) {
                return false
            }
            if (dateFilter === "tomorrow" && format(new Date(booking.bookingDate), "yyyy-MM-dd") !== format(tomorrow, "yyyy-MM-dd")) {
                return false
            }
        }

        if (statusFilter !== "all" && booking.status !== statusFilter) {
            return false
        }

        return true
    })

    // Ánh xạ trạng thái sang tiếng Việt
    const getStatusText = (status: string) => {
        switch (status) {
            case "1":
                return "Đang chờ"
            case "2":
                return "Đã xác nhận"
            case "3":
                return "Đã hủy"
            default:
                return "Không xác định"
        }
    }

    const statsCards = [
        {
            title: "Tổng Đặt Sân",
            value: stats.totalBookings,
            icon: Calendar,
            color: "bg-blue-500",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
            trend: "+12%"
        },
        {
            title: "Đặt Sân Hôm Nay",
            value: stats.todayBookings,
            icon: Clock,
            color: "bg-green-500",
            bgColor: "bg-green-50",
            textColor: "text-green-600",
            trend: "+8%"
        },
        {
            title: "Tổng Người Dùng",
            value: stats.totalUsers,
            icon: Users,
            color: "bg-purple-500",
            bgColor: "bg-purple-50",
            textColor: "text-purple-600",
            trend: "+5%"
        },
        {
            title: "Doanh Thu",
            value: `${(stats.totalRevenue || 0).toLocaleString('vi-VN')} VNĐ`,
            icon: DollarSign,
            color: "bg-orange-500",
            bgColor: "bg-orange-50",
            textColor: "text-orange-600",
            trend: "+15%"
        }
    ]

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
                <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-600 bg-clip-text text-transparent mb-2">
                                Tổng Quan Quản Trị
                            </h1>
                            <p className="text-slate-600 text-lg">
                                Theo dõi và quản lý hoạt động đặt sân Cầu lông
                            </p>
                        </div>
                        <Button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Đang tải...' : 'Làm mới'}
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                        {statsCards.map((stat, index) => {
                            const IconComponent = stat.icon;
                            return (
                                <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-600 mb-1">
                                                    {stat.title}
                                                </p>
                                                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                                                </h3>
                                                <div className="flex items-center text-sm">
                                                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                                                    <span className="text-green-600 font-medium">{stat.trend}</span>
                                                    <span className="text-slate-500 ml-1">từ tháng trước</span>
                                                </div>
                                            </div>
                                            <div className={`p-3 rounded-2xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                                                <IconComponent className={`h-6 w-6 ${stat.textColor}`} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Bookings Table */}
                    <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/50">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div>
                                    <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                                        <Activity className="h-6 w-6 mr-2 text-blue-600" />
                                        Đặt Sân Gần Đây
                                    </CardTitle>
                                    <CardDescription className="text-slate-600 mt-1">
                                        Quản lý và xem các đặt sân gần đây của khách hàng
                                    </CardDescription>
                                </div>
                                <div className="flex items-center mt-4 sm:mt-0">
                                    <Filter className="h-4 w-4 text-slate-500 mr-2" />
                                    <span className="text-sm text-slate-600">
                                        {filteredBookings.length} kết quả
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Filters */}
                            <div className="flex flex-col md:flex-row gap-4 mb-6">
                                <Select value={dateFilter} onValueChange={setDateFilter}>
                                    <SelectTrigger className="w-full md:w-[200px] border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                                        <SelectValue placeholder="Lọc theo ngày" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả ngày</SelectItem>
                                        <SelectItem value="today">Hôm nay</SelectItem>
                                        <SelectItem value="tomorrow">Ngày mai</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full md:w-[200px] border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                                        <SelectValue placeholder="Lọc theo trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                        <SelectItem value="1">Đang chờ</SelectItem>
                                        <SelectItem value="2">Đã xác nhận</SelectItem>
                                        <SelectItem value="3">Đã hủy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Table */}
                            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="border-slate-200">
                                            <TableHead className="font-semibold text-slate-700 w-16">STT</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Khách hàng</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Sân</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Ngày</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Giờ</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Trạng thái</TableHead>
                                            <TableHead className="font-semibold text-slate-700 text-right">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-12">
                                                    <div className="flex items-center justify-center">
                                                        <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                                                        <span className="text-slate-600">Đang tải dữ liệu...</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredBookings.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-12">
                                                    <div className="text-slate-500">
                                                        <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                                        <p className="text-lg font-medium">Không có dữ liệu</p>
                                                        <p className="text-sm">Chưa có đặt sân nào phù hợp với bộ lọc</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredBookings.map((booking, index) => (
                                                <TableRow
                                                    key={booking.id}
                                                    className={`hover:bg-slate-50/50 transition-colors duration-150 ${
                                                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                                                    }`}
                                                >
                                                    <TableCell className="font-medium text-slate-900">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-slate-800">
                                                        {booking.userName}
                                                    </TableCell>
                                                    <TableCell className="text-slate-700">
                                                        {booking.courtName}
                                                    </TableCell>
                                                    <TableCell className="text-slate-700">
                                                        {format(new Date(booking.bookingDate), "dd/MM/yyyy", { locale: vi })}
                                                    </TableCell>
                                                    <TableCell className="text-slate-700">
                                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
                                                            {`${booking.startTime} - ${booking.endTime}`}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                booking.status === "2"
                                                                    ? "default"
                                                                    : booking.status === "1"
                                                                        ? "outline"
                                                                        : "destructive"
                                                            }
                                                            className={`${
                                                                booking.status === "2"
                                                                    ? "bg-green-100 text-green-800 border-green-200"
                                                                    : booking.status === "1"
                                                                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                                        : "bg-red-100 text-red-800 border-red-200"
                                                            }`}
                                                        >
                                                            {getStatusText(booking.status)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors duration-150"
                                                            >
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                Xem
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    )
}