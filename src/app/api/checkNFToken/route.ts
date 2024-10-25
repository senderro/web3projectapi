import { NextResponse } from 'next/server';
import { Client } from 'xrpl';

export async function GET(request: Request) {
  try {
    // Extrai o ID da NFT dos parâmetros da solicitação (ou da query string)
    const { searchParams } = new URL(request.url);
    const nftID = searchParams.get('nftID');

    if (!nftID) {
      return NextResponse.json({ message: 'NFT ID não fornecido.' }, { status: 400 });
    }

    // Conecta ao XRPL (usando a Testnet)
    const client = new Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();

    // Primeiro, precisamos saber a conta que possui a NFT, então você precisa
    // fornecer o endereço do emissor. Aqui, usamos o seu endereço público.
    const issuerAddress = process.env.PUBLIC_ADDRESS as string; // Seu endereço público

    // Solicita todos os NFTs emitidos pelo emissor
    const accountNFTsResponse = await client.request({
      command: 'account_nfts',
      account: issuerAddress
    });

    await client.disconnect();

    const nfts = accountNFTsResponse.result.account_nfts;

    // Procura o NFT específico pelo seu ID
    const nft = nfts.find((nft: any) => nft.NFTokenID === nftID);

    if (!nft) {
      return NextResponse.json({ message: 'NFT não encontrado.' }, { status: 404 });
    }

    // Verifica se o issuer da NFT é o seu endereço
    const isFromIssuer = nft.Issuer === issuerAddress;

    if (isFromIssuer) {
      return NextResponse.json({
        message: 'A NFT foi emitida pelo endereço esperado.',
        nft
      });
    } else {
      return NextResponse.json({
        message: 'A NFT não foi emitida pelo endereço esperado.',
        nft
      }, { status: 403 });
    }
  } catch (error) {
    console.error('Erro ao verificar emissor da NFT:', error);
    return NextResponse.json({ message: 'Erro ao buscar informações da NFT.' }, { status: 500 });
  }
}
