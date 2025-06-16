// API Client for Customer Dashboard
// Tạm thời sử dụng mock data, sau này sẽ kết nối với backend thực

const API_BASE_URL = 'http://localhost:8080/api';

// Mock data tạm thời
const mockStats = {
  totalBookings: 15,
  completedBookings: 10,
  upcomingBookings: 3,
  cancelledBookings: 2,
  totalSpent: 2500000.0,
  totalSaved: 250000.0,
  favoriteCourtId: 1,
  favoriteCourtName: "Sân 1",
  loyaltyPoints: 150,
  membershipLevel: "Gold"
};

const mockRecentBookings = [
  {
    bookingId: 1,
    courtName: "Sân 1",
    bookingDate: "2024-01-20",
    startTime: "09:00",
    endTime: "11:00",
    status: "Đã xác nhận",
    amount: 200000.0,
    paymentStatus: "Đã thanh toán",
    canCancel: true,
    canReview: false
  },
  {
    bookingId: 2,
    courtName: "Sân 3",
    bookingDate: "2024-01-18",
    startTime: "14:00",
    endTime: "16:00",
    status: "Đã hoàn thành",
    amount: 250000.0,
    paymentStatus: "Đã thanh toán",
    canCancel: false,
    canReview: true
  },
  {
    bookingId: 3,
    courtName: "Sân 2",
    bookingDate: "2024-01-15",
    startTime: "19:00",
    endTime: "21:00",
    status: "Đã hủy",
    amount: 200000.0,
    paymentStatus: "Đã hoàn tiền",
    canCancel: false,
    canReview: false
  }
];

const mockAvailableCourts = [
  {
    id: 1,
    name: "Sân 1",
    description: "Sân cầu lông tiêu chuẩn nhà thi đấu 1",
    location: "Khu A",
    priceRange: "200,000 - 300,000 VND",
    rating: 4.5,
    isPopular: true,
    amenities: ["Điều hòa", "Thay đồ", "Nước uống"],
    image: "/images/court1.jpg",
    availableSlots: 6
  },
  {
    id: 2,
    name: "Sân 2", 
    description: "Sân cầu lông tiêu chuẩn nhà thi đấu 2",
    location: "Khu A",
    priceRange: "200,000 - 300,000 VND",
    rating: 4.3,
    isPopular: true,
    amenities: ["Điều hòa", "Thay đồ", "Nước uống"],
    image: "/images/court2.jpg",
    availableSlots: 4
  },
  {
    id: 3,
    name: "Sân 3",
    description: "Sân cầu lông tiêu chuẩn nhà thi đấu 3", 
    location: "Khu B",
    priceRange: "250,000 - 350,000 VND",
    rating: 4.7,
    isPopular: true,
    amenities: ["Điều hòa", "Thay đồ", "Nước uống", "Ghế massage"],
    image: "/images/court3.jpg",
    availableSlots: 3
  }
];

const mockTimeSlots = [
  {
    id: 1,
    slotIndex: 1,
    startTime: "05:00",
    endTime: "07:00",
    price: 200000,
    isAvailable: true,
    courtId: 1
  },
  {
    id: 2,
    slotIndex: 2,
    startTime: "07:00",
    endTime: "09:00", 
    price: 250000,
    isAvailable: false,
    courtId: 1
  },
  {
    id: 3,
    slotIndex: 3,
    startTime: "09:00",
    endTime: "11:00",
    price: 300000,
    isAvailable: true,
    courtId: 1
  }
];

const mockUserProfile = {
  id: 1,
  fullName: "Nguyễn Văn A",
  email: "user1@example.com",
  phone: "0901234567",
  membershipLevel: "Gold",
  points: 150
};

const mockNotifications = [
  {
    id: 1,
    message: "Booking của bạn cho Sân 1 vào ngày mai đã được xác nhận",
    isRead: false,
    createdAt: new Date()
  },
  {
    id: 2,
    message: "Nhắc nhở: Bạn có lịch chơi vào 14h hôm nay",
    isRead: true,
    createdAt: new Date()
  }
];

// Helper function to get auth headers
const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`
  };
};

// API functions với real endpoints
export const dashboardApi = {
  // Dashboard Stats
  async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/dashboard/stats`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to mock data
      return mockStats;
    }
  },

  // Recent Bookings
  async getRecentBookings(limit = 5) {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/dashboard/recent-bookings?limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent bookings');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
      // Fallback to mock data
      return mockRecentBookings.slice(0, limit);
    }
  },

  // Available Courts
  async getAvailableCourts() {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/dashboard/available-courts`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch available courts');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching available courts:', error);
      // Fallback to mock data
      return mockAvailableCourts;
    }
  },

  // User Profile
  async getUserProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/dashboard/user-profile`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to mock data
      return mockUserProfile;
    }
  },

  // Notifications
  async getNotifications(limit = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/dashboard/notifications?limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to mock data
      return mockNotifications.slice(0, limit);
    }
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: number) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
    return { message: "Đã đánh dấu thông báo là đã đọc" };
  }
};

