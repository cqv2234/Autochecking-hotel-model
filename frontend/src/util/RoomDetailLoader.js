export async function loader({ params }) {
  const roomId = params.roomId // Lấy ID từ URL

  // Gửi req tới API đã được định nghĩa ở Backend để lấy dữ liệu phòng
  const response = await fetch(`http://localhost:3000/api/rooms/${roomId}`)

  if (!response.ok) {
    // (Xử lý lỗi 404 hoặc 500 từ backend)
    // Bạn có thể ném (throw) lỗi ở đây để 'errorElement' bắt
    throw new Response('Could not find room data.', { status: response.status })
  }

  const resData = await response.json()
  return resData.room // Trả về data (đối tượng 'room')
}
