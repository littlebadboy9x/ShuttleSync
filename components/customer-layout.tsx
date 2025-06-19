"use client"

import { useState, ReactNode, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    Home,
    Calendar,
    History,
    User,
    CreditCard,
    Bell,
    Settings,
    Menu,
    X,
    LogOut,
    Activity,
    Search,
    Crown,
    Zap,
    Phone,
    Mail,
    MapPin,
    Facebook,
    Instagram,
    Twitter,
    ChevronDown,
    Clock
} from "lucide-react"

interface CustomerLayoutProps {
    children: ReactNode
}

interface UserData {
    id: number
    email: string
    fullName: string
    role: string
    token: string
    refreshToken: string
}

const navigation = [
    {
        name: "Trang chủ",
        href: "/customer/dashboard",
        icon: Home,
        description: "Tổng quan và khuyến mãi"
    },
    {
        name: "Đặt sân",
        href: "/customer/booking",
        icon: Calendar,
        description: "Đặt sân cầu lông ngay"
    },
    {
        name: "Hóa đơn",
        href: "/customer/payment",
        icon: CreditCard,
        description: "Xem hóa đơn chờ thanh toán"
    }
]

export function CustomerLayout({ children }: CustomerLayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [user, setUser] = useState<UserData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [unreadNotifications, setUnreadNotifications] = useState(0)
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        // Kiểm tra authentication
        const userData = localStorage.getItem("user")
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData)
                setUser(parsedUser)
                
                // Fetch unread notifications count
                fetchUnreadNotificationsCount(parsedUser.id || parsedUser.userId || 3)
            } catch (error) {
                console.error("Error parsing user data:", error)
                router.push("/login")
            }
        } else {
            router.push("/login")
        }
        setIsLoading(false)
    }, [router])

    const fetchUnreadNotificationsCount = async (userId: number) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/customer/notifications/unread-count`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userId })
            });
            
            const result = await response.json();
            if (result.success) {
                setUnreadNotifications(result.count);
            }
        } catch (error) {
            console.error('Error fetching unread notifications count:', error);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("user")
        document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        router.push("/login")
    }

    // Mock additional user data
    const userProfile = {
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        membershipLevel: "Gold",
        points: 2450,
        membershipIcon: Crown,
        membershipColor: "text-yellow-500"
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-16 h-16 mb-4 mx-auto">
                        <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                        <Activity className="absolute inset-0 m-auto text-blue-600" size={24} />
                    </div>
                    <p className="text-gray-600 font-medium">Đang tải...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Header */}
            <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
                {/* Top bar with contact info */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                    <Phone size={14} />
                                    <span>Hotline: 1900-123-456</span>
                                </div>
                                <div className="hidden md:flex items-center space-x-2">
                                    <Clock size={14} />
                                    <span>Mở cửa: 5:00 - 23:00 hàng ngày</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="hidden md:flex items-center space-x-3">
                                    <Facebook size={16} className="hover:text-blue-200 cursor-pointer transition-colors" />
                                    <Instagram size={16} className="hover:text-pink-200 cursor-pointer transition-colors" />
                                    <Twitter size={16} className="hover:text-blue-200 cursor-pointer transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main header */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/customer/dashboard" className="flex items-center space-x-3 group">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                                        <Activity className="text-white" size={20} />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        ShuttleSync
                                    </h1>
                                    <p className="text-xs text-gray-500 -mt-1">Sân cầu lông cao cấp</p>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href
                                const Icon = item.icon
                                
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "relative flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 group",
                                            isActive
                                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                                                : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                                        )}
                                    >
                                        <Icon size={18} className={cn(
                                            "transition-colors",
                                            isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500"
                                        )} />
                                        <span>{item.name}</span>
                                        {isActive && (
                                            <div className="absolute inset-0 bg-white/10 rounded-full"></div>
                                        )}
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* Right side */}
                        <div className="flex items-center space-x-4">
                            {/* Search */}
                            <div className="hidden lg:block relative">
                                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Tìm sân, dịch vụ..."
                                    className="pl-10 pr-4 py-2 w-64 bg-gray-50 rounded-full border-0 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:shadow-lg transition-all duration-200 text-sm"
                                />
                            </div>

                            {/* Notifications */}
                            <Link
                                href="/customer/notifications"
                                className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
                            >
                                <Bell size={20} />
                                {unreadNotifications > 0 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                    </div>
                                )}
                            </Link>

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center space-x-3 p-2 rounded-full hover:bg-gray-50 transition-colors"
                                >
                                    <div className="relative">
                                        <img 
                                            src={userProfile.avatar} 
                                            alt={user.fullName}
                                            className="w-8 h-8 rounded-full ring-2 ring-blue-500"
                                        />
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-semibold text-gray-800">{user.fullName}</p>
                                        <div className="flex items-center space-x-1">
                                            <Crown size={12} className="text-yellow-500" />
                                            <span className="text-xs text-gray-500">{userProfile.membershipLevel}</span>
                                        </div>
                                    </div>
                                    <ChevronDown size={16} className={cn(
                                        "text-gray-400 transition-transform duration-200",
                                        userMenuOpen ? "rotate-180" : ""
                                    )} />
                                </button>

                                {/* User Dropdown */}
                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <div className="flex items-center space-x-3">
                                                <img 
                                                    src={userProfile.avatar} 
                                                    alt={user.fullName}
                                                    className="w-12 h-12 rounded-full"
                                                />
                                                <div>
                                                    <p className="font-semibold text-gray-800">{user.fullName}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-lg">
                                                            <Crown size={12} className="text-yellow-600" />
                                                            <span className="text-xs text-yellow-700 font-medium ml-1">{userProfile.membershipLevel}</span>
                                                        </div>
                                                        <div className="flex items-center bg-blue-100 px-2 py-1 rounded-lg">
                                                            <Zap size={12} className="text-blue-600" />
                                                            <span className="text-xs text-blue-700 font-medium ml-1">{userProfile.points} điểm</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="py-2">
                                            <Link
                                                href="/customer/profile"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <User size={16} className="mr-3 text-gray-400" />
                                                Thông tin cá nhân
                                            </Link>
                                            <Link
                                                href="/customer/notifications"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <Bell size={16} className="mr-3 text-gray-400" />
                                                Thông báo
                                                {unreadNotifications > 0 && (
                                                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                        {unreadNotifications}
                                                    </span>
                                                )}
                                            </Link>
                                            <Link
                                                href="/customer/settings"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <Settings size={16} className="mr-3 text-gray-400" />
                                                Cài đặt
                                            </Link>
                                        </div>
                                        
                                        <div className="border-t border-gray-100 py-2">
                                            <button
                                                onClick={() => {
                                                    setUserMenuOpen(false)
                                                    handleLogout()
                                                }}
                                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut size={16} className="mr-3" />
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
                        <div className="px-4 py-4 space-y-2">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href
                                const Icon = item.icon
                                
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors",
                                            isActive
                                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                                : "text-gray-700 hover:bg-gray-50"
                                        )}
                                    >
                                        <Icon size={20} />
                                        <div>
                                            <div className="font-medium">{item.name}</div>
                                            <div className={cn(
                                                "text-xs",
                                                isActive ? "text-blue-100" : "text-gray-500"
                                            )}>
                                                {item.description}
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                        
                        {/* Mobile Search */}
                        <div className="px-4 pb-4">
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Tìm sân, dịch vụ..."
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-0 focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="min-h-[calc(100vh-200px)]">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Company Info */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                    <Activity className="text-white" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        ShuttleSync
                                    </h3>
                                    <p className="text-xs text-gray-500">Sân cầu lông cao cấp</p>
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Hệ thống sân cầu lông hiện đại với dịch vụ đặt sân trực tuyến tiện lợi. 
                                Mang đến trải nghiệm thể thao tuyệt vời cho mọi khách hàng.
                            </p>
                            <div className="flex space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center hover:bg-blue-200 cursor-pointer transition-colors">
                                    <Facebook size={16} className="text-blue-600" />
                                </div>
                                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center hover:bg-pink-200 cursor-pointer transition-colors">
                                    <Instagram size={16} className="text-pink-600" />
                                </div>
                                <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center hover:bg-sky-200 cursor-pointer transition-colors">
                                    <Twitter size={16} className="text-sky-600" />
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-4">Liên kết nhanh</h4>
                            <ul className="space-y-2">
                                {navigation.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className="text-gray-600 hover:text-blue-600 text-sm transition-colors"
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-4">Liên hệ</h4>
                            <ul className="space-y-3">
                                <li className="flex items-center space-x-3 text-sm text-gray-600">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Phone size={14} className="text-green-600" />
                                    </div>
                                    <span>Hotline: 1900-123-456</span>
                                </li>
                                <li className="flex items-center space-x-3 text-sm text-gray-600">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Mail size={14} className="text-blue-600" />
                                    </div>
                                    <span>info@shuttlesync.com</span>
                                </li>
                                <li className="flex items-center space-x-3 text-sm text-gray-600">
                                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                        <MapPin size={14} className="text-red-600" />
                                    </div>
                                    <span>123 Đường ABC, Quận 1, TP.HCM</span>
                                </li>
                                <li className="flex items-center space-x-3 text-sm text-gray-600">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Clock size={14} className="text-purple-600" />
                                    </div>
                                    <span>Mở cửa: 5:00 - 23:00</span>
                                </li>
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-4">Nhận thông tin mới</h4>
                            <p className="text-sm text-gray-600 mb-4">
                                Đăng ký để nhận thông tin khuyến mãi và ưu đãi mới nhất
                            </p>
                            <div className="space-y-3">
                                <input
                                    type="email"
                                    placeholder="Email của bạn"
                                    className="w-full px-4 py-2 bg-gray-50 rounded-lg border-0 focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200">
                                    Đăng ký ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
                            <p>© 2024 ShuttleSync. Tất cả quyền được bảo lưu.</p>
                            <div className="flex space-x-6 mt-2 md:mt-0">
                                <Link href="#" className="hover:text-blue-600 transition-colors">Điều khoản sử dụng</Link>
                                <Link href="#" className="hover:text-blue-600 transition-colors">Chính sách bảo mật</Link>
                                <Link href="#" className="hover:text-blue-600 transition-colors">Hỗ trợ</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Click outside to close user menu */}
            {userMenuOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setUserMenuOpen(false)}
                />
            )}
        </div>
    )
}
