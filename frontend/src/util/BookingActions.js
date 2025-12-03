// util/BookingActions.js
import { redirect } from 'react-router-dom'
import { getAuthToken } from './auth' // (Hàm lấy token)

export async function action({ request }) {
  // 1. LẤY TOKEN (Để vượt qua 'checkAuth' của backend)
  const token = getAuthToken()
  if (!token) {
    return redirect('/auth?mode=login')
  }

  // 2. LẤY DỮ LIỆU TỪ FORM (Bước 1)
  const formData = await request.formData()

  const bookingData = {
    room: formData.get('room'),
    checkInDate: formData.get('checkInDate'),
    checkOutDate: formData.get('checkOutDate'),
    adults: formData.get('adults'),
    children: formData.get('children'),
  }

  // 3. GỬI REQUEST XUỐNG BACKEND
  try {
    const response = await fetch('http://localhost:3000/api/bookings', {
      // API đã được định nghĩa ở Backend
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // <-- Gửi token ở đây
      },
      body: JSON.stringify(bookingData),
    })

    // 4. XỬ LÝ LỖI (Ví dụ: Lỗi 409 "Trùng lịch")
    if (!response.ok) {
      const errData = await response.json()
      return { error: errData.message } // Trả về lỗi để Modal hiển thị
    }

    // 5. THÀNH CÔNG -> Chuyển hướng
    return redirect('/rooms')
  } catch (err) {
    return err
  }
}
