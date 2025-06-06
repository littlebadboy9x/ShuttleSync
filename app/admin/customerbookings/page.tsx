"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Eye, 
  Calendar,
  RefreshCw, 
  Filter, 
  ArrowUpDown,
  CheckCircle,
  Clock,
  AlertCircle,
  CalendarDays,
  User,
  MapPin
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface CustomerBooking {
  id: number
  customerName: string
  customerPhone: string
  courtName: string
  bookingDate: string
  startTime: string
  endTime: string
  status: string
  paymentStatus: string
  amount: number
}

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

  // Mock data để hiển thị UI
  const mockBookings: CustomerBooking[] = [
    {
      id: 1,
      customerName: "Nguyễn Văn A",
      customerPhone: "0901234567",
      courtName: "Sân 01",
      bookingDate: "2023-10-15",
      startTime: "08:00",
      endTime: "10:00",
      status: "confirmed",
      paymentStatus: "paid",
      amount: 150000
    },
    {
      id: 2,
      customerName: "Trần Thị B",
      customerPhone: "0912345678",
      courtName: "Sân 02",
      bookingDate: "2023-10-16",
      startTime: "14:00",
      endTime: "16:00",
      status: "pending",
      paymentStatus: "pending",
      amount: 200000
    },
    {
      id: 3,
      customerName: "Lê Văn C",
      customerPhone: "0923456789",
      courtName: "Sân 03",
      bookingDate: "2023-10-16",
      startTime: "18:00",
      endTime: "20:00",
      status: "confirmed",
      paymentStatus: "paid",
      amount: 180000
    },
    {
      id: 4,
      customerName: "Phạm Thị D",
      customerPhone: "0934567890",
      courtName: "Sân 01",
      bookingDate: "2023-10-17",
      startTime: "09:00",
      endTime: "11:00",
      status: "cancelled",
      paymentStatus: "refunded",
      amount: 150000
    },
    {
      id: 5,
      customerName: "Hoàng Văn E",
      customerPhone: "0945678901",
      courtName: "Sân 04",
      bookingDate: "2023-10-18",
      startTime: "16:00",
      endTime: "18:00",
      status: "confirmed",
      paymentStatus: "paid",
      amount: 220000
    }
  ]

  useEffect(() => {
    // Mô phỏng việc tải dữ liệu từ API
    const fetchBookings = () => {
      setIsLoading(true)
      setTimeout(() => {
        setBookings(mockBookings)
        setIsLoading(false)
      }, 1000)
    }

    fetchBookings()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Mô phỏng việc làm mới dữ liệu
    setTimeout(() => {
      setBookings(mockBookings)
      setIsRefreshing(false)
    }, 1000)
  }

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

  const filteredBookings = sortedBookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         booking.customerPhone.includes(searchTerm) ||
                         booking.courtName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    
    let matchesDate = true
    if (dateFilter === "today") {
      matchesDate = booking.bookingDate === format(new Date(), "yyyy-MM-dd")
    } else if (dateFilter === "tomorrow") {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      matchesDate = booking.bookingDate === format(tomorrow, "yyyy-MM-dd")
    } else if (dateFilter === "thisWeek") {
      const today = new Date()
      const bookingDate = new Date(booking.bookingDate)
      const diffTime = bookingDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      matchesDate = diffDays >= 0 && diffDays < 7
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const handleViewBooking = (booking: CustomerBooking) => {
    setCurrentBooking(booking)
    setIsDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Đã xác nhận
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Chờ xác nhận
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Đã hủy
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            Không xác định
          </Badge>
        )
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Đã thanh toán
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Chờ thanh toán
          </Badge>
        )
      case "refunded":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Đã hoàn tiền
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            Không xác định
          </Badge>
        )
    }
  }

  const handleConfirmBooking = (id: number) => {
    // Mô phỏng việc xác nhận đặt sân
    setBookings(bookings.map(booking => 
      booking.id === id ? { ...booking, status: "confirmed" } : booking
    ))
    setIsDialogOpen(false)
  }

  const handleCancelBooking = (id: number) => {
    // Mô phỏng việc hủy đặt sân
    setBookings(bookings.map(booking => 
      booking.id === id ? { ...booking, status: "cancelled" } : booking
    ))
    setIsDialogOpen(false)
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-600 bg-clip-text text-transparent mb-2">
                Đặt Sân Khách Hàng
              </h1>
              <p className="text-slate-600 text-lg">
                Quản lý lịch đặt sân của khách hàng
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                className="border-slate-300 hover:border-slate-400 transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Đang tải...' : 'Làm mới'}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      Tổng Đặt Sân
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {filteredBookings.length}
                    </h3>
                    <div className="text-sm text-slate-500">
                      {filteredBookings.filter(b => b.status === "confirmed").length} đã xác nhận
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-blue-50 group-hover:scale-110 transition-transform duration-200">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      Đặt Sân Hôm Nay
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {filteredBookings.filter(b => b.bookingDate === format(new Date(), "yyyy-MM-dd")).length}
                    </h3>
                    <div className="text-sm text-slate-500">
                      {format(new Date(), "dd/MM/yyyy", { locale: vi })}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-green-50 group-hover:scale-110 transition-transform duration-200">
                    <CalendarDays className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      Chờ Xác Nhận
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {filteredBookings.filter(b => b.status === "pending").length}
                    </h3>
                    <div className="text-sm text-slate-500">
                      Cần xác nhận sớm
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-yellow-50 group-hover:scale-110 transition-transform duration-200">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="mb-8 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm theo tên, số điện thoại..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                      <SelectItem value="pending">Chờ xác nhận</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Lọc theo ngày" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả các ngày</SelectItem>
                      <SelectItem value="today">Hôm nay</SelectItem>
                      <SelectItem value="tomorrow">Ngày mai</SelectItem>
                      <SelectItem value="thisWeek">Tuần này</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Table */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                    <Calendar className="h-6 w-6 mr-2 text-blue-600" />
                    Danh Sách Đặt Sân
                  </CardTitle>
                  <CardDescription className="text-slate-600 mt-1">
                    Quản lý tất cả lịch đặt sân của khách hàng
                  </CardDescription>
                </div>
                <div className="flex items-center mt-4 sm:mt-0">
                  <Filter className="h-4 w-4 text-slate-500 mr-2" />
                  <span className="text-sm text-slate-600">
                    {filteredBookings.length} đặt sân
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-200">
                      <TableHead className="font-semibold text-slate-700">
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort('customerName')}>
                          Khách hàng
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort('courtName')}>
                          Sân
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort('bookingDate')}>
                          Ngày
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">Giờ</TableHead>
                      <TableHead className="font-semibold text-slate-700">Trạng thái</TableHead>
                      <TableHead className="font-semibold text-slate-700">Thanh toán</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
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
                            <div className="flex flex-col">
                              <span className="flex items-center">
                                <User className="h-3 w-3 mr-1 text-slate-400" />
                                {booking.customerName}
                              </span>
                              <span className="text-xs text-slate-500">{booking.customerPhone}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-700">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                              {booking.courtName}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-700">
                            {format(new Date(booking.bookingDate), "dd/MM/yyyy", { locale: vi })}
                          </TableCell>
                          <TableCell className="text-slate-700">
                            <span className="px-2 py-1 bg-slate-100 rounded-md text-xs">
                              {booking.startTime} - {booking.endTime}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(booking.status)}
                          </TableCell>
                          <TableCell>
                            {getPaymentStatusBadge(booking.paymentStatus)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewBooking(booking)}
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

      {/* Booking Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi Tiết Đặt Sân</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về lịch đặt sân của khách hàng
            </DialogDescription>
          </DialogHeader>
          
          {currentBooking && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Đặt sân #{currentBooking.id}</h3>
                  <p className="text-sm text-slate-500">
                    Ngày đặt: {format(new Date(currentBooking.bookingDate), "dd/MM/yyyy", { locale: vi })}
                  </p>
                </div>
                {getStatusBadge(currentBooking.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Thông tin khách hàng</h4>
                  <p className="text-slate-900">{currentBooking.customerName}</p>
                  <p className="text-slate-600">{currentBooking.customerPhone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Thông tin sân</h4>
                  <p className="text-slate-900">{currentBooking.courtName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Thời gian</h4>
                  <p className="text-slate-900">{format(new Date(currentBooking.bookingDate), "dd/MM/yyyy", { locale: vi })}</p>
                  <p className="text-slate-600">{currentBooking.startTime} - {currentBooking.endTime}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Thanh toán</h4>
                  <p className="text-slate-900 font-bold">{currentBooking.amount.toLocaleString('vi-VN')} VNĐ</p>
                  <p className="mt-1">{getPaymentStatusBadge(currentBooking.paymentStatus)}</p>
                </div>
              </div>
              
              {currentBooking.status === "pending" && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Xác nhận đặt sân</h4>
                  <p className="text-sm text-slate-500 mb-4">
                    Vui lòng xác nhận hoặc từ chối yêu cầu đặt sân này
                  </p>
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                      onClick={() => handleCancelBooking(currentBooking.id)}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Từ chối
                    </Button>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      onClick={() => handleConfirmBooking(currentBooking.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Xác nhận
                    </Button>
                  </div>
                </div>
              )}
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