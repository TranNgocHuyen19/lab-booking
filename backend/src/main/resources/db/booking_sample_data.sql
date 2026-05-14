-- ============================================
-- SQL Seed Data: Research Groups & Memberships
-- Fixed and consolidated version
-- ============================================

-- Existing foundational data
INSERT INTO slots (slot_id, slot_name, start_time, end_time, description, created_at, created_by, modified_at, modified_by, active)
VALUES
    (1, 'Ca 1', '07:00:00', '09:00:00', 'Morning slot 1', NOW(), 'system', NOW(), 'system', true),
    (2, 'Ca 2', '09:15:00', '11:15:00', 'Morning slot 2', NOW(), 'system', NOW(), 'system', true),
    (3, 'Ca 3', '13:00:00', '15:00:00', 'Afternoon slot 1', NOW(), 'system', NOW(), 'system', true),
    (4, 'Ca 4', '15:15:00', '17:15:00', 'Afternoon slot 2', NOW(), 'system', NOW(), 'system', true),
    (5, 'Ca 5', '17:30:00', '19:30:00', 'Evening slot 1', NOW(), 'system', NOW(), 'system', true);

INSERT INTO lab_rooms (lab_room_id, room_name, building, capacity, created_at, created_by, modified_at, modified_by, active)
VALUES
    (1, 'IoT Lab 1', 'Building A', 30, NOW(), 'system', NOW(), 'system', true),
    (2, 'IoT Lab 2', 'Building A', 25, NOW(), 'system', NOW(), 'system', true),
    (3, 'Network Lab', 'Building B', 35, NOW(), 'system', NOW(), 'system', true);

INSERT INTO devices (device_id, device_name, device_type, icon, created_at, created_by, modified_at, modified_by, active)
VALUES
    (1, 'Arduino Uno', 'MICROCONTROLLER', 'arduino-icon.png', NOW(), 'system', NOW(), 'system', true),
    (2, 'Raspberry Pi 4', 'MICROCONTROLLER', 'raspberry-icon.png', NOW(), 'system', NOW(), 'system', true),
    (3, 'ESP32', 'MICROCONTROLLER', 'esp32-icon.png', NOW(), 'system', NOW(), 'system', true),
    (4, 'DHT22 Sensor', 'SENSOR', 'dht22-icon.png', NOW(), 'system', NOW(), 'system', true),
    (5, 'LED Matrix', 'DISPLAY', 'led-icon.png', NOW(), 'system', NOW(), 'system', true);

INSERT INTO lab_room_devices (lab_room_id, device_id, quantity)
VALUES
    (1, 1, 10), (1, 2, 8), (1, 4, 15), (1, 5, 10),
    (2, 1, 10), (2, 3, 12), (2, 4, 15),
    (3, 2, 7), (3, 3, 13);

-- NEW USER DATA
-- 1. Thêm Giảng viên mới (User ID: 7-11)
INSERT INTO users (user_id, username, full_name, password_hash, iuh_email, personal_email, phone, dob, department, faculty, role_id, created_at, created_by, active)
VALUES 
(7, 'lecturer3', 'TS. Phạm Minh Tuấn', '$2a$10$UJP.l4C7pK.UIT6gKtCQHuxiNHzVpLLVpEQMEdEP.kPBItB1TSbCa', 'phamminhtuan@iuh.edu.vn', 'phamminhtuan@gmail.com', '0901234567', '1985-05-15', 'Khoa CNTT', 'Công nghệ phần mềm', 2, NOW(), 'system', true),
(8, 'lecturer4', 'TS. Lê Văn Sinh', '$2a$10$UJP.l4C7pK.UIT6gKtCQHuxiNHzVpLLVpEQMEdEP.kPBItB1TSbCa', 'levansinh@iuh.edu.vn', 'levansinh@gmail.com', '0901234568', '1982-10-20', 'Khoa CNTT', 'Hệ thống thông tin', 2, NOW(), 'system', true),
(9, 'lecturer5', 'TS. Nguyễn Thị Mai', '$2a$10$UJP.l4C7pK.UIT6gKtCQHuxiNHzVpLLVpEQMEdEP.kPBItB1TSbCa', 'nguyenthimai@iuh.edu.vn', 'thimai@gmail.com', '0901234569', '1988-03-12', 'Khoa CNTT', 'Khoa học máy tính', 2, NOW(), 'system', true),
(10, 'lecturer6', 'ThS. Trần Hoàng Nam', '$2a$10$UJP.l4C7pK.UIT6gKtCQHuxiNHzVpLLVpEQMEdEP.kPBItB1TSbCa', 'tranhoangnam@iuh.edu.vn', 'namtran@gmail.com', '0901234570', '1990-12-05', 'Khoa CNTT', 'Kỹ thuật máy tính', 2, NOW(), 'system', true),
(11, 'lecturer7', 'TS. Đặng Minh Quân', '$2a$10$UJP.l4C7pK.UIT6gKtCQHuxiNHzVpLLVpEQMEdEP.kPBItB1TSbCa', 'dangminhquan@iuh.edu.vn', 'quanminh@gmail.com', '0901234571', '1984-07-25', 'Khoa CNTT', 'Mạng máy tính', 2, NOW(), 'system', true);

