"use client"; // Garantir que estamos no lado do cliente

import React, { useState, useEffect } from 'react';
import sdk from '@crossmarkio/sdk';

const LoginButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [nfts, setNfts] = useState<any[]>([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Verificar sessão ao carregar a página
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/session');
        if (res.ok) {
          const session = await res.json();
          if (session.isLoggedIn && session.address) {
            setWalletAddress(session.address);
            setMessage(`Conectado como: ${session.address}`);
            // Buscar NFTs pendentes
            fetchNFTs(session.address);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      }
    };

    checkSession();
  }, []);

  const fetchNFTs = async (address: string) => {
    try {
      const res = await fetch(`/api/mintNFT/${address}`);
      const nftData = await res.json();

      if (nftData.nfts?.length > 0) {
        setNfts(nftData.nfts);
      } else {
        setMessage("Nenhum NFT esperando para ser aceito.");
      }
    } catch (error) {
      console.error("Erro ao buscar NFTs:", error);
    }
  };

  // Função de login
  const handleLogin = async () => {
    setLoading(true);
    try {
      const { response } = await sdk.methods.signInAndWait();

      if (response.data && response.data.address) {
        const address = response.data.address;
        setWalletAddress(address);
        setMessage(`Conectado com sucesso: ${address}`);

        // Salvar sessão no servidor
        await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify({ address }),
          headers: { 'Content-Type': 'application/json' },
        });

        // Buscar NFTs pendentes
        fetchNFTs(address);
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

  // Função de logout
  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/logout', { method: 'POST' });
      setWalletAddress(null);
      setNfts([]);
      setMessage("Desconectado com sucesso.");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      setMessage("Erro ao fazer logout.");
    } finally {
      setLoading(false);
    }
  };

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
        setNfts(nfts.filter(nft => nft.nftID !== nftID));
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
      {!walletAddress ? (
        <button
          onClick={handleLogin}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
          disabled={loading}
        >
          {loading ? 'Conectando...' : 'Login'}
        </button>
      ) : (
        <div>
          <p>Bem-vindo, {walletAddress}</p>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
            disabled={loading}
          >
            Logout
          </button>
        </div>
      )}

      {message && <p>{message}</p>}

      {nfts.length > 0 && (
        <div>
          <h3>NFTs pendentes para aceitação:</h3>
          {nfts.map((nft) => (
            <div key={nft.nftID} className="mb-4">
              <p>NFT ID: {nft.nftID}</p>
              <button
                onClick={async () => {
                  const nftOfferIndex = nft.offers[0]?.nft_offer_index;
                  if (nftOfferIndex) {
                    acceptNFT(nftOfferIndex, nft.nftID);
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
    </div>
  );
};

export default LoginButton;
