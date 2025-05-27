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
import { Textarea } from "@/components/ui/textarea"
import { AdminLayout } from "@/components/admin-layout"
import { Plus } from "lucide-react"

// Dữ liệu mẫu cho sân
const courts = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Sân ${i + 1}`,
    description: `Sân cầu lông tiêu chuẩn với sàn và hệ thống chiếu sáng chuyên nghiệp.`,
    status: i % 5 === 0 ? "maintenance" : "available",
}))

export default function CourtsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddCourtOpen, setIsAddCourtOpen] = useState(false)
    const [newCourt, setNewCourt] = useState({
        name: "",
        description: "",
    })

    // Lọc sân dựa trên truy vấn tìm kiếm
    const filteredCourts = courts.filter((court) => court.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const handleAddCourt = () => {
        // Trong ứng dụng thực tế, đây sẽ là một API call để thêm sân mới
        console.log("Thêm sân mới:", newCourt)
        setNewCourt({ name: "", description: "" })
        setIsAddCourtOpen(false)
    }

    // Ánh xạ trạng thái sang tiếng Việt
    const getStatusText = (status: string) => {
        switch (status) {
            case "available":
                return "Khả dụng"
            case "maintenance":
                return "Bảo trì"
            default:
                return status
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
                            <Dialog open={isAddCourtOpen} onOpenChange={setIsAddCourtOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Thêm Sân
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Thêm Sân Mới</DialogTitle>
                                        <DialogDescription>Nhập thông tin cho sân cầu lông mới.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Tên Sân</Label>
                                            <Input
                                                id="name"
                                                value={newCourt.name}
                                                onChange={(e) => setNewCourt({ ...newCourt, name: e.target.value })}
                                                placeholder="Sân 21"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="description">Mô Tả</Label>
                                            <Textarea
                                                id="description"
                                                value={newCourt.description}
                                                onChange={(e) => setNewCourt({ ...newCourt, description: e.target.value })}
                                                placeholder="Sân cầu lông tiêu chuẩn với sàn và hệ thống chiếu sáng chuyên nghiệp."
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsAddCourtOpen(false)}>
                                            Hủy
                                        </Button>
                                        <Button onClick={handleAddCourt}>Thêm Sân</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
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
                                    {filteredCourts.map((court) => (
                                        <TableRow key={court.id}>
                                            <TableCell className="font-medium">#{court.id}</TableCell>
                                            <TableCell>{court.name}</TableCell>
                                            <TableCell className="max-w-xs truncate">{court.description}</TableCell>
                                            <TableCell>
                                                <Badge variant={court.status === "available" ? "default" : "destructive"}>
                                                    {getStatusText(court.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button variant="outline" size="sm">
                                                        Sửa
                                                    </Button>
                                                    <Button variant={court.status === "available" ? "destructive" : "default"} size="sm">
                                                        {court.status === "available" ? "Đặt Bảo Trì" : "Đặt Khả Dụng"}
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
