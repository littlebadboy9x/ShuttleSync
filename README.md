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
| Backend    | Java 17, Spring Boot 3.4.5, Spring Data JPA, Spring Security, SQL Server |
| Frontend   | Next.js 14.2.28, React 18.2.0, TypeScript, Tailwind CSS 3.4.17 |
| Auth       | JWT, Spring Security |
| Thanh toán | Momo, VNPAY |
| Deploy     | Docker (trong cùng mạng Wi-Fi) |
| Cơ sở dữ liệu | SQL Server |
| Kiến trúc  | Monorepo (quản lý frontend và backend cùng repo) |

---

## 📁 Cấu trúc thư mục

```
ShuttleSync/
├── src/                # Backend: Spring Boot Application
│   ├── main/
│   │   ├── java/       # Mã nguồn Java
│   │   └── resources/  # Cấu hình ứng dụng
│   └── test/           # Unit tests
├── app/                # Frontend: Next.js pages & components
├── components/         # Frontend: Shared components 
├── lib/                # Frontend: Utility functions
├── public/             # Frontend: Static assets
├── .gitignore
├── pom.xml             # Maven configuration
├── package.json        # npm configuration
└── README.md
```

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
- **Tailwind CSS:** ^3.4.17
- **PostCSS:** ^8.5.3
- **Autoprefixer:** ^10.4.21
- **TypeScript:** ^5.3.3

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

## 🚀 Hướng dẫn cài đặt Backend (Spring Boot)

### Yêu cầu môi trường
- Java 17
- Maven
- SQL Server

### Các phiên bản phụ thuộc chính
- **Spring Boot:** 3.4.5
- **Spring Security**
- **Spring Data JPA**
- **JWT:** 0.11.5
- **SQL Server Driver**
- **Lombok**

### Cài đặt và chạy
```bash
# Cấu hình SQL Server
# 1. Cài đặt SQL Server
# 2. Thực thi script SQL để tạo database và bảng

# Chạy ứng dụng Spring Boot
mvn spring-boot:run
```

### Cấu hình Database
Chỉnh sửa thông tin kết nối database trong file `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=ShuttleBook;encrypt=true;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=123456
```
