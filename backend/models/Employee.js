const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employeeSchema = new Schema(
  {
    // === 1. Thông tin Xác thực (Để đăng nhập) ===
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      // Luôn luôn mã hóa (hash) mật khẩu này!
    },

    // === 2. Thông tin Hồ sơ (Profile) ===
    fullName: {
      type: String,
      required: true,
    },
    employeeId: {
      // Mã nhân viên (ví dụ: NV001)
      type: String,
      unique: true,
      sparse: true, // Cho phép unique nếu trường này không rỗng
    },
    phoneNumber: {
      type: String,
    },

    // === 3. Trường Phân quyền (QUAN TRỌNG NHẤT) ===
    role: {
      type: String,
      enum: [
        "admin", // Quản trị viên (cao nhất)
        "manager", // Quản lý (ví dụ: quản lý đặt phòng)
        "receptionist", // Lễ tân (ví dụ: chỉ check-in/check-out)
      ],
      required: true,
      default: "receptionist", // Đặt mặc định an toàn nhất
    },

    // === 4. Trạng thái tài khoản ===
    status: {
      type: String,
      enum: ["active", "inactive"], // 'active' = đang làm việc, 'inactive' = đã nghỉ
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

employeeSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

// Mongoose sẽ tạo collection tên là 'employees'
const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;
