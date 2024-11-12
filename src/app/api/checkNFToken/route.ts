import { NextResponse } from 'next/server';
import { AccountNFToken, Client } from 'xrpl';

export async function GET(request: Request) {
  try {

    const { searchParams } = new URL(request.url);
    const nftID = searchParams.get('nftID');

    if (!nftID) {
      return NextResponse.json({ message: 'NFT ID não fornecido.' }, { status: 400 });
    }


    const client = new Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();

    const issuerAddress = process.env.PUBLIC_ADDRESS as string;

    // Solicita todos os NFTs emitidos pelo emissor
    const accountNFTsResponse = await client.request({
      command: 'account_nfts',
      account: issuerAddress
    });

    await client.disconnect();

    const nfts: AccountNFToken[] = accountNFTsResponse.result.account_nfts;

    // Procura o NFT específico pelo seu ID
    const nft = nfts.find((nft: AccountNFToken) => nft.NFTokenID === nftID);

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
