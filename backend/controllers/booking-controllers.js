// controllers/booking-controller.js

const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const HttpError = require("../models/http-error");

// (Hàm tính số đêm - giữ nguyên)
function calculateNights(checkIn, checkOut) {
  const oneDay = 1000 * 60 * 60 * 24; // Miliseconds trong 1 ngày
  const diffInTime = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(diffInTime / oneDay); // Luôn làm tròn lên
}

// === HÀM TẠO BOOKING (ĐÃ CẬP NHẬT GIỜ) ===
const createBooking = async (req, res, next) => {
  // 1. Lấy dữ liệu (từ Form và Token)
  const {
    room: roomId,
    checkInDate,
    checkOutDate,
    adults,
    children,
  } = req.body;
  const guestId = req.userData.userId; // Lấy từ middleware 'checkAuth'

  // 2. Lấy Date objects (đang là 00:00:00Z)
  const requestedCheckIn = new Date(checkInDate);
  const requestedCheckOut = new Date(checkOutDate);

  // === 3. CỐ ĐỊNH GIỜ (THEO TIÊU CHUẨN) ===

  // Đặt giờ Check-in: 14:00:00 (2 giờ chiều) (UTC)
  requestedCheckIn.setUTCHours(14, 0, 0, 0);

  // Đặt giờ Check-out: 12:00:00 (12 giờ trưa) (UTC)
  requestedCheckOut.setUTCHours(12, 0, 0, 0);
  // ======================================

  // 4. Lấy giá phòng
  let roomData;
  try {
    roomData = await Room.findById(roomId);
    if (!roomData) {
      return next(new HttpError("Could not find room for provided id.", 404));
    }
  } catch (err) {
    return next(
      new HttpError("Could not create booking, please try again.", 500)
    );
  }

  // 5. Kiểm tra lại số khách
  const totalGuests = parseInt(adults || 1) + parseInt(children || 0);
  if (totalGuests > roomData.maxGuests) {
    return next(
      new HttpError(
        "Number of guests exceeds the maximum capacity for this room.",
        422
      )
    );
  }

  // 6. KIỂM TRA ĐẶT TRÙNG (Dùng ngày giờ đã được CỐ ĐỊNH)
  let conflictingBooking;
  try {
    conflictingBooking = await Booking.findOne({
      room: roomId,
      status: { $in: ["Confirmed", "CheckedIn"] },
      checkInDate: { $lt: requestedCheckOut },
      checkOutDate: { $gt: requestedCheckIn },
    });
  } catch (err) {
    return next(
      new HttpError("Could not create booking, please try again.", 500)
    );
  }

  if (conflictingBooking) {
    return next(
      new HttpError("This room is already booked for the selected dates.", 409)
    );
  }

  // 7. TÍNH TOÁN (Dùng ngày giờ đã được CỐ ĐỊNH)
  const nights = calculateNights(requestedCheckIn, requestedCheckOut);

  // (Ví dụ: Checkin 20/11 @ 14:00, Checkout 21/11 @ 12:00 = 22 tiếng = 1 đêm)
  // (Ví dụ: Checkin 20/11 @ 14:00, Checkout 22/11 @ 12:00 = 46 tiếng = 2 đêm)
  if (nights <= 0) {
    return next(
      new HttpError("Check-out date must be after check-in date.", 422)
    );
  }
  const calculatedTotalPrice = roomData.price * nights;

  // 8. Tạo Booking mới
  const newBooking = new Booking({
    guest: guestId,
    room: roomId,
    checkInDate: requestedCheckIn, // <-- Lưu giờ 14:00
    checkOutDate: requestedCheckOut, // <-- Lưu giờ 12:00
    adults: adults, // <-- LƯU LẠI
    children: children, // <-- LƯU LẠI
    totalPrice: calculatedTotalPrice,
    status: "Confirmed",
  });

  // 9. Lưu vào Database
  try {
    await newBooking.save();
  } catch (err) {
    return next(
      new HttpError("Creating booking failed, please try again.", 500)
    );
  }

  // 10. Trả về thành công
  res.status(201).json({ booking: newBooking.toObject({ getters: true }) });
};

exports.createBooking = createBooking;
