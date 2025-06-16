"use client"

import React, { useState, useEffect } from 'react';
import { CustomerLayout } from '../../../components/customer-layout';
import { 
    Bell, 
    CheckCircle, 
    AlertCircle, 
    X,
    Eye,
    Trash2,
    Filter,
    Search,
    Calendar,
    Clock,
    Mail,
    MailOpen,
    RefreshCw
} from 'lucide-react';

interface Notification {
    id: number;
    message: string;
    isRead: boolean;
    createdAt: string;
    type?: string;
}

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState("all"); // all, read, unread
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Fetch notifications from backend
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setIsLoading(true);
                
                // Lấy userId từ localStorage
                const userStr = localStorage.getItem('user');
                let userId = 3; // Default fallback
                
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        userId = user.id || user.userId || 3;
                    } catch (e) {
                        console.warn('Error parsing user from localStorage:', e);
                    }
                }
                
                // Gọi API lấy notifications
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/customer/notifications`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: userId })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    console.log('Notifications from backend:', result.data);
                    setNotifications(result.data);
                    setFilteredNotifications(result.data);
                } else {
                    console.error('Failed to fetch notifications:', result.message);
                    // Fallback với mock data
                    const mockNotifications = [
                        {
                            id: 1,
                            message: "Đặt sân của bạn đã được xác nhận. Vui lòng tiến hành thanh toán.",
                            isRead: false,
                            createdAt: new Date().toISOString(),
                            type: "booking_confirmed"
                        },
                        {
                            id: 2,
                            message: "Bạn có hóa đơn chưa thanh toán. Vui lòng thanh toán trước 24h.",
                            isRead: false,
                            createdAt: new Date(Date.now() - 3600000).toISOString(),
                            type: "payment_reminder"
                        },
                        {
                            id: 3,
                            message: "Cảm ơn bạn đã thanh toán. Đặt sân #25 đã hoàn tất.",
                            isRead: true,
                            createdAt: new Date(Date.now() - 86400000).toISOString(),
                            type: "payment_success"
                        }
                    ];
                    setNotifications(mockNotifications);
                    setFilteredNotifications(mockNotifications);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
                // Fallback với mock data
                const mockNotifications = [
                    {
                        id: 1,
                        message: "Đặt sân của bạn đã được xác nhận. Vui lòng tiến hành thanh toán.",
                        isRead: false,
                        createdAt: new Date().toISOString(),
                        type: "booking_confirmed"
                    },
                    {
                        id: 2,
                        message: "Bạn có hóa đơn chưa thanh toán. Vui lòng thanh toán trước 24h.",
                        isRead: false,
                        createdAt: new Date(Date.now() - 3600000).toISOString(),
                        type: "payment_reminder"
                    }
                ];
                setNotifications(mockNotifications);
                setFilteredNotifications(mockNotifications);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    // Filter notifications
    useEffect(() => {
        let filtered = notifications;

        // Filter by read status
        if (filter === "read") {
            filtered = filtered.filter(n => n.isRead);
        } else if (filter === "unread") {
            filtered = filtered.filter(n => !n.isRead);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(n => 
                n.message.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredNotifications(filtered);
    }, [filter, searchTerm, notifications]);

    const markAsRead = async (notificationId: number) => {
        try {
            // Gọi API mark as read
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/customer/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                // Update local state
                setNotifications(prev => 
                    prev.map(n => 
                        n.id === notificationId ? { ...n, isRead: true } : n
                    )
                );
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            // Update local state anyway
            setNotifications(prev => 
                prev.map(n => 
                    n.id === notificationId ? { ...n, isRead: true } : n
                )
            );
        }
    };

    const deleteNotification = async (notificationId: number) => {
        try {
            // Gọi API delete
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/customer/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                // Update local state
                setNotifications(prev => prev.filter(n => n.id !== notificationId));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            // Update local state anyway
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        }
    };

    const markAllAsRead = async () => {
        try {
            // Lấy userId từ localStorage
            const userStr = localStorage.getItem('user');
            let userId = 3;
            
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    userId = user.id || user.userId || 3;
                } catch (e) {
                    console.warn('Error parsing user from localStorage:', e);
                }
            }
            
            // Gọi API mark all as read
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/customer/notifications/mark-all-read`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userId })
            });
            
            if (response.ok) {
                // Update local state
                setNotifications(prev => 
                    prev.map(n => ({ ...n, isRead: true }))
                );
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            // Update local state anyway
            setNotifications(prev => 
                prev.map(n => ({ ...n, isRead: true }))
            );
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            return "Vừa xong";
        } else if (diffInHours < 24) {
            return `${diffInHours} giờ trước`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays < 7) {
                return `${diffInDays} ngày trước`;
            } else {
                return date.toLocaleDateString('vi-VN');
            }
        }
    };

    const getNotificationIcon = (type?: string, isRead?: boolean) => {
        if (type === "booking_confirmed") {
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        } else if (type === "payment_reminder") {
            return <AlertCircle className="h-5 w-5 text-orange-500" />;
        } else if (type === "payment_success") {
            return <CheckCircle className="h-5 w-5 text-blue-500" />;
        } else if (type === "booking_cancelled") {
            return <X className="h-5 w-5 text-red-500" />;
        } else {
            return isRead ? <MailOpen className="h-5 w-5 text-gray-400" /> : <Mail className="h-5 w-5 text-blue-500" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <CustomerLayout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                    <Bell className="h-8 w-8 mr-3 text-blue-600" />
                                    Thông báo
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Bạn có {unreadCount} thông báo chưa đọc
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={markAllAsRead}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                    disabled={unreadCount === 0}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Đánh dấu tất cả đã đọc
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Làm mới
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setFilter("all")}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        filter === "all" 
                                            ? "bg-blue-600 text-white" 
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    Tất cả ({notifications.length})
                                </button>
                                <button
                                    onClick={() => setFilter("unread")}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        filter === "unread" 
                                            ? "bg-blue-600 text-white" 
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    Chưa đọc ({unreadCount})
                                </button>
                                <button
                                    onClick={() => setFilter("read")}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        filter === "read" 
                                            ? "bg-blue-600 text-white" 
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    Đã đọc ({notifications.length - unreadCount})
                                </button>
                            </div>
                            
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm thông báo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="text-center py-12">
                                <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                                <p className="text-gray-600">Đang tải thông báo...</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="text-center py-12">
                                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Không có thông báo</h3>
                                <p className="text-gray-600">
                                    {filter === "all" 
                                        ? "Bạn chưa có thông báo nào." 
                                        : filter === "unread"
                                        ? "Bạn không có thông báo chưa đọc nào."
                                        : "Bạn không có thông báo đã đọc nào."
                                    }
                                </p>
                            </div>
                        ) : (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${
                                        notification.isRead 
                                            ? "border-gray-200" 
                                            : "border-blue-200 bg-blue-50/30"
                                    }`}
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4 flex-1">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getNotificationIcon(notification.type, notification.isRead)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${
                                                        notification.isRead 
                                                            ? "text-gray-700" 
                                                            : "text-gray-900 font-medium"
                                                    }`}>
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center mt-2 text-xs text-gray-500">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {formatDate(notification.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2 ml-4">
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Đánh dấu đã đọc"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa thông báo"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
};

export default NotificationsPage; 