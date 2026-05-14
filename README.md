# 🧪 Lab Room Booking & Management System

[![Trello Board](https://img.shields.io/badge/Trello-Board-0052CC?style=for-the-badge&logo=trello&logoColor=white)](https://trello.com/b/mMd9rtKU/lab-booking)

Hệ thống **quản lý và đặt phòng thí nghiệm** dành cho trường đại học, hỗ trợ:

- Đặt phòng học, học nhóm, báo cáo khóa luận
- Quản lý nhóm sinh viên – giảng viên
- Check-in / Check-out bằng GPS theo từng ca
- Báo cáo thiết bị hư hỏng trong phòng
- Phân quyền rõ ràng: Admin – Lecturer – Student

---

## 🎯 Mục tiêu dự án

- Giải quyết tình trạng **đặt phòng trùng lịch**
- Minh bạch hóa việc **sử dụng phòng thí nghiệm**
- Hỗ trợ **quản lý nhóm nghiên cứu & khóa luận**
- Ghi nhận **lịch sử sử dụng phòng** (attendance, check-in/out)
- Tạo nền tảng mở rộng cho QR check-in, thống kê, AI scheduling

---

## 👥 Đối tượng sử dụng

### 👨‍🎓 Sinh viên

- Đăng ký tài khoản
- Xin tham gia nhóm giảng viên
- Đặt phòng học / báo cáo
- Check-in / Check-out theo ca

### 👨‍🏫 Giảng viên

- Tạo & quản lý nhóm
- Duyệt yêu cầu sinh viên vào nhóm
- Quản lý booking báo cáo / học nhóm
- Theo dõi attendance

### 🛠️ Quản trị viên (Admin)

- Quản lý phòng, ca học, thiết bị
- Xử lý báo hỏng thiết bị
- Quản lý người dùng & phân quyền

---

## 🏗️ Kiến trúc hệ thống

### Backend

- **Java 17**
- **Spring Boot**
- Spring Security (JWT)
- Spring Data JPA (Hibernate)
- Redis - caching
- PostgreSQL
- Docker & Docker Compose
- RESTful API + Swagger/OpenAPI

### Frontend _(dự kiến / tuỳ chọn)_

- React / Next.js
- REST API integration

---

## 🧩 Các module chính

- **Authentication & Authorization**

  - JWT (Access Token + Refresh Token)
  - Role-based access control (RBAC)

- **User & Profile Management**

  - User (core)
  - Student / Lecturer
  - Group Join Request

- **Booking Management**

  - Booking theo ngày & ca (slot)
  - Booking cá nhân / nhóm / khóa luận
  - Kiểm tra trùng lịch & sức chứa phòng

- **Participant & Attendance**

  - BookingParticipant với vai trò rõ ràng
  - Check-in / Check-out theo slot bằng GPS
  - Ghi nhận check-in trễ / check-out sớm

- **Lab Room & Device**
  - Quản lý phòng, thiết bị
  - Báo cáo thiết bị hư hỏng

---

## 🗂️ Mô hình dữ liệu (tóm tắt)

- User, Role, Student, Lecturer
- ResearchGroup, GroupMembership, GroupJoinRequest
- BookingRequest, BookingSlot, Slot
- BookingParticipant
- BookingSlotAttendance
- LabRoom, Device, DeviceIssueReport

---

## 🔐 Phân quyền (RBAC)

| Role     | Quyền chính                          |
| -------- | ------------------------------------ |
| STUDENT  | Đặt phòng, tham gia nhóm, check-in   |
| LECTURER | Quản lý nhóm, duyệt request, booking |
| ADMIN    | Quản trị hệ thống                    |

---

## 🚀 Hướng phát triển

- QR Code check-in
- Lịch phòng realtime
- Thống kê & báo cáo sử dụng phòng
- Tích hợp AI đề xuất lịch trống

---

## 📌 Trạng thái dự án

> 🟡 Đang phát triển – Phase 1 (Backend core & thiết kế nghiệp vụ)

---

## 👨‍💻 Tác giả

- **Dương Hoàng Huy - Trần Ngọc Huyên**
- Sinh viên Kỹ thuật phần mềm
- Đồ án học tập
