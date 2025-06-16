"use client"

import React, { useState, useEffect } from 'react';
import { CustomerLayout } from '@/components/customer-layout';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    Star, 
    ChevronRight, 
    CreditCard, 
    Tag, 
    Plus, 
    Minus,
    CheckCircle,
    X,
    ShoppingCart,
    Gift,
    Timer,
    ArrowLeft,
    Users,
    AlertCircle,
    ArrowRight,
    Check
} from 'lucide-react';

// API base URL
const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return {
        'Content-Type': 'application/json'
    };
    
    const user = JSON.parse(userStr);
    return {
        'Content-Type': 'application/json',
        ...(user.token && { 'Authorization': `Bearer ${user.token}` })
    };
};

// Services based on database - will be fetched from API later
const mockServices = [
    { id: 1, serviceTypeId: 1, name: "Coca-Cola", description: "Lon Coca-Cola", price: 15000, category: "Đồ Uống" },
    { id: 2, serviceTypeId: 1, name: "Nước suối", description: "Chai nước suối", price: 10000, category: "Đồ Uống" },
    { id: 3, serviceTypeId: 2, name: "Thuê Vợt", description: "Thuê vợt cầu lông mỗi giờ", price: 30000, category: "Thuê Dụng Cụ" },
    { id: 4, serviceTypeId: 2, name: "Thuê Khăn", description: "Thuê khăn", price: 10000, category: "Thuê Dụng Cụ" }
];

// Discounts based on database - will be fetched from API later
const mockVouchers = [
    { id: 1, code: "WELCOME10", name: "Chào mừng khách hàng mới", description: "Giảm 10% cho đơn hàng đầu tiên", type: "PERCENTAGE", value: 10, minOrderAmount: 200000, maxDiscountAmount: 50000 },
    { id: 2, code: "WEEKEND20", name: "Khuyến mãi cuối tuần", description: "Giảm 20% cho tất cả đặt sân vào cuối tuần", type: "PERCENTAGE", value: 20, minOrderAmount: 300000, maxDiscountAmount: 100000 },
    { id: 3, code: "HOLIDAY50K", name: "Giảm giá ngày lễ", description: "Giảm cố định 50,000 VNĐ cho các ngày lễ", type: "FIXED", value: 50000, minOrderAmount: 150000, maxDiscountAmount: null }
];

interface Court {
    id: number;
    name: string;
    description: string;
    location: string;
    rating: number;
    image: string;
    priceRange: string;
    availableSlots: number;
}

interface TimeSlot {
    id: number;
    startTime: string;
    endTime: string;
    price: number;
    isAvailable: boolean;
}

interface BookingData {
    courtId?: number;
    timeSlotId?: number;
    bookingDate?: string;
    services?: string[];
    notes?: string;
}

