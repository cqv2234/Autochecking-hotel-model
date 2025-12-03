// util/CheckInActions.js

import { getManagementToken } from './ManagementAuth'

const SEARCH_API = 'http://localhost:3000/api/management/search-bookings'

// Đây chính là hàm action
export async function action({ request }) {
  const formData = await request.formData()
  const idNumber = formData.get('idNumber')

  const token = getManagementToken()

  // Dữ liệu validation cơ bản
  if (!idNumber) {
    return { error: 'Please enter your ID numbers.' }
  }

  try {
    const response = await fetch(SEARCH_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      // Backend (management-controllers) chờ { idNumber, bookingId }
      // Chúng ta chỉ gửi idNumber
      body: JSON.stringify({ idNumber: idNumber }),
    })

    const data = await response.json()

    if (!response.ok) {
      // Nếu API trả lỗi (như 404, 400), trả về tin nhắn lỗi
      return { error: data.message || "Failed to fetch guest's bookings." }
    }

    // THÀNH CÔNG: Trả về toàn bộ dữ liệu (ví dụ: { bookings: [...] })
    return data
  } catch (err) {
    // Lỗi mạng hoặc server sập
    return {
      error: err || 'Could not connect to the server. Please try again.',
    }
  }
}
