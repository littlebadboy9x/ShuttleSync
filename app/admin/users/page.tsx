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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/admin-layout"
import { Plus } from "lucide-react"
import axios from "axios"
import { format, parseISO } from "date-fns"
import { vi } from "date-fns/locale"

interface User {
    id: number;
    fullName: string;
    email: string;
    role: string;
    createdAt: string;
}

const API_URL = 'http://localhost:8080/api/users';

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

// Hàm format ngày giờ
const formatDateTime = (dateStr: string) => {
    try {
        // Xử lý chuỗi ngày không hợp lệ
        if (dateStr.includes(',')) {
            const [year, month, day, hour, minute, second] = dateStr.split(',').map(Number)
            const date = new Date(year, month - 1, day, hour, minute, second)
            return format(date, "dd/MM/yyyy", { locale: vi })
        }
        
        // Xử lý chuỗi ngày ISO
        const date = parseISO(dateStr)
        return format(date, "dd/MM/yyyy", { locale: vi })
    } catch (error) {
        console.error("Error formatting date:", error)
        return dateStr // Trả về chuỗi gốc nếu không parse được
    }
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [newUser, setNewUser] = useState({
        fullName: "",
        email: "",
        password: "",
        role: "customer",
    })

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await axios.get<User[]>(API_URL, getAuthHeader())
            
            if (!response.data) {
                console.error('No data received from API')
                setError("Không thể tải dữ liệu người dùng")
                return
            }

            const usersData = Array.isArray(response.data) ? response.data : [response.data]
            
            // Validate và format dữ liệu
            const validUsers = usersData.map(user => ({
                id: Number(user.id) || 0,
                fullName: String(user.fullName || ''),
                email: String(user.email || ''),
                role: String(user.role || 'customer'),
                createdAt: String(user.createdAt || new Date().toISOString())
            }))

            setUsers(validUsers)
        } catch (error: any) {
            console.error("Error loading users:", error)
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem('user')
                window.location.href = '/login'
            }
            setError("Có lỗi xảy ra khi tải dữ liệu")
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddUser = async () => {
        try {
            const apiResponse = await axios.post<User>(API_URL, newUser, getAuthHeader())
            if (apiResponse.data) {
                const newUserData: User = {
                    id: Number(apiResponse.data.id),
                    fullName: String(apiResponse.data.fullName),
                    email: String(apiResponse.data.email),
                    role: String(apiResponse.data.role),
                    createdAt: String(apiResponse.data.createdAt)
                }
                setUsers([...users, newUserData])
                setNewUser({
                    fullName: "",
                    email: "",
                    password: "",
                    role: "customer",
                })
                setIsAddUserOpen(false)
            }
        } catch (error) {
            console.error("Error adding user:", error)
        }
    }

    const handleDeleteUser = async (userId: number) => {
        try {
            await axios.delete(`${API_URL}/${userId}`, getAuthHeader())
            setUsers(users.filter(user => user.id !== userId))
        } catch (error) {
            console.error("Error deleting user:", error)
        }
    }

    // Lọc người dùng dựa trên truy vấn tìm kiếm và bộ lọc vai trò
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesRole = roleFilter === "all" || user.role === roleFilter

        return matchesSearch && matchesRole
    })

    // Ánh xạ vai trò sang tiếng Việt
    const getRoleText = (role: string) => {
        switch (role) {
            case "admin":
                return "Quản trị viên"
            case "customer":
                return "Khách hàng"
            default:
                return role
        }
    }

    return (
        <AdminLayout>
            <div className="container py-6">
                <h1 className="text-3xl font-bold mb-6">Quản Lý Người Dùng</h1>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <CardTitle>Người Dùng</CardTitle>
                                <CardDescription>Quản lý người dùng hệ thống và vai trò của họ</CardDescription>
                            </div>
                            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Thêm Người Dùng
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Thêm Người Dùng Mới</DialogTitle>
                                        <DialogDescription>Nhập thông tin cho người dùng mới.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="fullName">Họ và tên</Label>
                                            <Input
                                                id="fullName"
                                                value={newUser.fullName}
                                                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                                                placeholder="Nguyễn Văn A"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={newUser.email}
                                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                placeholder="nguyenvana@example.com"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="password">Mật khẩu</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="role">Vai trò</Label>
                                            <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                                                <SelectTrigger id="role">
                                                    <SelectValue placeholder="Chọn vai trò" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="customer">Khách hàng</SelectItem>
                                                    <SelectItem value="admin">Quản trị viên</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                                            Hủy
                                        </Button>
                                        <Button onClick={handleAddUser}>Thêm Người Dùng</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <Input
                                placeholder="Tìm kiếm người dùng..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="md:max-w-sm"
                            />
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Lọc theo vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                                    <SelectItem value="admin">Quản trị viên</SelectItem>
                                    <SelectItem value="customer">Khách hàng</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã</TableHead>
                                        <TableHead>Tên</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Vai Trò</TableHead>
                                        <TableHead>Ngày Tạo</TableHead>
                                        <TableHead>Thao Tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">
                                                Đang tải dữ liệu...
                                            </TableCell>
                                        </TableRow>
                                    ) : error ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-red-500">
                                                {error}
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">
                                                Không tìm thấy người dùng nào
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">#{user.id}</TableCell>
                                                <TableCell>{user.fullName}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={user.role === "admin" ? "default" : "outline"}>
                                                        {getRoleText(user.role)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{formatDateTime(user.createdAt)}</TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button variant="outline" size="sm">
                                                            Sửa
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
        </AdminLayout>
    )
}
