import { createPortal } from 'react-dom'

function Modal({ isOpen, onClose, children }) {
  // 1. Nếu không "mở", không render gì cả
  if (!isOpen) {
    return null
  }

  // 2. Nếu "mở", render Modal bằng Portal
  return createPortal(
    // 1. LỚP NỀN MỜ (Backdrop)
    // Dùng Tailwind để tạo nền mờ và căn giữa
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      {/* 2. CỬA SỔ MODAL (Content Box) */}
      <div
        className="bg-white p-6 rounded-lg shadow-xl relative w-full max-w-2xl" // 'max-w-lg' giới hạn độ rộng
        onClick={(e) => e.stopPropagation()} // Ngăn việc bấm vào modal làm nó tự đóng
      >
        {/* 3. NÚT ĐÓNG (X) */}
        <button
          onClick={onClose} // Gọi hàm 'onClose' từ prop
          className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 4. NỘI DUNG (Children) */}
        {/* Đây là nơi nội dung của bạn (Webcam, v.v.) sẽ xuất hiện */}
        {children}
      </div>
    </div>,

    // Nơi "dịch chuyển" đến (trong public/index.html)
    document.getElementById('modal'),
  )
}

export default Modal
