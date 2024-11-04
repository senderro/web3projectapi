import React from 'react';
import Image from 'next/image';

interface CartaProps {
  nome: string;
  imagem: string;
  descricao: string;
}

const Carta: React.FC<CartaProps> = ({ nome, imagem, descricao }) => {
  return (
    <div className="text-center bg-white p-5 rounded-lg w-72 shadow-md">
      <h2 className="text-lg font-semibold mb-2">{nome}</h2>
      <Image src={imagem} alt={nome} width={300} height={200} className="rounded-md mb-4 object-contain" />
      <p className="text-gray-600">{descricao}</p>
    </div>
  );
};

export default Carta;
