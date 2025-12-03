import { Outlet, useLoaderData, useSubmit } from 'react-router-dom'
import { useEffect } from 'react'

// (File này dựa trên 'Root.jsx' [cite: Root.jsx])

// 1. Import thanh điều hướng MỚI
import ManagementMainNavigation from '../components/ManagementMainNavigation.jsx'
// 2. Import hàm auth MỚI
import { getManagementTokenDuration } from '../util/ManagementAuth.js'

function ManagementRootLayout() {
  // 3. 'token' này là của Admin, được cung cấp bởi 'adminTokenLoader'
  //    (mà bạn sẽ định nghĩa trong App.js với id: 'management-root')
  const token = useLoaderData()
  const submit = useSubmit()

  // 4. useEffect này giữ nguyên logic [cite: Root.jsx],
  //    nhưng dùng hàm 'getAdminTokenDuration' và action '/management/logout'
  useEffect(() => {
    if (!token) {
      return
    }

    if (token === 'EXPIRED') {
      submit(null, { action: '/management/logout', method: 'post' })
      return
    }

    const tokenDuration = getManagementTokenDuration() // <-- Dùng hàm của Admin
    console.log(tokenDuration)

    // (Kiểm tra an toàn nếu tokenDuration không hợp lệ)
    if (isNaN(tokenDuration) || tokenDuration < 0) {
      submit(null, { action: '/management/logout', method: 'post' })
      return
    }

    const timer = setTimeout(() => {
      submit(null, { action: '/management/logout', method: 'post' }) // <-- Action của Admin
    }, tokenDuration)

    return () => clearTimeout(timer) // Cleanup
  }, [token, submit])

  return (
    <>
      <ManagementMainNavigation /> {/* <-- 5. Render thanh điều hướng MỚI */}
      <Outlet />
    </>
  )
}

export default ManagementRootLayout
