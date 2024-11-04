// components/BuyWeb3Coin.tsx

"use client"; // Garantir que estamos no lado do cliente

import React, { useState } from 'react';
import sdk from '@crossmarkio/sdk';

interface BuyWeb3CoinProps {
  address: string;
  destinationAddress: string;
}

const BuyWeb3Coin: React.FC<BuyWeb3CoinProps> = ({ address, destinationAddress="rspgmhbbCRjkDbjFu4P2MX1agUGDEShYbf" }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState<number>(0); // Quantidade de web3Coins a comprar


  const handleBuyCoins = async () => {
    if (!address) {
      setMessage('Endereço da carteira não fornecido.');
      return;
    }
    if (!destinationAddress) {
        setMessage('Endereço de destino não configurado. Contate o suporte.');
        return;
      }

      
    setLoading(true);
    setMessage('');
    
    try {
      // Valor em XRP necessário para comprar a quantidade desejada de web3Coins
      const amountXRP = (amount * 0.001).toFixed(6); // 1 web3Coin = 0,001 XRP
      const xrpAmountInDrops = (parseFloat(amountXRP) * 1000000).toString();

      // Usando o Crossmark SDK para assinar e enviar a transação
      const { response } = await sdk.async.signAndSubmitAndWait({
        TransactionType: "Payment",
        Account: address,
        Amount: xrpAmountInDrops,
        Destination: destinationAddress,
      });

      if (response.data.meta.isSuccess === true) {
        setMessage("Compra bem-sucedida. Atualizando saldo...");

        // Atualiza o saldo de web3Coins do usuário no backend
        const res = await fetch(`/api/devUserBuyCoins/${address}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount }),
        });

        if (res.ok) {
          setMessage("Moedas compradas com sucesso!");
        } else {
          const data = await res.json();
          setMessage(`Erro ao atualizar saldo: ${data.message}`);
        }
      } else {
        setMessage("Falha ao enviar a transação de pagamento.");
      }
    } catch (error) {
      console.error("Erro ao realizar a compra:", error);
      setMessage("Erro ao realizar a compra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="buy-web3-coin">
      <div>
        <label>
          Quantidade de web3Coins:
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="border border-gray-300 rounded-lg p-2 ml-2"
            min="1"
          />
        </label>
      </div>
      <button
        onClick={handleBuyCoins}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md mt-4 transition duration-300"
        disabled={loading || amount <= 0}
      >
        {loading ? "Comprando..." : "Comprar Moedas"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default BuyWeb3Coin;
