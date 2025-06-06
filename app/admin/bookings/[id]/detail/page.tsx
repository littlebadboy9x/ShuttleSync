"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  CalendarDays,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Plus,
  Save,
  Loader2,
  Trash2,
  Receipt,
  Edit,
  CreditCard,
  FileText,
  ArrowRight,
  CheckCircle,
  XCircle,
  Tag,
  Percent,
  Search,
  RefreshCw,
  Printer,
  Download,
  DollarSign
} from "lucide-react"
import axios from "axios"
import { toast } from "@/components/ui/use-toast"

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

interface BookingService {
  id: number
  bookingId: number
  serviceName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
}

interface Service {
  id: number
  serviceName: string
  serviceTypeName: string
  description: string
  unitPrice: number
  isActive: boolean
}

interface InvoiceDetail {
  id: number;
  itemName: string;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
  courtName?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  notes?: string;
}

interface Invoice {
  id: number
  bookingId: number
  invoiceDate: string
  originalAmount: number
  discountAmount: number
  finalAmount: number
  status: string
  customerName: string
  customerEmail: string
  customerPhone: string
  notes?: string
  details?: InvoiceDetail[]
}

interface InvoiceResponse {
  success: boolean;
  invoiceId: number;
  status: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  invoiceDate?: string;
  createdAt?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

interface Voucher {
  id: number
  code: string
  name: string
  type: string
  value: number
  minOrderAmount: number
  maxDiscountAmount: number
  validFrom: string
  validTo: string
  status: string
}

// Định nghĩa kiểu dữ liệu cho response
interface BookingDetailsResponse {
  success: boolean;
  booking: Booking;
  invoiceId: number;
  invoiceStatus: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  invoiceDate?: string;
  invoiceCreatedAt?: string;
  services: BookingService[];
}

// Thêm interface cho response của API áp dụng voucher
interface ApplyVoucherResponse {
  success: boolean;
  discountAmount: number;
  finalAmount: number;
  message?: string;
}

// Thêm interface cho response của API tìm kiếm voucher
interface SearchVoucherResponse {
  id: number;
  code: string;
  name: string;
  type: string;
  value: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  validFrom: string;
  validTo: string;
  status: string;
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

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = parseInt(params.id as string);
  
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [bookingServices, setBookingServices] = useState<BookingService[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  
  // Dialog states
  const [addServiceDialogOpen, setAddServiceDialogOpen] = useState(false);
  const [createInvoiceDialogOpen, setCreateInvoiceDialogOpen] = useState(false);
  const [applyVoucherDialogOpen, setApplyVoucherDialogOpen] = useState(false);
  const [invoiceDetailDialogOpen, setInvoiceDetailDialogOpen] = useState(false);
  
  // Form states
  const [selectedService, setSelectedService] = useState<number>(0);
  const [serviceQuantity, setServiceQuantity] = useState<number>(1);
  const [serviceNotes, setServiceNotes] = useState<string>("");
  const [addingService, setAddingService] = useState(false);
  const [invoiceNotes, setInvoiceNotes] = useState<string>("");
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<string>("");
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [searchingVoucher, setSearchingVoucher] = useState(false);
  const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
  const [applyingVoucher, setApplyingVoucher] = useState(false);

  // Thêm state và các hàm xử lý cho voucher
  const [searchVoucherDialogOpen, setSearchVoucherDialogOpen] = useState(false);
  const [searchVoucherTerm, setSearchVoucherTerm] = useState('');
  const [searchingVouchers, setSearchingVouchers] = useState(false);
  const [searchedVouchers, setSearchedVouchers] = useState<SearchVoucherResponse[]>([]);
  const [activeVouchers, setActiveVouchers] = useState<SearchVoucherResponse[]>([]);
  const [loadingActiveVouchers, setLoadingActiveVouchers] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    // Kiểm tra xác thực và quyền admin
    const checkAuth = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          router.push('/login');
          return;
        }

        const user = JSON.parse(userStr);
        if (!user.token || user.role !== 'admin') {
          toast({
            title: "Không có quyền truy cập",
            description: "Bạn không có quyền truy cập trang này",
            variant: "destructive"
          });
          router.push('/login');
          return;
        }

