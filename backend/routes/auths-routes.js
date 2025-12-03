const express = require("express");

const authsControllers = require("../controllers/auths-controllers");
const checkAuth = require("../middleware/check-auth");

const {
  signupValidationRules,
  loginValidationRules,
  updateProfileRules,
  validate,
} = require("../validators/guest-validators");

const router = express.Router();

router.post(
  "/signup",
  signupValidationRules, // <-- 1. Chạy mảng quy tắc
  validate, // <-- 2. Chạy hàm kiểm tra kết quả
  authsControllers.signupGuest // <-- 3. Chỉ chạy nếu 'validate' thành công
);

router.post(
  "/login",
  loginValidationRules,
  validate,
  authsControllers.loginGuest
);

router.patch(
  "/profile",
  checkAuth,
  updateProfileRules,
  validate,
  authsControllers.updateGuestProfile
);

module.exports = router;
