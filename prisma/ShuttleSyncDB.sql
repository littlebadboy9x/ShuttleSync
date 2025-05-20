-- ======================================================
-- SCRIPT DATABASE ĐẶT SÂN CẦU LÔNG (SHUTTLEBOOK)
-- Bao gồm cấu trúc, ràng buộc và dữ liệu mẫu đơn giản
-- ======================================================

IF DB_ID('ShuttleBook') IS NOT NULL
BEGIN
    ALTER DATABASE ShuttleBook SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE ShuttleBook;
END
GO

-- Tạo mới database
CREATE DATABASE ShuttleBook;
GO
USE ShuttleBook;
GO

-- ===========================================
-- BẢNG LOẠI TRẠNG THÁI
-- ===========================================

IF OBJECT_ID('StatusTypes', 'U') IS NOT NULL DROP TABLE StatusTypes;
CREATE TABLE StatusTypes (
    Id TINYINT PRIMARY KEY,
    Name NVARCHAR(20) NOT NULL,
    Description NVARCHAR(100) NULL -- Mô tả trạng thái
);
GO

IF OBJECT_ID('BookingStatusTypes', 'U') IS NOT NULL DROP TABLE BookingStatusTypes;
CREATE TABLE BookingStatusTypes (
    Id TINYINT PRIMARY KEY,
    Name NVARCHAR(20) NOT NULL,
    Description NVARCHAR(100) NULL -- Mô tả trạng thái đặt sân
);
GO

IF OBJECT_ID('PaymentStatusTypes', 'U') IS NOT NULL DROP TABLE PaymentStatusTypes;
CREATE TABLE PaymentStatusTypes (
    Id TINYINT PRIMARY KEY,
    Name NVARCHAR(20) NOT NULL,
    Description NVARCHAR(100) NULL -- Mô tả trạng thái thanh toán
);
GO

-- ===========================================
-- BẢNG NGƯỜI DÙNG
-- ===========================================

IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;
CREATE TABLE Users (
    Id INT IDENTITY PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL, -- Họ tên đầy đủ
    Email NVARCHAR(100) UNIQUE NOT NULL, -- Email (duy nhất)
    Password NVARCHAR(255) NOT NULL, -- Mật khẩu (nên được hash)
    Role NVARCHAR(20) CHECK (Role IN ('admin', 'customer')) NOT NULL, -- Vai trò (admin hoặc customer) 
    CreatedAt DATETIME DEFAULT GETDATE() -- Thời gian tạo bản ghi
);
GO

-- ===========================================
-- BẢNG CẤU HÌNH
-- ===========================================

IF OBJECT_ID('Configurations', 'U') IS NOT NULL DROP TABLE Configurations;
CREATE TABLE Configurations (
    Id INT IDENTITY PRIMARY KEY,
    ConfigKey NVARCHAR(50) UNIQUE NOT NULL, -- Khóa cấu hình
    ConfigValue NVARCHAR(255) NOT NULL, -- Giá trị cấu hình
    Description NVARCHAR(255) NULL, -- Mô tả cấu hình
    UpdatedAt DATETIME DEFAULT GETDATE(), -- Thời gian cập nhật
    UpdatedBy INT NULL, -- Người cập nhật
    FOREIGN KEY (UpdatedBy) REFERENCES Users(Id)
);
GO

-- ===========================================
-- BẢNG GIÁ VÀ CẤU HÌNH KHUNG GIO
-- ===========================================

IF OBJECT_ID('TimeSlotConfigs', 'U') IS NOT NULL DROP TABLE TimeSlotConfigs;
CREATE TABLE TimeSlotConfigs (
    Id INT IDENTITY PRIMARY KEY,
    SlotDurationMinutes INT NOT NULL,      -- Độ dài của mỗi slot tính bằng phút
    StartTimeFirstSlot TIME NOT NULL,      -- Giờ bắt đầu của slot đầu tiên
    EndTimeLastSlot TIME NOT NULL,         -- Giờ kết thúc của slot cuối cùng
    MaxSlotsPerDay INT NOT NULL,           -- Số slot tối đa trong một ngày
    IsActive BIT DEFAULT 1, -- Có đang hoạt động không?
    EffectiveFrom DATE NOT NULL, -- Ngày bắt đầu hiệu lực
    EffectiveTo DATE NULL, -- Ngày kết thúc hiệu lực
    CreatedAt DATETIME DEFAULT GETDATE(), -- Thời gian tạo
    UpdatedAt DATETIME DEFAULT GETDATE(), -- Thời gian cập nhật
    UpdatedBy INT NULL, -- Người cập nhật
    FOREIGN KEY (UpdatedBy) REFERENCES Users(Id)
);
GO

IF OBJECT_ID('PriceSettings', 'U') IS NOT NULL DROP TABLE PriceSettings;
CREATE TABLE PriceSettings (
    Id INT IDENTITY PRIMARY KEY,
    CourtId INT NULL,                      -- NULL áp dụng cho tất cả các sân
    TimeSlotIndex INT NULL,                -- NULL áp dụng cho tất cả các khung giờ
    DayType VARCHAR(20) CHECK (DayType IN ('weekday', 'weekend', 'holiday')) NOT NULL, -- Loại ngày - Đã kích hoạt CHECK
    Price DECIMAL(10,2) NOT NULL, -- Giá
    IsActive BIT DEFAULT 1, -- Có đang hoạt động không?
    EffectiveFrom DATE NOT NULL, -- Ngày bắt đầu hiệu lực
    EffectiveTo DATE NULL, -- Ngày kết thúc hiệu lực
    CreatedAt DATETIME DEFAULT GETDATE(), -- Thời gian tạo
    UpdatedAt DATETIME DEFAULT GETDATE(), -- Thời gian cập nhật
    UpdatedBy INT NULL, -- Người cập nhật
    FOREIGN KEY (UpdatedBy) REFERENCES Users(Id)
);
GO

