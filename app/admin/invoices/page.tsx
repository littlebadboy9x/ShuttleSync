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
  Download, 
  RefreshCw, 
  Filter, 
  ArrowUpDown,
  Receipt,
  CalendarDays,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface Invoice {
  id: number
  invoiceNumber: string
  customerName: string
  bookingId: number
  courtName: string
  amount: number
  status: string
  createdAt: string
  paidAt?: string
  paymentMethod?: string
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" })

  // Mock data để hiển thị UI
  const mockInvoices: Invoice[] = [
    {
      id: 1,
      invoiceNumber: "INV-2023-001",
      customerName: "Nguyễn Văn A",
      bookingId: 101,
      courtName: "Sân 01",
      amount: 150000,
      status: "paid",
      createdAt: "2023-10-15T08:30:00",
      paidAt: "2023-10-15T09:15:00",
      paymentMethod: "MoMo"
    },
    {
      id: 2,
      invoiceNumber: "INV-2023-002",
      customerName: "Trần Thị B",
      bookingId: 102,
      courtName: "Sân 03",
      amount: 200000,
      status: "pending",
      createdAt: "2023-10-16T10:00:00"
    },
    {
      id: 3,
      invoiceNumber: "INV-2023-003",
      customerName: "Lê Văn C",
      bookingId: 103,
      courtName: "Sân 02",
      amount: 180000,
      status: "paid",
      createdAt: "2023-10-16T14:45:00",
      paidAt: "2023-10-16T15:30:00",
      paymentMethod: "VNPAY"
    },
    {
      id: 4,
      invoiceNumber: "INV-2023-004",
      customerName: "Phạm Thị D",
      bookingId: 104,
      courtName: "Sân 04",
      amount: 250000,
      status: "cancelled",
      createdAt: "2023-10-17T09:15:00"
    },
    {
      id: 5,
      invoiceNumber: "INV-2023-005",
      customerName: "Hoàng Văn E",
      bookingId: 105,
      courtName: "Sân 01",
      amount: 150000,
      status: "paid",
      createdAt: "2023-10-17T16:00:00",
      paidAt: "2023-10-17T16:45:00",
      paymentMethod: "Tiền mặt"
    }
  ]

  useEffect(() => {
    // Mô phỏng việc tải dữ liệu từ API
    const fetchInvoices = () => {
      setIsLoading(true)
      setTimeout(() => {
        setInvoices(mockInvoices)
        setIsLoading(false)
      }, 1000)
    }

    fetchInvoices()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Mô phỏng việc làm mới dữ liệu
    setTimeout(() => {
      setInvoices(mockInvoices)
      setIsRefreshing(false)
    }, 1000)
  }

  const handleSort = (key: keyof Invoice) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedInvoices = [...invoices].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof Invoice];
    const bValue = b[sortConfig.key as keyof Invoice];
    
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

  const filteredInvoices = sortedInvoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleViewInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice)
    setIsDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Đã thanh toán
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Chờ thanh toán
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

  // Tính tổng doanh thu
  const totalRevenue = filteredInvoices
    .filter(invoice => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0)

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-600 bg-clip-text text-transparent mb-2">
                Quản Lý Hóa Đơn
              </h1>
              <p className="text-slate-600 text-lg">
                Theo dõi và quản lý hóa đơn thanh toán
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
                      Tổng Hóa Đơn
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {filteredInvoices.length}
                    </h3>
                    <div className="text-sm text-slate-500">
                      {filteredInvoices.filter(i => i.status === "paid").length} đã thanh toán
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-blue-50 group-hover:scale-110 transition-transform duration-200">
                    <Receipt className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      Doanh Thu
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {totalRevenue.toLocaleString('vi-VN')} VNĐ
                    </h3>
                    <div className="text-sm text-slate-500">
                      Từ {filteredInvoices.filter(i => i.status === "paid").length} hóa đơn đã thanh toán
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-green-50 group-hover:scale-110 transition-transform duration-200">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      Chờ Thanh Toán
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {filteredInvoices.filter(i => i.status === "pending").length}
                    </h3>
                    <div className="text-sm text-slate-500">
                      {filteredInvoices.filter(i => i.status === "pending").reduce((sum, i) => sum + i.amount, 0).toLocaleString('vi-VN')} VNĐ
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
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm theo mã hóa đơn hoặc tên khách hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="w-full md:w-[200px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="paid">Đã thanh toán</SelectItem>
                      <SelectItem value="pending">Chờ thanh toán</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoices Table */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                    <FileText className="h-6 w-6 mr-2 text-blue-600" />
                    Danh Sách Hóa Đơn
                  </CardTitle>
                  <CardDescription className="text-slate-600 mt-1">
                    Quản lý tất cả hóa đơn thanh toán
                  </CardDescription>
                </div>
                <div className="flex items-center mt-4 sm:mt-0">
                  <Filter className="h-4 w-4 text-slate-500 mr-2" />
                  <span className="text-sm text-slate-600">
                    {filteredInvoices.length} hóa đơn
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
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort('invoiceNumber')}>
                          Mã hóa đơn
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">Khách hàng</TableHead>
                      <TableHead className="font-semibold text-slate-700">Sân</TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort('amount')}>
                          Số tiền
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort('createdAt')}>
                          Ngày tạo
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">Trạng thái</TableHead>
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
                    ) : filteredInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="text-slate-500">
                            <Receipt className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                            <p className="text-lg font-medium">Không có dữ liệu</p>
                            <p className="text-sm">Chưa có hóa đơn nào phù hợp với bộ lọc</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInvoices.map((invoice, index) => (
                        <TableRow
                          key={invoice.id}
                          className={`hover:bg-slate-50/50 transition-colors duration-150 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                          }`}
                        >
                          <TableCell className="font-medium text-slate-900">
                            <span className="px-2 py-1 bg-slate-100 rounded-md text-sm">
                              {invoice.invoiceNumber}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-slate-800">
                            {invoice.customerName}
                          </TableCell>
                          <TableCell className="text-slate-700">
                            {invoice.courtName}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                              {invoice.amount.toLocaleString('vi-VN')} VNĐ
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-700">
                            <div className="flex items-center">
                              <CalendarDays className="h-4 w-4 text-slate-400 mr-1" />
                              {format(new Date(invoice.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(invoice.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewInvoice(invoice)}
                                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors duration-150"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Xem
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors duration-150"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Tải PDF
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

      {/* Invoice Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi Tiết Hóa Đơn</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về hóa đơn {currentInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          
          {currentInvoice && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Hóa đơn #{currentInvoice.invoiceNumber}</h3>
                  <p className="text-sm text-slate-500">
                    Ngày tạo: {format(new Date(currentInvoice.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </p>
                </div>
                {getStatusBadge(currentInvoice.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Thông tin khách hàng</h4>
                  <p className="text-slate-900">{currentInvoice.customerName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Mã đặt sân</h4>
                  <p className="text-slate-900">#{currentInvoice.bookingId}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Sân</h4>
                  <p className="text-slate-900">{currentInvoice.courtName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Số tiền</h4>
                  <p className="text-slate-900 font-bold">{currentInvoice.amount.toLocaleString('vi-VN')} VNĐ</p>
                </div>
              </div>
              
              {currentInvoice.status === "paid" && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Thông tin thanh toán</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs text-slate-500 mb-1">Thời gian thanh toán</h5>
                      <p className="text-slate-900">{format(new Date(currentInvoice.paidAt!), "dd/MM/yyyy HH:mm", { locale: vi })}</p>
                    </div>
                    <div>
                      <h5 className="text-xs text-slate-500 mb-1">Phương thức thanh toán</h5>
                      <p className="text-slate-900">{currentInvoice.paymentMethod}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Đóng
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Tải PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
