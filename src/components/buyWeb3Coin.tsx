"use client";

import React, { useEffect, useState } from 'react';
import sdk from '@crossmarkio/sdk';

interface BuyWeb3CoinProps {
  address: string;
  destinationAddress?: string;
}

interface DevUserData {
  web3Coin: number;
}

const BuyWeb3Coin: React.FC<BuyWeb3CoinProps> = ({
  address,
  destinationAddress = "rspgmhbbCRjkDbjFu4P2MX1agUGDEShYbf",
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [web3CoinBalance, setWeb3CoinBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchWeb3CoinBalance = async () => {
      try {
        const res = await fetch(`/api/devUser/${address}`);
        if (res.ok) {
          const data: { user: DevUserData } = await res.json();
          setWeb3CoinBalance(data.user.web3Coin);
        } else {
          const errorData = await res.json();
          setMessage(`Error fetching web3Coin balance: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error fetching web3Coin balance:", error);
        setMessage("Error fetching web3Coin balance.");
      }
    };

    if (address) {
      fetchWeb3CoinBalance();
    }
  }, [address]);

  const handleBuyCoins = async () => {
    if (!address) {
      setMessage('Wallet address not provided.');
      return;
    }
    if (!destinationAddress) {
      setMessage('Destination address not configured. Please contact support.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const amountXRP = (amount * 0.001).toFixed(6);
      const xrpAmountInDrops = (parseFloat(amountXRP) * 1000000).toString();

      const { response } = await sdk.async.signAndSubmitAndWait({
        TransactionType: "Payment",
        Account: address,
        Amount: xrpAmountInDrops,
        Destination: destinationAddress,
      });

      if (response.data.meta.isSuccess === true) {
        setMessage("Transaction successful.");

        const res = await fetch(`/api/devUserBuyCoins/${address}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount }),
        });

        if (res.ok) {
          setMessage("Web3Coins purchased successfully!");
          const updatedData = await res.json();
          setWeb3CoinBalance(updatedData.updatedBalance);
        } else {
          const data = await res.json();
          setMessage(`Error updating balance: ${data.message}`);
        }
      } else {
        setMessage("Failed to send payment transaction.");
      }
    } catch (error) {
      console.error("Error making purchase:", error);
      setMessage("Error making purchase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="buy-web3-coin">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Buy Web3Coins</h1>
        {web3CoinBalance !== null ? (
          <p className="text-gray-700">Current Web3Coin balance: <strong>{web3CoinBalance}</strong></p>
        ) : (
          <p className="text-gray-700">Fetching Web3Coin balance...</p>
        )}
      </div>
      <div>
        <label className="block text-gray-700 font-medium">
          Buy Web3Coins for minting NFTs:
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="border border-gray-300 rounded-lg p-2 ml-2 w-full"
            min="1"
          />
        </label>
      </div>
      <button
        onClick={handleBuyCoins}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md mt-4 transition duration-300 w-full"
        disabled={loading || amount <= 0}
      >
        {loading ? "Loading..." : "Buy Web3Coin"}
      </button>
      <h2>1 XRP ~~ 1000 coins</h2>
      {message && <p className="mt-4 text-red-600">{message}</p>}
    </div>
  );
};

export default BuyWeb3Coin;
