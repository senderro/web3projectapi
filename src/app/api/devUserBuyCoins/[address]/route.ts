import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';


export async function PATCH(request: Request, { params }: { params: Promise<{ address: string }> }) {
  try {
    const address = (await params).address;
    const { amount } = await request.json();

    if (!address) {
      return NextResponse.json({ message: 'ID do usuário não fornecido.' }, { status: 400 });
    }

    if (typeof amount !== 'number') {
      return NextResponse.json({ message: 'Valor de web3Coins inválido.' }, { status: 400 });
    }

    // Atualiza o saldo de web3Coins do DevUser no banco de dados
    const user = await prisma.devUser.update({
      where: { publicAddress: address },
      data: {
        web3Coin: {
          increment: amount, // Use decrement: amount se quiser diminuir
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Saldo de web3Coins atualizado com sucesso.',
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao atualizar web3Coins do usuário:', error);
    return NextResponse.json({ message: 'Erro ao atualizar web3Coins do usuário.' }, { status: 500 });
  }
}
