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

    let nfts: AccountNFToken[] = [];
    let marker: string | undefined;

    // Continuar solicitando até que todos os NFTs sejam obtidos
    do {
      const accountNFTsResponse = await client.request({
        command: 'account_nfts',
        account: address,
        limit: 400,  // Limite máximo de NFTs por requisição
        marker: marker,  // Usado para paginação, se houver mais resultados
      });

      // Adiciona os NFTs retornados à lista
      nfts = nfts.concat(accountNFTsResponse.result.account_nfts);

      // Atualiza o marker para continuar a paginação, se houver mais NFTs
      marker = accountNFTsResponse.result.marker as string;

    } while (marker); // Continua enquanto houver um marker para paginar

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
