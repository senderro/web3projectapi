import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    // Extrai os dados da solicitação
    const { nftID, receiveAddress, uri } = await request.json();

    // Verifica se todos os campos obrigatórios foram fornecidos
    if (!nftID || !receiveAddress) {
      return NextResponse.json({ message: 'Dados insuficientes fornecidos.' }, { status: 400 });
    }

    // Salva os detalhes da transferência no banco de dados
    const savedTransfer = await prisma.soldNFTsUserTransfer.create({
      data: {
        nftID,
        receiveAddress,
        uri
      },
    });

    // Retorna a resposta de sucesso
    return NextResponse.json({ message: 'Transferência registrada com sucesso', data: savedTransfer }, { status: 200 });
  } catch (error) {
    console.error('Erro ao registrar transferência:', error);
    return NextResponse.json({ message: 'Erro ao processar a solicitação.', error: error instanceof Error ? error.message : 'Erro desconhecido' }, { status: 500 });
  }
}
