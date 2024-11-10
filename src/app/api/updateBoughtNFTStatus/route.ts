import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const { nftID } = await request.json();

    if (!nftID) {
      return NextResponse.json({ message: 'ID do NFT não fornecido.' }, { status: 400 });
    }

    // Atualiza o campo accepted para true na tabela SoldNFTs
    await prisma.soldNFTs.update({
      where: { nftID },
      data: { accepted: true },
    });

    return NextResponse.json({ message: 'Status do NFT atualizado com sucesso.' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar status do NFT:', error);
    return NextResponse.json({ message: 'Erro ao atualizar status do NFT.' }, { status: 500 });
  }
}
