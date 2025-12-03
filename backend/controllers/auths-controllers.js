const HttpError = require("../models/http-error");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const Guest = require("../models/Guest");

const signupGuest = async (req, res, next) => {
  // 1. Lấy email, password từ req.body
  const { email, password } = req.body;

  // 2. Kiểm tra xem email đã tồn tại hay chưa
  let existingGuest;
  try {
    existingGuest = await Guest.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError("Signing up failed, please try again later.", 500)
    );
  }

  if (existingGuest) {
    return next(
      new HttpError("Email already exists. Please login instead.", 422)
    );
  }
  // 3. Mã hoá (hash) mật khẩu
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("Could not create user, please try again.", 500));
  }

  // 4. Tạo Guest mới
  const newGuest = new Guest({
    email: email,
    password: hashedPassword,
  });

  // 5. Lưu Guest mới vào DB
  try {
    await newGuest.save();
  } catch (err) {
    return next(
      new HttpError("Signing up failed, please try again later.", 500)
    );
  }

  // 6. Trả về thông báo tạo tài khoản thành công
  res.status(201).json({ message: "Signup successful! Please login." });
};

const loginGuest = async (req, res, next) => {
  // 1. Lấy email, password từ req.body
  const { email, password } = req.body;

  // 2. Tìm xem Guest (người dùng) có tồn tại không
  let existingGuest;
  try {
    existingGuest = await Guest.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError("Logging in failed, please try again later.", 500)
    );
  }

  // 3. Xử lý lỗi email không tồn tại
  if (!existingGuest) {
    return next(
      new HttpError(
        "Email you enter is not existing, please try again later.",
        401
      )
    );
  }

  // 4. So sánh mật khẩu
  let isValidPassword = false;
  try {
    // So sánh passworrd người dùng nhập (chưa hash)
    // với password trong DB (đã hash)
    isValidPassword = await bcrypt.compare(password, existingGuest.password);
  } catch (err) {
    return next(
      new HttpError("Could not log you in, please check your credentials.", 500)
    );
  }

  // 5. Xử lý lỗi mật khẩu không đúng
  if (!isValidPassword) {
    return next(
      new HttpError(
        "Password you enter is incorrect, please try again later.",
        401
      )
    );
  }

  // 6. Kiểm tra "Hoàn tất hồ sơ"
  let isProfileComplete = true;
  if (
    !existingGuest.fullName ||
    !existingGuest.idNumber ||
    !existingGuest.phoneNumber ||
    !existingGuest.faceEmbedding
  ) {
    // Nếu bất kỳ trường nào trong số này thiếu, hồ sơ chưa hoàn tất
    isProfileComplete = false;
  }

  // 7. Tạo JWT (JSON Web Token)
  let token;
  try {
    token = jwt.sign(
      {
        userId: existingGuest.id,
        email: existingGuest.email,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(
      new HttpError("Logging in failed, please try again later.", 500)
    );
  }

  // 8. Đăng nhập thành công: Trả về token và cờ 'isProfileComplete'
  res.status(200).json({
    token: token,
    isProfileComplete: isProfileComplete,
  });
};

const updateGuestProfile = async (req, res, next) => {
  // 1. Lấy dữ liệu từ form (req.body)
  const { fullName, idNumber, phoneNumber, faceEmbedding } = req.body;

  // 2. Lấy userId từ token (đã được 'checkAuth' giải mã)
  // Đây là cách chúng ta biết "ai" đang cập nhật
  const guestId = req.userData.userId;

  let embeddingArray;
  try {
    // 3. Chuyển đổi embedding (từ chuỗi JSON về mảng)
    // (Vì frontend đã dùng JSON.stringify)
    if (faceEmbedding) {
      embeddingArray = JSON.parse(faceEmbedding);
    }
  } catch (err) {
    return next(new HttpError("Invalid face embedding data format.", 400));
  }

  let updatedGuest;
  try {
    // 4. Tìm và Cập nhật Guest trong 1 lệnh
    updatedGuest = await Guest.findByIdAndUpdate(
      guestId,
      {
        fullName: fullName,
        idNumber: idNumber,
        phoneNumber: phoneNumber,
        faceEmbedding: embeddingArray ? embeddingArray : [], // Cập nhật mảng
      },
      { new: true } // Yêu cầu Mongoose trả về document MỚI (đã cập nhật)
    ).select("-password"); // Luôn luôn loại bỏ password
  } catch (err) {
    // 5. Xử lý lỗi (Quan trọng: Bắt lỗi 'unique' của idNumber)
    if (err.code === 11000 && err.keyPattern?.idNumber) {
      return next(new HttpError("This ID Number is already registered.", 422));
    }
    return next(
      new HttpError("Updating profile failed, please try again.", 500)
    );
  }

  // 6. Trả về thông tin Guest đã cập nhật
  res.status(200).json({
    message: "Profile updated successfully!",
    guest: updatedGuest.toObject({ getters: true }),
  });
};

exports.signupGuest = signupGuest;
exports.loginGuest = loginGuest;
exports.updateGuestProfile = updateGuestProfile;
