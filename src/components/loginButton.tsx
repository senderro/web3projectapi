// components/LoginButton.tsx

"use client"; // Garantir que estamos no lado do cliente

import React, { useState, useEffect } from 'react';
import sdk from '@crossmarkio/sdk';

import { useRouter } from 'next/navigation'


interface LoginButtonProps {
  onLoginSuccess: (walletAddress: string) => void;
  onLogout: () => void;
}

const LoginButton: React.FC<LoginButtonProps> = ({ onLoginSuccess, onLogout }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const router = useRouter();
  // Verificar sessão ao carregar a página
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/session');
        if (res.ok) {
          const session = await res.json();
          if (session.isLoggedIn && session.address) {
            setWalletAddress(session.address);
            onLoginSuccess(session.address);
            setMessage(`Conectado como: ${session.address}`);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      }
    };

    checkSession();
  }, [onLoginSuccess]);

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

        // Passar o endereço da carteira para o componente pai
        onLoginSuccess(address);
        router.push('/')
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
      setMessage("Desconectado com sucesso.");
      onLogout();
      router.push('/')
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      setMessage("Erro ao fazer logout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
    </div>
  );
};

export default LoginButton;
