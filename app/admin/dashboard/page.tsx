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
import { Calendar, Clock, DollarSign, Users } from "lucide-react"

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

    const fetchDashboardData = async () => {
        try {
            // Lấy token từ localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const token = user.token;
            
            if (!token) {
                console.error('Không tìm thấy token, vui lòng đăng nhập lại');
                // Redirect to login page
                window.location.href = '/login';
                return;
            }
            
            const authHeader = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            
            setLoading(true);
            
            // Fetch bookings
            console.log("Đang gọi API bookings...");
            const bookingsResponse = await fetch('http://localhost:8080/api/bookings/recent', {
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
                const statsResponse = await fetch('http://localhost:8080/api/admin/stats', {
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
        }
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

    const handleConfirmBooking = async (bookingId: number) => {
        try {
            // Lấy token từ localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const token = user.token;
            
            if (!token) {
                console.error('Không tìm thấy token, vui lòng đăng nhập lại');
                return;
            }
            
            const authHeader = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            
            const response = await fetch(`http://localhost:8080/api/admin/bookings/${bookingId}/confirm`, {
                method: 'POST',
                headers: authHeader
            })
            
            if (response.ok) {
                fetchDashboardData() // Refresh data after confirmation
            } else if (response.status === 401 || response.status === 403) {
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Error confirming booking:', error)
        }
    }

    return (
        <AdminLayout>
            <div className="container py-6">
                <h1 className="text-3xl font-bold mb-6">Tổng Quan Quản Trị</h1>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <Card>
                        <CardContent className="p-6 flex items-center space-x-4">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Calendar className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tổng Đặt Sân</p>
                                <h3 className="text-2xl font-bold">{stats.totalBookings}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 flex items-center space-x-4">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Clock className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Đặt Sân Hôm Nay</p>
                                <h3 className="text-2xl font-bold">{stats.todayBookings}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 flex items-center space-x-4">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tổng Người Dùng</p>
                                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 flex items-center space-x-4">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <DollarSign className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Doanh Thu</p>
                                <h3 className="text-2xl font-bold">{stats.totalRevenue.toLocaleString('vi-VN')} VNĐ</h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Đặt Sân Gần Đây</CardTitle>
                        <CardDescription>Quản lý và xem các đặt sân gần đây</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <Select value={dateFilter} onValueChange={setDateFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Lọc theo ngày" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả ngày</SelectItem>
                                    <SelectItem value="today">Hôm nay</SelectItem>
                                    <SelectItem value="tomorrow">Ngày mai</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
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

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã</TableHead>
                                        <TableHead>Người dùng</TableHead>
                                        <TableHead>Sân</TableHead>
                                        <TableHead>Ngày</TableHead>
                                        <TableHead>Giờ</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center">Đang tải...</TableCell>
                                        </TableRow>
                                    ) : filteredBookings.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center">Không có dữ liệu</TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredBookings.map((booking) => (
                                            <TableRow key={booking.id}>
                                                <TableCell className="font-medium">#{booking.id}</TableCell>
                                                <TableCell>{booking.userName}</TableCell>
                                                <TableCell>{booking.courtName}</TableCell>
                                                <TableCell>{format(new Date(booking.bookingDate), "dd/MM/yyyy", { locale: vi })}</TableCell>
                                                <TableCell>{`${booking.startTime} - ${booking.endTime}`}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            booking.status === "2"
                                                                ? "default"
                                                                : booking.status === "1"
                                                                    ? "outline"
                                                                    : "destructive"
                                                        }
                                                    >
                                                        {getStatusText(booking.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button variant="outline" size="sm">
                                                            Xem
                                                        </Button>
                                                        {booking.status === "1" && (
                                                            <Button 
                                                                size="sm"
                                                                onClick={() => handleConfirmBooking(booking.id)}
                                                            >
                                                                Xác nhận
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
        </AdminLayout>
    )
}
