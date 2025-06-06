"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Save, 
  Settings, 
  Bell, 
  Mail, 
  ShieldCheck, 
  CreditCard, 
  Building, 
  User, 
  Globe,
  CheckCircle
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveSettings = () => {
    setIsSaving(true)
    // Mô phỏng việc lưu cài đặt
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Cài đặt đã được lưu",
        description: "Các thay đổi của bạn đã được cập nhật thành công.",
        variant: "default",
      })
    }, 1000)
  }

  return (
    <AdminLayout>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-600 bg-clip-text text-transparent mb-2">
              Cài Đặt Hệ Thống
            </h1>
            <p className="text-slate-600 text-lg">
              Quản lý cài đặt và tùy chỉnh hệ thống ShuttleSync
            </p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-slate-200/50 overflow-x-auto">
              <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <TabsTrigger value="general" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Settings className="h-4 w-4 mr-2" />
                  Chung
                </TabsTrigger>
                <TabsTrigger value="company" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Building className="h-4 w-4 mr-2" />
                  Công ty
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Bell className="h-4 w-4 mr-2" />
                  Thông báo
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Bảo mật
                </TabsTrigger>
                <TabsTrigger value="payment" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Thanh toán
                </TabsTrigger>
              </TabsList>
            </div>

            {/* General Settings */}
            <TabsContent value="general">
              <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                    <Settings className="h-6 w-6 mr-2 text-blue-600" />
                    Cài Đặt Chung
                  </CardTitle>
                  <CardDescription>
                    Quản lý các cài đặt chung cho hệ thống
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="site-name">Tên trang web</Label>
                      <Input id="site-name" defaultValue="ShuttleSync - Hệ thống đặt sân cầu lông" />
                      <p className="text-sm text-slate-500">
                        Tên hiển thị trên trình duyệt và các ứng dụng
                      </p>
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="timezone">Múi giờ</Label>
                      <Select defaultValue="Asia/Ho_Chi_Minh">
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Chọn múi giờ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Ho_Chi_Minh">Hồ Chí Minh (GMT+7)</SelectItem>
                          <SelectItem value="Asia/Bangkok">Bangkok (GMT+7)</SelectItem>
                          <SelectItem value="Asia/Singapore">Singapore (GMT+8)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Tokyo (GMT+9)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-slate-500">
                        Múi giờ được sử dụng cho tất cả các ngày và giờ hiển thị
                      </p>
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="language">Ngôn ngữ mặc định</Label>
                      <Select defaultValue="vi">
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Chọn ngôn ngữ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vi">Tiếng Việt</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-slate-500">
                        Ngôn ngữ mặc định cho người dùng mới
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenance-mode">Chế độ bảo trì</Label>
                        <p className="text-sm text-slate-500">
                          Khi bật, người dùng sẽ thấy thông báo bảo trì
                        </p>
                      </div>
                      <Switch id="maintenance-mode" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Company Settings */}
            <TabsContent value="company">
              <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                    <Building className="h-6 w-6 mr-2 text-blue-600" />
                    Thông Tin Công Ty
                  </CardTitle>
                  <CardDescription>
                    Quản lý thông tin công ty và liên hệ
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="company-name">Tên công ty</Label>
                      <Input id="company-name" defaultValue="ShuttleSync Sports JSC" />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="company-address">Địa chỉ</Label>
                      <Textarea id="company-address" defaultValue="123 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh" />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="company-phone">Số điện thoại</Label>
                        <Input id="company-phone" defaultValue="(+84) 28 1234 5678" />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="company-email">Email</Label>
                        <Input id="company-email" defaultValue="contact@shuttlesync.com" type="email" />
                      </div>
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="tax-id">Mã số thuế</Label>
                      <Input id="tax-id" defaultValue="0123456789" />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" defaultValue="https://shuttlesync.com" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                    <Bell className="h-6 w-6 mr-2 text-blue-600" />
                    Cài Đặt Thông Báo
                  </CardTitle>
                  <CardDescription>
                    Quản lý cách thức gửi thông báo đến người dùng và quản trị viên
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-900">Thông báo đến người dùng</h3>
                    
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <div className="font-medium">Xác nhận đặt sân</div>
                        <div className="text-sm text-slate-500">Gửi thông báo khi đặt sân được xác nhận</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch id="booking-email" defaultChecked />
                          <Label htmlFor="booking-email" className="text-sm">Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="booking-sms" />
                          <Label htmlFor="booking-sms" className="text-sm">SMS</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <div className="font-medium">Nhắc nhở lịch đặt sân</div>
                        <div className="text-sm text-slate-500">Gửi thông báo nhắc nhở trước khi đến giờ đặt sân</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch id="reminder-email" defaultChecked />
                          <Label htmlFor="reminder-email" className="text-sm">Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="reminder-sms" defaultChecked />
                          <Label htmlFor="reminder-sms" className="text-sm">SMS</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <div className="font-medium">Hủy đặt sân</div>
                        <div className="text-sm text-slate-500">Gửi thông báo khi đặt sân bị hủy</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch id="cancel-email" defaultChecked />
                          <Label htmlFor="cancel-email" className="text-sm">Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="cancel-sms" />
                          <Label htmlFor="cancel-sms" className="text-sm">SMS</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-medium text-slate-900">Thông báo đến quản trị viên</h3>
                    
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <div className="font-medium">Đặt sân mới</div>
                        <div className="text-sm text-slate-500">Gửi thông báo khi có đặt sân mới</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch id="admin-booking-email" defaultChecked />
                          <Label htmlFor="admin-booking-email" className="text-sm">Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="admin-booking-system" defaultChecked />
                          <Label htmlFor="admin-booking-system" className="text-sm">Hệ thống</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <div className="font-medium">Báo cáo hàng ngày</div>
                        <div className="text-sm text-slate-500">Gửi báo cáo tổng hợp hàng ngày</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch id="admin-report-email" defaultChecked />
                          <Label htmlFor="admin-report-email" className="text-sm">Email</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security">
              <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                    <ShieldCheck className="h-6 w-6 mr-2 text-blue-600" />
                    Cài Đặt Bảo Mật
                  </CardTitle>
                  <CardDescription>
                    Quản lý các cài đặt bảo mật và quyền truy cập
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="2fa">Xác thực hai yếu tố (2FA)</Label>
                        <p className="text-sm text-slate-500">
                          Yêu cầu xác thực hai yếu tố cho tất cả tài khoản quản trị viên
                        </p>
                      </div>
                      <Switch id="2fa" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="password-expiry">Hết hạn mật khẩu</Label>
                        <p className="text-sm text-slate-500">
                          Yêu cầu đổi mật khẩu sau 90 ngày
                        </p>
                      </div>
                      <Switch id="password-expiry" />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="password-length">Độ dài mật khẩu tối thiểu</Label>
                      <Select defaultValue="8">
                        <SelectTrigger id="password-length">
                          <SelectValue placeholder="Chọn độ dài" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 ký tự</SelectItem>
                          <SelectItem value="8">8 ký tự</SelectItem>
                          <SelectItem value="10">10 ký tự</SelectItem>
                          <SelectItem value="12">12 ký tự</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="session-timeout">Thời gian hết phiên</Label>
                        <p className="text-sm text-slate-500">
                          Tự động đăng xuất sau thời gian không hoạt động
                        </p>
                      </div>
                      <Select defaultValue="30">
                        <SelectTrigger id="session-timeout" className="w-[180px]">
                          <SelectValue placeholder="Chọn thời gian" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 phút</SelectItem>
                          <SelectItem value="30">30 phút</SelectItem>
                          <SelectItem value="60">1 giờ</SelectItem>
                          <SelectItem value="120">2 giờ</SelectItem>
                          <SelectItem value="never">Không bao giờ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Settings */}
            <TabsContent value="payment">
              <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                    <CreditCard className="h-6 w-6 mr-2 text-blue-600" />
                    Cài Đặt Thanh Toán
                  </CardTitle>
                  <CardDescription>
                    Quản lý các phương thức thanh toán và cài đặt liên quan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-900">Phương thức thanh toán</h3>
                    
                    <div className="flex items-center justify-between py-3 border-b">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-red-100 rounded-md flex items-center justify-center text-red-600 font-bold">
                          M
                        </div>
                        <div>
                          <div className="font-medium">MoMo</div>
                          <div className="text-sm text-slate-500">Thanh toán qua ví điện tử MoMo</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="momo-enabled" defaultChecked />
                        <Label htmlFor="momo-enabled" className="text-sm">Bật</Label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-md flex items-center justify-center text-blue-600 font-bold">
                          V
                        </div>
                        <div>
                          <div className="font-medium">VNPAY</div>
                          <div className="text-sm text-slate-500">Thanh toán qua cổng VNPAY</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="vnpay-enabled" defaultChecked />
                        <Label htmlFor="vnpay-enabled" className="text-sm">Bật</Label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-green-100 rounded-md flex items-center justify-center text-green-600 font-bold">
                          T
                        </div>
                        <div>
                          <div className="font-medium">Tiền mặt</div>
                          <div className="text-sm text-slate-500">Thanh toán trực tiếp tại sân</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="cash-enabled" defaultChecked />
                        <Label htmlFor="cash-enabled" className="text-sm">Bật</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-medium text-slate-900">Cấu hình thanh toán</h3>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="deposit-percent">Yêu cầu đặt cọc</Label>
                      <Select defaultValue="30">
                        <SelectTrigger id="deposit-percent">
                          <SelectValue placeholder="Chọn tỷ lệ đặt cọc" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Không yêu cầu</SelectItem>
                          <SelectItem value="30">30% giá trị</SelectItem>
                          <SelectItem value="50">50% giá trị</SelectItem>
                          <SelectItem value="100">100% giá trị</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-slate-500">
                        Tỷ lệ đặt cọc khi đặt sân
                      </p>
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="currency">Đơn vị tiền tệ</Label>
                      <Select defaultValue="VND">
                        <SelectTrigger id="currency">
                          <SelectValue placeholder="Chọn đơn vị tiền tệ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VND">VNĐ (Việt Nam Đồng)</SelectItem>
                          <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-8">
            <Button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  </span>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu cài đặt
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}