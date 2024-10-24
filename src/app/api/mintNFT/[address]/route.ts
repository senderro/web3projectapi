import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { Client } from 'xrpl';

export async function GET(request: Request, { params }: { params: { address: string } }) {
  const address = params.address;

  if (!address) {
    return NextResponse.json({ message: 'Endereço não fornecido.' }, { status: 400 });
  }

  try {
    // Consulta o banco de dados para buscar NFTs pendentes para o endereço fornecido
    const nfts = await prisma.mintedNFTSForUsers.findMany({
      where: {
        receiveAddress: address, // Verifica se há NFTs para o endereço fornecido
        accepted: false // Buscando apenas os NFTs que ainda não foram aceitos
      },
    });

    if (!nfts.length) {
      return NextResponse.json({ message: 'Nenhum NFT pendente encontrado.' }, { status: 404 });
    }

    // Para cada NFT encontrado, buscar as ofertas de venda associadas no XRPL
    const client = new Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();

    const nftsWithOffers = await Promise.all(
      nfts.map(async (nft) => {
        const response = await client.request({
          command: 'nft_sell_offers',
          nft_id: nft.nftID,
          ledger_index: 'validated',
        });

        const offers = response.result.offers || [];
        return { ...nft, offers }; // Retorna o NFT com suas ofertas
      })
    );

    await client.disconnect();

    // Retorna os NFTs encontrados com as ofertas associadas
    return NextResponse.json({ nfts: nftsWithOffers }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar NFTs e ofertas:', error);
    return NextResponse.json({ message: 'Erro ao buscar NFTs e ofertas.' }, { status: 500 });
  }
}