IF OBJECT_ID('HolidayDates', 'U') IS NOT NULL DROP TABLE HolidayDates;
CREATE TABLE HolidayDates (
    Id INT IDENTITY PRIMARY KEY,
    HolidayDate DATE UNIQUE NOT NULL, -- Ngày lễ (duy nhất)
    HolidayName NVARCHAR(100) NOT NULL, -- Tên ngày lễ
    Description NVARCHAR(255) NULL, -- Mô tả
    IsRecurringYearly BIT DEFAULT 0, -- Có lặp lại hàng năm không?
    CreatedBy INT NULL, -- Người tạo
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id)
);
GO

-- ===========================================
-- BẢNG CHÍNH
-- ===========================================

IF OBJECT_ID('Courts', 'U') IS NOT NULL DROP TABLE Courts;
CREATE TABLE Courts (
    Id INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL, -- Tên sân
    Description NVARCHAR(255) NULL, -- Mô tả sân
    Status TINYINT NOT NULL DEFAULT 1,    -- Trạng thái của sân (liên kết đến StatusTypes)
    HasFixedTimeSlots BIT DEFAULT 1, -- Có khung giờ cố định không?
    FOREIGN KEY (Status) REFERENCES StatusTypes(Id)
);
GO

IF OBJECT_ID('TimeSlots', 'U') IS NOT NULL DROP TABLE TimeSlots;
CREATE TABLE TimeSlots (
    Id INT IDENTITY PRIMARY KEY,
    CourtId INT NOT NULL, -- Liên kết đến SanCauLong
    SlotIndex INT NOT NULL, -- Chỉ số của khung giờ trong ngày
    StartTime TIME NOT NULL, -- Giờ bắt đầu
    EndTime TIME NOT NULL, -- Giờ kết thúc
    Status TINYINT NOT NULL DEFAULT 1, -- Trạng thái của khung giờ (liên kết đến StatusTypes)
    Price DECIMAL(10,2) NULL, -- Giá của khung giờ
    EffectiveDate DATE NULL, -- Ngày giá có hiệu lực
    FOREIGN KEY (CourtId) REFERENCES Courts(Id) ON DELETE CASCADE,
    FOREIGN KEY (Status) REFERENCES StatusTypes(Id),
    CONSTRAINT CK_TimeSlot_Duration CHECK (DATEDIFF(MINUTE, StartTime, EndTime) > 0) -- Ràng buộc thời lượng lớn hơn 0
);
GO

IF OBJECT_ID('Bookings', 'U') IS NOT NULL DROP TABLE Bookings;
CREATE TABLE Bookings (
    Id INT IDENTITY PRIMARY KEY,
    UserId INT NOT NULL, -- Liên kết đến NguoiDung
    CourtId INT NOT NULL, -- Liên kết đến SanCauLong
    BookingDate DATE NOT NULL, -- Ngày đặt sân
    TimeSlotId INT NOT NULL, -- Liên kết đến KhungGio
    Status TINYINT NOT NULL DEFAULT 1, -- Trạng thái của đặt sân (liên kết đến BookingStatusTypes)
    CreatedAt DATETIME DEFAULT GETDATE(), -- Thời gian tạo đặt sân
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (CourtId) REFERENCES Courts(Id),
    FOREIGN KEY (TimeSlotId) REFERENCES TimeSlots(Id),
    FOREIGN KEY (Status) REFERENCES BookingStatusTypes(Id)
);
GO

IF OBJECT_ID('Invoices', 'U') IS NOT NULL DROP TABLE Invoices;
CREATE TABLE Invoices (
    Id INT IDENTITY PRIMARY KEY,
    BookingId INT UNIQUE NOT NULL, -- Liên kết duy nhất đến DatSan (1 booking = 1 invoice)
    InvoiceDate DATE NOT NULL DEFAULT GETDATE(), -- Ngày tạo hóa đơn
    OriginalAmount DECIMAL(10,2) NULL, -- Tổng tiền trước giảm giá (Tổng Amount từ InvoiceDetails)
    DiscountAmount DECIMAL(10,2) DEFAULT 0, -- Số tiền giảm giá ap dung cho toan bo hoa don
    FinalAmount DECIMAL(10,2) NULL, -- Tổng tiền sau giam gia (Tinh toan: OriginalAmount - DiscountAmount)
    Status NVARCHAR(50) NULL, -- Trạng thái của hóa đơn (vd: 'Pending', 'Paid', 'Cancelled')
    Notes NVARCHAR(255) NULL, -- Ghi chú
    CreatedAt DATETIME DEFAULT GETDATE(), -- Thời gian tạo hóa đơn
    UpdatedAt DATETIME DEFAULT GETDATE(), -- Thời gian cập nhật hóa đơn
    FOREIGN KEY (BookingId) REFERENCES Bookings(Id)
);
GO

