"use client";

import React, { useEffect, useState } from 'react';
import NFTCard from '@/components/NFTCard';
import { AccountNFToken } from 'xrpl';



const UserNFTs = () => {
  const [nfts, setNfts] = useState<AccountNFToken[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        // Busca a sessão do usuário logado
        const sessionRes = await fetch('/api/session');
        if (!sessionRes.ok) {
          setMessage('Você precisa estar logado para ver seus NFTs.');
          setLoading(false);
          return;
        }

        const session = await sessionRes.json();
        if (session.isLoggedIn && session.address) {
          // Faz a requisição para buscar os NFTs do usuário logado
          const nftsRes = await fetch(`/api/getAccountNFTs/${session.address}`);
          
          if (!nftsRes.ok) {
            setMessage('Erro ao buscar NFTs.');
            setLoading(false);
            return;
          }
          
          const nftsData = await nftsRes.json();
          
          if (nftsData.nfts.length === 0) {
            setMessage('Nenhum NFT encontrado para este endereço.');
          } else {
            setNfts(nftsData.nfts);
          }
        } else {
          setMessage('Endereço da sessão não encontrado.');
        }
      } catch (error) {
        console.error('Erro ao buscar NFTs:', error);
        setMessage('Erro ao buscar NFTs.');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Seus NFTs</h1>
      {message && <p>{message}</p>}
      <div className="flex flex-wrap justify-center">
        {nfts.map((nft) => (
          <NFTCard
            key={nft.NFTokenID}
            nftID={nft.NFTokenID}
            issuer={nft.Issuer}
            uri={nft.URI}
          />
        ))}
      </div>
    </div>
  );
};

export default UserNFTs;
