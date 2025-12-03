const { check, validationResult } = require("express-validator");

// Quy tắc cho API tìm kiếm
exports.searchBookingRules = [
  // Đảm bảo ít nhất một trong hai trường phải có
  check("idNumber")
    .if(check("bookingId").isEmpty()) // Chỉ check nếu 'bookingId' rỗng
    .notEmpty()
    .withMessage("ID Number or Booking ID is required."),

  check("bookingId")
    .if(check("idNumber").isEmpty()) // Chỉ check nếu 'idNumber' rỗng
    .notEmpty()
    .withMessage("ID Number or Booking ID is required."),
];

// Quy tắc cho API check-in
exports.checkInRules = [
  check("bookingId")
    .notEmpty()
    .isMongoId() // Quan trọng: Phải là ID của MongoDB
    .withMessage("Invalid Booking ID format."),

  check("image_data").notEmpty().withMessage("Image data is required."),
];

// Export một middleware để kiểm tra kết quả
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
