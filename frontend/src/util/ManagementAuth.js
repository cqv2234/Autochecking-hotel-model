import { redirect } from 'react-router-dom'

export function getManagementTokenDuration() {
  const storedExpirationDate = localStorage.getItem('adminExpiration') // <-- Key mới
  const expirationDate = new Date(storedExpirationDate)
  const now = new Date()
  const duration = expirationDate.getTime() - now.getTime()
  return duration
}

export function getManagementToken() {
  const token = localStorage.getItem('adminToken')

  if (!token) {
    return null
  }

  const tokenDuration = getManagementTokenDuration()

  if (tokenDuration < 0) {
    return 'EXPIRED'
  }

  return token
}

export function managementTokenLoader() {
  return getManagementToken()
}

// Loader bảo vệ các trang quản lý
export function checkManagementLoader() {
  const token = getManagementToken()

  // Nếu không có token (hoặc hết hạn), đá về trang login của admin
  if (!token || token === 'EXPIRED') {
    return redirect('/management/login')
  }

  return null
}
