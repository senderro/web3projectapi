// components/Navbar.tsx
"use client";
import React, { useState } from 'react';
import LoginButton from './loginButton';

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
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">NFT Marketplace</h1>

        {/* Passar as funções de login e logout como props */}
        <LoginButton
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
        />
      </div>

      {walletAddress && (
        <div className="text-sm mt-2">
          Conectado como: <span className="font-bold">{walletAddress}</span>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
