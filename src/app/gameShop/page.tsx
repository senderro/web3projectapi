'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const SearchPage: React.FC = () => {
  const [address, setAddress] = useState<string>('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      router.push(`/gameShop/${address}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-600 to-indigo-800 p-6">
      <h1 className="text-4xl font-bold text-white mb-8">Search Game Shop</h1>
      <form onSubmit={handleSearch} className="flex flex-col items-center space-y-4">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter game address"
          className="px-4 py-2 border border-gray-300 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchPage;
