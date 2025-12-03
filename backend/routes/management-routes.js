const express = require("express");
const managementController = require("../controllers/management-controllers");
const checkManagementAuth = require("../middleware/check-management-auth");
// Import các quy tắc mới
const {
  searchBookingRules,
  checkInRules,
  validate,
} = require("../validators/management-validators");

const router = express.Router();

router.post("/login", managementController.loginStaff); // (Không cần validate)

// Bảo vệ các route bên dưới
router.use(checkManagementAuth);

router.post(
  "/search-bookings",
  searchBookingRules, // <-- Áp dụng quy tắc
  validate, // <-- Chạy kiểm tra
  managementController.searchBookings
);

router.post(
  "/check-in",
  checkInRules, // <-- Áp dụng quy tắc
  validate, // <-- Chạy kiểm tra
  managementController.performCheckIn
);

module.exports = router;
