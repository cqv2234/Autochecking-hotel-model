const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

// Hàm middleware là một hàm JavaScript bình thường
const checkAuth = (req, res, next) => {
  // 1. (Dùng cho CORS) - Trình duyệt luôn gửi 1 request OPTIONS
  //    trước khi POST, PATCH, v.v. Chúng ta phải cho phép nó đi qua
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    // 2. Lấy token từ header.
    //    Frontend PHẢI gửi lên theo định dạng: "Authorization: Bearer <TOKEN>"
    const token = req.headers.authorization.split(" ")[1]; // Tách "Bearer" và lấy <TOKEN>

    if (!token) {
      // Nếu không có 'Authorization' header hoặc không có token
      throw new Error("Authentication failed!");
    }

    // 3. Giải mã token
    // Dùng ĐÚNG "secret key" mà ta đã lưu trong file .env
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);

    // 4. Gắn dữ liệu (payload đã giải mã vào request)
    // Giờ đây, tất cả các controller chạy sau middleware này
    // đều có thể truy cập req.userData để lấy thông tin user đã đăng nhập
    req.userData = {
      userId: decodedToken.userId,
      email: decodedToken.email,
      // Bất cứ thứ gì mà ta đã đưa vào token khi 'login'
    };

    // 5. Cho phép request đi tiếp tới controller
    next();
  } catch (err) {
    // 6. Nếu token không hợp lệ (hết hạn, sai, v.v.)
    // Dùng request và trả về lỗi 401 (Unauthorized)
    return next(new HttpError("Authentication failed!", 401));
  }
};

module.exports = checkAuth;
