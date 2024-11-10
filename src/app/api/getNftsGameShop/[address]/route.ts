import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ address: string }> }) {
  const gameAddress = (await params).address;

  try {
    // Buscar NFTs da tabela gameShopNFTs onde o gameAddress corresponde e a quantidade é maior que 0
    const nfts = await prisma.gameShopNFTs.findMany({
      where: {
        gameAddress: gameAddress,
        quantidade: {
          gt: 0, // Somente NFTs com quantidade > 0
        },
      },
    });

    // Se não houver NFTs, retornar uma resposta adequada
    if (!nfts || nfts.length === 0) {
      return NextResponse.json({ message: 'Nenhum NFT encontrado para este endereço.' }, { status: 404 });
    }

    // Retornar os NFTs encontrados em JSON
    return NextResponse.json(nfts);
  } catch (error) {
    console.error('Erro ao buscar NFTs:', error);
    return NextResponse.json({ message: 'Erro ao buscar NFTs.' }, { status: 500 });
  }
}