        // Load data if auth successful
        loadBookingData();
      } catch (error) {
        console.error('Lỗi khi kiểm tra xác thực:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, bookingId]);

  const loadBookingData = async () => {
    setLoading(true);
    
    try {
      // Lấy thông tin chi tiết đặt sân
      const response = await axios.get<BookingDetailsResponse>(
        `${API_URL}/admin/bookings/${bookingId}/details`,
        getAuthHeader()
      );
      
      if (response.data && response.data.success) {
        const bookingData = response.data.booking;
        
        // Cập nhật paymentStatus dựa trên trạng thái hóa đơn nếu có
        if (response.data.invoiceStatus === "Paid" || response.data.invoiceStatus === "paid") {
          bookingData.paymentStatus = "paid";
        }
        
        setBooking(bookingData);
        
        // Lưu thông tin hóa đơn
        if (response.data.invoiceId) {
          setInvoice({
            id: response.data.invoiceId,
            bookingId: bookingId,
            invoiceDate: response.data.invoiceDate || new Date().toISOString(),
            originalAmount: response.data.originalAmount,
            discountAmount: response.data.discountAmount,
            finalAmount: response.data.finalAmount,
            status: response.data.invoiceStatus,
            customerName: response.data.booking?.userName || "N/A",
            customerEmail: response.data.booking?.userEmail || "N/A",
            customerPhone: response.data.booking?.userPhone || "N/A"
          });
        }
        
        // Lấy thông tin dịch vụ của đặt sân (nếu có)
        try {
          const servicesResponse = await axios.get(
            `${API_URL}/admin/bookings/${bookingId}/services`,
            getAuthHeader()
          );
          
          if (servicesResponse.data && Array.isArray(servicesResponse.data)) {
            setBookingServices(servicesResponse.data);
          }
        } catch (servicesError) {
          console.error('Lỗi khi tải thông tin dịch vụ:', servicesError);
          setBookingServices([]);
        }
      } else {
        toast({
          title: "Không tìm thấy",
          description: `Không tìm thấy đặt sân với ID ${bookingId}`,
          variant: "destructive"
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin đặt sân. Vui lòng thử lại sau.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "1": return "Đang chờ";
      case "2": return "Đã xác nhận";
      case "3": return "Đã hủy";
      case "4": return "Hoàn thành";
      default: return "Không xác định";
    }
  };

  const getPaymentStatusText = (status: string) => {
    if (!status) return "Không xác định";
    
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "paid": return "Đã thanh toán";
      case "pending": return "Chưa thanh toán";
      case "partial": return "Thanh toán một phần";
      default: return "Không xác định";
    }
  };

  const getInvoiceStatusText = (status: string) => {
    if (!status) return "Không xác định";
    
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "draft": return "Bản nháp";
      case "pending": return "Chờ thanh toán";
      case "paid": return "Đã thanh toán";
      case "cancelled": return "Đã hủy";
      default: return "Không xác định";
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Hàm kiểm tra và định dạng ngày an toàn
  const safeFormatDate = (dateString: string | null | undefined, formatStr: string) => {
    if (!dateString) return 'Không có thông tin';
    
    try {
      // Kiểm tra xem chuỗi có phải là ISO date string không
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateString)) {
        return format(new Date(dateString), formatStr, { locale: vi });
      }
      
      // Thử chuyển đổi string sang date
      const parsedDate = new Date(dateString);
      if (isNaN(parsedDate.getTime())) {
        return 'Định dạng không hợp lệ';
      }
      
      return format(parsedDate, formatStr, { locale: vi });
    } catch (error) {
      console.error('Lỗi định dạng ngày:', error);
      return 'Lỗi định dạng';
    }
  };

  // Khi hiển thị chi tiết hóa đơn, sử dụng dữ liệu đã có
  const renderInvoiceDetails = () => {
    if (!invoice || !booking) return [];
    
    const courtDetail = {
      id: 1,
      itemName: `Thuê sân ${booking.courtName}`,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      courtName: booking.courtName,
      quantity: 1,
      unitPrice: booking.totalAmount,
      amount: booking.totalAmount,
      notes: ""
    };
    
    const serviceDetails = bookingServices.map(service => ({
      id: service.id + 100, // Để tránh trùng ID
      itemName: service.serviceName,
      bookingDate: booking.bookingDate,
      startTime: "",
      endTime: "",
      courtName: "",
      quantity: service.quantity,
      unitPrice: service.unitPrice,
      amount: service.totalPrice,
      notes: service.notes
    }));
    
    return [courtDetail, ...serviceDetails];
  };

  // Add new handler functions
  const handleAddService = () => {
    setAddServiceDialogOpen(true);
    loadAvailableServices();
  };
  
  // Thêm hàm để tải danh sách dịch vụ
  const loadAvailableServices = async () => {
    try {
      setLoadingServices(true);
      console.log("Đang tải danh sách dịch vụ từ API...");
      
      const response = await axios.get<Service[]>(
        `${API_URL}/admin/services/active`,
        getAuthHeader()
      );
      
      console.log("Kết quả API:", response);
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`Đã tải ${response.data.length} dịch vụ`);
        setAvailableServices(response.data);
      } else {
        console.warn("Dữ liệu không phải là mảng hoặc rỗng:", response.data);
        setAvailableServices([]);
      }
    } catch (error: any) {
      console.error('Lỗi khi tải danh sách dịch vụ:', error);
      if (error.response) {
        // Lỗi từ server
        console.error('Dữ liệu lỗi:', error.response.data);
        console.error('Mã trạng thái:', error.response.status);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        // Không nhận được phản hồi
        console.error('Không nhận được phản hồi:', error.request);
      } else {
        // Lỗi khi thiết lập request
        console.error('Lỗi:', error.message);
      }
      
      toast({
        title: "Lỗi",
        description: `Không thể tải danh sách dịch vụ: ${error.response?.status || error.message}`,
        variant: "destructive"
      });
      setAvailableServices([]);
    } finally {
      setLoadingServices(false);
    }
  };
  
  // Thêm hàm xử lý thêm dịch vụ
  const handleSubmitAddService = async () => {
    if (!selectedService || selectedService === 0) {
      toast({
        title: "Thông báo",
        description: "Vui lòng chọn dịch vụ",
        variant: "destructive"
      });
      return;
    }
    
    if (serviceQuantity < 1) {
      toast({
        title: "Thông báo",
        description: "Số lượng phải lớn hơn 0",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setAddingService(true);
      
      const response = await axios.post<{success: boolean; service: BookingService; invoiceId: number}>(
        `${API_URL}/admin/bookings/${bookingId}/services`,
        {
          serviceId: selectedService,
          quantity: serviceQuantity,
          notes: serviceNotes
        },
        getAuthHeader()
      );
      
      if (response.data && response.data.success) {
        toast({
          title: "Thành công",
          description: "Đã thêm dịch vụ vào đặt sân",
        });
        
        // Đóng dialog và làm mới dữ liệu
        setAddServiceDialogOpen(false);
        setSelectedService(0);
        setServiceQuantity(1);
        setServiceNotes("");
        
        // Tải lại dữ liệu đặt sân và dịch vụ
        loadBookingData();
      }
    } catch (error) {
      console.error('Lỗi khi thêm dịch vụ:', error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm dịch vụ. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setAddingService(false);
    }
  };

  // Thêm hàm xử lý xóa dịch vụ
  const handleRemoveService = async (bookingServiceId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
      return;
    }
    
    try {
      const response = await axios.delete<{success: boolean}>(
        `${API_URL}/admin/bookings/${bookingId}/services/${bookingServiceId}`,
        getAuthHeader()
      );
      
      if (response.data && response.data.success) {
        toast({
          title: "Thành công",
          description: "Đã xóa dịch vụ khỏi đặt sân",
        });
        
        // Tải lại dữ liệu đặt sân và dịch vụ
        loadBookingData();
      }
    } catch (error) {
      console.error('Lỗi khi xóa dịch vụ:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa dịch vụ. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    }
  };

  const handleCreateInvoice = async () => {
    try {
      setCreatingInvoice(true);
      
      const response = await axios.get<InvoiceResponse>(
        `${API_URL}/admin/bookings/${bookingId}/invoice`,
        getAuthHeader()
      );
      
      if (response.data && response.data.success) {
        // Tạo đối tượng Invoice từ dữ liệu trả về
        const invoiceData: Invoice = {
          id: response.data.invoiceId,
          bookingId: bookingId,
          invoiceDate: response.data.invoiceDate || new Date().toISOString(),
          originalAmount: response.data.originalAmount || 0,
          discountAmount: response.data.discountAmount || 0,
          finalAmount: response.data.finalAmount || 0,
          status: response.data.status || "pending",
          customerName: response.data.customerName || "",
          customerEmail: response.data.customerEmail || "",
          customerPhone: response.data.customerPhone || "",
          details: []
        };
        
        setInvoice(invoiceData);
        
        toast({
          title: "Thành công",
          description: "Đã tạo hóa đơn thành công.",
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể tạo hóa đơn. Vui lòng thử lại sau.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Lỗi khi tạo hóa đơn:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo hóa đơn. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setCreatingInvoice(false);
    }
  };

  // Thêm hàm làm mới trang
  const refreshPage = () => {
    window.location.reload();
  };

  // Thêm hàm mở dialog chi tiết hóa đơn
  const handleViewInvoiceDetail = () => {
    setInvoiceDetailDialogOpen(true);
  };

  // Thêm hàm xuất hóa đơn PDF
  const handleExportInvoice = async () => {
    if (!invoice) return;
    
    try {
      const response = await axios.get(
        `${API_URL}/admin/invoices/${invoice.id}/export`,
        {
          ...getAuthHeader(),
          responseType: 'blob'
        }
      );
      
      // Tạo URL từ blob response
      const blob = new Blob([response.data as any]);
      const url = window.URL.createObjectURL(blob);
      
      // Tạo link tải xuống
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: "Thành công",
        description: "Đã xuất hóa đơn PDF",
      });
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xuất hóa đơn PDF. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    }
  };

  // Thêm hàm để lấy danh sách voucher đang hoạt động
  const loadActiveVouchers = async () => {
    try {
      setLoadingActiveVouchers(true);
      
      const response = await axios.get<SearchVoucherResponse[]>(
        `${API_URL}/admin/vouchers/active`,
        getAuthHeader()
      );
      
      if (response.data && Array.isArray(response.data)) {
        setActiveVouchers(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách voucher đang hoạt động:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách voucher. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setLoadingActiveVouchers(false);
    }
  };

  // Thêm hàm tìm kiếm voucher
  const handleSearchVoucher = async () => {
    if (!searchVoucherTerm || searchVoucherTerm.length < 2) {
      toast({
        title: "Thông báo",
        description: "Vui lòng nhập ít nhất 2 ký tự để tìm kiếm",
        variant: "destructive"
      });
      return;
    }

    try {
      setSearchingVouchers(true);
      
      const response = await axios.get<SearchVoucherResponse[]>(
        `${API_URL}/admin/vouchers/search?query=${encodeURIComponent(searchVoucherTerm)}`,
        getAuthHeader()
      );
      
      if (response.data && Array.isArray(response.data)) {
        setSearchedVouchers(response.data);
        
        if (response.data.length === 0) {
          toast({
            title: "Thông báo",
            description: "Không tìm thấy voucher phù hợp",
          });
        }
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm voucher:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tìm kiếm voucher. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setSearchingVouchers(false);
    }
  };

  // Thêm hàm mở dialog tìm kiếm voucher
  const handleOpenSearchVoucherDialog = () => {
    setSearchVoucherDialogOpen(true);
    setSearchVoucherTerm('');
    setSearchedVouchers([]);
    setSelectedVoucherId(null);
    loadActiveVouchers(); // Tải danh sách voucher đang hoạt động khi mở dialog
  };

  // Thêm hàm áp dụng voucher
  const handleApplyVoucher = async () => {
    if (!selectedVoucherId || !invoice) {
      toast({
        title: "Thông báo",
        description: "Vui lòng chọn voucher để áp dụng",
        variant: "destructive"
      });
      return;
    }

    try {
      setApplyingVoucher(true);
      
      const response = await axios.post<ApplyVoucherResponse>(
        `${API_URL}/admin/invoices/${invoice.id}/apply-voucher`,
        { voucherId: selectedVoucherId },
        getAuthHeader()
      );
      
      if (response.data && response.data.success) {
        // Cập nhật thông tin hóa đơn
        setInvoice({
          ...invoice,
          discountAmount: response.data.discountAmount || 0,
          finalAmount: response.data.finalAmount || 0
        });
        
        toast({
          title: "Thành công",
          description: "Đã áp dụng voucher thành công",
        });
        
        // Đóng dialog
        setSearchVoucherDialogOpen(false);
        
        // Reset các state
        setSearchVoucherTerm('');
        setSearchedVouchers([]);
        setSelectedVoucherId(null);
        
        // Làm mới dữ liệu
        loadBookingData();
      } else {
        toast({
          title: "Lỗi",
          description: response.data.message || "Không thể áp dụng voucher",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Lỗi khi áp dụng voucher:', error);
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể áp dụng voucher. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setApplyingVoucher(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Chi tiết đặt sân #{bookingId}</h1>
            <p className="text-slate-600">Xem và quản lý thông tin chi tiết đặt sân</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/admin/bookings')}
              className="border-slate-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <Button 
              variant="outline" 
              onClick={refreshPage}
              className="border-slate-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Đang tải...</span>
            </div>
          ) : (
            <div className="grid gap-6">
              {/* Booking Details */}
              {booking && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>Thông tin đặt sân</CardTitle>
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
                    </div>
                    <CardDescription>
                      {booking.createdAt ? (
                        <>Đặt vào {safeFormatDate(booking.createdAt, 'HH:mm - dd/MM/yyyy')}</>
                      ) : (
                        <>Không có thông tin thời gian tạo</>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-medium text-sm text-slate-500">Thông tin khách hàng</h3>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-400" />
                              <span>{booking.userName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-slate-400" />
                              <span>{booking.userPhone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-slate-400" />
                              <span>{booking.userEmail}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-medium text-sm text-slate-500">Ghi chú</h3>
                          <p className="text-sm p-2 bg-slate-50 rounded-md min-h-[60px]">
                            {booking.notes || "Không có ghi chú"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-medium text-sm text-slate-500">Thông tin sân</h3>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              <span>{booking.courtName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              <span>{booking.courtLocation || "Không có địa chỉ"}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-medium text-sm text-slate-500">Thời gian đặt sân</h3>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-slate-400" />
                              <span>{safeFormatDate(booking.bookingDate, 'eeee, dd/MM/yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-slate-400" />
                              <span>{booking.startTime} - {booking.endTime}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-medium text-sm text-slate-500">Thanh toán</h3>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Badge 
                                className={`${
                                  (invoice && (invoice.status?.toLowerCase() === "paid")) || booking.paymentStatus?.toLowerCase() === "paid"
                                    ? "bg-green-100 text-green-800 border-green-200" 
                                    : booking.paymentStatus?.toLowerCase() === "pending" 
                                      ? "bg-yellow-100 text-yellow-800 border-yellow-200" 
                                      : "bg-blue-100 text-blue-800 border-blue-200"
                                }`}
                              >
                                {invoice && invoice.status?.toLowerCase() === "paid" 
                                  ? "Đã thanh toán" 
                                  : getPaymentStatusText(booking.paymentStatus)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Tổng tiền sân:</span>
                              <span>{formatCurrency(booking.totalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Danh sách dịch vụ */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Dịch vụ đã chọn</CardTitle>
                    <Button 
                      onClick={handleAddService}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm dịch vụ
                    </Button>
                  </div>
                  <CardDescription>
                    Danh sách dịch vụ đi kèm với đặt sân
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bookingServices.length === 0 ? (
                    <div className="text-center py-6 text-slate-500">
                      <p>Chưa có dịch vụ nào được thêm</p>
                      <Button 
                        variant="link" 
                        onClick={handleAddService}
                        className="mt-2"
                      >
                        Thêm dịch vụ ngay
                      </Button>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tên dịch vụ</TableHead>
                            <TableHead className="w-[100px] text-right">Số lượng</TableHead>
                            <TableHead className="w-[150px] text-right">Đơn giá</TableHead>
                            <TableHead className="w-[150px] text-right">Thành tiền</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bookingServices.map((service) => (
                            <TableRow key={service.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{service.serviceName}</p>
                                  {service.notes && (
                                    <p className="text-xs text-slate-500 mt-1">
                                      Ghi chú: {service.notes}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">{service.quantity}</TableCell>
                              <TableCell className="text-right">{formatCurrency(service.unitPrice)}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(service.totalPrice)}</TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => handleRemoveService(service.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={2}></TableCell>
                            <TableCell className="text-right font-medium">Tổng cộng</TableCell>
                            <TableCell className="text-right font-medium text-primary">
                              {formatCurrency(bookingServices.reduce((sum, service) => sum + service.totalPrice, 0))}
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Thông tin hóa đơn */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Hóa đơn</CardTitle>
                    {!invoice ? (
                      <Button 
                        onClick={handleCreateInvoice}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        disabled={creatingInvoice}
                      >
                        {creatingInvoice ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Đang tạo...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Tạo hóa đơn
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        variant="outline"
                        onClick={handleViewInvoiceDetail}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Chi tiết hóa đơn
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    Thông tin hóa đơn cho đặt sân
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {invoice ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 rounded-md">
                          <h3 className="font-medium mb-2">Thông tin hóa đơn</h3>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Mã hóa đơn:</span>
                              <span className="font-medium">#{invoice.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Ngày tạo:</span>
                              <span>{safeFormatDate(invoice.invoiceDate, 'dd/MM/yyyy')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Trạng thái:</span>
                              <Badge 
                                className={`${
                                  invoice.status?.toLowerCase() === "paid" 
                                    ? "bg-green-100 text-green-800 border-green-200" 
                                    : invoice.status?.toLowerCase() === "pending" 
                                      ? "bg-yellow-100 text-yellow-800 border-yellow-200" 
                                      : "bg-blue-100 text-blue-800 border-blue-200"
                                }`}
                              >
                                {getInvoiceStatusText(invoice.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-slate-50 rounded-md">
                          <h3 className="font-medium mb-2">Khách hàng</h3>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-slate-400" />
                              <span>{invoice.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{invoice.customerPhone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-slate-400" />
                              <span>{invoice.customerEmail}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-slate-50 rounded-md">
                          <h3 className="font-medium mb-2">Tổng cộng</h3>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Tổng tiền gốc:</span>
                              <span>{formatCurrency(invoice.originalAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Giảm giá:</span>
                              <span>{formatCurrency(invoice.discountAmount)}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Thành tiền:</span>
                              <span className="text-primary">{formatCurrency(invoice.finalAmount)}</span>
                            </div>
                            <div className="pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full flex items-center justify-center"
                                onClick={handleOpenSearchVoucherDialog}
                              >
                                <Percent className="h-4 w-4 mr-2" />
                                Thêm voucher
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="font-medium mb-3">Chi tiết hóa đơn</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Mô tả</TableHead>
                              <TableHead className="w-[100px] text-right">SL</TableHead>
                              <TableHead className="w-[150px] text-right">Đơn giá</TableHead>
                              <TableHead className="w-[150px] text-right">Thành tiền</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {renderInvoiceDetails().map((detail, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {detail.itemName}
                                  {detail.bookingDate && (
                                    <div className="text-xs text-slate-500 mt-1">
                                      Ngày: {safeFormatDate(detail.bookingDate, 'dd/MM/yyyy')} | 
                                      Giờ: {detail.startTime} - {detail.endTime}
                                    </div>
                                  )}
                                  {detail.notes && (
                                    <div className="text-xs text-slate-500 mt-1">
                                      Ghi chú: {detail.notes}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">{detail.quantity}</TableCell>
                                <TableCell className="text-right">{formatCurrency(detail.unitPrice)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(detail.amount)}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={2}></TableCell>
                              <TableCell className="text-right font-medium">Tổng cộng</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(invoice.originalAmount)}</TableCell>
                            </TableRow>
                            {invoice.discountAmount > 0 && (
                              <TableRow>
                                <TableCell colSpan={2}></TableCell>
                                <TableCell className="text-right font-medium">Giảm giá</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(invoice.discountAmount)}</TableCell>
                              </TableRow>
                            )}
                            <TableRow>
                              <TableCell colSpan={2}></TableCell>
                              <TableCell className="text-right font-medium">Thành tiền</TableCell>
                              <TableCell className="text-right font-medium text-primary">{formatCurrency(invoice.finalAmount)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500">
                      <p>Chưa có hóa đơn nào được tạo</p>
                      <Button 
                        variant="link" 
                        onClick={handleCreateInvoice}
                        disabled={creatingInvoice}
                        className="mt-2"
                      >
                        {creatingInvoice ? 'Đang tạo...' : 'Tạo hóa đơn ngay'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* Dialog thêm dịch vụ */}
      <Dialog open={addServiceDialogOpen} onOpenChange={setAddServiceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm dịch vụ</DialogTitle>
            <DialogDescription>
              Chọn dịch vụ bạn muốn thêm vào đặt sân
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="service" className="text-right">
                Dịch vụ
              </Label>
              <div className="col-span-3">
                {loadingServices ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang tải...</span>
                  </div>
                ) : (
                  <Select value={selectedService.toString()} onValueChange={(value) => setSelectedService(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn dịch vụ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Chọn dịch vụ</SelectItem>
                      {availableServices.map((service) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          {service.serviceName} - {formatCurrency(service.unitPrice)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Số lượng
              </Label>
              <div className="col-span-3">
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={serviceQuantity}
                  onChange={(e) => setServiceQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Ghi chú
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="notes"
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  placeholder="Nhập ghi chú nếu có"
                />
              </div>
            </div>
            
            {selectedService > 0 && (
              <div className="bg-slate-50 p-3 rounded-lg mt-2">
                <h4 className="font-medium mb-2">Thông tin dịch vụ đã chọn</h4>
                {(() => {
                  const selectedServiceDetails = availableServices.find(s => s.id === selectedService);
                  
                  if (!selectedServiceDetails) return null;
                  
                  return (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tên dịch vụ:</span>
                        <span className="font-medium">{selectedServiceDetails.serviceName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Loại dịch vụ:</span>
                        <span>{selectedServiceDetails.serviceTypeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Đơn giá:</span>
                        <span>{formatCurrency(selectedServiceDetails.unitPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Thành tiền:</span>
                        <span className="font-medium text-primary">
                          {formatCurrency(selectedServiceDetails.unitPrice * serviceQuantity)}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddServiceDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleSubmitAddService}
              disabled={!selectedService || selectedService === 0 || addingService}
              className="bg-primary hover:bg-primary/90"
            >
              {addingService ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm dịch vụ
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog tìm kiếm và áp dụng voucher */}
      <Dialog open={searchVoucherDialogOpen} onOpenChange={setSearchVoucherDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Thêm voucher</DialogTitle>
            <DialogDescription>
              Tìm kiếm và áp dụng voucher giảm giá cho hóa đơn
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Nhập mã voucher hoặc tên voucher"
                value={searchVoucherTerm}
                onChange={(e) => setSearchVoucherTerm(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleSearchVoucher}
                disabled={searchingVouchers}
                className="shrink-0"
              >
                {searchingVouchers ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Tìm kiếm
              </Button>
            </div>
            
            {/* Hiển thị danh sách voucher đang hoạt động */}
            {loadingActiveVouchers ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span>Đang tải voucher...</span>
              </div>
            ) : activeVouchers.length > 0 && searchedVouchers.length === 0 ? (
              <>
                <h3 className="font-medium text-sm text-slate-500">Voucher đang hoạt động</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Mã voucher</TableHead>
                        <TableHead>Tên</TableHead>
                        <TableHead>Giá trị</TableHead>
                        <TableHead>Hạn sử dụng</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeVouchers.map((voucher) => (
                        <TableRow key={voucher.id} className={selectedVoucherId === voucher.id ? "bg-slate-100" : ""}>
                          <TableCell>
                            <input
                              type="radio"
                              name="selectedVoucher"
                              checked={selectedVoucherId === voucher.id}
                              onChange={() => setSelectedVoucherId(voucher.id)}
                              className="rounded-full"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{voucher.code}</TableCell>
                          <TableCell>{voucher.name}</TableCell>
                          <TableCell>
                            {voucher.type === "PERCENTAGE" ? `${voucher.value}%` : formatCurrency(voucher.value)}
                          </TableCell>
                          <TableCell>{safeFormatDate(voucher.validTo, 'dd/MM/yyyy')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : null}
            
            {/* Hiển thị kết quả tìm kiếm voucher */}
            {searchedVouchers.length > 0 && (
              <>
                <h3 className="font-medium text-sm text-slate-500">Kết quả tìm kiếm</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Mã voucher</TableHead>
                        <TableHead>Tên</TableHead>
                        <TableHead>Giá trị</TableHead>
                        <TableHead>Hạn sử dụng</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchedVouchers.map((voucher) => (
                        <TableRow key={voucher.id} className={selectedVoucherId === voucher.id ? "bg-slate-100" : ""}>
                          <TableCell>
                            <input
                              type="radio"
                              name="selectedVoucher"
                              checked={selectedVoucherId === voucher.id}
                              onChange={() => setSelectedVoucherId(voucher.id)}
                              className="rounded-full"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{voucher.code}</TableCell>
                          <TableCell>{voucher.name}</TableCell>
                          <TableCell>
                            {voucher.type === "PERCENTAGE" ? `${voucher.value}%` : formatCurrency(voucher.value)}
                          </TableCell>
                          <TableCell>{safeFormatDate(voucher.validTo, 'dd/MM/yyyy')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
            
            {/* Hiển thị thông tin voucher đã chọn */}
            {(selectedVoucherId !== null) && (
              <div className="bg-slate-50 p-3 rounded-lg">
                <h4 className="font-medium mb-2">Thông tin voucher đã chọn</h4>
                {(() => {
                  const selectedVoucher = searchedVouchers.length > 0 
                    ? searchedVouchers.find(v => v.id === selectedVoucherId)
                    : activeVouchers.find(v => v.id === selectedVoucherId);
                    
                  if (!selectedVoucher) return null;
                  
                  return (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Mã voucher:</span>
                        <span className="font-medium">{selectedVoucher.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tên voucher:</span>
                        <span>{selectedVoucher.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Giá trị:</span>
                        <span>
                          {selectedVoucher.type === "PERCENTAGE" 
                            ? `${selectedVoucher.value}% (tối đa ${formatCurrency(selectedVoucher.maxDiscountAmount || 0)})` 
                            : formatCurrency(selectedVoucher.value)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Đơn tối thiểu:</span>
                        <span>{formatCurrency(selectedVoucher.minOrderAmount || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Hạn sử dụng:</span>
                        <span>{safeFormatDate(selectedVoucher.validTo, 'dd/MM/yyyy')}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSearchVoucherDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleApplyVoucher}
              disabled={!selectedVoucherId || applyingVoucher}
              className="bg-primary hover:bg-primary/90"
            >
              {applyingVoucher ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang áp dụng...
                </>
              ) : (
                <>
                  <Percent className="h-4 w-4 mr-2" />
                  Áp dụng voucher
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog chi tiết hóa đơn */}
      <Dialog open={invoiceDetailDialogOpen} onOpenChange={setInvoiceDetailDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi Tiết Hóa Đơn HD{invoice?.id.toString().padStart(6, '0')}</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết và các mục trong hóa đơn
            </DialogDescription>
          </DialogHeader>
          
          {invoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Thông tin khách hàng */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Thông tin khách hàng</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span>Tên: {invoice.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>Email: {invoice.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>Điện thoại: {invoice.customerPhone}</span>
                    </div>
                  </div>
                </div>
                
                {/* Thông tin hóa đơn */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Thông tin hóa đơn</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-slate-400" />
                      <span>Ngày tạo: {safeFormatDate(invoice.invoiceDate, 'dd/MM/yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span>Booking ID: {invoice.bookingId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-slate-400" />
                      <span>Trạng thái: 
                        <Badge 
                          className={`ml-2 ${
                            invoice.status?.toLowerCase() === "paid" 
                              ? "bg-green-100 text-green-800 border-green-200" 
                              : invoice.status?.toLowerCase() === "pending" 
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200" 
                                : "bg-blue-100 text-blue-800 border-blue-200"
                          }`}
                        >
                          {getInvoiceStatusText(invoice.status)}
                        </Badge>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chi tiết hóa đơn */}
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
                      {renderInvoiceDetails().map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {detail.itemName}
                            {detail.courtName && (
                              <p className="text-xs text-slate-500">{detail.courtName}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            {detail.bookingDate && safeFormatDate(detail.bookingDate, "dd/MM")}
                          </TableCell>
                          <TableCell>
                            {detail.startTime && detail.endTime && 
                              `${detail.startTime} - ${detail.endTime}`
                            }
                          </TableCell>
                          <TableCell>{detail.quantity}</TableCell>
                          <TableCell>{formatCurrency(detail.unitPrice)}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(detail.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {/* Tổng cộng */}
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tổng tiền gốc:</span>
                  <span className="font-medium">{formatCurrency(invoice.originalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-red-600">
                  <span>Giảm giá:</span>
                  <span className="font-medium">-{formatCurrency(invoice.discountAmount)}</span>
                </div>
                <hr className="border-slate-300" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Thành tiền:</span>
                  <span className="text-green-600">{formatCurrency(invoice.finalAmount)}</span>
                </div>
              </div>
              
              {/* Ghi chú */}
              {invoice.notes && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900">Ghi chú</h4>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setInvoiceDetailDialogOpen(false)}>
              Đóng
            </Button>
            <Button
              variant="outline"
              onClick={() => {}}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Printer className="h-4 w-4 mr-2" />
              In
            </Button>
            <Button
              onClick={handleExportInvoice}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Xuất PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
