function CheckInResultsList({ bookings, onSelectBooking }) {
  if (!bookings || bookings.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-700">
        Found Results ({bookings.length})
      </h3>

      {/* Lặp qua từng booking và tạo card */}
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-white shadow-lg rounded-lg overflow-hidden
                     flex flex-col sm:flex-row justify-between items-center p-5"
        >
          {/* Thông tin */}
          <div className="mb-4 sm:mb-0">
            <p className="text-lg font-bold text-gray-900">
              {booking.guest.fullName}
            </p>
            <p className="text-sm text-gray-600">
              Room:{' '}
              <span className="font-medium text-gray-800">
                {booking.room.roomName} (Number: {booking.room.roomNumber})
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Check-in:{' '}
              <span className="font-medium text-gray-800">
                {new Date(booking.checkInDate).toLocaleDateString()}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Status:{' '}
              <span className="font-medium text-green-600">
                {booking.status}
              </span>
            </p>
          </div>

          {/* Nút hành động */}
          <button
            onClick={() => onSelectBooking(booking)}
            className="w-full sm:w-auto bg-green-500 text-white font-bold px-5 py-2 rounded-lg
                       hover:bg-green-600 focus:outline-none focus:ring-2 
                       focus:ring-green-500 focus:ring-offset-2"
          >
            Check-in
          </button>
        </div>
      ))}
    </div>
  )
}

export default CheckInResultsList
