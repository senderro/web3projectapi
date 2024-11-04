"use client";
import React, { useEffect, useState } from 'react';

interface NFTCardProps {
  nftID: string;
  uri: string;
  onAccept: () => void; 
}

const NFTCardAcceptOffer: React.FC<NFTCardProps> = ({uri, onAccept }) => {
  const [nftData, setNftData] = useState<{ name?: string; description?: string; base64image?: string; gameAddress?: string }>({});
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // Se uma URI for fornecida, buscar o conteúdo JSON
    const fetchNftData = async () => {
      if (!uri) return;
      setLoading(true);
      try {
        const url = `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${(uri)}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setNftData(data);
        }
      } catch (error) {
        console.error("Erro ao buscar o JSON da URI:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNftData();
  }, [uri]);

  return (
    <div
      className="relative rounded-lg overflow-hidden shadow-lg m-4 border border-gray-200 bg-white hover:shadow-xl transition-shadow duration-300 ease-in-out"
      style={{
        width: '300px',
        height: '400px',
        backgroundImage: nftData.base64image ? `url(${nftData.base64image})` : 'none',
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
        <h3 className="text-lg font-semibold mb-1">{nftData.name || "NFT Name"}</h3>

        {loading ? (
          <p className="text-gray-200">Loading...</p>
        ) : (
          <>
            <p className="text-gray-300 text-sm mb-1">
              <strong>Issuer:</strong> {nftData.gameAddress || "Unknown"}
            </p>
            <p className="text-gray-300 text-sm mb-2 line-clamp-2">
              <strong>Description:</strong> {nftData.description || "No description available"}
            </p>
          </>
        )}

        <button
          onClick={onAccept} // Chama a função de aceitação
          className="mt-2 bg-black text-white font-semibold py-1 px-3 rounded-md hover:bg-opacity-80 transition duration-300 ease-in-out"
        >
          Accept NFT
        </button>
      </div>
    </div>
  );
};

export default NFTCardAcceptOffer;
