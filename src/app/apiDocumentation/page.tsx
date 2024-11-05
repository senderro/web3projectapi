'use client';

import { useState } from 'react';

// Definir a interface para os detalhes de cada endpoint
interface EndpointDetails {
  parameters: string;
  requestBody: string;
  responseBody: string;
}

// Definir a interface para cada endpoint
interface Endpoint {
  method: string;
  path: string;
  description: string;
  details: EndpointDetails;
}

// Dados de exemplo dos endpoints
const endpoints: Endpoint[] = [
  {
    method: 'POST',
    path: '/mintNFT',
    description: 'Mint a NFT',
    details: {
      parameters: 'Nothing',
      requestBody: `{
  "auth": {
    "message": "string",
    "signature": "string",
    "publicKey": "string"
  },
  "recipientAddress": "string",
  "base64image": "string",
  "name": "string",
  "description": "string",
  "gameMetadata": {
    "key": "value"
  }
}
`,
      responseBody: `[{
  "message": "NFT mintado e oferta de transferência criada com sucesso!",
  "nftId": "00080000AAB4C6A9D4E1A2F06F1A6B1B3F2C5D123456789ABCDEF12345678901"
}]`
    }
  },
  {
    method: 'GET',
    path: '/getAccountNFTs/{address}',
    description: 'Fetch NFTs associated with an account address',
    details: {
      parameters: 'address (obrigatório)',
      requestBody: 'Nenhum',
      responseBody: `{
  "message": "Encontrados 2 NFTs emitidos pelo seu endereço.",
  "nfts": [
    {
      "NFTokenID": "00080000AAB4C6A9D4E1A2F06F1A6B1B3F2C5D123456789ABCDEF12345678901",
      "Issuer": "rYourIssuerAddress12345",
      "URI": "72656C69717569617361646573616F646F6D61696E6F636F6E74726F6C",
      "Flags": 8,
      "TransferFee": 500,
      "NFTokenTaxon": 0
    }
  ],
  "total": 2
}`
    }
  }
];

export default function ApiDocumentation() {
  return (
    <div className="p-6">
      <div className="space-y-4">
        {endpoints.map((endpoint, index) => (
          <EndpointCard key={index} endpoint={endpoint} />
        ))}
      </div>
    </div>
  );
}

// Agora usamos a interface "Endpoint" no lugar do "any"
function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="border rounded-lg p-4 w-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            className={`px-2 py-1 text-white font-semibold rounded ${getColorByMethod(endpoint.method)}`}
            onClick={toggleOpen}
          >
            {endpoint.method}
          </button>
          <span className="font-bold">{endpoint.path}</span>
        </div>
        <button onClick={toggleOpen} className="text-sm text-blue-600">
          {isOpen ? 'Esconder' : 'Detalhes'}
        </button>
      </div>
      {isOpen && (
        <div className="mt-4 bg-gray-50 p-4 rounded">
          <p><strong>Descrição:</strong> {endpoint.description}</p>
          <p className="mt-2"><strong>Parâmetros:</strong> {endpoint.details.parameters}</p>
          <div className="mt-2">
            <strong>Request Body:</strong>
            <pre className="bg-gray-200 p-2 rounded mt-1">{endpoint.details.requestBody}</pre>
          </div>
          <div className="mt-2">
            <strong>Response Body:</strong>
            <pre className="bg-gray-200 p-2 rounded mt-1">{endpoint.details.responseBody}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

// Função corrigida para retornar a cor baseada no método HTTP
function getColorByMethod(method: string) {
  switch (method) {
    case 'GET':
      return 'bg-blue-500';
    case 'POST':
      return 'bg-green-500';
    case 'PUT':
      return 'bg-yellow-500';
    case 'DELETE':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}
