'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface CartaData {
  nome: string;
  imagem: string;
  descricao: string;
}

interface SlotProps {
  carta?: CartaData;
  onClick: () => void;
}

// Componente Slot, exibe a carta ou vazio
const Slot: React.FC<SlotProps> = ({ carta, onClick }) => {
  return (
    <div onClick={onClick} className="w-24 h-24 border-2 border-gray-300 rounded-lg bg-gray-100 flex justify-center items-center cursor-pointer">
      {carta ? (
        <Image src={carta.imagem} alt={carta.nome} width={90} height={90} className="object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-300 rounded-lg"></div>
      )}
    </div>
  );
};

// Lista de cartas disponíveis (para preencher o inventário)
const cartasDisponiveis: CartaData[] = [
  { nome: 'Carta 1', imagem: '/cartas/carta1.png', descricao: 'Descrição da Carta 1' },
  { nome: 'Carta 2', imagem: '/cartas/carta2.png', descricao: 'Descrição da Carta 2' },
  { nome: 'Carta 3', imagem: '/cartas/carta3.png', descricao: 'Descrição da Carta 3' },
  { nome: 'Carta 4', imagem: '/cartas/carta4.png', descricao: 'Descrição da Carta 4' }, //imagemTeste.gif
  { nome: 'Carta 5', imagem: '/cartas/imagemTeste.gif', descricao: 'Descrição da Carta 5' }
];

const App: React.FC = () => {
  const [cartasGanhas, setCartasGanhas] = useState<CartaData[]>([]);
  const [cartaSelecionada, setCartaSelecionada] = useState<CartaData | null>(null);
  const [cartaSorteada, setCartaSorteada] = useState<CartaData | null>(null);
  const [telaAtiva, setTelaAtiva] = useState<'roleta' | 'inventario'>('roleta');

  // Função para sortear uma carta ao girar a roleta
  const girarRoleta = () => {
    const indexAleatorio = Math.floor(Math.random() * cartasDisponiveis.length);
    const novaCarta = cartasDisponiveis[indexAleatorio];
    setCartaSorteada(novaCarta);
  };

  // Função para aceitar a carta sorteada e adicionar ao inventário
  const aceitarCarta = async () => {
    if (cartaSorteada) {
      const base64image = await convertImageToBase64(cartaSorteada.imagem);
      const mintNFTData = {
        auth: {
          message: "any message",
          signature: "any_signature",
          publicKey: "rG88FVLjvYiQaGftSa1cKuE2qNx7aK5ivo",
        },
        recipientAddress: "rG88FVLjvYiQaGftSa1cKuE2qNx7aK5ivo",
        base64image,
        name: cartaSorteada.nome,
        description: cartaSorteada.descricao,
        gameMetadata: {} as const,
      };

      const response = await fetch("/api/mintNFT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mintNFTData),
      });
      

      if (response.ok) {
        alert("Carta mintada com sucesso!");
        setCartasGanhas((prevCartas) => [...prevCartas, cartaSorteada]);
      } else {
        alert("Erro ao mintar a carta.");
      }
      setCartaSorteada(null);
    }
  };

  const convertImageToBase64 = async (imageUrl: string) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject("Erro ao converter a imagem");
      reader.readAsDataURL(blob);
    });
  };

  // Alternar entre roleta e inventário
  const mostrarInventario = () => setTelaAtiva('inventario');
  const voltarParaRoleta = () => setTelaAtiva('roleta');

  return (
    <div className="flex flex-col items-center justify-center h-screen p-5">
      {telaAtiva === 'roleta' && (
        <>
          <h1 className="text-2xl font-bold">Roleta Gacha</h1>
          <button onClick={girarRoleta} className="mt-5 px-5 py-2 text-lg bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
            Girar Roleta
          </button>
          <button onClick={mostrarInventario} className="mt-3 px-5 py-2 text-lg bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600">
            Mostrar Inventário
          </button>

          {/* Janela para aceitar a carta sorteada */}
          {cartaSorteada && (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
              <div className="bg-white p-5 rounded-lg text-center">
                <h2 className="text-xl font-bold">{cartaSorteada.nome}</h2>
                <Image src={cartaSorteada.imagem} alt={cartaSorteada.nome} width={200} height={200} className="my-4" />
                <p>{cartaSorteada.descricao}</p>
                <button onClick={aceitarCarta} className="mt-4 px-5 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
                  Aceitar Carta
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {telaAtiva === 'inventario' && (
        <>
          <h1 className="text-2xl font-bold mb-4">Inventário (5x5 Slots)</h1>
          <button onClick={voltarParaRoleta} className="mb-4 px-5 py-2 text-lg bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600">
            Voltar para Roleta
          </button>

          {/* Grid de 5x5 Slots */}
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 25 }, (_, index) => {
              const carta = cartasGanhas[index] || null;
              return <Slot key={index} carta={carta} onClick={() => setCartaSelecionada(carta)} />;
            })}
          </div>

          {/* Janela de detalhes da carta selecionada */}
          {cartaSelecionada && (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
              <div className="bg-white p-5 rounded-lg text-center">
                <h2 className="text-xl font-bold">{cartaSelecionada.nome}</h2>
                <Image src={cartaSelecionada.imagem} alt={cartaSelecionada.nome} width={200} height={200} className="my-4" />
                <p>{cartaSelecionada.descricao}</p>
                <button onClick={() => setCartaSelecionada(null)} className="mt-4 px-5 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600">
                  Fechar
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
