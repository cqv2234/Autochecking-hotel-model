import SearchHotelRooms from '../components/SearchHotelRooms.jsx'
import DisplayHotelRooms from '../components/DisplayHotelRooms.jsx'
import { useActionData } from 'react-router-dom'

function HotelPage() {
  // useActionData là một hook của React Router (v6+), nó cho phép component của bạn truy cập vào dữ liệu (hoặc lỗi) được trả về từ action sau khi action đó chạy xong
  // Nói đơn giản, nó là cách để component của bạn nhận kết quả sau khi gửi (submit) một <Form>.
  const actionData = useActionData()

  // Lấy dữ liệu rooms, searchParams, error thông qua actionData
  const rooms = actionData?.rooms || []
  const searchParams = actionData?.searchParams
  const error = actionData?.error || null

  return (
    <div className="flex-col justify-items-center p-5">
      <SearchHotelRooms />
      {/* Nếu có error thì sẽ render error đó ra */}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {/* Nếu mảng rỗng thì sẽ render */}
      {rooms.length === 0 && (
        <p className="text-orange-400 text-2xl mt-2">
          Please fill out the searching box to find your room.
        </p>
      )}
      {/* Nếu mảng không rỗng thì sẽ render */}
      {rooms.length > 0 && (
        <DisplayHotelRooms hotelRoomsData={rooms} searchParams={searchParams} />
      )}
    </div>
  )
}

export default HotelPage
