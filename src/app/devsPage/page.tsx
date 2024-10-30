"use client";

import React, { useEffect, useState } from "react";
import sdk from "@crossmarkio/sdk";

const DevOptions: React.FC = () => {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [activated, setActivated] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const destinationAddress = process.env.PUBLIC_ADDRESS;
  
  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const sessionRes = await fetch("/api/session");
        if (!sessionRes.ok) {
          setMessage("Você precisa estar logado para acessar essas opções.");
          setLoading(false);
          return;
        }

        const session = await sessionRes.json();
        const address = session.address;

        if (address) {
          setUserAddress(address);

          // Checa se o usuário é um desenvolvedor
          const checkRes = await fetch("/api/devUser", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              publicAddress: address,
              tipo: 0, // Tipo 0 verifica se a conta de dev existe
            }),
          });

          const result = await checkRes.json();
          if (checkRes.ok && result.user) {
            setActivated(result.user.activated);
          } else {
            setActivated(false); // Não existe conta de dev
          }
        } else {
          setMessage("Sessão inválida. Endereço de usuário não encontrado.");
        }
      } catch (error) {
        console.error("Erro ao verificar sessão ou usuário:", error);
        setMessage("Erro ao verificar sessão ou usuário.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserSession();
  }, []);

  const handleActivateDevUser = async () => {
    try {
      setLoading(true);
      setMessage("Preparando a transação para ativar sua conta...");
        // Verifica se o userAddress é válido (não null)
    if (!userAddress) {
        setMessage("Erro: Endereço público não encontrado.");
        setLoading(false);
        return;
    }
      const amount = "10000000";

      // Transação de pagamento usando o SDK Crossmark
      const paymentTransaction = {
        TransactionType: "Payment",
        Account: userAddress, // O endereço do usuário que está logado
        Amount: amount,
        Destination: destinationAddress,
      };

      // Usando o Crossmark SDK para assinar e enviar a transação
      const { response } = await sdk.async.signAndSubmitAndWait({
        TransactionType:"Payment",
        Account: userAddress,
        Amount: amount,
        Destination: destinationAddress

      });

      if (response.data.meta.isSuccess === true) {
        setMessage("Pagamento bem-sucedido. Ativando sua conta...");

        // Agora que o pagamento foi confirmado, ativa a conta
        const activateRes = await fetch("/api/devUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicAddress: userAddress,
            tipo: 1, // 1 para ativar a conta
          }),
        });

        const activateData = await activateRes.json();
        if (activateRes.ok) {
          setActivated(true);
          setMessage("Sua conta foi ativada com sucesso!");
        } else {
          setMessage(`Erro ao ativar conta: ${activateData.message}`);
        }
      } else {
        setMessage("Falha ao enviar a transação de pagamento.");
      }
    } catch (error) {
      console.error("Erro ao ativar a conta:", error);
      setMessage("Erro ao processar a solicitação.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      if (!newPassword) {
        setMessage("Por favor, insira uma nova senha.");
        return;
      }

      setLoading(true);
      const updatePasswordRes = await fetch("/api/devUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicAddress: userAddress,
          tipo: 2, // Tipo 2 para atualizar a senha
          password: newPassword,
        }),
      });

      const result = await updatePasswordRes.json();
      if (updatePasswordRes.ok) {
        setMessage("Senha atualizada com sucesso.");
      } else {
        setMessage(result.message || "Erro ao atualizar a senha.");
      }
    } catch (error) {
      console.error("Erro ao atualizar a senha:", error);
      setMessage("Erro ao atualizar a senha.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Dev Options</h1>

        {message && <p className="text-red-500 mb-4 text-center">{message}</p>}

        {!userAddress ? (
          <p className="text-center">Você precisa estar logado para acessar as Dev Options.</p>
        ) : activated === null ? (
          <p className="text-center">Verificando status do usuário...</p>
        ) : activated === false ? (
          <div className="flex flex-col items-center">
            <p className="mb-4">Sua conta ainda não está ativada para Dev Options.</p>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
              onClick={handleActivateDevUser}
            >
              Ativar Conta Dev
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="mb-4">Dev Options ativado.</p>
            <div className="w-full">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nova senha"
                className="border border-gray-300 rounded-lg w-full py-2 px-3 mb-4"
              />
              <button
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg w-full"
                onClick={handleUpdatePassword}
              >
                Alterar Senha
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevOptions;
