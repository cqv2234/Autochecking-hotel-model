import { redirect } from 'react-router-dom'

export function action() {
  localStorage.removeItem('token') // Xoá dữ liệu có tag là 'token' từ Local Storage
  localStorage.removeItem('expiration') // Xoá dữ liệu có tag là 'expiration' từ Local Storage
  localStorage.removeItem('isProfileComplete') // Xoá dữ liệu có tag là 'isProfileComplete' từ Local Storage
  return redirect('/') // Điều hướng người dùng về trang chủ
}
