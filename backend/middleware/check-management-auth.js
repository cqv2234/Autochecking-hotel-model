const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") return next();
  try {
    // 1. Lấy token (Giống 'check-auth')
    const token = req.headers.authorization.split(" ")[1]; // "Bearer TOKEN"
    if (!token) {
      throw new Error("Authentication failed!");
    }

    // 2. Xác thực token (Giả sử bạn dùng cùng một KEY)
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);

    // 3. KIỂM TRA QUYỀN (ROLE)
    // (Giả sử token của nhân viên có 'role' và 'employeeId')
    if (!decodedToken.role || decodedToken.role === "guest") {
      throw new Error("Authorization failed. Not an employee.");
    }

    const validRoles = ["admin", "manager", "receptionist"];
    if (!validRoles.includes(decodedToken.role)) {
      throw new Error("Authorization failed. Invalid role.");
    }

    // 4. Gắn dữ liệu của NHÂN VIÊN (không phải guest)
    req.employeeData = {
      employeeId: decodedToken.employeeId,
      role: decodedToken.role,
    };
    next();
  } catch (err) {
    return next(new HttpError("Authentication failed!", 401));
  }
};
