import { redirect } from 'react-router-dom'
import { getAuthToken } from '../util/auth' // Import hàm lấy token

export async function action({ request }) {
  // 1. Lấy token đã lưu
  const token = getAuthToken()
  if (!token) {
    return redirect('/auth?mode=login') // Đá về login nếu không có token
  }

  // 2. Lấy dữ liệu từ <Form>
  const formData = await request.formData()
  const data = {
    fullName: formData.get('fullname'),
    idNumber: formData.get('idNumber'),
    phoneNumber: formData.get('phoneNumber'),
    faceEmbedding: formData.get('faceEmbedding'), // Lấy từ input ẩn
  }

  // 3. Gọi API Backend (Bước 2)
  try {
    const response = await fetch(
      'http://localhost:3000/api/auth/profile', // API bạn vừa tạo
      {
        method: 'PATCH', // <-- Method là PATCH
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // <-- Gửi token
        },
        body: JSON.stringify(data),
      },
    )

    if (!response.ok) {
      const errData = await response.json()
      // Trả về lỗi để 'useActionData' (trong form) bắt
      return { message: errData.message }
    }

    // 4. THÀNH CÔNG!
    // Cập nhật 'isProfileComplete' trong localStorage
    localStorage.setItem('isProfileComplete', 'true')

    // Điều hướng về trang chủ
    return redirect('/rooms')
  } catch (err) {
    return { error: err.message || 'Network error.' }
  }
}
