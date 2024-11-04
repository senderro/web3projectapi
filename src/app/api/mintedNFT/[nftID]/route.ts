import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma'; // Altere o caminho se necessário

export async function GET(request: Request, { params }: { params: Promise<{ nftID: string }> }) {
    const { nftID } = await params;

  if (!nftID) {
    return NextResponse.json({ message: 'NFT ID não fornecido.' }, { status: 400 });
  }

  try {
    // Consulta o banco de dados para buscar o NFT pelo ID
    const nft = await prisma.mintedNFTSForUsers.findUnique({
      where: { nftID },
    });

    if (!nft) {
      return NextResponse.json({ message: 'NFT não encontrado.' }, { status: 404 });
    }

    // Retorna os dados do NFT
    return NextResponse.json({ nft }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar NFT:', error);
    return NextResponse.json({ message: 'Erro ao buscar NFT.' }, { status: 500 });
  }
}
