## 📋 Thông tin Pull Request

### What (Làm gì)

<!-- Mô tả ngắn gọn những gì PR này thực hiện -->

### Why (Tại sao)

<!-- Giải thích lý do cần thay đổi này -->

### Changes (Thay đổi)

<!-- Liệt kê chi tiết các thay đổi -->

#### Backend

-

#### Frontend

- ***

## ✅ Checklist chung

- [ ] Code đã được format theo chuẩn
- [ ] Không có console.log hoặc debug code còn sót
- [ ] Đã cập nhật documentation (nếu cần)
- [ ] Đã tự review code trước khi tạo PR
- [ ] Commit messages tuân theo quy ước
- [ ] Branch name tuân theo quy ước

---

## 🔐 Auth Checklist (nếu liên quan đến authentication)

<!-- Bỏ section này nếu PR không liên quan đến auth -->

- [ ] ✅ Register với thông tin hợp lệ → 201 Created
- [ ] ❌ Register với email trùng → 400/409 Error
- [ ] ✅ Login với credentials đúng → 200 OK + Token
- [ ] ❌ Login với credentials sai → 401 Unauthorized
- [ ] ✅ Gọi Protected API với token hợp lệ → 200 OK
- [ ] ❌ Gọi Protected API không có token → 401 Unauthorized
- [ ] Token refresh hoạt động đúng
- [ ] Logout xóa token thành công

---

## 📸 Screenshots (nếu có thay đổi UI)

<!-- Thêm screenshots so sánh Before/After nếu có -->

| Before | After |
| ------ | ----- |
|        |       |

---

## 🔗 Related Issues

<!-- Link đến issue liên quan (nếu có) -->
<!-- Closes #123 -->

---

## 📝 Notes for Reviewers

<!-- Ghi chú thêm cho người review -->
