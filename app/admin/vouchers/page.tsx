"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Filter, 
  ArrowUpDown,
  Gift,
  Copy,
  CalendarIcon,
  Percent,
  DollarSign,
  Users,
  TrendingUp,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface Voucher {
  id: string;
  code: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  validFrom: Date;
  validTo: Date;
  status: "active" | "inactive" | "expired";
  description: string;
  voucherType: "PUBLIC" | "PERSONAL";
  requiredBookingCount?: number;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState<Voucher | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [voucherTypeFilter, setVoucherTypeFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "code", direction: "asc" });

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "percentage" as "percentage" | "fixed",
    value: 0,
    minOrder: 0,
    maxDiscount: 0,
    usageLimit: 0,
    validFrom: undefined as Date | undefined,
    validTo: undefined as Date | undefined,
    description: "",
    voucherType: "PUBLIC" as "PUBLIC" | "PERSONAL",
    requiredBookingCount: 0,
  });

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      setIsLoading(true);
      
      // Lấy token từ localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const token = user?.token;
      
      const response = await fetch('/api/admin/vouchers', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVouchers(data);
      } else {
        console.error('Failed to fetch vouchers');
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu voucher",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading vouchers:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tải dữ liệu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadVouchers().finally(() => setIsRefreshing(false));
  };

  const handleSort = (key: keyof Voucher) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedVouchers = [...vouchers].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof Voucher];
    const bValue = b[sortConfig.key as keyof Voucher];
    
    if (aValue !== undefined && bValue !== undefined) {
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  const filteredVouchers = sortedVouchers.filter(voucher => {
    const matchesSearch = voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          voucher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          voucher.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || voucher.status === statusFilter;
    const matchesType = typeFilter === "all" || voucher.type === typeFilter;
    const matchesVoucherType = voucherTypeFilter === "all" || voucher.voucherType === voucherTypeFilter;
    return matchesSearch && matchesStatus && matchesType && matchesVoucherType;
  });

  const handleAdd = () => {
    setCurrentVoucher(null);
    setFormData({
      code: "",
      name: "",
      type: "percentage",
      value: 0,
      minOrder: 0,
      maxDiscount: 0,
      usageLimit: 0,
      validFrom: undefined,
      validTo: undefined,
      description: "",
      voucherType: "PUBLIC",
      requiredBookingCount: 0,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (voucher: Voucher) => {
    setCurrentVoucher(voucher);
    
    // Đảm bảo ngày hợp lệ trước khi đặt vào form
    let validFrom = undefined;
    let validTo = undefined;
    
    if (voucher.validFrom && isValidDate(voucher.validFrom)) {
      validFrom = new Date(voucher.validFrom);
    }
    
    if (voucher.validTo && isValidDate(voucher.validTo)) {
      validTo = new Date(voucher.validTo);
    }
    
    setFormData({
      code: voucher.code,
      name: voucher.name,
      type: voucher.type,
      value: voucher.value,
      minOrder: voucher.minOrder,
      maxDiscount: voucher.maxDiscount,
      usageLimit: voucher.usageLimit,
      validFrom: validFrom,
      validTo: validTo,
      description: voucher.description,
      voucherType: voucher.voucherType || "PUBLIC",
      requiredBookingCount: voucher.requiredBookingCount || 0,
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = (voucher: Voucher) => {
    if (voucher.status === 'active') {
      setCurrentVoucher(voucher);
      setIsStatusDialogOpen(true);
    }
  };

  const handleSaveVoucher = async () => {
    try {
      if (!formData.code || !formData.name || !formData.validFrom || !formData.validTo) {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ thông tin bắt buộc",
          variant: "destructive",
        });
        return;
      }

      // Kiểm tra ngày hợp lệ
      if (!isValidDate(formData.validFrom) || !isValidDate(formData.validTo)) {
        toast({
          title: "Lỗi",
          description: "Ngày không hợp lệ",
          variant: "destructive",
        });
        return;
      }

      // Kiểm tra ngày kết thúc phải sau ngày bắt đầu
      const startDate = new Date(formData.validFrom);
      const endDate = new Date(formData.validTo);
      if (endDate <= startDate) {
        toast({
          title: "Lỗi",
          description: "Ngày kết thúc phải sau ngày bắt đầu",
          variant: "destructive",
        });
        return;
      }

      // Lấy token từ localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const token = user?.token;

      const requestData = {
        code: formData.code,
        name: formData.name,
        type: formData.type,
        value: formData.value,
        minOrder: formData.minOrder,
        maxDiscount: formData.maxDiscount,
        usageLimit: formData.usageLimit,
        validFrom: formData.validFrom?.toISOString().split('T')[0],
        validTo: formData.validTo?.toISOString().split('T')[0],
        description: formData.description,
        voucherType: formData.voucherType,
        requiredBookingCount: formData.voucherType === "PERSONAL" ? formData.requiredBookingCount : null,
      };

      let response;
      if (currentVoucher) {
        // Update
        response = await fetch(`/api/admin/vouchers/${currentVoucher.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(requestData),
        });
      } else {
        // Create
        response = await fetch('/api/admin/vouchers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(requestData),
        });
      }

      if (response.ok) {
        const savedVoucher = await response.json();
        
        if (currentVoucher) {
          setVouchers(prev => prev.map(v => v.id === currentVoucher.id ? {
            ...savedVoucher,
            validFrom: new Date(savedVoucher.validFrom),
            validTo: new Date(savedVoucher.validTo)
          } : v));
          toast({
            title: "Thành công",
            description: "Đã cập nhật voucher thành công",
          });
        } else {
          setVouchers(prev => [...prev, {
            ...savedVoucher,
            validFrom: new Date(savedVoucher.validFrom),
            validTo: new Date(savedVoucher.validTo)
          }]);
          toast({
            title: "Thành công",
            description: "Đã thêm voucher mới thành công",
          });
        }

        setIsDialogOpen(false);
      } else {
        const errorData = await response.text();
        console.error('Error saving voucher:', errorData);
        toast({
          title: "Lỗi",
          description: "Có lỗi xảy ra khi lưu voucher",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving voucher:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi lưu voucher",
        variant: "destructive",
      });
    }
  };

  const confirmStatusChange = async () => {
    if (!currentVoucher || currentVoucher.status !== 'active') return;

    try {
      // Lấy token từ localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const token = user?.token;

      // Gọi API PATCH /status để cập nhật status expired
      const response = await fetch(`/api/admin/vouchers/${currentVoucher.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          status: 'expired'
        }),
      });

      if (response.ok) {
        const updatedVoucher = await response.json();
        setVouchers(prev => prev.map(v => 
          v.id === currentVoucher.id ? {
            ...updatedVoucher,
            status: 'expired', // Đảm bảo set status là expired
            validFrom: new Date(updatedVoucher.validFrom),
            validTo: new Date(updatedVoucher.validTo)
          } : v
        ));
        toast({
          title: "Thành công",
          description: "Đã chuyển voucher sang trạng thái hết hạn",
        });
      } else {
        const errorText = await response.text();
        console.error('Failed to update voucher status:', errorText);
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật trạng thái voucher",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating voucher status:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật trạng thái",
        variant: "destructive",
      });
    } finally {
      setIsStatusDialogOpen(false);
      setCurrentVoucher(null);
    }
  };

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Đã sao chép",
      description: `Mã voucher ${code} đã được sao chép`,
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VNĐ';
  };

  const formatDiscount = (type: string, value: number) => {
    // Logic mới: ≤100 là %, >100 là VND
    if (value <= 100) {
      return `${value}%`;
    } else {
      return formatCurrency(value);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "inactive": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "expired": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Hoạt động";
      case "inactive": return "Tạm dừng";
      case "expired": return "Hết hạn";
      default: return status;
    }
  };

  // Statistics moved to Analytics page

  // Hàm kiểm tra ngày hợp lệ
  const isValidDate = (date: any): boolean => {
    if (!date) return false;
    const d = new Date(date);
    return !isNaN(d.getTime());
  };

  // Hàm định dạng ngày an toàn
  const formatDateSafe = (date: any): string => {
    if (!isValidDate(date)) return "Ngày không hợp lệ";
    return format(new Date(date), "dd/MM/yyyy", { locale: vi });
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-600 bg-clip-text text-transparent mb-2">
                Phiếu Giảm Giá
              </h1>
              <p className="text-slate-600 text-lg">
                Quản lý mã giảm giá và khuyến mãi cho khách hàng
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
                Thêm Voucher
              </Button>
            </div>
          </div>

          {/* Statistics Cards moved to Analytics page */}

          {/* Search and Filter */}
          <Card className="mb-8 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm voucher..."
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
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Tạm dừng</SelectItem>
                    <SelectItem value="expired">Hết hạn</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Loại giảm giá" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    <SelectItem value="percentage">Phần trăm</SelectItem>
                    <SelectItem value="fixed">Số tiền cố định</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={voucherTypeFilter} onValueChange={setVoucherTypeFilter}>
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Loại voucher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả voucher</SelectItem>
                    <SelectItem value="PUBLIC">Công khai</SelectItem>
                    <SelectItem value="PERSONAL">Cá nhân</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center">
                  <Filter className="h-4 w-4 text-slate-500 mr-2" />
                  <span className="text-sm text-slate-600">
                    {filteredVouchers.length} voucher
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vouchers Table */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                    <Gift className="h-6 w-6 mr-2 text-blue-600" />
                    Danh Sách Voucher
                  </CardTitle>
                  <CardDescription className="text-slate-600 mt-1">
                    Quản lý mã giảm giá và chương trình khuyến mãi
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
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort('code')}>
                          Mã Voucher
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort('name')}>
                          Tên
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">Loại Voucher</TableHead>
                      <TableHead className="font-semibold text-slate-700">Loại & Giá trị</TableHead>
                      <TableHead className="font-semibold text-slate-700">Điều kiện</TableHead>
                      <TableHead className="font-semibold text-slate-700">Sử dụng</TableHead>
                      <TableHead className="font-semibold text-slate-700">Thời hạn</TableHead>
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
                    ) : filteredVouchers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-12">
                          <div className="text-slate-500">
                            <Gift className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                            <p className="text-lg font-medium">Không có dữ liệu</p>
                            <p className="text-sm">Chưa có voucher nào phù hợp với bộ lọc</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVouchers.map((voucher, index) => (
                        <TableRow
                          key={voucher.id}
                          className={`hover:bg-slate-50/50 transition-colors duration-150 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                          }`}
                        >
                          <TableCell className="font-medium text-slate-600">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <code className="px-2 py-1 bg-slate-100 rounded text-sm font-mono">
                                {voucher.code}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyVoucherCode(voucher.code)}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-slate-900">{voucher.name}</p>
                              <p className="text-xs text-slate-500 truncate max-w-xs">
                                {voucher.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {voucher.voucherType === "PERSONAL" ? (
                                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                  <Users className="h-3 w-3 mr-1" />
                                  Cá nhân
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Công khai
                                </Badge>
                              )}
                            </div>
                            {voucher.voucherType === "PERSONAL" && voucher.requiredBookingCount && (
                              <p className="text-xs text-slate-500 mt-1">
                                Cần {voucher.requiredBookingCount} lượt đặt
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {voucher.type === "percentage" ? (
                                <Percent className="h-4 w-4 text-orange-600" />
                              ) : (
                                <DollarSign className="h-4 w-4 text-green-600" />
                              )}
                              <span className="font-medium">
                                {formatDiscount(voucher.type, voucher.value)}
                              </span>
                            </div>
                            {voucher.maxDiscount > 0 && voucher.type === "percentage" && (
                              <p className="text-xs text-slate-500 mt-1">
                                Tối đa: {formatCurrency(voucher.maxDiscount)}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>Tối thiểu: {formatCurrency(voucher.minOrder)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <span className="font-medium">{voucher.usedCount}</span>
                              <span className="text-slate-500">/{voucher.usageLimit}</span>
                              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                                <div 
                                  className="bg-blue-600 h-1.5 rounded-full" 
                                  style={{
                                    width: `${Math.min((voucher.usedCount / voucher.usageLimit) * 100, 100)}%`
                                  }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{formatDateSafe(voucher.validFrom)}</p>
                              <p className="text-slate-500">đến</p>
                              <p>{formatDateSafe(voucher.validTo)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(voucher.status)}>
                              {getStatusText(voucher.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(voucher)}
                                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(voucher)}
                                disabled={voucher.status !== 'active'}
                                className={`${
                                  voucher.status === 'active' 
                                    ? "hover:bg-red-50 hover:text-red-700 hover:border-red-200" 
                                    : "opacity-50 cursor-not-allowed"
                                }`}
                                title={voucher.status === 'active' ? 'Đổi sang hết hạn' : 'Chỉ có thể đổi trạng thái voucher đang hoạt động'}
                              >
                                <Clock className="h-3 w-3" />
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

      {/* Add/Edit Voucher Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentVoucher ? 'Chỉnh Sửa Voucher' : 'Thêm Voucher Mới'}</DialogTitle>
            <DialogDescription>
              {currentVoucher ? 'Cập nhật thông tin voucher' : 'Tạo mã giảm giá mới cho khách hàng'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Mã voucher *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="VD: WELCOME10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Loại giảm giá *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: "percentage" | "fixed") => setFormData({...formData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                    <SelectItem value="fixed">Số tiền cố định (VNĐ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="voucherType">Loại voucher *</Label>
                <Select 
                  value={formData.voucherType} 
                  onValueChange={(value: "PUBLIC" | "PERSONAL") => setFormData({...formData, voucherType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại voucher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                        Công khai - Tất cả khách hàng
                      </div>
                    </SelectItem>
                    <SelectItem value="PERSONAL">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-purple-600" />
                        Cá nhân - Theo điều kiện
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.voucherType === "PERSONAL" && (
                <div className="space-y-2">
                  <Label htmlFor="requiredBookingCount">Yêu cầu số lượt đặt sân</Label>
                  <Input
                    id="requiredBookingCount"
                    type="number"
                    value={formData.requiredBookingCount}
                    onChange={(e) => setFormData({...formData, requiredBookingCount: Number(e.target.value)})}
                    placeholder="5"
                    min="1"
                  />
                  <p className="text-xs text-slate-500">
                    Khách hàng cần đặt ít nhất bao nhiêu lượt sân để nhận voucher này
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Tên voucher *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Tên hiển thị của voucher"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">
                  Giá trị {formData.type === "percentage" ? "(%)" : "(VNĐ)"} *
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                  placeholder={formData.type === "percentage" ? "10" : "20000"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minOrder">Đơn hàng tối thiểu (VNĐ)</Label>
                <Input
                  id="minOrder"
                  type="number"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({...formData, minOrder: Number(e.target.value)})}
                  placeholder="100000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDiscount">Giảm tối đa (VNĐ)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({...formData, maxDiscount: Number(e.target.value)})}
                  placeholder="50000"
                  disabled={formData.type === "fixed"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="usageLimit">Giới hạn sử dụng</Label>
              <Input
                id="usageLimit"
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({...formData, usageLimit: Number(e.target.value)})}
                placeholder="100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày bắt đầu *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.validFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.validFrom && isValidDate(formData.validFrom) ? 
                        format(formData.validFrom, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.validFrom}
                      onSelect={(date) => setFormData({...formData, validFrom: date})}
                      locale={vi}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Ngày kết thúc *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.validTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.validTo && isValidDate(formData.validTo) ? 
                        format(formData.validTo, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.validTo}
                      onSelect={(date) => setFormData({...formData, validTo: date})}
                      locale={vi}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Mô tả chi tiết về voucher"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveVoucher} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              {currentVoucher ? 'Cập Nhật' : 'Thêm Mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận đổi trạng thái voucher</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn chuyển voucher "{currentVoucher?.name}" từ trạng thái 
              <strong className="text-green-600"> Hoạt động </strong> 
              sang 
              <strong className="text-red-600"> Hết hạn</strong>? 
              <br />
              <span className="text-sm text-slate-500 mt-2 block">
                Voucher sẽ không thể sử dụng sau khi chuyển sang hết hạn.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmStatusChange}>
              <Clock className="h-4 w-4 mr-2" />
              Đổi sang Hết hạn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
