const bcrypt = require("bcryptjs");

// 1. Đặt mật khẩu bạn muốn mã hóa ở đây
const plainPassword = "vinhplaykennen";

// 2. Định nghĩa một hàm async (bất đồng bộ)
async function hashPassword() {
  try {
    // 3. Mã hóa mật khẩu với độ phức tạp (salt) là 12
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    console.log("--- Mã hóa thành công ---");
    console.log("Mật khẩu gốc (Plain):", plainPassword);
    console.log("Mật khẩu đã mã hóa (Hashed):");

    // 4. In chuỗi mã hóa ra terminal
    console.log(hashedPassword);
  } catch (err) {
    console.error("Lỗi mã hóa:", err);
  }
}

// 5. Gọi hàm
hashPassword();