export const bookingApi = {
  // Get Courts
  async getCourts(filters?: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockAvailableCourts;
  },

  // Get Time Slots
  async getTimeSlots(courtId: number, date: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockTimeSlots;
  },

  // Create Booking
  async createBooking(bookingData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/booking/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Calculate Price
  async calculatePrice(bookingData: any) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const basePrice = 200000;
    const servicePrice = 30000;
    const discount = 20000;
    const total = basePrice + servicePrice - discount;
    
    return {
      basePrice,
      servicePrice,
      discount,
      total,
      currency: "VND"
    };
  },

  // Get Available Vouchers
  async getAvailableVouchers(totalAmount: number) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      {
        id: 1,
        code: "WELCOME10",
        name: "Chào mừng khách hàng mới",
        description: "Giảm 10% cho đơn hàng đầu tiên",
        discountType: "percentage",
        discountValue: 10,
        minAmount: 200000,
        maxDiscount: 50000
      },
      {
        id: 2,
        code: "WEEKEND20",
        name: "Khuyến mãi cuối tuần",
        description: "Giảm 20% cho booking cuối tuần",
        discountType: "percentage", 
        discountValue: 20,
        minAmount: 300000,
        maxDiscount: 100000
      }
    ];
  }
};

export const historyApi = {
  // History Stats
  async getHistoryStats() {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      totalBookings: 25,
      completedBookings: 20,
      cancelledBookings: 3,
      upcomingBookings: 2,
      totalSpent: 5000000.0,
      averageRating: 4.5,
      favoriteCourtName: "Sân 1",
      totalPlayTime: 40
    };
  },

  // Booking History
  async getBookingHistory(filters?: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockHistory = [];
    
    for (let i = 1; i <= 15; i++) {
      const statuses = ["completed", "cancelled", "confirmed", "pending"];
      mockHistory.push({
        id: i,
        courtName: `Sân ${(i % 9) + 1}`,
        date: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startTime: `${9 + (i % 8)}:00`,
        endTime: `${11 + (i % 8)}:00`,
        duration: 2.0,
        amount: 200000 + (i % 3) * 50000,
        paymentStatus: i % 4 === 0 ? "unpaid" : "paid",
        status: statuses[i % 4],
        rating: (i % 5) + 1,
        hasReview: i % 3 === 0,
        canRebook: true,
        canReview: statuses[i % 4] === "completed" && i % 3 !== 0,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      });
    }
    
    return mockHistory;
  }
};

export const profileApi = {
  // Get Profile
  async getProfile() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      id: 1,
      fullName: "Nguyễn Văn A",
      email: "user1@example.com",
      phone: "0901234567",
      birthDate: "1990-01-15",
      gender: "Nam",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      avatar: "/images/avatars/user1.jpg",
      membershipLevel: "Gold",
      loyaltyPoints: 1250,
      joinDate: "2023-01-15",
      isEmailVerified: true,
      isPhoneVerified: true,
      lastLoginAt: new Date()
    };
  },

  // Get Achievements
  async getAchievements() {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      totalBookings: 45,
      totalPlayTime: 90,
      favoriteCourtName: "Sân 1", 
      longestStreak: 7,
      averageRating: 4.8,
      totalSpent: 9000000.0,
      totalSaved: 450000.0,
      memberSince: "2023-01-15",
      badges: [
        {
          id: 1,
          name: "Người chơi tích cực",
          description: "Hoàn thành 50+ booking",
          icon: "🏆",
          earnedAt: new Date()
        },
        {
          id: 2,
          name: "Khách hàng thân thiết", 
          description: "Chi tiêu trên 5 triệu",
          icon: "💎",
          earnedAt: new Date()
        }
      ]
    };
  },

  // Get Settings
  async getSettings() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      marketingEmails: false,
      bookingReminders: true,
      paymentReminders: true,
      language: "vi",
      timezone: "Asia/Ho_Chi_Minh",
      currency: "VND",
      twoFactorEnabled: false,
      autoLogout: 30
    };
  }
};

// Utility function để format currency
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Utility function để format date
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

// Utility function để format time
export const formatTime = (timeString: string) => {
  return timeString;
};

// Customer Invoice API
export const customerInvoiceApi = {
  // Get invoice by booking ID
  async getInvoiceByBookingId(bookingId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/invoices/booking/${bookingId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invoice');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching invoice by booking ID:', error);
      throw error;
    }
  },

  // Get all invoices of current user
  async getMyInvoices() {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/invoices/my-invoices`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user invoices');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user invoices:', error);
      throw error;
    }
  },

  // Get invoice details by ID
  async getInvoiceDetails(invoiceId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/invoices/${invoiceId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invoice details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      throw error;
    }
  }
}; 