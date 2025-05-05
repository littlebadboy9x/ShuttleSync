# 🏸 ShuttleSync – Hệ thống đặt lịch sân cầu lông

ShuttleSync là hệ thống đặt lịch sân cầu lông trực tuyến dành cho nhà thi đấu có 20 sân. Ứng dụng hỗ trợ đặt sân, thanh toán trực tuyến, gửi thông báo và quản lý toàn bộ hoạt động qua dashboard Admin.

---

## 🚀 Tính năng chính

### 👤 Đăng ký / Đăng nhập
- Hỗ trợ đăng nhập bằng Google (OAuth)
- Phân quyền người dùng: Admin và Khách

### 📅 Đặt lịch sân
- Hiển thị 20 sân cầu lông và tình trạng trống theo ngày/giờ
- Đặt sân với giao diện trực quan
- Thanh toán qua Momo / VNPAY

### 📊 Quản trị (Admin)
- Quản lý người dùng, lịch đặt sân và thông tin sân
- Duyệt, hủy, chỉnh sửa lịch đặt

### 🔔 Thông báo
- Gửi email và thông báo đẩy khi đặt sân thành công hoặc gần đến giờ thi đấu

---

## 🛠️ Công nghệ sử dụng

| Thành phần  | Công nghệ |
|------------|-----------|
| Backend    | Java 17, Spring Boot 3, Spring Data JPA, SQL Server |
| Frontend   | Next.js 15.3.1, React 19.1.0, TypeScript, Tailwind CSS 4.1.5 |
| Auth       | Google OAuth 2.0 |
| Thanh toán | Momo, VNPAY |
| Deploy     | Docker (trong cùng mạng Wi-Fi) |
| Cơ sở dữ liệu | SQL Server |
| Kiến trúc  | Monorepo (quản lý frontend và backend cùng repo) |

---

## 📁 Cấu trúc thư mục

ShuttleSync/
├── src/                # Backend: Spring Boot Application
│   ├── main/
│   └── Dockerfile
├── frontend/           # Frontend: Next.js + React + Tailwind
│   ├── app/
│   └── tailwind.config.ts
├── .gitignore
├── docker-compose.yml
└── README.md

---

## ⚙️ Hướng dẫn chạy dự án

### 1. Clone repo

```bash
git clone https://github.com/littlebadboy9x/ShuttleSync.git
cd ShuttleSync

