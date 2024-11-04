import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';


export async function GET(request: Request, { params }: { params: Promise<{ address: string }> }) {
  try {
    const gameAddress = (await params).address;

    if (!gameAddress) {
      return NextResponse.json({ message: 'gameAddress não fornecido.' }, { status: 400 });
    }

    const devUser = await prisma.devUser.findUnique({
      where: {
        publicAddress: gameAddress,
      },
    });

    if (!devUser) {
      return NextResponse.json({ message: 'DevUser não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ user: devUser }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar DevUser:', error);
    return NextResponse.json({ message: 'Erro ao buscar DevUser.' }, { status: 500 });
  }
}
