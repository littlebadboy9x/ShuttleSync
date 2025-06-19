"use client"

import React, { useState } from 'react';
import { 
    MapPin, 
    Clock, 
    Calendar,
    Star,
    Tag,
    Plus,
    Minus,
    CreditCard,
    Gift,
    X,
    ShoppingCart,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

// Types
interface BookingSlot {
    courtId: number;
    timeSlotId: number;
    date: string;
    status: 'available' | 'booked' | 'unavailable' | 'selected';
    price: number;
    startTime: string;
    endTime: string;
}

interface Court {
    id: number;
    name: string;
    description: string;
    status: string;
}

interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
}

interface Voucher {
    id: number;
    code: string;
    name: string;
    description: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    minOrderAmount: number;
    maxDiscountAmount?: number;
}

interface BookingDetailsProps {
    selectedSlot: BookingSlot | null;
    selectedCourt: Court | null;
    onClose: () => void;
    onConfirm: (bookingData: any) => void;
    isVisible: boolean;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({
    selectedSlot,
    selectedCourt,
    onClose,
    onConfirm,
    isVisible
}) => {
    const [selectedServices, setSelectedServices] = useState<{[key: number]: number}>({});
    const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
    const [voucherCode, setVoucherCode] = useState('');
    const [bookingNotes, setBookingNotes] = useState('');
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Mock data - replace with API calls
    const mockServices: Service[] = [
        { id: 1, name: "Coca-Cola", description: "Lon Coca-Cola 330ml", price: 15000, category: "Đồ Uống" },
        { id: 2, name: "Nước suối", description: "Chai nước suối 500ml", price: 10000, category: "Đồ Uống" },
        { id: 3, name: "Thuê Vợt", description: "Thuê vợt cầu lông mỗi giờ", price: 30000, category: "Thuê Dụng Cụ" },
        { id: 4, name: "Thuê Khăn", description: "Thuê khăn thể thao", price: 10000, category: "Thuê Dụng Cụ" },
        { id: 5, name: "Nước tăng lực", description: "Lon nước tăng lực", price: 25000, category: "Đồ Uống" },
        { id: 6, name: "Giày cầu lông", description: "Thuê giày cầu lông", price: 50000, category: "Thuê Dụng Cụ" }
    ];

    const mockVouchers: Voucher[] = [
        { 
            id: 1, 
            code: "WELCOME10", 
            name: "Chào mừng khách hàng mới", 
            description: "Giảm 10% cho đơn hàng đầu tiên", 
            type: "PERCENTAGE", 
            value: 10, 
            minOrderAmount: 200000, 
            maxDiscountAmount: 50000 
        },
        { 
            id: 2, 
            code: "WEEKEND20", 
            name: "Khuyến mãi cuối tuần", 
            description: "Giảm 20% cho tất cả đặt sân vào cuối tuần", 
            type: "PERCENTAGE", 
            value: 20, 
            minOrderAmount: 300000, 
            maxDiscountAmount: 100000 
        },
        { 
            id: 3, 
            code: "HOLIDAY50K", 
            name: "Giảm giá ngày lễ", 
            description: "Giảm cố định 50,000 VNĐ cho các ngày lễ", 
            type: "FIXED", 
            value: 50000, 
            minOrderAmount: 150000 
        }
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const calculateSubtotal = () => {
        if (!selectedSlot) return 0;
        
        const courtPrice = selectedSlot.price;
        const servicesPrice = Object.entries(selectedServices).reduce((total, [serviceId, quantity]) => {
            const service = mockServices.find(s => s.id === parseInt(serviceId));
            return total + (service ? service.price * quantity : 0);
        }, 0);
        
        return courtPrice + servicesPrice;
    };

    const calculateDiscount = () => {
        if (!appliedVoucher) return 0;
        
        const subtotal = calculateSubtotal();
        
        if (appliedVoucher.type === 'PERCENTAGE') {
            const discount = (subtotal * appliedVoucher.value) / 100;
            return appliedVoucher.maxDiscountAmount ? Math.min(discount, appliedVoucher.maxDiscountAmount) : discount;
        } else {
            return appliedVoucher.value;
        }
    };

    const calculateTotal = () => {
        return Math.max(0, calculateSubtotal() - calculateDiscount());
    };

    const handleServiceChange = (serviceId: number, change: number) => {
        setSelectedServices(prev => {
            const current = prev[serviceId] || 0;
            const newQuantity = Math.max(0, current + change);
            
            if (newQuantity === 0) {
                const { [serviceId]: removed, ...rest } = prev;
                return rest;
            }
            
            return { ...prev, [serviceId]: newQuantity };
        });
    };

    const handleVoucherApply = () => {
        const voucher = mockVouchers.find(v => v.code === voucherCode.toUpperCase());
        if (voucher && calculateSubtotal() >= voucher.minOrderAmount) {
            setAppliedVoucher(voucher);
            setVoucherCode('');
            setShowVoucherModal(false);
        } else {
            alert('Mã voucher không hợp lệ hoặc đơn hàng chưa đạt giá trị tối thiểu!');
        }
    };

    const handleConfirmBooking = async () => {
        if (!selectedSlot || !selectedCourt) return;
        
        setIsLoading(true);
        
        const bookingData = {
            courtId: selectedSlot.courtId,
            timeSlotId: selectedSlot.timeSlotId,
            bookingDate: selectedSlot.date,
            services: Object.entries(selectedServices).map(([serviceId, quantity]) => ({
                serviceId: parseInt(serviceId),
                quantity
            })),
            voucher: appliedVoucher,
            notes: bookingNotes,
            totalAmount: calculateTotal(),
            subtotal: calculateSubtotal(),
            discount: calculateDiscount()
        };
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            onConfirm(bookingData);
        } catch (error) {
            console.error('Booking error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const groupedServices = mockServices.reduce((groups, service) => {
        const category = service.category;
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(service);
        return groups;
    }, {} as {[key: string]: Service[]});

    if (!isVisible || !selectedSlot || !selectedCourt) {
        return null;
    }

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
            
            {/* Sidebar */}
            <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                        <h2 className="text-xl font-bold text-gray-900">Chi tiết đặt sân</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Booking Info */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center mb-3">
                            <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                            <h3 className="font-semibold text-blue-900">Thông tin đặt sân</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center text-gray-700">
                                <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                                <span><strong>{selectedCourt.name}</strong> - {selectedCourt.description}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                                <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                <span>{new Date(selectedSlot.date).toLocaleDateString('vi-VN', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                <span>{selectedSlot.startTime} - {selectedSlot.endTime}</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                                <span className="font-medium text-blue-900">Giá sân:</span>
                                <span className="font-bold text-blue-900">{formatCurrency(selectedSlot.price)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Services */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                            <ShoppingCart className="h-5 w-5 mr-2 text-gray-600" />
                            Dịch vụ thêm (tùy chọn)
                        </h3>
                        
                        {Object.entries(groupedServices).map(([category, services]) => (
                            <div key={category} className="space-y-3">
                                <h4 className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                                    {category}
                                </h4>
                                {services.map(service => (
                                    <div key={service.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                                        <div className="flex-1">
                                            <h5 className="font-medium text-gray-900">{service.name}</h5>
                                            <p className="text-sm text-gray-600">{service.description}</p>
                                            <p className="text-sm font-semibold text-blue-600">{formatCurrency(service.price)}</p>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            <button
                                                onClick={() => handleServiceChange(service.id, -1)}
                                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                                disabled={!selectedServices[service.id]}
                                            >
                                                <Minus className="h-4 w-4 text-gray-600" />
                                            </button>
                                            <span className="w-8 text-center font-medium">
                                                {selectedServices[service.id] || 0}
                                            </span>
                                            <button
                                                onClick={() => handleServiceChange(service.id, 1)}
                                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                            >
                                                <Plus className="h-4 w-4 text-gray-600" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Voucher */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                            <Gift className="h-5 w-5 mr-2 text-gray-600" />
                            Mã giảm giá
                        </h3>
                        
                        {appliedVoucher ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-green-900">{appliedVoucher.name}</p>
                                        <p className="text-sm text-green-700">Mã: {appliedVoucher.code}</p>
                                        <p className="text-sm text-green-600">Giảm {formatCurrency(calculateDiscount())}</p>
                                    </div>
                                    <button
                                        onClick={() => setAppliedVoucher(null)}
                                        className="text-green-600 hover:text-green-800"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowVoucherModal(true)}
                                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
                            >
                                <Tag className="h-5 w-5 mx-auto mb-1" />
                                <span className="text-sm">Nhấn để thêm mã giảm giá</span>
                            </button>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-3">
                        <label className="font-semibold text-gray-900">Ghi chú (tùy chọn)</label>
                        <textarea
                            value={bookingNotes}
                            onChange={(e) => setBookingNotes(e.target.value)}
                            placeholder="Nhập ghi chú cho đơn đặt sân..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            rows={3}
                        />
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <h3 className="font-semibold text-gray-900">Tổng kết đơn hàng</h3>
                        
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Tiền sân:</span>
                                <span>{formatCurrency(selectedSlot.price)}</span>
                            </div>
                            
                            {Object.entries(selectedServices).map(([serviceId, quantity]) => {
                                const service = mockServices.find(s => s.id === parseInt(serviceId));
                                if (!service || quantity === 0) return null;
                                return (
                                    <div key={serviceId} className="flex justify-between text-gray-600">
                                        <span>{service.name} x{quantity}:</span>
                                        <span>{formatCurrency(service.price * quantity)}</span>
                                    </div>
                                );
                            })}
                            
                            <div className="flex justify-between pt-2 border-t border-gray-200">
                                <span>Tạm tính:</span>
                                <span>{formatCurrency(calculateSubtotal())}</span>
                            </div>
                            
                            {appliedVoucher && (
                                <div className="flex justify-between text-green-600">
                                    <span>Giảm giá:</span>
                                    <span>-{formatCurrency(calculateDiscount())}</span>
                                </div>
                            )}
                            
                            <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-lg">
                                <span>Tổng cộng:</span>
                                <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleConfirmBooking}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Xác nhận đặt sân
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Voucher Modal */}
            {showVoucherModal && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-60" onClick={() => setShowVoucherModal(false)} />
                    <div className="fixed inset-0 flex items-center justify-center z-70 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Chọn mã giảm giá</h3>
                                    <button onClick={() => setShowVoucherModal(false)}>
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={voucherCode}
                                            onChange={(e) => setVoucherCode(e.target.value)}
                                            placeholder="Nhập mã voucher"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <button
                                            onClick={handleVoucherApply}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            Áp dụng
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-900">Voucher khả dụng:</h4>
                                    {mockVouchers.map(voucher => (
                                        <div 
                                            key={voucher.id} 
                                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                                calculateSubtotal() >= voucher.minOrderAmount 
                                                    ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                                                    : 'border-gray-200 bg-gray-50 opacity-50'
                                            }`}
                                            onClick={() => {
                                                if (calculateSubtotal() >= voucher.minOrderAmount) {
                                                    setAppliedVoucher(voucher);
                                                    setShowVoucherModal(false);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900">{voucher.name}</p>
                                                    <p className="text-sm text-gray-600">{voucher.description}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Đơn tối thiểu: {formatCurrency(voucher.minOrderAmount)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                                                        {voucher.code}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default BookingDetails; 