// components/Navbar.tsx
"use client";

import React, { useState } from 'react';
import LoginButton from './loginButton';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLoginSuccess = (address: string) => {
    setWalletAddress(address);
  };

  const handleLogout = () => {
    setWalletAddress(null);
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-indigo-800 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-white mr-8">NFT Marketplace</div>

        {/* Botão de menu para dispositivos móveis */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <span className="text-3xl">✕</span>
          ) : (
            <span className="text-3xl">☰</span>
          )}
        </button>

        {/* Menu de navegação */}
        <div
          className={`${
            menuOpen ? 'block' : 'hidden'
          } md:flex md:space-x-6 md:items-center mt-4 md:mt-0 space-y-2 md:space-y-0`}
        >
          <Link href="/" className="block py-2 md:py-0 text-white hover:text-indigo-200 transition">
            Home
          </Link>
          <Link href="/usernfts" className="block py-2 md:py-0 text-white hover:text-indigo-200 transition">
            User NFTs
          </Link>
          <Link href="/gameShop" className="block py-2 md:py-0 text-white hover:text-indigo-200 transition">
            Games Shop
          </Link>
          <Link href="/userpendingnftshub" className="block py-2 md:py-0 text-white hover:text-indigo-200 transition">
            User Pending NFTs HUB
          </Link>
          <Link href="/devsPage" className="block py-2 md:py-0 text-white hover:text-indigo-200 transition">
            Devs Page
          </Link>
          <Link href="/apiDocumentation" className="block py-2 md:py-0 text-white hover:text-indigo-200 transition">
            Api Documentation
          </Link>
        </div>

        {/* Botão de login */}
        <div className="hidden md:block">
          <LoginButton onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />
        </div>
      </div>

      {/* Exibição do endereço da carteira */}
      {walletAddress && (
        <div className="text-center mt-2 text-sm text-indigo-200">
          Logged in as: <span className="font-semibold">{walletAddress}</span>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
