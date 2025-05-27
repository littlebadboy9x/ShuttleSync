"use client"

import { useState } from "react"
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

// Dữ liệu mẫu cho người dùng
const users = [
    {
        id: 1,
        fullName: "Nguyễn Văn A",
        email: "nguyenvana@example.com",
        role: "customer",
        createdAt: "2023-01-15",
    },
    {
        id: 2,
        fullName: "Trần Thị B",
        email: "tranthib@example.com",
        role: "customer",
        createdAt: "2023-02-20",
    },
    {
        id: 3,
        fullName: "Admin",
        email: "admin@example.com",
        role: "admin",
        createdAt: "2023-01-01",
    },
    {
        id: 4,
        fullName: "Lê Văn C",
        email: "levanc@example.com",
        role: "customer",
        createdAt: "2023-03-10",
    },
    {
        id: 5,
        fullName: "Phạm Thị D",
        email: "phamthid@example.com",
        role: "customer",
        createdAt: "2023-04-05",
    },
]

export default function UsersPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)
    const [newUser, setNewUser] = useState({
        fullName: "",
        email: "",
        password: "",
        role: "customer",
    })

    // Lọc người dùng dựa trên truy vấn tìm kiếm và bộ lọc vai trò
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesRole = roleFilter === "all" || user.role === roleFilter

        return matchesSearch && matchesRole
    })

    const handleAddUser = () => {
        console.log("Thêm người dùng mới:", newUser)
        setNewUser({
            fullName: "",
            email: "",
            password: "",
            role: "customer",
        })
        setIsAddUserOpen(false)
    }

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
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">#{user.id}</TableCell>
                                            <TableCell>{user.fullName}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === "admin" ? "default" : "outline"}>{getRoleText(user.role)}</Badge>
                                            </TableCell>
                                            <TableCell>{user.createdAt}</TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button variant="outline" size="sm">
                                                        Sửa
                                                    </Button>
                                                    <Button variant="destructive" size="sm">
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}
