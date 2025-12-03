import { Outlet, useLoaderData, useSubmit } from 'react-router-dom'
import { useEffect } from 'react'

import MainNavigation from '../components/MainNavigation.jsx'
import { getTokenDuration } from '../util/auth.js'

function RootLayout() {
  const token = useLoaderData() // Sử dụng useLoaderData() để lấy token từ Loader đã được định nghĩa
  const submit = useSubmit() // Hook được cung cấp bởi RRD, cho phép kích hoạt action (Hoặc loader) mà không cần người dùng phải bấm nút submit của Form

  // useEffect sẽ chạy sau khi toàn bộ các component đã được render
  useEffect(() => {
    // Nếu không có token
    if (!token) {
      return // Ngay lập tức dừng hàm hiện tại
    }

    // Nếu token là chuỗi EXPIRED
    if (token === 'EXPIRED') {
      // Thì dòng này sẽ được thực thi, sử dụng hook bên dưới để tự động kích hoạt action
      // null: Nghĩa là không gửi kèm dữ liệu gì
      // { action: '/logout', method: 'post' }: Chỉ định rõ rằng nó muốn kích hoạt action được định nghĩa ở tuyến (route) /logout bằng phương thức POST
      submit(null, { action: '/logout', method: 'post' })
      return // Sau khi gửi yêu cầu đăng xuất, ngay lập tức dừng hàm hiện tại
    }

    // Nếu token vẫn còn thì dòng bên dưới sẽ được thực thi
    const tokenDuration = getTokenDuration() // Lấy thời gian còn sử dụng được của token
    console.log(tokenDuration) // In ra thời gian đó trong console dưới dạng milisecond

    setTimeout(() => {
      submit(null, { action: '/logout', method: 'post' })
    }, tokenDuration) // Thiết lập thời gian còn lại để đăng xuất khỏi hệ thống
  }, [token, submit]) // Đây là Dependency Array, nếu các giá trị có trong mảng này có sự thay đổi thì useEffect sẽ được chạy lại
  return (
    <>
      <MainNavigation /> {/*Đây là component của Thanh điều hướng*/}
      <Outlet />
      {/*- Outlet là một component của React Router (v6+), nó đóng vai trò là một "chỗ giữ" (placeholder).
         - Tác dụng của nó là "chỉ định vị trí mà component con sẽ được render" bên trong một component cha (thường là layout).*/}
    </>
  )
}

export default RootLayout
