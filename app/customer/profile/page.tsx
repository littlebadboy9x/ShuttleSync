"use client"

import React, { useState, useEffect } from 'react';
import { CustomerLayout } from '../../../components/customer-layout';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    Trophy, 
    Star, 
    Edit3, 
    Save, 
    X, 
    Camera, 
    Shield, 
    Bell, 
    CreditCard, 
    Gift, 
    Settings,
    Award,
    Target,
    Clock,
    TrendingUp,
    Heart,
    Zap,
    Upload
} from 'lucide-react';

// Mock user data
const mockUser = {
    id: 1,
    name: "Nguyễn Văn An",
    email: "nguyenvanan@email.com",
    phone: "0123456789",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    dateOfBirth: "1990-05-15",
    gender: "male",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    membershipLevel: "Gold",
    memberSince: "2024-01-15",
    points: 2450,
    totalBookings: 28,
    completedBookings: 25,
    favoriteCourtType: "VIP",
    averageRating: 4.8,
    totalSpent: 4200000,
    achievements: [
        { id: 1, name: "Khách hàng thân thiết", icon: "🏆", description: "Đặt sân 10 lần" },
        { id: 2, name: "Người chơi tích cực", icon: "⚡", description: "Chơi 20 giờ trong tháng" },
        { id: 3, name: "Đánh giá tốt", icon: "⭐", description: "Duy trì rating 4.5+" }
    ]
};

