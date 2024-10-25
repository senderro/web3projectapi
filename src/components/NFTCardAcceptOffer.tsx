"use client"; // Certifique-se de que este componente pode ser renderizado no lado do cliente

import React from 'react';

interface NFTCardProps {
  nftID: string;
  issuer: string;
  uri: string;
  owner: string;
  onAccept: () => void; // Função para aceitar o NFT
}

const NFTCardAcceptOffer: React.FC<NFTCardProps> = ({ nftID, issuer, uri, owner, onAccept }) => {
  // Função para converter a URI hexadecimal para uma string legível
  const convertHexToString = (hex: string) => {
    try {
      const str = Buffer.from(hex, 'hex').toString('utf8');
      return str;
    } catch {
      return hex; // Caso ocorra erro na conversão
    }
  };

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg m-4 p-4 bg-white border border-gray-300">
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">NFT ID: {nftID}</div>
        <p className="text-gray-700 text-base">
          <strong>Issuer:</strong> {issuer}
        </p>
        <p className="text-gray-700 text-base">
          <strong>Owner:</strong> {owner}
        </p>
        <p className="text-gray-700 text-base">
          <strong>URI:</strong> {convertHexToString(uri)}
        </p>
      </div>
      <div className="px-6 pt-4 pb-2">
        <button
          onClick={onAccept} // Chama a função de aceitação
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Accept NFT
        </button>
      </div>
    </div>
  );
};

export default NFTCardAcceptOffer;
