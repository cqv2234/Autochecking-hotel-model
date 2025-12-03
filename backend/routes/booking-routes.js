// routes/booking-routes.js
const express = require("express");
const bookingController = require("../controllers/booking-controllers");
const checkAuth = require("../middleware/check-auth"); // Middleware bảo vệ

// Import validator (từ các file bạn đã có)
const {
  bookingValidationRules,
  validate,
} = require("../validators/guest-validators"); // Dùng chung hàm 'validate'

const router = express.Router();

// === BẢO VỆ TẤT CẢ CÁC ROUTE BÊN DƯỚI ===
// Bắt buộc phải có token hợp lệ

// POST /api/bookings
router.post(
  "/",
  checkAuth,
  bookingValidationRules, // 1. Chạy quy tắc
  validate, // 2. Kiểm tra lỗi (nếu có, sẽ dừng ở đây)
  bookingController.createBooking // 3. Chạy logic (nếu không có lỗi)
);

// (Bạn cũng có thể thêm các route khác ở đây)
// GET /api/bookings/my-bookings
// router.get('/my-bookings', bookingController.getMyBookings);

module.exports = router;
