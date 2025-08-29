import Link from 'next/link';
import { auth } from '@/auth';
import { logout } from '@/lib/actions/user';

// Logout Button Component
function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="px-6 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
      >
        Sign Out
      </button>
    </form>
  );
}

export default async function Home() {
  // Get session information in server component
  const session = await auth();
  const user = session?.user;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Member Management System
        </h1>
        {user ? (
          <p className="text-lg text-gray-600 mb-8">
            Welcome back, <span className="font-semibold">{user.name}</span>!
          </p>
        ) : (
          <p className="text-lg text-gray-600 mb-8">
            Please sign in to access all features.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {user ? (
          // Logged in state UI
          <>
            <Link
              href="/members"
              className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
            >
              Member List
            </Link>
            <Link
              href="/profile"
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Profile
            </Link>
            <LogoutButton />
          </>
        ) : (
          // Logged out state UI
          <>
            <Link
              href="/login"
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
