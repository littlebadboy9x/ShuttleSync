"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { AdminLayout } from "@/components/admin-layout"
import { Search, RefreshCw, Filter, ArrowUpDown, MapPin, Settings, Activity, Edit, ToggleLeft, ToggleRight, Clock, Calendar, Eye } from "lucide-react"
import axios from "axios"

interface StatusType {
    id: number;
    name: string;
    description: string;
}

interface TimeSlot {
    id: number;
    slotIndex: number;
    startTime: string;
    endTime: string;
    price: number;
    status: StatusType;
}

interface Court {
    id: number;
    name: string;
    description: string;
    status: StatusType;
    hasFixedTimeSlots: boolean;
}

const API_URL = 'http://localhost:8080/api/courts';

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

const fetchCourts = async (): Promise<Court[]> => {
    try {
        const response = await axios.get<Court[]>(API_URL, getAuthHeader());
        console.log('Raw API Response:', response);
        
        if (!response.data) {
            console.error('No data received from API');
            return [];
        }

        const courtsData = Array.isArray(response.data) ? response.data : [response.data];
        
        courtsData.forEach(court => {
            console.log('Court status type:', typeof court.status);
            console.log('Court status value:', court.status);
            if (typeof court.status === 'object') {
                console.log('Court status object properties:', Object.keys(court.status));
            }
        });

        const validCourts = courtsData.map(court => ({
            id: Number(court.id) || 0,
            name: String(court.name || ''),
            description: String(court.description || ''),
            status: court.status,
            hasFixedTimeSlots: Boolean(court.hasFixedTimeSlots)
        }));

        console.log('Processed Courts:', validCourts);
        return validCourts;
    } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        console.error("Error fetching courts:", error);
        return [];
    }
};

const fetchCourtTimeSlots = async (courtId: number, date: string): Promise<{ total: TimeSlot[], available: TimeSlot[] }> => {
    try {
        const [totalResponse, availableResponse] = await Promise.all([
            axios.get(`${API_URL}/${courtId}/time-slots`, getAuthHeader()),
            axios.get(`${API_URL}/${courtId}/available-slots?date=${date}`, getAuthHeader())
        ]);
        
        return {
            total: Array.isArray(totalResponse.data) ? totalResponse.data : [],
            available: Array.isArray(availableResponse.data) ? availableResponse.data : []
        };
    } catch (error) {
        console.error(`Error fetching time slots for court ${courtId}:`, error);
        return { total: [], available: [] };
    }
};

