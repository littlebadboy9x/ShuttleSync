"use client"

import React, { useState, useEffect } from 'react';
import { CustomerLayout } from '../../../components/customer-layout';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    Star,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    X,
    Eye,
    Download,
    Filter,
    Search,
    MoreVertical,
    Calendar as CalendarIcon,
    Timer,
    CreditCard,
    RefreshCw,
    MessageCircle,
    Phone
} from 'lucide-react';

interface BookingHistory {
    id: number;
    courtName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    status: string;
    amount: number;
    createdAt: string;
    notes?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    paymentAmount?: number;
}

const HistoryPage = () => {
    const [bookings, setBookings] = useState<BookingHistory[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<BookingHistory[]>([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBooking, setSelectedBooking] = useState<BookingHistory | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch booking history from Spring Boot backend directly
    useEffect(() => {
        const fetchBookingHistory = async () => {
            try {
                setIsLoading(true);
                
                // Lấy userId từ localStorage
                const userStr = localStorage.getItem('user');
                let userId = 3; // Default fallback
                
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        userId = user.id || user.userId || 3;
                        console.log('User from localStorage:', user);
                        console.log('Using userId:', userId);
                    } catch (e) {
                        console.warn('Error parsing user from localStorage:', e);
                    }
                }
                
                // Gọi endpoint mới với POST method
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/customer/bookings/history-simple`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: userId })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    console.log('Booking data from backend:', result.data);
                    console.log('Total bookings for userId', userId, ':', result.data.length);
                    // Debug status and payment values
                    result.data.forEach((booking: any, index: number) => {
                        console.log(`Booking ${index + 1}:`, {
                            id: booking.id,
                            status: booking.status,
                            paymentStatus: booking.paymentStatus,
                            paymentMethod: booking.paymentMethod,
                            paymentAmount: booking.paymentAmount
                        });
                    });
                    setBookings(result.data);
                    setFilteredBookings(result.data);
                } else {
                    console.error('Failed to fetch booking history:', result.message);
                }
            } catch (error) {
                console.error('Error fetching booking history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookingHistory();
    }, []);

    useEffect(() => {
        let filtered = bookings;

        // Status mapping
        const statusMapping: { [key: string]: string } = {
            'Pending': 'pending', 'Confirmed': 'confirmed', 'Completed': 'completed', 'Cancelled': 'cancelled',
            'Active': 'confirmed', 'Finished': 'completed', 'Canceled': 'cancelled',
            'Chờ xác nhận': 'pending', 'Đã xác nhận': 'confirmed', 'Hoàn thành': 'completed', 'Đã hủy': 'cancelled',
            'Chưa thanh toán': 'pending', 'Đã thanh toán': 'confirmed', 'Tiền mặt': 'confirmed', 'Chưa chọn': 'pending',
            'pending': 'pending', 'confirmed': 'confirmed', 'completed': 'completed', 'cancelled': 'cancelled',
            'active': 'confirmed', 'finished': 'completed', 'canceled': 'cancelled'
        };

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter(booking => (statusMapping[booking.status] || 'pending') === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(booking => 
                booking.courtName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredBookings(filtered);
    }, [statusFilter, searchTerm, bookings]);

    const getStatusBadge = (status: string) => {
        console.log('Status received:', status, typeof status); // Debug log
        
        // Map backend status to frontend status - bao gồm nhiều trường hợp
        const statusMapping: { [key: string]: string } = {
            // English variants
            'Pending': 'pending',
            'Confirmed': 'confirmed', 
            'Completed': 'completed',
            'Cancelled': 'cancelled',
            'Active': 'confirmed',
            'Finished': 'completed',
            'Canceled': 'cancelled',
            // Vietnamese variants
            'Chờ xác nhận': 'pending',
            'Đã xác nhận': 'confirmed',
            'Hoàn thành': 'completed',
            'Đã hủy': 'cancelled',
            'Chưa thanh toán': 'pending',
            'Đã thanh toán': 'confirmed',
            'Tiền mặt': 'confirmed',
            'Chưa chọn': 'pending',
            // Lowercase variants
            'pending': 'pending',
            'confirmed': 'confirmed',
            'completed': 'completed', 
            'cancelled': 'cancelled',
            'active': 'confirmed',
            'finished': 'completed',
            'canceled': 'cancelled'
        };

        const statusConfig = {
            confirmed: { 
                color: "bg-blue-100 text-blue-800 border-blue-200", 
                icon: CheckCircle, 
                text: "Đã xác nhận" 
            },
            pending: { 
                color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
                icon: AlertCircle, 
                text: "Chờ xác nhận" 
            },
            completed: { 
                color: "bg-green-100 text-green-800 border-green-200", 
                icon: CheckCircle, 
                text: "Hoàn thành" 
            },
            cancelled: { 
                color: "bg-red-100 text-red-800 border-red-200", 
                icon: X, 
                text: "Đã hủy" 
            }
        };

        const mappedStatus = statusMapping[status] || 'pending';
        const config = statusConfig[mappedStatus as keyof typeof statusConfig];
        
        if (!config) {
            // Fallback nếu không tìm thấy config
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {status}
                </span>
            );
        }

        const IconComponent = config.icon;
        
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                <IconComponent className="w-3 h-3 mr-1" />
                {config.text}
            </span>
        );
    };

    const getPaymentStatusBadge = (booking: BookingHistory) => {
        // Lấy trạng thái thanh toán trực tiếp từ database (PaymentStatusTypes)
        const paymentStatus = booking.paymentStatus;
        
        // Map booking status để kiểm tra cancelled
        const statusMapping: { [key: string]: string } = {
            'Pending': 'pending', 'Confirmed': 'confirmed', 'Completed': 'completed', 'Cancelled': 'cancelled',
            'Active': 'confirmed', 'Finished': 'completed', 'Canceled': 'cancelled',
            'Chờ xác nhận': 'pending', 'Đã xác nhận': 'confirmed', 'Hoàn thành': 'completed', 'Đã hủy': 'cancelled'
        };
        const mappedStatus = statusMapping[booking.status] || 'pending';
        
        // Không hiển thị payment status cho booking đã hủy
        if (mappedStatus === 'cancelled') {
            return null;
        }
        
        // Kiểm tra payment status từ database PaymentStatusTypes
        if (paymentStatus) {
            // Handle encoding issues và các variations
            const isPaid = paymentStatus === 'Đã thanh toán' || 
                          paymentStatus === 'Da thanh toán' ||
                          paymentStatus === 'ÄÃ£ thanh toÃ¡n' || // UTF-8 encoding issue
                          paymentStatus === 'PAID' ||
                          paymentStatus === 'Paid';
            
            if (isPaid) {
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Đã thanh toán
                    </span>
                );
            }
        }
        
        // Mặc định: Chờ thanh toán
        return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                Chờ thanh toán
            </span>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStats = () => {
        const total = bookings.length;
        
        // Sử dụng mapping để check status
        const statusMapping: { [key: string]: string } = {
            'Pending': 'pending', 'Confirmed': 'confirmed', 'Completed': 'completed', 'Cancelled': 'cancelled',
            'Active': 'confirmed', 'Finished': 'completed', 'Canceled': 'cancelled',
            'Chờ xác nhận': 'pending', 'Đã xác nhận': 'confirmed', 'Hoàn thành': 'completed', 'Đã hủy': 'cancelled',
            'Chưa thanh toán': 'pending', 'Đã thanh toán': 'confirmed', 'Tiền mặt': 'confirmed', 'Chưa chọn': 'pending',
            'pending': 'pending', 'confirmed': 'confirmed', 'completed': 'completed', 'cancelled': 'cancelled',
            'active': 'confirmed', 'finished': 'completed', 'canceled': 'cancelled'
        };
        
        const completed = bookings.filter(b => (statusMapping[b.status] || 'pending') === 'completed').length;
        const pending = bookings.filter(b => (statusMapping[b.status] || 'pending') === 'pending').length;
        const cancelled = bookings.filter(b => (statusMapping[b.status] || 'pending') === 'cancelled').length;
        const totalSpent = bookings
            .filter(b => (statusMapping[b.status] || 'pending') === 'completed')
            .reduce((sum, b) => sum + b.amount, 0);

        return { total, completed, pending, cancelled, totalSpent };
    };

    const stats = getStats();

    const handleCancelBooking = async (bookingId: number) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setBookings(prev => prev.map(booking => 
            booking.id === bookingId 
                ? { ...booking, status: 'cancelled' }
                : booking
        ));
        
        setIsLoading(false);
        alert('Đã hủy đặt sân thành công!');
    };

    const BookingCard = ({ booking }: { booking: BookingHistory }) => {
        // Format date and time from backend data
        const formatDate = (dateString: string) => {
            try {
                return new Date(dateString).toLocaleDateString('vi-VN');
            } catch {
                return 'N/A';
            }
        };

        const formatTime = (startTime: string, endTime: string) => {
            try {
                return `${startTime} - ${endTime}`;
            } catch {
                return 'N/A';
            }
        };

        return (
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                {/* Header with court name and status */}
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-bold text-xl mb-1">{booking.courtName}</h3>
                            <p className="text-blue-100 text-sm">Booking #{booking.id}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                            {getStatusBadge(booking.status)}
                            {getPaymentStatusBadge(booking) && getPaymentStatusBadge(booking)}
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-gray-600 text-sm">
                            <CalendarIcon size={16} className="mr-2 text-blue-500" />
                            <span>{formatDate(booking.bookingDate)}</span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                            <Timer size={16} className="mr-2 text-green-500" />
                            <span>{formatTime(booking.startTime, booking.endTime)}</span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                            <CreditCard size={16} className="mr-2 text-purple-500" />
                            <span>{(() => {
                                // Logic thông minh để hiển thị payment method
                                const hasPaymentInfo = booking.paymentMethod && booking.paymentAmount && booking.paymentAmount > 0;
                                const isPaidStatus = booking.paymentStatus && (
                                    booking.paymentStatus === 'Paid' || 
                                    booking.paymentStatus === 'Đã thanh toán' ||
                                    booking.paymentStatus === 'PAID' ||
                                    booking.paymentStatus === 'Success' ||
                                    booking.paymentStatus === 'COMPLETED'
                                );
                                
                                const statusMapping: { [key: string]: string } = {
                                    'Pending': 'pending', 'Confirmed': 'confirmed', 'Completed': 'completed', 'Cancelled': 'cancelled',
                                    'Active': 'confirmed', 'Finished': 'completed', 'Canceled': 'cancelled',
                                    'Chờ xác nhận': 'pending', 'Đã xác nhận': 'confirmed', 'Hoàn thành': 'completed', 'Đã hủy': 'cancelled'
                                };
                                const mappedStatus = statusMapping[booking.status] || 'pending';
                                
                                // 1. Nếu có payment data rõ ràng
                                if (hasPaymentInfo || isPaidStatus) {
                                    return booking.paymentMethod || 'MoMo';
                                }
                                
                                // 2. Nếu booking đã hoàn thành (legacy data)
                                if (mappedStatus === 'completed') {
                                    return 'Tiền mặt';
                                }
                                
                                // 3. Các trường hợp khác
                                return 'Chưa thanh toán';
                            })()}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {formatCurrency(booking.amount)}
                            </span>
                        </div>
                    </div>

                    {booking.notes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                                <strong>Ghi chú:</strong> {booking.notes}
                            </p>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                            Tạo lúc: {formatDate(booking.createdAt)}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowDetails(true);
                                }}
                                className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors hover:bg-blue-50 px-3 py-1 rounded-lg"
                            >
                                <Eye size={16} className="mr-1" />
                                Chi tiết
                            </button>
                            {(booking.status === 'Pending' || booking.status === 'pending') && (
                                <button
                                    onClick={() => handleCancelBooking(booking.id)}
                                    className="flex items-center text-red-600 hover:text-red-700 font-medium text-sm transition-colors hover:bg-red-50 px-3 py-1 rounded-lg"
                                >
                                    <X size={16} className="mr-1" />
                                    Hủy
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const StatCard = ({ title, value, icon: Icon, color, subtitle }: {
        title: string;
        value: string | number;
        icon: any;
        color: string;
        subtitle?: string;
    }) => (
        <div className="group">
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer`}>
                <div className="absolute -top-4 -right-4 opacity-10">
                    <Icon size={80} />
                </div>
                <div className="relative z-10">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm w-fit mb-3">
                        <Icon className="text-white" size={20} />
                    </div>
                    <h3 className="text-white text-3xl font-bold mb-1 leading-tight">{value}</h3>
                    <p className="text-white/90 text-sm font-medium">{title}</p>
                    {subtitle && (
                        <p className="text-white/70 text-xs mt-2">{subtitle}</p>
                    )}
                </div>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            </div>
        </div>
    );

    return (
        <CustomerLayout>
            <div className="p-6 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                        <Clock className="mr-3 text-blue-600" size={32} />
                        Lịch sử đặt sân
                    </h1>
                    <p className="text-gray-600">Xem và quản lý các lần đặt sân của bạn</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Tổng đặt sân"
                        value={stats.total}
                        icon={CalendarIcon}
                        color="from-blue-500 to-blue-600"
                        subtitle="Tất cả thời gian"
                    />
                    <StatCard
                        title="Hoàn thành"
                        value={stats.completed}
                        icon={CheckCircle}
                        color="from-green-500 to-emerald-600"
                        subtitle="Đã chơi xong"
                    />
                    <StatCard
                        title="Chờ xác nhận"
                        value={stats.pending}
                        icon={AlertCircle}
                        color="from-yellow-500 to-orange-600"
                        subtitle="Đang chờ"
                    />
                    <StatCard
                        title="Tổng chi tiêu"
                        value={formatCurrency(stats.totalSpent)}
                        icon={CreditCard}
                        color="from-purple-500 to-pink-600"
                        subtitle="Đã thanh toán"
                    />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên sân hoặc mã giao dịch..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                        </div>
                        <div className="lg:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="pending">Chờ xác nhận</option>
                                <option value="confirmed">Đã xác nhận</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                        </div>
                        <button
                            onClick={() => setIsLoading(true)}
                            className="lg:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                        >
                            <RefreshCw size={20} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Làm mới
                        </button>
                    </div>
                </div>

                {/* Bookings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking) => (
                            <BookingCard key={booking.id} booking={booking} />
                        ))
                    ) : (
                        <div className="col-span-full">
                            <div className="text-center py-12 bg-white rounded-2xl shadow-md border border-gray-100">
                                <CalendarIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-800 mb-2">Không có dữ liệu</h3>
                                <p className="text-gray-600">Không tìm thấy lịch sử đặt sân nào phù hợp</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Booking Details Modal */}
                {showDetails && selectedBooking && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-800">Chi tiết đặt sân</h3>
                                    <button
                                        onClick={() => setShowDetails(false)}
                                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6">
                                {/* Court Header */}
                                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-xl mb-1">{selectedBooking.courtName}</h3>
                                            <p className="text-blue-100 text-sm">Booking #{selectedBooking.id}</p>
                                        </div>
                                        <div>
                                            {getStatusBadge(selectedBooking.status)}
                                        </div>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-3">Thông tin sân</h4>
                                        <div className="space-y-2">
                                            <p><span className="text-gray-600">Tên sân:</span> <span className="font-medium">{selectedBooking.courtName}</span></p>
                                            <p><span className="text-gray-600">Loại sân:</span> <span className="font-medium">Sân cầu lông</span></p>
                                            <p><span className="text-gray-600">Ngày chơi:</span> <span className="font-medium">{(() => {
                                                try {
                                                    return new Date(selectedBooking.bookingDate).toLocaleDateString('vi-VN');
                                                } catch {
                                                    return 'N/A';
                                                }
                                            })()}</span></p>
                                            <p><span className="text-gray-600">Giờ chơi:</span> <span className="font-medium">{(() => {
                                                try {
                                                    return `${selectedBooking.startTime} - ${selectedBooking.endTime}`;
                                                } catch {
                                                    return 'N/A';
                                                }
                                            })()}</span></p>
                                            <p><span className="text-gray-600">Thời lượng:</span> <span className="font-medium">1 giờ</span></p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-3">Thông tin thanh toán</h4>
                                        <div className="space-y-2">
                                            <p><span className="text-gray-600">Ngày đặt:</span> <span className="font-medium">{(() => {
                                                try {
                                                    return new Date(selectedBooking.createdAt).toLocaleDateString('vi-VN');
                                                } catch {
                                                    return 'N/A';
                                                }
                                            })()}</span></p>
                                            <p><span className="text-gray-600">Mã giao dịch:</span> <span className="font-medium">#{selectedBooking.id}</span></p>
                                            <p><span className="text-gray-600">Phương thức:</span> <span className="font-medium">{selectedBooking.paymentMethod || 'MoMo'}</span></p>
                                            <p><span className="text-gray-600">Tổng tiền:</span> <span className="font-bold text-blue-600">{formatCurrency(selectedBooking.amount)}</span></p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
                                    <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                                        <Download size={16} className="mr-2" />
                                        Tải hóa đơn
                                    </button>
                                    <button className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium">
                                        <MessageCircle size={16} className="mr-2" />
                                        Liên hệ hỗ trợ
                                    </button>
                                    <button className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium">
                                        <Phone size={16} className="mr-2" />
                                        Gọi hotline
                                    </button>
                                    {selectedBooking.status === 'pending' && (
                                        <button 
                                            onClick={() => {
                                                handleCancelBooking(selectedBooking.id);
                                                setShowDetails(false);
                                            }}
                                            className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                                        >
                                            <X size={16} className="mr-2" />
                                            Hủy đặt sân
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
};

export default HistoryPage; 