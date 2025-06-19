"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Filter, 
  ArrowUpDown,
  FileText,
  DollarSign,
  Eye,
  Download,
  Printer,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import axios from "axios"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"

interface InvoiceDetail {
  id: number
  itemName: string
  bookingDate?: string
  startTime?: string
  endTime?: string
  courtName?: string
  quantity: number
  unitPrice: number
  amount: number
  notes?: string
}

interface Invoice {
  id: number
  bookingId: number
  customerName: string
  customerEmail: string
  customerPhone: string
  invoiceDate: string
  
  // Thông tin loại hóa đơn và kênh đặt
  invoiceType?: string          // ONLINE, COUNTER, PHONE, MOBILE_APP
  invoiceTypeDisplay?: string   // "🌐 Hóa đơn đặt online"
  bookingChannel?: string       // ONLINE, COUNTER, PHONE, MOBILE_APP
  bookingChannelDisplay?: string // "Đặt online"
  bookingType?: string          // ADVANCE, URGENT, RECURRING, WALK_IN
  bookingTypeDisplay?: string   // "Đặt trước"
  
  // Thông tin nhân viên (cho booking tại quầy)
  counterStaffId?: number
  counterStaffName?: string
  
  originalAmount: number
  discountAmount: number
  finalAmount: number
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
  details: InvoiceDetail[]
}

interface InvoiceStats {
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  totalRevenue: number
  avgInvoiceValue: number
}

interface MomoCreatePaymentResponse {
  payUrl: string;
  orderId: string;
  requestId: string;
  message: string;
  resultCode: string;
}

interface MomoPaymentStatusResponse {
  orderId: string;
  status: string;
  message: string;
  transactionId: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL + '/admin/invoices';

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

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<InvoiceStats>({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
    avgInvoiceValue: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState({ key: "invoiceDate", direction: "desc" })
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState("all")

  const [formData, setFormData] = useState({
    bookingId: 0,
    discountAmount: 0,
    notes: "",
    status: "Pending"
  })

  const [momoPaymentStatus, setMomoPaymentStatus] = useState<{
    orderId: string;
    invoiceId: number;
  } | null>(null);

  useEffect(() => {
    loadInvoices()
  }, [])

  // Handle payment success/failure từ MoMo redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('paymentSuccess');
    const orderId = urlParams.get('orderId');
    const message = urlParams.get('message');

    if (paymentSuccess !== null) {
      if (paymentSuccess === 'true') {
        toast({
          title: "Thanh toan thanh cong",
          description: message ? decodeURIComponent(message) : `Thanh toan MoMo thanh cong cho don hang ${orderId}`,
        });
      } else {
        toast({
          title: "Thanh toan that bai",
          description: message ? decodeURIComponent(message) : `Thanh toan MoMo that bai cho don hang ${orderId}`,
          variant: "destructive",
        });
      }
      
      // Clean URL sau khi hiển thị thông báo
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      // Reload invoices để cập nhật trạng thái
      loadInvoices();
    }
  }, []);

  const loadInvoices = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Build query parameters
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (dateFilter !== "all") params.append("dateFilter", dateFilter);
      
      console.log(`Fetching invoices with params: ${params.toString()}`);
      const response = await axios.get(`${API_URL}?${params.toString()}`, getAuthHeader())
      
      console.log("API Response:", response);
      console.log("Invoice data sample:", response.data && Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : "No invoices");
      
