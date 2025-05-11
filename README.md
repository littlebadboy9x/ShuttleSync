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


```

## 🚀 Hướng dẫn cài đặt Frontend (Next.js)

### Yêu cầu môi trường
- Node.js >= 18
- npm >= 9

### Các phiên bản phụ thuộc chính
- **Next.js:** ^14.2.28
- **React:** ^18.2.0
- **ReactDOM:** ^18.2.0
- **Tailwind CSS:** ^3.3.0
- **PostCSS:** ^8.4.0
- **Autoprefixer:** ^10.4.0

### Cài đặt nhanh
```bash
# Clone dự án
 git clone https://github.com/littlebadboy9x/ShuttleSync.git
 cd ShuttleSync

# Cài đặt dependencies
 npm install

# Nếu gặp lỗi xung đột, hãy xóa cache và cài lại:
 rm -rf node_modules package-lock.json .next
 npm install

# Chạy dự án
 npm run dev
```

### Cấu hình PostCSS (postcss.config.js)
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Cấu hình Tailwind (tailwind.config.ts)
- Đảm bảo sử dụng đúng cấu trúc và các biến màu sắc như trong repo.

### Lưu ý
- **KHÔNG sử dụng Tailwind CSS v4.x** với Next.js 14, chỉ dùng v3.x.
- Nếu gặp lỗi về phiên bản, hãy kiểm tra lại các phiên bản trong `package.json`.
- Nếu dùng Windows, nên chạy terminal với quyền admin để tránh lỗi quyền truy cập.