IF OBJECT_ID('Payments', 'U') IS NOT NULL DROP TABLE Payments;
CREATE TABLE Payments (
    Id INT IDENTITY PRIMARY KEY,
    BookingId INT NOT NULL, -- Liên kết đến DatSan
    InvoiceId INT NULL, -- Liên kết đến HoaDon (sẽ được cập nhật sau khi Invoice được tạo)
    Amount DECIMAL(10, 2) NOT NULL, -- Số tiền thanh toán
    PaymentMethod NVARCHAR(50) NULL, -- Phương thức thanh toán
    PaymentStatus TINYINT NOT NULL DEFAULT 1, -- Trạng thái của thanh toán (liên kết đến PaymentStatusTypes)
    CreatedAt DATETIME DEFAULT GETDATE(), -- Thời gian tạo bản ghi thanh toán
    PaidAt DATETIME NULL, -- Thời gian thực hiện thanh toán
    FOREIGN KEY (BookingId) REFERENCES Bookings(Id) ON DELETE CASCADE,
    FOREIGN KEY (InvoiceId) REFERENCES Invoices(Id),
    FOREIGN KEY (PaymentStatus) REFERENCES PaymentStatusTypes(Id)
);
GO

IF OBJECT_ID('ServiceTypes', 'U') IS NOT NULL DROP TABLE ServiceTypes;
CREATE TABLE ServiceTypes (
    Id INT IDENTITY PRIMARY KEY,
    TypeName NVARCHAR(100) NOT NULL, -- Tên loại dịch vụ
    Description NVARCHAR(255) NULL -- Mô tả loại dịch vụ
);
GO

IF OBJECT_ID('Services', 'U') IS NOT NULL DROP TABLE Services;
CREATE TABLE Services (
    Id INT IDENTITY PRIMARY KEY,
    ServiceTypeId INT NULL, -- Liên kết đến LoaiDichVu
    ServiceName NVARCHAR(100) NOT NULL, -- Tên dịch vụ
    Description NVARCHAR(255) NULL, -- Mô tả dịch vụ
    UnitPrice DECIMAL(10,2) NOT NULL, -- Đơn giá
    IsActive BIT DEFAULT 1, -- Có đang hoạt động không?
    FOREIGN KEY (ServiceTypeId) REFERENCES ServiceTypes(Id)
);
GO

IF OBJECT_ID('InvoiceDetails', 'U') IS NOT NULL DROP TABLE InvoiceDetails;
CREATE TABLE InvoiceDetails (
    Id INT IDENTITY PRIMARY KEY,
    InvoiceId INT NOT NULL, -- Liên kết đến HoaDon
    TimeSlotId INT NULL, -- Tùy chọn: Liên kết đến KhungGio nếu là mục đặt san
    ServiceId INT NULL, -- Tùy chọn: Liên kết đến DichVu nếu là mục dịch vụ
    ItemName NVARCHAR(100) NOT NULL, -- Tên / Mô tả của mục
    BookingDate DATE NULL, -- Ngày đặt san (cho mục đặt san)
    StartTime TIME NULL, -- Giờ bắt đầu khung giờ (cho mục đặt san)
    EndTime TIME NULL, -- Giờ kết thúc khung giờ (cho mục đặt san)
    CourtName NVARCHAR(50) NULL, -- Tên san (cho mục đặt san)
    Quantity INT NOT NULL, -- Số lượng
    UnitPrice DECIMAL(10,2) NOT NULL, -- Đơn giá
    Amount DECIMAL(10,2) NOT NULL, -- Số lượng * Đơn giá
    Notes NVARCHAR(255) NULL, -- Ghi chú cho mục chi tiết
    FOREIGN KEY (InvoiceId) REFERENCES Invoices(Id) ON DELETE CASCADE,
    FOREIGN KEY (TimeSlotId) REFERENCES TimeSlots(Id),
    FOREIGN KEY (ServiceId) REFERENCES Services(Id),
    CONSTRAINT CK_InvoiceDetail_ItemType CHECK ((TimeSlotId IS NOT NULL AND ServiceId IS NULL) OR (TimeSlotId IS NULL AND ServiceId IS NOT NULL)) -- Ràng buộc chỉ liên kết đến KhungGio hoặc DichVu
);
GO

-- ===========================================
-- BẢNG PHỤ TRỢ
-- ===========================================

IF OBJECT_ID('CustomerBookingInfo', 'U') IS NOT NULL DROP TABLE CustomerBookingInfo;
CREATE TABLE CustomerBookingInfo (
    BookingId INT PRIMARY KEY, -- Liên kết đến DatSan
    UserFullName NVARCHAR(100) NULL, -- Họ tên người dùng
    UserEmail NVARCHAR(100) NULL, -- Email người dùng
    CourtName NVARCHAR(50) NULL, -- Tên san
    BookingDate DATE NULL, -- Ngày đặt san
    SlotStartTime TIME NULL, -- Giờ bắt đầu khung giờ
    SlotEndTime TIME NULL, -- Giờ kết thúc khung giờ
    OriginalPrice DECIMAL(10,2) NULL, -- Giá gốc (giá khung giờ)
    BookingStatus NVARCHAR(20) NULL, -- Trạng thái đặt san
    PaymentAmount DECIMAL(10,2) NULL, -- Tổng số tiền đã thanh toán cho booking này
    PaymentMethod NVARCHAR(50) NULL, -- Phương thức thanh toán gần nhất
    PaymentStatus NVARCHAR(20) NULL, -- Trạng thái thanh toán gần nhất
    FOREIGN KEY (BookingId) REFERENCES Bookings(Id) ON DELETE CASCADE
);
GO

IF OBJECT_ID('Discounts', 'U') IS NOT NULL DROP TABLE Discounts;
CREATE TABLE Discounts (
    Id INT IDENTITY PRIMARY KEY,
    Code NVARCHAR(20) UNIQUE NOT NULL, -- Mã giảm giá (duy nhất)
    Description NVARCHAR(255) NULL, -- Mô tả mã giảm giá
    DiscountPercent INT CHECK (DiscountPercent BETWEEN 0 AND 100) NOT NULL, -- Phần trăm giảm giá - Đã kích hoạt CHECK
    ValidFrom DATE NOT NULL, -- Ngày bắt đầu hiệu lực
    ValidTo DATE NULL -- Ngày kết thúc hiệu lực
);
GO

