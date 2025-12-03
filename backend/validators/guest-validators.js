// validators/auth-validator.js
const { check, validationResult } = require("express-validator");
const HttpError = require("../models/http-error"); // Import class HttpError của bạn

// 1. Export mảng quy tắc cho Đăng ký (Signup)
exports.signupValidationRules = [
  check("email")
    .normalizeEmail()
    .isEmail()
    .withMessage("Please provide a valid email address."),

  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
];

// 2. Export mảng quy tắc cho Đăng nhập (Login)
exports.loginValidationRules = [
  check("email")
    .normalizeEmail()
    .notEmpty() // Chỉ cần kiểm tra không rỗng
    .withMessage("Please provide your email."),

  check("password")
    .notEmpty() // Chỉ cần kiểm tra không rỗng
    .withMessage("Please provide your password."),
];

// 3. Export mảng quy tắc cho cho Cập nhật hồ sơ (Profile)
exports.updateProfileRules = [
  check("fullName").notEmpty().withMessage("Full name is required."),

  check("idNumber")
    .notEmpty()
    .withMessage("ID Number is required.")
    .isNumeric() // 1. Phải là kí tự số
    .withMessage("ID Number must contain only digits (0-9).")
    .isLength({ min: 12, max: 12 }) // 2. Phải đủ 12 kí tự
    .withMessage("ID Number must be exactly 12 digits long."),

  check("phoneNumber")
    .isNumeric() // 1. Phải là kí tự số
    .withMessage("Phone number must contain only digits.")
    .isLength({ min: 10, max: 10 }) // 2. Phải đủ 10 kí tự
    .withMessage("Phone number must be exactly 10 digits long."),

  check("faceEmbedding")
    .notEmpty()
    .withMessage("Face registration is required"),
];

// 4. Export mảng quy tắc Đặt phòng khách sạn
exports.bookingValidationRules = [
  check("room") // Tên trường 'room' từ model Booking.js
    .notEmpty()
    .isMongoId() // Kiểm tra xem có phải là ID của MongoDB không
    .withMessage("Invalid Room ID."),

  check("checkInDate")
    .isISO8601() // Kiểm tra có phải định dạng ngày YYYY-MM-DD
    .toDate() // Tự động chuyển thành đối tượng Date
    .withMessage("Invalid Check-in date format."),

  check("checkOutDate")
    .isISO8601()
    .toDate()
    .withMessage("Invalid Check-out date format.")
    // Kiểm tra logic: checkout phải sau checkin
    .custom((value, { req }) => {
      // 'value' (checkOutDate) đã được .toDate() chuyển đổi
      if (value <= req.body.checkInDate) {
        throw new Error("Check-out date must be after check-in date.");
      }
      return true;
    }),

  // === THÊM VALIDATION MỚI ===
  check("adults")
    .notEmpty()
    .withMessage("Number of adults is required.")
    .isNumeric()
    .withMessage("Number of adults must be a number.")
    .isInt({ min: 1 }) // Phải là số nguyên và ít nhất là 1
    .withMessage("There must be at least 1 adult."),

  check("children")
    .notEmpty()
    .withMessage("Number of children is required.")
    .isNumeric()
    .withMessage("Number of children must be a number.")
    .isInt({ min: 0 }) // Phải là số nguyên và có thể là 0
    .withMessage("Number of children cannot be negative."),
  // ==========================
];

// 5. Export một middleware để kiểm tra kết quả
exports.validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    // Nếu không có lỗi, cho phép đi tiếp (tới controller)
    return next();
  }

  // Nếu có lỗi, lấy lỗi đầu tiên và ném ra
  const firstError = errors.array()[0].msg;

  // Ném lỗi 422
  return next(new HttpError(firstError, 422));
};
