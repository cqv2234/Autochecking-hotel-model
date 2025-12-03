import { Link } from 'react-router-dom'
import UserIcon from './icon/UserIcon.jsx'

function Card({ room, searchParams }) {
  const searchQueryString = searchParams
    ? new URLSearchParams(searchParams).toString()
    : ''

  return (
    <div className="group flex flex-col bg-white border border-gray-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden md:flex-row md:max-w-4xl w-full">
      {/* Phần hình ảnh */}
      <div className="relative w-full md:w-2/5 h-64 md:h-auto overflow-hidden">
        <img
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          src="/images/room1.jpg"
          alt={room.roomName}
        />
      </div>

      {/* Phần nội dung */}
      <div className="flex flex-col justify-between p-6 leading-normal w-full md:w-3/5">
        <div>
          <div className="flex justify-between items-start">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-800 group-hover:text-orange-600 transition-colors">
              {room.roomName}
            </h5>
          </div>

          <p className="mb-4 font-normal text-gray-600 line-clamp-2">
            {room.description}
          </p>
        </div>

        {/* Phần giá và thông tin khách */}
        <div className="mt-auto">
          <div className="flex flex-row items-center justify-between mb-4 pt-4 border-t border-gray-100">
            {/* Giá tiền - Điểm nhấn chính */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase font-semibold">
                Price / night
              </span>
              <p className="text-2xl font-extrabold text-orange-600">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(room.price)}
              </p>
            </div>

            {/* Số lượng khách */}
            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
              <UserIcon className="text-orange-500 size-5" />
              <span className="text-orange-700 font-semibold text-sm">
                {room.maxGuests} Guests
              </span>
            </div>
          </div>

          {/* Nút bấm */}
          <Link
            className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg shadow-orange-200"
            to={`${room.id}?${searchQueryString}`}
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Card
