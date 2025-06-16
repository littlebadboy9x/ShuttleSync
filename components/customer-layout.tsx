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
    Star,
    Trophy,
    Search,
    Crown,
    Zap,
    Shield
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
        name: "Tổng quan",
        href: "/customer/dashboard",
        icon: Home,
        description: "Xem tổng quan hoạt động"
    },
    {
        name: "Đặt sân",
        href: "/customer/booking",
        icon: Calendar,
        description: "Đặt sân cầu lông"
    },
    {
        name: "Lịch sử",
        href: "/customer/history",
        icon: History,
        description: "Xem lịch sử đặt sân"
    },
    {
        name: "Hồ sơ",
        href: "/customer/profile",
        icon: User,
        description: "Quản lý thông tin cá nhân"
    },
    {
        name: "Thanh toán",
        href: "/customer/payment",
        icon: CreditCard,
        description: "Quản lý thanh toán"
    },
    {
        name: "Thông báo",
        href: "/customer/notifications",
        icon: Bell,
        description: "Xem thông báo"
    }
]

export function CustomerLayout({ children }: CustomerLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
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
        // Xóa cookie
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-16 h-16 mb-4 mx-auto">
                        <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                        <Activity className="absolute inset-0 m-auto text-blue-600" size={24} />
                    </div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden border-r border-gray-200/50",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-600 to-purple-600">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                            <Activity className="text-white" size={20} />
                        </div>
                        <div>
                            <span className="text-xl font-bold text-white">
                                ShuttleSync
                            </span>
                            <p className="text-xs text-blue-100">Hệ thống đặt sân</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <X size={20} className="text-white" />
                    </button>
                </div>
                <SidebarContent pathname={pathname} user={user} userProfile={userProfile} unreadNotifications={unreadNotifications} onLogout={handleLogout} />
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0">
                <div className="bg-white/95 backdrop-blur-xl shadow-xl border-r border-gray-200/50">
                    <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-600 to-purple-600">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                                <Activity className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">
                                    ShuttleSync
                                </h1>
                                <p className="text-xs text-blue-100">Hệ thống đặt sân cầu lông</p>
                            </div>
                        </div>
                    </div>
                    <SidebarContent pathname={pathname} user={user} userProfile={userProfile} unreadNotifications={unreadNotifications} onLogout={handleLogout} />
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-72">
                {/* Top header */}
                <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-30">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <Menu size={20} className="text-gray-600" />
                            </button>

                            {/* Search bar */}
                            <div className="flex-1 max-w-lg mx-4">
                                <div className="relative group">
                                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input 
                                        type="text" 
                                        placeholder="Tìm kiếm sân, dịch vụ, khuyến mãi..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border-0 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:shadow-lg transition-all duration-200 text-sm placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            {/* User menu */}
                            <div className="flex items-center space-x-3">
                                <button className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 relative group">
                                    <Bell size={18} />
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></span>
                                </button>
                                
                                <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                                    <div className="relative">
                                        <img 
                                            src={userProfile.avatar} 
                                            alt={user.fullName}
                                            className="w-9 h-9 rounded-full ring-2 ring-blue-500 shadow-md"
                                        />
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                                    </div>
                                    <div className="hidden md:block">
                                        <p className="text-sm font-semibold text-gray-800">{user.fullName}</p>
                                        <div className="flex items-center space-x-1">
                                            <Crown size={12} className="text-yellow-500" />
                                            <span className="text-xs text-gray-500 font-medium">{userProfile.membershipLevel} Member</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="min-h-[calc(100vh-4rem)]">
                    {children}
                </main>
            </div>
        </div>
    )
}

function SidebarContent({ pathname, user, userProfile, unreadNotifications, onLogout }: { 
    pathname: string, 
    user: UserData, 
    userProfile: any,
    unreadNotifications: number,
    onLogout: () => void 
}) {
    const MembershipIcon = userProfile.membershipIcon

    return (
        <div className="flex flex-col h-full">
            {/* User profile section */}
            <div className="p-6 border-b border-gray-200/50 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <img 
                            src={userProfile.avatar} 
                            alt={user.fullName}
                            className="w-14 h-14 rounded-2xl ring-2 ring-blue-500 shadow-lg"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{user.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <div className="flex items-center mt-2 space-x-2">
                            <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-lg">
                                <MembershipIcon size={12} className={userProfile.membershipColor} />
                                <span className="text-xs text-yellow-700 font-bold ml-1">{userProfile.membershipLevel}</span>
                            </div>
                            <div className="flex items-center bg-blue-100 px-2 py-1 rounded-lg">
                                <Zap size={12} className="text-blue-600" />
                                <span className="text-xs text-blue-700 font-bold ml-1">{userProfile.points}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    const isNotificationPage = item.href === "/customer/notifications"
                    
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden",
                                isActive
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]"
                                    : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 hover:scale-[1.01]"
                            )}
                        >
                            <Icon
                                className={cn(
                                    "mr-3 h-5 w-5 transition-all duration-200",
                                    isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500"
                                )}
                            />
                            <div className="flex-1">
                                <div className="font-medium">{item.name}</div>
                                <div className={cn(
                                    "text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                                    isActive ? "text-blue-100" : "text-gray-500"
                                )}>
                                    {item.description}
                                </div>
                            </div>
                            
                            {/* Notification badge */}
                            {isNotificationPage && unreadNotifications > 0 && (
                                <div className="ml-2">
                                    <div className={cn(
                                        "px-2 py-1 rounded-full text-xs font-bold min-w-[20px] text-center",
                                        isActive 
                                            ? "bg-white text-blue-600" 
                                            : "bg-red-500 text-white"
                                    )}>
                                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                                    </div>
                                </div>
                            )}
                            
                            {isActive && !isNotificationPage && (
                                <div className="ml-2">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                </div>
                            )}
                            {isActive && (
                                <div className="absolute inset-0 bg-white/10 rounded-xl"></div>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom section */}
            <div className="p-4 border-t border-gray-200/50 space-y-1">
                <Link
                    href="/customer/settings"
                    className="group flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                >
                    <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    <div>
                        <div className="font-medium">Cài đặt</div>
                        <div className="text-xs text-gray-500 group-hover:text-gray-600">Tùy chỉnh ứng dụng</div>
                    </div>
                </Link>
                <button 
                    onClick={onLogout}
                    className="w-full group flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                >
                    <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-600 transition-colors" />
                    <div className="text-left">
                        <div className="font-medium">Đăng xuất</div>
                        <div className="text-xs text-red-400 group-hover:text-red-500">Thoát khỏi tài khoản</div>
                    </div>
                </button>
            </div>
        </div>
    )
}
