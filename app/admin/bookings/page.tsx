"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AdminLayout } from "@/components/admin-layout"
import {
    CalendarDays,
    Clock,
    Users,
    Search,
    Filter,
    RefreshCw,
    Eye,
    CheckCircle,
    XCircle,
    Edit,
    Trash2,
    Plus,
    Download,
    Calendar,
    MapPin,
    Phone,
    Mail,
    AlertCircle,
    TrendingUp
} from "lucide-react"

interface Booking {
    id: number
    userName: string
    userEmail: string
    userPhone: string
    courtName: string
    courtLocation: string
    bookingDate: string
    startTime: string
    endTime: string
    status: string
    totalAmount: number
    paymentStatus: string
    createdAt: string
    notes?: string
}

interface BookingStats {
    totalBookings: number
    pendingBookings: number
    confirmedBookings: number
    cancelledBookings: number
}

export default function BookingManagement() {
    const [dateFilter, setDateFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [paymentFilter, setPaymentFilter] = useState<string>("all")
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [bookings, setBookings] = useState<Booking[]>([])
    const [stats, setStats] = useState<BookingStats>({
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0
    })
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

    // Mock data - thay thế bằng API calls thực tế
    const mockBookings: Booking[] = [
        {
            id: 1,
            userName: "Nguyễn Văn An",
            userEmail: "anvn@email.com",
            userPhone: "0901234567",
            courtName: "Sân Tennis A1",
            courtLocation: "Tầng 1, Khu A",
            bookingDate: "2025-05-29",
            startTime: "08:00",
            endTime: "10:00",
            status: "1",
            totalAmount: 200000,
            paymentStatus: "pending",
            createdAt: "2025-05-28T10:30:00Z",
            notes: "Khách hàng VIP"
        },
        {
            id: 2,
            userName: "Trần Thị Bình",
            userEmail: "binhtt@email.com",
            userPhone: "0907654321",
            courtName: "Sân Tennis B2",
            courtLocation: "Tầng 2, Khu B",
            bookingDate: "2025-05-29",
            startTime: "14:00",
            endTime: "16:00",
            status: "2",
            totalAmount: 250000,
            paymentStatus: "paid",
            createdAt: "2025-05-28T09:15:00Z"
        },
        {
            id: 3,
            userName: "Lê Hoàng Cường",
            userEmail: "cuonglh@email.com",
            userPhone: "0912345678",
            courtName: "Sân Tennis C3",
            courtLocation: "Tầng 3, Khu C",
            bookingDate: "2025-05-30",
            startTime: "18:00",
            endTime: "20:00",
            status: "3",
            totalAmount: 180000,
            paymentStatus: "refunded",
            createdAt: "2025-05-27T16:45:00Z",
            notes: "Hủy do thời tiết"
        }
    ]

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

                // Load mock data
                loadBookingData();
            } catch (error) {
                console.error('Lỗi khi kiểm tra xác thực:', error);
                window.location.href = '/login';
            }
        };

        checkAuth();
    }, []);

    const loadBookingData = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setBookings(mockBookings);
            setStats({
                totalBookings: mockBookings.length,
                pendingBookings: mockBookings.filter(b => b.status === "1").length,
                confirmedBookings: mockBookings.filter(b => b.status === "2").length,
                cancelledBookings: mockBookings.filter(b => b.status === "3").length,
            });
            setLoading(false);
        }, 1000);
    };

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            loadBookingData();
            setRefreshing(false);
        }, 1000);
    };

    // Lọc đặt sân
    const filteredBookings = bookings.filter((booking) => {
        // Filter by search term
        if (searchTerm && !booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !booking.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !booking.courtName.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // Filter by date
        if (dateFilter !== "all") {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const bookingDate = new Date(booking.bookingDate);

            if (dateFilter === "today" && format(bookingDate, "yyyy-MM-dd") !== format(today, "yyyy-MM-dd")) {
                return false;
            }
            if (dateFilter === "tomorrow" && format(bookingDate, "yyyy-MM-dd") !== format(tomorrow, "yyyy-MM-dd")) {
                return false;
            }
            if (dateFilter === "week") {
                const weekFromNow = new Date(today);
                weekFromNow.setDate(weekFromNow.getDate() + 7);
                if (bookingDate < today || bookingDate > weekFromNow) {
                    return false;
                }
            }
        }

        // Filter by status
        if (statusFilter !== "all" && booking.status !== statusFilter) {
            return false;
        }

        // Filter by payment status
        if (paymentFilter !== "all" && booking.paymentStatus !== paymentFilter) {
            return false;
        }

        return true;
    });

    // Mapping functions
    const getStatusText = (status: string) => {
        switch (status) {
            case "1": return "Đang chờ";
            case "2": return "Đã xác nhận";
            case "3": return "Đã hủy";
            default: return "Không xác định";
        }
    };

    const getPaymentStatusText = (status: string) => {
        switch (status) {
            case "pending": return "Chờ thanh toán";
            case "paid": return "Đã thanh toán";
            case "refunded": return "Đã hoàn tiền";
            default: return "Không xác định";
        }
    };

    const handleConfirmBooking = async (bookingId: number) => {
        // Simulate API call
        console.log('Confirming booking:', bookingId);
        // Update local state
        setBookings(prev => prev.map(b =>
            b.id === bookingId ? { ...b, status: "2" } : b
        ));
    };

    const handleCancelBooking = async (bookingId: number) => {
        // Simulate API call
        console.log('Cancelling booking:', bookingId);
        setBookings(prev => prev.map(b =>
            b.id === bookingId ? { ...b, status: "3", paymentStatus: "refunded" } : b
        ));
    };

    const statsCards = [
        {
            title: "Tổng Đặt Sân",
            value: stats.totalBookings,
            icon: CalendarDays,
            color: "bg-blue-500",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
            trend: "+12%"
        },
        {
            title: "Chờ Xác Nhận",
            value: stats.pendingBookings,
            icon: Clock,
            color: "bg-yellow-500",
            bgColor: "bg-yellow-50",
            textColor: "text-yellow-600",
            trend: "+3"
        },
        {
            title: "Đã Xác Nhận",
            value: stats.confirmedBookings,
            icon: CheckCircle,
            color: "bg-green-500",
            bgColor: "bg-green-50",
            textColor: "text-green-600",
            trend: "+8%"
        },
        {
            title: "Đã Hủy",
            value: stats.cancelledBookings,
            icon: XCircle,
            color: "bg-red-500",
            bgColor: "bg-red-50",
            textColor: "text-red-600",
            trend: "-2%"
        }
    ];

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
                <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-600 bg-clip-text text-transparent mb-2">
                                Quản Lý Đặt Sân
                            </h1>
                            <p className="text-slate-600 text-lg">
                                Quản lý toàn bộ đặt sân Cầu lông và lịch trình
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                            <Button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                variant="outline"
                                className="border-slate-300 hover:bg-slate-50"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                {refreshing ? 'Đang tải...' : 'Làm mới'}
                            </Button>
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                                <Plus className="h-4 w-4 mr-2" />
                                Thêm Đặt Sân
                            </Button>
                            <Button
                                variant="outline"
                                className="border-green-300 text-green-700 hover:bg-green-50"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Xuất Excel
                            </Button>
                        </div>
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
                                                    {stat.value}
                                                </h3>
                                                <div className="flex items-center text-sm">
                                                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                                                    <span className="text-green-600 font-medium">{stat.trend}</span>
                                                    <span className="text-slate-500 ml-1">từ tuần trước</span>
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

                    {/* Main Content */}
                    <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/50">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                                <div>
                                    <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                                        <Calendar className="h-6 w-6 mr-2 text-blue-600" />
                                        Danh Sách Đặt Sân
                                    </CardTitle>
                                    <CardDescription className="text-slate-600 mt-1">
                                        Theo dõi và quản lý tất cả các đặt sân tennis
                                    </CardDescription>
                                </div>
                                <div className="flex items-center mt-4 lg:mt-0">
                                    <Filter className="h-4 w-4 text-slate-500 mr-2" />
                                    <span className="text-sm text-slate-600">
                                        {filteredBookings.length} / {bookings.length} kết quả
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Search and Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Tìm kiếm theo tên, email, sân..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <Select value={dateFilter} onValueChange={setDateFilter}>
                                    <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                                        <SelectValue placeholder="Lọc theo ngày" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả ngày</SelectItem>
                                        <SelectItem value="today">Hôm nay</SelectItem>
                                        <SelectItem value="tomorrow">Ngày mai</SelectItem>
                                        <SelectItem value="week">Tuần này</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                                        <SelectValue placeholder="Trạng thái đặt sân" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                        <SelectItem value="1">Đang chờ</SelectItem>
                                        <SelectItem value="2">Đã xác nhận</SelectItem>
                                        <SelectItem value="3">Đã hủy</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                                    <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                                        <SelectValue placeholder="Trạng thái thanh toán" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả thanh toán</SelectItem>
                                        <SelectItem value="pending">Chờ thanh toán</SelectItem>
                                        <SelectItem value="paid">Đã thanh toán</SelectItem>
                                        <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Table */}
                            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="border-slate-200">
                                            <TableHead className="font-semibold text-slate-700">Mã</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Khách hàng</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Sân tennis</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Thời gian</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Số tiền</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Trạng thái</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Thanh toán</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-12">
                                                    <div className="flex items-center justify-center">
                                                        <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                                                        <span className="text-slate-600">Đang tải dữ liệu...</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredBookings.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-12">
                                                    <div className="text-slate-500">
                                                        <CalendarDays className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                                        <p className="text-lg font-medium">Không có đặt sân nào</p>
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
                                                        <span className="px-2 py-1 bg-slate-100 rounded-md text-sm">
                                                            #{booking.id}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <p className="font-medium text-slate-800">{booking.userName}</p>
                                                            <div className="flex items-center text-xs text-slate-500">
                                                                <Mail className="h-3 w-3 mr-1" />
                                                                {booking.userEmail}
                                                            </div>
                                                            <div className="flex items-center text-xs text-slate-500">
                                                                <Phone className="h-3 w-3 mr-1" />
                                                                {booking.userPhone}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <p className="font-medium text-slate-800">{booking.courtName}</p>
                                                            <div className="flex items-center text-xs text-slate-500">
                                                                <MapPin className="h-3 w-3 mr-1" />
                                                                {booking.courtLocation}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <p className="font-medium text-slate-800">
                                                                {format(new Date(booking.bookingDate), "dd/MM/yyyy", { locale: vi })}
                                                            </p>
                                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                                                                {`${booking.startTime} - ${booking.endTime}`}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-slate-900">
                                                        {booking.totalAmount.toLocaleString('vi-VN')} VNĐ
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
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
                                                        <Badge
                                                            className={`${
                                                                booking.paymentStatus === "paid"
                                                                    ? "bg-green-100 text-green-800 border-green-200"
                                                                    : booking.paymentStatus === "pending"
                                                                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                                        : "bg-blue-100 text-blue-800 border-blue-200"
                                                            }`}
                                                        >
                                                            {getPaymentStatusText(booking.paymentStatus)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex space-x-1">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                                                            >
                                                                <Eye className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200"
                                                            >
                                                                <Edit className="h-3 w-3" />
                                                            </Button>
                                                            {booking.status === "1" && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleConfirmBooking(booking.id)}
                                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                                >
                                                                    <CheckCircle className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                            {booking.status !== "3" && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleCancelBooking(booking.id)}
                                                                    className="hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                                                                >
                                                                    <XCircle className="h-3 w-3" />
                                                                </Button>
                                                            )}
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