      if (response.data && Array.isArray(response.data)) {
        setInvoices(response.data)
        
        // Calculate statistics
        const totalInvoices = response.data.length;
        const paidInvoices = response.data.filter((inv: Invoice) => inv.status === 'Paid').length;
        const pendingInvoices = response.data.filter((inv: Invoice) => inv.status === 'Pending').length;
        const totalRevenue = response.data
          .filter((inv: Invoice) => inv.status === 'Paid')
          .reduce((sum: number, inv: Invoice) => sum + inv.finalAmount, 0);
        const avgInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
        
        setStats({
          totalInvoices,
          paidInvoices,
          pendingInvoices,
          totalRevenue,
          avgInvoiceValue
        });
      } else {
        console.log("Response data is not an array:", response.data);
        setInvoices([])
      }
    } catch (error: any) {
      console.error("Error loading invoices:", error)
      console.error("Error details:", error.response?.data || "No error details");
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      setError("Có lỗi xảy ra khi tải dữ liệu")
      setInvoices([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadInvoices().finally(() => setIsRefreshing(false))
  }

  // Load data when filters change
  useEffect(() => {
    if (!isLoading) {
      loadInvoices()
    }
  }, [statusFilter, dateFilter])

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
    const matchesSearch = invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          invoice.id.toString().includes(searchTerm)
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    const matchesType = typeFilter === "all" || invoice.invoiceType === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const handleAdd = () => {
    setCurrentInvoice(null)
    setFormData({
      bookingId: 0,
      discountAmount: 0,
      notes: "",
      status: "Pending"
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (invoice: Invoice) => {
    setCurrentInvoice(invoice)
    setFormData({
      bookingId: invoice.bookingId,
      discountAmount: invoice.discountAmount,
      notes: invoice.notes || "",
      status: invoice.status
    })
    setIsDialogOpen(true)
  }

  const handleView = (invoice: Invoice) => {
    // Navigate to detail page instead of opening modal
    window.location.href = `/admin/invoices/${invoice.id}/detail`;
  };

  const handleSaveInvoice = async () => {
    try {
      if (!formData.bookingId) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn booking",
          variant: "destructive",
        })
        return
      }

      const requestData = {
        bookingId: formData.bookingId,
        discountAmount: formData.discountAmount,
        notes: formData.notes,
        status: formData.status
      }

      if (currentInvoice) {
        // Update
        await axios.put(`${API_URL}/${currentInvoice.id}`, requestData, getAuthHeader())
        toast({
          title: "Thành công",
          description: "Đã cập nhật hóa đơn thành công",
        })
      } else {
        // Create
        await axios.post(`${API_URL}`, requestData, getAuthHeader())
        toast({
          title: "Thành công",
          description: "Đã tạo hóa đơn mới thành công",
        })
      }

      setIsDialogOpen(false)
      loadInvoices()
    } catch (error) {
      console.error("Error saving invoice:", error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi lưu hóa đơn",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async (invoiceId: number, status: string) => {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/invoices/${invoiceId}/status`,
        { status },
        {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader().headers
          },
          withCredentials: true
        }
      );

      if (response.status === 200) {
        return true;
      }
      throw new Error('Failed to update status');
    } catch (error: any) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    // Implement print functionality
    window.print()
  }

  const handleExportInvoice = async (invoice: Invoice) => {
    try {
      const response = await axios.get(`${API_URL}/${invoice.id}/export`, {
        ...getAuthHeader(),
        responseType: 'blob'
      });
      
      // Sử dụng type assertion để đảm bảo TypeScript hiểu đây là Blob
      const data = response.data as Blob;
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting invoice:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xuất hóa đơn",
        variant: "destructive",
      });
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800 border-green-200"
      case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Cancelled": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "Paid": return "Đã thanh toán"
      case "Pending": return "Chờ thanh toán"
      case "Cancelled": return "Đã hủy"
      default: return status
    }
  }

  const handlePaymentCash = async (invoice: Invoice) => {
    try {
      // Cập nhật trạng thái hóa đơn thành "Paid" ngay lập tức cho thanh toán tiền mặt
      await handleUpdateStatus(invoice.id, "Paid");
      
      toast({
        title: "Thanh cong",
        description: "Da xu ly thanh toan tien mat thanh cong",
      });
      
      loadInvoices();
    } catch (error: any) {
      console.error("Error processing cash payment:", error);
      toast({
        title: "Loi", 
        description: "Co loi xay ra khi xu ly thanh toan",
        variant: "destructive",
      });
    }
  };

  const handlePaymentMomo = async (invoice: Invoice) => {
    try {
      // Sử dụng endpoint customer/admin chung
      const response = await fetch('/api/customer/payments/momo/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể tạo thanh toán MoMo');
      }

      const data = await response.json();
      
      if (data.resultCode === "0" && data.payUrl) {
        // Mở URL thanh toán MoMo trong cửa sổ mới
        window.open(data.payUrl, "_blank");

        // Bắt đầu kiểm tra trạng thái thanh toán
        const checkPaymentStatus = async () => {
          try {
            const statusResponse = await fetch(`/api/customer/payments/momo/status/${data.orderId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (!statusResponse.ok) {
              throw new Error('Không thể kiểm tra trạng thái thanh toán');
            }

            const statusData = await statusResponse.json();

            if (statusData.success && statusData.status === "SUCCESS") {
              await handleUpdateStatus(invoice.id, "Paid");
              toast({
                title: "Thanh cong",
                description: "Thanh toan MoMo da hoan tat",
              });
              loadInvoices();
              return true;
            }
            return false;
          } catch (error) {
            console.error("Error checking payment status:", error);
            return false;
          }
        };

        // Kiểm tra trạng thái mỗi 3 giây
        const intervalId = setInterval(async () => {
          const isCompleted = await checkPaymentStatus();
          if (isCompleted) {
            clearInterval(intervalId);
          }
        }, 3000);

        // Dừng kiểm tra sau 5 phút
        setTimeout(() => {
          clearInterval(intervalId);
        }, 5 * 60 * 1000);

        toast({
          title: "Da tao thanh toan",
          description: "Vui long hoan tat thanh toan tren MoMo",
        });
      } else {
        throw new Error(data.message || "Khong the tao thanh toan MoMo");
      }
    } catch (error: any) {
      console.error("Error creating MoMo payment:", error);
      toast({
        title: "Loi",
        description: error.message || "Co loi xay ra khi tao thanh toan MoMo",
        variant: "destructive",
      });
    }
  };

  const getInvoiceTypeIcon = (type: string) => {
    switch (type) {
      case "ONLINE": return "🌐"
      case "COUNTER": return "🏢"
      case "PHONE": return "📞"
      case "MOBILE_APP": return "📱"
      default: return "❓"
    }
  }

  const getInvoiceTypeColor = (type: string) => {
    switch (type) {
      case "ONLINE": return "bg-blue-100 text-blue-800 border-blue-200"
      case "COUNTER": return "bg-green-100 text-green-800 border-green-200"
      case "PHONE": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "MOBILE_APP": return "bg-purple-100 text-purple-800 border-purple-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getBookingTypeColor = (type: string) => {
    switch (type) {
      case "ADVANCE": return "bg-green-50 text-green-700"
      case "URGENT": return "bg-orange-50 text-orange-700"
      case "RECURRING": return "bg-blue-50 text-blue-700"
      case "WALK_IN": return "bg-purple-50 text-purple-700"
      default: return "bg-gray-50 text-gray-700"
    }
  }

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
                Quản lý hóa đơn đặt sân và dịch vụ
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                className="border-slate-300 hover:border-slate-400 transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Đang tải...' : 'Làm mới'}
              </Button>
              <Button
                onClick={handleAdd}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo Hóa Đơn
              </Button>
            </div>
          </div>

          {/* Statistics Cards moved to Analytics page */}

          {/* Search and Filter */}
          <Card className="mb-8 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm hóa đơn, khách hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="Paid">Đã thanh toán</SelectItem>
                    <SelectItem value="Pending">Chờ thanh toán</SelectItem>
                    <SelectItem value="Cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Loại hóa đơn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    <SelectItem value="ONLINE">🌐 Đặt online</SelectItem>
                    <SelectItem value="COUNTER">🏢 Đặt tại quầy</SelectItem>
                    <SelectItem value="PHONE">📞 Đặt qua điện thoại</SelectItem>
                    <SelectItem value="MOBILE_APP">📱 Đặt qua app</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Lọc theo ngày" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả thời gian</SelectItem>
                    <SelectItem value="today">Hôm nay</SelectItem>
                    <SelectItem value="week">Tuần này</SelectItem>
                    <SelectItem value="month">Tháng này</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center">
                  <Filter className="h-4 w-4 text-slate-500 mr-2" />
                  <span className="text-sm text-slate-600">
                    {filteredInvoices.length} kết quả
                  </span>
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
                    Quản lý tất cả các hóa đơn đặt sân và dịch vụ
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-200">
                      <TableHead className="w-16">STT</TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort('id')}>
                          Mã HĐ
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">Khách hàng</TableHead>
                      <TableHead className="font-semibold text-slate-700">Loại</TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort('invoiceDate')}>
                          Ngày tạo
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort('originalAmount')}>
                          Tổng tiền
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">Giảm giá</TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort('finalAmount')}>
                          Thành tiền
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
                        <TableCell colSpan={10} className="text-center py-12">
                          <div className="flex items-center justify-center">
                            <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                            <span className="text-slate-600">Đang tải dữ liệu...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-12">
                          <p className="text-red-600 mb-4">{error}</p>
                          <Button onClick={loadInvoices} variant="outline">
                            Thử lại
                          </Button>
                        </TableCell>
                      </TableRow>
                    ) : filteredInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-12">
                          <div className="text-slate-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
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
                          <TableCell className="font-medium text-slate-600">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium text-blue-600">
                            HD{invoice.id.toString().padStart(6, '0')}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-slate-900">{invoice.customerName}</p>
                              <p className="text-xs text-slate-500">{invoice.customerEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge className={`inline-flex items-center text-xs font-medium ${getInvoiceTypeColor(invoice.invoiceType || 'ONLINE')}`}>
                                {getInvoiceTypeIcon(invoice.invoiceType || 'ONLINE')} 
                                <span className="ml-1">
                                  {invoice.invoiceType === 'ONLINE' ? 'Online' : 
                                   invoice.invoiceType === 'COUNTER' ? 'Tại quầy' :
                                   invoice.invoiceType === 'PHONE' ? 'Điện thoại' :
                                   invoice.invoiceType === 'MOBILE_APP' ? 'App' : 'Online'}
                                </span>
                              </Badge>
                              {invoice.bookingType && (
                                <Badge variant="secondary" className={`text-xs ${getBookingTypeColor(invoice.bookingType)}`}>
                                  {invoice.bookingType === 'ADVANCE' ? 'Đặt trước' :
                                   invoice.bookingType === 'URGENT' ? 'Đặt gấp' :
                                   invoice.bookingType === 'RECURRING' ? 'Định kỳ' :
                                   invoice.bookingType === 'WALK_IN' ? 'Vãng lai' : 'Đặt trước'}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-700">
                            {format(new Date(invoice.invoiceDate), "dd/MM/yyyy", { locale: vi })}
                          </TableCell>
                          <TableCell className="font-medium">
                            {invoice.originalAmount.toLocaleString('vi-VN')} VNĐ
                          </TableCell>
                          <TableCell className="text-red-600">
                            -{invoice.discountAmount.toLocaleString('vi-VN')} VNĐ
                          </TableCell>
                          <TableCell className="font-bold text-green-600">
                            {invoice.finalAmount.toLocaleString('vi-VN')} VNĐ
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(invoice.status)}>
                              {getStatusText(invoice.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleView(invoice)}
                                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(invoice)}
                                className="hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrintInvoice(invoice)}
                                className="hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                              >
                                <Printer className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExportInvoice(invoice)}
                                className="hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                              >
                                <Download className="h-3 w-3" />
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

      {/* Add/Edit Invoice Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentInvoice ? 'Chỉnh Sửa Hóa Đơn' : 'Tạo Hóa Đơn Mới'}</DialogTitle>
            <DialogDescription>
              {currentInvoice ? 'Cập nhật thông tin hóa đơn' : 'Tạo hóa đơn mới cho đặt sân'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bookingId">ID Đặt sân *</Label>
              <Input
                id="bookingId"
                type="number"
                value={formData.bookingId}
                onChange={(e) => setFormData({...formData, bookingId: Number(e.target.value)})}
                placeholder="Nhập ID đặt sân"
                disabled={!!currentInvoice}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountAmount">Giảm giá (VNĐ)</Label>
                <Input
                  id="discountAmount"
                  type="number"
                  value={formData.discountAmount}
                  onChange={(e) => setFormData({...formData, discountAmount: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Chờ thanh toán</SelectItem>
                    <SelectItem value="Paid">Đã thanh toán</SelectItem>
                    <SelectItem value="Cancelled">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Ghi chú thêm cho hóa đơn"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveInvoice} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              {currentInvoice ? 'Cập Nhật' : 'Tạo Mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi Tiết Hóa Đơn HD{currentInvoice?.id.toString().padStart(6, '0')}</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết và các mục trong hóa đơn
            </DialogDescription>
          </DialogHeader>
          {currentInvoice && (
            <div className="space-y-6 py-4">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Thông tin khách hàng
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Tên:</span> {currentInvoice.customerName}</p>
                    <p><span className="font-medium">Email:</span> {currentInvoice.customerEmail}</p>
                    <p><span className="font-medium">Điện thoại:</span> {currentInvoice.customerPhone}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Thông tin hóa đơn
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Ngày tạo:</span> {format(new Date(currentInvoice.invoiceDate), "dd/MM/yyyy", { locale: vi })}</p>
                    <p><span className="font-medium">Booking ID:</span> {currentInvoice.bookingId}</p>
                    <p><span className="font-medium">Trạng thái:</span> 
                      <Badge className={`ml-2 ${getStatusColor(currentInvoice.status)}`}>
                        {getStatusText(currentInvoice.status)}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              {/* Invoice Details Table */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Chi tiết hóa đơn</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mục</TableHead>
                        <TableHead>Ngày</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>SL</TableHead>
                        <TableHead>Đơn giá</TableHead>
                        <TableHead>Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentInvoice.details?.map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{detail.itemName}</p>
                              {detail.courtName && (
                                <p className="text-xs text-slate-500">{detail.courtName}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {detail.bookingDate && format(new Date(detail.bookingDate), "dd/MM", { locale: vi })}
                          </TableCell>
                          <TableCell>
                            {detail.startTime && detail.endTime && 
                              `${detail.startTime} - ${detail.endTime}`
                            }
                          </TableCell>
                          <TableCell>{detail.quantity}</TableCell>
                          <TableCell>{detail.unitPrice.toLocaleString('vi-VN')} VNĐ</TableCell>
                          <TableCell className="font-medium">{detail.amount.toLocaleString('vi-VN')} VNĐ</TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-slate-500">
                            Không có chi tiết
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tổng tiền gốc:</span>
                  <span className="font-medium">{currentInvoice.originalAmount.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="flex justify-between text-sm text-red-600">
                  <span>Giảm giá:</span>
                  <span className="font-medium">-{currentInvoice.discountAmount.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <hr className="border-slate-300" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Thành tiền:</span>
                  <span className="text-green-600">{currentInvoice.finalAmount.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>

              {/* Notes */}
              {currentInvoice.notes && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900">Ghi chú</h4>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                    {currentInvoice.notes}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
            {currentInvoice && currentInvoice.status === "Pending" && (
              <>
                <Button
                  onClick={() => handlePaymentCash(currentInvoice)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Thanh toán tiền mặt
                </Button>
                <Button
                  onClick={() => handlePaymentMomo(currentInvoice)}
                  className="bg-[#AF1681] hover:bg-[#8F1168] text-white"
                >
                  <Image
                    src="/momo-icon.svg"
                    alt="MoMo"
                    width={16}
                    height={16}
                    className="mr-2"
                  />
                  Thanh toán MoMo
                </Button>
              </>
            )}
            {currentInvoice && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handlePrintInvoice(currentInvoice)}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  In
                </Button>
                <Button
                  onClick={() => handleExportInvoice(currentInvoice)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Xuất PDF
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
