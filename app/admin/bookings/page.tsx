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
import axios from "axios"
import { toast } from "@/components/ui/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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

interface StatsResponse {
    totalBookings?: number;
    todayBookings?: number;
    totalUsers?: number;
    totalRevenue?: number;
}

const API_URL = 'http://localhost:8080/api';

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
    const [error, setError] = useState<string | null>(null)
    // State cho dialog đặt sân tại quầy
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
    const [courts, setCourts] = useState<any[]>([])
    const [timeSlots, setTimeSlots] = useState<any[]>([])
    const [availableTimeSlots, setAvailableTimeSlots] = useState<number[]>([])
    const [loadingCourts, setLoadingCourts] = useState(false)
    const [loadingTimeSlots, setLoadingTimeSlots] = useState(false)
    const [loadingAvailability, setLoadingAvailability] = useState(false)
    const [customers, setCustomers] = useState<any[]>([])
    const [searchCustomer, setSearchCustomer] = useState('')
    const [loadingCustomers, setLoadingCustomers] = useState(false)
    const [bookingFormData, setBookingFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        courtId: 0,
        timeSlotId: 0,
        bookingDate: format(new Date().setDate(new Date().getDate() + 1), 'yyyy-MM-dd'),
        notes: ''
    })

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

                // Load data if auth successful
                loadBookingData();
            } catch (error) {
                console.error('Lỗi khi kiểm tra xác thực:', error);
                window.location.href = '/login';
            }
        };

        checkAuth();
    }, []);

    const loadBookingData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Load bookings với filter
            const params = new URLSearchParams();
            if (dateFilter !== "all") params.append("dateFilter", dateFilter);
            if (statusFilter !== "all") params.append("statusFilter", statusFilter);
            
            const bookingsResponse = await axios.get(
                `${API_URL}/admin/bookings/all?${params.toString()}`, 
                getAuthHeader()
            );
            
            // Load stats
            const statsResponse = await axios.get(`${API_URL}/admin/bookings/stats`, getAuthHeader());
            
            if (bookingsResponse.data && Array.isArray(bookingsResponse.data)) {
                // Map backend data to frontend format với trạng thái thanh toán từ hóa đơn
                // Backend đã cập nhật để trả về trạng thái thanh toán dựa trên hóa đơn
                const mappedBookings = bookingsResponse.data.map((booking: any) => ({
                    id: booking.id,
                    userName: booking.userName || 'N/A',
                    userEmail: booking.userEmail || 'N/A',
                    userPhone: booking.userPhone || 'N/A',
                    courtName: booking.courtName || 'N/A',
                    courtLocation: booking.courtLocation || 'N/A',
                    bookingDate: booking.bookingDate,
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                    status: booking.status,
                    totalAmount: booking.totalAmount || 0,
                    paymentStatus: booking.paymentStatus || 'pending', // Lấy từ API, đã được cập nhật từ hóa đơn
                    createdAt: booking.createdAt || new Date().toISOString(),
                    notes: booking.notes
                }));
                setBookings(mappedBookings);
            } else {
                setBookings([]);
            }
            
            if (statsResponse.data && typeof statsResponse.data === 'object') {
                const stats = statsResponse.data as StatsResponse;
                setStats({
                    totalBookings: stats.totalBookings || 0,
                    pendingBookings: bookings.filter(b => b.status === "1").length,
                    confirmedBookings: bookings.filter(b => b.status === "2").length,
                    cancelledBookings: bookings.filter(b => b.status === "3").length,
                });
            } else {
                setStats({
                    totalBookings: 0,
                    pendingBookings: 0,
                    confirmedBookings: 0,
                    cancelledBookings: 0,
                });
            }
        } catch (error: any) {
            console.error("Error loading booking data:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            setError("Có lỗi xảy ra khi tải dữ liệu");
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadBookingData().finally(() => setRefreshing(false));
    };

    // Load data when filters change
    useEffect(() => {
        if (!loading) {
            loadBookingData();
        }
    }, [dateFilter, statusFilter]);

    // Lọc đặt sân
    const filteredBookings = bookings.filter((booking) => {
        // Filter by search term
        if (searchTerm && !booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !booking.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !booking.courtName.toLowerCase().includes(searchTerm.toLowerCase())) {
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
        try {
            console.log('Confirming booking:', bookingId);
            const response = await axios.post(
                `${API_URL}/admin/bookings/${bookingId}/approve`, 
                {}, 
                getAuthHeader()
            );
            
            console.log('Approve response:', response);
            
            if (response.status === 200 && response.data?.success) {
                const responseData = response.data as { success: boolean; invoiceCreated?: boolean; invoiceId?: number };
                const { invoiceCreated, invoiceId } = responseData;
                
                loadBookingData(); // Refresh data
                toast({
                    title: "Thành công",
                    description: invoiceCreated 
                        ? `Đã xác nhận đặt sân và tạo hóa đơn #${invoiceId} thành công`
                        : "Đã xác nhận đặt sân thành công",
                });
            }
        } catch (error: any) {
            console.error('Error confirming booking:', error);
            console.error('Error details:', error.response?.data);
            toast({
                title: "Lỗi",
                description: `Có lỗi xảy ra khi xác nhận đặt sân: ${error.response?.data?.message || error.message}`,
                variant: "destructive",
            });
        }
    };

    const handleCancelBooking = async (bookingId: number) => {
        try {
            // Giả sử có API endpoint để hủy booking
            // const response = await axios.post(
            //     `${API_URL}/bookings/${bookingId}/cancel`, 
            //     {}, 
            //     getAuthHeader()
            // );
            
            // Tạm thời update local state
            setBookings(prev => prev.map(b =>
                b.id === bookingId ? { ...b, status: "3", paymentStatus: "refunded" } : b
            ));
            
            toast({
                title: "Thành công",
                description: "Đã hủy đặt sân thành công",
            });
        } catch (error) {
            console.error('Error cancelling booking:', error);
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi hủy đặt sân",
                variant: "destructive",
            });
        }
    };

    // Mở dialog đặt sân và load dữ liệu cần thiết
    const handleOpenBookingDialog = () => {
        setIsBookingDialogOpen(true)
        loadCourts()
        // Reset form
        setBookingFormData({
            customerName: '',
            customerPhone: '',
            customerEmail: '',
            courtId: 0,
            timeSlotId: 0,
            bookingDate: format(new Date().setDate(new Date().getDate() + 1), 'yyyy-MM-dd'),
            notes: ''
        })
    }

    // Load danh sách sân
    const loadCourts = async () => {
        try {
            setLoadingCourts(true)
            const response = await axios.get(`${API_URL.replace('/admin', '')}/courts`, getAuthHeader())
            if (response.data && Array.isArray(response.data)) {
                setCourts(response.data)
            }
        } catch (error) {
            console.error("Error loading courts:", error)
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách sân",
                variant: "destructive"
            })
        } finally {
            setLoadingCourts(false)
        }
    }

    // Load khung giờ cho sân đã chọn
    const loadTimeSlots = async (courtId: number) => {
        if (!courtId) return
        
        try {
            setLoadingTimeSlots(true)
            const response = await axios.get(
                `${API_URL.replace('/admin', '')}/time-slots/court/${courtId}`, 
                getAuthHeader()
            )
            if (response.data && Array.isArray(response.data)) {
                setTimeSlots(response.data)
                
                // Nếu đã chọn ngày, kiểm tra tính khả dụng của các khung giờ
                if (bookingFormData.bookingDate) {
                    checkAllTimeSlotsAvailability(courtId, bookingFormData.bookingDate, response.data)
                }
            }
        } catch (error) {
            console.error("Error loading time slots:", error)
            toast({
                title: "Lỗi",
                description: "Không thể tải khung giờ",
                variant: "destructive"
            })
        } finally {
            setLoadingTimeSlots(false)
        }
    }
    
    // Kiểm tra tính khả dụng của tất cả khung giờ cho sân và ngày đã chọn
    const checkAllTimeSlotsAvailability = async (courtId: number, bookingDate: string, slots: any[]) => {
        if (!courtId || !bookingDate || !slots.length) return
        
        try {
            setLoadingAvailability(true)
            setAvailableTimeSlots([]) // Reset danh sách khung giờ khả dụng
            
            // Tạo mảng các promise để kiểm tra tính khả dụng của từng khung giờ
            const availabilityPromises = slots.map(slot => 
                axios.get(
                    `${API_URL.replace('/admin', '')}/bookings/check-availability?courtId=${courtId}&timeSlotId=${slot.id}&date=${bookingDate}`,
                    getAuthHeader()
                )
            )
            
            // Thực hiện tất cả các request song song
            const results = await Promise.all(availabilityPromises)
            
            // Lọc ra các ID khung giờ còn trống
            const availableSlotIds = results
                .map((res, index) => {
                    // Sửa lỗi type bằng cách sử dụng type assertion
                    const responseData = res.data as { available?: boolean };
                    if (responseData && responseData.available === true) {
                        return slots[index].id;
                    }
                    return null;
                })
                .filter(id => id !== null) as number[]
            
            setAvailableTimeSlots(availableSlotIds)
        } catch (error) {
            console.error("Error checking time slots availability:", error)
        } finally {
            setLoadingAvailability(false)
        }
    }

    // Tìm kiếm khách hàng theo số điện thoại hoặc email
    const searchCustomers = async (query: string) => {
        if (!query || query.length < 3) return
        
        try {
            setLoadingCustomers(true)
            const response = await axios.get(
                `${API_URL}/admin/users/search?query=${encodeURIComponent(query)}`, 
                getAuthHeader()
            )
            if (response.data && Array.isArray(response.data)) {
                setCustomers(response.data)
            }
        } catch (error) {
            console.error("Error searching customers:", error)
            toast({
                title: "Lỗi tìm kiếm",
                description: "Không thể tìm kiếm khách hàng. Vui lòng thử lại.",
                variant: "destructive",
            })
        } finally {
            setLoadingCustomers(false)
        }
    }

    // Chọn khách hàng từ kết quả tìm kiếm
    const selectCustomer = (customer: any) => {
        setBookingFormData(prev => ({
            ...prev,
            customerName: customer.fullName || '',
            customerPhone: customer.phone || '',
            customerEmail: customer.email || ''
        }))
        setCustomers([])
        setSearchCustomer('')
    }

    // Xử lý thay đổi sân
    const handleCourtChange = (courtId: number) => {
        setBookingFormData(prev => ({ ...prev, courtId, timeSlotId: 0 }))
        loadTimeSlots(courtId)
    }
    
    // Xử lý thay đổi ngày
    const handleDateChange = (date: string) => {
        setBookingFormData(prev => ({ ...prev, bookingDate: date, timeSlotId: 0 }))
        if (bookingFormData.courtId) {
            checkAllTimeSlotsAvailability(bookingFormData.courtId, date, timeSlots)
        }
    }

    // Kiểm tra khung giờ có khả dụng không
    const checkTimeSlotAvailability = async () => {
        const { courtId, timeSlotId, bookingDate } = bookingFormData
        if (!courtId || !timeSlotId || !bookingDate) return
        
        try {
            const response = await axios.get(
                `${API_URL.replace('/admin', '')}/bookings/check-availability?courtId=${courtId}&timeSlotId=${timeSlotId}&date=${bookingDate}`,
                getAuthHeader()
            )
            // Kiểm tra response và xác định kiểu dữ liệu
            if (response.data && typeof response.data === 'object') {
                // Sử dụng type assertion để tránh lỗi TypeScript
                const availabilityData = response.data as { available: boolean }
                return availabilityData.available === true
            }
            return false
        } catch (error) {
            console.error("Error checking availability:", error)
            return false
        }
    }

    // Tạo đặt sân mới
    const handleCreateBooking = async () => {
        const { customerName, customerPhone, customerEmail, courtId, timeSlotId, bookingDate, notes } = bookingFormData
        
        // Validate
        if (!customerName || !customerPhone || !courtId || !timeSlotId || !bookingDate) {
            toast({
                title: "Lỗi",
                description: "Vui lòng điền đầy đủ thông tin bắt buộc",
                variant: "destructive"
            })
            return
        }
        
        // Kiểm tra tính khả dụng
        const isAvailable = await checkTimeSlotAvailability()
        if (!isAvailable) {
            toast({
                title: "Lỗi",
                description: "Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác",
                variant: "destructive"
            })
            return
        }
        
        try {
            // Tạo hoặc lấy user
            let userId: number | undefined
            const userResponse = await axios.post(
                `${API_URL}/admin/users/create-or-find`,
                { fullName: customerName, email: customerEmail, phone: customerPhone },
                getAuthHeader()
            )
            // Kiểm tra và xác định kiểu dữ liệu response
            if (userResponse.data && typeof userResponse.data === 'object') {
                // Sử dụng type assertion để tránh lỗi TypeScript
                const userData = userResponse.data as { id: number }
                userId = userData.id
            }
            
            if (!userId) {
                toast({
                    title: "Lỗi",
                    description: "Không thể tạo hoặc tìm người dùng",
                    variant: "destructive"
                })
                return
            }
            
            // Tạo booking
            const bookingResponse = await axios.post(
                `${API_URL}/admin/bookings`,
                {
                    userId,
                    courtId,
                    timeSlotId,
                    bookingDate,
                    notes,
                    isWalkIn: true // Đánh dấu là đặt sân tại quầy
                },
                getAuthHeader()
            )
            
            if (bookingResponse.data) {
                // Sử dụng type assertion để tránh lỗi TypeScript
                const bookingData = bookingResponse.data as { id?: number; bookingId?: number }
                const newBookingId = bookingData.id || bookingData.bookingId
                
                toast({
                    title: "Thành công",
                    description: "Đã tạo đặt sân thành công. Đang chuyển đến trang chi tiết...",
                })
                
                // Reset form data
                setBookingFormData({
                    customerName: '',
                    customerPhone: '',
                    customerEmail: '',
                    courtId: 0,
                    timeSlotId: 0,
                    bookingDate: format(new Date().setDate(new Date().getDate() + 1), 'yyyy-MM-dd'),
                    notes: ''
                })
                setCustomers([])
                setSearchCustomer('')
                setTimeSlots([])
                setAvailableTimeSlots([])
                setIsBookingDialogOpen(false)
                
                // Chuyển đến trang chi tiết đặt sân sau 1 giây
                setTimeout(() => {
                    if (newBookingId) {
                        window.location.href = `/admin/bookings/${newBookingId}/detail`
                    } else {
                        loadBookingData() // Tải lại danh sách nếu không có ID
                    }
                }, 1000)
            }
        } catch (error: any) {
            console.error("Error creating booking:", error)
            toast({
                title: "Lỗi",
                description: error.response?.data?.message || "Có lỗi xảy ra khi tạo đặt sân",
                variant: "destructive"
            })
        }
    }

    // Statistics moved to Analytics page

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
                            <Button 
                                onClick={handleOpenBookingDialog}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
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

                    {/* Stats Cards moved to Analytics page */}

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
                                            <TableHead className="font-semibold text-slate-700 w-16">STT</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Khách hàng</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Sân cầu lông</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Thời gian</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Số tiền</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Trạng thái</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Thanh toán</TableHead>
                                            <TableHead className="font-semibold text-slate-700 text-right">Thao tác</TableHead>
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
                                        ) : error ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-12">
                                                    <p className="text-red-600 mb-4">{error}</p>
                                                    <Button onClick={loadBookingData} variant="outline">
                                                        Thử lại
                                                    </Button>
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
                                                            #{index + 1}
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
                                                        <div className="flex space-x-1 justify-end">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                                                                onClick={() => window.location.href = `/admin/bookings/${booking.id}/detail`}
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

            {/* Dialog đặt sân tại quầy */}
            <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>Đặt Sân Tại Quầy</DialogTitle>
                        <DialogDescription>
                            Nhập thông tin khách hàng và chi tiết đặt sân
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Thông tin khách hàng */}
                            <div className="space-y-2">
                                <Label htmlFor="customerSearch">Tìm khách hàng</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="customerSearch"
                                        placeholder="Tìm theo SĐT hoặc email"
                                        value={searchCustomer}
                                        onChange={(e) => {
                                            setSearchCustomer(e.target.value)
                                            if (e.target.value.length >= 3) {
                                                searchCustomers(e.target.value)
                                            }
                                        }}
                                        className="pl-10"
                                    />
                                    {loadingCustomers && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
                                        </div>
                                    )}
                                </div>
                                {customers.length > 0 && (
                                    <div className="bg-white shadow-lg rounded-md border p-2 mt-1 max-h-32 overflow-y-auto">
                                        {customers.map((customer, index) => (
                                            <div
                                                key={index}
                                                className="p-2 hover:bg-slate-50 cursor-pointer rounded-sm"
                                                onClick={() => selectCustomer(customer)}
                                            >
                                                <p className="font-medium">{customer.fullName}</p>
                                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                                    <span className="flex items-center">
                                                        <Phone className="h-3 w-3 mr-1" />
                                                        {customer.phone || 'N/A'}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Mail className="h-3 w-3 mr-1" />
                                                        {customer.email || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerName">Tên khách hàng *</Label>
                                    <Input
                                        id="customerName"
                                        value={bookingFormData.customerName}
                                        onChange={(e) => setBookingFormData(prev => ({ ...prev, customerName: e.target.value }))}
                                        placeholder="Nhập tên khách hàng"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customerPhone">Số điện thoại *</Label>
                                        <Input
                                            id="customerPhone"
                                            value={bookingFormData.customerPhone}
                                            onChange={(e) => setBookingFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="customerEmail">Email</Label>
                                        <Input
                                            id="customerEmail"
                                            value={bookingFormData.customerEmail}
                                            onChange={(e) => setBookingFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                                            placeholder="Nhập email"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin đặt sân */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="court">Chọn sân *</Label>
                                <Select
                                    value={bookingFormData.courtId.toString()}
                                    onValueChange={(value) => handleCourtChange(parseInt(value))}
                                >
                                    <SelectTrigger id="court" className={loadingCourts ? 'opacity-70' : ''}>
                                        <SelectValue placeholder="Chọn sân cầu lông" />
                                        {loadingCourts && (
                                            <RefreshCw className="h-4 w-4 animate-spin ml-2 text-slate-400" />
                                        )}
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0" disabled>Chọn sân</SelectItem>
                                        {courts.map((court) => (
                                            <SelectItem key={court.id} value={court.id.toString()}>
                                                {court.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bookingDate">Ngày đặt *</Label>
                                <Input
                                    id="bookingDate"
                                    type="date"
                                    value={bookingFormData.bookingDate}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    min={format(new Date(), 'yyyy-MM-dd')}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="timeSlot">Khung giờ *</Label>
                                {loadingAvailability && (
                                    <div className="flex items-center text-xs text-slate-500">
                                        <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                        Đang kiểm tra tính khả dụng...
                                    </div>
                                )}
                            </div>
                            <Select
                                value={bookingFormData.timeSlotId.toString()}
                                onValueChange={(value) => setBookingFormData(prev => ({ ...prev, timeSlotId: parseInt(value) }))}
                                disabled={!bookingFormData.courtId || loadingTimeSlots || loadingAvailability}
                            >
                                <SelectTrigger id="timeSlot" className={loadingTimeSlots ? 'opacity-70' : ''}>
                                    <SelectValue placeholder="Chọn khung giờ" />
                                    {loadingTimeSlots && (
                                        <RefreshCw className="h-4 w-4 animate-spin ml-2 text-slate-400" />
                                    )}
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0" disabled>Chọn khung giờ</SelectItem>
                                    {timeSlots.map((slot) => {
                                        const isAvailable = availableTimeSlots.includes(slot.id);
                                        return (
                                            <SelectItem 
                                                key={slot.id} 
                                                value={slot.id.toString()} 
                                                disabled={!isAvailable}
                                                className={!isAvailable ? 'opacity-50' : ''}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span>{slot.startTime} - {slot.endTime} | {slot.price?.toLocaleString('vi-VN')} VNĐ</span>
                                                    {isAvailable ? (
                                                        <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                                                            Còn trống
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="ml-2 bg-red-100 text-red-800 border-red-200">
                                                            Đã đặt
                                                        </Badge>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Ghi chú</Label>
                            <Textarea
                                id="notes"
                                value={bookingFormData.notes}
                                onChange={(e) => setBookingFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Thêm ghi chú cho đặt sân (nếu có)"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleCreateBooking} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                            Tạo Đặt Sân
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}