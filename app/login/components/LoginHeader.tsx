import Link from "next/link";

export default function LoginHeader() {
  return (
    <header className="absolute left-0 right-0 top-0 z-50 p-6">
      <div className="flex justify-center lg:justify-start">
        <Link href="/" className="group">
          <div className="flex items-center space-x-2">
            <div className="text-center lg:text-left">
              <h1 className="bg-linear-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-2xl font-bold leading-tight text-transparent lg:text-3xl">
                <span className="block sm:inline">Just Movie</span>
                <span className="block sm:ml-2 sm:inline lg:ml-0 lg:block">
                  Tickets
                </span>
              </h1>
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}