-- 2. Thêm Sinh viên mới (User ID: 12-26)
INSERT INTO users (user_id, username, full_name, password_hash, iuh_email, personal_email, phone, dob, department, faculty, role_id, created_at, created_by, active)
VALUES 
(12, '22000004', 'Trần Văn Mạnh', '$2a$10$UJP.l4C7pK.UIT6gKtCQHuxiNHzVpLLVpEQMEdEP.kPBItB1TSbCa', '22000004@student.iuh.edu.vn', 'manhtran@gmail.com', '0300000004', '2004-01-10', 'Khoa CNTT', 'Kỹ thuật phần mềm', 3, NOW(), 'system', true),
(13, '22000005', 'Nguyễn Thị Hoa', '$2a$10$UJP.l4C7pK.UIT6gKtCQHuxiNHzVpLLVpEQMEdEP.kPBItB1TSbCa', '22000005@student.iuh.edu.vn', 'hoanguyen@gmail.com', '0300000005', '2004-05-20', 'Khoa CNTT', 'Hệ thống thông tin', 3, NOW(), 'system', true),
(14, '22000006', 'Phạm Quốc Bảo', '$2a$10$UJP.l4C7pK.UIT6gKtCQHuxiNHzVpLLVpEQMEdEP.kPBItB1TSbCa', '22000006@student.iuh.edu.vn', 'baopham@gmail.com', '0300000006', '2004-11-15', 'Khoa CNTT', 'Khoa học máy tính', 3, NOW(), 'system', true),
(15, '22000007', 'Lê Minh Tâm', '$2a$10$UJP.l4C7pK.UIT6gKtCQHuxiNHzVpLLVpEQMEdEP.kPBItB1TSbCa', '22000007@student.iuh.edu.vn', 'tamle@gmail.com', '0300000007', '2004-02-28', 'Khoa CNTT', 'An toàn thông tin', 3, NOW(), 'system', true),
(16, '22000008', 'Vũ Hoàng Anh', '$2a$10$UJP.l4C7pK.UIT6gKtCQHuxiNHzVpLLVpEQMEdEP.kPBItB1TSbCa', '22000008@student.iuh.edu.vn', 'anhvu@gmail.com', '0300000008', '2004-09-14', 'Khoa CNTT', 'Kỹ thuật phần mềm', 3, NOW(), 'system', true),
(17, '22000009', 'Đỗ Thùy Linh', '$2a$10$UJP.l4C7pK.UIT6gKtCQHuxiNHzVpLLVpEQMEdEP.kPBItB1TSbCa', '22000009@student.iuh.edu.vn', 'linhdo@gmail.com', '0300000009', '2004-07-07', 'Khoa CNTT', 'Hệ thống thông tin', 3, NOW(), 'system', true),
(18, '22000010', 'Bùi Xuân Hiếu', '$2a$10$UJP.l4C7pK.UIT6gKtCQHuxiNHzVpLLVpEQMEdEP.kPBItB1TSbCa', '22000010@student.iuh.edu.vn', 'hieubui@gmail.com', '0300000010', '2004-03-30', 'Khoa CNTT', 'Khoa học máy tính', 3, NOW(), 'system', true),
(19, '22000011', 'Phan Thanh Tùng', '$2a$10$UJP.l4C7pK.UIT6gKtCQHuxiNHzVpLLVpEQMEdEP.kPBItB1TSbCa', '22000011@student.iuh.edu.vn', 'tungphan@gmail.com', '0300000011', '2004-12-12', 'Khoa CNTT', 'An toàn thông tin', 3, NOW(), 'system', true),
(20, '22000012', 'Dương Mỹ Hạnh', '$2a$10$UJP.l4C7pK.UIT6gKtCQHuxiNHzVpLLVpEQMEdEP.kPBItB1TSbCa', '22000012@student.iuh.edu.vn', 'hanhduong@gmail.com', '0300000012', '2004-06-18', 'Khoa CNTT', 'Kỹ thuật phần mềm', 3, NOW(), 'system', true),
(21, '22000013', 'Lý Gia Kiệt', '$2a$10$UJP.l4C7pK.UIT6gKtCQHuxiNHzVpLLVpEQMEdEP.kPBItB1TSbCa', '22000013@student.iuh.edu.vn', 'kietly@gmail.com', '0300000013', '2004-08-25', 'Khoa CNTT', 'Hệ thống thông tin', 3, NOW(), 'system', true),
(22, '21000014', 'Ngô Bảo Châu', '$2a$10$UJP.l4C7pK.UIT6gKtCQHuxiNHzVpLLVpEQMEdEP.kPBItB1TSbCa', '21000014@student.iuh.edu.vn', 'chaungo@gmail.com', '0300000014', '2003-01-01', 'Khoa CNTT', 'Khoa học máy tính', 3, NOW(), 'system', true),
(23, '21000015', 'Trương Vĩnh Ký', '$2a$10$UJP.l4C7pK.UIT6gKtCQHuxiNHzVpLLVpEQMEdEP.kPBItB1TSbCa', '21000015@student.iuh.edu.vn', 'kyky@gmail.com', '0300000015', '2003-05-15', 'Khoa CNTT', 'An toàn thông tin', 3, NOW(), 'system', true),
(24, '21000016', 'Lê Quý Đôn', '$2a$10$UJP.l4C7pK.UIT6gKtCQHuxiNHzVpLLVpEQMEdEP.kPBItB1TSbCa', '21000016@student.iuh.edu.vn', 'donle@gmail.com', '0300000016', '2003-09-09', 'Khoa CNTT', 'Kỹ thuật phần mềm', 3, NOW(), 'system', true),
(25, '21000017', 'Chu Văn An', '$2a$10$UJP.l4C7pK.UIT6gKtCQHuxiNHzVpLLVpEQMEdEP.kPBItB1TSbCa', '21000017@student.iuh.edu.vn', 'anchu@gmail.com', '0300000017', '2003-12-25', 'Khoa CNTT', 'Hệ thống thông tin', 3, NOW(), 'system', true),
(26, '21000018', 'Nguyễn Du', '$2a$10$UJP.l4C7pK.UIT6gKtCQHuxiNHzVpLLVpEQMEdEP.kPBItB1TSbCa', '21000018@student.iuh.edu.vn', 'dunguyen@gmail.com', '0300000018', '2003-02-14', 'Khoa CNTT', 'Khoa học máy tính', 3, NOW(), 'system', true);


