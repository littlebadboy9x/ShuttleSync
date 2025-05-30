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

interface Service {
  id: number
  name: string
  description: string
  price: number
  category: string
  isAvailable: boolean
  image?: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentService, setCurrentService] = useState<Service | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" })

  // Mock data để hiển thị UI
  const mockServices: Service[] = [
    {
      id: 1,
      name: "Thuê vợt cầu lông",
      description: "Vợt cầu lông chất lượng cao dành cho người chơi",
      price: 50000,
      category: "Thiết bị",
      isAvailable: true,
      image: "/images/racket.jpg"
    },
    {
      id: 2,
      name: "Quả cầu lông",
      description: "Bộ 12 quả cầu lông chất lượng cao",
      price: 120000,
      category: "Thiết bị",
      isAvailable: true,
      image: "/images/shuttlecock.jpg"
    },
    {
      id: 3,
      name: "Nước uống thể thao",
      description: "Nước uống bổ sung điện giải cho vận động viên",
      price: 15000,
      category: "Đồ uống",
      isAvailable: true,
      image: "/images/drink.jpg"
    },
    {
      id: 4,
      name: "Huấn luyện viên cá nhân",
      description: "Huấn luyện viên chuyên nghiệp hướng dẫn kỹ thuật cầu lông",
      price: 350000,
      category: "Dịch vụ",
      isAvailable: true,
      image: "/images/coach.jpg"
    },
    {
      id: 5,
      name: "Giày cầu lông",
      description: "Giày chuyên dụng cho sân cầu lông",
      price: 850000,
      category: "Thiết bị",
      isAvailable: false,
      image: "/images/shoes.jpg"
    }
  ]

  useEffect(() => {
    // Mô phỏng việc tải dữ liệu từ API
    const fetchServices = () => {
      setIsLoading(true)
      setTimeout(() => {
        setServices(mockServices)
        setIsLoading(false)
      }, 1000)
    }

    fetchServices()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Mô phỏng việc làm mới dữ liệu
    setTimeout(() => {
      setServices(mockServices)
      setIsRefreshing(false)
    }, 1000)
  }

  const handleSort = (key: keyof Service) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedServices = [...services].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof Service];
    const bValue = b[sortConfig.key as keyof Service];
    
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

  const filteredServices = sortedServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || service.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleEdit = (service: Service) => {
    setCurrentService(service)
    setIsDialogOpen(true)
  }

  const handleDelete = (service: Service) => {
    setCurrentService(service)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (currentService) {
      setServices(services.filter(s => s.id !== currentService.id))
      setIsDeleteDialogOpen(false)
      setCurrentService(null)
    }
  }

  const handleSaveService = () => {
    // Xử lý lưu dịch vụ
    setIsDialogOpen(false)
    setCurrentService(null)
  }

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
                onClick={() => {
                  setCurrentService(null)
                  setIsDialogOpen(true)
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm Dịch Vụ
              </Button>
            </div>
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
                      <SelectValue placeholder="Lọc theo danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả danh mục</SelectItem>
                      <SelectItem value="Thiết bị">Thiết bị</SelectItem>
                      <SelectItem value="Đồ uống">Đồ uống</SelectItem>
                      <SelectItem value="Dịch vụ">Dịch vụ</SelectItem>
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
                      <TableHead className="font-semibold text-slate-700">
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort('name')}>
                          Tên Dịch Vụ
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">Mô tả</TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort('category')}>
                          Danh mục
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort('price')}>
                          Giá
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
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex items-center justify-center">
                            <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                            <span className="text-slate-600">Đang tải dữ liệu...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredServices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
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
                          <TableCell className="font-medium text-slate-900">
                            {service.name}
                          </TableCell>
                          <TableCell className="text-slate-700 max-w-xs truncate">
                            {service.description}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {service.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                              {service.price.toLocaleString('vi-VN')} VNĐ
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch checked={service.isAvailable} />
                              <span className={service.isAvailable ? 'text-green-600' : 'text-red-600'}>
                                {service.isAvailable ? 'Có sẵn' : 'Không có sẵn'}
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Tên dịch vụ
              </Label>
              <Input
                id="name"
                defaultValue={currentService?.name || ''}
                className="col-span-3"
                placeholder="Nhập tên dịch vụ"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Mô tả
              </Label>
              <Textarea
                id="description"
                defaultValue={currentService?.description || ''}
                className="col-span-3"
                placeholder="Nhập mô tả dịch vụ"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Danh mục
              </Label>
              <Select defaultValue={currentService?.category || 'Thiết bị'}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Thiết bị">Thiết bị</SelectItem>
                  <SelectItem value="Đồ uống">Đồ uống</SelectItem>
                  <SelectItem value="Dịch vụ">Dịch vụ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Giá tiền
              </Label>
              <Input
                id="price"
                type="number"
                defaultValue={currentService?.price || 0}
                className="col-span-3"
                placeholder="Nhập giá dịch vụ"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isAvailable" className="text-right">
                Trạng thái
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch defaultChecked={currentService?.isAvailable ?? true} id="isAvailable" />
                <Label htmlFor="isAvailable">Có sẵn</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveService}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa dịch vụ</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa dịch vụ "{currentService?.name}"? Hành động này không thể hoàn tác.
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
