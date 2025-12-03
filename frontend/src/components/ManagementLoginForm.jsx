// components/ManagementLoginForm.jsx
import { Form, useActionData, useNavigation } from 'react-router-dom' // Bỏ Link và useSearchParams

import UserInput from '../components/UserInput'

function ManagementLoginForm() {
  // Sử dụng dữ liệu action của route này
  const actionData = useActionData()

  // Khởi tạo để kiểm tra trạng thái của route
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  // Khởi tạo biến để lưu trữ lỗi được trả về từ backend
  const generalError = actionData && !actionData.field ? actionData.error : null

  return (
    <div className="w-full flex justify-center my-60">
      <Form method="post" className="w-150 flex flex-col">
        <div className="w-full flex justify-center">
          <h1 className="text-3xl text-black-400 font-bold">
            Management Login
          </h1>
        </div>
        {generalError && (
          <div className="w-full p-3 my-2 bg-red-100 text-red-700 rounded-md text-center">
            <p>{generalError}</p>
          </div>
        )}
        <div>
          <UserInput
            title="Email"
            id="email"
            type="email"
            name="email"
            classNameLabel="block text-xl font-medium text-gray-700 mt-2 mb-1"
            classNameInput={`w-full p-3 border rounded-md focus:ring-orange-500 focus:border-orange-500
                             ${generalError && generalError.includes('Email') ? 'border-red-500' : 'border-gray-400'}`}
          />
        </div>
        <div>
          <UserInput
            title="Password"
            id="password"
            type="password"
            name="password"
            classNameLabel="block text-xl font-medium text-gray-700 mt-2 mb-1"
            classNameInput={`w-full p-3 border rounded-md focus:ring-orange-500 focus:border-orange-500
                             ${generalError && generalError.includes('Password') ? 'border-red-500' : 'border-gray-400'}`}
          />
        </div>

        <div className="w-full flex justify-end space-x-4 mt-4">
          <button
            className="w-40 h-12 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Login'}
          </button>
        </div>
      </Form>
    </div>
  )
}
export default ManagementLoginForm
