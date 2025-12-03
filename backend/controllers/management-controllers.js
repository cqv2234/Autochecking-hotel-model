// controllers/management-controller.js
const axios = require("axios"); // Dùng để gọi Python
const HttpError = require("../models/http-error");
const Booking = require("../models/Booking");
const Guest = require("../models/Guest");
const Employee = require("../models/Employee"); // (Bạn cần model Employee)
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// === 1. ĐĂNG NHẬP NHÂN VIÊN ===
const loginStaff = async (req, res, next) => {
  const { email, password } = req.body;

  let employee;
  try {
    employee = await Employee.findOne({ email: email, status: "active" });
  } catch (err) {
    return next(new HttpError("Logging in failed.", 500));
  }

  if (!employee) {
    return next(new HttpError("Invalid credentials.", 401));
  }

  // (Kiểm tra password bằng bcrypt...)
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, employee.password);
  } catch (err) {
    return next(new HttpError("Could not log you in.", 500));
  }
  if (!isValidPassword) {
    return next(new HttpError("Invalid credentials.", 401));
  }

  // Tạo token MỚI (chứa role)
  let token;
  try {
    token = jwt.sign(
      {
        userId: employee.id, // (Hoặc employeeId)
        email: employee.email,
        role: employee.role, // <-- Rất quan trọng
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Logging in failed.", 500));
  }

  res.status(200).json({ token: token, role: employee.role });
};

// === 2. TÌM KIẾM BOOKING (CHO KIOSK) ===
const searchBookings = async (req, res, next) => {
  // 1. LẤY DỮ LIỆU TỪ req.body (đổi 'guestName' thành 'idNumber')
  const { idNumber, bookingId } = req.body;

  let query = {}; // Khởi tạo query rỗng
  let guest;

  if (bookingId) {
    // Ưu tiên tìm theo Mã đặt phòng (nếu có)
    query._id = bookingId;
  } else if (idNumber) {
    // 2. TÌM GUEST BẰNG 'idNumber'
    try {
      // 'idNumber' là unique (duy nhất) trong Guest model
      guest = await Guest.findOne({ idNumber: idNumber });

      if (!guest) {
        return next(new HttpError("Guest not found with this ID Number.", 404));
      }

      // 3. TÌM BOOKING BẰNG 'guestId'
      query.guest = guest._id; // Gán guestId vào query
    } catch (e) {
      return next(
        new HttpError("Finding guest failed, please try again.", 500)
      );
    }
  } else {
    // Nếu không cung cấp cả hai
    return next(
      new HttpError("Please provide an ID Number or Booking ID.", 400)
    );
  }

  query.status = "Confirmed";

  let bookings;
  try {
    bookings = await Booking.find(query)
      .populate("guest", "fullName idNumber faceEmbedding") // Lấy thông tin Guest (để xác nhận)
      .populate("room", "roomNumber roomName"); // Lấy thông tin Phòng
  } catch (err) {
    return next(new HttpError("Search failed, please try again.", 500));
  }

  if (bookings.length === 0) {
    return next(
      new HttpError(
        // Cập nhật lại thông báo lỗi cho chính xác
        "No confirmed bookings found with these details.",
        404
      )
    );
  }

  // 5. Trả về kết quả
  res
    .status(200)
    .json({ bookings: bookings.map((b) => b.toObject({ getters: true })) });
};

// === 3. XỬ LÝ CHECK-IN (API MẤU CHỐT) ===
const performCheckIn = async (req, res, next) => {
  // 1. Nhận CẢ BA DỮ LIỆU TỪ FRONTEND
  // (Frontend phải gửi cả 3)
  const { bookingId, image_data, storedEmbedding } = req.body;

  // Validation cơ bản
  if (!bookingId || !image_data || !storedEmbedding) {
    return next(
      new HttpError(
        "Incomplete data (missing bookingId, image, or embedding).",
        400
      )
    );
  }

  // 2. GỌI PYTHON SERVER (AI) - Bỏ qua bước populate
  let pythonResponse;
  try {
    pythonResponse = await axios.post(
      "http://localhost:5000/api/authenticate",
      {
        image_data: image_data,
        stored_embedding: storedEmbedding,
      },
      // THÊM CẤU HÌNH NÀY:
      {
        validateStatus: function (status) {
          return status < 500; // Chỉ coi là lỗi nếu status >= 500 (Lỗi server sập)
        },
      }
    );

    // 3. Xử lý kết quả từ Python (Giữ nguyên)
    // Nếu Python báo lỗi (Spoof, Không khớp, v.v.)
    if (pythonResponse.data.status !== "success") {
      return next(new HttpError(pythonResponse.data.message, 401)); // 401 Unauthorized
    }
  } catch (err) {
    // Nếu server Python sập
    console.error("Python AI Server error:", err.message);
    return next(new HttpError("Face recognition service failed.", 503));
  }

  // 4. THÀNH CÔNG: Cập nhật trạng thái Booking
  // Dùng findByIdAndUpdate chỉ tốn 1 lần gọi DB
  let updatedBooking;
  try {
    updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "CheckedIn" },
      { new: true } // {new: true} để Mongoose trả về document đã cập nhật
    );

    if (!updatedBooking) {
      return next(new HttpError("No booking found to update.", 404));
    }
  } catch (err) {
    return next(new HttpError("Failed to update booking status.", 500));
  }

  // 5. Trả về thành công
  res.status(200).json({
    message: "Check-in successful!",
    booking: updatedBooking.toObject({ getters: true }), // Trả về booking đã update
  });
};

exports.loginStaff = loginStaff;
exports.searchBookings = searchBookings;
exports.performCheckIn = performCheckIn;
