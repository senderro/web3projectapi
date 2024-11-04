"use client"; // Garantir que estamos no lado do cliente

import React, { useEffect, useState } from "react";
import NFTCardAcceptOffer from "@/components/NFTCardAcceptOffer";
import sdk from '@crossmarkio/sdk'; // Importando o SDK do Crossmark
import { NFT } from "@/interfaces";


const UserNFTs: React.FC = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Função para buscar NFTs do usuário com ofertas ativas via API mintNFT/[address]
  const fetchNFTs = async () => {
    setLoading(true);
    try {
      // Pega a sessão atual para obter o endereço da carteira
      const res = await fetch("/api/session");
      if (res.ok) {
        const session = await res.json();
        const address = session.address;

        if (!address) {
          setErrorMessage("Usuário não conectado.");
          setLoading(false);
          return;
        }

        // Buscando os NFTs com ofertas pendentes usando o endereço do usuário
        const nftRes = await fetch(`/api/mintNFT/${address}`);
        const nftData = await nftRes.json();

        if (nftRes.ok && nftData.nfts) {
          setNfts(nftData.nfts); // Guardando os NFTs com ofertas pendentes no estado
        } else {
          setErrorMessage(nftData.message || "Erro ao buscar NFTs.");
        }
      } else {
        setErrorMessage("Erro ao verificar sessão.");
      }
    } catch (error) {
      console.error("Erro ao buscar NFTs:", error);
      setErrorMessage("Erro ao buscar NFTs.");
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar se o usuário adquiriu o NFT após aceitar
  const refreshNftsPage = async () => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    setErrorMessage("Recarregando NFTs");
    fetchNFTs();
  };

  // Função para aceitar um NFT com Crossmark e verificar a propriedade
  const acceptNFTWithCrossmark = async (nftID: string, offerIndex: string) => {
    try {
      setLoading(true);
      setErrorMessage("");

      // Usando o SDK do Crossmark para assinar a transação
      const { response } = await sdk.async.signAndSubmitAndWait({
        TransactionType: "NFTokenAcceptOffer",
        NFTokenSellOffer: offerIndex,
      });

      if (response.data.meta.isSuccess) {
        setErrorMessage("NFT transferido com sucesso!");

        const res = await fetch('/api/updateNFTStatus', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nftID }),
        });

        if (!res.ok) {
          setErrorMessage("Erro ao atualizar status do NFT no backend.");
        } else {
          fetchNFTs();
        }
      } else {
        setErrorMessage("Erro ao aceitar o NFT usando o Crossmark.");
      }
    } catch (error) {
      console.error("Erro ao aceitar o NFT:", error);
      setErrorMessage("Erro ao aceitar o NFT.");
    } finally {
      await refreshNftsPage();
      setLoading(false);
      setErrorMessage("");
    }
  };

  useEffect(() => {
    fetchNFTs(); // Buscando NFTs ao carregar o componente
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-6">NFTs Pendentes</h1>

      {loading ? (
        <p>Carregando NFTs...</p>
      ) : errorMessage ? (
        <p className="text-red-500">{errorMessage}</p>
      ) : nfts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nfts.map((nft) => (
            <NFTCardAcceptOffer
              key={nft.nftID}
              nftID={nft.nftID}
              uri={nft.uri}
              onAccept={() => {
                const offerIndex = nft.offers[0]?.nft_offer_index;
                if (offerIndex) {
                  acceptNFTWithCrossmark(nft.nftID, offerIndex); // Usando Crossmark para aceitar a oferta
                } else {
                  setErrorMessage("Nenhuma oferta disponível para aceitar.");
                }
              }}
            />
          ))}
        </div>
      ) : (
        <p>Nenhum NFT pendente encontrado.</p>
      )}
    </div>
  );
};

export default UserNFTs;