export default function CourtsPage() {
    const [courts, setCourts] = useState<Court[]>([])
    const [courtsTimeSlots, setCourtsTimeSlots] = useState<Record<number, { totalSlots: number, availableSlots: number }>>({})
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isTimeSlotModalOpen, setIsTimeSlotModalOpen] = useState(false)
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
    const [selectedCourtTimeSlots, setSelectedCourtTimeSlots] = useState<{ total: TimeSlot[], available: TimeSlot[] }>({ total: [], available: [] })
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({
        name: "",
        description: "",
    })

    useEffect(() => {
        loadCourts()
    }, [])

    useEffect(() => {
        if (courts.length > 0) {
            loadCourtsSlotsInfo()
        }
    }, [selectedDate])

    // Load slots info khi courts được load lần đầu
    useEffect(() => {
        if (courts.length > 0) {
            loadCourtsSlotsInfo()
        }
    }, [courts])

    const loadCourts = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await fetchCourts()
            console.log('Courts data loaded:', data)
            setCourts(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Failed to load courts:", error)
            setError("Không thể tải dữ liệu sân. Vui lòng thử lại sau.")
        } finally {
            setIsLoading(false)
        }
    }

    const loadCourtsSlotsInfo = async () => {
        if (courts.length === 0) return;
        
        try {
            const slotsInfo: Record<number, { totalSlots: number, availableSlots: number }> = {};
            
            await Promise.all(
                courts.map(async (court) => {
                    const { total, available } = await fetchCourtTimeSlots(court.id, selectedDate);
                    slotsInfo[court.id] = {
                        totalSlots: total.length,
                        availableSlots: available.length
                    };
                })
            );
            
            setCourtsTimeSlots(slotsInfo);
        } catch (error) {
            console.error("Failed to load time slots info:", error);
        }
    }

    const handleRefresh = () => {
        setIsRefreshing(true)
        loadCourts().finally(() => setIsRefreshing(false))
    }

    const handleViewTimeSlots = async (court: Court) => {
        setSelectedCourt(court);
        setIsLoadingTimeSlots(true);
        setIsTimeSlotModalOpen(true);
        
        try {
            const slotsData = await fetchCourtTimeSlots(court.id, selectedDate);
            setSelectedCourtTimeSlots(slotsData);
        } catch (error) {
            console.error("Error loading time slots:", error);
        } finally {
            setIsLoadingTimeSlots(false);
        }
    }

    // Lọc sân dựa trên courts từ API
    const filteredCourts = courts.filter((court) => 
        court.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleEditClick = (court: Court) => {
        setSelectedCourt(court);
        setEditForm({
            name: court.name,
            description: court.description,
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateCourt = async () => {
        if (!selectedCourt) return;

        try {
            const response = await axios.put<Court>(
                `${API_URL}/${selectedCourt.id}`,
                {
                    ...selectedCourt,
                    name: editForm.name,
                    description: editForm.description,
                },
                getAuthHeader()
            );

            setCourts(courts.map(court => 
                court.id === selectedCourt.id ? response.data : court
            ));

            setIsEditModalOpen(false);
            setSelectedCourt(null);
            // Refresh slots info after update
            loadCourtsSlotsInfo();
        } catch (error) {
            console.error("Error updating court:", error);
        }
    };

    const handleToggleStatus = async (court: Court) => {
        try {
            const response = await axios.put<Court>(
                `${API_URL}/${court.id}/toggle-status`,
                {},
                getAuthHeader()
            );
            
            setCourts(courts.map(c => 
                c.id === court.id ? response.data : c
            ));
            // Refresh slots info after status change
            loadCourtsSlotsInfo();
        } catch (error) {
            console.error("Error toggling court status:", error);
        }
    }

    // Ánh xạ trạng thái sang tiếng Việt
    const getStatusText = (status: StatusType | number) => {
        const statusId = typeof status === 'object' ? status.id : Number(status);
        
        switch (statusId) {
            case 1:
                return "Trống";
            case 2:
                return "Đầy";
            case 3:
                return "Bảo trì";
            default:
                return "Không xác định";
        }
    }

    const getStatusVariant = (status: StatusType | number) => {
        const statusId = typeof status === 'object' ? status.id : Number(status);
        
        switch (statusId) {
            case 1:
                return "default";
            case 2:
                return "secondary";
            case 3:
                return "destructive";
            default:
                return "outline";
        }
    }

    const getActionButtonText = (status: StatusType | number) => {
        const statusId = typeof status === 'object' ? status.id : Number(status);
        switch (statusId) {
            case 1:
                return "Đặt đầy";
            case 2:
                return "Đặt bảo trì";
            case 3:
                return "Đặt trống";
            default:
                return "Chuyển trạng thái";
        }
    }

    const getActionButtonVariant = (status: StatusType | number) => {
        const statusId = typeof status === 'object' ? status.id : Number(status);
        switch (statusId) {
            case 1:
                return "secondary";
            case 2:
                return "destructive";
            case 3:
                return "default";
            default:
                return "outline";
        }
    }

    const getSlotAvailabilityColor = (available: number, total: number) => {
        if (total === 0) return "text-gray-500";
        const percentage = (available / total) * 100;
        if (percentage >= 70) return "text-green-600";
        if (percentage >= 30) return "text-yellow-600";
        return "text-red-600";
    }

    // Statistics moved to Analytics page

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                Quản Lý Sân Cầu Lông
                            </h1>
                            <p className="text-slate-600 mt-1">
                                Quản lý tất cả sân cầu lông và trạng thái hoạt động
                            </p>
                        </div>
                        <Button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Đang tải...' : 'Làm mới'}
                        </Button>
                    </div>

                    {/* Statistics Cards moved to Analytics page */}

                    {/* Search & Date Filter */}
                    <Card className="backdrop-blur-sm bg-white/70 border-white/50 shadow-xl">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <Input
                                        placeholder="Tìm kiếm theo tên sân..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <Input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Courts Table */}
                    <Card className="backdrop-blur-sm bg-white/70 border-white/50 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                                Danh Sách Sân Cầu Lông
                            </CardTitle>
                            <CardDescription>
                                Quản lý thông tin và trạng thái các sân cầu lông với chi tiết khung giờ
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        <p className="text-slate-600">Đang tải dữ liệu...</p>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8">
                                    <p className="text-red-600 mb-4">{error}</p>
                                    <Button onClick={loadCourts} variant="outline">
                                        Thử lại
                                    </Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">STT</TableHead>
                                            <TableHead>Tên Sân</TableHead>
                                            <TableHead>Mô Tả</TableHead>
                                            <TableHead>Trạng Thái</TableHead>
                                            <TableHead>Khung Giờ Trống</TableHead>
                                            <TableHead>Slot Cố Định</TableHead>
                                            <TableHead className="text-right">Thao Tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCourts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8">
                                                    <div className="text-slate-500">
                                                        <MapPin className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                                        <p className="text-lg font-medium">Không có dữ liệu</p>
                                                        <p className="text-sm">Chưa có sân nào phù hợp với tìm kiếm</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredCourts.map((court, index) => (
                                                <TableRow key={court.id}>
                                                    <TableCell className="font-medium text-slate-600">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell className="font-medium">{court.name}</TableCell>
                                                    <TableCell>{court.description}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={getStatusVariant(court.status)}>
                                                            {getStatusText(court.status)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <Clock className="w-4 h-4 text-slate-500" />
                                                            <span className={`font-medium ${getSlotAvailabilityColor(
                                                                courtsTimeSlots[court.id]?.availableSlots || 0, 
                                                                courtsTimeSlots[court.id]?.totalSlots || 0
                                                            )}`}>
                                                                {courtsTimeSlots[court.id]?.availableSlots || 0}/{courtsTimeSlots[court.id]?.totalSlots || 0}
                                                            </span>
                                                            <Badge 
                                                                variant={
                                                                    (courtsTimeSlots[court.id]?.availableSlots || 0) > 0 
                                                                        ? "default" 
                                                                        : "secondary"
                                                                }
                                                                className="text-xs"
                                                            >
                                                                {(courtsTimeSlots[court.id]?.availableSlots || 0) > 0 ? "Có trống" : "Hết slot"}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center">
                                                            {court.hasFixedTimeSlots ? (
                                                                <ToggleRight className="w-5 h-5 text-green-600 mr-2" />
                                                            ) : (
                                                                <ToggleLeft className="w-5 h-5 text-slate-400 mr-2" />
                                                            )}
                                                            <Badge variant={court.hasFixedTimeSlots ? "default" : "outline"}>
                                                                {court.hasFixedTimeSlots ? "Có" : "Không"}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end space-x-2">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => handleViewTimeSlots(court)}
                                                                className="hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
                                                            >
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                Xem Slot
                                                            </Button>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => handleEditClick(court)}
                                                                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                                                            >
                                                                <Edit className="w-4 h-4 mr-1" />
                                                                Sửa
                                                            </Button>
                                                            <Button 
                                                                variant={getActionButtonVariant(court.status)}
                                                                size="sm"
                                                                onClick={() => handleToggleStatus(court)}
                                                                className="transition-colors duration-150"
                                                            >
                                                                {getActionButtonText(court.status)}
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Edit Dialog */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-[550px]">
                        <DialogHeader>
                            <DialogTitle>Chỉnh Sửa Thông Tin Sân</DialogTitle>
                            <DialogDescription>
                                Cập nhật thông tin cho sân {selectedCourt?.name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Tên Sân</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    placeholder="Nhập tên sân"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Mô Tả</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    placeholder="Nhập mô tả sân"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleUpdateCourt} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                Lưu Thay Đổi
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Time Slots Detail Dialog */}
                <Dialog open={isTimeSlotModalOpen} onOpenChange={setIsTimeSlotModalOpen}>
                    <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                                Chi Tiết Khung Giờ - {selectedCourt?.name}
                            </DialogTitle>
                            <DialogDescription>
                                Khung giờ cho ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
                            </DialogDescription>
                        </DialogHeader>
                        
                        {isLoadingTimeSlots ? (
                            <div className="flex justify-center py-8">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                    <p className="text-slate-600">Đang tải khung giờ...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Summary */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="bg-green-50 border-green-200">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-green-600 font-medium">Khung Giờ Trống</p>
                                                    <p className="text-2xl font-bold text-green-700">{selectedCourtTimeSlots.available.length}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                                    <Clock className="w-6 h-6 text-green-600" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    
                                    <Card className="bg-slate-50 border-slate-200">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-slate-600 font-medium">Tổng Khung Giờ</p>
                                                    <p className="text-2xl font-bold text-slate-700">{selectedCourtTimeSlots.total.length}</p>
                                                </div>
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                                    <Settings className="w-6 h-6 text-slate-600" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Time Slots Grid */}
                                <div>
                                    <h4 className="text-lg font-semibold mb-4">Tất Cả Khung Giờ</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {selectedCourtTimeSlots.total.map((slot) => {
                                            const isAvailable = selectedCourtTimeSlots.available.some(
                                                availableSlot => availableSlot.id === slot.id
                                            );
                                            
                                            return (
                                                <Card 
                                                    key={slot.id} 
                                                    className={`transition-all duration-200 hover:shadow-md ${
                                                        isAvailable 
                                                            ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                                                            : 'border-red-200 bg-red-50 hover:bg-red-100'
                                                    }`}
                                                >
                                                    <CardContent className="p-3">
                                                        <div className="text-center">
                                                            <div className="font-semibold text-sm">
                                                                Slot {slot.slotIndex}
                                                            </div>
                                                            <div className="text-xs text-slate-600 mt-1">
                                                                {slot.startTime} - {slot.endTime}
                                                            </div>
                                                            <div className="mt-2">
                                                                <Badge 
                                                                    variant={isAvailable ? "default" : "destructive"}
                                                                    className="text-xs"
                                                                >
                                                                    {isAvailable ? "Trống" : "Đã đặt"}
                                                                </Badge>
                                                            </div>
                                                            {slot.price && (
                                                                <div className="text-xs text-slate-500 mt-1">
                                                                    {slot.price.toLocaleString('vi-VN')}đ
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                    
                                    {selectedCourtTimeSlots.total.length === 0 && (
                                        <div className="text-center py-8 text-slate-500">
                                            <Clock className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                            <p>Chưa có khung giờ nào được thiết lập cho sân này</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsTimeSlotModalOpen(false)}>
                                Đóng
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    )
}
