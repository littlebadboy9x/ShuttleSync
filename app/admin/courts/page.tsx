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
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { AdminLayout } from "@/components/admin-layout"
import { Plus } from "lucide-react"
import axios from "axios"

interface StatusType {
    id: number;
    name: string;
    description: string;
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

        // Đảm bảo response.data là một mảng
        const courtsData = Array.isArray(response.data) ? response.data : [response.data];
        
        // Log để xem cấu trúc thực tế của dữ liệu
        courtsData.forEach(court => {
            console.log('Court status type:', typeof court.status);
            console.log('Court status value:', court.status);
            if (typeof court.status === 'object') {
                console.log('Court status object properties:', Object.keys(court.status));
            }
        });

        // Xử lý và validate từng court object
        const validCourts = courtsData.map(court => ({
            id: Number(court.id) || 0,
            name: String(court.name || ''),
            description: String(court.description || ''),
            status: court.status, // Giữ nguyên status để debug
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

export default function CourtsPage() {
    const [courts, setCourts] = useState<Court[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
    const [editForm, setEditForm] = useState({
        name: "",
        description: "",
    })

    useEffect(() => {
        loadCourts()
    }, [])

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

            // Cập nhật danh sách sân
            setCourts(courts.map(court => 
                court.id === selectedCourt.id ? response.data : court
            ));

            setIsEditModalOpen(false);
            setSelectedCourt(null);
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
            
            // Cập nhật danh sách sân
            setCourts(courts.map(c => 
                c.id === court.id ? response.data : c
            ));
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
            case 1: // Trống
                return "default";
            case 2: // Đầy
                return "secondary";
            case 3: // Bảo trì
                return "destructive";
            default:
                return "outline";
        }
    }

    const getActionButtonText = (status: StatusType | number) => {
        const statusId = typeof status === 'object' ? status.id : Number(status);
        switch (statusId) {
            case 1: // Trống
                return "Đặt đầy";
            case 2: // Đầy
                return "Đặt bảo trì";
            case 3: // Bảo trì
                return "Đặt trống";
            default:
                return "Chuyển trạng thái";
        }
    }

    const getActionButtonVariant = (status: StatusType | number) => {
        const statusId = typeof status === 'object' ? status.id : Number(status);
        switch (statusId) {
            case 1: // Trống -> Đầy
                return "secondary";
            case 2: // Đầy -> Bảo trì
                return "destructive";
            case 3: // Bảo trì -> Trống
                return "default";
            default:
                return "outline";
        }
    }

    return (
        <AdminLayout>
            <div className="container py-6">
                <h1 className="text-3xl font-bold mb-6">Quản Lý Sân</h1>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <CardTitle>Sân Cầu Lông</CardTitle>
                                <CardDescription>Quản lý tất cả sân cầu lông</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <Input
                                placeholder="Tìm kiếm sân..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="md:max-w-sm"
                            />
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã</TableHead>
                                        <TableHead>Tên</TableHead>
                                        <TableHead>Mô Tả</TableHead>
                                        <TableHead>Trạng Thái</TableHead>
                                        <TableHead>Thao Tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                Đang tải dữ liệu...
                                            </TableCell>
                                        </TableRow>
                                    ) : error ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-red-500">
                                                {error}
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredCourts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                Không tìm thấy sân nào
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredCourts.map((court) => (
                                            <TableRow key={court.id || 'unknown'}>
                                                <TableCell className="font-medium">
                                                    #{String(court.id || '')}
                                                </TableCell>
                                                <TableCell>{String(court.name || '')}</TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {String(court.description || '')}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusVariant(court.status)}>
                                                        {getStatusText(court.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleEditClick(court)}
                                                        >
                                                            Sửa
                                                        </Button>
                                                        <Button 
                                                            variant={getActionButtonVariant(court.status)}
                                                            size="sm"
                                                            onClick={() => handleToggleStatus(court)}
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
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sửa Thông Tin Sân</DialogTitle>
                        <DialogDescription>
                            Chỉnh sửa thông tin cho sân {selectedCourt?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Tên Sân</Label>
                            <Input
                                id="edit-name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                placeholder="Nhập tên sân"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Mô Tả</Label>
                            <Textarea
                                id="edit-description"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                placeholder="Nhập mô tả sân"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleUpdateCourt}>
                            Lưu Thay Đổi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}
