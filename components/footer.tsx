import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t py-6 md:py-8">
      <div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M17 3h4v4" />
              <path d="M14 7 21 0" />
              <path d="M3 21h4v-4" />
              <path d="M0 3h4v4" />
              <path d="M14 17l7 7" />
              <path d="M3 3l18 18" />
            </svg>
            <span className="font-bold">ShuttleSync</span>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} ShuttleSync. Đã đăng ký bản quyền.
          </p>
        </div>
        <div className="flex gap-6">
          <Link href="/terms" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
            Điều Khoản
          </Link>
          <Link href="/privacy" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
            Bảo Mật
          </Link>
          <Link href="/contact" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
            Liên Hệ
          </Link>
        </div>
      </div>
    </footer>
  )
}
