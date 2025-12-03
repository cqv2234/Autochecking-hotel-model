import { redirect } from 'react-router-dom'

export async function action({ request }) {
  // 1. Lấy dữ liệu từ form (Email/Password)
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')

  try {
    // 2. Gọi API Backend (của Management)
    const response = await fetch('http://localhost:3000/api/management/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errData = await response.json()
      // Trả về lỗi để ManagementLoginForm hiển thị
      return { error: errData.message }
    }

    // 3. Lấy dữ liệu (Token và Role)
    const data = await response.json() // Ví dụ: { token: "...", role: "admin" }

    // 4. LƯU VỚI KHÓA (KEY) MỚI
    localStorage.setItem('adminToken', data.token)
    localStorage.setItem('adminRole', data.role)
    const expiration = new Date()
    expiration.setHours(expiration.getHours() + 1)
    localStorage.setItem('adminExpiration', expiration.toISOString())

    // 5. Điều hướng đến trang quản lý
    return redirect('/management')
  } catch (error) {
    if (error instanceof Response) {
      throw error
    }
    throw new Response(error.message || 'An unexpected error occurred.', {
      status: 500,
    })
  }
}
