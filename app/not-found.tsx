'use server';

import Link from 'next/link';

export default async function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-semibold">404 - Page Not Found</h2>
        <p className="mb-4">The page you're looking for doesn't exist.</p>
        <Link
          href="/"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Go back home
        </Link>
      </div>
    </main>
  );
}
