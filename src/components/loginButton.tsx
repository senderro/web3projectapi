"use client"; // Garantir que estamos no lado do cliente

import React, { useState } from 'react';
import sdk from '@crossmarkio/sdk';

const LoginButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [nfts, setNfts] = useState<any[]>([]); // Guardar NFTs pendentes
  const [walletAddress, setWalletAddress] = useState<string>(''); // Armazenar o endereço da carteira

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Usando a Crossmark SDK para fazer login
      const { response } = await sdk.methods.signInAndWait();

      if (response.data && response.data.address) {
        const address = response.data.address;
        setWalletAddress(address);
        setMessage(`Conectado com sucesso: ${address}`);
        console.log('Endereço da carteira:', address);

        // Buscar NFTs pendentes e ofertas de venda no backend
        const res = await fetch(`/api/mintNFT/${address}`);
        const nftData = await res.json();

        if (nftData.nfts && nftData.nfts.length > 0) {
          setNfts(nftData.nfts); // Atualiza a lista de NFTs pendentes com as ofertas
        } else {
          setMessage("Nenhum NFT esperando para ser aceito.");
        }
      } else {
        setMessage('Erro ao conectar');
      }
    } catch (error) {
      console.error('Erro ao conectar com Crossmark:', error);
      setMessage('Erro ao conectar');
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar ofertas de venda de um NFT
  const fetchNftSellOffers = async (nftID: string) => {
    try {
      const res = await fetch(`/api/nftOffers/${nftID}`);
      const offersData = await res.json();
      return offersData.offers;
    } catch (error) {
      console.error("Erro ao buscar ofertas de venda:", error);
      return [];
    }
  };

  const acceptNFT = async (nftOfferIndex: string) => {
    try {
      setLoading(true);
      setMessage('Aceitando NFT...');

      // Usar o método correto para assinar e enviar a transação
      const { request, response, createdAt, resolvedAt } = await sdk.async.signAndSubmitAndWait({
        TransactionType: "NFTokenAcceptOffer",
        NFTokenSellOffer: nftOfferIndex, // Usar o nftOfferIndex aqui
      });

      if (response) {
        setMessage('NFT aceito com sucesso!');
        // Atualizar o status do NFT aceito (remover da lista de NFTs pendentes)
        setNfts(nfts.filter(nft => nft.nftID !== nftOfferIndex));
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
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <button
        onClick={handleLogin}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
        disabled={loading}
      >
        {loading ? 'Conectando...' : 'Login'}
      </button>
      {message && <p>{message}</p>}

      {/* Listando NFTs pendentes */}
      {nfts.length > 0 && (
        <div>
          <h3>NFTs pendentes para aceitação:</h3>
          {nfts.map((nft) => (
            <div key={nft.nftID} className="mb-4">
              <p>NFT ID: {nft.nftID}</p>

              {/* Buscar ofertas de venda para o NFT */}
              <button
                onClick={async () => {
                  const offers = await fetchNftSellOffers(nft.nftID);
                  if (offers.length > 0) {
                    const nftOfferIndex = offers[0].nft_offer_index;
                    acceptNFT(nftOfferIndex);
                  } else {
                    setMessage("Nenhuma oferta de venda disponível para este NFT.");
                  }
                }}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
              >
                Buscar e Aceitar Ofertas
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoginButton;
