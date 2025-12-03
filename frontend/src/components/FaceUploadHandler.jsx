// components/FaceUploadHandler.jsx

import React, { useState } from 'react'

function FaceUploadHandler({ onUploadSuccess }) {
  // Khởi tạo state để quản lý trạng thái của quá trình xử lý file (fetch API)
  const [isProcessing, setIsProcessing] = useState(false)

  // Khởi tạo state để lưu trữ thông báo lỗi
  const [uploadError, setUploadError] = useState(null)

  // Khởi tạo state để lưu trữ ảnh để hiển thị xem trước dưới dạng chuỗi Base64
  const [facePreviewImage, setFacePreviewImage] = useState('')

  // Khởi tạo state để đánh dấu việc tải lên và xử lý đã thành công
  const [uploadSuccess, setUploadSuccess] = useState(false)

  //
  const handleFileChange = async (event) => {
    // Lấy file đầu tiên mà người dùng đã chọn
    const file = event.target.files[0]
    if (!file) return // Nếu file rỗng thì thoát hàm này

    // Gọi hàm quản lý state để khởi tạo giá trị ban đầu
    setIsProcessing(true)
    setUploadError(null)
    setFacePreviewImage('')
    setUploadSuccess(false)

    // Khởi tạo FileReader, đây là một API của trình duyệt để đọc nội dung file từ máy người dùng
    const reader = new FileReader()
    reader.readAsDataURL(file) // Bắt đầu quá trình đọc file ảnh một cách bất đồng bộ và chuyển đổi nó thành một chuỗi Base64 URL
    reader.onloadend = async () => {
      // Sau khi đọc ảnh xong thì .onloadend() sẽ tự động được gọi
      const imageSrc = reader.result // Lấy kết quả ảnh đã đọc (Ở dạng Base64)
      setFacePreviewImage(imageSrc) // Cập nhật state với chuỗi Base64 này

      try {
        // Thực hiện fetch API tới URL bên dưới để trích xuất dữ liệu khuôn mặt
        const response = await fetch(
          'http://localhost:5000/api/extract-embedding',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_data: imageSrc }),
          },
        )

        // Phân tích nội dung JSON của response được trả về
        const data = await response.json()
        // Kiểm tra lỗi
        if (!response.ok) throw new Error(data.message)

        // Thiết lập lại state nếu trích xuất dữ liệu khuôn mặt thành công
        onUploadSuccess(JSON.stringify(data.embedding))
        setUploadError(null)
        setUploadSuccess(true)
      } catch (error) {
        // Nếu fetch thất bại thì sẽ bắt lỗi ở đây
        // Thiết lập lại state để hiển thị lỗi
        onUploadSuccess('')
        setUploadError(error.message)
        setUploadSuccess(false)
      } finally {
        // Khối này luôn luôn chạy
        setIsProcessing(false)
      }
    }
  }

  // JSX đã cập nhật
  return (
    <div>
      <label className="block text-xl font-medium text-gray-700 mb-1 text-center">
        Face Registration
      </label>

      <label
        htmlFor="face-upload"
        className={`
          w-full p-3 flex justify-center text-white font-semibold rounded-md transition-colors
          ${isProcessing ? 'bg-gray-500 cursor-not-allowed' : uploadSuccess ? 'bg-green-600 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'}
        `}
      >
        {isProcessing
          ? 'Processing...'
          : uploadSuccess
            ? 'Image Valid!'
            : 'Upload Face Image'}
      </label>

      <input
        type="file"
        id="face-upload"
        className="hidden"
        onChange={handleFileChange}
        accept="image/png, image/jpeg"
        disabled={isProcessing || uploadSuccess}
      />

      {/* Hiển thị Lỗi hoặc Ảnh Preview */}
      <div className="mt-2 text-center">
        {uploadError && <p className="text-red-600 font-bold">{uploadError}</p>}
        {facePreviewImage && (
          <img
            src={facePreviewImage}
            alt="Face preview"
            className={`w-64 h-auto mt-2 rounded-md mx-auto ${uploadError ? 'border-4 border-red-500' : uploadSuccess ? 'border-4 border-green-500' : ''}`}
          />
        )}
      </div>
    </div>
  )
}

export default FaceUploadHandler
