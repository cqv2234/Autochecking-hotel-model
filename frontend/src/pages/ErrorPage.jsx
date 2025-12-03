import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom'

export default function ErrorPage() {
  const error = useRouteError()

  let title = 'An error occurred!'
  let message = 'Something went wrong. Please try again later.'
  let status = 500

  // Kiểm tra xem lỗi có phải là một Route Response Error không
  if (isRouteErrorResponse(error)) {
    status = error.status
    message = error.data || error.statusText // error.data là nội dung của Response

    if (status === 404) {
      title = 'Not Found!'
    } else if (status === 400) {
      title = 'Bad Request!'
    } else {
      title = 'Server Error!'
    }
  }

  return (
    <>
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white">
          <div className="flex flex-col items-center">
            <h1 className="font-bold text-3xl text-orange-400 lg:text-6xl">
              {title}
            </h1>

            <h6 className="mb-2 text-2xl font-bold text-center text-gray-800 md:text-3xl">
              <span className="text-red-500">Oops! Page {status}</span>
            </h6>

            <p className="mb-4 text-center text-gray-500 md:text-lg">
              {message}
            </p>

            <Link
              to=".."
              className="px-5 py-2 rounded-md text-white bg-orange-400 hover:bg-orange-400"
            >
              Go home
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
