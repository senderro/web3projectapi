'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import sdk from '@crossmarkio/sdk';

// Interface para o DevUser com o campo profileImage
interface DevUser {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  password: string;
  publicAddress: string;
  activated: boolean | null;
  webhookLink: string | null;
  web3Coin: number;
  profileImage: string | null;
}

// Interface para os NFTs
interface NFT {
  id: number;
  uri: string;
  quantidade: number;
  preco: number;
}

// Interface para os dados do IPFS
interface NFTDataFromIPFS {
  name: string;
  description: string;
  base64image: string;
  gameMetadata: Record<string, string>;
}

// Tipo combinado que une os dados do banco com os dados do IPFS
interface CompleteNFT extends NFT, NFTDataFromIPFS {}

export default function GamePage() {
  const { gameAddress } = useParams();
  const [nfts, setNfts] = useState<CompleteNFT[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<CompleteNFT | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const response = await fetch(`/api/getNftsGameShop/${gameAddress}`);
        const nftsFromDb: NFT[] = await response.json();

        const nftDetailsPromises = nftsFromDb.map(async (nft) => {
          const url = `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${nft.uri}`;
          const ipfsResponse = await fetch(url);
          if (ipfsResponse.ok) {
            const nftData: NFTDataFromIPFS = await ipfsResponse.json();
            return { ...nft, ...nftData };
          }
          return null;
        });

        const nftsWithDetails = await Promise.all(nftDetailsPromises);
        const validNfts = nftsWithDetails.filter((nft) => nft !== null) as CompleteNFT[];
        setNfts(validNfts);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [gameAddress]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`/api/devUser/${gameAddress}`);
        if (response.ok) {
          const { user }: { user: DevUser } = await response.json();
          setProfileImage(user.profileImage);
        } else {
          setProfileImage(null);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [gameAddress]);

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const sessionRes = await fetch("/api/session");
        if (!sessionRes.ok) {
          setMessage("You need to be logged in to perform this action.");
          setLoading(false);
          return;
        }

        const session = await sessionRes.json();
        const address = session.address;

        if (address) {
          setUserAddress(address);
        } else {
          setMessage("Invalid session. User address not found.");
        }
      } catch (error) {
        console.error("Error fetching user session:", error);
        setMessage("Error fetching user session.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserSession();
  }, []);

  const handleViewDetails = (nft: CompleteNFT) => {
    setSelectedNFT(nft);
  };

  const handleCloseDetails = () => {
    setSelectedNFT(null);
  };

  const handleBuyNFT = async (nft: CompleteNFT) => {
    if (!userAddress) {
      setMessage("Error: Public address not found.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Processing purchase...");
      const amount = nft.preco.toString();
      const { response } = await sdk.async.signAndSubmitAndWait({
        TransactionType: "Payment",
        Account: userAddress,
        Amount: amount,
        Destination: gameAddress as string,
      });

      if (response.data.meta.isSuccess === true) {
        setMessage("Purchase successful!");
        await mintNFTForUser(nft.uri, userAddress, gameAddress as string);
      } else {
        setMessage("Failed to process purchase.");
      }
    } catch (error) {
      console.error("Error processing purchase:", error);
      setMessage("Error processing purchase.");
    } finally {
      setLoading(false);
    }
  };

  const mintNFTForUser = async (uri: string, userAddress: string, gameAddress: string) => {
    try {
      const mintResponse = await fetch("/api/mintNftForUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uri: uri,
          recipientAddress: userAddress,
          gameAddress: gameAddress,
        }),
      });

      if (mintResponse.ok) {
        const result = await mintResponse.json();
        setMessage(`NFT successfully minted! NFT ID: ${result.nftId}`);
      } else {
        const errorData = await mintResponse.json();
        setMessage(`Error minting NFT: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error minting NFT:", error);
      setMessage("Error minting NFT.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-600 to-indigo-800 p-6">
      <div className="w-full max-w-2xl mb-8">
        {profileImage ? (
          <img src={profileImage} alt="Game Profile" className="w-48 h-48 object-cover rounded-full mx-auto" />
        ) : (
          <div className="bg-red-500 w-48 h-48 flex items-center justify-center rounded-full mx-auto">
            <h1 className="text-white text-2xl">{gameAddress}</h1>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-white text-lg">Loading NFTs...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          {nfts.map((nft) => (
            <div key={nft.id} className="border border-indigo-500 p-4 rounded-lg bg-white shadow-lg">
              <h2 className="text-lg font-semibold mb-2">Quantity: {nft.quantidade}</h2>
              <img src={nft.base64image} alt={nft.name} className="w-full h-32 object-cover mb-2 rounded" />
              <button
                onClick={() => handleViewDetails(nft)}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition duration-300"
              >
                VIEW NFT
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">{selectedNFT.name}</h2>
            <p className="mb-2"><strong>Description:</strong> {selectedNFT.description}</p>
            <p className="mb-2"><strong>Price:</strong> {selectedNFT.preco} milli xrpl</p>
            <div className="flex justify-between">
              <button
                onClick={handleCloseDetails}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-300"
              >
                Close
              </button>
              <button
                onClick={() => handleBuyNFT(selectedNFT)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
              >
                Buy
              </button>
            </div>
          </div>
        </div>
      )}

      {message && <p className="text-center text-red-500 mt-4">{message}</p>}
    </div>
  );
}
