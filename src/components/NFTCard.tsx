"use client";

import React, { useState } from 'react';

interface NFTCardProps {
  name: string;
  description: string;
  base64image: string;
  gameAddress: string;
}

const NFTCard: React.FC<NFTCardProps> = ({ name, description, base64image, gameAddress }) => {
  const [showModal, setShowModal] = useState(false);

  const handleViewNFT = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div
      className="relative rounded-lg overflow-hidden shadow-lg m-4 border border-gray-200 bg-white hover:shadow-xl transition-shadow duration-300 ease-in-out"
      style={{
        width: '300px',
        height: '400px',
        backgroundImage: base64image ? `url(${base64image})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '20px',
        color: 'white',
      }}
    >
      <div className="relative z-10 bg-black bg-opacity-80 p-4 rounded-b-lg">
        <h3 className="text-lg font-semibold mb-1">{name}</h3>
        <p className="text-gray-300 text-sm mb-1">
          <strong>Issuer:</strong> {gameAddress}
        </p>
        <p className="text-gray-300 text-sm mb-2 line-clamp-2">
          <strong>Description:</strong> {description}
        </p>

        <button
          onClick={handleViewNFT}
          className="mt-2 bg-black text-white font-semibold py-1 px-3 rounded-md hover:bg-opacity-80 transition duration-300 ease-in-out"
        >
          View NFT
        </button>
      </div>

      {/* Modal para visualização detalhada */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden w-11/12 md:w-1/2 lg:w-1/3 p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{name}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            {base64image && (
              <img src={base64image} alt={name} className="w-full h-auto mb-4 rounded-lg" />
            )}
            <p className="text-gray-700">
              <strong>Issuer:</strong> {gameAddress}
            </p>
            <p className="text-gray-700">
              <strong>Description:</strong> {description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTCard;
