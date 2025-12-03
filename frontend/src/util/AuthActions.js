import { redirect } from 'react-router-dom'

export async function action({ request }) {
  // 1. Lấy dữ liệu từ form
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')

  // 2. Lấy URL để kiểm tra ?mode=
  const url = new URL(request.url)
  const mode = url.searchParams.get('mode') || 'login'

  try {
    // 3. Chọn logic dựa trên mode
    if (mode === 'signup') {
      // A. Logic đăng ký
      const repassword = formData.get('repassword')

      // 3a. Validation (Frontend)
      if (password !== repassword) {
        return {
          error: 'Passwords do not match.',
          field: 'repassword',
        }
      }

      // 3b. Gọi API Backend (để tạo tài khoản)
      const response = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errData = await response.json()
        return { error: errData.message }
      }

      // 3c. Đăng ký thành công --> Chuyển về trang login
      return redirect('/auth?mode=login')
    } else {
      // B. Logic đăng nhập

      // 4a. Gọi API Backend (để đăng nhập)
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errData = await response.json()
        return { error: errData.message }
      }

      // 4b. Lấy dữ liệu (Token và Cờ hồ sơ)
      const data = await response.json()

      // 4c. Lưu Token và isProfileComplete vào localStorage
      localStorage.setItem('isProfileComplete', data.isProfileComplete)
      localStorage.setItem('token', data.token)
      const expiration = new Date()
      expiration.setHours(expiration.getHours() + 1)
      localStorage.setItem('expiration', expiration.toISOString())

      // 4d. Điều hướng (Redirect) dựa trên cờ 'isProfileComplete'
      if (!data.isProfileComplete) {
        return redirect('/register-information')
      } else {
        return redirect('/rooms')
      }
    }
  } catch (error) {
    if (error instanceof Response) {
      throw error
    }

    throw new Response(error.message || 'An unexpected error occurred.', {
      status: 500,
    })
  }
}
