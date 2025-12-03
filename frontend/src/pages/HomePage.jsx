import { useNavigate } from 'react-router-dom'

import MapPinIcon from '../components/icon/MapPinIcon.jsx'

function HomePage() {
  const navigate = useNavigate()

  // Hàm này dùng để điều hướng người dùng tới trang tìm kiếm phòng
  function handleBookNow() {
    navigate('/rooms')
  }

  return (
    <div className="relative h-screen bg-cover bg-center bg-[url(/images/HomepageBG.jpg)]">
      {/* 1. Lớp phủ mờ */}
      <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

      {/* 2. Div nội dung vẫn giữ z-10 để nổi lên trên lớp phủ */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-4 space-y-12">
        <div className="flex space-x-4">
          <MapPinIcon className="size-10" />
          <h1 className="text-3xl font-semibold">
            12 Nguyen Van Bao street, Ward 1, Go Vap district, Ho Chi Minh city
          </h1>
        </div>
        <p className="text-8xl font-bold animate-glow">
          Welcome to <br />
          the paradise of relaxation
        </p>
        <button
          className="h-16 w-48 text-xl bg-orange-400 hover:bg-transparent hover:text-orange-400 transition-colors duration-300 text-white font-bold py-2 px-4 border border-orange-500 rounded-sm"
          onClick={handleBookNow} // Khi click thì hàm này sẽ được kích hoạt
        >
          Book now
        </button>
      </div>
    </div>
  )
}

export default HomePage