const BookingPage = () => {
    const { user } = useAuth();
    const router = useRouter();
    
    // Mock user data for testing if no user is logged in
    const currentUser = user || {
        id: 1,
        fullName: "Khách hàng demo",
        email: "demo@email.com",
        role: "CUSTOMER"
    };
    
    const [currentStep, setCurrentStep] = useState(1); // 1: Select Court & Time, 2: Services & Confirm
    const [courts, setCourts] = useState<Court[]>([]);
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
    const [voucherCode, setVoucherCode] = useState('');
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [bookingNotes, setBookingNotes] = useState('');
    const [isLoadingCourts, setIsLoadingCourts] = useState(true);
    const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
    const [bookingResult, setBookingResult] = useState<any>(null);
    const [bookingData, setBookingData] = useState<BookingData>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    // Fetch courts from API
    useEffect(() => {
        fetchCourts();
    }, []);

    // Load time slots when court or date changes
    useEffect(() => {
        if (selectedCourt && selectedDate) {
            fetchTimeSlots(selectedCourt.id, selectedDate);
        }
    }, [selectedCourt, selectedDate]);

    const fetchCourts = async () => {
        try {
            setIsLoadingCourts(true);
            const response = await fetch(`http://localhost:8080/api/customer/courts`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            
            if (response.ok) {
                const data = await response.json();
                setCourts(data);
            } else {
                console.error('Failed to fetch courts');
                // Fallback to mock data
                setCourts([
                    { id: 1, name: "Sân 1", description: "Sân cầu lông tiêu chuẩn nhà thi đấu 1", location: "Khu A", rating: 4.5, image: "/images/court1.jpg" },
                    { id: 2, name: "Sân 2", description: "Sân cầu lông tiêu chuẩn nhà thi đấu 2", location: "Khu A", rating: 4.3, image: "/images/court2.jpg" },
                    { id: 3, name: "Sân 3", description: "Sân cầu lông tiêu chuẩn nhà thi đấu 3", location: "Khu B", rating: 4.7, image: "/images/court3.jpg" }
                ]);
            }
        } catch (error) {
            console.error('Error fetching courts:', error);
            // Fallback to mock data
            setCourts([
                { id: 1, name: "Sân 1", description: "Sân cầu lông tiêu chuẩn nhà thi đấu 1", location: "Khu A", rating: 4.5, image: "/images/court1.jpg" },
                { id: 2, name: "Sân 2", description: "Sân cầu lông tiêu chuẩn nhà thi đấu 2", location: "Khu A", rating: 4.3, image: "/images/court2.jpg" },
                { id: 3, name: "Sân 3", description: "Sân cầu lông tiêu chuẩn nhà thi đấu 3", location: "Khu B", rating: 4.7, image: "/images/court3.jpg" }
            ]);
        } finally {
            setIsLoadingCourts(false);
        }
    };

    const fetchTimeSlots = async (courtId: number, date: string) => {
        try {
            setIsLoadingTimeSlots(true);
            const response = await fetch(
                `http://localhost:8080/api/customer/courts/${courtId}/timeslots?date=${date}`,
                {
                    method: 'GET',
                    headers: getAuthHeaders()
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                setTimeSlots(data);
            } else {
                console.error('Failed to fetch time slots');
                // Fallback to mock data
                generateMockTimeSlots();
            }
        } catch (error) {
            console.error('Error fetching time slots:', error);
            // Fallback to mock data
            generateMockTimeSlots();
        } finally {
            setIsLoadingTimeSlots(false);
        }
    };

    const generateMockTimeSlots = () => {
        const slots = [];
        const startHour = 5;
        const slotDuration = 2;
        const totalSlots = 9;
        
        for (let i = 0; i < totalSlots; i++) {
            const startTime = startHour + (i * slotDuration);
            const endTime = startTime + slotDuration;
            const isWeekend = new Date(selectedDate).getDay() === 0 || new Date(selectedDate).getDay() === 6;
            
            let price = 200000; // weekday default
            if (isWeekend) price = 250000; // weekend
            
            const isAvailable = Math.random() > 0.3;
            
            slots.push({
                id: i + 1,
                startTime: `${startTime.toString().padStart(2, '0')}:00`,
                endTime: `${endTime.toString().padStart(2, '0')}:00`,
                price: price,
                isAvailable: isAvailable
            });
        }
        setTimeSlots(slots);
    };

    // Calculate pricing
    const calculateTotal = () => {
        let subtotal = 0;
        
        // Time slot price
        if (selectedTimeSlot) {
            subtotal += selectedTimeSlot.price;
        }
        
        // Services price
        selectedServices.forEach(service => {
            subtotal += service.price * service.quantity;
        });
        
        // Apply voucher
        let discount = 0;
        if (appliedVoucher && subtotal >= appliedVoucher.minOrderAmount) {
            if (appliedVoucher.type === 'PERCENTAGE') {
                discount = (subtotal * appliedVoucher.value) / 100;
                if (appliedVoucher.maxDiscountAmount) {
                    discount = Math.min(discount, appliedVoucher.maxDiscountAmount);
                }
            } else if (appliedVoucher.type === 'FIXED') {
                discount = appliedVoucher.value;
            }
        }
        
        const total = subtotal - discount;
        
        return {
            subtotal,
            discount,
            total: Math.max(0, total)
        };
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const handleCourtSelect = (court: any) => {
        setSelectedCourt(court);
        setSelectedTimeSlot(null);
    };

    const handleTimeSlotSelect = (slot: any) => {
        setSelectedTimeSlot(slot);
    };

    const handleServiceAdd = (service: any) => {
        const existingService = selectedServices.find(s => s.id === service.id);
        if (existingService) {
            setSelectedServices(prev => 
                prev.map(s => s.id === service.id ? {...s, quantity: s.quantity + 1} : s)
            );
        } else {
            setSelectedServices(prev => [...prev, {...service, quantity: 1}]);
        }
    };

    const handleServiceRemove = (serviceId: number) => {
        setSelectedServices(prev => 
            prev.map(s => s.id === serviceId ? {...s, quantity: Math.max(0, s.quantity - 1)} : s)
                .filter(s => s.quantity > 0)
        );
    };

    const handleVoucherApply = () => {
        const voucher = mockVouchers.find(v => v.code === voucherCode.toUpperCase());
        if (voucher) {
            const { subtotal } = calculateTotal();
            if (subtotal >= voucher.minOrderAmount) {
                setAppliedVoucher(voucher);
                setShowVoucherModal(false);
                setVoucherCode('');
            } else {
                alert(`Đơn hàng tối thiểu ${formatCurrency(voucher.minOrderAmount)} để sử dụng voucher này`);
            }
        } else {
            alert('Mã voucher không hợp lệ');
        }
    };

    const handleBooking = async () => {
        try {
            setIsLoading(true);
            
            // Lấy userId từ localStorage
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const userId = user?.id;
            
            console.log('=== FRONTEND DEBUG ===');
            console.log('User from localStorage:', user);
            console.log('UserId:', userId);
            
            if (!userId) {
                alert('❌ Vui lòng đăng nhập để đặt sân!');
                return;
            }
            
            const bookingData = {
                userId: userId, // Thêm userId vào request
                courtId: selectedCourt.id,
                timeSlotId: selectedTimeSlot.id,
                bookingDate: selectedDate,
                notes: bookingNotes,
                services: selectedServices
            };
            
            console.log('Booking data to send:', bookingData);

            const response = await fetch(`${API_BASE_URL}/customer/create-test`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                throw new Error('Failed to create booking');
            }

            const result = await response.json();
            
            // Show success message
            alert(`✅ Đặt sân thành công!\n\nMã đặt sân: #${result.bookingId}\nTrạng thái: Chờ xác nhận\n\nAdmin sẽ xác nhận trong vòng 15 phút. Bạn sẽ nhận được thông báo khi đơn đặt sân được xác nhận và có thể thanh toán.`);
            
            // Reset form and go back to step 1
            setSelectedCourt(null);
            setSelectedTimeSlot(null);
            setSelectedServices([]);
            setBookingNotes('');
            setAppliedVoucher(null);
            setSelectedDate(new Date().toISOString().split('T')[0]);
            setCurrentStep(1);
                
        } catch (error) {
            console.error('Error creating booking:', error);
            alert('❌ Đặt sân thất bại! Vui lòng thử lại hoặc liên hệ hỗ trợ.');
        } finally {
            setIsLoading(false);
        }
    };

    const canProceedToStep = (step: number) => {
        switch (step) {
            case 2:
                return selectedCourt && selectedTimeSlot;
            case 3:
                return selectedCourt && selectedTimeSlot;
            case 4:
                return selectedCourt && selectedTimeSlot;
            default:
                return true;
        }
    };

    // Step 1: Court and Time Selection
    const renderStep1 = () => (
        <div className="space-y-8">
            {/* Date Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Calendar className="mr-2 text-blue-600" size={24} />
                    Chọn ngày
                </h3>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Court Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <MapPin className="mr-2 text-blue-600" size={24} />
                    Chọn sân
                </h3>
                {isLoadingCourts ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 rounded-xl h-24 p-4">
                                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courts.map((court) => (
                            <div
                                key={court.id}
                                onClick={() => handleCourtSelect(court)}
                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                    selectedCourt?.id === court.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-gray-800">{court.name}</h4>
                                    <div className="flex items-center">
                                        <Star className="text-yellow-400 fill-current" size={16} />
                                        <span className="ml-1 text-sm text-gray-600">{court.rating || 4.5}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">{court.description}</p>
                                {court.location && (
                                    <p className="text-xs text-gray-500 mt-1">{court.location}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Time Slot Selection */}
            {selectedCourt && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <Clock className="mr-2 text-blue-600" size={24} />
                        Chọn khung giờ - {selectedCourt.name}
                    </h3>
                    {isLoadingTimeSlots ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 rounded-xl h-20 p-4">
                                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {timeSlots.map((slot) => (
                                <div
                                    key={slot.id}
                                    onClick={() => slot.isAvailable && handleTimeSlotSelect(slot)}
                                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                        !slot.isAvailable 
                                            ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                                            : selectedTimeSlot?.id === slot.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <Timer className="mr-2 text-blue-600" size={16} />
                                            <span className="font-bold">{slot.startTime} - {slot.endTime}</span>
                                        </div>
                                        {!slot.isAvailable && (
                                            <span className="text-xs text-red-500 font-medium">Đã đặt</span>
                                        )}
                                    </div>
                                    <div className="text-lg font-bold text-blue-600">
                                        {formatCurrency(slot.price)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // Step 2: Services and Voucher
    const renderStep2 = () => (
        <div className="space-y-8">
            {/* Booking Summary */}
            <div className="bg-blue-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Thông tin đặt sân</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Sân</p>
                        <p className="font-bold">{selectedCourt?.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Ngày</p>
                        <p className="font-bold">{new Date(selectedDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Giờ</p>
                        <p className="font-bold">{selectedTimeSlot?.startTime} - {selectedTimeSlot?.endTime}</p>
                    </div>
                </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <ShoppingCart className="mr-2 text-blue-600" size={24} />
                    Dịch vụ thêm (tùy chọn)
                </h3>
                <div className="space-y-4">
                    {Object.entries(mockServices.reduce((acc: any, service) => {
                        const category = service.category;
                        if (!acc[category]) acc[category] = [];
                        acc[category].push(service);
                        return acc;
                    }, {})).map(([category, services]: [string, any]) => (
                        <div key={category}>
                            <h4 className="font-bold text-gray-700 mb-2">{category}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {services.map((service: any) => {
                                    const selectedService = selectedServices.find(s => s.id === service.id);
                                    const quantity = selectedService?.quantity || 0;
                                    
                                    return (
                                        <div key={service.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                            <div className="flex-1">
                                                <h5 className="font-medium">{service.name}</h5>
                                                <p className="text-sm text-gray-600">{service.description}</p>
                                                <p className="text-sm font-bold text-blue-600">{formatCurrency(service.price)}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleServiceRemove(service.id)}
                                                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                                                    disabled={quantity === 0}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-8 text-center font-medium">{quantity}</span>
                                                <button
                                                    onClick={() => handleServiceAdd(service)}
                                                    className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Voucher */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Gift className="mr-2 text-blue-600" size={24} />
                    Mã giảm giá
                </h3>
                {appliedVoucher ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="font-medium text-green-800">{appliedVoucher.name}</p>
                            <p className="text-sm text-green-600">{appliedVoucher.description}</p>
                        </div>
                        <button
                            onClick={() => setAppliedVoucher(null)}
                            className="text-green-600 hover:text-green-800"
                        >
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowVoucherModal(true)}
                        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                        <Tag className="mx-auto mb-2" size={24} />
                        <p>Nhấn để áp dụng mã giảm giá</p>
                    </button>
                )}
            </div>

            {/* Booking Notes */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Ghi chú (tùy chọn)</h3>
                <textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Thêm ghi chú cho đặt sân..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                />
            </div>

            {/* Booking Process Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                    <AlertCircle className="mr-2 text-blue-600" size={20} />
                    Quy trình đặt sân
                </h3>
                <div className="space-y-3 text-blue-800">
                    <div className="flex items-start space-x-3">
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                        <p>Đơn đặt sân sẽ được gửi cho admin xác nhận</p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                        <p>Admin sẽ xác nhận trong vòng 15 phút</p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                        <p>Bạn sẽ nhận thông báo khi đơn được xác nhận</p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                        <p>Thanh toán sau khi admin xác nhận để hoàn thành đặt sân</p>
                    </div>
                </div>
            </div>

            {/* Order Summary for Final Review */}
            <div className="bg-green-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Tóm tắt đơn đặt sân</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span>Sân:</span>
                        <span className="font-medium">{selectedCourt?.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Ngày:</span>
                        <span className="font-medium">{new Date(selectedDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Giờ:</span>
                        <span className="font-medium">{selectedTimeSlot?.startTime} - {selectedTimeSlot?.endTime}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Giá sân:</span>
                        <span className="font-medium">{formatCurrency(selectedTimeSlot?.price || 0)}</span>
                    </div>
                    
                    {selectedServices.length > 0 && (
                        <>
                            <hr className="my-2" />
                            <div className="text-sm text-gray-600">
                                <p className="font-medium mb-2">Dịch vụ thêm:</p>
                                {selectedServices.map((service) => (
                                    <div key={service.id} className="flex justify-between">
                                        <span>{service.name} x {service.quantity}</span>
                                        <span>{formatCurrency(service.price * service.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    
                    {bookingNotes && (
                        <>
                            <hr className="my-2" />
                            <div>
                                <span className="text-gray-600">Ghi chú:</span>
                                <p className="text-gray-800 mt-1">{bookingNotes}</p>
                            </div>
                        </>
                    )}

                    <hr className="my-3" />
                    <div className="flex justify-between text-lg font-bold">
                        <span>Tổng cộng:</span>
                        <span className="text-blue-600">{formatCurrency(calculateTotal().total)}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    // Step 3: Payment
    const renderStep3 = () => {
        const { subtotal, discount, total } = calculateTotal();
        
        return (
            <div className="space-y-8">
                {/* Order Summary */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Tóm tắt đơn hàng</h3>
                    
                    {/* Court booking */}
                    <div className="space-y-3 mb-4">
                        <div className="flex justify-between">
                            <span>{selectedCourt?.name} - {selectedTimeSlot?.startTime} đến {selectedTimeSlot?.endTime}</span>
                            <span className="font-medium">{formatCurrency(selectedTimeSlot?.price || 0)}</span>
                        </div>
                        
                        {/* Services */}
                        {selectedServices.map((service) => (
                            <div key={service.id} className="flex justify-between text-sm text-gray-600">
                                <span>{service.name} x {service.quantity}</span>
                                <span>{formatCurrency(service.price * service.quantity)}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between">
                            <span>Tạm tính</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Giảm giá ({appliedVoucher?.code})</span>
                                <span>-{formatCurrency(discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xl font-bold border-t pt-2">
                            <span>Tổng cộng</span>
                            <span className="text-blue-600">{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <CreditCard className="mr-2 text-blue-600" size={24} />
                        Phương thức thanh toán
                    </h3>
                    <div className="space-y-3">
                        {[
                            { id: 'momo', name: 'Ví MoMo', icon: '📱' },
                            { id: 'bank', name: 'Chuyển khoản ngân hàng', icon: '🏦' },
                            { id: 'cash', name: 'Thanh toán tại quầy', icon: '💰' }
                        ].map((method) => (
                            <label key={method.id} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value={method.id}
                                    className="mr-3"
                                    defaultChecked={method.id === 'momo'}
                                />
                                <span className="text-2xl mr-3">{method.icon}</span>
                                <span className="font-medium">{method.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Step 4: Confirmation
    const renderStep4 = () => (
        <div className="text-center space-y-8">
            <div className="bg-green-50 rounded-2xl p-8">
                <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
                <h2 className="text-2xl font-bold text-green-800 mb-2">Đặt sân thành công!</h2>
                <p className="text-green-600">
                    Booking ID: #{bookingResult?.bookingId || 'BK' + Date.now()}
                </p>
                {bookingResult?.message && (
                    <p className="text-green-600 mt-2">{bookingResult.message}</p>
                )}
                {bookingResult?.estimatedConfirmTime && (
                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mt-4">
                        <div className="flex items-center justify-center text-yellow-800">
                            <AlertCircle className="mr-2" size={16} />
                            <span className="text-sm">
                                Thời gian xác nhận dự kiến: {bookingResult.estimatedConfirmTime}
                            </span>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg text-left">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Thông tin đặt sân</h3>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Khách hàng:</span>
                        <span className="font-medium">{user?.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Sân:</span>
                        <span className="font-medium">{selectedCourt?.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Ngày:</span>
                        <span className="font-medium">{new Date(selectedDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Giờ:</span>
                        <span className="font-medium">{selectedTimeSlot?.startTime} - {selectedTimeSlot?.endTime}</span>
                    </div>
                    
                    {selectedServices.length > 0 && (
                        <div className="border-t pt-3 mt-3">
                            <h4 className="font-medium text-gray-700 mb-2">Dịch vụ đã chọn:</h4>
                            {selectedServices.map((service) => (
                                <div key={service.id} className="flex justify-between text-sm">
                                    <span>{service.name} x{service.quantity}</span>
                                    <span>{formatCurrency(service.price * service.quantity)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {appliedVoucher && (
                        <div className="border-t pt-3 mt-3">
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Giảm giá ({appliedVoucher.code}):</span>
                                <span>-{formatCurrency(calculateTotal().discount)}</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tổng tiền:</span>
                            <span className="font-bold text-blue-600 text-lg">{formatCurrency(calculateTotal().total)}</span>
                        </div>
                    </div>
                    
                    {bookingNotes && (
                        <div className="border-t pt-3 mt-3">
                            <span className="text-gray-600">Ghi chú:</span>
                            <p className="mt-1 text-gray-800">{bookingNotes}</p>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="bg-blue-50 rounded-2xl p-6">
                <h4 className="font-bold text-blue-800 mb-2">Bước tiếp theo</h4>
                <div className="text-sm text-blue-700 space-y-1">
                    <p>• Bạn sẽ nhận được email xác nhận trong vài phút</p>
                    <p>• Kiểm tra lịch sử đặt sân để theo dõi trạng thái</p>
                    <p>• Thanh toán trước khi đến sân để tránh hủy booking</p>
                </div>
            </div>
        </div>
    );

    return (
        <CustomerLayout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                        <Calendar className="mr-3 text-blue-600" size={32} />
                        Đặt sân cầu lông
                    </h1>
                    <p className="text-gray-600">Chọn sân và thời gian phù hợp với bạn</p>
                </div>

                {/* Progress Steps */}
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                    <div className="flex items-center justify-center space-x-8">
                        {[
                            { step: 1, title: "Chọn sân & giờ", icon: Calendar },
                            { step: 2, title: "Dịch vụ & Xác nhận", icon: CheckCircle }
                        ].map((item, index) => {
                            const Icon = item.icon;
                            const isActive = currentStep === item.step;
                            const isCompleted = currentStep > item.step;
                            
                            return (
                                <div key={item.step} className="flex items-center">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                                        isCompleted 
                                            ? 'bg-green-600 border-green-600 text-white'
                                            : isActive 
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'border-gray-300 text-gray-400'
                                    }`}>
                                        <Icon size={20} />
                                    </div>
                                    <span className={`ml-2 font-medium ${
                                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                    }`}>
                                        {item.title}
                                    </span>
                                    {index < 1 && (
                                        <ChevronRight className="mx-4 text-gray-300" size={20} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Step Content */}
                <div className="mb-8">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                </div>

                {/* Navigation Buttons */}
                {currentStep <= 2 && (
                    <div className="flex justify-between">
                        <button
                            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                currentStep === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                            disabled={currentStep === 1}
                        >
                            Quay lại
                        </button>
                        
                        <button
                            onClick={() => {
                                if (currentStep === 2) {
                                    handleBooking();
                                } else {
                                    setCurrentStep(currentStep + 1);
                                }
                            }}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center ${
                                canProceedToStep(currentStep + 1)
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={!canProceedToStep(currentStep + 1) || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    Đang xử lý...
                                </>
                            ) : currentStep === 2 ? (
                                'Xác nhận đặt sân'
                            ) : (
                                'Tiếp tục'
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Voucher Modal */}
            {showVoucherModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Mã giảm giá</h3>
                            <button
                                onClick={() => setShowVoucherModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    value={voucherCode}
                                    onChange={(e) => setVoucherCode(e.target.value)}
                                    placeholder="Nhập mã giảm giá"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                    onClick={handleVoucherApply}
                                    className="w-full mt-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Áp dụng
                                </button>
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-2">Voucher khả dụng</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {mockVouchers.map((voucher) => (
                                        <div 
                                            key={voucher.id}
                                            onClick={() => {
                                                setVoucherCode(voucher.code);
                                                handleVoucherApply();
                                            }}
                                            className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-blue-600">{voucher.code}</span>
                                                <span className="text-sm text-gray-500">
                                                    {voucher.type === 'PERCENTAGE' ? `${voucher.value}%` : formatCurrency(voucher.value)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{voucher.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Đơn tối thiểu: {formatCurrency(voucher.minOrderAmount)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
};

export default BookingPage; 