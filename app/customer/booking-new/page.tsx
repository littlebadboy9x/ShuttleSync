"use client"

import React, { useState, useEffect } from 'react';
import { CustomerLayout } from '@/components/customer-layout';
import { useAuth } from '../../../contexts/AuthContext';
import { 
    Calendar, 
    Clock, 
    MapPin, 
    ChevronLeft, 
    ChevronRight,
    Filter,
    RefreshCw,
    Users,
    Star,
    Check,
    X
} from 'lucide-react';

// Types
interface Court {
    id: number;
    name: string;
    description: string;
    status: string;
}

interface TimeSlot {
    id: number;
    startTime: string;
    endTime: string;
    price: number;
    isAvailable: boolean;
    courtId: number;
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

const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return { 'Content-Type': 'application/json' };
    
    const user = JSON.parse(userStr);
    return {
        'Content-Type': 'application/json',
        ...(user.token && { 'Authorization': `Bearer ${user.token}` })
    };
};

const NewBookingPage = () => {
    const { user } = useAuth();
    
    // State management
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [courts, setCourts] = useState<Court[]>([]);
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [bookingGrid, setBookingGrid] = useState<BookingSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showBookingDetails, setShowBookingDetails] = useState(false);

    // Generate week dates
    const getWeekDates = (date: Date) => {
        const week = [];
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        startOfWeek.setDate(diff);

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startOfWeek);
            currentDate.setDate(startOfWeek.getDate() + i);
            week.push(currentDate);
        }
        return week;
    };

    // Generate time slots for the grid
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

    // Fetch data
    useEffect(() => {
        fetchCourts();
    }, []);

    useEffect(() => {
        if (selectedCourt) {
            fetchWeeklyBookingData();
        }
    }, [selectedCourt, currentWeek]);

    const fetchCourts = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/customer/courts`, {
                headers: getAuthHeaders()
            });
            
            if (response.ok) {
                const data = await response.json();
                setCourts(data);
                if (data.length > 0) {
                    setSelectedCourt(data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching courts:', error);
            // Mock data for development
            const mockCourts = [
                { id: 1, name: "Sân 1", description: "Sân cầu lông tiêu chuẩn", status: "active" },
                { id: 2, name: "Sân 2", description: "Sân cầu lông VIP", status: "active" },
                { id: 3, name: "Sân 3", description: "Sân cầu lông cao cấp", status: "active" }
            ];
            setCourts(mockCourts);
            setSelectedCourt(mockCourts[0]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWeeklyBookingData = async () => {
        if (!selectedCourt) return;
        
        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
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
            case 'available': return 'bg-green-100 hover:bg-green-200 border-green-300 text-green-800';
            case 'booked': return 'bg-red-100 border-red-300 text-red-800 cursor-not-allowed';
            case 'unavailable': return 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed';
            case 'selected': return 'bg-blue-500 border-blue-600 text-white';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (isLoading && courts.length === 0) {
        return (
            <CustomerLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-500" />
                        <p className="text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold text-gray-900">Đặt Sân Cầu Lông</h1>
                            <div className="flex items-center space-x-4">
                                <select 
                                    value={selectedCourt?.id || ''} 
                                    onChange={(e) => {
                                        const court = courts.find(c => c.id === parseInt(e.target.value));
                                        setSelectedCourt(court || null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {courts.map(court => (
                                        <option key={court.id} value={court.id}>
                                            {court.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => fetchWeeklyBookingData()}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Làm mới"
                                >
                                    <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Week Navigation */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => navigateWeek('prev')}
                                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5 mr-1" />
                                Tuần trước
                            </button>
                            
                            <div className="text-center">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {weekDates[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - {' '}
                                    {weekDates[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {selectedCourt?.name} - {selectedCourt?.description}
                                </p>
                            </div>

                            <button
                                onClick={() => navigateWeek('next')}
                                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Tuần sau
                                <ChevronRight className="h-5 w-5 ml-1" />
                            </button>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex items-center justify-center space-x-8">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
                                <span className="text-sm text-gray-600">Còn trống</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
                                <span className="text-sm text-gray-600">Đã đặt</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded mr-2"></div>
                                <span className="text-sm text-gray-600">Đang chọn</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-2"></div>
                                <span className="text-sm text-gray-600">Không hoạt động</span>
                            </div>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Khung giờ
                                        </th>
                                        {weekDates.map((date, index) => (
                                            <th key={index} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 font-semibold">
                                                        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index]}
                                                    </span>
                                                    <span className="text-gray-600">
                                                        {date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                                    </span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {timeSlotLabels.map((timeSlot, timeIndex) => (
                                        <tr key={timeIndex} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                                    {timeSlot.label}
                                                </div>
                                            </td>
                                            {weekDates.map((date, dateIndex) => {
                                                const slot = getSlotForDateTime(date, timeSlot);
                                                const isToday = date.toDateString() === new Date().toDateString();
                                                const isPast = date < new Date() && !isToday;
                                                
                                                return (
                                                    <td key={dateIndex} className="px-3 py-3">
                                                        <button
                                                            onClick={() => slot && handleSlotClick(slot)}
                                                            disabled={isPast || !slot || slot.status === 'booked' || slot.status === 'unavailable'}
                                                            className={`
                                                                w-full h-16 rounded-lg border-2 transition-all duration-200 
                                                                ${isPast ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : ''}
                                                                ${slot ? getStatusColor(slot.status) : 'bg-gray-50 border-gray-200'}
                                                                ${slot?.status === 'available' ? 'hover:shadow-md transform hover:scale-105' : ''}
                                                                ${isToday ? 'ring-2 ring-blue-200' : ''}
                                                            `}
                                                        >
                                                            {slot && !isPast && (
                                                                <div className="flex flex-col items-center justify-center h-full">
                                                                    {slot.status === 'available' && (
                                                                        <>
                                                                            <Check className="h-4 w-4 mb-1" />
                                                                            <span className="text-xs font-medium">
                                                                                {formatCurrency(slot.price)}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                    {slot.status === 'booked' && (
                                                                        <X className="h-5 w-5" />
                                                                    )}
                                                                    {slot.status === 'selected' && (
                                                                        <>
                                                                            <Users className="h-4 w-4 mb-1" />
                                                                            <span className="text-xs font-medium">
                                                                                Đã chọn
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {isPast && (
                                                                <div className="flex items-center justify-center h-full">
                                                                    <span className="text-xs text-gray-400">Đã qua</span>
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
                        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Thông tin đặt sân</h3>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-sm text-gray-600">
                                            <strong>Sân:</strong> {selectedCourt?.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Ngày:</strong> {new Date(selectedSlot.date).toLocaleDateString('vi-VN', { 
                                                weekday: 'long', 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Thời gian:</strong> {selectedSlot.startTime} - {selectedSlot.endTime}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Giá:</strong> {formatCurrency(selectedSlot.price)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => {
                                            setSelectedSlot(null);
                                            setShowBookingDetails(false);
                                            // Clear selection
                                            setBookingGrid(prev => prev.map(s => ({
                                                ...s,
                                                status: s.status === 'selected' ? 'available' : s.status
                                            })));
                                        }}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Navigate to booking confirmation
                                            window.location.href = '/customer/booking';
                                        }}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        Tiếp tục đặt sân
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
};

export default NewBookingPage; 