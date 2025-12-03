import { Form, useNavigation } from 'react-router-dom'

import UserInput from './UserInput.jsx'

function SearchHotelRooms() {
  // useNavigation là một hook của React Router (v6+), nó cho bạn biết trạng thái điều hướng (navigation) hiện tại của ứng dụng.
  // Hook này trả về một đối tượng navigation. Thuộc tính quan trọng nhất là navigation.state. Nó sẽ có một trong ba giá trị:
  //  - 'idle' (Nhàn rỗi): Trạng thái mặc định. Không có gì đang xảy ra cả.
  //  - 'loading' (Đang tải): Một loader của route mới đang chạy để lấy dữ liệu (ví dụ: sau khi bạn nhấp vào một <Link>).
  //  - 'submitting' (Đang gửi): Một action đang chạy (ví dụ: sau khi bạn gửi một <Form>).
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting' // Nếu đang thực hiện một action thì sẽ trả về true

  return (
    <Form
      className="w-3/4 grid grid-cols-1 lg:grid-cols-5 gap-4 p-4 bg-white rounded-lg shadow-lg"
      method="post"
    >
      <div>
        <UserInput
          title="Check-in date"
          id="checkin"
          type="date"
          name="checkin"
          classNameLabel="block text-sm font-medium text-gray-700 mb-1"
          classNameInput="w-full p-3 border border-gray-400 rounded-md focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div>
        <UserInput
          title="Check-out date"
          id="checkout"
          type="date"
          name="checkout"
          classNameLabel="block text-sm font-medium text-gray-700 mb-1"
          classNameInput="w-full p-3 border border-gray-400 rounded-md focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div>
        <UserInput
          title="Number of adults"
          id="adults"
          type="number"
          name="adults"
          min="0"
          placeholder="Enter number of adults"
          classNameLabel="block text-sm font-medium text-gray-700 mb-1"
          classNameInput="placeholder-gray-300 w-full p-3 border border-gray-400 rounded-md focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div>
        <UserInput
          title="Number of children"
          id="children"
          type="number"
          name="children"
          min="0"
          placeholder="Enter number of children"
          classNameLabel="block text-sm font-medium text-gray-700 mb-1"
          classNameInput="placeholder-gray-300 w-full p-3 border border-gray-400 rounded-md focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          className="w-full h-12 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Search'}
        </button>
      </div>
    </Form>
  )
}

export default SearchHotelRooms