-- 3. Thêm Nhóm nghiên cứu mới (ID: 3-12)
INSERT INTO research_groups (research_group_id, group_name, description, project_name, group_type, is_private, creator_id, status, created_at, created_by, active)
VALUES 
(3, 'Machine Learning Ops', 'Nghiên cứu quy trình triển khai mô hình học máy chuyên nghiệp.', 'MLOps Framework', 'RESEARCH', false, 7, 'ACTIVE', NOW(), 'lecturer3', true),
(4, 'Blockchain & DeFi', 'Phát triển các ứng dụng phi tập trung trên nền tảng Ethereum.', 'DeFi Exchange', 'RESEARCH', false, 8, 'ACTIVE', NOW(), 'lecturer4', true),
(5, 'Smart City IoT', 'Hệ thống giám sát giao thông và môi trường thông minh.', 'IoT Sensors Network', 'RESEARCH', true, 9, 'ACTIVE', NOW(), 'lecturer5', true),
(6, 'Cyber Security Advanced', 'Phòng chống các cuộc tấn công mạng hiện đại.', 'Intrusion Detection System', 'RESEARCH', false, 10, 'ACTIVE', NOW(), 'lecturer6', true),
(7, 'Natural Language Processing', 'Xử lý ngôn ngữ tự nhiên ứng dụng trong Chatbot giáo dục.', 'EduBot AI', 'RESEARCH', false, 11, 'ACTIVE', NOW(), 'lecturer7', true),
(8, 'Data Visualization', 'Trực quan hóa dữ liệu lớn ứng dụng trong kinh doanh.', 'BigData Dashboard', 'THESIS', false, 7, 'ACTIVE', NOW(), 'lecturer3', true),
(9, 'Cloud Computing Lab', 'Nghiên cứu hạ tầng Serverless và Microservices.', 'Serverless Architecture', 'THESIS', true, 8, 'ACTIVE', NOW(), 'lecturer4', true),
(10, 'Mobile AI Integration', 'Tích hợp AI trực tiếp vào các ứng dụng di động.', 'On-device AI', 'THESIS', false, 9, 'ACTIVE', NOW(), 'lecturer5', true),
(11, 'Game Development Pro', 'Phát triển Game 3D ứng dụng thực tế ảo.', 'VR Classroom', 'THESIS', false, 10, 'ACTIVE', NOW(), 'lecturer6', true),
(12, 'Embedded Systems', 'Lập trình thiết kế mạch công nghiệp.', 'Smart Factory Controller', 'THESIS', true, 11, 'ACTIVE', NOW(), 'lecturer7', true);

