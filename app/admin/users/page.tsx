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
import { Plus, Search, RefreshCw, Filter, User, Users, UserCheck, Calendar, Mail, Phone, Shield, Edit } from "lucide-react"
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
    const [isRefreshing, setIsRefreshing] = useState(false)
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

    const handleRefresh = () => {
        setIsRefreshing(true)
        loadUsers().finally(() => setIsRefreshing(false))
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

    // Statistics
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === "admin").length;
    const customerUsers = users.filter(u => u.role === "customer").length;
    const recentUsers = users.filter(u => {
        try {
            const createdDate = new Date(u.createdAt);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdDate > thirtyDaysAgo;
        } catch {
            return false;
        }
    }).length;

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                Quản Lý Người Dùng
                            </h1>
                            <p className="text-slate-600 mt-1">
                                Quản lý người dùng hệ thống và phân quyền
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <Button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                variant="outline"
                                className="border-slate-300 hover:border-slate-400"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                {isRefreshing ? 'Đang tải...' : 'Làm mới'}
                            </Button>
                            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Thêm Người Dùng
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[550px]">
                                    <DialogHeader>
                                        <DialogTitle>Thêm Người Dùng Mới</DialogTitle>
                                        <DialogDescription>Nhập thông tin cho người dùng mới.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">Họ và tên</Label>
                                            <Input
                                                id="fullName"
                                                value={newUser.fullName}
                                                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                                                placeholder="Nguyễn Văn A"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={newUser.email}
                                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                placeholder="nguyenvana@example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Mật khẩu</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-2">
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
                                        <Button onClick={handleAddUser} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                            Thêm Người Dùng
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="backdrop-blur-sm bg-white/70 border-white/50 shadow-xl">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    Tổng Người Dùng
                                </CardTitle>
                                <Users className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">{totalUsers}</div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Tất cả người dùng trong hệ thống
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="backdrop-blur-sm bg-white/70 border-white/50 shadow-xl">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    Quản Trị Viên
                                </CardTitle>
                                <Shield className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{adminUsers}</div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Người dùng có quyền admin
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="backdrop-blur-sm bg-white/70 border-white/50 shadow-xl">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    Khách Hàng
                                </CardTitle>
                                <UserCheck className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{customerUsers}</div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Người dùng thường
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="backdrop-blur-sm bg-white/70 border-white/50 shadow-xl">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    Mới Tháng Này
                                </CardTitle>
                                <Calendar className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">{recentUsers}</div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Đăng ký trong 30 ngày qua
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search and Filter */}
                    <Card className="backdrop-blur-sm bg-white/70 border-white/50 shadow-xl">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <Input
                                        placeholder="Tìm kiếm theo tên hoặc email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="w-full md:w-48">
                                        <SelectValue placeholder="Lọc theo vai trò" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả vai trò</SelectItem>
                                        <SelectItem value="admin">Quản trị viên</SelectItem>
                                        <SelectItem value="customer">Khách hàng</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Users Table */}
                    <Card className="backdrop-blur-sm bg-white/70 border-white/50 shadow-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="w-5 h-5 mr-2 text-blue-600" />
                                Danh Sách Người Dùng
                            </CardTitle>
                            <CardDescription>
                                Quản lý thông tin và quyền truy cập của người dùng
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
                                    <Button onClick={loadUsers} variant="outline">
                                        Thử lại
                                    </Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">STT</TableHead>
                                            <TableHead>Tên</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Vai trò</TableHead>
                                            <TableHead>Ngày tạo</TableHead>
                                            <TableHead className="text-right">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8">
                                                    <div className="text-slate-500">
                                                        <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                                        <p className="text-lg font-medium">Không có dữ liệu</p>
                                                        <p className="text-sm">Chưa có người dùng nào phù hợp với bộ lọc</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredUsers.map((user, index) => (
                                                <TableRow key={user.id}>
                                                    <TableCell className="font-medium text-slate-600">
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                                                {user.fullName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-medium">{user.fullName}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center">
                                                            <Mail className="w-4 h-4 text-slate-400 mr-2" />
                                                            {user.email}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge 
                                                            variant={user.role === "admin" ? "default" : "outline"}
                                                            className={user.role === "admin" ? "bg-red-100 text-red-800 border-red-200" : "bg-green-100 text-green-800 border-green-200"}
                                                        >
                                                            {user.role === "admin" ? (
                                                                <>
                                                                    <Shield className="w-3 h-3 mr-1" />
                                                                    {getRoleText(user.role)}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <User className="w-3 h-3 mr-1" />
                                                                    {getRoleText(user.role)}
                                                                </>
                                                            )}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center">
                                                            <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                                                            {formatDateTime(user.createdAt)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                                                        >
                                                            <Edit className="w-4 h-4 mr-1" />
                                                            Sửa
                                                        </Button>
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
            </div>
        </AdminLayout>
    )
}
