// app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center p-6 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Welcome to the Next Generation of Web3 Gaming
        </h1>
        <p className="text-lg md:text-xl text-gray-400">
          Discover, play, and earn in an environment where innovation meets fun. Your adventure into the world of Web3 gaming starts now.
        </p>
        <Link href="/gameShop" className="mt-8 inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        Get Started
        </Link>
      </div>
    </div>
  );
}
