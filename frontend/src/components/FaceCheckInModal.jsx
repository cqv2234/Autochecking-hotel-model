import { useState, useRef, useEffect, useCallback } from 'react'
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision'
import Webcam from 'react-webcam'
import Modal from './Modal.jsx'

import { getManagementToken } from '../util/ManagementAuth.js'

const COLOR_LOADING = '#F59E0B' // Vàng cam (Amber 500)
const COLOR_ERROR = '#DC2626' // Đỏ đậm (Red 600)
const COLOR_SUCCESS = '#16A34A' // Xanh đậm (Green 600)

// Hàm này dùng để kiểm tra xem một điểm (faceX, faceY)
// có nằm bên trong hoặc trên đường viền của một hình ellipse hay không.
// Trong đó:
// - faceX, faceY: Tọa độ của điểm cần kiểm tra (ví dụ: vị trí mũi của khuôn mặt).
// - ellipseX, ellipseY: Tọa độ tâm của hình ellipse.
// - axisX, axisY: Bán trục ngang và bán trục dọc của hình ellipse.

// Kết quả trả về:
// - Nếu value <= 1, điểm (faceX, faceY) nằm bên trong hoặc trên đường viền của ellipse (trả về true).
// - Nếu value > 1, điểm (faceX, faceY) nằm bên ngoài ellipse (trả về false).
function isCenterInEllipse(faceX, faceY, ellipseX, ellipseY, axisX, axisY) {
  if (axisX === 0 || axisY === 0) return false
  const value =
    Math.pow(faceX - ellipseX, 2) / Math.pow(axisX, 2) +
    Math.pow(faceY - ellipseY, 2) / Math.pow(axisY, 2)
  return value <= 1
}

// Khởi tạo lastVideoTime để theo dõi thời gian video cuối cùng đã xử lý
let lastVideoTime = -1

