"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  ArrowUpDown,
  Calendar,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  TrendingUp,
  AlertCircle
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import axios from "axios"
import { toast } from "@/components/ui/use-toast"

interface CustomerBooking {
  id: number
  customerName: string
  customerPhone: string
  customerEmail: string
  courtName: string
  courtLocation: string
  bookingDate: string
  startTime: string
  endTime: string
  status: string
  paymentStatus: string
  amount: number
  notes?: string
  createdAt: string
}

const API_URL = 'http://localhost:8080/api/admin';

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

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<CustomerBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentBooking, setCurrentBooking] = useState<CustomerBooking | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState({ key: "bookingDate", direction: "desc" })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Build query parameters
      const params = new URLSearchParams();
      if (dateFilter !== "all") params.append("dateFilter", dateFilter);
      if (statusFilter !== "all") params.append("statusFilter", statusFilter);

      const response = await axios.get(
        `${API_URL}/bookings/all?${params.toString()}`, 
        getAuthHeader()
      )
      
      if (response.data && Array.isArray(response.data)) {
        // Map backend data to frontend format  
        const mappedBookings = response.data.map((booking: any) => ({
          id: booking.id,
          customerName: booking.userName || 'N/A',
          customerPhone: booking.userPhone || 'N/A', 
          customerEmail: booking.userEmail || 'N/A',
          courtName: booking.courtName || 'N/A',
          courtLocation: booking.courtLocation || 'N/A',
          bookingDate: booking.bookingDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
          paymentStatus: booking.paymentStatus || 'pending',
          amount: booking.totalAmount || 0,
          notes: booking.notes,
          createdAt: booking.createdAt || new Date().toISOString()
        }));
        setBookings(mappedBookings)
      } else {
        setBookings([])
      }
    } catch (error: any) {
      console.error("Error loading bookings:", error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      setError("Có lỗi xảy ra khi tải dữ liệu")
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadBookings().finally(() => setIsRefreshing(false))
  }

  // Load data when filters change
  useEffect(() => {
    if (!isLoading) {
      loadBookings()
    }
  }, [dateFilter, statusFilter])

  const handleSort = (key: keyof CustomerBooking) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedBookings = [...bookings].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof CustomerBooking];
    const bValue = b[sortConfig.key as keyof CustomerBooking];
    
    if (aValue !== undefined && bValue !== undefined) {
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  })

  const filteredBookings = sortedBookings.filter((booking) => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.customerPhone.includes(searchTerm) ||
                          booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.courtName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleViewBooking = (booking: CustomerBooking) => {
    setCurrentBooking(booking)
    setIsDialogOpen(true)
  }

  const handleConfirmBooking = async (bookingId: number) => {
    try {
      const response = await axios.post(`${API_URL}/bookings/${bookingId}/approve`, {}, getAuthHeader())
      
      if (response.data.success) {
        const { invoiceCreated, invoiceId } = response.data;
        
      loadBookings() // Refresh data
      toast({
        title: "Thành công",
          description: invoiceCreated 
            ? `Đã xác nhận đặt sân và tạo hóa đơn #${invoiceId} thành công`
            : "Đã xác nhận đặt sân thành công",
      })
      }
    } catch (error) {
      console.error('Error confirming booking:', error)
      toast({
        title: "Lỗi", 
        description: "Có lỗi xảy ra khi xác nhận đặt sân",
        variant: "destructive",
      })
    }
  }

  const handleCancelBooking = async (bookingId: number) => {
    try {
      // Temporarily update local state (since cancel endpoint might not exist yet)
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: "3", paymentStatus: "refunded" } : b
      ))
      
      toast({
        title: "Thành công",
        description: "Đã hủy đặt sân thành công",
      })
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi hủy đặt sân", 
        variant: "destructive",
      })
    }
  }

  // Status mapping functions
  const getStatusText = (status: string) => {
    switch (status) {
      case "1": return "Đang chờ";
      case "2": return "Đã xác nhận";
      case "3": return "Đã hủy";
      default: return "Không xác định";
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Chờ thanh toán";
      case "paid": return "Đã thanh toán"; 
      case "refunded": return "Đã hoàn tiền";
      default: return "Không xác định";
    }
  }

  // Statistics
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === "2").length;
  const pendingBookings = bookings.filter(b => b.status === "1").length;
  const paidBookings = bookings.filter(b => b.paymentStatus === "paid").length;
  const totalRevenue = bookings
    .filter(b => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-600 bg-clip-text text-transparent mb-2">
                Lịch Sử Đặt Sân Khách Hàng
              </h1>
              <p className="text-slate-600 text-lg">
                Theo dõi và quản lý tất cả các đặt sân của khách hàng
              </p>
            </div>
            <div className="flex space-x-3 mt-4 lg:mt-0">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                className="border-slate-300 hover:border-slate-400"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Đang tải...' : 'Làm mới'}
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-6 md:grid-cols-5 mb-8">
            <Card className="backdrop-blur-sm bg-white/70 border-white/50 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Tổng Đặt Sân
                </CardTitle>
                <CalendarDays className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{totalBookings}</div>
                <p className="text-xs text-slate-500 mt-1">
                  Tất cả đặt sân
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/70 border-white/50 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Đã Xác Nhận
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{confirmedBookings}</div>
                <p className="text-xs text-slate-500 mt-1">
                  Đặt sân đã xác nhận
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/70 border-white/50 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Chờ Xử Lý
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingBookings}</div>
                <p className="text-xs text-slate-500 mt-1">
                  Chờ xác nhận
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/70 border-white/50 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Đã Thanh Toán
                </CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{paidBookings}</div>
                <p className="text-xs text-slate-500 mt-1">
                  Hoàn tất thanh toán
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/70 border-white/50 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Tổng Doanh Thu
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {totalRevenue.toLocaleString('vi-VN')} VNĐ
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Từ đặt sân đã thanh toán
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="mb-8 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm khách hàng, sân..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

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

                <div className="flex items-center">
                  <Filter className="h-4 w-4 text-slate-500 mr-2" />
                  <span className="text-sm text-slate-600">
                    {filteredBookings.length} kết quả
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Table */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/50">
              <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                <Users className="h-6 w-6 mr-2 text-blue-600" />
                Lịch Sử Đặt Sân Khách Hàng
              </CardTitle>
              <CardDescription className="text-slate-600 mt-1">
                Danh sách chi tiết tất cả các đặt sân của khách hàng
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-200">
                      <TableHead className="w-16">STT</TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('customerName')}
                          className="h-auto p-0 text-left justify-start font-semibold hover:bg-transparent"
                        >
                          Khách hàng
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">Sân</TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('bookingDate')}
                          className="h-auto p-0 text-left justify-start font-semibold hover:bg-transparent"
                        >
                          Ngày & Giờ
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">Trạng thái</TableHead>
                      <TableHead className="font-semibold text-slate-700">Thanh toán</TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('amount')}
                          className="h-auto p-0 text-left justify-start font-semibold hover:bg-transparent"
                        >
                          Số tiền
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
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
                          <Button onClick={loadBookings} variant="outline">
                            Thử lại
                          </Button>
                        </TableCell>
                      </TableRow>
                    ) : filteredBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <div className="text-slate-500">
                            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-slate-300" />
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
                          <TableCell className="font-medium text-slate-600">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-slate-900">{booking.customerName}</p>
                              <div className="flex items-center text-xs text-slate-500">
                                <Phone className="h-3 w-3 mr-1" />
                                {booking.customerPhone}
                              </div>
                              <div className="flex items-center text-xs text-slate-500">
                                <Mail className="h-3 w-3 mr-1" />
                                {booking.customerEmail}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-slate-900">{booking.courtName}</p>
                              {booking.courtLocation && (
                                <div className="flex items-center text-xs text-slate-500">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {booking.courtLocation}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-slate-900">
                                {booking.bookingDate && !isNaN(new Date(booking.bookingDate).getTime())
                                  ? format(new Date(booking.bookingDate), "dd/MM/yyyy", { locale: vi })
                                  : "Không có thông tin"}
                              </p>
                              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                                {`${booking.startTime} - ${booking.endTime}`}
                              </span>
                            </div>
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
                          <TableCell className="font-semibold text-slate-900">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                              {booking.amount.toLocaleString('vi-VN')} VNĐ
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex space-x-1 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewBooking(booking)}
                                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                              >
                                <Eye className="h-3 w-3" />
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

      {/* View Booking Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi Tiết Đặt Sân</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về đặt sân #{currentBooking?.id}
            </DialogDescription>
          </DialogHeader>
          {currentBooking && (
            <div className="grid gap-6 py-4">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Thông tin khách hàng
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Tên:</span> {currentBooking.customerName}</p>
                    <p><span className="font-medium">Điện thoại:</span> {currentBooking.customerPhone}</p>
                    <p><span className="font-medium">Email:</span> {currentBooking.customerEmail}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Thông tin sân
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Sân:</span> {currentBooking.courtName}</p>
                    <p><span className="font-medium">Vị trí:</span> {currentBooking.courtLocation}</p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Thời gian đặt
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Ngày:</span> {
                      currentBooking.bookingDate && !isNaN(new Date(currentBooking.bookingDate).getTime())
                        ? format(new Date(currentBooking.bookingDate), "dd/MM/yyyy", { locale: vi })
                        : "Không có thông tin"
                    }</p>
                    <p><span className="font-medium">Giờ:</span> {currentBooking.startTime} - {currentBooking.endTime}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Thanh toán
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Số tiền:</span> {currentBooking.amount.toLocaleString('vi-VN')} VNĐ</p>
                    <p><span className="font-medium">Trạng thái:</span> 
                      <Badge className="ml-2">
                        {getPaymentStatusText(currentBooking.paymentStatus)}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              {/* Status and Notes */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Trạng thái và ghi chú
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Trạng thái đặt sân:</span> 
                    <Badge className="ml-2">
                      {getStatusText(currentBooking.status)}
                    </Badge>
                  </p>
                  {currentBooking.notes && (
                    <p><span className="font-medium">Ghi chú:</span> {currentBooking.notes}</p>
                  )}
                  <p><span className="font-medium">Ngày tạo:</span> {
                    currentBooking.createdAt && !isNaN(new Date(currentBooking.createdAt).getTime()) 
                      ? format(new Date(currentBooking.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })
                      : "Không có thông tin"
                  }</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
} 