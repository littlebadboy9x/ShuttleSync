"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  Building,
  Receipt,
  Printer,
  Download,
  Package
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

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

interface InvoiceData {
  id: number
  bookingId: number
  customerName: string
  customerEmail: string
  customerPhone: string
  invoiceDate: string
  
  // Thông tin loại hóa đơn và kênh đặt
  invoiceType?: string
  invoiceTypeDisplay?: string
  bookingChannel?: string
  bookingChannelDisplay?: string
  bookingType?: string
  bookingTypeDisplay?: string
  
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

// Grouped booking data cho chuỗi ngày
interface GroupedBookingData {
  courtName: string
  courtId: number
  bookings: {
    date: string
    timeSlot: string
    startTime: string
    endTime: string
    price: number
    status: string
  }[]
  totalAmount: number
}

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const { toast } = useToast()
  const router = useRouter()
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [groupedBookings, setGroupedBookings] = useState<GroupedBookingData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getAuthHeader = () => {
    const userStr = localStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null
    return user?.token ? `Bearer ${user.token}` : ''
  }

  // Helper function để kiểm tra và format Date an toàn
  const formatDateSafe = (dateStr: string | undefined, formatStr: string) => {
    if (!dateStr) return "N/A"
    
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) {
        return "Invalid Date"
      }
      return format(date, formatStr, { locale: vi })
    } catch (error) {
      console.error("Date format error:", error, "Date string:", dateStr)
      return "Invalid Date"
    }
  }

  useEffect(() => {
    if (id) {
      loadInvoiceDetail()
    }
  }, [id])

  // Xử lý MoMo return parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const error = urlParams.get('error')
    const message = urlParams.get('message')

    if (success === 'true') {
      toast({
        title: "Thanh toán thành công! 🎉",
        description: message || "Thanh toán MoMo đã được xử lý thành công",
        variant: "default",
      })
      // Reload invoice để cập nhật trạng thái
      if (id) {
        loadInvoiceDetail()
      }
    } else if (error === 'true') {
      toast({
        title: "Thanh toán thất bại",
        description: message || "Có lỗi xảy ra trong quá trình thanh toán MoMo",
        variant: "destructive",
      })
    }

    // Clear query parameters sau khi hiển thị thông báo
    if (success || error) {
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [id, toast])

  const loadInvoiceDetail = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/invoices/${id}`, {
        headers: {
          'Authorization': getAuthHeader(),
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load invoice detail')
      }

      const data = await response.json()
      console.log('Invoice detail API response:', data)
      console.log('Invoice details array:', data.details)
      
      // Debug từng detail item
      if (data.details) {
        data.details.forEach((detail: any, index: number) => {
          console.log(`Detail ${index}:`, {
            id: detail.id,
            itemName: detail.itemName,
            bookingDate: detail.bookingDate,
            startTime: detail.startTime,
            endTime: detail.endTime,
            courtName: detail.courtName,
            quantity: detail.quantity,
            unitPrice: detail.unitPrice,
            amount: detail.amount
          })
        })
      }
      
      setInvoice(data)
      
      // Nếu có nhiều court bookings (không tính services), group theo sân
      if (data.details) {
        const courtBookings = data.details.filter((detail: any) => 
          detail.bookingDate && detail.startTime && detail.endTime
        )
        
        if (courtBookings.length > 1) {
          const grouped = groupBookingsByDate(courtBookings)
          console.log('Grouped court bookings:', grouped)
          setGroupedBookings(grouped)
        }
      }
    } catch (err) {
      console.error('Error loading invoice detail:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const groupBookingsByDate = (details: InvoiceDetail[]): GroupedBookingData[] => {
    const grouped: { [courtName: string]: GroupedBookingData } = {}
    
    details.forEach(detail => {
      const courtName = detail.courtName || 'Unknown Court'
      
      if (!grouped[courtName]) {
        grouped[courtName] = {
          courtName,
          courtId: 0, // Cần lấy từ API
          bookings: [],
          totalAmount: 0
        }
      }

      grouped[courtName].bookings.push({
        date: detail.bookingDate || '',
        timeSlot: `${detail.startTime} - ${detail.endTime}`,
        startTime: detail.startTime || '',
        endTime: detail.endTime || '',
        price: detail.amount,
        status: 'confirmed'
      })
      
      grouped[courtName].totalAmount += detail.amount
    })

    return Object.values(grouped)
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
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

  const getBookingChannelIcon = (channel: string) => {
    switch (channel) {
      case "ONLINE": return "🌐"
      case "COUNTER": return "🏢"
      case "PHONE": return "📞"
      case "MOBILE_APP": return "📱"
      default: return "❓"
    }
  }

  const getBookingChannelColor = (channel: string) => {
    switch (channel) {
      case "ONLINE": return "bg-blue-100 text-blue-800 border-blue-200"
      case "COUNTER": return "bg-green-100 text-green-800 border-green-200"
      case "PHONE": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "MOBILE_APP": return "bg-purple-100 text-purple-800 border-purple-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getBookingTypeIcon = (type: string) => {
    switch (type) {
      case "RECURRING": return "🔄"
      case "ONLINE": return "🌐"
      case "COUNTER": return "🏢"
      case "PHONE": return "📞"
      case "MOBILE_APP": return "📱"
      default: return "❓"
    }
  }

  const getBookingTypeColor = (type: string) => {
    switch (type) {
      case "RECURRING": return "bg-blue-100 text-blue-800 border-blue-200"
      case "ONLINE": return "bg-blue-100 text-blue-800 border-blue-200"
      case "COUNTER": return "bg-green-100 text-green-800 border-green-200"
      case "PHONE": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "MOBILE_APP": return "bg-purple-100 text-purple-800 border-purple-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleUpdateStatus = async (invoiceId: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader(),
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error('Failed to update invoice status')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating invoice status:', error)
      throw error
    }
  }

  const handlePaymentCash = async () => {
    if (!invoice) return
    
    try {
      console.log('Processing cash payment for invoice:', invoice.id);
      
      // Cập nhật trạng thái hóa đơn thành "Paid" ngay lập tức cho thanh toán tiền mặt
      const result = await handleUpdateStatus(invoice.id, "Paid");
      console.log('Update status result:', result);
      
      toast({
        title: "Thanh toan thanh cong",
        description: "Da xu ly thanh toan tien mat thanh cong",
      });
      
      // Reload invoice data
      setTimeout(() => {
        loadInvoiceDetail();
      }, 500); // Small delay để đảm bảo backend đã xử lý xong
      
    } catch (error: any) {
      console.error("Error processing cash payment:", error);
      toast({
        title: "Loi", 
        description: "Co loi xay ra khi xu ly thanh toan",
        variant: "destructive",
      });
    }
  };

  const handlePaymentMomo = async () => {
    if (!invoice) return
    
    try {
      // Sử dụng endpoint admin MoMo payment
      const response = await fetch('/api/admin/payments/momo/create', {
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
        // Chuyển hướng trong cùng tab thay vì mở tab mới
        window.location.href = data.payUrl;
      } else {
        throw new Error(data.message || "Không thể tạo thanh toán MoMo");
      }
    } catch (error: any) {
      console.error("Error creating MoMo payment:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi tạo thanh toán MoMo",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-slate-600">Đang tải chi tiết hóa đơn...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !invoice) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-red-400 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy hóa đơn</h2>
              <p className="text-slate-600 mb-6">{error}</p>
              <Link href="/admin/invoices">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại danh sách
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/invoices">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Chi tiết hóa đơn HD{invoice.id.toString().padStart(6, '0')}
                </h1>
                <p className="text-slate-600">Thông tin chi tiết và lịch sử thanh toán</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                In hóa đơn
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Xuất PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Invoice Info */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Invoice Header */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl text-slate-900 flex items-center">
                      <Receipt className="h-6 w-6 mr-2 text-blue-600" />
                      Thông tin hóa đơn
                    </CardTitle>
                    <Badge className={getStatusColor(invoice.status)}>
                      {getStatusText(invoice.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Mã hóa đơn</p>
                      <p className="font-semibold text-lg">HD{invoice.id.toString().padStart(6, '0')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Ngày tạo</p>
                      <p className="font-medium">{formatDateSafe(invoice.invoiceDate, "dd/MM/yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Loại đặt</p>
                      <Badge className={`${getInvoiceTypeColor(invoice.invoiceType || 'ONLINE')}`}>
                        {getInvoiceTypeIcon(invoice.invoiceType || 'ONLINE')} 
                        <span className="ml-2">
                          {invoice.invoiceType === 'ONLINE' ? 'Đặt online' : 
                           invoice.invoiceType === 'COUNTER' ? 'Đặt tại quầy' :
                           invoice.invoiceType === 'PHONE' ? 'Đặt qua điện thoại' :
                           invoice.invoiceType === 'MOBILE_APP' ? 'Đặt qua app' : 'Đặt online'}
                        </span>
                      </Badge>
                    </div>
                    {invoice.counterStaffName && (
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Nhân viên tạo</p>
                        <p className="font-medium flex items-center">
                          <Building className="h-4 w-4 mr-1 text-slate-400" />
                          {invoice.counterStaffName}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Booking Details for Multiple Days */}
              {groupedBookings.length > 0 ? (
                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                    <CardTitle className="text-2xl text-slate-900 flex items-center">
                      <Calendar className="h-6 w-6 mr-2 text-green-600" />
                      Lịch đặt sân chuỗi ngày
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {groupedBookings.map((group, index) => (
                        <div key={index} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                              {group.courtName}
                            </h3>
                            <Badge variant="secondary">
                              {group.bookings.length} ngày
                            </Badge>
                          </div>
                          
                          <div className="grid gap-3">
                            {group.bookings.map((booking, bookingIndex) => (
                              <div key={bookingIndex} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center space-x-4">
                                  <div className="text-center">
                                    <p className="font-medium text-slate-900">
                                      {formatDateSafe(booking.date, "dd")}
                                    </p>
                                    <p className="text-xs text-slate-500 uppercase">
                                      {formatDateSafe(booking.date, "MMM")}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-900 flex items-center">
                                      <Clock className="h-4 w-4 mr-1 text-slate-400" />
                                      {booking.timeSlot}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                      {formatDateSafe(booking.date, "EEEE, dd/MM/yyyy")}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-green-600">
                                    {booking.price.toLocaleString('vi-VN')} VNĐ
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <Separator className="my-4" />
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-slate-900">Tổng tiền sân {group.courtName}:</span>
                            <span className="font-bold text-lg text-green-600">
                              {group.totalAmount.toLocaleString('vi-VN')} VNĐ
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* Single Day Booking */
                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                    <CardTitle className="text-2xl text-slate-900 flex items-center">
                      <Calendar className="h-6 w-6 mr-2 text-green-600" />
                      Chi tiết đặt sân
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {invoice.details.map((detail, index) => {
                        // Phân loại: Court booking vs Service
                        const isCourtBooking = detail.bookingDate && detail.startTime && detail.endTime
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                {isCourtBooking ? (
                                  <>
                                    <MapPin className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">Sân</p>
                                  </>
                                ) : (
                                  <>
                                    <Package className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                                    <p className="text-xs text-slate-500">Dịch vụ</p>
                                  </>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{detail.itemName}</p>
                                {isCourtBooking ? (
                                  <>
                                    <p className="text-sm text-slate-500 flex items-center">
                                      <Clock className="h-4 w-4 mr-1" />
                                      {detail.startTime} - {detail.endTime}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                      {formatDateSafe(detail.bookingDate, "EEEE, dd/MM/yyyy")}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-sm text-slate-500">
                                    Số lượng: {detail.quantity}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600 text-lg">
                                {detail.amount.toLocaleString('vi-VN')} VNĐ
                              </p>
                              <p className="text-sm text-slate-500">
                                {detail.quantity} x {detail.unitPrice.toLocaleString('vi-VN')}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Thông tin loại đặt sân */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 flex items-center">
                  <Building className="h-4 w-4 mr-2 text-slate-600" />
                  Thông tin đặt sân
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-500">Kênh đặt:</span>
                    <div className="mt-1">
                      {invoice.bookingChannel && (
                        <Badge className={getBookingChannelColor(invoice.bookingChannel)}>
                          {getBookingChannelIcon(invoice.bookingChannel)} {invoice.bookingChannelDisplay || invoice.bookingChannel}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Loại đặt:</span>
                    <div className="mt-1">
                      {invoice.bookingType && (
                        <Badge className={getBookingTypeColor(invoice.bookingType)}>
                          {getBookingTypeIcon(invoice.bookingType)} {invoice.bookingTypeDisplay || invoice.bookingType}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Hiển thị thông tin recurring booking */}
                {invoice.bookingType === 'RECURRING' && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Thông tin đặt sân theo chuỗi ngày
                    </h5>
                    <div className="text-sm text-blue-800">
                      <p className="mb-1">
                        <strong>Gói đặt sân:</strong> Đặt sân cố định theo lịch hàng tuần
                      </p>
                      <p className="mb-1">
                        <strong>Tần suất:</strong> Thường xuyên (3 lần/tuần)
                      </p>
                      <p className="mb-1">
                        <strong>Thời gian:</strong> Thứ 2, 4, 6 hàng tuần
                      </p>
                      <p className="text-xs text-blue-600 mt-2">
                        Hóa đơn này là một phần của gói đặt sân theo lịch cố định. 
                        Khách hàng có thể có nhiều hóa đơn khác cho các ngày trong cùng gói.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Thông tin nhân viên tạo booking (nếu có) */}
                {invoice.counterStaffId && (
                  <div className="mt-3">
                    <span className="text-sm text-slate-500">Nhân viên tạo booking:</span>
                    <div className="mt-1 flex items-center">
                      <User className="h-4 w-4 mr-2 text-slate-400" />
                      <span className="text-sm">Staff ID: {invoice.counterStaffId}</span>
                      {invoice.counterStaffName && (
                        <span className="text-sm ml-2">({invoice.counterStaffName})</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Customer & Payment */}
            <div className="space-y-6">
              
              {/* Customer Information */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                  <CardTitle className="text-xl text-slate-900 flex items-center">
                    <User className="h-5 w-5 mr-2 text-purple-600" />
                    Thông tin khách hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Họ tên</p>
                    <p className="font-semibold text-slate-900">{invoice.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Email</p>
                    <p className="font-medium text-slate-700 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-slate-400" />
                      {invoice.customerEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Số điện thoại</p>
                    <p className="font-medium text-slate-700 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-slate-400" />
                      {invoice.customerPhone}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
                  <CardTitle className="text-xl text-slate-900 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-orange-600" />
                    Tổng kết thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tổng tiền:</span>
                    <span className="font-medium">{invoice.originalAmount.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Giảm giá:</span>
                    <span className="font-medium text-red-600">-{invoice.discountAmount.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-slate-900">Thành tiền:</span>
                    <span className="text-xl font-bold text-green-600">{invoice.finalAmount.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  
                  {invoice.status === 'Pending' && (
                    <div className="pt-4 space-y-2">
                      <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handlePaymentCash}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Thanh toán tiền mặt
                      </Button>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handlePaymentMomo}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Thanh toán MoMo
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              {invoice.notes && (
                <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">Ghi chú</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700">{invoice.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
} 