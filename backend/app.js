const PORT = 3000;

require("dotenv").config(); // Đọc file .env chứa secret key được sử dụng để tạo token trả về frontend sau khi login vào hệ thống

// Khởi tạo các thư viện và routes
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const roomsRoutes = require("./routes/rooms-routes");
const authsRoutes = require("./routes/auths-routes");
const bookingRoutes = require("./routes/booking-routes");
const managementRoutes = require("./routes/management-routes");

const app = express();

app.use(express.json()); // Sử dụng cái này để Backend được xây dựng với Express có thể đọc và hiểu được dữ liệu JSON được gửi đến trong phần body của request
app.use(cors()); // Sử dụng cái này để cho phép trình duyệt web gọi API của Backend này từ một domain khác

// Định nghĩa route API
app.use("/api/rooms", roomsRoutes);
app.use("/api/auth", authsRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/management", managementRoutes);

// Đây là một Middleware Xử Lý Lỗi (Error-Handling Middleware) trung tâm trong Express.
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

// Kết nối tới MongoDB và chạy Backend ở PORT 3000
mongoose
  .connect(
    "mongodb+srv://vinhplaykennen:chauvinh220304@cvprojectcluster.bjkez1d.mongodb.net/hotelsDB?retryWrites=true&w=majority&appName=CVProjectCluster"
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
