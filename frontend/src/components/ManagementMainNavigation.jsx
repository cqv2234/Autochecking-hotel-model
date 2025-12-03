import { NavLink, Form, useRouteLoaderData, Link } from 'react-router-dom'
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Transition,
} from '@headlessui/react'
import { Fragment } from 'react'

import HotelLogo from '../assets/logo.svg'
import UserIcon from './icon/UserIcon.jsx' // Tái sử dụng icon

// (File này dựa trên 'MainNavigation.jsx' [cite: MainNavigation.jsx])

function ManagementMainNavigation() {
  // 1. Lấy token từ 'loader' của ManagementRoot (id: 'management-root')
  const token = useRouteLoaderData('management-root')

  return (
    <div className="h-20 flex items-center justify-between px-6 bg-white shadow-md">
      {/* 1. Logo (Trỏ về trang chủ /management) */}
      <div className="flex-shrink-0">
        <NavLink to="/management">
          <img src={HotelLogo} alt="Hotel Logo" className="h-16 w-auto" />
        </NavLink>
      </div>

      {/* 2. Các Link (Thay đổi cho phù hợp chức năng Admin) */}
      <nav>
        <ul className="flex items-center space-x-12 text-2xl font-bold text-orange-400">
          {/* Link đến trang Check-in (Trang chính của /management) */}
          {token && (
            <li>
              <NavLink
                to="/management"
                end // <-- 'end' để nó không bị active khi ở trang con
                className={({ isActive }) =>
                  `hover:text-orange-600 transition-colors duration-300 ${isActive ? 'underline underline-offset-4 decoration-orange-400' : ''}`
                }
              >
                Check-in Kiosk
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      {/* 3. Khu vực Người dùng (Chỉ hiển thị khi đã đăng nhập) */}
      <div className="flex items-center">
        {/* (Không cần nút Login, vì loader sẽ tự redirect) */}

        {token && (
          <Menu as="div" className="relative">
            <MenuButton className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <UserIcon className="size-8 text-gray-700" />
            </MenuButton>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <MenuItem>
                  <Link
                    to="/management/profile" // (Link đến Profile của Nhân viên)
                    className="block w-full text-left px-4 py-2 text-gray-700 ui-active:bg-gray-100"
                  >
                    My Profile
                  </Link>
                </MenuItem>

                <hr className="my-1" />

                {/* LOGOUT: Trỏ đến action '/management/logout' */}
                <MenuItem>
                  <Form
                    action="/management/logout"
                    method="post"
                    className="w-full"
                  >
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

export default ManagementMainNavigation
