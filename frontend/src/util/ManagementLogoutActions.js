import { redirect } from 'react-router-dom'

export function action() {
  // XÓA ĐÚNG CÁC KHÓA (KEY) CỦA ADMIN
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminExpiration')
  localStorage.removeItem('adminRole')

  // Chuyển về trang đăng nhập của nhân viên
  return redirect('/management/login')
}