const ProfilePage = () => {
    const [user, setUser] = useState(mockUser);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(mockUser);
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUser(editData);
        setIsEditing(false);
        setIsLoading(false);
        alert('Cập nhật thông tin thành công!');
    };

    const handleCancel = () => {
        setEditData(user);
        setIsEditing(false);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
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
                    {trend && (
                        <div className="flex items-center mt-2">
                            <TrendingUp size={12} className="mr-1 text-white/90" />
                            <span className="text-white/90 text-xs font-medium">{trend}</span>
                        </div>
                    )}
                </div>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            </div>
        </div>
    );

    const AchievementCard = ({ achievement }) => (
        <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3">
                <div className="text-3xl">{achievement.icon}</div>
                <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{achievement.name}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
            </div>
        </div>
    );

    const TabButton = ({ tab, label, icon: Icon, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
        >
            <Icon size={20} className="mr-2" />
            {label}
        </button>
    );

    return (
        <CustomerLayout>
            <div className="p-6 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                        <User className="mr-3 text-blue-600" size={32} />
                        Hồ sơ cá nhân
                    </h1>
                    <p className="text-gray-600">Quản lý thông tin tài khoản và cài đặt của bạn</p>
                </div>

                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.1%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between">
                        <div className="flex items-center space-x-6 mb-6 md:mb-0">
                            <div className="relative group">
                                <img 
                                    src={user.avatar} 
                                    alt={user.name}
                                    className="w-24 h-24 rounded-full ring-4 ring-white/30 object-cover"
                                />
                                <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <Camera className="text-white" size={24} />
                                </button>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-2">{user.name}</h2>
                                <div className="flex items-center space-x-4 text-white/90">
                                    <div className="flex items-center">
                                        <Trophy className="mr-2" size={16} />
                                        <span>{user.membershipLevel} Member</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Star className="mr-2 text-yellow-300" size={16} />
                                        <span>{user.points} điểm</span>
                                    </div>
                                </div>
                                <p className="text-white/80 text-sm mt-2">
                                    Thành viên từ {new Date(user.memberSince).toLocaleDateString('vi-VN')}
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center"
                            >
                                <Edit3 size={20} className="mr-2" />
                                Chỉnh sửa
                            </button>
                            <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center">
                                <Upload size={20} className="mr-2" />
                                Đổi ảnh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Tổng đặt sân"
                        value={user.totalBookings}
                        icon={Calendar}
                        color="from-blue-500 to-blue-600"
                        subtitle="Tất cả thời gian"
                        trend="+12%"
                    />
                    <StatCard
                        title="Hoàn thành"
                        value={user.completedBookings}
                        icon={Target}
                        color="from-green-500 to-emerald-600"
                        subtitle="Đã chơi xong"
                        trend="+8%"
                    />
                    <StatCard
                        title="Đánh giá trung bình"
                        value={user.averageRating}
                        icon={Star}
                        color="from-yellow-500 to-orange-600"
                        subtitle="Điểm đánh giá"
                        trend="+0.2"
                    />
                    <StatCard
                        title="Tổng chi tiêu"
                        value={formatCurrency(user.totalSpent)}
                        icon={CreditCard}
                        color="from-purple-500 to-pink-600"
                        subtitle="Đã thanh toán"
                        trend="+15%"
                    />
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                    <div className="flex space-x-2 overflow-x-auto">
                        <TabButton
                            tab="profile"
                            label="Thông tin cá nhân"
                            icon={User}
                            isActive={activeTab === 'profile'}
                            onClick={() => setActiveTab('profile')}
                        />
                        <TabButton
                            tab="achievements"
                            label="Thành tích"
                            icon={Award}
                            isActive={activeTab === 'achievements'}
                            onClick={() => setActiveTab('achievements')}
                        />
                        <TabButton
                            tab="settings"
                            label="Cài đặt"
                            icon={Settings}
                            isActive={activeTab === 'settings'}
                            onClick={() => setActiveTab('settings')}
                        />
                        <TabButton
                            tab="preferences"
                            label="Sở thích"
                            icon={Heart}
                            isActive={activeTab === 'preferences'}
                            onClick={() => setActiveTab('preferences')}
                        />
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    {activeTab === 'profile' && (
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h3>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors hover:bg-blue-50 px-3 py-2 rounded-lg"
                                    >
                                        <Edit3 size={16} className="mr-1" />
                                        Chỉnh sửa
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                                            <input
                                                type="text"
                                                value={editData.name}
                                                onChange={(e) => setEditData({...editData, name: e.target.value})}
                                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={editData.email}
                                                onChange={(e) => setEditData({...editData, email: e.target.value})}
                                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                                            <input
                                                type="tel"
                                                value={editData.phone}
                                                onChange={(e) => setEditData({...editData, phone: e.target.value})}
                                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                                            <input
                                                type="date"
                                                value={editData.dateOfBirth}
                                                onChange={(e) => setEditData({...editData, dateOfBirth: e.target.value})}
                                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                                            <select
                                                value={editData.gender}
                                                onChange={(e) => setEditData({...editData, gender: e.target.value})}
                                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="male">Nam</option>
                                                <option value="female">Nữ</option>
                                                <option value="other">Khác</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                                            <input
                                                type="text"
                                                value={editData.address}
                                                onChange={(e) => setEditData({...editData, address: e.target.value})}
                                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={handleCancel}
                                            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={isLoading}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 flex items-center"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={16} className="mr-2" />
                                                    Lưu thay đổi
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center">
                                            <Mail className="mr-3 text-gray-400" size={20} />
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="font-medium text-gray-800">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Phone className="mr-3 text-gray-400" size={20} />
                                            <div>
                                                <p className="text-sm text-gray-500">Số điện thoại</p>
                                                <p className="font-medium text-gray-800">{user.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="mr-3 text-gray-400" size={20} />
                                            <div>
                                                <p className="text-sm text-gray-500">Ngày sinh</p>
                                                <p className="font-medium text-gray-800">{new Date(user.dateOfBirth).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-start">
                                            <MapPin className="mr-3 text-gray-400 mt-1" size={20} />
                                            <div>
                                                <p className="text-sm text-gray-500">Địa chỉ</p>
                                                <p className="font-medium text-gray-800">{user.address}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Trophy className="mr-3 text-gray-400" size={20} />
                                            <div>
                                                <p className="text-sm text-gray-500">Hạng thành viên</p>
                                                <p className="font-medium text-yellow-600">{user.membershipLevel} Member</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="mr-3 text-gray-400" size={20} />
                                            <div>
                                                <p className="text-sm text-gray-500">Thành viên từ</p>
                                                <p className="font-medium text-gray-800">{new Date(user.memberSince).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'achievements' && (
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Thành tích đạt được</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {user.achievements.map((achievement) => (
                                    <AchievementCard key={achievement.id} achievement={achievement} />
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Cài đặt tài khoản</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center">
                                        <Bell className="mr-3 text-blue-600" size={20} />
                                        <div>
                                            <p className="font-medium text-gray-800">Thông báo email</p>
                                            <p className="text-sm text-gray-600">Nhận thông báo về đặt sân qua email</p>
                                        </div>
                                    </div>
                                    <input type="checkbox" defaultChecked className="toggle" />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center">
                                        <Shield className="mr-3 text-green-600" size={20} />
                                        <div>
                                            <p className="font-medium text-gray-800">Xác thực 2 bước</p>
                                            <p className="text-sm text-gray-600">Tăng cường bảo mật tài khoản</p>
                                        </div>
                                    </div>
                                    <input type="checkbox" className="toggle" />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center">
                                        <Zap className="mr-3 text-purple-600" size={20} />
                                        <div>
                                            <p className="font-medium text-gray-800">Đặt sân nhanh</p>
                                            <p className="text-sm text-gray-600">Lưu thông tin để đặt sân nhanh hơn</p>
                                        </div>
                                    </div>
                                    <input type="checkbox" defaultChecked className="toggle" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Sở thích cá nhân</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại sân yêu thích</label>
                                    <select className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="VIP">Sân VIP</option>
                                        <option value="Premium">Sân Premium</option>
                                        <option value="Standard">Sân tiêu chuẩn</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Giờ chơi ưa thích</label>
                                    <select className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="morning">Buổi sáng (6:00 - 12:00)</option>
                                        <option value="afternoon">Buổi chiều (12:00 - 18:00)</option>
                                        <option value="evening">Buổi tối (18:00 - 22:00)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
};

export default ProfilePage; 