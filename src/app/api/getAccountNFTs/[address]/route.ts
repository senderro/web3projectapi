import { NextResponse } from 'next/server';
import { AccountNFToken, Client } from 'xrpl';

export async function GET(request: Request, { params }: { params: Promise<{ address: string }> }) {
  try {
    const address = (await params).address;

    if (!address) {
      return NextResponse.json({ message: 'Endereço de conta não fornecido.' }, { status: 400 });
    }

    // Conecta ao XRPL (Testnet)
    const client = new Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();

    // Solicita os NFTs associados ao endereço fornecido
    const accountNFTsResponse = await client.request({
      command: 'account_nfts',
      account: address,
    });

    const nfts = accountNFTsResponse.result.account_nfts;

    // Desconecta o cliente XRPL
    await client.disconnect();

    // Endereço público emissor da sua aplicação (definido no .env ou hardcoded)
    const issuerAddress = process.env.PUBLIC_ADDRESS as string;

    // Filtra os NFTs emitidos pelo seu endereço público
    const filteredNFTs = nfts.filter((nft: AccountNFToken) => nft.Issuer === issuerAddress);

    return NextResponse.json({
      message: `Encontrados ${filteredNFTs.length} NFTs emitidos pelo seu endereço.`,
      nfts: filteredNFTs,
      total: filteredNFTs.length,
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar NFTs da conta:', error);
    return NextResponse.json({ message: 'Erro ao buscar NFTs da conta.' }, { status: 500 });
  }
}
