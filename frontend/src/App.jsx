import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Các import cho page của Guest
import RootLayout from './pages/Root.jsx'
import HomePage from './pages/HomePage.jsx'
import RoomsPage from './pages/RoomsPage.jsx'
import { action as searchRoomsAction } from './util/SearchRoomActions.js'
import RoomDetailPage from './pages/RoomDetailPage.jsx'
import { loader as RoomDetailLoader } from './util/RoomDetailLoader.js'
import { action as bookingAction } from './util/BookingActions.js'
import AboutUsPage from './pages/AboutUsPage.jsx'
import ErrorPage from './pages/ErrorPage.jsx'
import AuthenticationPage from './pages/AuthenticationPage.jsx'
import { action as authAction } from './util/AuthActions.js'
import { action as logoutAction } from './util/LogoutActions.js'
import RegisterInformationPage from './pages/RegisterInformationPage.jsx'
import { action as registerInfoAction } from './util/RegisterInfoActions.js'
import {
  tokenLoader,
  checkAuthLoader,
  registerInfoLoader,
} from './util/auth.js'
// ==========

// Các import cho page của Employee
import ManagementLoginPage from './pages/ManagementLoginPage.jsx'
import ManagementRootLayout from './pages/ManagementRoot.jsx'
import CheckInPage from './pages/CheckInPage.jsx'
import { action as checkInSearchAction } from './util/CheckInActions.js'
import { action as managementAuthAction } from './util/ManagementAuthActions.js'
import { action as managementLogoutAction } from './util/ManagementLogoutActions.js'
import {
  managementTokenLoader,
  checkManagementLoader,
} from './util/ManagementAuth.js'
// ==========

// Hàm này có tác dụng tạo ra một bộ định tuyến dựa trên trình duyệt
// Các tính năng nổi bật:
//  - Loaders: Tải dữ liệu trước khi trang (component) được render.
//  - Actions: Xử lý các sự kiện gửi form (như đăng nhập, cập nhật thông tin, ...) một cách mượt mà,
//             không cần useState hay useEffect phức tạp.
//  - Fetchers: Tải dữ liệu trong nền mà không thay đổi URL
const router = createBrowserRouter([
  {
    path: '/', // Định nghĩa tuyến (route), tuyến này là http://localhost:3000/
    element: <RootLayout />, // Đây là thanh điều hướng sẽ xuất hiện trong toàn bộ routes
    errorElement: <ErrorPage />, // Khi tuyến này gặp lỗi (hoặc là các phần tử children gặp lỗi) thì trang này sẽ được render
    loader: tokenLoader, // Khi route này được truy cập thì trước khi page được render thì Loader sẽ chạy trước --> lấy token cho RootLayout
    id: 'root', // id của route này, dùng để sử dụng cho useRouteLoaderData()
    children: [
      // Các phần tử con nằm bên trong tuyến này
      { index: true, element: <HomePage /> }, // Đây là trang sẽ được render khi truy cập tới tuyến http://localhost:3000/
      { path: 'about', element: <AboutUsPage /> }, // http://localhost:3000/about
      {
        path: 'rooms', // http://localhost:3000/rooms
        loader: checkAuthLoader,
        children: [
          { index: true, element: <RoomsPage />, action: searchRoomsAction },
          {
            path: ':roomId', // http://localhost:3000/rooms/:roomId (VD: http://localhost:3000/rooms/1234) - Đây là một page động, ta có thể hiểu đơn giản là khi truy cập với một giá trị bất kì thì trang này luôn được render
            element: <RoomDetailPage />,
            loader: RoomDetailLoader,
            action: bookingAction,
          },
        ],
      },
      {
        path: 'auth', // http://localhost:3000/auth
        element: <AuthenticationPage />,
        action: authAction,
      },
      { path: 'logout', action: logoutAction }, // Route này chỉ được sử dụng để thực hiện hành động logout
      {
        path: 'register-information', // http://localhost:3000/register-information
        element: <RegisterInformationPage />,
        loader: registerInfoLoader,
        action: registerInfoAction,
      },
    ],
  },
  {
    path: 'management', // http://localhost:3000/management
    element: <ManagementRootLayout />,
    loader: managementTokenLoader,
    id: 'management-root',
    children: [
      {
        index: true,
        element: <CheckInPage />,
        loader: checkManagementLoader,
        action: checkInSearchAction,
      },
      {
        path: 'login', // http://localhost:3000/management/login
        element: <ManagementLoginPage />,
        action: managementAuthAction,
      },
      { path: 'logout', action: managementLogoutAction }, // Tương tự thì Route này cũng chỉ dùng để thực hiện hành động logout
    ],
  },
])

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