-- 4. Thêm Thành viên vào nhóm (Giảng viên là LEADER)
INSERT INTO group_memberships (research_group_id, user_id, role, created_at, created_by, active)
VALUES 
-- Nhóm 3
(3, 7, 'LEADER', NOW(), 'system', true),
(3, 12, 'CO_LEADER', NOW(), 'system', true),
(3, 13, 'MEMBER', NOW(), 'system', true),
-- Nhóm 4
(4, 8, 'LEADER', NOW(), 'system', true),
(4, 14, 'CO_LEADER', NOW(), 'system', true),
(4, 15, 'MEMBER', NOW(), 'system', true),
(4, 17, 'MEMBER', NOW(), 'system', true), -- FIX: Added approved member

-- Nhóm 5
(5, 9, 'LEADER', NOW(), 'system', true),
(5, 16, 'CO_LEADER', NOW(), 'system', true),
-- Nhóm 6
(6, 10, 'LEADER', NOW(), 'system', true),
(6, 17, 'MEMBER', NOW(), 'system', true),
-- Nhóm 7
(7, 11, 'LEADER', NOW(), 'system', true),
(7, 18, 'CO_LEADER', NOW(), 'system', true),
-- Nhóm 8-12 là KLTN nên thường ít thành viên lúc đầu
(8, 7, 'LEADER', NOW(), 'system', true),
(9, 8, 'LEADER', NOW(), 'system', true),
(10, 9, 'LEADER', NOW(), 'system', true),
(11, 10, 'LEADER', NOW(), 'system', true),
(12, 11, 'LEADER', NOW(), 'system', true);


-- 5. Thêm Yêu cầu tham gia (ID: 1-15)
INSERT INTO group_join_requests (group_join_request_id, research_group_id, user_id, status, message, response_note, response_date, response_by_id, created_at, created_by, active)
VALUES 
(1, 3, 19, 'PENDING', 'Em rất thích mảng MLOps, mong thầy duyệt.', NULL, NULL, NULL, NOW(), '22000011', true),
(2, 3, 20, 'PENDING', 'Em có kinh nghiệm Docker/K8s.', NULL, NULL, NULL, NOW(), '22000012', true),
(3, 4, 21, 'PENDING', 'Em muốn học về Smart Contract.', NULL, NULL, NULL, NOW(), '22000013', true),
(4, 4, 12, 'PENDING', 'Em muốn tham gia thêm mảng Blockchain.', NULL, NULL, NULL, NOW(), '22000004', true),
(5, 6, 13, 'PENDING', 'Em quan tâm đến ATTT.', NULL, NULL, NULL, NOW(), '22000005', true),
(6, 6, 22, 'PENDING', 'Em muốn nghiên cứu IDS.', NULL, NULL, NULL, NOW(), '21000014', true),
(7, 7, 23, 'PENDING', 'Em đã học NLP cơ bản.', NULL, NULL, NULL, NOW(), '21000015', true),
(8, 7, 24, 'PENDING', 'Em muốn làm Chatbot.', NULL, NULL, NULL, NOW(), '21000016', true),
(9, 8, 25, 'PENDING', 'Em muốn làm KLTN về BigData.', NULL, NULL, NULL, NOW(), '21000017', true),
(10, 11, 26, 'PENDING', 'Em thích làm Game VR.', NULL, NULL, NULL, NOW(), '21000018', true),
(11, 3, 16, 'REJECTED', 'Em tham gia quá nhiều nhóm rồi.', 'Full slot', NOW(), 7, NOW(), '22000008', true),
(12, 4, 17, 'APPROVED', 'Chào mừng em.', 'Đã duyệt', NOW(), 8, NOW(), '22000009', true), -- FIX: Added response details
(13, 6, 18, 'PENDING', 'Xin gia nhập.', NULL, NULL, NULL, NOW(), '22000010', true),
(14, 7, 14, 'PENDING', 'Em muốn làm NLP.', NULL, NULL, NULL, NOW(), '22000006', true),
(15, 10, 15, 'PENDING', 'Mobile AI là đam mê của em.', NULL, NULL, NULL, NOW(), '22000007', true);


-- 6. Đồng bộ lại bộ đếm ID (QUAN TRỌNG ĐỂ KHÔNG BỊ LỖI DUPLICATE KEY)
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));
SELECT setval('research_groups_research_group_id_seq', (SELECT MAX(research_group_id) FROM research_groups));
SELECT setval('group_join_requests_group_join_request_id_seq', (SELECT MAX(group_join_request_id) FROM group_join_requests));

-- Reset base sequences
SELECT setval('slots_slot_id_seq', (SELECT MAX(slot_id) FROM slots));
SELECT setval('lab_rooms_lab_room_id_seq', (SELECT MAX(lab_room_id) FROM lab_rooms));
SELECT setval('devices_device_id_seq', (SELECT MAX(device_id) FROM devices));
