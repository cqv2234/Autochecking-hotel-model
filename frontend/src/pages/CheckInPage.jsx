// Import React và các hook cần thiết
import { useState, useEffect } from 'react'

import { Form, useActionData, useNavigation, useSubmit } from 'react-router-dom'
import { Scanner } from '@yudiel/react-qr-scanner' // Import Scanner

import CheckInResultsList from '../components/CheckInResultsList.jsx'
import FaceCheckInModal from '../components/FaceCheckInModal.jsx'
import UserInput from '../components/UserInput.jsx'
import CheckInSuccessModal from '../components/CheckInSuccessModal.jsx'

function CheckInPage() {
  // Lấy dữ liệu trả về từ action
  const actionData = useActionData()

  // Phân tách lỗi và danh sách bookings từ actionData
  const searchError = actionData?.error
  const bookings = actionData?.bookings

  // Quản lý trạng thái nạp (loading)
  const navigation = useNavigation()
  const isLoading = navigation.state === 'submitting'

  // Hook này giúp ta kích hoạt action mà không cần nhấn nút <button type="submit">
  const submit = useSubmit()

  // State để quản lý booking được chọn và booking đã check-in thành công
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [checkedInBooking, setCheckedInBooking] = useState(null)

  // State để bật/tắt camera
  const [isScanning, setIsScanning] = useState(false)

  // State để quản lý việc tự động mở modal khi có kết quả từ QR scan
  const [isAutoCheckIn, setIsAutoCheckIn] = useState(false)

  // UseEffect để tự động mở modal khi có bookings và isAutoCheckIn là true
  useEffect(() => {
    // Chỉ tự động mở modal KHI VÀ CHỈ KHI:
    // a. Có dữ liệu bookings
    // b. Cờ hiệu isAutoCheckIn đang bật (True)
    if (bookings && bookings.length > 0 && isAutoCheckIn) {
      const firstBooking = bookings[0]

      if (firstBooking.guest.faceEmbedding) {
        setSelectedBooking(firstBooking)
      } else {
        console.warn('User has no face data.')
      }

      // Quan trọng: Reset cờ hiệu về false ngay sau khi đã xử lý xong
      // Để lần sau nếu user search tay thì nó không tự mở nữa.
      setIsAutoCheckIn(false)
    }
  }, [bookings, isAutoCheckIn]) // Thêm isAutoCheckIn vào dependency array

  // XỬ LÝ SỰ KIỆN QUÉT QR CODE THÀNH CÔNG
  const handleScan = (result) => {
    // 1. Nếu quét thành công và có kết quả trả về
    if (result && result.length > 0) {
      const rawData = result[0].rawValue // Lấy dữ liệu thô từ QR code
      const parts = rawData.split('|') // Giả sử định dạng là "idNumber|otherData"
      const idNumber = parts[0] // Lấy số CCCD từ phần đầu tiên

      // 2. Kiểm tra tính hợp lệ của ID number (ví dụ: độ dài 12 ký tự)
      if (idNumber && idNumber.length === 12) {
        setIsScanning(false) // Đóng camera sau khi quét thành công

        setIsAutoCheckIn(true) // Bật cờ hiệu tự động mở modal

        // 3. Tạo FormData và gửi đến action
        const formData = new FormData()
        formData.append('idNumber', idNumber)
        submit(formData, { method: 'post' })
      }
    }
  }

  // XỬ LÝ KHI NGƯỜI DÙNG CHỌN MỘT BOOKING TỪ DANH SÁCH
  const handleSelectBooking = (booking) => {
    if (!booking.guest.faceEmbedding) {
      alert('This guest has not registered their face.')
      return
    }
    setSelectedBooking(booking)
  }

  // XỬ LÝ KHI CHECK-IN THÀNH CÔNG
  const handleCheckInSuccess = () => {
    const fullBookingInfo = selectedBooking
    setSelectedBooking(null)
    setCheckedInBooking(fullBookingInfo)
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      {/* --- Card Tìm kiếm --- */}
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                Search for reservations
              </h2>
              <p className="text-gray-500">
                Scan QR or enter ID number manually
              </p>
            </div>
            {/* Nút bật tắt Camera */}
            <button
              onClick={() => setIsScanning(!isScanning)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {isScanning ? 'Close Camera' : 'Scan QR Code'}
            </button>
          </div>

          {/* KHUNG CAMERA (Chỉ hiện khi bấm Scan) */}
          {isScanning && (
            <div className="mb-6 mx-auto w-full max-w-md border-2 border-blue-500 rounded-lg overflow-hidden">
              <Scanner
                onScan={handleScan}
                constraints={{
                  facingMode: 'environment', // Camera sau
                  aspectRatio: 1,
                }}
                // Tắt chế độ quét liên tục quá nhanh
                scanDelay={500}
              />
              <p className="text-center text-sm text-blue-600 mt-2 p-2">
                Place the QR code containing your identification information in
                the designated frame.
              </p>
            </div>
          )}

          <Form method="post">
            <div className="flex flex-col sm:flex-row gap-4">
              <UserInput
                title=""
                id="idNumber"
                type="text"
                name="idNumber"
                placeholder="Enter ID number manually"
                classNameLabel=""
                classNameInput="flex-grow form-input px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-orange-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </Form>
        </div>
      </div>

      {/* --- Khu vực Kết quả --- */}
      <div className="mt-8">
        {searchError && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg"
            role="alert"
          >
            <p className="font-bold">Cannot be found</p>
            <p>{searchError}</p>
          </div>
        )}

        {/* Vì chúng ta đã tự động mở modal, danh sách này có thể vẫn hiển thị bên dưới 
            như một background hoặc cho phép chọn thủ công nếu auto-select sai 
        */}
        {bookings && bookings.length > 0 && (
          <CheckInResultsList
            bookings={bookings}
            onSelectBooking={handleSelectBooking}
          />
        )}

        {bookings && bookings.length === 0 && (
          <p className="text-center text-gray-500">No bookings found.</p>
        )}
      </div>

      {/* === MODAL === */}
      {selectedBooking && (
        <FaceCheckInModal
          isOpen={true}
          onClose={() => setSelectedBooking(null)}
          storedEmbedding={selectedBooking.guest.faceEmbedding}
          bookingId={selectedBooking.id}
          onCheckInSuccess={handleCheckInSuccess}
        />
      )}

      {checkedInBooking && (
        <CheckInSuccessModal
          booking={checkedInBooking}
          onClose={() => setCheckedInBooking(null)}
        />
      )}
    </div>
  )
}

export default CheckInPage
