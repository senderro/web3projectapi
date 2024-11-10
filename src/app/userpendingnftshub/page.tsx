// app/usernftsHub/page.tsx
"use client";

import Link from "next/link";

const UserNFTsHub: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 to-indigo-800 p-6">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">Your Pending NFTs</h1>

      <div className="flex justify-center mb-8 space-x-4">
        <Link
          href="/usernftsPending"
          className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
        >
          Pending NFTs From Games
        </Link>
        <Link
          href="/usernftsPendingBuy"
          className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
        >
          Pending Bought NFTs
        </Link>
        <Link
          href="/usersnftsPendingTransfer"
          className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition"
        >
          Pending Transfer NFTs
        </Link>
      </div>

      <div className="text-center text-white">
        <p>Select one of the categories above to view your pending NFTs.</p>
      </div>
    </div>
  );
};

export default UserNFTsHub;