// === THAY ĐỔI 1: Tên Component và Props ===
// - Đổi tên: FaceRegistrationModal -> FaceCheckInModal
// - Đổi prop: onCaptureSuccess -> onCheckInSuccess (để báo check-in thành công)
// - Thêm prop: storedEmbedding (để gửi lên API)
function FaceCheckInModal({
  isOpen,
  onClose,
  onCheckInSuccess,
  storedEmbedding,
  bookingId,
}) {
  const [status, setStatus] = useState({
    message: 'Loading...',
    color: COLOR_LOADING,
  }) // Thông báo trạng thái hiển thị cho người dùng
  const [isReady, setIsReady] = useState(false) // Là một boolean cho biết mặt đã hợp lệ hay là chưa
  const [isLoading, setIsLoading] = useState(false) // Là một boolean cho biết ứng dụng có đang trong quá trình gọi API hay không
  const [isModelLoading, setIsModelLoading] = useState(true) // Là một boolean cho biết model AI đã tải xong chưa
  const [lastDetections, setLastDetections] = useState([]) // Lưu trữ kết quả phát (Một mảng chứa các khuôn mặt) từ frame video gần nhất
  const [countdown, setCountdown] = useState(null) // Quản lý số đếm ngược (3, 2, 1)

  // Khởi tạo useRef cho 2 công việc sau:
  // - Để truy cập trực tiếp các phần tử DOM (Như video hoặc canvas)
  // - Để lưu trữ các đối tượng không cần render lại khi thay đổi (Như detector)
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const requestRef = useRef()
  const detectorRef = useRef(null)
  const timerIdRef = useRef(null)

  // Định nghĩa hàm predictLoop và bọc nó trong useCallback
  // useCallback là một hook tối ưu hoá, giúp tránh việc tái tạo hàm không cần thiết
  const predictLoop = useCallback(() => {
    const faceDetector = detectorRef.current // Lấy ra các đối tượng thực tế từ ref đã lưu
    const video = webcamRef.current?.video // Lấy video từ webcam

    // 1. KIỂM TRA ĐIỀU KIỆN
    // Nếu chưa có video hoặc model, hoặc video chưa sẵn sàng thì dừng lại
    if (!video || !faceDetector || video.readyState !== 4) return

    // 2. LẤY CANVAS VÀ CONTEXT - BỐI CẢNH VẼ 2D
    // canvasCtx là công cụ để vẽ lên canvas (như vẽ ảnh, vẽ hình ellipse)
    const canvasElement = canvasRef.current
    if (!canvasElement) return
    const canvasCtx = canvasElement.getContext('2d')

    // 3. ĐIỀU CHỈNH KÍCH THƯỚC CANVAS THEO VIDEO
    // Đặt số pixel của canvas trùng với video để hình ảnh không bị méo
    canvasElement.width = video.videoWidth
    canvasElement.height = video.videoHeight
    const width = canvasElement.width
    const height = canvasElement.height

    // 4. VẼ VIDEO LÊN CANVAS VỚI HIỆU ỨNG "GƯƠNG"
    canvasCtx.save() // Lưu trạng thái ban đầu của canvas
    canvasCtx.clearRect(0, 0, width, height) // Xoá sạch nội dung canvas từ frame trước
    canvasCtx.translate(width, 0) // Di chuyển gốc toạ độ (0,0) từ góc trên bên trái sang góc trên bên phải
    canvasCtx.scale(-1, 1) // Lật ngược trục X để tạo hiệu ứng gương
    canvasCtx.drawImage(video, 0, 0, width, height) // Vẽ video đã lật lên canvas
    canvasCtx.restore() // Khôi phục trạng thái ban đầu của canvas (không bị ảnh hưởng bởi translate/scale)

    // 5. TỐI ƯU HÓA: SỬ DỤNG KẾT QUẢ PHÁT TRƯỚC ĐỂ GIẢM TẢI
    let detections = lastDetections // Bắt đầu với kết quả từ frame trước

    // Chỉ gọi detectForVideo nếu video đã thay đổi (tránh lặp lại cùng 1 frame)
    if (video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime // Cập nhật thời gian video đã xử lý

      // Gọi hàm phát hiện khuôn mặt từ Mediapipe
      const detectionsResult = faceDetector.detectForVideo(
        video,
        performance.now(),
      )
      detections = detectionsResult.detections // Lấy kết quả phát hiện
      setLastDetections(detections) // Cập nhật state với kết quả mới
    }

    // 6. ĐỊNH NGHĨA CÁC HẰNG SỐ VÀ NGƯỠNG (THRESHOLDS)
    // visualEllipseAxis là để vẽ hình ellipse cho người dùng thấy
    // logicalEllipseAxis là Kích thước của ellipse logic (nhỏ hơn, ẩn đi) dùng để kiểm tra xem mặt đã "đủ gần" tâm chưa
    const ellipseCenter = { x: width / 2, y: height / 2 }
    const visualEllipseAxis = { x: width * 0.2, y: height * 0.35 }
    const logicalEllipseAxis = { x: width * 0.05, y: height * 0.1 }
    const minFaceWidth = width * 0.25
    const maxFaceWidth = width * 0.45

    // 7. PHÂN TÍCH KẾT QUẢ VÀ CẬP NHẬT TRẠNG THÁI
    // Biến tạm để lưu thông điệp và trạng thái hiện tại
    let currentMessage = 'Please place your face in the frame'
    let currentColor = COLOR_ERROR
    let ready = false

    // Chỉ phân tích nếu phát hiện ít nhất 1 khuôn mặt
    if (detections.length > 0) {
      const detection = detections[0] // Lấy khuôn mặt đầu tiên
      const noseTip = detection.keypoints[2] // Đỉnh mũi
      const leftFace = detection.keypoints[4] // Điểm ngoài cùng bên trái mặt
      const rightFace = detection.keypoints[5] // Điểm ngoài cùng bên phải mặt

      // Nếu tìm thấy các điểm mốc quan trọng
      if (noseTip && leftFace && rightFace) {
        // Nếu tìm thấy tất cả các điểm mốc cần thiết thì tiếp tục phân tích
        // Tính toán các thông số cần thiết để kiểm tra vị trí và kích thước mặt
        const mirroredNoseX = width * (1 - noseTip.x) // Đây là dòng code lật toạ độ X của mũi
        // noseTip.x ban đầu là toạ độ trong video gốc (chưa lật)
        // Nên để kiểm tra với ellipse ở giữa canvas đã lật,
        // ta cần tính toán toạ độ X đã lật bằng công thức trên
        const faceCenterY = noseTip.y * height // Tọa độ Y của mũi (không cần lật)

        // Tính toán chiều rộng khuôn mặt (theo pixel) dựa trên các điểm mốc bên trái và bên phải
        const faceWidth = Math.abs(leftFace.x * width - rightFace.x * width)

        // Kiểm tra xem mirroredNoseX và faceCenterY có nằm trong ellipse logic hay không
        const isCentered = isCenterInEllipse(
          mirroredNoseX,
          faceCenterY,
          ellipseCenter.x,
          ellipseCenter.y,
          logicalEllipseAxis.x,
          logicalEllipseAxis.y,
        )

        // Kiểm tra xem chiều rộng khuôn mặt có nằm trong ngưỡng cho phép không
        const isSized = faceWidth > minFaceWidth && faceWidth < maxFaceWidth

        // Cập nhật thông điệp và trạng thái dựa trên kết quả kiểm tra
        // Ưu tiên thông báo mặt hợp lệ nếu cả 2 điều kiện đều đúng
        if (isCentered && isSized) {
          currentMessage = 'Valid face!'
          currentColor = COLOR_SUCCESS
          ready = true
        } else if (!isCentered)
          currentMessage = 'Please align your face to the center' // Nếu mặt không ở giữa
        else if (faceWidth < minFaceWidth)
          currentMessage = 'Please bring your face closer' // Nếu mặt quá nhỏ
        else if (faceWidth > maxFaceWidth)
          currentMessage = 'Please move you face further away' // Nếu mặt quá lớn
      } else currentMessage = 'Cannot analyze the face'
    } else currentMessage = 'Cannot find the face' // Nếu không phát hiện khuôn mặt nào

    // 8. VẼ HÌNH ELLIPSE LÊN CANVAS VÀ CẬP NHẬT TRẠNG THÁI
    // Vẽ hình ellipse dùng để hướng dẫn người dùng
    canvasCtx.strokeStyle = currentColor // Màu sắc dựa trên trạng thái hiện tại
    canvasCtx.lineWidth = 4 // Độ dày đường viền
    canvasCtx.beginPath() // Bắt đầu vẽ đường mới
    canvasCtx.ellipse(
      ellipseCenter.x, // Tâm ellipse X
      ellipseCenter.y, // Tâm ellipse Y
      visualEllipseAxis.x, // Bán trục ngang
      visualEllipseAxis.y, // Bán trục dọc
      0, // Góc xoay
      0, // Bắt đầu góc
      2 * Math.PI, // Kết thúc góc
    ) // Vẽ hình ellipse ở giữa canvas
    canvasCtx.stroke() // Kết thúc vẽ đường viền

    // Cập nhật trạng thái hiển thị và isReady CHỈ KHI model đã tải xong
    if (!isModelLoading) {
      setStatus({ message: currentMessage, color: currentColor })
      setIsReady(ready)
    }
  }, [isModelLoading, lastDetections])

  // 9. HÀM BẤT ĐỒNG BỘ DÙNG ĐỂ TẢI VÀ KHỞI TẠO FACE DETECTOR CỦA MEDIAPIPE
  // Dùng useCallback để tránh tái tạo hàm không cần thiết
  const initializeFaceDetector = useCallback(async () => {
    try {
      setIsModelLoading(true)
      const vision = await FilesetResolver.forVisionTasks(
        '/mediapipe-task-files/',
      ) // Tải file cần thiết từ thư mục public

      // Tạo FaceDetector với các tuỳ chọn
      detectorRef.current = await FaceDetector.createFromOptions(vision, {
        // Lưu trữ đối tượng detector trong ref
        baseOptions: {
          modelAssetPath: '/mediapipe-task-files/face_detector.tflite', // Đường dẫn đến model
          delegate: 'CPU', // Sử dụng CPU để xử lý
        },
        runningMode: 'VIDEO', // Chế độ chạy cho video
      })

      setIsModelLoading(false) // Cập nhật trạng thái model đã tải xong
      setStatus({
        message: 'Please place your face in the frame',
        color: COLOR_ERROR,
      }) // Cập nhật thông điệp ban đầu
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error('ERROR: Cannot initialize FaceDetector:', error)
      setStatus({
        message: 'Failed to load model. Please F5.',
        color: COLOR_ERROR,
      })
    }
  }, [])

  // Logic handleCapture (đã cập nhật khối 'catch')
  const handleCapture = useCallback(async () => {
    // 1. Dừng vòng lặp (hoặc để useEffect tự dừng khi 'isLoading' là true)
    cancelAnimationFrame(requestRef.current)
    setIsLoading(true)
    setStatus({ message: 'Authenticating...', color: COLOR_LOADING })

    const imageSrc = webcamRef.current?.getScreenshot()
    if (!imageSrc) {
      setStatus({ message: 'ERROR: Cannot capture image.', color: COLOR_ERROR })
      setIsLoading(false) // Thất bại -> cho phép vòng lặp chạy lại ngay
      return
    }

    // --- KIỂM TRA PROPS (Thêm bookingId) ---
    if (!storedEmbedding || !bookingId) {
      setStatus({
        message: 'ERROR: Missing data (bookingId or embedding).',
        color: COLOR_ERROR,
      })
      clearTimeout(timerIdRef.current)
      timerIdRef.current = setTimeout(() => {
        setStatus({
          message: 'Please place your face in the frame',
          color: COLOR_ERROR,
        })
        setIsLoading(false)
      }, 3000)
      return
    }

    // --- Lấy token ---
    const token = getManagementToken()
    if (!token) {
      setStatus({
        message: 'ERROR: Session expired.',
        color: COLOR_ERROR,
      })
      setIsLoading(false)
      return
    }

    try {
      // 1. ĐỔI API ENDPOINT (Về server Node.js)
      const response = await fetch(
        'http://localhost:3000/api/management/check-in', //
        {
          method: 'POST',
          // 2. THÊM HEADER (Token + Content-Type)
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          // 3. ĐỔI BODY (Gửi cả 3 trường)
          body: JSON.stringify({
            image_data: imageSrc,
            storedEmbedding: storedEmbedding, // (Giả sử embedding là JSON string)
            bookingId: bookingId,
          }),
        },
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      // 4. GỌI CALLBACK THÀNH CÔNG (Giữ nguyên)
      onCheckInSuccess(data)
      onClose()
    } catch (error) {
      // 5. LOGIC LỖI (Giữ nguyên - Vẫn hoạt động tốt)
      console.error('Authentication errors:', error)
      setStatus({ message: `ERROR: ${error.message}`, color: COLOR_ERROR })
      clearTimeout(timerIdRef.current)
      timerIdRef.current = setTimeout(() => {
        setStatus({
          message: 'Please place your face in the frame',
          color: COLOR_ERROR,
        })
        setIsLoading(false)
      }, 3000)
    }
  }, [onCheckInSuccess, onClose, storedEmbedding, bookingId])

  // useEffect bên dưới chỉ chạy một lần khi component được gắn vào DOM
  // Dùng để khởi tạo FaceDetector
  useEffect(() => {
    if (isOpen) {
      initializeFaceDetector() // Gọi hàm khởi tạo
    }
    return () => {
      // Cleanup: Giải phóng tài nguyên khi component unmount
      detectorRef.current?.close()
      detectorRef.current = null
    }
  }, [isOpen, initializeFaceDetector])

  useEffect(() => {
    // Dừng timer retry nếu modal bị đóng (an toàn)
    if (!isOpen) {
      clearTimeout(timerIdRef.current) // Dùng timerIdRef cho cả 2
    }

    // Chạy loop NẾU: modal mở, model đã tải, VÀ KHÔNG đang loading/chờ retry
    if (isOpen && !isModelLoading && !isLoading) {
      const loop = () => {
        predictLoop()
        requestRef.current = requestAnimationFrame(loop)
      }
      requestRef.current = requestAnimationFrame(loop)
    } else {
      // Dừng loop nếu 1 trong 3 điều kiện trên là sai
      cancelAnimationFrame(requestRef.current)
    }

    // Clean-up function
    return () => {
      cancelAnimationFrame(requestRef.current)
    }
  }, [isOpen, isModelLoading, isLoading, predictLoop])

  // useEffect này quản lý logic đếm ngược
  useEffect(() => {
    // Chỉ chạy nếu modal đang mở
    if (!isOpen) {
      setCountdown(null) // Reset nếu modal bị đóng
      clearTimeout(timerIdRef.current)
      return
    }

    // Case 1: Bắt đầu đếm (Mặt hợp lệ, chưa đếm, không loading)
    if (isReady && countdown === null && !isLoading) {
      setCountdown(3)
      return
    }

    // Case 2: Hủy đếm (Người dùng di chuyển)
    if (!isReady && countdown !== null) {
      clearTimeout(timerIdRef.current)
      timerIdRef.current = null
      setCountdown(null)
      return
    }

    // Case 3: Đang đếm
    if (countdown > 0) {
      timerIdRef.current = setTimeout(() => {
        setCountdown((c) => c - 1)
      }, 1000) // 1 giây

      return () => {
        clearTimeout(timerIdRef.current)
      }
    }

    // Case 4: Đếm xong
    if (countdown === 0) {
      handleCapture() // <-- TỰ ĐỘNG GỌI HÀM CHỤP ẢNH
      setCountdown(null) // Reset
    }
  }, [isOpen, isReady, countdown, isLoading, handleCapture])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative w-full">
        {/* === THAY ĐỔI 3: Đổi tiêu đề === */}
        <h2 className="text-2xl text-orange-400 text-center font-bold mb-4">
          Check-in Verification
        </h2>
        <div className="relative w-[640px] max-w-full h-auto rounded-lg overflow-hidden bg-black">
          <Webcam
            ref={webcamRef}
            mirrored={false}
            videoConstraints={{ width: 640, height: 480 }}
            className="absolute opacity-0"
          />
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* ... (Phần hiển thị status/countdown giữ nguyên) ... */}
        <h2
          className="mt-4 text-lg text-center font-bold"
          style={{
            color: isModelLoading
              ? COLOR_LOADING
              : countdown !== null
                ? COLOR_SUCCESS
                : isLoading && status.color !== COLOR_ERROR
                  ? COLOR_LOADING
                  : status.color,
          }}
        >
          {isModelLoading
            ? 'Loading model...'
            : countdown !== null
              ? `Holding... ${countdown}`
              : isLoading
                ? status.message // 'Đang xác thực...' HOẶC 'Lỗi: ...'
                : status.message}
        </h2>
      </div>
    </Modal>
  )
}

export default FaceCheckInModal
