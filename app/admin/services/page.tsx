"use client"

import { useState, useEffect, useMemo } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Filter, 
  ArrowUpDown,
  PackageOpen,
  DollarSign
} from "lucide-react"
import axios from "axios"
import { toast } from "@/components/ui/use-toast"

interface ServiceType {
  id: number
  typeName: string
  description: string
}

interface Service {
  id: number
  serviceName: string
  description: string
  unitPrice: number
  serviceType?: ServiceType
  isActive: boolean
}

const API_URL = 'http://localhost:8080/api/service';

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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentService, setCurrentService] = useState<Service | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState<{ key: keyof Service; direction: 'asc' | 'desc' }>({
    key: 'serviceName',
    direction: 'asc'
  });
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    serviceName: "",
    description: "",
    unitPrice: 0,
    serviceTypeId: 0,
    isActive: true
  })

  const [isTogglingStatus, setIsTogglingStatus] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadData()
  }, [])

  // Debug function
  const debugServiceTypes = () => {
    console.log("=== DEBUG SERVICE TYPES ===");
    console.log("ServiceTypes:", serviceTypes.map(t => `${t.id}: ${t.typeName}`));
    console.log("Services:", services.map(s => `${s.id}: ${s.serviceName} (Type: ${s.serviceType ? s.serviceType.id : 'null'})`));
    console.log("Services with null serviceType:", services.filter(s => !s.serviceType).map(s => `${s.id}: ${s.serviceName}`));
    console.log("ServiceType IDs:", serviceTypes.map(t => t.id));
    
    // Kiểm tra chi tiết các service có serviceType nhưng không hiển thị
    const problematicServices = services.filter(s => 
      s.serviceType && (!s.serviceType.typeName || s.serviceType.typeName.trim() === '')
    );
    if (problematicServices.length > 0) {
      console.log("Problematic services with incomplete serviceType:", problematicServices);
    }
    
    console.log("=========================");
  }

  // Hàm sửa lỗi encoding UTF-8 trong chuỗi
  const fixUtf8Encoding = (str: string | null | undefined): string => {
    if (!str) return '';
    
    // Thay thế các ký tự bị mã hóa sai
    return str
      .replace(/N\?\?c/g, 'Nước')
      .replace(/n\?\?c/g, 'nước')
      .replace(/\?\?/g, 'ớ')
      .replace(/\?i/g, 'ới')
      .replace(/\?u/g, 'ấu')
      .replace(/\?/g, 'ư');
  };

  const loadData = async (retryCount = 0) => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log("Loading data, retry attempt:", retryCount);
      
      // Load service types trước để đảm bảo có dữ liệu đầy đủ
      const typesResponse = await axios.get(`${API_URL}/service-types`, getAuthHeader());
      console.log("Service types response:", typesResponse.data);
      
      // Xử lý service types
      let typesData = [];
      if (typesResponse.data && Array.isArray(typesResponse.data)) {
        typesData = typesResponse.data.map(type => ({
          ...type,
          typeName: fixUtf8Encoding(type.typeName),
          description: fixUtf8Encoding(type.description)
        }));
        setServiceTypes(typesData);
      } else {
        console.warn("Service types data is not an array or is empty:", typesResponse.data);
        setServiceTypes([])
      }
      
      // Tạo map để tra cứu nhanh
      const typeMap = new Map();
      typesData.forEach(type => {
        typeMap.set(type.id, type);
        console.log(`Added type to map: ${type.id} - ${type.typeName}`);
      });
      
      // Sau đó mới load services
      const servicesResponse = await axios.get(`${API_URL}/services`, getAuthHeader());
      console.log("Services response:", servicesResponse.data);
      
      // Xử lý services
      let servicesData = [];
      if (servicesResponse.data && Array.isArray(servicesResponse.data)) {
        // Xử lý từng service để đảm bảo serviceType là đối tượng đầy đủ
        servicesData = servicesResponse.data.map(service => {
          // Sửa lỗi encoding trong tên dịch vụ và mô tả
          const serviceClone = {
            ...service,
            serviceName: fixUtf8Encoding(service.serviceName),
            description: fixUtf8Encoding(service.description)
          };
          
          try {
            // Nếu service có serviceTypeId trong response
            if (service.serviceTypeId && service.serviceTypeId > 0) {
              if (typeMap.has(service.serviceTypeId)) {
                serviceClone.serviceType = {...typeMap.get(service.serviceTypeId)};
                console.log(`Set serviceType for ${serviceClone.serviceName} using serviceTypeId: ${service.serviceTypeId} -> ${serviceClone.serviceType.typeName}`);
              }
            }
            // Nếu service có serviceType nhưng cần đảm bảo đầy đủ thông tin
            else if (service.serviceType && service.serviceType.id) {
              const typeId = service.serviceType.id;
              if (typeMap.has(typeId)) {
                serviceClone.serviceType = {...typeMap.get(typeId)};
                console.log(`Updated serviceType for ${serviceClone.serviceName} using existing serviceType.id: ${typeId} -> ${serviceClone.serviceType.typeName}`);
              } else {
                console.warn(`ServiceType ID ${typeId} not found in typeMap for ${serviceClone.serviceName}`);
              }
            }
            
            // Nếu service.serviceType tồn tại nhưng không có typeName hợp lệ
            if (serviceClone.serviceType && (!serviceClone.serviceType.typeName || serviceClone.serviceType.typeName === "undefined")) {
              console.warn(`Invalid typeName for ${serviceClone.serviceName}, setting to null`);
              serviceClone.serviceType = null;
            }
          } catch (err) {
            console.error(`Error processing serviceType for ${serviceClone.serviceName}:`, err);
            // Đặt serviceType thành null nếu có lỗi
            serviceClone.serviceType = null;
          }
          
          return serviceClone;
        });
        
        // Log chi tiết từng service
        servicesData.forEach(service => {
          console.log(`Service ${service.id} (${service.serviceName}): serviceType=`, 
            service.serviceType ? `${service.serviceType.id}:${service.serviceType.typeName}` : 'null');
        });
        
        setServices(servicesData);
      } else {
        console.warn("Services data is not an array or is empty:", servicesResponse.data);
        setServices([])
      }

      // Debug sau khi load data
      setTimeout(() => {
        debugServiceTypes();
      }, 500);
    } catch (error: any) {
      console.error("Error loading data:", error)
      
      // Kiểm tra lỗi mạng hoặc CORS
      if (error.message && error.message.includes('Network Error')) {
        console.error("Network error detected, check if backend is running");
      }
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('user')
        window.location.href = '/login'
        return;
      }
      
      setError("Có lỗi xảy ra khi tải dữ liệu")
      setServices([])
      setServiceTypes([])
      
      // Thử lại tối đa 3 lần nếu lỗi không phải là 401/403
      if (retryCount < 3) {
        console.log(`Retrying loadData, attempt ${retryCount + 1}/3...`);
        setTimeout(() => loadData(retryCount + 1), 1000 * (retryCount + 1));
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    loadData(0).finally(() => setIsRefreshing(false))
  }

  const handleSort = (key: keyof Service) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedServices = useMemo(() => {
    if (!services || services.length === 0) return [];

    return [...services].sort((a, b) => {
      if (sortConfig.key === 'serviceName') {
        const aName = a.serviceName || '';
        const bName = b.serviceName || '';
        return sortConfig.direction === 'asc'
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      }

      if (sortConfig.key === 'unitPrice') {
        const aPrice = a.unitPrice || 0;
        const bPrice = b.unitPrice || 0;
        return sortConfig.direction === 'asc'
          ? aPrice - bPrice
          : bPrice - aPrice;
      }

      return 0;
    });
  }, [services, sortConfig]);

  const filteredServices = useMemo(() => {
    return sortedServices.filter(service => {
      if (!service) return false;
      
      const matchesSearch = (service.serviceName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (service.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
                          
      // Xử lý đặc biệt cho "all" và các dịch vụ không có serviceType
      const matchesCategory = 
        categoryFilter === "all" || 
        (categoryFilter === "null" && !service.serviceType) ||
        (service.serviceType && service.serviceType.id?.toString() === categoryFilter);
                          
      return matchesSearch && matchesCategory;
    });
  }, [sortedServices, searchTerm, categoryFilter]);

  const handleAdd = () => {
    setCurrentService(null)
    setFormData({
      serviceName: "",
      description: "",
      unitPrice: 0,
      serviceTypeId: serviceTypes.length > 0 ? serviceTypes[0].id : 0,
      isActive: true
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (service: Service) => {
    console.log("Editing service:", service);
    setCurrentService(service)
    setFormData({
      serviceName: service.serviceName || '',
      description: service.description || '',
      unitPrice: service.unitPrice || 0,
      serviceTypeId: service.serviceType?.id || 0,
      isActive: service.isActive
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (service: Service) => {
    setCurrentService(service)
    setIsDeleteDialogOpen(true)
  }

  const handleSaveService = async () => {
    try {
      if (!formData.serviceName || !formData.description || formData.unitPrice <= 0) {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ thông tin hợp lệ",
          variant: "destructive",
        })
        return
      }

      console.log("Saving service with data:", formData);

      const requestData = {
        serviceName: formData.serviceName,
        description: formData.description,
        unitPrice: formData.unitPrice,
        serviceTypeId: formData.serviceTypeId === 0 ? null : formData.serviceTypeId,
        isActive: formData.isActive
      }

      console.log("Request data after processing:", requestData);

      let updatedService: Service | null = null;
      
      if (currentService) {
        // Update
        const response = await axios.put(`${API_URL}/services/${currentService.id}`, requestData, getAuthHeader())
        console.log("Update response:", response.data);
        const responseData = response.data as Service;
        updatedService = {
          ...responseData,
          serviceName: fixUtf8Encoding(responseData.serviceName),
          description: fixUtf8Encoding(responseData.description)
        } as Service;
        toast({
          title: "Thành công",
          description: "Đã cập nhật dịch vụ thành công",
        })
      } else {
        // Create
        const response = await axios.post(`${API_URL}/services`, requestData, getAuthHeader())
        console.log("Create response:", response.data);
        const responseData = response.data as Service;
        updatedService = {
          ...responseData,
          serviceName: fixUtf8Encoding(responseData.serviceName),
          description: fixUtf8Encoding(responseData.description)
        } as Service;
        toast({
          title: "Thành công",
          description: "Đã thêm dịch vụ mới thành công",
        })
      }

      setIsDialogOpen(false)
      
      // Nếu có serviceTypeId, tìm và gán đối tượng ServiceType đầy đủ
      if (updatedService && requestData.serviceTypeId) {
        const matchingType = serviceTypes.find(t => t.id === requestData.serviceTypeId);
        if (matchingType) {
          updatedService.serviceType = matchingType;
        }
      }
      
      // Cập nhật danh sách dịch vụ mà không cần tải lại toàn bộ
      if (updatedService) {
        if (currentService) {
          // Cập nhật dịch vụ hiện có
          setServices(prevServices => 
            prevServices.map(s => s.id === updatedService?.id ? updatedService : s)
          );
        } else {
          // Thêm dịch vụ mới
          setServices(prevServices => [...prevServices, updatedService as Service]);
        }
      } else {
        // Nếu không có dữ liệu trả về, tải lại toàn bộ
        loadData();
      }
    } catch (error: any) {
      console.error("Error saving service:", error)
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi lưu dịch vụ",
        variant: "destructive",
      })
    }
  }

  const confirmDelete = async () => {
    if (!currentService) return

    try {
      await axios.delete(`${API_URL}/services/${currentService.id}`, getAuthHeader())
      setIsDeleteDialogOpen(false)
      setCurrentService(null)
      loadData() // Reload data
      toast({
        title: "Thành công",
        description: "Đã xóa dịch vụ thành công",
      })
    } catch (error) {
      console.error("Error deleting service:", error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xóa dịch vụ",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (service: Service) => {
    try {
      // Đánh dấu đang toggle
      setIsTogglingStatus(prev => ({ ...prev, [service.id]: true }));

      // Lưu lại giá trị hiện tại để khôi phục nếu lỗi
      const originalStatus = service.isActive;
      
      // Cập nhật UI trước để người dùng thấy phản hồi ngay lập tức
      const newStatus = !service.isActive;
      setServices(prevServices => 
        prevServices.map(s => 
          s.id === service.id 
            ? { ...s, isActive: newStatus } 
            : s
        )
      );
      
      console.log(`Toggling service ${service.id} status from ${originalStatus} to ${newStatus}`);
      
      // Gọi API
      const response = await axios({
        method: 'PATCH',
        url: `${API_URL}/services/${service.id}/status`,
        data: JSON.stringify({ isActive: newStatus }),
        headers: {
          ...getAuthHeader().headers,
          'Content-Type': 'application/json'
        }
      });

      console.log('API response:', response);

      // Hiển thị thông báo thành công
      toast({
        title: "Thành công",
        description: `Đã ${newStatus ? 'kích hoạt' : 'tạm dừng'} dịch vụ`,
      });
      
    } catch (error: any) {
      console.error("Error toggling service status:", error);
      
      // Hoàn tác UI nếu API lỗi
      setServices(prevServices => 
        prevServices.map(s => 
          s.id === service.id 
            ? { ...s, isActive: service.isActive } 
            : s
        )
      );
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi thay đổi trạng thái. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsTogglingStatus(prev => ({ ...prev, [service.id]: false }));
    }
  }

  const handleQuickUpdateServiceType = async (service: Service, serviceTypeId: number) => {
    try {
      console.log(`Quick updating service ${service.id} type to ${serviceTypeId}`);
      
      // Tìm serviceType từ danh sách
      let newServiceType: ServiceType | undefined = undefined;
      if (serviceTypeId > 0) {
        newServiceType = serviceTypes.find(t => t.id === serviceTypeId);
        if (!newServiceType) {
          console.error(`ServiceType with id ${serviceTypeId} not found`);
          toast({
            title: "Lỗi",
            description: "Không tìm thấy loại dịch vụ đã chọn",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Cập nhật UI ngay lập tức để người dùng thấy phản hồi
      setServices(prevServices => {
        return prevServices.map(s => {
          if (s.id === service.id) {
            console.log("New service type:", newServiceType);
            const updatedService = {...s};
            updatedService.serviceType = newServiceType;
            return updatedService;
          }
          return s;
        });
      });
      
      // Tạo DTO để update (chỉ gửi các trường cần thiết)
      const requestData = {
        id: service.id,
        serviceName: service.serviceName,
        description: service.description,
        unitPrice: service.unitPrice,
        serviceTypeId: serviceTypeId > 0 ? serviceTypeId : null,
        isActive: service.isActive
      };
      
      console.log("Request data:", requestData);
      
      // Sử dụng PUT thay vì PATCH để tránh lỗi CORS và Unicode
      const response = await axios.put(
        `${API_URL}/services/${service.id}`,
        requestData,
        getAuthHeader()
      );
      
      console.log("Quick update response:", response.data);
      
      // Nếu có dữ liệu trả về, cập nhật lại service
      if (response.data) {
        // Sửa lỗi encoding trong response data
        const responseService = response.data as Service;
        const updatedService = {
          ...responseService,
          serviceName: fixUtf8Encoding(responseService.serviceName),
          description: fixUtf8Encoding(responseService.description),
          serviceType: newServiceType
        } as Service;
        
        setServices(prevServices => 
          prevServices.map(s => s.id === service.id ? updatedService : s)
        );
      }
      
      toast({
        title: "Thành công",
        description: `Đã cập nhật loại dịch vụ cho ${service.serviceName}`,
      });
      
    } catch (error: any) {
      console.error("Error quick updating service type:", error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      // Hoàn tác UI nếu lỗi
      loadData();
      
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật loại dịch vụ. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  }

  // Statistics
  const totalServices = services.length;
  const activeServices = services.filter(s => s.isActive).length;
  const inactiveServices = services.filter(s => !s.isActive).length;
  const avgPrice = services.length > 0 ? services.reduce((sum, s) => sum + s.unitPrice, 0) / services.length : 0;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-600 bg-clip-text text-transparent mb-2">
                Quản Lý Dịch Vụ
              </h1>
              <p className="text-slate-600 text-lg">
                Quản lý các dịch vụ và sản phẩm cho khách hàng
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
                onClick={() => setCategoryFilter("null")}
                variant="outline"
                className="border-amber-300 text-amber-700 hover:border-amber-400 hover:bg-amber-50 transition-all duration-200"
              >
                <Filter className="h-4 w-4 mr-2" />
                Xem chưa phân loại ({services.filter(s => !s.serviceType).length})
              </Button>
              <Button
                onClick={handleAdd}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm Dịch Vụ
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card className="backdrop-blur-sm bg-white/70 border-white/50 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Tổng Dịch Vụ
                </CardTitle>
                <PackageOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{totalServices}</div>
                <p className="text-xs text-slate-500 mt-1">
                  Tất cả dịch vụ trong hệ thống
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/70 border-white/50 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Đang Hoạt Động
                </CardTitle>
                <div className="w-4 h-4 bg-green-500 rounded-full" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeServices}</div>
                <p className="text-xs text-slate-500 mt-1">
                  Dịch vụ có thể sử dụng
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/70 border-white/50 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Tạm Dừng
                </CardTitle>
                <div className="w-4 h-4 bg-red-500 rounded-full" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{inactiveServices}</div>
                <p className="text-xs text-slate-500 mt-1">
                  Dịch vụ không có sẵn
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-white/70 border-white/50 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Giá Trung Bình
                </CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {avgPrice.toLocaleString('vi-VN')} VNĐ
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Giá trung bình của dịch vụ
                </p>
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
                    placeholder="Tìm kiếm dịch vụ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="w-full md:w-[200px]">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Lọc theo loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả loại ({filteredServices.length})</SelectItem>
                      <SelectItem value="null">Chưa phân loại ({services.filter(s => !s.serviceType).length})</SelectItem>
                      <SelectItem value="0">Không có loại</SelectItem>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.typeName} ({services.filter(s => s.serviceType?.id === type.id).length})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Table */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                    <PackageOpen className="h-6 w-6 mr-2 text-blue-600" />
                    Danh Sách Dịch Vụ
                  </CardTitle>
                  <CardDescription className="text-slate-600 mt-1">
                    Quản lý các dịch vụ và sản phẩm cung cấp cho khách hàng
                  </CardDescription>
                </div>
                <div className="flex items-center mt-4 sm:mt-0">
                  <Filter className="h-4 w-4 text-slate-500 mr-2" />
                  <span className="text-sm text-slate-600">
                    {filteredServices.length} dịch vụ
                  </span>
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
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort('serviceName')}>
                          Tên Dịch Vụ
                          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortConfig.key === 'serviceName' ? 'text-blue-600' : ''}`} />
                          {sortConfig.key === 'serviceName' && (
                            <span className="ml-1 text-xs text-blue-600">
                              ({sortConfig.direction === 'asc' ? 'A-Z' : 'Z-A'})
                            </span>
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">Mô tả</TableHead>
                      <TableHead className="font-semibold text-slate-700">Loại</TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort('unitPrice')}>
                          Giá
                          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortConfig.key === 'unitPrice' ? 'text-blue-600' : ''}`} />
                          {sortConfig.key === 'unitPrice' && (
                            <span className="ml-1 text-xs text-blue-600">
                              ({sortConfig.direction === 'asc' ? 'Thấp-Cao' : 'Cao-Thấp'})
                            </span>
                          )}
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
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <p className="text-red-600 mb-4">{error}</p>
                          <Button onClick={() => loadData(0)} variant="outline">
                            Thử lại
                          </Button>
                        </TableCell>
                      </TableRow>
                    ) : filteredServices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="text-slate-500">
                            <PackageOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                            <p className="text-lg font-medium">Không có dữ liệu</p>
                            <p className="text-sm">Chưa có dịch vụ nào phù hợp với bộ lọc</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredServices.map((service, index) => (
                        <TableRow
                          key={service.id}
                          className={`hover:bg-slate-50/50 transition-colors duration-150 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                          }`}
                        >
                          <TableCell className="font-medium text-slate-600">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium text-slate-900">
                            {service.serviceName}
                          </TableCell>
                          <TableCell className="text-slate-700 max-w-xs truncate">
                            {service.description}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Select 
                                value={service.serviceType?.id?.toString() || "0"} 
                                onValueChange={(value) => handleQuickUpdateServiceType(service, parseInt(value))}
                              >
                                <SelectTrigger className={`h-8 w-40 ${
                                  service.serviceType && service.serviceType.typeName
                                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  <SelectValue>
                                    {service.serviceType && service.serviceType.typeName 
                                      ? service.serviceType.typeName 
                                      : "Không có loại"}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">Không có loại</SelectItem>
                                  {serviceTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id.toString()}>
                                      {type.typeName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                              {service.unitPrice.toLocaleString('vi-VN')} VNĐ
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch 
                                checked={service.isActive} 
                                onCheckedChange={() => handleToggleStatus(service)}
                                disabled={isTogglingStatus[service.id] || false}
                              />
                              <span className={service.isActive ? 'text-green-600' : 'text-red-600'}>
                                {service.isActive ? 'Có sẵn' : 'Không có sẵn'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(service)}
                                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors duration-150"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Sửa
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(service)}
                                className="hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors duration-150"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Xóa
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

      {/* Add/Edit Service Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{currentService ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}</DialogTitle>
            <DialogDescription>
              {currentService ? 'Cập nhật thông tin dịch vụ' : 'Nhập thông tin cho dịch vụ mới'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="serviceName">Tên dịch vụ *</Label>
              <Input
                id="serviceName"
                value={formData.serviceName}
                onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
                placeholder="Nhập tên dịch vụ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Nhập mô tả dịch vụ"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceType">Loại dịch vụ *</Label>
                <Select 
                  value={formData.serviceTypeId.toString()} 
                  onValueChange={(value) => setFormData({...formData, serviceTypeId: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại dịch vụ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Không có loại</SelectItem>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.typeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Giá tiền (VNĐ) *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({...formData, unitPrice: Number(e.target.value)})}
                  placeholder="Nhập giá dịch vụ"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="isActive" 
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
              />
              <Label htmlFor="isActive">Có sẵn</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveService} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              {currentService ? 'Cập Nhật' : 'Thêm Mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa dịch vụ</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa dịch vụ "{currentService?.serviceName}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
