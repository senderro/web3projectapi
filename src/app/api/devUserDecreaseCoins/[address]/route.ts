import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ address: string }> }) {
  try {
    const address = (await params).address;
    const { amount } = await request.json();

    if (!address) {
      return NextResponse.json({ message: 'Endereço do usuário não fornecido.' }, { status: 400 });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ message: 'Valor de web3Coins inválido para decremento.' }, { status: 400 });
    }

    // Busca o usuário para garantir que ele existe e tem saldo suficiente
    const user = await prisma.devUser.findUnique({
      where: { publicAddress: address },
    });

    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    }

    if (user.web3Coin < amount) {
      return NextResponse.json({ message: 'Saldo insuficiente de web3Coins.' }, { status: 400 });
    }

    // Atualiza o saldo de web3Coins do DevUser no banco de dados
    const updatedUser = await prisma.devUser.update({
      where: { publicAddress: address },
      data: {
        web3Coin: {
          decrement: amount, // Subtrai a quantidade especificada de web3Coins
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Saldo de web3Coins atualizado com sucesso.',
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao decrementar web3Coins do usuário:', error);
    return NextResponse.json({ message: 'Erro ao atualizar web3Coins do usuário.' }, { status: 500 });
  }
}
