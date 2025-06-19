"use client"

import React, { useState, useEffect } from 'react';
import { CustomerLayout } from '../../../components/customer-layout';
import { customerInvoiceApi, formatCurrency } from '@/lib/api-client';
import { 
    CreditCard, 
    Clock, 
    CheckCircle, 
    AlertCircle,
    ArrowLeft,
    QrCode,
    Copy,
    ExternalLink,
    RefreshCw,
    History,
    Calendar,
    DollarSign,
    Receipt,
    FileText,
    Download,
    Eye,
    X,
    MapPin,
    Package,
    User,
    Mail,
    Phone
} from 'lucide-react';

// Component hiển thị chi tiết hóa đơn
const InvoiceDetailModal = ({ invoice, onClose, onPayNow }: { 
    invoice: any, 
    onClose: () => void, 
    onPayNow: (invoice: any) => void 
}) => {
    const [detailedInvoice, setDetailedInvoice] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadInvoiceDetail = async () => {
            try {
                setIsLoading(true);
                
                // Debug: Check auth token
                const user = localStorage.getItem('user');
                console.log('Debug: User in localStorage:', user ? 'exists' : 'not found');
                
                console.log('Debug: Loading invoice detail for ID:', invoice.id);
                const response = await customerInvoiceApi.getInvoiceDetails(invoice.id);
                console.log('Debug: API response:', response);
                
                if (response.success) {
                    setDetailedInvoice(response.invoice);
                } else {
                    throw new Error(response.message || 'Unknown error');
                }
            } catch (err) {
                console.error('Error loading invoice detail:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        };

        loadInvoiceDetail();
    }, [invoice.id]);

    const formatDateSafe = (dateString: string | null): string => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleDateString('vi-VN');
        } catch (error) {
            return 'N/A';
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="text-center py-8">
                        <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-2" />
                        <p className="text-gray-600">Đang tải chi tiết hóa đơn...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                        <p className="text-red-600 mb-4">Lỗi tải chi tiết hóa đơn</p>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!detailedInvoice) return null;

    // Phân loại invoice details
    const courtBookings = detailedInvoice.details?.filter((detail: any) => detail.type === 'court') || [];
    const services = detailedInvoice.details?.filter((detail: any) => detail.type === 'service') || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">
                        Chi tiết hóa đơn #{detailedInvoice.id}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Thông tin khách hàng */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <User className="mr-2 text-blue-600" size={18} />
                            Thông tin khách hàng
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center">
                                <User className="mr-2 text-gray-400" size={16} />
                                <span>{detailedInvoice.customerName}</span>
                            </div>
                            <div className="flex items-center">
                                <Mail className="mr-2 text-gray-400" size={16} />
                                <span>{detailedInvoice.customerEmail}</span>
                            </div>
                            <div className="flex items-center">
                                <Phone className="mr-2 text-gray-400" size={16} />
                                <span>{detailedInvoice.customerPhone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Thông tin hóa đơn */}
                    <div className="bg-blue-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <FileText className="mr-2 text-blue-600" size={18} />
                            Thông tin hóa đơn
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex flex-col">
                                <span className="text-gray-600">Mã hóa đơn:</span>
                                <span className="font-medium">#{detailedInvoice.id}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-600">Booking ID:</span>
                                <span className="font-medium">#{detailedInvoice.bookingId}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-600">Ngày tạo:</span>
                                <span className="font-medium">{formatDateSafe(detailedInvoice.invoiceDate)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-600">Trạng thái:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block w-fit ${
                                    detailedInvoice.status === 'Paid' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {detailedInvoice.status === 'Paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Court Bookings */}
                    {courtBookings.length > 0 && (
                        <div className="bg-blue-50 rounded-xl p-4 mb-4">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <MapPin className="mr-2 text-blue-600" size={18} />
                                Đặt sân ({courtBookings.length})
                            </h4>
                            <div className="space-y-3">
                                {courtBookings.map((booking: any, index: number) => (
                                    <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800 mb-1">
                                                    {booking.description || booking.itemName || 'Thuê sân'}
                                                </p>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {booking.timeSlotInfo ? 
                                                        `${formatDateSafe(booking.timeSlotInfo.date)} | ${booking.timeSlotInfo.startTime} - ${booking.timeSlotInfo.endTime}` :
                                                        booking.courtName && booking.bookingDate ? 
                                                            `${booking.courtName} • ${formatDateSafe(booking.bookingDate)}` :
                                                            booking.description || 'Thông tin thời gian không có sẵn'
                                                    }
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-blue-600">
                                                    {formatCurrency(booking.unitPrice || booking.amount || booking.totalPrice || 0)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Services */}
                    {services.length > 0 && (
                        <div className="bg-green-50 rounded-xl p-4 mb-4">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <Package className="mr-2 text-green-600" size={18} />
                                Dịch vụ ({services.length})
                            </h4>
                            <div className="space-y-3">
                                {services.map((service: any, index: number) => (
                                    <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800 mb-1">
                                                    {service.description || service.itemName || 'Dịch vụ'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Số lượng: {service.quantity || 1} | 
                                                    Đơn giá: {formatCurrency(service.unitPrice || service.amount || 0)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-green-600">
                                                    {formatCurrency(service.totalPrice || service.amount || (service.quantity * service.unitPrice) || 0)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tổng thanh toán */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <DollarSign className="mr-2 text-purple-600" size={18} />
                            Tổng thanh toán
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tổng tiền gốc:</span>
                                <span className="font-medium">{formatCurrency(detailedInvoice.originalAmount || 0)}</span>
                            </div>
                            {detailedInvoice.discountAmount > 0 && (
                                <>
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Giảm giá:</span>
                                        <span>-{formatCurrency(detailedInvoice.discountAmount || 0)}</span>
                                    </div>
                                    {detailedInvoice.notes && detailedInvoice.notes.includes('Voucher:') && (
                                        <div className="text-xs text-gray-500 italic">
                                            🎟️ {detailedInvoice.notes}
                                        </div>
                                    )}
                                </>
                            )}
                            <div className="border-t pt-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-800">Thành tiền:</span>
                                    <span className="text-xl font-bold text-blue-600">
                                        {formatCurrency(detailedInvoice.finalAmount || detailedInvoice.totalAmount || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex space-x-3 pt-6 border-t">
                    {detailedInvoice.status === 'Paid' && (
                        <button className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                            <Download className="w-5 h-5 inline mr-2" />
                            Tải hóa đơn PDF
                        </button>
                    )}
                    {detailedInvoice.status === 'Pending' && (
                        <button 
                            onClick={() => onPayNow(detailedInvoice)}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            <CreditCard className="w-5 h-5 inline mr-2" />
                            Thanh toán ngay
                        </button>
                    )}
                    <button 
                        onClick={onClose}
                        className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

// Component hiển thị chi tiết hóa đơn trong thanh toán - copy từ modal
const InvoiceDetailDisplay = ({ invoiceId }: { invoiceId: number }) => {
    const [detailedInvoice, setDetailedInvoice] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadInvoiceDetail = async () => {
            try {
                setIsLoading(true);
                
                // Debug: Check auth token
                const user = localStorage.getItem('user');
                console.log('Debug: User in localStorage:', user ? 'exists' : 'not found');
                
                console.log('Debug: Loading invoice detail for ID:', invoiceId);
                const response = await customerInvoiceApi.getInvoiceDetails(invoiceId);
                console.log('Debug: API response:', response);
                
                if (response.success) {
                    setDetailedInvoice(response.invoice);
                } else {
                    throw new Error(response.message || 'Unknown error');
                }
            } catch (err) {
                console.error('Error loading invoice detail:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        };

        loadInvoiceDetail();
    }, [invoiceId]);

    const formatDateSafe = (dateString: string | null): string => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleDateString('vi-VN');
        } catch (error) {
            return 'N/A';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-2" />
                <p className="text-gray-600">Đang tải chi tiết hóa đơn...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <p className="text-red-600 mb-4">Lỗi tải chi tiết hóa đơn</p>
                <p className="text-gray-600 mb-4">{error}</p>
            </div>
        );
    }

    if (!detailedInvoice) return null;

    // Debug: Log the detailed invoice data
    console.log('DetailedInvoice data in payment display:', detailedInvoice);

    // Phân loại invoice details
    const courtBookings = detailedInvoice.details?.filter((detail: any) => detail.type === 'court') || [];
    const services = detailedInvoice.details?.filter((detail: any) => detail.type === 'service') || [];

    console.log('Court bookings in payment:', courtBookings);
    console.log('Services in payment:', services);

    return (
        <div className="space-y-6">
            {/* Thông tin khách hàng */}
            <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <User className="mr-2 text-blue-600" size={18} />
                    Thông tin khách hàng
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                        <User className="mr-2 text-gray-400" size={16} />
                        <span>{detailedInvoice.customerName}</span>
                    </div>
                    <div className="flex items-center">
                        <Mail className="mr-2 text-gray-400" size={16} />
                        <span>{detailedInvoice.customerEmail}</span>
                    </div>
                    <div className="flex items-center">
                        <Phone className="mr-2 text-gray-400" size={16} />
                        <span>{detailedInvoice.customerPhone}</span>
                    </div>
                </div>
            </div>

            {/* Thông tin hóa đơn */}
            <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FileText className="mr-2 text-blue-600" size={18} />
                    Thông tin hóa đơn
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex flex-col">
                        <span className="text-gray-600">Mã hóa đơn:</span>
                        <span className="font-medium">#{detailedInvoice.id}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-600">Booking ID:</span>
                        <span className="font-medium">#{detailedInvoice.bookingId}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-600">Ngày tạo:</span>
                        <span className="font-medium">{formatDateSafe(detailedInvoice.invoiceDate)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-600">Trạng thái:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block w-fit ${
                            detailedInvoice.status === 'Paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {detailedInvoice.status === 'Paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Chi tiết đặt sân và dịch vụ */}
            <div>
                {/* Court Bookings */}
                {courtBookings.length > 0 && (
                    <div className="bg-blue-50 rounded-xl p-4 mb-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <MapPin className="mr-2 text-blue-600" size={18} />
                            Đặt sân ({courtBookings.length})
                        </h4>
                        <div className="space-y-3">
                            {courtBookings.map((booking: any, index: number) => (
                                <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800 mb-1">
                                                {booking.description || booking.itemName || 'Thuê sân'}
                                            </p>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {booking.timeSlotInfo ? 
                                                    `${formatDateSafe(booking.timeSlotInfo.date)} | ${booking.timeSlotInfo.startTime} - ${booking.timeSlotInfo.endTime}` :
                                                    booking.courtName && booking.bookingDate ? 
                                                        `${booking.courtName} • ${formatDateSafe(booking.bookingDate)}` :
                                                        booking.description || 'Thông tin thời gian không có sẵn'
                                                }
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-blue-600">
                                                {formatCurrency(booking.unitPrice || booking.amount || booking.totalPrice || 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Services */}
                {services.length > 0 && (
                    <div className="bg-green-50 rounded-xl p-4 mb-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <Package className="mr-2 text-green-600" size={18} />
                            Dịch vụ bổ sung ({services.length})
                        </h4>
                        <div className="space-y-3">
                            {services.map((service: any, index: number) => (
                                <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800 mb-1">
                                                {service.description || service.itemName || 'Dịch vụ'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Số lượng: {service.quantity || 1} | 
                                                Đơn giá: {formatCurrency(service.unitPrice || service.amount || 0)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-green-600">
                                                {formatCurrency(service.totalPrice || service.amount || (service.quantity * service.unitPrice) || 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Payment Summary */}
                <div className="bg-gray-100 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Tổng kết thanh toán</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tổng tiền gốc:</span>
                            <span className="font-medium">{formatCurrency(detailedInvoice.originalAmount || 0)}</span>
                        </div>
                        
                        {(detailedInvoice.discountAmount > 0) && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Giảm giá:</span>
                                <span>-{formatCurrency(detailedInvoice.discountAmount || 0)}</span>
                            </div>
                        )}
                        
                        {(detailedInvoice.voucherDescription || detailedInvoice.voucherAmount > 0) && (
                            <div className="flex justify-between text-sm text-purple-600">
                                <span>Voucher {detailedInvoice.voucherDescription ? `(${detailedInvoice.voucherDescription})` : ''}:</span>
                                <span>-{formatCurrency(detailedInvoice.voucherAmount || 0)}</span>
                            </div>
                        )}
                        
                        <div className="border-t pt-2 mt-3">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Thành tiền:</span>
                                <span className="text-blue-600">{formatCurrency(detailedInvoice.finalAmount || detailedInvoice.totalAmount || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PaymentPage = () => {
    const [activeTab, setActiveTab] = useState('invoices'); // 'pending', 'invoices' - Mặc định hiển thị hóa đơn
    const [pendingInvoicesCount, setPendingInvoicesCount] = useState(0);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [paymentStep, setPaymentStep] = useState(1); // 1: method, 2: processing, 3: result
    const [selectedMethod, setSelectedMethod] = useState('momo');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentResult, setPaymentResult] = useState<{success: boolean; transactionId?: string; message: string} | null>(null);
    const [countDown, setCountDown] = useState(300); // 5 minutes countdown
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [invoiceToPayment, setInvoiceToPayment] = useState<any>(null); // Hóa đơn đang thanh toán
    const [statusFilter, setStatusFilter] = useState('all'); // Filter for invoices

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (paymentStep === 2 && countDown > 0) {
            timer = setInterval(() => {
                setCountDown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [paymentStep, countDown]);

    // Load invoices when invoice tab is selected
    useEffect(() => {
        if (activeTab === 'invoices') {
            loadInvoices();
        }
    }, [activeTab]);

    useEffect(() => {
        const loadPendingCount = async () => {
            try {
                // TODO: Lấy userId từ JWT token khi có authentication
                // Tạm thời hardcode userId = 2 (customer)
                const userId = 2;
                
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/customer/invoices/pending-count/${userId}`);
                const data = await response.json();
                if (data.success) {
                    setPendingInvoicesCount(data.pendingCount);
                }
            } catch (error) {
                console.error('Error loading pending invoices count:', error);
            }
        };

        loadPendingCount();
    }, []);

    // Kiểm tra callback từ Momo khi component mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId');
        const resultCode = urlParams.get('resultCode');
        
        if (orderId && resultCode !== null) {
            handleMomoCallback(orderId, resultCode);
            
            // Xóa parameters khỏi URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    }, []);

    const handleMomoCallback = async (orderId: string, resultCode: string) => {
        try {
            setPaymentStep(2); // Hiển thị loading
            
            // Chờ một chút để auto-simulate callback có thời gian cập nhật status
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Kiểm tra trạng thái thanh toán từ server
            const response = await fetch(`/api/customer/payments/momo/status/${orderId}`);
            const data = await response.json();
            
            if (data.success) {
                const isSuccess = resultCode === '0'; // Simplify: nếu resultCode = 0 thì success
                
                setPaymentResult({
                    success: isSuccess,
                    transactionId: data.transactionId || orderId,
                    message: isSuccess 
                        ? "Thanh toán Momo thành công!" 
                        : "Thanh toán Momo không thành công. Vui lòng thử lại."
                });
                
                setPaymentStep(3);
                
                // Refresh invoices nếu thanh toán thành công
                if (isSuccess && activeTab === 'invoices') {
                    loadInvoices();
                }
            } else {
                throw new Error(data.message || 'Không thể kiểm tra trạng thái thanh toán');
            }
        } catch (error: any) {
            console.error('Error handling Momo callback:', error);
            setPaymentResult({
                success: false,
                message: "Có lỗi xảy ra khi xác nhận thanh toán"
            });
            setPaymentStep(3);
        }
    };

    const loadInvoices = async () => {
        try {
            setIsLoadingInvoices(true);
            const response = await customerInvoiceApi.getMyInvoices();
            if (response.success) {
                setInvoices(response.invoices || []);
            }
        } catch (error) {
            console.error('Error loading invoices:', error);
        } finally {
            setIsLoadingInvoices(false);
        }
    };

    // Function để chuyển sang tab thanh toán với hóa đơn
    const handlePayInvoice = (invoice: any) => {
        setInvoiceToPayment(invoice);
        setSelectedInvoice(null); // Đóng modal chi tiết
        setActiveTab('pending'); // Chuyển sang tab thanh toán
        setPaymentStep(1); // Reset payment step
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            completed: { color: "bg-green-100 text-green-800", text: "Thành công", icon: CheckCircle },
            pending: { color: "bg-yellow-100 text-yellow-800", text: "Đang chờ", icon: Clock },
            failed: { color: "bg-red-100 text-red-800", text: "Thất bại", icon: AlertCircle }
        };
        const config = statusConfig[status];
        const Icon = config.icon;
        
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {config.text}
            </span>
        );
    };

    const getPaymentMethodInfo = (method) => {
        const methods = {
            momo: { name: "Ví MoMo", icon: "📱", color: "bg-pink-500" },
            bank: { name: "Chuyển khoản", icon: "🏦", color: "bg-blue-500" },
            cash: { name: "Tiền mặt", icon: "💰", color: "bg-green-500" }
        };
        return methods[method] || methods.cash;
    };

    const handlePayment = async () => {
        // Chỉ cho phép thanh toán khi có hóa đơn được chọn
        if (!invoiceToPayment) {
            alert('Vui lòng chọn hóa đơn để thanh toán từ tab "Hóa đơn"');
            return;
        }
        
        const paymentData = invoiceToPayment;
        
        if (selectedMethod === 'momo') {
            // Thanh toán qua Momo
            await handleMomoPayment();
        } else {
            // Các phương thức thanh toán khác (simulation)
            setIsProcessing(true);
            setPaymentStep(2);
            
            setTimeout(() => {
                const success = Math.random() > 0.2; // 80% success rate
                setPaymentResult({
                    success,
                    transactionId: success ? `TXN${Date.now()}` : null,
                    message: success 
                        ? "Thanh toán thành công!" 
                        : "Thanh toán thất bại. Vui lòng thử lại."
                });
                setPaymentStep(3);
                setIsProcessing(false);
            }, 3000);
        }
    };

    const handleMomoPayment = async () => {
        if (!invoiceToPayment) {
            alert('Vui lòng chọn hóa đơn cần thanh toán từ tab Hóa đơn');
            return;
        }

        try {
            setIsProcessing(true);
            
            // Xác định Invoice ID đúng (có thể là 'id' thay vì 'invoiceId')
            const actualInvoiceId = invoiceToPayment.invoiceId || invoiceToPayment.id;
            console.log('Invoice to payment:', invoiceToPayment); // Debug log
            console.log('Actual Invoice ID to use:', actualInvoiceId); // Debug log
            
            if (!actualInvoiceId) {
                throw new Error('Không tìm thấy Invoice ID hợp lệ');
            }
            
            // Option 1: Test với simulation (không cần API Momo thật)
            const useSimulation = false; // API MoMo thật đã hoạt động!
            
            if (useSimulation) {
                // Simulation: Tạo payment trước, sau đó simulate success
                // Bước 1: Tạo MomoPayment record
                const createResponse = await fetch('/api/customer/payments/momo/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        invoiceId: actualInvoiceId,
                    }),
                });

                if (!createResponse.ok) {
                    const errorData = await createResponse.json();
                    throw new Error(errorData.message || 'Không thể tạo thanh toán');
                }

                const createData = await createResponse.json();
                console.log('Created payment:', createData);

                // Bước 2: Simulate success với orderId vừa tạo
                if (createData.orderId) {
                    const simulateResponse = await fetch(`/api/admin/payments/momo/simulate-success/${createData.orderId}`, {
                        method: 'POST',
                    });
                    
                    if (simulateResponse.ok) {
                        const result = await simulateResponse.json();
                        alert('Thanh toán thành công (simulation)!');
                        
                        // Cập nhật trạng thái hóa đơn
                        setInvoices(prev => prev.map(inv => 
                            inv.invoiceId === invoiceToPayment.invoiceId 
                                ? { ...inv, paymentStatus: 'Đã thanh toán' }
                                : inv
                        ));
                        setInvoiceToPayment(null);
                        setActiveTab('invoices');
                    } else {
                        throw new Error('Simulation failed');
                    }
                } else {
                    throw new Error('Không nhận được orderId từ payment creation');
                }
            } else {
                // Option 2: Dùng API Momo thật
                
                const response = await fetch('/api/customer/payments/momo/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        invoiceId: actualInvoiceId,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Có lỗi xảy ra');
                }

                const data = await response.json();
                console.log('Payment data:', data);

                if (data.payUrl) {
                    // Chuyển hướng đến trang thanh toán Momo
                    window.location.href = data.payUrl;
                } else {
                    throw new Error('Không nhận được URL thanh toán từ Momo');
                }
            }
        } catch (error: any) {
            console.error('Error creating Momo payment:', error);
            alert(`Lỗi: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const renderPaymentHistory = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <History className="mr-2 text-blue-600" size={24} />
                    Lịch sử thanh toán
                </h3>
                
                <div className="text-center py-12">
                    <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Lịch sử thanh toán</h3>
                    <p className="text-gray-500 mb-6">
                        Xem lịch sử thanh toán và giao dịch của bạn tại đây. 
                        <br />
                        Hiện tại bạn có thể xem lịch sử booking tại tab "Lịch sử" trong menu chính.
                    </p>
                    <button
                        onClick={() => window.location.href = '/customer/history'}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Xem lịch sử booking
                    </button>
                </div>
            </div>
        </div>
    );

    const renderPendingPayment = () => {
        // Nếu không có hóa đơn được chọn để thanh toán
        if (!invoiceToPayment) {
            return (
                <div className="text-center py-12">
                    <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {pendingInvoicesCount > 0 
                            ? `Bạn đang có ${pendingInvoicesCount} hóa đơn cần thanh toán`
                            : 'Chưa có hóa đơn cần thanh toán'
                        }
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {pendingInvoicesCount > 0 
                            ? 'Vui lòng chọn hóa đơn từ tab "Hóa đơn" để thanh toán'
                            : 'Tất cả hóa đơn của bạn đã được thanh toán'
                        }
                    </p>
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {pendingInvoicesCount > 0 ? 'Thanh toán ngay' : 'Xem hóa đơn'}
                    </button>
                </div>
            );
        }

        // Sử dụng hóa đơn được chọn để thanh toán
        const paymentData = invoiceToPayment;

        return (
            <div className="space-y-6">
                {/* Header - Invoice Info */}
                {invoiceToPayment && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-blue-800 mb-2">
                                    Thanh toán hóa đơn #{invoiceToPayment.id}
                                </h2>
                                <p className="text-blue-600">
                                    Booking #{invoiceToPayment.bookingId} - {invoiceToPayment.courtName}
                                </p>
                            </div>
                            <button 
                                onClick={() => setInvoiceToPayment(null)}
                                className="text-blue-600 hover:text-blue-800 underline text-sm"
                            >
                                ← Quay lại thanh toán thường
                            </button>
                        </div>
                    </div>
                )}

                {paymentStep === 1 && (
                    <div className="space-y-6">
                        {/* Full Invoice Details */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Chi tiết hóa đơn đầy đủ</h3>
                            
                            {/* Load Invoice Detail */}
                            <InvoiceDetailDisplay invoiceId={paymentData.id} />
                        </div>

                    {/* Payment Methods */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Chọn phương thức thanh toán</h3>
                        
                        <div className="space-y-3">
                            {[
                                { 
                                    id: 'momo', 
                                    name: 'Ví MoMo', 
                                    icon: '📱',
                                    description: 'Thanh toán qua ví điện tử MoMo',
                                    processingTime: 'Tức thì'
                                },
                                { 
                                    id: 'bank', 
                                    name: 'Chuyển khoản ngân hàng', 
                                    icon: '🏦',
                                    description: 'Chuyển khoản qua ngân hàng',
                                    processingTime: '5-10 phút'
                                },
                                { 
                                    id: 'cash', 
                                    name: 'Thanh toán tại quầy', 
                                    icon: '💰',
                                    description: 'Thanh toán bằng tiền mặt tại cơ sở',
                                    processingTime: 'Khi đến sân'
                                }
                            ].map((method) => (
                                <label 
                                    key={method.id} 
                                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                        selectedMethod === method.id 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method.id}
                                        checked={selectedMethod === method.id}
                                        onChange={(e) => setSelectedMethod(e.target.value)}
                                        className="sr-only"
                                    />
                                    <span className="text-3xl mr-4">{method.icon}</span>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-800">{method.name}</h4>
                                        <p className="text-sm text-gray-600">{method.description}</p>
                                        <p className="text-xs text-blue-600 mt-1">Xử lý: {method.processingTime}</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        selectedMethod === method.id ? 'border-blue-500' : 'border-gray-300'
                                    }`}>
                                        {selectedMethod === method.id && (
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        )}
                                    </div>
                                </label>
                            )                            )}
                        </div>
                        
                        <button
                            onClick={handlePayment}
                            className="w-full mt-6 bg-blue-600 text-white py-4 rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors"
                        >
                            Thanh toán {formatCurrency(paymentData.finalAmount)}
                        </button>
                    </div>
                </div>
            )}

            {paymentStep === 2 && (
                <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Đang xử lý thanh toán</h3>
                        <p className="text-gray-600">Vui lòng không đóng trang này</p>
                    </div>

                    {selectedMethod === 'momo' && (
                        <div className="bg-pink-50 rounded-lg p-6 mb-6">
                            <QrCode className="w-32 h-32 mx-auto mb-4 text-pink-600" />
                            <p className="text-sm text-gray-600 mb-2">Quét mã QR để thanh toán với MoMo</p>
                            <p className="text-lg font-bold text-pink-600">
                                {formatCurrency(paymentData.finalAmount)}
                            </p>
                        </div>
                    )}

                    {selectedMethod === 'bank' && (
                        <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
                            <h4 className="font-bold text-blue-800 mb-3">Thông tin chuyển khoản</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Ngân hàng:</span>
                                    <span className="font-medium">Vietcombank</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Số tài khoản:</span>
                                    <div className="flex items-center">
                                        <span className="font-medium mr-2">0123456789</span>
                                        <button className="text-blue-600 hover:text-blue-800">
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span>Chủ tài khoản:</span>
                                    <span className="font-medium">ShuttleSync Co.</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Nội dung:</span>
                                    <div className="flex items-center">
                                        <span className="font-medium mr-2">{paymentData.bookingId}</span>
                                        <button className="text-blue-600 hover:text-blue-800">
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-blue-600">
                                    <span>Số tiền:</span>
                                    <span>{formatCurrency(paymentData.finalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-yellow-50 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                            Thời gian còn lại: <span className="font-bold">
                                {Math.floor(countDown / 60)}:{(countDown % 60).toString().padStart(2, '0')}
                            </span>
                        </p>
                    </div>
                </div>
            )}

            {paymentStep === 3 && (
                <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        paymentResult?.success ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                        {paymentResult?.success ? (
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        ) : (
                            <AlertCircle className="w-10 h-10 text-red-600" />
                        )}
                    </div>
                    
                    <h3 className={`text-2xl font-bold mb-2 ${
                        paymentResult?.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                        {paymentResult?.message}
                    </h3>
                    
                    {paymentResult?.success && paymentResult?.transactionId && (
                        <p className="text-gray-600 mb-6">
                            Mã giao dịch: <span className="font-medium">{paymentResult.transactionId}</span>
                        </p>
                    )}
                    
                    <div className="space-y-3">
                        {paymentResult?.success ? (
                            <>
                                <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                                    Xem chi tiết booking
                                </button>
                                <button 
                                    onClick={() => setActiveTab('invoices')}
                                    className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                >
                                    Xem lịch sử thanh toán
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => setPaymentStep(1)}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Thử lại
                                </button>
                                <button className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                                    Liên hệ hỗ trợ
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
        );
    };

    const renderPaymentMethods = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Quản lý phương thức thanh toán</h3>
                
                <div className="space-y-4">
                    {[
                        { id: 'momo', name: 'Ví MoMo', icon: '📱', status: 'connected', lastUsed: '2024-01-20' },
                        { id: 'bank', name: 'Ngân hàng', icon: '🏦', status: 'connected', lastUsed: '2024-01-18' },
                        { id: 'credit', name: 'Thẻ tín dụng', icon: '💳', status: 'not_connected', lastUsed: null }
                    ].map((method) => (
                        <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{method.icon}</span>
                                <div>
                                    <p className="font-medium text-gray-800">{method.name}</p>
                                    <p className="text-sm text-gray-600">
                                        {method.status === 'connected' 
                                            ? `Sử dụng lần cuối: ${new Date(method.lastUsed).toLocaleDateString('vi-VN')}`
                                            : 'Chưa kết nối'
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {method.status === 'connected' ? (
                                    <>
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                            Đã kết nối
                                        </span>
                                        <button className="text-red-600 hover:text-red-800 text-sm">
                                            Ngắt kết nối
                                        </button>
                                    </>
                                ) : (
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                                        Kết nối
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderInvoices = () => {
        // Filter invoices by status
        const filteredInvoices = invoices.filter(invoice => {
            if (statusFilter === 'pending') return invoice.status === 'Pending';
            if (statusFilter === 'paid') return invoice.status === 'Paid';
            return true; // 'all'
        });

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center">
                            <FileText className="mr-2 text-blue-600" size={24} />
                            Danh sách hóa đơn
                        </h3>
                        
                        {/* Filter buttons */}
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    statusFilter === 'all' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Tất cả ({invoices.length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('pending')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    statusFilter === 'pending' 
                                        ? 'bg-yellow-600 text-white' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Chờ thanh toán ({invoices.filter(inv => inv.status === 'Pending').length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('paid')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    statusFilter === 'paid' 
                                        ? 'bg-green-600 text-white' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Đã thanh toán ({invoices.filter(inv => inv.status === 'Paid').length})
                            </button>
                        </div>
                    </div>
                
                {isLoadingInvoices ? (
                    <div className="text-center py-8">
                        <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-2" />
                        <p className="text-gray-600">Đang tải hóa đơn...</p>
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="text-center py-8">
                        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">Chưa có hóa đơn nào</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredInvoices.map((invoice) => (
                            <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                Hóa đơn #{invoice.id}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {invoice.courtName} - Booking #{invoice.bookingId}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(invoice.bookingDate).toLocaleDateString('vi-VN')} | 
                                                {invoice.startTime} - {invoice.endTime}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-gray-800">
                                            {formatCurrency(invoice.finalAmount)}
                                        </p>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            invoice.status === 'Paid' 
                                                ? 'bg-green-100 text-green-800' 
                                                : invoice.status === 'Pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {invoice.status === 'Paid' ? 'Đã thanh toán' : 
                                             invoice.status === 'Pending' ? 'Chờ thanh toán' : 
                                             invoice.status}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                    <span>Ngày tạo: {new Date(invoice.invoiceDate).toLocaleDateString('vi-VN')}</span>
                                    {invoice.discountAmount > 0 && (
                                        <span className="text-green-600">
                                            Giảm giá: {formatCurrency(invoice.discountAmount)}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <button 
                                        onClick={() => setSelectedInvoice(invoice)}
                                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        <Eye size={16} className="mr-1" />
                                        Xem chi tiết
                                    </button>
                                    {invoice.status === 'Paid' && (
                                        <button className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium">
                                            <Download size={16} className="mr-1" />
                                            Tải PDF
                                        </button>
                                    )}
                                    {invoice.status === 'Pending' && (
                                        <button 
                                            onClick={() => handlePayInvoice(invoice)}
                                            className="flex items-center text-orange-600 hover:text-orange-800 text-sm font-medium"
                                        >
                                            <CreditCard size={16} className="mr-1" />
                                            Thanh toán ngay
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Invoice Detail Modal */}
            {selectedInvoice && (
                <InvoiceDetailModal 
                    invoice={selectedInvoice} 
                    onClose={() => setSelectedInvoice(null)}
                    onPayNow={handlePayInvoice}
                />
            )}
        </div>
        );
    };

    return (
        <CustomerLayout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                        <CreditCard className="mr-3 text-blue-600" size={32} />
                        Thanh toán
                    </h1>
                    <p className="text-gray-600">Quản lý thanh toán và lịch sử giao dịch</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                        {[
                            { id: 'invoices', label: 'Hóa đơn', icon: FileText },
                            { id: 'pending', label: 'Thanh toán', icon: CreditCard }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                        activeTab === tab.id
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-600 hover:text-blue-600'
                                    }`}
                                >
                                    <Icon size={18} className="mr-2" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div>
                    {activeTab === 'invoices' && renderInvoices()}
                    {activeTab === 'pending' && renderPendingPayment()}
                </div>
            </div>
        </CustomerLayout>
    );
};

export default PaymentPage; 