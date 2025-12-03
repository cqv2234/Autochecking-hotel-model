// SearchRoomActions.js

export async function action({ request }) {
  try {
    // Sau khi submit với method là 'post' thì sẽ có một req được gửi đi bởi React, nó sẽ tự động tìm tới action gần nhất trong tuyến
    // action này sẽ nhận 2 giá trị là request và params
    const formData = await request.formData() // Lấy dữ liệu được đóng gói trong request, đây là định dạng đặc biệt gọi là FormData

    // Lấy các giá trị trong formData thông qua name của input
    const searchParams = {
      checkInDate: formData.get('checkin'),
      checkOutDate: formData.get('checkout'),
      adults: formData.get('adults'),
      children: formData.get('children'),
    }

    // Chuyển đối tượng searchParams thành URL Search Params tương ứng
    const queryParams = new URLSearchParams(searchParams)

    // Gửi yêu cầu có chứa URL Search Params tới API đã được định nghĩa ở phía Backend
    const response = await fetch(
      `http://localhost:3000/api/rooms/search?${queryParams.toString()}`,
    )

    // response.ok là true nếu mã trạng thái (status code) nằm trong khoảng 200–299 (ví dụ: 200 OK, 201 Created).
    // response.ok là false nếu mã trạng thái nằm ngoài khoảng đó (ví dụ: 404 Not Found, 500 Internal Server Error).

    // Điều này xảy ra khi response.ok là false, có nghĩa là server đã trả về một mã trạng thái (status code) báo lỗi.
    if (!response.ok) {
      const errorData = await response.json() // Chuyển đổi lỗi nhận được sang định dạng json để thao tác

      // Trả về Object có 3 giá trị error, rooms, searchParams
      return { error: errorData.message, rooms: [], searchParams: null }
    }

    // Nếu không có lỗi trả về thì dòng bên dưới được thực thi
    const rooms = await response.json()

    // Trả về Object có 2 giá trị rooms, searchParams
    return { rooms, searchParams }
  } catch (error) {
    // Bắt lỗi nếu có
    if (error instanceof Response) {
      throw error
    }

    throw new Response(error.message || 'An unexpected error occurred.', {
      status: 500,
    })
  }
}
