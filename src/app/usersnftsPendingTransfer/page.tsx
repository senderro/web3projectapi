'use client';

import React, { useEffect, useState } from "react";
import NFTCardAcceptOffer from "@/components/NFTCardAcceptOffer";
import sdk from '@crossmarkio/sdk';
import { NFT } from "@/interfaces";
import { convertHexToString } from "xrpl";

const UserNFTsPendingTransfer: React.FC = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchNFTs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/session");
      if (res.ok) {
        const session = await res.json();
        const address = session.address;

        if (!address) {
          setErrorMessage("User not connected.");
          setLoading(false);
          return;
        }

        const nftRes = await fetch(`/api/getUserNftTransferOffer/${address}`);
        const nftData = await nftRes.json();

        if (nftRes.ok && nftData.nfts) {
          setNfts(nftData.nfts);
        } else {
          setErrorMessage(nftData.message || "Error fetching NFTs.");
        }
      } else {
        setErrorMessage("Error verifying session.");
      }
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      setErrorMessage("Error fetching NFTs.");
    } finally {
      setLoading(false);
    }
  };

  const acceptNFTWithCrossmark = async (id: number, offerIndex: string) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const { response } = await sdk.async.signAndSubmitAndWait({
        TransactionType: "NFTokenAcceptOffer",
        NFTokenSellOffer: offerIndex,
      });

      if (response.data.meta.isSuccess) {
        setErrorMessage("NFT successfully transferred!");

        const res = await fetch('/api/updateTransferNftStatus', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });

        if (!res.ok) {
          setErrorMessage("Error updating NFT status in the backend.");
        } else {
          fetchNFTs();
        }
      } else {
        setErrorMessage("Error accepting the NFT with Crossmark.");
      }
    } catch (error) {
      console.error("Error accepting NFT:", error);
      setErrorMessage("Error accepting NFT.");
    } finally {
      setLoading(false);
    }
  };

  const convertHexToStringSafe = (hex: string) => {
    try {
      return convertHexToString(hex);
    } catch {
      return hex;
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-r from-purple-600 to-indigo-800 p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Pending Transfer NFTs</h1>

      {loading ? (
        <p className="text-lg text-white animate-pulse">Loading NFTs...</p>
      ) : errorMessage ? (
        <p className="text-red-400 text-lg">{errorMessage}</p>
      ) : nfts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {nfts.map((nft) =>
            nft.offers.map((offer, index) => (
              <NFTCardAcceptOffer
                key={`${nft.id}-${index}`}
                nftID={nft.nftID}
                uri={convertHexToStringSafe(nft.uri)}
                onAccept={() => {
                  const offerIndex = offer.nft_offer_index;
                  if (offerIndex) {
                    acceptNFTWithCrossmark(nft.id, offerIndex);
                  } else {
                    setErrorMessage("No available offer to accept.");
                  }
                }}
              />
            ))
          )}
        </div>
      ) : (
        <p className="text-white text-lg">No pending NFTs found.</p>
      )}
    </div>
  );
};

export default UserNFTsPendingTransfer;
