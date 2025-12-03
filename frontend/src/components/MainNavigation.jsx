import { NavLink, Form, useRouteLoaderData, Link } from 'react-router-dom'
// 1. IMPORT CÁC COMPONENT MỚI
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Transition,
} from '@headlessui/react'
import { Fragment } from 'react' // (Cần cho Transition)

import HotelLogo from '../assets/logo.svg'
import UserIcon from './icon/UserIcon.jsx'

function MainNavigation() {
  const token = useRouteLoaderData('root')

  return (
    <div className="h-20 flex items-center justify-between px-6 bg-white shadow-md">
      {/* 1. Logo (Bên trái) */}
      <div className="flex-shrink-0">
        <NavLink to="/">
          <img src={HotelLogo} alt="Hotel Logo" className="h-16 w-auto" />
        </NavLink>
      </div>

      {/* 2. Các Link (Ở giữa) */}
      <nav>
        <ul className="flex items-center space-x-12 text-2xl font-bold text-orange-400">
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `hover:text-orange-600 transition-colors duration-300 ${isActive ? 'underline underline-offset-4 decoration-orange-400' : ''}`
              }
            >
              {/* Khi sử dụng NavLink, ở prop className, mỗi khi ta dùng Arrow Function, React sẽ luôn tự động truyền prop isActive vào hàm này.
              Ta có thể sử dụng prop này để thực hiện ép style động cho component này. */}
              {/* Ví dụ: Khi người dùng truy cập tới http://localhost:3000/about, React sẽ thực hiện kiểm tra xem Route này có đang kích hoạt hay không,
              nếu nó đang kích hoạt thì isActive sẽ trả về "true" và ngược lại sẽ trả về "false". Ta có thể tận dụng các giá trị trả về của isActive để render component theo ý muốn. */}
              About us
            </NavLink>
          </li>
          {token && (
            <li>
              <NavLink
                to="/rooms"
                className={({ isActive }) =>
                  `hover:text-orange-600 transition-colors duration-300 ${isActive ? 'underline underline-offset-4 decoration-orange-400' : ''}`
                }
              >
                Rooms
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      {/* 3. Khu vực Đăng nhập / Người dùng (Bên phải) */}
      <div className="flex items-center">
        {/* Nút Đăng nhập (Giữ nguyên) */}
        {!token && (
          <NavLink
            to="/auth?mode=login"
            className="px-5 py-2 bg-orange-500 text-white text-lg font-semibold rounded-md hover:bg-orange-600 transition-colors"
          >
            Login / Sign Up
          </NavLink>
        )}

        {/* === 4. SỬA DROPDOWN DÙNG CÚ PHÁP MỚI === */}
        {token && (
          <Menu as="div" className="relative">
            {/* Dùng <MenuButton> (thay vì <Menu.Button>) */}
            <MenuButton className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <UserIcon className="size-8 text-gray-700" />
            </MenuButton>

            {/* (Transition giữ nguyên) */}
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              {/* Dùng <MenuItems> (thay vì <Menu.Items>) */}
              <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                {/* Dùng <MenuItem> (thay vì <Menu.Item>) */}
                {/* Bỏ render prop '({ active }) =>' */}
                <MenuItem>
                  <Link
                    to="/profile"
                    // Dùng 'ui-active:' để tạo kiểu khi hover/focus
                    className="block w-full text-left px-4 py-2 text-gray-700 ui-active:bg-gray-100"
                  >
                    My Profile
                  </Link>
                </MenuItem>

                <MenuItem>
                  <Link
                    to="/my-bookings"
                    className="block w-full text-left px-4 py-2 text-gray-700 ui-active:bg-gray-100"
                  >
                    My Bookings
                  </Link>
                </MenuItem>

                <hr className="my-1" />

                <MenuItem>
                  <Form action="/logout" method="post" className="w-full">
                    <button
                      type="submit"
                      className="w-full text-left px-4 py-2 text-orange-400 ui-active:bg-gray-100"
                    >
                      Logout
                    </button>
                  </Form>
                </MenuItem>
              </MenuItems>
            </Transition>
          </Menu>
        )}
      </div>
    </div>
  )
}

export default MainNavigation
