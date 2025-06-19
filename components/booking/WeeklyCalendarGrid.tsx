"use client"

import React, { useState, useEffect } from 'react';
import { 
    Clock, 
    ChevronLeft, 
    ChevronRight,
    RefreshCw,
    Users,
    Check,
    X,
    Calendar
} from 'lucide-react';

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

interface WeeklyCalendarGridProps {
    courts: Court[];
    selectedCourt: Court | null;
    onCourtChange: (court: Court) => void;
    onSlotSelect: (slot: BookingSlot) => void;
    selectedSlot: BookingSlot | null;
    isLoading?: boolean;
}

const WeeklyCalendarGrid: React.FC<WeeklyCalendarGridProps> = ({
    courts,
    selectedCourt,
    onCourtChange,
    onSlotSelect,
    selectedSlot,
    isLoading = false
}) => {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [bookingGrid, setBookingGrid] = useState<BookingSlot[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

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

    // Fetch booking data for the week
    useEffect(() => {
        if (selectedCourt) {
            fetchWeeklyBookingData();
        }
    }, [selectedCourt, currentWeek]);

    const fetchWeeklyBookingData = async () => {
        if (!selectedCourt) return;
        
        setIsLoadingData(true);
        const weeklyData: BookingSlot[] = [];

        try {
            // Mock API call - replace with actual API
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Generate mock data for each day
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
        } catch (error) {
            console.error('Error fetching weekly data:', error);
        } finally {
            setIsLoadingData(false);
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
            
            onSlotSelect({ ...slot, status: 'selected' });
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
                return 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:border-green-300 hover:shadow-md transform hover:scale-105';
            case 'booked': 
                return 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed';
            case 'unavailable': 
                return 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed';
            case 'selected': 
                return 'bg-blue-500 border-blue-600 text-white shadow-lg transform scale-105';
            default: 
                return 'bg-gray-50 border-gray-200';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Calendar className="h-7 w-7 mr-3 text-blue-500" />
                        Lịch Đặt Sân
                    </h2>
                    <div className="flex items-center space-x-4">
                        <select 
                            value={selectedCourt?.id || ''} 
                            onChange={(e) => {
                                const court = courts.find(c => c.id === parseInt(e.target.value));
                                if (court) onCourtChange(court);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                            {courts.map(court => (
                                <option key={court.id} value={court.id}>
                                    {court.name}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={fetchWeeklyBookingData}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="Làm mới"
                        >
                            <RefreshCw className={`h-5 w-5 ${isLoadingData ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Week Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigateWeek('prev')}
                        className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    >
                        <ChevronLeft className="h-5 w-5 mr-1" />
                        Tuần trước
                    </button>
                    
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {weekDates[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - {' '}
                            {weekDates[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {selectedCourt?.name} - {selectedCourt?.description}
                        </p>
                    </div>

                    <button
                        onClick={() => navigateWeek('next')}
                        className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    >
                        Tuần sau
                        <ChevronRight className="h-5 w-5 ml-1" />
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-center space-x-6 flex-wrap">
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-50 border-2 border-green-200 rounded mr-2"></div>
                        <span className="text-sm text-gray-600 font-medium">Còn trống</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-50 border-2 border-red-200 rounded mr-2"></div>
                        <span className="text-sm text-gray-600 font-medium">Đã đặt</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-500 border-2 border-blue-600 rounded mr-2"></div>
                        <span className="text-sm text-gray-600 font-medium">Đang chọn</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-50 border-2 border-gray-200 rounded mr-2"></div>
                        <span className="text-sm text-gray-600 font-medium">Không hoạt động</span>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th className="w-36 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Khung giờ
                                </th>
                                {weekDates.map((date, index) => {
                                    const isToday = date.toDateString() === new Date().toDateString();
                                    return (
                                        <th key={index} className={`px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider ${
                                            isToday ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                                        }`}>
                                            <div className="flex flex-col">
                                                <span className={`font-bold text-sm ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
                                                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index]}
                                                </span>
                                                <span className={`text-xs ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                                                    {date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                                </span>
                                                {isToday && (
                                                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full mt-1">
                                                        Hôm nay
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {timeSlotLabels.map((timeSlot, timeIndex) => (
                                <tr key={timeIndex} className="hover:bg-gray-50/50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 bg-gray-50/50">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-3 text-gray-400" />
                                            <div>
                                                <div className="font-medium">{timeSlot.startTime}</div>
                                                <div className="text-xs text-gray-500">{timeSlot.endTime}</div>
                                            </div>
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
                                                        w-full h-20 rounded-xl border-2 transition-all duration-300 
                                                        ${isPast ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50' : ''}
                                                        ${slot ? getStatusColor(slot.status) : 'bg-gray-50 border-gray-200'}
                                                        ${isToday && slot?.status !== 'selected' ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}
                                                        focus:outline-none focus:ring-4 focus:ring-blue-200 focus:ring-opacity-50
                                                    `}
                                                >
                                                    {slot && !isPast && (
                                                        <div className="flex flex-col items-center justify-center h-full p-2">
                                                            {slot.status === 'available' && (
                                                                <>
                                                                    <Check className="h-5 w-5 mb-1" />
                                                                    <span className="text-xs font-semibold leading-tight">
                                                                        {formatCurrency(slot.price)}
                                                                    </span>
                                                                </>
                                                            )}
                                                            {slot.status === 'booked' && (
                                                                <>
                                                                    <X className="h-5 w-5 mb-1" />
                                                                    <span className="text-xs font-medium">Đã đặt</span>
                                                                </>
                                                            )}
                                                            {slot.status === 'selected' && (
                                                                <>
                                                                    <Users className="h-5 w-5 mb-1" />
                                                                    <span className="text-xs font-semibold">
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
                
                {isLoadingData && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                        <div className="text-center">
                            <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-2 text-blue-500" />
                            <p className="text-gray-600 text-sm">Đang tải dữ liệu...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeeklyCalendarGrid; 