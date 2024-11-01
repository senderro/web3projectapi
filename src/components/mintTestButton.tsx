"use client";

import React, { useState } from 'react';

const MintNFTButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    recipientAddress: '',
    name: '',
    description: '',
    base64image: '',
  });

  // Função para converter arquivo em base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Handler para upload de imagem
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await convertToBase64(e.target.files[0]);
        setFormData(prev => ({ ...prev, base64image: base64 }));
      } catch (error) {
        console.error('Erro ao converter imagem:', error);
      }
    }
  };

  const handleMintNFT = async () => {
    // Validação dos campos
    if (!formData.recipientAddress || !formData.name || !formData.description || !formData.base64image) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      // Mock dos dados de autenticação - você precisa implementar isso corretamente
      const auth = {
        message: "mensagem_de_autenticacao",
        signature: "assinatura",
        publicKey: "chave_publica"
      };

      const response = await fetch('/api/mintNFT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          auth,
          gameMetadata: {} // opcional
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`NFT Mintado com sucesso! ID: ${data.nftId}`);
        // Limpar form após sucesso
        setFormData({
          recipientAddress: '',
          name: '',
          description: '',
          base64image: '',
        });
      } else {
        setMessage(`Erro ao mintar NFT: ${data.message}`);
      }
    } catch (error) {
      console.error('Erro ao mintar NFT:', error);
      setMessage('Erro ao mintar NFT.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-4">
        <input
          type="text"
          placeholder="Endereço de destino"
          value={formData.recipientAddress}
          onChange={(e) => setFormData(prev => ({ ...prev, recipientAddress: e.target.value }))}
          className="border rounded p-2 w-full"
        />
        
        <input
          type="text"
          placeholder="Nome da NFT"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="border rounded p-2 w-full"
        />
        
        <textarea
          placeholder="Descrição da NFT"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="border rounded p-2 w-full h-24"
        />
        
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full"
        />
        
        <button
          onClick={handleMintNFT}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 w-full"
          disabled={loading}
        >
          {loading ? 'Mintando...' : 'Mintar NFT'}
        </button>
        
        {message && (
          <p className="text-center text-sm mt-2">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default MintNFTButton;