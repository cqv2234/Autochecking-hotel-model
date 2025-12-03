import Modal from './Modal.jsx' // Dùng lại component Modal chung

function CheckInSuccessModal({ booking, onClose }) {
  if (!booking) return null

  // Lấy thông tin chi tiết (đã được populate từ searchBookings)
  const guestName = booking.guest?.fullName || 'Quý khách'
  const roomNumber = booking.room?.roomNumber || '[Chưa xác định]'
  const roomName = booking.room?.roomName || '[Chưa xác định]'

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="text-center p-4">
        {/* Biểu tượng Check (SVG) */}
        <svg
          className="w-16 h-16 text-green-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>

        <h2 className="text-3xl font-bold text-green-600 mb-4">
          Successfully check-in!
        </h2>
        <p className="text-lg text-gray-700 mb-2">
          Welcome, <strong>{guestName}</strong>
        </p>
        <p className="text-md text-gray-600">
          Welcome you to the room{' '}
          <strong>
            {roomName} (Room's number: {roomNumber})
          </strong>
          .
        </p>
        <p className="text-md text-gray-600 mt-4">
          Wishing you a wonderful vacation!
        </p>

        {/* Nút này dùng để đóng modal */}
        <button
          onClick={onClose}
          className="mt-8 bg-green-500 text-white font-bold px-6 py-3 rounded-lg
                     hover:bg-green-600 focus:outline-none focus:ring-2 
                     focus:ring-green-500 focus:ring-offset-2"
        >
          Complete
        </button>
      </div>
    </Modal>
  )
}

export default CheckInSuccessModal
