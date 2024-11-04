// components/Navbar.tsx
"use client";

import React, { useState } from 'react';
import LoginButton from './loginButton';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Função chamada ao fazer login com sucesso
  const handleLoginSuccess = (address: string) => {
    setWalletAddress(address);
  };

  // Função chamada ao fazer logout
  const handleLogout = () => {
    setWalletAddress(null);
  };

  return (
    <nav className="bg-gray-800 p-4 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">NFT Marketplace</h1>
          <div className="hidden md:flex space-x-4">
            <Link href="/" className="hover:text-gray-300">
              Home
            </Link>
            <Link href="/usernfts" className="hover:text-gray-300">
              User NFTs
            </Link>
            <Link href="/usernftsPending" className="hover:text-gray-300">
              User NFTs Pending
            </Link>
            <Link href="/devsPage" className="hover:text-gray-300">
              Devs Page
            </Link>
          </div>
        </div>

        <LoginButton
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
        />
      </div>

      {walletAddress && (
        <div className="text-center mt-2 text-sm text-gray-300">
          Logged in as: <span className="font-semibold">{walletAddress}</span>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
