// components/NFTManager.tsx

"use client"; // Garantir que estamos no lado do cliente

import React, { useState, useEffect } from 'react';
import sdk from '@crossmarkio/sdk';
import { NFT } from '@/interfaces';

interface NFTManagerProps {
  walletAddress: string;
}

const NFTManager: React.FC<NFTManagerProps> = ({ walletAddress }) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Buscar NFTs pendentes
  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const res = await fetch(`/api/mintNFT/${walletAddress}`);
        const nftData = await res.json();

        if (nftData.nfts?.length > 0) {
          setNfts(nftData.nfts);
        } else {
          setMessage("Nenhum NFT esperando para ser aceito.");
        }
      } catch (error) {
        console.error("Erro ao buscar NFTs:", error);
        setMessage("Erro ao buscar NFTs.");
      }
    };

    fetchNFTs();
  }, [walletAddress]);

  const acceptNFT = async (nftOfferIndex: string, nftID: string) => {
    try {
      setLoading(true);
      setMessage('Aceitando NFT...');

      const { response } = await sdk.async.signAndSubmitAndWait({
        TransactionType: "NFTokenAcceptOffer",
        NFTokenSellOffer: nftOfferIndex,
      });

      if (response) {
        setMessage('NFT aceito com sucesso!');
        // Atualiza o status do NFT aceito no banco de dados
        await fetch(`/api/updateNFTStatus`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nftID }),
        });
        // Atualiza a lista de NFTs pendentes
        setNfts(nfts.filter(nft => nft.NFTokenID !== nftID));
      } else {
        setMessage('Erro ao aceitar NFT.');
      }
    } catch (error) {
      console.error("Erro ao aceitar NFT:", error);
      setMessage('Erro ao aceitar NFT');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
       {loading && <p>Carregando...</p>}
      {nfts.length > 0 && (
        <div>
          <h3>NFTs pendentes para aceitação:</h3>
          {nfts.map((nft) => (
            <div key={nft.NFTokenID} className="mb-4">
              <p>NFT ID: {nft.NFTokenID}</p>
              <button
                onClick={async () => {
                  const nftOfferIndex = nft.offers[0]?.nft_offer_index;
                  if (nftOfferIndex) {
                    acceptNFT(nftOfferIndex, nft.NFTokenID);
                  } else {
                    setMessage("Nenhuma oferta de venda disponível para este NFT.");
                  }
                }}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
              >
                Aceitar Oferta
              </button>
            </div>
          ))}
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default NFTManager;
