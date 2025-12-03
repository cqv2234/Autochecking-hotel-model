import { useState, useEffect, useMemo } from 'react'
import {
  useLoaderData,
  useSearchParams,
  Form,
  useNavigation,
  useActionData,
  useLocation, // Import useLocation để check redirect
} from 'react-router-dom'

import Modal from '../components/Modal.jsx'
import UserInput from '../components/UserInput.jsx'

function calculateNights(checkIn, checkOut) {
  // Chỉ tính nếu cả 2 ngày đều hợp lệ
  try {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    if (checkOutDate <= checkInDate) return 0 // Trả về 0 nếu ngày sai

    const oneDay = 1000 * 60 * 60 * 24
    const diffInTime = checkOutDate.getTime() - checkInDate.getTime()
    return Math.ceil(diffInTime / oneDay)
  } catch (e) {
    return e
  }
}

function RoomDetailPage() {
  // 1. LẤY DỮ LIỆU TỪ CÁC HOOK
  const room = useLoaderData() // Lấy data phòng (từ loader)
  const navigation = useNavigation() // Lấy trạng thái (loading)
  const actionData = useActionData() // Lấy lỗi (nếu action trả về)
  const location = useLocation() // Lấy vị trí hiện tại

  // 2. LẤY THAM SỐ TÌM KIẾM TỪ URL
  const [searchParams] = useSearchParams()
  const checkInDate = searchParams.get('checkInDate') || ''
  const checkOutDate = searchParams.get('checkOutDate') || ''
  const adults = searchParams.get('adults') || 1
  const children = searchParams.get('children') || 0

  const [modalCheckIn, setModalCheckIn] = useState(checkInDate)
  const [modalCheckOut, setModalCheckOut] = useState(checkOutDate)

  // 3. STATE CỦA COMPONENT
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  // 4. CÁC BIẾN TÍNH TOÁN
  const isSubmitting = navigation.state === 'submitting' // True khi action đang chạy
  const bookingError = actionData?.error // Lấy lỗi (ví dụ: "Phòng đã bị đặt")

  const nights = useMemo(
    () => calculateNights(modalCheckIn, modalCheckOut),
    [modalCheckIn, modalCheckOut],
  )

  const totalPrice = useMemo(() => room.price * nights, [room.price, nights])

  // 5. TỰ ĐỘNG ĐÓNG MODAL KHI ĐẶT PHÒNG THÀNH CÔNG
  // (Khi 'action' redirect, 'isSubmitting' sẽ là false
  // và 'navigation.location' sẽ là trang mới)
  useEffect(() => {
    if (
      !isSubmitting &&
      navigation.location &&
      navigation.location.pathname !== location.pathname
    ) {
      // Đã redirect thành công
      setIsBookingOpen(false)
    }
  }, [navigation, isSubmitting, location.pathname])

  return (
    <>
      <Modal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)}>
        <h2 className="text-2xl font-bold mb-4">Confirm Your Booking</h2>
        <p className="text-lg mb-2">
          Room: <strong>{room.roomName}</strong>
        </p>

        <div className="p-3 bg-gray-100 rounded-md mb-4 space-y-2">
          <div className="flex justify-between">
            <span className="font-semibold">Number of guest:</span>
            <span>
              {adults} Adults: , {children} Children
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Number of nights:</span>
            <span>{nights} nights</span>
          </div>
          <hr />
          <div className="flex justify-between text-lg font-bold text-orange-500">
            <span>Total price:</span>
            <span>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(totalPrice)}
            </span>
          </div>
        </div>

        {/* Form này sẽ 'POST' đến 'bookingAction' của route này */}
        <Form method="post" className="space-y-4">
          {/* Điền sẵn dữ liệu từ URL */}
          <UserInput
            title="Check-in Date"
            type="date"
            name="checkInDate"
            value={modalCheckIn}
            onChange={(e) => setModalCheckIn(e.target.value)}
            classNameLabel="block text-sm font-medium text-gray-700 mb-1"
            classNameInput="w-full p-3 border border-gray-400 rounded-md"
            required
          />
          <UserInput
            title="Check-out Date"
            type="date"
            name="checkOutDate"
            value={modalCheckOut}
            onChange={(e) => setModalCheckOut(e.target.value)}
            classNameLabel="block text-sm font-medium text-gray-700 mb-1"
            classNameInput="w-full p-3 border border-gray-400 rounded-md"
            required
          />

          {/* Trường ẨN (Backend chỉ cần 'room') */}
          <input type="hidden" name="room" value={room.id} />
          <input type="hidden" name="adults" value={adults} />
          <input type="hidden" name="children" value={children} />

          {/* Hiển thị lỗi (nếu có) */}
          {bookingError && (
            <p className="p-2 bg-red-100 text-red-700 rounded-md text-center font-bold">
              {bookingError}
            </p>
          )}

          <button
            type="submit"
            className="w-full p-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Confirming...' : 'Confirm & Book'}
          </button>
        </Form>
      </Modal>
      <div className="max-w-4xl mx-auto p-4">
        {/* Hình ảnh (Placeholder) */}
        <div className="w-full h-96 bg-gray-300 rounded-lg mb-4">
          <img
            src="/images/adv2.jpg"
            alt="roomImage"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* Tên và Loại phòng */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-4xl font-bold text-orange-500">
              {room.roomName}
            </h1>
            <p className="text-xl text-gray-600">{room.roomType} Room</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold text-orange-400">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(room.price)}
            </p>
            <p className="text-lg text-gray-500">/ night</p>
          </div>
        </div>

        <hr className="my-4" />

        {/* Mô tả và Thông tin */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-2">Room Description</h2>
            <p className="text-gray-700 leading-relaxed">{room.description}</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">Details</h2>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="font-semibold mr-2">Max Guests:</span>{' '}
                {room.maxGuests}
              </li>
              <li className="flex items-center">
                <span className="font-semibold mr-2">Status:</span>
                <span
                  className={
                    room.status === 'Available'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {room.status}
                </span>
              </li>
            </ul>

            {/* Nút Đặt phòng */}
            <button
              type="button"
              onClick={() => setIsBookingOpen(true)}
              className="w-full mt-6 p-3 bg-orange-500 text-white font-bold rounded-md hover:bg-orange-600 transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default RoomDetailPage
