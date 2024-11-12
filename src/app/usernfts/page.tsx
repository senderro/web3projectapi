'use client';

import React, { useEffect, useState } from 'react';
import NFTCard from '@/components/NFTCard';
import { AccountNFToken } from 'xrpl';
import sdk from '@crossmarkio/sdk';
import { xrpToDrops } from 'xrpl';

interface NFTData {
  name: string;
  description: string;
  base64image: string;
  gameAddress: string;
  nftId: string;
  uri: string;
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
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<NFTData | null>(null);
  const [sessionAddress, setSessionAddress] = useState<string>('');

  const [soldAddress, setSoldAddress] = useState<string>(''); 
  const [soldPrice, setSoldPrice] = useState<string>(''); 
  console.log(nfts);
  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const sessionRes = await fetch('/api/session');
        if (!sessionRes.ok) {
          setMessage('You need to be logged in to view your NFTs.');
          setLoading(false);
          return;
        }

        const session = await sessionRes.json();
        if (session.isLoggedIn && session.address) {
          setSessionAddress(session.address);
          const nftsRes = await fetch(`/api/getAccountNFTs/${session.address}`);

          if (!nftsRes.ok) {
            setMessage('Error fetching NFTs.');
            setLoading(false);
            return;
          }

          const nftsData = await nftsRes.json();
          if (nftsData.nfts.length === 0) {
            setMessage('No NFTs found for this address.');
          } else {
            setNfts(nftsData.nfts);

            const nftDetailsPromises = nftsData.nfts.map(async (nft: AccountNFToken) => {
              const uriData = await fetchNftData(nft.URI as string);
              const gameAddress = uriData.gameAddress || 'Unknown Issuer';

              const existingBlock = nftDetails.find(block => block.gameAddress === gameAddress);
              if (existingBlock) {
                existingBlock.nfts.push({
                  name: uriData.name || 'Unknown Name',
                  description: uriData.description || 'No description available',
                  base64image: uriData.base64image || '',
                  gameAddress: gameAddress,
                  nftId: nft.NFTokenID,
                  uri: nft.URI as string
                });
                return existingBlock;
              }

              const profileImage = await fetchProfileImage(gameAddress);

              return {
                gameAddress,
                profileImage,
                nfts: [
                  {
                    name: uriData.name || 'Unknown Name',
                    description: uriData.description || 'No description available',
                    base64image: uriData.base64image || '',
                    gameAddress: gameAddress,
                    nftId: nft.NFTokenID,
                    uri: nft.URI as string
                  }
                ]
              };
            });

            const resolvedNftDetails = await Promise.all(nftDetailsPromises);
            setNftDetails(groupBlocks(resolvedNftDetails));
          }
        } else {
          setMessage('Session address not found.');
        }
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setMessage('Error fetching NFTs.');
      } finally {
        setLoading(false);
      }
    };

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
          return await response.json();
        }
      } catch (error) {
        console.error('Error fetching URI data:', error);
      }
      return {};
    };

    const fetchProfileImage = async (gameAddress: string) => {
      try {
        const res = await fetch(`/api/devUser/${gameAddress}`);
        if (res.ok) {
          const data = await res.json();
          return data.user?.profileImage || '';
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
      return '';
    };

    const groupBlocks = (nftDetailsArray: GameBlock[]) => {
      const grouped = nftDetailsArray.reduce((acc: { [key: string]: GameBlock }, currentBlock) => {
        const existingBlock = acc[currentBlock.gameAddress];
        if (existingBlock) {
          existingBlock.nfts.push(...currentBlock.nfts);
        } else {
          acc[currentBlock.gameAddress] = currentBlock;
        }
        return acc;
      }, {});

      return Object.values(grouped);
    };

    fetchNFTs();
  }, []);

  const handleGameClick = (gameAddress: string) => {
    setActiveGame(gameAddress);
  };

  const handleBackClick = () => {
    setActiveGame(null);
    setSelectedNFT(null);
  };

  const handleOpenSellModal = (nft: NFTData) => {
    setSelectedNFT(nft);
  };

  const createNFTSellOfferWithCrossmark = async (nftID: string, destination: string, price: string, uri: string) => {
    try {
      setLoading(true);
      if (!sessionAddress) {
        setMessage('Session address not found. Please log in again.');
        setLoading(false);
        return;
      }

      if (!nftID || !destination || !price) {
        setLoading(false);
        return;
      }

      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        setMessage('Please enter a valid price.');
        setLoading(false);
        return;
      }

      const { response } = await sdk.async.signAndSubmitAndWait({
        TransactionType: "NFTokenCreateOffer",
        Account: sessionAddress,
        NFTokenID: nftID,
        Amount: xrpToDrops(numericPrice),
        Destination: destination,
        Flags: 1,
      });

      if (response.data.meta.isSuccess) {
        alert("Sell offer created successfully!");

        const apiResponse = await fetch('/api/userTransferNft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nftID,
            receiveAddress: destination,
            uri
          }),
        });

        if (!apiResponse.ok) {
          console.error('Error saving transfer to database:', await apiResponse.text());
          setMessage('Error registering the transfer.');
        } else {
          const responseData = await apiResponse.json();
          console.log('Transfer successfully registered:', responseData);
        }
      }
    } catch (error) {
      console.error("Error creating sell offer:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-600 to-indigo-800">
        <h1 className="text-2xl text-white animate-pulse">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-r from-purple-600 to-indigo-800">
      <h1 className="text-3xl font-bold text-white mb-6">Your NFTs</h1>
      {message && <p className="text-red-400 text-lg mb-4">{message}</p>}

      {activeGame ? (
        <div>
          <button
            className="bg-gray-700 text-white p-2 rounded-lg mb-4 hover:bg-gray-600 transition"
            onClick={handleBackClick}
          >
            Back to Games
          </button>
          <div className="flex flex-wrap justify-center">
            {nftDetails
              .find(block => block.gameAddress === activeGame)
              ?.nfts.map((nft, index) => (
                <div key={index} className="relative mb-4">
                  <button
                    className="absolute top-0 left-0 bg-red-500 text-white px-2 py-1 rounded z-30"
                    onClick={() => handleOpenSellModal(nft)}
                  >
                    Sell
                  </button>
                  <NFTCard
                    name={nft.name}
                    description={nft.description}
                    base64image={nft.base64image}
                    gameAddress={nft.gameAddress}
                  />
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nftDetails.map((block, index) => (
            <div
              key={index}
              className="cursor-pointer w-48 h-48 rounded-lg shadow-md bg-cover bg-center transform hover:scale-105 transition"
              style={{
                backgroundImage: `url(${block.profileImage || '/defaultimage.jpg'})`,
              }}
              onClick={() => handleGameClick(block.gameAddress)}
            >
              <div className="p-2 bg-black bg-opacity-70 text-white text-center rounded-b-lg">
                {block.gameAddress}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Sell NFT: {selectedNFT.name}</h2>
            <p className="mb-2"><strong>Description:</strong> {selectedNFT.description}</p>

            <div className="my-4">
              <h3 className="font-semibold text-lg">Sell to Other Address</h3>
              <input
                type="text"
                placeholder="Buyer Address"
                value={soldAddress}
                onChange={(e) => setSoldAddress(e.target.value)}
                className="border border-gray-300 rounded-lg w-full py-2 px-3 mb-2"
              />
              <input
                type="number"
                placeholder="Price"
                value={soldPrice}
                onChange={(e) => setSoldPrice(e.target.value)}
                className="border border-gray-300 rounded-lg w-full py-2 px-3 mb-4"
              />
              <button
                className="bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600 transition"
                onClick={() => createNFTSellOfferWithCrossmark(selectedNFT?.nftId, soldAddress, soldPrice, selectedNFT.uri)}
              >
                Sell
              </button>
            </div>

            <button
              onClick={() => setSelectedNFT(null)}
              className="mt-4 px-5 py-2 bg-gray-500 text-white rounded-lg w-full hover:bg-gray-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserNFTs;
