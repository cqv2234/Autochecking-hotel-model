import { Form, useActionData, useNavigation } from 'react-router-dom'
import { useRef, useState } from 'react'

import UserInput from '../components/UserInput.jsx'
import FaceUploadHandler from './FaceUploadHandler.jsx'

function RegisterInformationForm() {
  // Khởi tạo state để lưu trữ faceEmbedding
  const [faceEmbedding, setFaceEmbedding] = useState('')

  // Khởi tạo state để reset key của component upload ảnh nhằm mục đích trả lại trạng thái ban đầu của component đó
  const [uploadKey, setUploadKey] = useState(0)

  // Khởi tạo ref để thao tác trên trạng thái hiện tại của form
  const formRef = useRef(null)

  // Sử dụng dữ liệu từ action của route này
  const actionData = useActionData()

  // Kiểm tra trạng thái điều hướng của route này
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  // Khởi tạo biến để lưu trữ lỗi chung được trả về từ backend
  const generalError = actionData?.message || null

  function handleUploadSuccess(embeddingString) {
    setFaceEmbedding(embeddingString)
  }

  // Khởi tạo hàm để xử lý reset các component về trạng thái ban đầu
  function handleReset() {
    formRef.current?.reset()
    setFaceEmbedding('')
    setUploadKey((prevKey) => prevKey + 1)
  }

  return (
    <div className="w-1/2 flex flex-col justify-center mt-5 mx-auto space-y-4">
      <h1 className="text-3xl text-orange-400 font-bold text-center">
        Personal Information Form
      </h1>

      {generalError && (
        <p className="text-red-500 text-center font-bold p-2 bg-red-100 rounded-md">
          {generalError}
        </p>
      )}

      <Form
        method="post"
        className="space-y-4 w-full max-w-lg mx-auto"
        ref={formRef}
      >
        <UserInput
          title="Fullname"
          id="fullname"
          type="text"
          name="fullname"
          placeholder="Enter your fullname"
          classNameLabel="block text-xl font-medium text-gray-700 mb-1"
          classNameInput="w-full p-3 border border-gray-400 rounded-md focus:ring-orange-500 focus:border-orange-500"
        />

        <UserInput
          title="ID Number"
          id="idNumber"
          type="text"
          name="idNumber"
          placeholder="Enter your ID number"
          classNameLabel="block text-xl font-medium text-gray-700 mb-1"
          classNameInput="w-full p-3 border border-gray-400 rounded-md focus:ring-orange-500 focus:border-orange-500"
        />

        <UserInput
          title="Phone Number"
          id="phoneNumber"
          type="text"
          name="phoneNumber"
          placeholder="Enter your phone number"
          classNameLabel="block text-xl font-medium text-gray-700 mb-1"
          classNameInput="w-full p-3 border border-gray-400 rounded-md focus:ring-orange-500 focus:border-orange-500"
        />
        <FaceUploadHandler
          key={uploadKey}
          onUploadSuccess={handleUploadSuccess}
        />

        <UserInput
          title=""
          id="faceEmbedding"
          type="hidden"
          name="faceEmbedding"
          classNameLabel=""
          classNameInput=""
          value={faceEmbedding}
        />
        <div className="w-full flex justify-center space-x-4">
          <button
            type="button"
            className="w-40 h-12 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors"
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            disabled={isSubmitting}
            className="w-40 h-12 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </Form>
    </div>
  )
}

export default RegisterInformationForm
