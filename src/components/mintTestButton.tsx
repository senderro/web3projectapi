"use client"; // Para garantir que estamos no lado do cliente

import React, { useState } from 'react';

const MintNFTButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');

  const handleMintNFT = async () => {
    if (!recipientAddress) {
      setMessage('Por favor, insira um endereço de destino.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/mintNFT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientAddress,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`NFT Mintado com sucesso! ID: ${data.nftId}`);
      } else {
        setMessage(`Erro ao mintar NFT: ${data.message}`);
      }
    } catch (error) {
      console.error('Erro ao mintar NFT:', error);
      setMessage('Erro ao mintar NFT.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <input
        type="text"
        placeholder="Endereço de destino"
        value={recipientAddress}
        onChange={(e) => setRecipientAddress(e.target.value)}
        className="border rounded p-2 mb-4 w-full"
      />
      <button
        onClick={handleMintNFT}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 w-full mb-4"
        disabled={loading}
      >
        {loading ? 'Mintando...' : 'Mintar NFT'}
      </button>
      {message && <p>{message}</p>} {/* Exibe a mensagem de resposta */}
    </div>
  );
};

export default MintNFTButton;
