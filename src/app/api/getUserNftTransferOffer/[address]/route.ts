import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { Client, NFTOffer } from 'xrpl';

interface NFTokenSellOffersResponse {
  offers?: NFTOffer[];
  nft_id: string;
  marker?: string;
}

export async function GET(request: Request, { params }: { params: Promise<{ address: string }>}) {
  const { address } = await params; // Desestruturação direta para capturar o endereço

  if (!address) {
    return NextResponse.json({ message: 'Endereço não fornecido.' }, { status: 400 });
  }

  try {
    // Consulta o banco de dados para buscar NFTs transferidos para o endereço fornecido e ainda não aceitos
    const nfts = await prisma.soldNFTsUserTransfer.findMany({
      where: {
        receiveAddress: address,
        accepted: false,
      },
    });

    if (nfts.length === 0) {
      return NextResponse.json({ message: 'Nenhum NFT pendente encontrado.' }, { status: 404 });
    }

    // Conecta ao XRPL
    const client = new Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();

    const nftsWithOffers = await Promise.all(
      nfts.map(async (nft) => {
        let offers: NFTOffer[] = [];
        let marker: string | undefined;

        // Usa paginação para buscar todas as ofertas associadas ao NFT
        do {
          const response: { result: NFTokenSellOffersResponse } = await client.request({
            command: 'nft_sell_offers',
            nft_id: nft.nftID,
            ledger_index: 'validated',
            limit: 100, // Limite máximo de resultados por requisição
            marker: marker,
          });

          if (response.result.offers) {
            // Filtra as ofertas para incluir apenas as que têm `destination` igual ao `address`
            const filteredOffers = response.result.offers.filter(
              (offer) => offer.destination === address
            );
            offers = offers.concat(filteredOffers);
          }

          marker = response.result.marker; // Atualiza o marker para a próxima iteração, se houver
        } while (marker); // Continua enquanto houver um marker para paginação

        // Retorna o objeto com o ID da tabela, URI e as ofertas filtradas
        return {
          id: nft.id,
          uri: nft.uri,
          nftID: nft.nftID,
          receiveAddress: nft.receiveAddress,
          offers,
        };
      })
    );

    await client.disconnect();

    return NextResponse.json({ nfts: nftsWithOffers }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar NFTs e ofertas:', error);
    return NextResponse.json({ message: 'Erro ao buscar NFTs e ofertas.' }, { status: 500 });
  }
}
