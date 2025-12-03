import { redirect } from 'react-router-dom'

// Hàm lấy thời gian hiệu lực còn lại của token
export function getTokenDuration() {
  // Lấy thời gian hết hạn, thời gian này được tính tại thời điểm đăng nhập vào hệ thống cộng thêm 1 giờ
  const storedExpirationDate = localStorage.getItem('expiration')
  const expirationDate = new Date(storedExpirationDate) // Chuyển nó sang kiểu Date
  const now = new Date() // Lấy ngày giờ hiện tại
  const duration = expirationDate.getTime() - now.getTime() // Lấy thời gian hết hạn trừ đi thời gian hiện tại
  return duration // Trả về thời gian còn lại
}

// Hàm lấy token
export function getAuthToken() {
  // Lấy token được lưu trong Local Storage
  const token = localStorage.getItem('token')

  // Nếu không tìm thấy
  if (!token) {
    return null // Trả về null
  }

  // Lấy thời gian hiệu lực còn lại của token
  const tokenDuration = getTokenDuration()

  if (tokenDuration < 0) {
    // Nếu < 0, có nghĩa là đã quá thời gian hiệu lực
    return 'EXPIRED' // Trả về chuỗi EXPIRED để thông báo rằng token đã hết thời gian hiệu lực
  }

  return token // Nếu token vẫn còn thời gian hiệu lực thì trả về token đó
}

// Hàm lấy trạng thái hồ sơ của người dùng
export function getProfileStatus() {
  // Lấy trạng thái hồ sơ từ Local Storage
  const status = localStorage.getItem('isProfileComplete')

  // Nếu không có trạng thái
  if (!status) {
    return false // Mặc định là false
  }
  return status === 'true' // Trả về true nếu trạng thái hồ sơ là 'true'
}

// Hàm trả về token
export function tokenLoader() {
  return getAuthToken()
}

// Hàm kiểm tra token có tồn tại hay không và người dùng đã đăng kí thông tin hay chưa
export function checkAuthLoader() {
  // Lấy token
  const token = getAuthToken()
  if (!token) {
    // Nếu không có token - Chưa đăng nhập vào hệ thống hoặc token hết hạn
    return redirect('/auth?mode=login') // Điều hướng về trang login
  }

  const isProfileComplete = getProfileStatus() // Lấy trạng thái hồ sơ
  if (!isProfileComplete) {
    // Nếu trạng thái hồ sơ là false - Chưa đăng ký thông tin cá nhân
    return redirect('/register-information') // Điều hướng về trang đăng kí thông tin
  }

  return null // Mặc định trả về null
}

// Hàm này hoạt động tương tự chỉ khác là nếu đã đăng kí thông tin rồi thì điều hướng về trang tìm kiếm phòng
export function registerInfoLoader() {
  const token = getAuthToken()
  if (!token) {
    return redirect('/auth?mode=login')
  }

  const isProfileComplete = getProfileStatus()
  if (isProfileComplete) {
    return redirect('/rooms')
  }

  return null
}