IF OBJECT_ID('PaymentDiscounts', 'U') IS NOT NULL DROP TABLE PaymentDiscounts;
CREATE TABLE PaymentDiscounts (
    PaymentId INT NOT NULL,
    DiscountId INT NOT NULL,
    PRIMARY KEY (PaymentId, DiscountId),
    FOREIGN KEY (PaymentId) REFERENCES Payments(Id) ON DELETE CASCADE,
    FOREIGN KEY (DiscountId) REFERENCES Discounts(Id)
);
GO

IF OBJECT_ID('Reviews', 'U') IS NOT NULL DROP TABLE Reviews;
CREATE TABLE Reviews (
    Id INT IDENTITY PRIMARY KEY,
    BookingId INT NOT NULL, -- Liên kết đến DatSan
    UserId INT NOT NULL, -- Liên kết đến NguoiDung
    Rating INT CHECK (Rating BETWEEN 1 AND 5) NOT NULL, -- Điểm đánh giá (1-5) - Đã kích hoạt CHECK
    Comment NVARCHAR(500) NULL, -- Bình luận
    CreatedAt DATETIME DEFAULT GETDATE(), -- Thời gian tạo đánh giá
    FOREIGN KEY (BookingId) REFERENCES Bookings(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    CONSTRAINT UQ_Reviews_BookingId_UserId UNIQUE (BookingId, UserId) -- Mỗi người chỉ đánh giá 1 lần cho 1 booking - Đã kích hoạt CHECK
);
GO

IF OBJECT_ID('SystemChangeLog', 'U') IS NOT NULL DROP TABLE SystemChangeLog;
CREATE TABLE SystemChangeLog (
    Id INT IDENTITY PRIMARY KEY,
    TableName NVARCHAR(50) NOT NULL, -- Tên bảng có thay đổi
    RecordId INT NOT NULL, -- Id của bản ghi bị thay đổi
    ChangeType NVARCHAR(20) NOT NULL, -- Loại thay đổi (vd: INSERT, UPDATE, DELETE)
    ChangedFields NVARCHAR(MAX) NOT NULL, -- Chi tiết các trường bị thay đổi (co the luu JSON/XML)
    InvoiceId INT NULL, -- Liên kết đến HoaDon (nếu thay đổi liên quan đến hóa đơn)
    ChangedBy INT NOT NULL, -- Liên kết đến NguoiDung thực hiện thay đổi
    ChangedAt DATETIME DEFAULT GETDATE(), -- Thời gian thay đổi
    FOREIGN KEY (InvoiceId) REFERENCES Invoices(Id),
    FOREIGN KEY (ChangedBy) REFERENCES Users(Id)
);
GO

IF OBJECT_ID('Notifications', 'U') IS NOT NULL DROP TABLE Notifications;
CREATE TABLE Notifications (
    Id INT IDENTITY PRIMARY KEY,
    UserId INT NOT NULL,
    Message NVARCHAR(255) NOT NULL,
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);
GO


-- ===========================================
-- CÁC RÀNG BUỘC VÀ INDEX
-- ===========================================

-- Không cho phép đặt trùng khung giờ
ALTER TABLE Bookings
ADD CONSTRAINT UQ_Booking_Court_Date_TimeSlot UNIQUE (CourtId, BookingDate, TimeSlotId);
GO

-- Index cho các cột thường truy vấn
CREATE INDEX IX_Bookings_BookingDate ON Bookings(BookingDate);
CREATE INDEX IX_Bookings_UserId ON Bookings(UserId);
CREATE INDEX IX_Bookings_Status ON Bookings(Status);
CREATE INDEX IX_TimeSlots_CourtId ON TimeSlots(CourtId);
CREATE INDEX IX_Payments_BookingId ON Payments(BookingId);
CREATE INDEX IX_Payments_PaymentStatus ON Payments(PaymentStatus);
CREATE INDEX IX_HolidayDates_HolidayDate ON HolidayDates(HolidayDate);
GO

-- Index cho bảng PaymentDiscounts
CREATE INDEX IX_PaymentDiscounts_PaymentId ON PaymentDiscounts(PaymentId);
CREATE INDEX IX_PaymentDiscounts_DiscountId ON PaymentDiscounts(DiscountId);
GO

-- Index cho bảng Reviews
CREATE INDEX IX_Reviews_BookingId ON Reviews(BookingId);
CREATE INDEX IX_Reviews_UserId ON Reviews(UserId);
GO

-- Index cho bảng InvoiceDetails
CREATE INDEX IX_InvoiceDetails_InvoiceId ON InvoiceDetails(InvoiceId);
CREATE INDEX IX_InvoiceDetails_TimeSlotId ON InvoiceDetails(TimeSlotId);
CREATE INDEX IX_InvoiceDetails_ServiceId ON InvoiceDetails(ServiceId);
GO

-- ===========================================
-- STORED PROCEDURES (Đã bỏ)
-- ===========================================

-- ===========================================
-- TRIGGERS (Đã bỏ)
-- ===========================================

-- ===========================================
-- DỮ LIỆU MẪU
-- ===========================================

-- Dữ liệu trạng thái mẫu
INSERT INTO StatusTypes (Id, Name, Description) VALUES
(1, N'Trống', N'Sân hoặc khung giờ có sẵn để đặt'),
(2, N'Đầy', N'Sân hoặc khung giờ đã được đặt'),
(3, N'Bảo trì', N'Sân tạm ngừng hoạt động để bảo trì');
GO

INSERT INTO BookingStatusTypes (Id, Name, Description) VALUES
(1, N'Chờ xác nhận', N'Khách hàng đã gửi yêu cầu đặt sân'),
(2, N'Đã xác nhận', N'Đặt sân đã được xác nhận'),
(3, N'Đã hủy', N'Đặt sân đã bị hủy');
GO

INSERT INTO PaymentStatusTypes (Id, Name, Description) VALUES
(1, N'Chưa thanh toán', N'Chưa nhận được thanh toán'),
(2, N'Đã thanh toán', N'Đã nhận thanh toán');
GO

-- Thêm người dùng mẫu (mật khẩu nên được hash trong môi trường thực tế)
INSERT INTO Users (FullName, Email, Password, Role) VALUES
(N'Admin', 'admin@example.com', '123456', 'admin'),
(N'Nguyễn Văn A', 'user1@example.com', '123456', 'customer'),
(N'Nguyễn Văn B', 'user2@example.com', '123456', 'customer');
GO

-- Lấy ID của người dùng sau khi insert và sử dụng trong cùng batch
DECLARE @adminId INT = (SELECT TOP 1 Id FROM Users WHERE Email = 'admin@example.com');
DECLARE @userId1 INT = (SELECT TOP 1 Id FROM Users WHERE Email = 'user1@example.com');
DECLARE @userId2 INT = (SELECT TOP 1 Id FROM Users WHERE Email = 'user2@example.com');

-- Thêm cấu hình mặc định TimeSlotConfigs
INSERT INTO TimeSlotConfigs (SlotDurationMinutes, StartTimeFirstSlot, EndTimeLastSlot, MaxSlotsPerDay, EffectiveFrom, UpdatedBy)
VALUES (120, '05:00:00', '23:00:00', 9, GETDATE(), @adminId);
GO

-- Thêm cấu hình giá mặc định PriceSettings
DECLARE @adminId_price INT = (SELECT TOP 1 Id FROM Users WHERE Role = 'admin'); -- Khai báo lại biến trong batch mới
INSERT INTO PriceSettings (DayType, Price, EffectiveFrom, UpdatedBy) VALUES
('weekday', 200000, GETDATE(), @adminId_price),  -- Giá ngày thường
('weekend', 250000, GETDATE(), @adminId_price),  -- Giá cuối tuần
('holiday', 300000, GETDATE(), @adminId_price);  -- Giá ngày lễ
GO

-- Thêm sân mẫu (9 sân)
DECLARE @i INT = 1;
WHILE @i <= 9
BEGIN
    INSERT INTO Courts (Name, Description, Status, HasFixedTimeSlots)
    VALUES (N'San ' + CAST(@i AS NVARCHAR(2)), N'San cau long tieu chuan ' + CAST(@i AS NVARCHAR(2)), 1, 1); -- Status 1: Trống
    SET @i = @i + 1;
END
GO

-- Tạo khung giờ cho mỗi sân (9 khung giờ, mỗi khung 2 giờ, bắt đầu từ 05:00)
DECLARE @courtId INT = 1;
DECLARE @maxCourtId INT = (SELECT MAX(Id) FROM Courts);
DECLARE @slotDurationMinutes INT = 120; -- 2 tiếng
DECLARE @startTime TIME = '05:00:00';
DECLARE @endTime TIME = '23:00:00'; -- Gio ket thuc cua khung gio cuoi cung
DECLARE @currentDate DATE = GETDATE(); -- Su dung ngay hien tai cho ngay hieu luc mau

WHILE @courtId <= @maxCourtId
BEGIN
    DECLARE @slotIndex INT = 1;
    DECLARE @currentTime TIME = @startTime;
    DECLARE @defaultPrice DECIMAL(10,2) = 200000; -- Gia mac dinh moi khung gio

    -- Lấy giá mặc định từ cài đặt ngày thường nếu có
    SELECT TOP 1 @defaultPrice = Price
    FROM PriceSettings
    WHERE DayType = 'weekday' AND IsActive = 1 AND (CourtId IS NULL OR CourtId = @courtId) AND (TimeSlotIndex IS NULL OR TimeSlotIndex = @slotIndex)
    ORDER BY EffectiveFrom DESC;


    WHILE @currentTime < @endTime
    BEGIN
        INSERT INTO TimeSlots (CourtId, SlotIndex, StartTime, EndTime, Status, Price, EffectiveDate)
        VALUES (
            @courtId,
            @slotIndex,
            @currentTime,
            DATEADD(MINUTE, @slotDurationMinutes, @currentTime),
            1, -- Status 1: Trống
            @defaultPrice,
            @currentDate -- Hieu luc tu ngay hom nay
        );
        SET @currentTime = DATEADD(MINUTE, @slotDurationMinutes, @currentTime);
        SET @slotIndex = @slotIndex + 1;
    END
    SET @courtId = @courtId + 1;
END
GO

-- Thêm Loai Dich Vu mẫu
INSERT INTO ServiceTypes (TypeName, Description) VALUES
(N'Do uong', N'Cac loai do uong co san de mua'),
(N'Thue dung cu', N'Dung cu cau long co san de thue');
GO

-- Thêm Dich Vu mẫu
DECLARE @beverageTypeId INT = (SELECT TOP 1 Id FROM ServiceTypes WHERE TypeName = N'Do uong');
DECLARE @equipmentTypeId INT = (SELECT TOP 1 Id FROM ServiceTypes WHERE TypeName = N'Thue dung cu');

INSERT INTO Services (ServiceTypeId, ServiceName, Description, UnitPrice, IsActive) VALUES
(@beverageTypeId, N'Coca-Cola', N'Lon Coca-Cola', 15000, 1),
(@beverageTypeId, N'Nuoc suoi', N'Chai nuoc suoi', 10000, 1),
(@equipmentTypeId, N'Thue vot', N'Thue vot cau long moi gio', 30000, 1),
(@equipmentTypeId, N'Thue khan', N'Thue khan', 10000, 1);
GO

-- Thêm Giam Gia mẫu
SET IDENTITY_INSERT Discounts ON; -- Cho phep chen gia tri vao cot IDENTITY
INSERT INTO Discounts (Id, Code, Description, DiscountPercent, ValidFrom, ValidTo) VALUES
(1, 'DISC10', N'Giam 10% cho khach hang than thiet', 10, '2023-01-01', '2025-12-31'),
(2, 'WEEKEND20', N'Giam 20% vao cuoi tuan', 20, '2024-01-01', '2024-12-31');
SET IDENTITY_INSERT Discounts OFF; -- Tat IDENTITY_INSERT sau khi them du lieu mau
GO

-- Thêm HolidayDates mẫu
DECLARE @adminId_holiday INT = (SELECT TOP 1 Id FROM Users WHERE Role = 'admin'); -- Khai báo lại biến trong batch mới
INSERT INTO HolidayDates (HolidayDate, HolidayName, Description, IsRecurringYearly, CreatedBy) VALUES
('2025-01-01', N'Tet Duong Lich', N'Ngay nghi Tet Duong Lich', 1, @adminId_holiday),
('2025-04-30', N'Ngay Giai Phong Mien Nam', N'Ngay Giai Phong Mien Nam', 1, @adminId_holiday),
('2025-05-01', N'Ngay Quoc Te Lao Dong', N'Ngay Quoc Te Lao Dong', 1, @adminId_holiday);
GO

-- Thêm Booking, Invoice, Payments, InvoiceDetails, PaymentDiscounts, Reviews, SystemChangeLog, CustomerBookingInfo mẫu
-- Logic này giờ được thực hiện trực tiếp thay vì qua SP
DECLARE @userId1 INT = (SELECT TOP 1 Id FROM Users WHERE Email = 'user1@example.com'); -- Khai báo lại biến trong batch mới
DECLARE @userId2 INT = (SELECT TOP 1 Id FROM Users WHERE Email = 'user2@example.com'); -- Khai báo lại biến trong batch mới
DECLARE @courtId1 INT = (SELECT TOP 1 Id FROM Courts WHERE Name = N'San 1'); -- Khai báo lại biến trong batch mới
DECLARE @courtId2 INT = (SELECT TOP 1 Id FROM Courts WHERE Name = N'San 2'); -- Khai báo lại biến trong batch mới
DECLARE @adminId INT = (SELECT TOP 1 Id FROM Users WHERE Role = 'admin'); -- Khai báo lại biến trong batch mới

-- Booking 1: Đã xác nhận và thanh toán
DECLARE @timeSlotId1 INT = (SELECT TOP 1 Id FROM TimeSlots WHERE CourtId = @courtId1 AND SlotIndex = 3); -- 09:00-11:00
INSERT INTO Bookings (UserId, CourtId, BookingDate, TimeSlotId, Status, CreatedAt)
VALUES (@userId1, @courtId1, DATEADD(DAY, 1, GETDATE()), @timeSlotId1, 2, GETDATE()); -- Status 2: Đã xác nhận
DECLARE @bookingId1 INT = SCOPE_IDENTITY();

-- Tạo Invoice cho Booking 1
INSERT INTO Invoices (BookingId, InvoiceDate, Status, CreatedAt)
VALUES (@bookingId1, GETDATE(), 'Paid', GETDATE()); -- Status: Paid
DECLARE @invoiceId1 INT = SCOPE_IDENTITY();

-- Chi tiet Hoa Don cho Booking 1 (Thoi gian san)
INSERT INTO InvoiceDetails (InvoiceId, TimeSlotId, ItemName, BookingDate, StartTime, EndTime, CourtName, Quantity, UnitPrice, Amount)
SELECT
    @invoiceId1,
    ts.Id,
    N'Thuê sân ' + c.Name + N' Khung giờ ' + CAST(ts.SlotIndex AS NVARCHAR) + N' (' + FORMAT(ts.StartTime, 'hh\:mm') + N'-' + FORMAT(ts.EndTime, 'hh\:mm') + N')',
    b.BookingDate,
    ts.StartTime,
    ts.EndTime,
    c.Name,
    1, -- So luong la 1 cho mot khung gio
    ts.Price,
    ts.Price -- Amount = Quantity * UnitPrice
FROM Bookings b
JOIN TimeSlots ts ON b.TimeSlotId = ts.Id
JOIN Courts c ON b.CourtId = c.Id
WHERE b.Id = @bookingId1;

-- Tinh toan va cap nhat Tong tien tren Hoa Don 1
UPDATE Invoices
SET OriginalAmount = (SELECT SUM(Amount) FROM InvoiceDetails WHERE InvoiceId = @invoiceId1),
    FinalAmount = (SELECT SUM(Amount) FROM InvoiceDetails WHERE InvoiceId = @invoiceId1) -- Chua co giam gia ban dau
WHERE Id = @invoiceId1;

-- Thanh toan cho Hoa Don 1 (Toan bo so tien)
INSERT INTO Payments (BookingId, InvoiceId, Amount, PaymentMethod, PaymentStatus, CreatedAt, PaidAt)
VALUES (@bookingId1, @invoiceId1, (SELECT FinalAmount FROM Invoices WHERE Id = @invoiceId1), N'Tiền mặt', 2, GETDATE(), GETDATE()); -- PaymentStatus 2: Đã thanh toán
DECLARE @paymentId1 INT = SCOPE_IDENTITY();

-- Cập nhật trạng thái TimeSlot cho Booking 1
UPDATE ts
SET Status = 2 -- Id = 2 là 'Đầy' trong StatusTypes
FROM TimeSlots ts
JOIN Bookings b ON ts.Id = b.TimeSlotId
WHERE b.Id = @bookingId1;


-- Booking 2: Đã xác nhận, chưa thanh toán, có Giam giá
DECLARE @timeSlotId2 INT = (SELECT TOP 1 Id FROM TimeSlots WHERE CourtId = @courtId2 AND SlotIndex = 5); -- 13:00-15:00
INSERT INTO Bookings (UserId, CourtId, BookingDate, TimeSlotId, Status, CreatedAt)
VALUES (@userId1, @courtId2, DATEADD(DAY, 2, GETDATE()), @timeSlotId2, 2, GETDATE()); -- Status 2: Đã xác nhận
DECLARE @bookingId2 INT = SCOPE_IDENTITY();

-- Tạo Invoice cho Booking 2
INSERT INTO Invoices (BookingId, InvoiceDate, Status, CreatedAt)
VALUES (@bookingId2, GETDATE(), 'Pending Payment', GETDATE()); -- Status: Pending Payment
DECLARE @invoiceId2 INT = SCOPE_IDENTITY();

-- Chi tiet Hoa Don cho Booking 2 (Thoi gian san)
INSERT INTO InvoiceDetails (InvoiceId, TimeSlotId, ItemName, BookingDate, StartTime, EndTime, CourtName, Quantity, UnitPrice, Amount)
SELECT
    @invoiceId2,
    ts.Id,
    N'Thuê sân ' + c.Name + N' Khung giờ ' + CAST(ts.SlotIndex AS NVARCHAR) + N' (' + FORMAT(ts.StartTime, 'hh\:mm') + N'-' + FORMAT(ts.EndTime, 'hh\:mm') + N')',
    b.BookingDate,
    ts.StartTime,
    ts.EndTime,
    c.Name,
    1, -- So luong la 1 cho mot khung gio
    ts.Price,
    ts.Price -- Amount = Quantity * UnitPrice
FROM Bookings b
JOIN TimeSlots ts ON b.TimeSlotId = ts.Id
JOIN Courts c ON b.CourtId = c.Id
WHERE b.Id = @bookingId2;

-- Them mot dich vu vao Hoa Don 2
DECLARE @cokeId INT = (SELECT TOP 1 Id FROM Services WHERE ServiceName = N'Coca-Cola');
DECLARE @cokePrice DECIMAL(10,2) = (SELECT TOP 1 UnitPrice FROM Services WHERE Id = @cokeId);
INSERT INTO InvoiceDetails (InvoiceId, ServiceId, ItemName, Quantity, UnitPrice, Amount)
VALUES (@invoiceId2, @cokeId, N'Coca-Cola', 2, @cokePrice, 2 * @cokePrice);

-- Tinh toan va cap nhat OriginalAmount tren Hoa Don 2
UPDATE Invoices
SET OriginalAmount = (SELECT SUM(Amount) FROM InvoiceDetails WHERE InvoiceId = @invoiceId2)
WHERE Id = @invoiceId2;

-- Ap dung Giam Gia cho Hoa Don 2 (vi du: DISC10)
DECLARE @discountCode NVARCHAR(20) = 'DISC10';
DECLARE @discountId INT = (SELECT TOP 1 Id FROM Discounts WHERE Code = @discountCode);
DECLARE @discountPercent INT = (SELECT TOP 1 DiscountPercent FROM Discounts WHERE Id = @discountId);
DECLARE @originalAmount2 DECIMAL(10,2) = (SELECT TOP 1 OriginalAmount FROM Invoices WHERE Id = @invoiceId2);
DECLARE @calculatedDiscountAmount2 DECIMAL(10,2) = @originalAmount2 * (@discountPercent / 100.0);

UPDATE Invoices
SET DiscountAmount = @calculatedDiscountAmount2,
    FinalAmount = @originalAmount2 - @calculatedDiscountAmount2
WHERE Id = @invoiceId2;

-- Thanh toan cho Hoa Don 2 (Chua thanh toan)
INSERT INTO Payments (BookingId, InvoiceId, Amount, PaymentMethod, PaymentStatus, CreatedAt)
VALUES (@bookingId2, @invoiceId2, (SELECT FinalAmount FROM Invoices WHERE Id = @invoiceId2), N'Chưa chọn', 1, GETDATE()); -- PaymentStatus 1: Chua thanh toan
DECLARE @paymentId2 INT = SCOPE_IDENTITY();

-- Link discount to payment 2
INSERT INTO PaymentDiscounts (PaymentId, DiscountId) VALUES (@paymentId2, @discountId);

-- Cập nhật trạng thái TimeSlot cho Booking 2
UPDATE ts
SET Status = 2 -- Id = 2 là 'Đầy' trong StatusTypes
FROM TimeSlots ts
JOIN Bookings b ON ts.Id = b.TimeSlotId
WHERE b.Id = @bookingId2;


-- Booking 3: Chờ xác nhận
DECLARE @timeSlotId3 INT = (SELECT TOP 1 Id FROM TimeSlots WHERE CourtId = @courtId1 AND SlotIndex = 7); -- 17:00-19:00
INSERT INTO Bookings (UserId, CourtId, BookingDate, TimeSlotId, Status, CreatedAt)
VALUES (@userId2, @courtId1, DATEADD(DAY, 3, GETDATE()), @timeSlotId3, 1, GETDATE()); -- Status 1: Cho xac nhan
DECLARE @bookingId3 INT = SCOPE_IDENTITY();
-- Booking này sẽ ở trạng thái chờ xác nhận, Invoice/Payment/InvoiceDetails/PaymentDiscounts chưa được tạo tự động. TimeSlot vẫn ở trạng thái 'Trống'.

-- Thêm đánh giá cho booking 1
INSERT INTO Reviews (BookingId, UserId, Rating, Comment, CreatedAt)
VALUES (@bookingId1, @userId1, 5, N'San rat tot va sach se!', DATEADD(HOUR, -12, GETDATE()));

-- Thêm SystemChangeLog mẫu (Manual logs for sample data)
-- (Đã bỏ bớt các log chi tiết để đơn giản hóa)
INSERT INTO SystemChangeLog (TableName, RecordId, ChangeType, ChangedFields, InvoiceId, ChangedBy, ChangedAt)
VALUES
('Bookings', @bookingId1, 'INSERT', N'{"Status":"2"}', NULL, @userId1, GETDATE()),
('Invoices', @invoiceId1, 'INSERT', N'{"BookingId":"' + CAST(@bookingId1 AS NVARCHAR) + '"}', @invoiceId1, @adminId, GETDATE()),
('Payments', @paymentId1, 'INSERT', N'{"BookingId":"' + CAST(@bookingId1 AS NVARCHAR) + '","PaymentStatus":"2"}', @invoiceId1, @adminId, GETDATE()),
('TimeSlots', @timeSlotId1, 'UPDATE', N'{"Status":"2"}', NULL, @adminId, GETDATE()),

('Bookings', @bookingId2, 'INSERT', N'{"Status":"2"}', NULL, @userId1, GETDATE()),
('Invoices', @invoiceId2, 'INSERT', N'{"BookingId":"' + CAST(@bookingId2 AS NVARCHAR) + '"}', @invoiceId2, @adminId, GETDATE()),
('Payments', @paymentId2, 'INSERT', N'{"BookingId":"' + CAST(@bookingId2 AS NVARCHAR) + '","PaymentId":"' + CAST(@paymentId2 AS NVARCHAR) + '","PaymentStatus":"1"}', @invoiceId2, @adminId, GETDATE()), -- Fixed syntax error here
('PaymentDiscounts', @paymentId2, 'INSERT', N'{"PaymentId":"' + CAST(@paymentId2 AS NVARCHAR) + '","DiscountId":"' + CAST(@discountId AS NVARCHAR) + '"}', NULL, @adminId, GETDATE()),
('TimeSlots', @timeSlotId2, 'UPDATE', N'{"Status":"2"}', NULL, @adminId, GETDATE()),

('Bookings', @bookingId3, 'INSERT', N'{"Status":"1"}', NULL, @userId2, GETDATE());

-- Tạo CustomerBookingInfo cho các booking mẫu (Manual insertion as trigger is removed)
-- Sử dụng biến đã khai báo trong cùng batch
INSERT INTO CustomerBookingInfo (BookingId, UserFullName, UserEmail, CourtName, BookingDate, SlotStartTime, SlotEndTime, OriginalPrice, BookingStatus, PaymentAmount, PaymentMethod, PaymentStatus)
SELECT
    b.Id,
    u.FullName,
    u.Email,
    c.Name,
    b.BookingDate,
    ts.StartTime,
    ts.EndTime,
    ts.Price, -- Luu y: Day la gia khung gio, khong phai tong gia booking/invoice
    bst.Name,
    (SELECT SUM(Amount) FROM Payments WHERE BookingId = b.Id), -- Tong cac khoan thanh toan cho booking nay
    (SELECT TOP 1 PaymentMethod FROM Payments WHERE BookingId = b.Id ORDER BY CreatedAt DESC), -- Phuong thuc thanh toan gan nhat
    (SELECT TOP 1 pst.Name FROM Payments p2 JOIN PaymentStatusTypes pst ON p2.PaymentStatus = pst.Id WHERE p2.BookingId = b.Id ORDER BY p2.CreatedAt DESC) -- Trang thai thanh toan gan nhat
FROM Bookings b
JOIN Users u ON b.UserId = u.Id
JOIN Courts c ON b.CourtId = c.Id
JOIN TimeSlots ts ON b.TimeSlotId = ts.Id
JOIN BookingStatusTypes bst ON b.Status = bst.Id
WHERE b.Id IN (@bookingId1, @bookingId2, @bookingId3);
GO

-- Thêm cấu hình hệ thống
DECLARE @adminId_config INT = (SELECT TOP 1 Id FROM Users WHERE Role = 'admin'); -- Khai báo lại biến trong batch mới
INSERT INTO Configurations (ConfigKey, ConfigValue, Description, UpdatedBy)
VALUES
('BOOKING_CONFIRMATION_REQUIRED', 'true', N'Đặt sân cần xác nhận từ admin', @adminId_config),
('PAYMENT_DEADLINE_HOURS', '24', N'Thời hạn thanh toán sau khi xác nhận (giờ)', @adminId_config),
('MIN_BOOKING_HOURS_IN_ADVANCE', '2', N'Thời gian tối thiểu để đặt sân trước giờ chơi (giờ)', @adminId_config);
GO
