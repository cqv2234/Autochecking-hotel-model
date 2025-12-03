import {
  Form,
  Link,
  useSearchParams,
  useActionData,
  useNavigation,
} from 'react-router-dom'

import UserInput from '../components/UserInput'

function AuthenticationForm() {
  // Khởi tạo để lấy URL
  const [searchParams] = useSearchParams()

  // Kiểm tra xem mode có đang là 'login' hay không
  const isLogin = searchParams.get('mode') === 'login'

  // Dùng dữ liệu action của route này
  const actionData = useActionData()

  // Khởi tạo để xem trạng thái của route này
  const navigation = useNavigation()

  // Kiểm tra xem form có đang submit hay không
  const isSubmitting = navigation.state === 'submitting'

  // Khởi tạo biến hiển thị lỗi của Nhập lại mật khẩu
  const passwordError =
    actionData?.field === 'repassword' ? actionData.error : null

  // Khởi tạo biến hiển thị lỗi chung được trả về từ Backend
  const generalError = actionData && !actionData.field ? actionData.error : null

  return (
    <div className="w-full flex justify-center my-60">
      <Form method="post" className="w-150 flex flex-col">
        <div className="w-full flex justify-center">
          <h1 className="text-3xl text-black-400 font-bold">
            {isLogin ? 'Log in' : 'Create new user'}
          </h1>
        </div>
        {/* Nơi hiển thị lỗi chung */}
        {generalError && (
          <div className="w-full p-3 my-2 bg-red-100 text-red-700 rounded-md text-center">
            <p>{generalError}</p>
          </div>
        )}
        <div>
          <UserInput
            key={isLogin ? 'login' : 'signup'}
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
            key={isLogin ? 'login' : 'signup'}
            title="Password"
            id="password"
            type="password"
            name="password"
            classNameLabel="block text-xl font-medium text-gray-700 mt-2 mb-1"
            classNameInput={`w-full p-3 border rounded-md focus:ring-orange-500 focus:border-orange-500
                             ${generalError && generalError.includes('Password') ? 'border-red-500' : 'border-gray-400'}`}
          />
        </div>
        {!isLogin && (
          <div>
            <UserInput
              key={isLogin ? 'login' : 'signup'}
              title="Re-enter password"
              id="repassword"
              type="password"
              name="repassword"
              classNameLabel="block text-xl font-medium text-gray-700 mt-2 mb-1"
              classNameInput={`w-full p-3 border rounded-md focus:ring-orange-500 focus:border-orange-500
                               ${passwordError ? 'border-red-500' : 'border-gray-400'}`}
            />
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </div>
        )}
        <div className="w-full flex justify-end space-x-4 mt-4">
          <Link
            to={`?mode=${isLogin ? 'signup' : 'login'}`}
            className="w-40 h-12 flex justify-center items-center bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors"
          >
            {isLogin ? 'Create new user' : 'Go to login'}
          </Link>
          <button
            className="w-40 h-12 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Submitting...'
              : isLogin
                ? 'Login'
                : 'Create account'}
          </button>
        </div>
      </Form>
    </div>
  )
}
export default AuthenticationForm
