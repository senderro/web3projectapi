import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    // Extrai os dados da solicitação
    const { id } =  await request.json();

    // Verifica se o id foi fornecido
    if (!id) {
      return NextResponse.json({ message: 'ID do registro não fornecido.' }, { status: 400 });
    }

    // Atualiza o status do NFT no banco de dados
    const updatedNFT = await prisma.soldNFTsUserTransfer.update({
      where: {
        id: id,
      },
      data: {
        accepted: true,
      },
    });

    if (!updatedNFT) {
      return NextResponse.json({ message: 'Registro não encontrado ou não foi possível atualizar.' }, { status: 404 });
    }

    // Retorna a resposta de sucesso
    return NextResponse.json({ message: 'Status do NFT atualizado com sucesso', data: updatedNFT }, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar o status do NFT:', error);
    return NextResponse.json({ message: 'Erro ao processar a solicitação.', error: error instanceof Error ? error.message : 'Erro desconhecido' }, { status: 500 });
  }
}
