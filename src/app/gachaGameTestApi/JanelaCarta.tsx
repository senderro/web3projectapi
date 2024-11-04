import React from 'react';
import Carta from './Carta';

interface JanelaCartaProps {
  nome: string;
  imagem: string;
  descricao: string;
  onAccept: () => void;
}

const JanelaCarta: React.FC<JanelaCartaProps> = ({ nome, imagem, descricao, onAccept }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg text-center w-80 shadow-lg">
        <Carta nome={nome} imagem={imagem} descricao={descricao} />
        <button onClick={onAccept} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
          Aceitar Carta
        </button>
      </div>
    </div>
  );
};

export default JanelaCarta;
