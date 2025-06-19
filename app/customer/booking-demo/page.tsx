"use client"

import React, { useState, useEffect } from 'react';
import { CustomerLayout } from '@/components/customer-layout';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    ChevronLeft, 
    ChevronRight,
    RefreshCw,
    Users,
    Check,
    X,
    Star,
    Gift,
    Tag,
    Plus,
    Minus,
    CreditCard,
    ShoppingCart,
    CheckCircle,
    AlertCircle,
    Timer
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Types
interface Court {
    id: number;
    name: string;
    description: string;
    status: string;
}

interface BookingSlot {
    courtId: number;
    timeSlotId: number;
    date: string;
    status: 'available' | 'booked' | 'unavailable' | 'selected';
    price: number;
    startTime: string;
    endTime: string;
}

interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
}

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

const BookingDemoPage = () => {
    const { user } = useAuth();
    const router = useRouter();
    
    // Mock user data for testing if no user is logged in
    const currentUser = user || {
        id: 1,
        fullName: "Khách hàng demo",
        email: "demo@email.com",
        role: "CUSTOMER"
    };

    // State management
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [courts, setCourts] = useState<Court[]>([]);
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [bookingGrid, setBookingGrid] = useState<BookingSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
    const [showBookingDetails, setShowBookingDetails] = useState(false);
    const [selectedServices, setSelectedServices] = useState<{[key: number]: number}>({});
    const [bookingNotes, setBookingNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCourts, setIsLoadingCourts] = useState(true);
    const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
    const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
    const [voucherCode, setVoucherCode] = useState('');
    const [showVoucherModal, setShowVoucherModal] = useState(false);

    // Services based on database - will be fetched from API later
    const mockServices: Service[] = [
        { id: 1, name: "Coca-Cola", description: "Lon Coca-Cola 330ml", price: 15000, category: "Đồ Uống" },
        { id: 2, name: "Nước suối", description: "Chai nước suối 500ml", price: 10000, category: "Đồ Uống" },
        { id: 3, name: "Thuê Vợt", description: "Thuê vợt cầu lông mỗi giờ", price: 30000, category: "Thuê Dụng Cụ" },
        { id: 4, name: "Thuê Khăn", description: "Thuê khăn thể thao", price: 10000, category: "Thuê Dụng Cụ" },
        { id: 5, name: "Nước tăng lực", description: "Lon nước tăng lực", price: 25000, category: "Đồ Uống" },
        { id: 6, name: "Giày cầu lông", description: "Thuê giày cầu lông", price: 50000, category: "Thuê Dụng Cụ" }
    ];

    // Discounts based on database - will be fetched from API later
    const mockVouchers = [
        { id: 1, code: "WELCOME10", name: "Chào mừng khách hàng mới", description: "Giảm 10% cho đơn hàng đầu tiên", type: "PERCENTAGE", value: 10, minOrderAmount: 200000, maxDiscountAmount: 50000 },
        { id: 2, code: "WEEKEND20", name: "Khuyến mãi cuối tuần", description: "Giảm 20% cho tất cả đặt sân vào cuối tuần", type: "PERCENTAGE", value: 20, minOrderAmount: 300000, maxDiscountAmount: 100000 },
        { id: 3, code: "HOLIDAY50K", name: "Giảm giá ngày lễ", description: "Giảm cố định 50,000 VNĐ cho các ngày lễ", type: "FIXED", value: 50000, minOrderAmount: 150000, maxDiscountAmount: null }
    ];

    // Generate week dates
    const getWeekDates = (date: Date) => {
        const week = [];
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startOfWeek);
            currentDate.setDate(startOfWeek.getDate() + i);
            week.push(currentDate);
        }
        return week;
    };

    // Generate time slots
    const generateTimeSlots = () => {
        const slots = [];
        const startHour = 5;
        const endHour = 23;
        const slotDuration = 2;

        for (let hour = startHour; hour < endHour; hour += slotDuration) {
            slots.push({
                startTime: `${hour.toString().padStart(2, '0')}:00`,
                endTime: `${(hour + slotDuration).toString().padStart(2, '0')}:00`,
                label: `${hour.toString().padStart(2, '0')}:00 - ${(hour + slotDuration).toString().padStart(2, '0')}:00`
            });
        }
        return slots;
    };

    const weekDates = getWeekDates(currentWeek);
    const timeSlotLabels = generateTimeSlots();

    // Fetch courts from API
    useEffect(() => {
        fetchCourts();
    }, []);

    // Load booking data when court or week changes
    useEffect(() => {
        if (selectedCourt) {
            fetchWeeklyBookingData();
        }
    }, [selectedCourt, currentWeek]);

    const fetchCourts = async () => {
        try {
            setIsLoadingCourts(true);
            const response = await fetch(`${API_BASE_URL}/customer/courts`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            
            if (response.ok) {
                const data = await response.json();
                setCourts(data);
                if (data.length > 0) {
                    setSelectedCourt(data[0]);
                }
            } else {
                console.error('Failed to fetch courts');
                // Fallback to mock data
                const mockCourts = [
                    { id: 1, name: "Sân 1", description: "Sân cầu lông tiêu chuẩn", status: "active" },
                    { id: 2, name: "Sân 2", description: "Sân cầu lông VIP", status: "active" },
                    { id: 3, name: "Sân 3", description: "Sân cầu lông cao cấp", status: "active" }
                ];
                setCourts(mockCourts);
                setSelectedCourt(mockCourts[0]);
            }
        } catch (error) {
            console.error('Error fetching courts:', error);
            // Fallback to mock data
            const mockCourts = [
                { id: 1, name: "Sân 1", description: "Sân cầu lông tiêu chuẩn", status: "active" },
                { id: 2, name: "Sân 2", description: "Sân cầu lông VIP", status: "active" },
                { id: 3, name: "Sân 3", description: "Sân cầu lông cao cấp", status: "active" }
            ];
            setCourts(mockCourts);
            setSelectedCourt(mockCourts[0]);
        } finally {
            setIsLoadingCourts(false);
        }
    };

    const fetchWeeklyBookingData = async () => {
        if (!selectedCourt) return;
        
        setIsLoadingTimeSlots(true);
        const weeklyData: BookingSlot[] = [];

        try {
            // Fetch data for each day of the week
            for (const date of weekDates) {
                const dateStr = date.toISOString().split('T')[0];
                
                const response = await fetch(
                    `${API_BASE_URL}/customer/courts/${selectedCourt.id}/timeslots?date=${dateStr}`,
                    { headers: getAuthHeaders() }
                );

                if (response.ok) {
                    const daySlots = await response.json();
                    
                    daySlots.forEach((slot: any) => {
                        weeklyData.push({
                            courtId: selectedCourt.id,
                            timeSlotId: slot.id,
                            date: dateStr,
                            status: slot.isAvailable ? 'available' : 'booked',
                            price: slot.price,
                            startTime: slot.startTime,
                            endTime: slot.endTime
                        });
                    });
                } else {
                    // Generate mock data for this day
                    timeSlotLabels.forEach((timeSlot, index) => {
                        const isAvailable = Math.random() > 0.3;
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                        
                        weeklyData.push({
                            courtId: selectedCourt.id,
                            timeSlotId: index + 1,
                            date: dateStr,
                            status: isAvailable ? 'available' : 'booked',
                            price: isWeekend ? 250000 : 200000,
                            startTime: timeSlot.startTime,
                            endTime: timeSlot.endTime
                        });
                    });
                }
            }
            
            setBookingGrid(weeklyData);
        } catch (error) {
            console.error('Error fetching weekly data:', error);
            // Generate mock data for all days
            weekDates.forEach(date => {
                const dateStr = date.toISOString().split('T')[0];
                
                timeSlotLabels.forEach((timeSlot, index) => {
                    const isAvailable = Math.random() > 0.3;
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    
                    weeklyData.push({
                        courtId: selectedCourt.id,
                        timeSlotId: index + 1,
                        date: dateStr,
                        status: isAvailable ? 'available' : 'booked',
                        price: isWeekend ? 250000 : 200000,
                        startTime: timeSlot.startTime,
                        endTime: timeSlot.endTime
                    });
                });
            });
            setBookingGrid(weeklyData);
        } finally {
            setIsLoadingTimeSlots(false);
        }
    };

    const handleSlotClick = (slot: BookingSlot) => {
        if (slot.status === 'available') {
            // Clear previous selection
            setBookingGrid(prev => prev.map(s => ({
                ...s,
                status: s.status === 'selected' ? 'available' : s.status
            })));
            
            // Set new selection
            setBookingGrid(prev => prev.map(s => 
                s.courtId === slot.courtId && 
                s.timeSlotId === slot.timeSlotId && 
                s.date === slot.date
                    ? { ...s, status: 'selected' }
                    : s
            ));
            
            setSelectedSlot({ ...slot, status: 'selected' });
            setShowBookingDetails(true);
        }
    };

    const navigateWeek = (direction: 'prev' | 'next') => {
        const newWeek = new Date(currentWeek);
        newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
        setCurrentWeek(newWeek);
    };

    const getSlotForDateTime = (date: Date, timeSlot: any) => {
        const dateStr = date.toISOString().split('T')[0];
        return bookingGrid.find(slot => 
            slot.date === dateStr && 
            slot.startTime === timeSlot.startTime &&
            slot.courtId === selectedCourt?.id
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': 
                return 'bg-gradient-to-br from-green-100 to-emerald-200 hover:from-green-200 hover:to-emerald-300 border-2 border-green-300 text-green-800 hover:border-green-400 hover:shadow-xl transform hover:scale-110 transition-all duration-300 cursor-pointer';
            case 'booked': 
                return 'bg-gradient-to-br from-red-100 to-rose-200 border-2 border-red-300 text-red-800 cursor-not-allowed opacity-70';
            case 'unavailable': 
                return 'bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 text-gray-500 cursor-not-allowed opacity-50';
            case 'selected': 
                return 'bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-blue-600 text-white shadow-2xl transform scale-110 ring-4 ring-blue-200 ring-opacity-50';
            default: 
                return 'bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300';
        }
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + ' VNĐ';
    };

    // Helper function để format giá trị voucher
    const formatVoucherValue = (value: number) => {
        if (value <= 100) {
            return `${value}%`;
        } else {
            return formatCurrency(value);
        }
    };

    const calculateTotal = () => {
        if (!selectedSlot) return 0;
        
        const courtPrice = selectedSlot.price;
        const servicesPrice = Object.entries(selectedServices).reduce((total, [serviceId, quantity]) => {
            const service = mockServices.find(s => s.id === parseInt(serviceId));
            return total + (service ? service.price * quantity : 0);
        }, 0);
        
        return courtPrice + servicesPrice;
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

    const handleConfirmBooking = async () => {
        if (!selectedSlot || !selectedCourt) return;
        
        setIsLoading(true);
        
        try {
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
                userId: userId,
                courtId: selectedSlot.courtId,
                timeSlotId: selectedSlot.timeSlotId,
                bookingDate: selectedSlot.date,
                notes: bookingNotes,
                services: Object.entries(selectedServices).map(([serviceId, quantity]) => ({
                    serviceId: parseInt(serviceId),
                    quantity
                })),
                voucher: appliedVoucher,
                totalAmount: calculateTotal(),
                subtotal: calculateSubtotal(),
                discount: calculateDiscount()
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
            
            // Reset form
            setSelectedSlot(null);
            setSelectedServices({});
            setBookingNotes('');
            setAppliedVoucher(null);
            setShowBookingDetails(false);
            // Clear selection
            setBookingGrid(prev => prev.map(s => ({
                ...s,
                status: s.status === 'selected' ? 'available' : s.status
            })));
                
        } catch (error) {
            console.error('Error creating booking:', error);
            alert('❌ Đặt sân thất bại! Vui lòng thử lại hoặc liên hệ hỗ trợ.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CustomerLayout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-white/20">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                                    <Calendar className="h-10 w-10 mr-4 text-blue-500" />
                                    Đặt Sân Cầu Lông
                                </h1>
                                <p className="text-gray-600 mt-2 text-lg">Chọn thời gian và sân phù hợp với bạn một cách dễ dàng</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <select 
                                        value={selectedCourt?.id || ''} 
                                        onChange={(e) => {
                                            const court = courts.find(c => c.id === parseInt(e.target.value));
                                            if (court) setSelectedCourt(court);
                                        }}
                                        className="px-6 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-lg appearance-none pr-10 font-medium text-gray-700"
                                    >
                                        {courts.map(court => (
                                            <option key={court.id} value={court.id}>
                                                {court.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <ChevronRight className="h-5 w-5 text-gray-400 rotate-90" />
                                    </div>
                                </div>
                                <button className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-200 shadow-lg bg-white">
                                    <RefreshCw className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Week Navigation */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => navigateWeek('prev')}
                                className="flex items-center px-8 py-4 text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-2xl transition-all duration-300 shadow-lg bg-white border border-gray-100 group"
                            >
                                <ChevronLeft className="h-5 w-5 mr-3 group-hover:transform group-hover:-translate-x-1 transition-transform" />
                                <span className="font-medium">Tuần trước</span>
                            </button>
                            
                            <div className="text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-lg">
                                <h2 className="text-xl font-bold">
                                    {weekDates[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - {' '}
                                    {weekDates[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </h2>
                                <p className="text-blue-100 flex items-center justify-center mt-1 text-sm">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    {selectedCourt?.name} - {selectedCourt?.description}
                                </p>
                            </div>

                            <button
                                onClick={() => navigateWeek('next')}
                                className="flex items-center px-8 py-4 text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-2xl transition-all duration-300 shadow-lg bg-white border border-gray-100 group"
                            >
                                <span className="font-medium">Tuần sau</span>
                                <ChevronRight className="h-5 w-5 ml-3 group-hover:transform group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-8 border border-white/20">
                        <div className="flex items-center justify-center space-x-10 flex-wrap">
                            <div className="flex items-center group">
                                <div className="w-6 h-6 bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-300 rounded-xl mr-3 group-hover:scale-110 transition-transform shadow-sm"></div>
                                <span className="text-sm text-gray-700 font-semibold">Còn trống</span>
                            </div>
                            <div className="flex items-center group">
                                <div className="w-6 h-6 bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-300 rounded-xl mr-3 group-hover:scale-110 transition-transform shadow-sm"></div>
                                <span className="text-sm text-gray-700 font-semibold">Đã đặt</span>
                            </div>
                            <div className="flex items-center group">
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-blue-600 rounded-xl mr-3 group-hover:scale-110 transition-transform shadow-sm"></div>
                                <span className="text-sm text-gray-700 font-semibold">Đang chọn</span>
                            </div>
                            <div className="flex items-center group">
                                <div className="w-6 h-6 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-xl mr-3 group-hover:scale-110 transition-transform shadow-sm"></div>
                                <span className="text-sm text-gray-700 font-semibold">Không hoạt động</span>
                            </div>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/30">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 backdrop-blur-sm">
                                    <tr>
                                        <th className="w-44 px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                            <div className="flex items-center">
                                                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                                                Khung giờ
                                            </div>
                                        </th>
                                        {weekDates.map((date, index) => {
                                            const isToday = date.toDateString() === new Date().toDateString();
                                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                            return (
                                                <th key={index} className={`px-5 py-6 text-center text-sm font-bold uppercase tracking-wider ${
                                                    isToday 
                                                        ? 'bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 border-2 border-blue-300 rounded-t-2xl' 
                                                        : isWeekend
                                                        ? 'bg-gradient-to-br from-orange-50 to-yellow-50 text-orange-700'
                                                        : 'text-gray-700'
                                                }`}>
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold text-lg ${
                                                            isToday ? 'text-blue-700' : 
                                                            isWeekend ? 'text-orange-700' : 'text-gray-900'
                                                        }`}>
                                                            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index]}
                                                        </span>
                                                        <span className={`text-sm font-medium ${
                                                            isToday ? 'text-blue-600' : 
                                                            isWeekend ? 'text-orange-600' : 'text-gray-500'
                                                        }`}>
                                                            {date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                                        </span>
                                                        {isToday && (
                                                            <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full mt-2 shadow-sm">
                                                                Hôm nay
                                                            </span>
                                                        )}
                                                        {isWeekend && !isToday && (
                                                            <span className="text-xs bg-gradient-to-r from-orange-400 to-yellow-500 text-white px-2 py-0.5 rounded-full mt-1 shadow-sm">
                                                                Cuối tuần
                                                            </span>
                                                        )}
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200/50">
                                    {timeSlotLabels.map((timeSlot, timeIndex) => (
                                        <tr key={timeIndex} className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-all duration-300">
                                            <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-700 bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm">
                                                <div className="flex items-center">
                                                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl mr-4 shadow-sm">
                                                        <Clock className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-lg text-gray-900">{timeSlot.startTime}</div>
                                                        <div className="text-sm text-gray-600 font-medium">{timeSlot.endTime}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {weekDates.map((date, dateIndex) => {
                                                const slot = getSlotForDateTime(date, timeSlot);
                                                const isToday = date.toDateString() === new Date().toDateString();
                                                const isPast = date < new Date() && !isToday;
                                                
                                                return (
                                                    <td key={dateIndex} className="px-4 py-4">
                                                        <button
                                                            onClick={() => slot && handleSlotClick(slot)}
                                                            disabled={isPast || !slot || slot.status === 'booked' || slot.status === 'unavailable'}
                                                            className={`
                                                                w-full h-28 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group
                                                                ${isPast ? 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 cursor-not-allowed opacity-50' : ''}
                                                                ${slot ? getStatusColor(slot.status) : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300'}
                                                                ${isToday && slot?.status !== 'selected' ? 'ring-2 ring-blue-300 ring-opacity-60' : ''}
                                                                focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
                                                                backdrop-blur-sm
                                                            `}
                                                        >
                                                            {slot && !isPast && (
                                                                <div className="flex flex-col items-center justify-center h-full p-3 relative">
                                                                    {slot.status === 'available' && (
                                                                        <>
                                                                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl group-hover:from-white/30"></div>
                                                                            <Check className="h-7 w-7 mb-2 relative z-10 drop-shadow-sm" />
                                                                            <span className="text-sm font-bold leading-tight relative z-10 drop-shadow-sm">
                                                                                {formatCurrency(slot.price)}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                    {slot.status === 'booked' && (
                                                                        <>
                                                                            <X className="h-7 w-7 mb-2 drop-shadow-sm" />
                                                                            <span className="text-sm font-bold drop-shadow-sm">Đã đặt</span>
                                                                        </>
                                                                    )}
                                                                    {slot.status === 'selected' && (
                                                                        <>
                                                                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl animate-pulse"></div>
                                                                            <Users className="h-7 w-7 mb-2 relative z-10 drop-shadow-sm animate-bounce" />
                                                                            <span className="text-sm font-bold relative z-10 drop-shadow-sm">
                                                                                Đã chọn
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {isPast && (
                                                                <div className="flex items-center justify-center h-full">
                                                                    <span className="text-xs text-gray-400 font-medium">Đã qua</span>
                                                                </div>
                                                            )}
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Selected Slot Info */}
                    {selectedSlot && (
                        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-2xl p-8 border border-white/20 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold flex items-center mb-6">
                                        <CheckCircle className="h-8 w-8 mr-3 text-green-300 animate-pulse" />
                                        Thông tin đặt sân
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                            <MapPin className="h-6 w-6 mr-3 text-blue-200" />
                                            <div>
                                                <div className="text-sm text-blue-200">Sân</div>
                                                <div className="font-bold text-lg">{selectedCourt.name}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                            <Calendar className="h-6 w-6 mr-3 text-purple-200" />
                                            <div>
                                                <div className="text-sm text-purple-200">Ngày</div>
                                                <div className="font-bold text-lg">{new Date(selectedSlot.date).toLocaleDateString('vi-VN', { 
                                                    weekday: 'long', 
                                                    day: 'numeric',
                                                    month: 'long'
                                                })}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                            <Clock className="h-6 w-6 mr-3 text-indigo-200" />
                                            <div>
                                                <div className="text-sm text-indigo-200">Thời gian</div>
                                                <div className="font-bold text-lg">{selectedSlot.startTime} - {selectedSlot.endTime}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-xl">Giá sân:</span>
                                            <span className="font-bold text-3xl text-yellow-300 drop-shadow-lg">{formatCurrency(selectedSlot.price)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-4 ml-8">
                                    <button
                                        onClick={() => setShowBookingDetails(true)}
                                        className="px-8 py-4 bg-white text-blue-600 rounded-2xl hover:bg-blue-50 transition-all duration-300 flex items-center font-bold shadow-xl hover:shadow-2xl transform hover:scale-105"
                                    >
                                        <ShoppingCart className="h-6 w-6 mr-3" />
                                        Thêm dịch vụ & Đặt sân
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedSlot(null);
                                            setBookingGrid(prev => prev.map(s => ({
                                                ...s,
                                                status: s.status === 'selected' ? 'available' : s.status
                                            })));
                                        }}
                                        className="px-8 py-3 border-2 border-white/30 text-white rounded-2xl hover:bg-white/10 transition-all duration-300 font-semibold backdrop-blur-sm"
                                    >
                                        Hủy chọn
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Details Sidebar */}
            {showBookingDetails && selectedSlot && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40" onClick={() => setShowBookingDetails(false)} />
                    <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-gradient-to-br from-white to-blue-50 shadow-2xl z-50 transform transition-transform duration-500 ease-in-out overflow-y-auto border-l border-white/20">
                        <div className="p-8 space-y-8">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b-2 border-gradient-to-r from-blue-200 to-purple-200 pb-6">
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Chi tiết đặt sân</h2>
                                <button
                                    onClick={() => setShowBookingDetails(false)}
                                    className="p-3 hover:bg-red-100 rounded-2xl transition-all duration-300 group"
                                >
                                    <X className="h-6 w-6 text-gray-500 group-hover:text-red-500 group-hover:rotate-90 transition-all duration-300" />
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
                                        <span><strong>{selectedCourt?.name}</strong> - {selectedCourt?.description}</span>
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
                                
                                {mockServices.map(service => (
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

                            {/* Voucher Section */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-gray-900 flex items-center">
                                    <Gift className="h-5 w-5 mr-2 text-gray-600" />
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
                                    
                                    {appliedVoucher && calculateDiscount() > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Giảm giá ({appliedVoucher.code}):</span>
                                            <span>-{formatCurrency(calculateDiscount())}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-lg">
                                        <span>Tổng cộng:</span>
                                        <span className="text-blue-600">{formatCurrency(calculateTotal() - calculateDiscount())}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setShowBookingDetails(false)}
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
                </>
            )}

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
                                                    {formatVoucherValue(voucher.value)}
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

export default BookingDemoPage; 