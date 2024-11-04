"use client";

import React, { useEffect, useState } from 'react';
import NFTCard from '@/components/NFTCard';
import { AccountNFToken } from 'xrpl';

interface NFTData {
  name: string;
  description: string;
  base64image: string;
  gameAddress: string;
}

interface GameBlock {
  gameAddress: string;
  profileImage: string;
  nfts: NFTData[];
}

const UserNFTs = () => {
  const [nfts, setNfts] = useState<AccountNFToken[]>([]);
  const [nftDetails, setNftDetails] = useState<GameBlock[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState<string | null>(null); // Estado para controlar qual jogo está ativo
  console.log(nfts);
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

            // Para cada NFT, buscamos os dados da URI e agrupamos por gameAddress
            const nftDetailsPromises = nftsData.nfts.map(async (nft: AccountNFToken) => {
              const uriData = await fetchNftData(nft.URI as string);
              const gameAddress = uriData.gameAddress || 'Unknown Issuer';

              // Verifica se já temos um bloco para o gameAddress
              const existingBlock = nftDetails.find(block => block.gameAddress === gameAddress);

              // Se já existe um bloco, apenas adicionamos o NFT nele
              if (existingBlock) {
                existingBlock.nfts.push({
                  name: uriData.name || 'Unknown Name',
                  description: uriData.description || 'No description available',
                  base64image: uriData.base64image || '',
                  gameAddress: gameAddress,
                });
                return existingBlock;
              }

              // Se não existe o bloco, buscamos a imagem do profile
              const profileImage = await fetchProfileImage(gameAddress);

              // Cria um novo bloco para o gameAddress
              return {
                gameAddress,
                profileImage,
                nfts: [
                  {
                    name: uriData.name || 'Unknown Name',
                    description: uriData.description || 'No description available',
                    base64image: uriData.base64image || '',
                    gameAddress: gameAddress,
                  }
                ]
              };
            });

            // Aguardar todas as promessas serem resolvidas
            const resolvedNftDetails = await Promise.all(nftDetailsPromises);
            setNftDetails(groupBlocks(resolvedNftDetails)); // Agrupa os blocos de NFTs por gameAddress
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

    // Função para buscar os dados da URI de cada NFT
    const fetchNftData = async (uri: string) => {
      try {
        const convertHexToString = (hex: string) => {
          try {
            return Buffer.from(hex, 'hex').toString('utf8');
          } catch {
            return hex;
          }
        };

        const url = `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${convertHexToString(uri)}`;
        const response = await fetch(url);
        if (response.ok) {
          return await response.json(); // Retorna os dados do JSON na URI
        }
      } catch (error) {
        console.error('Erro ao buscar os dados da URI:', error);
      }

      return {}; // Retorna um objeto vazio se houver erro
    };

    // Função para buscar a imagem do perfil (profileImage) do gameAddress
    const fetchProfileImage = async (gameAddress: string) => {
      try {
        const res = await fetch(`/api/devUser/${gameAddress}`);
        if (res.ok) {
          const data = await res.json();
          return data.user?.profileImage || ''; // Retorna a imagem base64
        }
      } catch (error) {
        console.error('Erro ao buscar a imagem de perfil:', error);
      }
      return ''; // Retorna string vazia se não houver imagem
    };

    // Função para agrupar os NFTs por blocos
    const groupBlocks = (nftDetailsArray: GameBlock[]) => {
      const grouped = nftDetailsArray.reduce((acc: { [key: string]: GameBlock }, currentBlock) => {
        const existingBlock = acc[currentBlock.gameAddress];

        // Se já existe um bloco para este gameAddress, apenas adicionamos os NFTs
        if (existingBlock) {
          existingBlock.nfts.push(...currentBlock.nfts);
        } else {
          // Se não existe, criamos um novo bloco
          acc[currentBlock.gameAddress] = currentBlock;
        }
        return acc;
      }, {});

      return Object.values(grouped); // Retorna os blocos agrupados
    };

    fetchNFTs();
  }, []);

  const handleGameClick = (gameAddress: string) => {
    setActiveGame(gameAddress); // Ativa o jogo quando o bloco é clicado
  };

  const handleBackClick = () => {
    setActiveGame(null); // Volta para a visão dos blocos
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Seus NFTs</h1>
      {message && <p>{message}</p>}

      {activeGame ? (
        <div>
          {/* Exibir NFTs do jogo ativo */}
          <button
            className="bg-black text-white p-2 rounded-lg mb-4"
            onClick={handleBackClick}
          >
            Voltar para os Jogos
          </button>
          <div className="flex flex-wrap justify-center">
            {nftDetails
              .find(block => block.gameAddress === activeGame)
              ?.nfts.map((nft, index) => (
                <NFTCard
                  key={index}
                  name={nft.name}
                  description={nft.description}
                  base64image={nft.base64image}
                  gameAddress={nft.gameAddress}
                />
              ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {/* Exibe os blocos de jogos com as imagens de fundo */}
          {nftDetails.map((block, index) => (
            <div
              key={index}
              className="game-block cursor-pointer w-40 h-40 rounded-lg shadow-md bg-cover bg-center"
              style={{
                backgroundImage: `url(${block.profileImage || 'default-image.jpg'})`,
              }}
              onClick={() => handleGameClick(block.gameAddress)}
            >
              <div className="game-title p-2 bg-black bg-opacity-70 text-white text-center rounded-b-lg text-ellipsis overflow-hidden">
                {block.gameAddress}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserNFTs;
