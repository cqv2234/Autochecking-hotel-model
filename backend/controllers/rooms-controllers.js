const HttpError = require("../models/http-error");

const Booking = require("../models/Booking"); // Import model Booking
const Room = require("../models/Room"); // Import model Room

const searchRooms = async (req, res, next) => {
  try {
    // 1. Lấy và kiểm tra các tham số
    const { checkInDate, checkOutDate, adults, children } = req.query;
    if (!checkInDate || !checkOutDate || !adults || !children) {
      return next(new HttpError("Invalid query parameters.", 400));
    }

    const requestedCheckIn = new Date(checkInDate + "T00:00:00Z");
    const requestedCheckOut = new Date(checkOutDate + "T00:00:00Z");
    const totalGuests = parseInt(adults) + parseInt(children || 0);

    // --- LOGIC TRUY VẤN MONGODB ---

    // 2. Tìm tất cả các ID của những phòng đã có booking trùng lịch
    const conflictingBookings = await Booking.find({
      // Điều kiện trùng lịch:
      // Chỉ tìm các booking đang 'active'
      status: { $in: ["Confirmed", "CheckedIn"] },
      // Một booking cũ bắt đầu trước khi booking mới kết thúc
      checkInDate: { $lt: requestedCheckOut },
      // VÀ một booking cũ kết thúc sau khi booking mới bắt đầu
      checkOutDate: { $gt: requestedCheckIn },
    }).select("room"); // Chỉ lấy trường room

    const conflictingRoomIds = conflictingBookings.map(
      (booking) => booking.room
    );

    // 3. Tìm tất cả các phòng thỏa mãn 2 điều kiện:
    //    - Sức chứa (capacity) >= tổng số khách
    //    - ID của phòng KHÔNG nằm trong danh sách các phòng đã trùng lịch
    const availableRooms = await Room.find({
      maxGuests: { $gte: totalGuests },
      _id: { $nin: conflictingRoomIds }, // $nin = "not in"
    });

    // 4. Trả về kết quả
    if (availableRooms.length === 0) {
      return next(
        new HttpError("No rooms available for the selected criteria.", 404)
      );
    }

    res.status(200).json(availableRooms);
  } catch (error) {
    console.error(error);
    return next(new HttpError("Fetching rooms failed, please try again.", 500));
  }
};

const getRoomById = async (req, res, next) => {
  const roomId = req.params.roomId; // Lấy ID từ URL

  let room;
  try {
    room = await Room.findById(roomId);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not find a room.", 500)
    );
  }

  if (!room) {
    return next(
      new HttpError("Could not find a room for the provided id.", 404)
    );
  }

  // Chuyển đổi _id thành id (nếu bạn chưa dùng .toJSON)
  res.json({ room: room.toObject({ getters: true }) });
};

exports.searchRooms = searchRooms;
exports.getRoomById = getRoomById;
